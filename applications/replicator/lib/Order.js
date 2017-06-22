'use strict';

class Order {

  constructor(level, number, size) {
    this.level = level;
    this.number = number;
    this.remainingQuantity = size;
    this.id = undefined;
  }

}

module.exports = Order;
