'use strict';

class OrderMapper {

  constructor() {
    this._parityIds = new Map();
    this._nextParityId = 1;
  }

  generate() {
    return orderId(this._nextParityId++);
  }

  associate(coinbaseId) {
    const parityId = this.generate();

    this._parityIds.set(coinbaseId, parityId);

    return parityId;
  }

  translate(coinbaseId) {
    return this._parityIds.get(coinbaseId);
  }

}

const FILL = ' '.repeat(16);

function orderId(value) {
  return (value + FILL).slice(0, 16);
}

module.exports = OrderMapper;
