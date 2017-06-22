'use strict';

const WebSocket = require('ws');
const request = require('request');

exports.connect = (options, callback) => {
  const ws = new WebSocket(options.websocketFeedUrl);

  const buffer = [];

  let buffering = true;

  let sequence = 0;

  ws.on('open', () => {
    ws.send(JSON.stringify({
      type: 'subscribe',
      product_ids: [
        options.productId,
      ],
    }));

    request({
      url: `${options.apiUrl}/products/${options.productId}/book?level=3`,
      headers: {
        'User-Agent': 'request'
      },
    }, (error, response, body) => {
      const book = JSON.parse(body);

      book.bids.forEach((bid) => callback(open(bid, 'buy')));
      book.asks.forEach((ask) => callback(open(ask, 'sell')));

      sequence = book.sequence + 1;

      buffering = false;

      buffer.forEach((message) => {
        if (message.sequence < sequence)
          return;

        if (message.sequence > sequence)
          console.log('Sequence number gap', message.sequence, sequence);

        callback(message);

        sequence = message.sequence + 1;
      });
    });
  });

  ws.on('message', (payload) => {
    const message = JSON.parse(payload);

    if (buffering) {
      buffer.push(message);
      return;
    }

    if (message.sequence < sequence)
      return;

    if (message.sequence > sequence)
      console.log('Sequence number gap', message.sequence, sequence);

    callback(message);

    sequence = message.sequence + 1;
  });
};

function open(order, side) {
  return {
    type: 'open',
    order_id: order[2],
    price: order[0],
    remaining_size: order[1],
    side: side,
  };
}
