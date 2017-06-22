'use strict';

const OrderMapper = require('./OrderMapper');

const MAX_PRICE = 1000000000;

const MAX_QUANTITY = 1000000000;

class MessageTranslator {

  constructor(book, instrument) {
    this._book = book;
    this._instrument = instrument;
    this._mapper = new OrderMapper();
  }

  translate(gdaxMessage) {
    switch (gdaxMessage.type) {
    case 'open':
      return translateOpen(this, gdaxMessage);
    case 'change':
      return translateChange(this, gdaxMessage);
    case 'match':
      return translateMatch(this, gdaxMessage);
    case 'done':
      return translateDone(this, gdaxMessage);
    default:
      return null;
    }
  }

}

function translateOpen(self, gdaxMessage) {
  const price = translatePrice(gdaxMessage.price);
  if (price > MAX_PRICE)
    return null;

  const quantity = translateQuantity(gdaxMessage.remaining_size);

  return {
    messageType: 'E',
    orderId: self._mapper.associate(gdaxMessage.order_id),
    side: translateSide(gdaxMessage.side),
    instrument: self._instrument,
    quantity: Math.min(quantity, MAX_QUANTITY),
    price: price,
  };
}

function translateChange(self, gdaxMessage) {
  if (!gdaxMessage.new_size)
    return null;

  const orderId = self._mapper.translate(gdaxMessage.order_id);
  if (!orderId)
    return null;

  return {
    messageType: 'X',
    orderId: orderId,
    quantity: translateQuantity(gdaxMessage.new_size),
  };
}

function translateMatch(self, gdaxMessage) {
  const side = translateSide(gdaxMessage.side);
  const orderId = self._mapper.translate(gdaxMessage.maker_order_id);
  const size = translateQuantity(gdaxMessage.size);

  const quantity = self._book.execute(side, orderId, size);
  if (quantity === 0)
    return null;

  return {
    messageType: 'E',
    orderId: self._mapper.generate(),
    side: contra(side),
    instrument: self._instrument,
    quantity: quantity,
    price: translatePrice(gdaxMessage.price),
  };
}

function translateDone(self, gdaxMessage) {
  const orderId = self._mapper.translate(gdaxMessage.order_id);
  if (!orderId)
    return null;

  return {
    messageType: 'X',
    orderId: orderId,
    quantity: 0,
  };
}

function translateSide(gdaxSide) {
  return gdaxSide === 'buy' ? 'B' : 'S';
}

function translateQuantity(gdaxQuantity) {
  return Math.round(1000 * Number(gdaxQuantity));
}

function translatePrice(gdaxPrice) {
  return 100 * Math.round(100 * Number(gdaxPrice));
}

function contra(paritySide) {
  return paritySide === 'B' ? 'S' : 'B';
}

module.exports = MessageTranslator;
