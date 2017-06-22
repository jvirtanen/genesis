'use strict';

const Order = require('./Order');

class PriceLevel {

  constructor(side, price) {
    this.side = side;
    this.price = price;
    this.orders = [];
  }

  add(orderNumber, size) {
    const order = new Order(this, orderNumber, size);

    this.orders.push(order);

    return order;
  }

  delete(orderNumber) {
    this.orders = this.orders.filter((order) => order.number !== orderNumber);
  }

}

module.exports = PriceLevel;
