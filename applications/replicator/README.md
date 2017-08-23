# Genesis Replicator

Genesis Replicator replicates a [GDAX][] order book as a [Parity][] order
book.

  [GDAX]: https://www.gdax.com
  [Parity]: https://github.com/paritytrading/parity

Genesis Replicator subscribes to a product on [GDAX WebSocket Feed][] and
connects to the market data and order entry interfaces of a Parity instance.
Then it starts translating market data messages from GDAX to order entry
messages on Parity.

  [GDAX WebSocket Feed]: https://docs.gdax.com/#websocket-feed

Genesis Replicator listens to Parity market data and maintains a reconstructed
Parity order book. When a market data message indicating a trade is received
from GDAX, it consults its reconstruction and adjusts the quantity of the
translation to account not only for the replicated order but all non-replicated
orders with better price or time priority as well.

Genesis Replicator requires Node 6 or newer.

## Configuration

Genesis Replicator is configured using environment variables. The following
environment variables are mandatory:

- `PARITY_MARKET_DATA_ADDRESS`: The IP address of the market data gateway.

- `PARITY_MARKET_DATA_PORT`: The TCP port of the market data gateway.

- `PARITY_MARKET_DATA_USERNAME`: The username on the market data gateway.

- `PARITY_MARKET_DATA_PASSWORD`: The password on the market data gateway.

- `PARITY_ORDER_ENTRY_ADDRESS`: The IP address of the Parity instance.

- `PARITY_ORDER_ENTRY_PORT`: The TCP port of the order entry interface on the
  Parity instance.

- `PARITY_ORDER_ENTRY_USERNAME`: The username on the Parity instance.

- `PARITY_ORDER_ENTRY_PASSWORD`: The password on the Parity instance.

The following environment variables are optional:

- `GDAX_API_URL`: The GDAX REST API URL. Defaults to `https://api.gdax.com`.

- `GDAX_WEBSOCKET_FEED_URL`: The GDAX WebSocket Feed URL. Defaults to
  `wss://ws-feed.gdax.com`.

- `GDAX_PRODUCT_ID`: The product identifier on GDAX. Defaults to `BTC-USD`.

- `PARITY_INSTRUMENT`: The instrument on Parity. Defaults to `$GDAX_PRODUCT_ID`.

- `PARITY_PRICE_FACTOR`: The scaling factor for prices on Parity. Defaults to
  `100`.

- `PARITY_SIZE_FACTOR`: The scaling factor for sizes on Parity. Defaults to
  `100000000`.

## Development

Install the dependencies:

```
npm install
```

Launch [Nassau][] and Parity applications with the configuration files in `etc`.

  [Nassau]: https://github.com/paritytrading/nassau

Run the application:

```
(. etc/example.sh; ./bin/genesis-replicator)
```

## License

Released under the Apache License, Version 2.0.
