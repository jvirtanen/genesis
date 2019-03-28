'use strict';

const OrderMapper = require('./OrderMapper');

const MAX_PRICE = 100000000000000;

const MAX_QUANTITY = 100000000000000;

class MessageTranslator {

  constructor(book, instrument, priceFactor, sizeFactor) {
    this._book = book;
    this._instrument = instrument;
    this._mapper = new OrderMapper();
    this._priceFactor = priceFactor;
    this._sizeFactor = sizeFactor;
  }

  translate(coinbaseMessage) {
    switch (coinbaseMessage.type) {
    case 'open':
      return translateOpen(this, coinbaseMessage);
    case 'change':
      return translateChange(this, coinbaseMessage);
    case 'match':
      return translateMatch(this, coinbaseMessage);
    case 'done':
      return translateDone(this, coinbaseMessage);
    default:
      return null;
    }
  }

}

function translateOpen(self, coinbaseMessage) {
  const price = translatePrice(self, coinbaseMessage.price);
  if (price > MAX_PRICE)
    return null;

  const quantity = translateQuantity(self, coinbaseMessage.remaining_size);

  return {
    messageType: 'E',
    orderId: self._mapper.associate(coinbaseMessage.order_id),
    side: translateSide(coinbaseMessage.side),
    instrument: self._instrument,
    quantity: Math.min(quantity, MAX_QUANTITY),
    price: price,
  };
}

function translateChange(self, coinbaseMessage) {
  if (!coinbaseMessage.new_size)
    return null;

  const orderId = self._mapper.translate(coinbaseMessage.order_id);
  if (!orderId)
    return null;

  return {
    messageType: 'X',
    orderId: orderId,
    quantity: translateQuantity(self, coinbaseMessage.new_size),
  };
}

function translateMatch(self, coinbaseMessage) {
  const side = translateSide(coinbaseMessage.side);
  const orderId = self._mapper.translate(coinbaseMessage.maker_order_id);
  const size = translateQuantity(self, coinbaseMessage.size);

  const quantity = self._book.execute(side, orderId, size);
  if (quantity === 0)
    return null;

  return {
    messageType: 'E',
    orderId: self._mapper.generate(),
    side: contra(side),
    instrument: self._instrument,
    quantity: quantity,
    price: translatePrice(self, coinbaseMessage.price),
  };
}

function translateDone(self, coinbaseMessage) {
  const orderId = self._mapper.translate(coinbaseMessage.order_id);
  if (!orderId)
    return null;

  return {
    messageType: 'X',
    orderId: orderId,
    quantity: 0,
  };
}

function translateSide(coinbaseSide) {
  return coinbaseSide === 'buy' ? 'B' : 'S';
}

function translateQuantity(self, coinbaseQuantity) {
  return Math.round(self._sizeFactor * Number(coinbaseQuantity));
}

function translatePrice(self, coinbasePrice) {
  return Math.round(self._priceFactor * Number(coinbasePrice));
}

function contra(paritySide) {
  return paritySide === 'B' ? 'S' : 'B';
}

module.exports = MessageTranslator;
