'use strict';

const PriceLevel = require('./PriceLevel');
const SortedMap = require('collections/sorted-map');

class OrderBook {

  constructor() {
    this._bids = new SortedMap([], null, (a, b) => b - a);
    this._asks = new SortedMap([], null, (a, b) => a - b);
    this._orderNumbers = new Map();
    this._orderIds = new Map();
    this._pastOrderIds = new Set();
  }

  add(orderNumber, side, price, size) {
    if (this._orderNumbers.has(orderNumber))
      return;

    const levels = side === 'B' ? this._bids : this._asks;

    let level = levels.get(price);
    if (!level) {
      level = new PriceLevel(side, price);

      levels.set(price, level);
    }

    const order = level.add(orderNumber, size);

    this._orderNumbers.set(orderNumber, order);
  }

  associate(orderNumber, orderId) {
    const order = this._orderNumbers.get(orderNumber);
    if (!order)
      return false;

    order.id = orderId;

    this._orderIds.set(orderId, order);

    return true;
  }

  reduce(orderNumber, quantity) {
    const order = this._orderNumbers.get(orderNumber);
    if (!order)
      return;

    if (quantity < order.remainingQuantity)
      order.remainingQuantity -= quantity;
    else
      remove(this, order);
  }

  execute(side, orderId, executedQuantity) {
    const order = this._orderIds.get(orderId);
    if (!order)
      return this._pastOrderIds.has(orderId) ? 0 : executedQuantity;

    const price = order.level.price;

    let quantity = Math.min(executedQuantity, order.remainingQuantity);

    const levels = side === 'B' ? this._bids : this._asks;

    const iterator = levels.iterator();

    while (true) {
      const {done, value} = iterator.next();
      if (done)
        break;

      const level = value.value;

      if (side === 'B' && level.price < price)
        break;

      if (side === 'S' && level.price > price)
        break;

      for (let i = 0; i < level.orders.length; i++) {
        const candidate = level.orders[i];

        if (candidate === order)
          break;

        if (!candidate.id) {
          quantity += candidate.remainingQuantity;

          candidate.remainingQuantity = 0;
        }
      }
    }

    return quantity;
  }

}

function remove(self, order) {
  const level = order.level;

  level.delete(order.number);

  if (level.orders.length === 0) {
    const levels = level.side === 'B' ? self._bids : self._asks;

    levels.delete(level.price);
  }

  self._orderNumbers.delete(order.number);

  if (order.id) {
    self._orderIds.delete(order.id);

    self._pastOrderIds.add(order.id);
  }
}

module.exports = OrderBook;
