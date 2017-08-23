'use strict';

const OrderBook = require('../lib/OrderBook');
const assert = require('assert');

describe('OrderBook', function () {
  it('handles known order identifier', function () {
    const book = new OrderBook();

    book.add(1, 'B', 1000, 100);
    book.associate(1, 'a');

    assert.equal(book.execute('B', 'a', 100), 100);
  });

  it('handles unknown order identifier', function () {
    const book = new OrderBook();

    assert.equal(book.execute('B', 'a', 100), 100);
  });

  it('handles known past order identifier', function () {
    const book = new OrderBook();

    book.add(1, 'B', 1000, 100);
    book.associate(1, 'a');
    book.reduce(1, 100);

    assert.equal(book.execute('B', 'a', 100), 0);
  });

  it('handles executed quantity less than remaining quantity', function () {
    const book = new OrderBook();

    book.add(1, 'B', 1000, 100);
    book.associate(1, 'a');

    assert.equal(book.execute('B', 'a', 50), 50);
  });

  it('handles executed quantity greater than remaining quantity', function () {
    const book = new OrderBook();

    book.add(1, 'B', 1000, 100);
    book.associate(1, 'a');

    assert.equal(book.execute('B', 'a', 150), 100);
  });

  it('handles partial reduction', function () {
    const book = new OrderBook();

    book.add(1, 'B', 1000, 100);
    book.associate(1, 'a');
    book.reduce(1, 50);

    assert.equal(book.execute('B', 'a', 100), 50);
  });

  it('handles full reduction', function () {
    const book = new OrderBook();

    book.add(1, 'B', 1000, 100);
    book.associate(1, 'a');
    book.reduce(1, 100);

    assert.equal(book.execute('B', 'a', 100), 0);
  });

  it('maintains time priority', function () {
    const book = new OrderBook();

    book.add(1, 'B', 1000, 100);
    book.add(2, 'B', 1000,  50);
    book.add(3, 'B', 1000,  75);
    book.associate(2, 'b');

    assert.equal(book.execute('B', 'b', 50), 150);
  });

  it('maintains price priority', function () {
    const book = new OrderBook();

    book.add(1, 'B', 1000, 100);
    book.associate(1, 'a');
    book.add(2, 'B', 1001,  50);
    book.add(3, 'B',  999,  75);

    assert.equal(book.execute('B', 'a', 100), 150);
  });

  it('adjusts once for non-replicated order', function () {
    const book = new OrderBook();

    book.add(1, 'B', 1000, 100);
    book.associate(1, 'a');
    book.add(2, 'B', 1001,  50);

    book.execute('B', 'a', 50);

    assert.equal(book.execute('B', 'a', 50), 50);
  });

  it('skips adjustment for replicated order', function () {
    const book = new OrderBook();

    book.add(1, 'B', 1000, 100);
    book.associate(1, 'a');
    book.add(2, 'B', 1001,  50);
    book.associate(2, 'b');
    book.add(3, 'B', 1001,  75);

    assert.equal(book.execute('B', 'a', 50), 125);
  });

});
