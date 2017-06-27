# Genesis

Genesis replicates [GDAX][] in a local environment.

  [GDAX]: https://www.gdax.com

Genesis listens to GDAX market data and replicates market events in real time
on a local [Parity][] instance. The GDAX order books BTC-USD, BTC-EUR, BTC-GBP,
ETH-USD, ETH-EUR, LTC-USD, and LTC-EUR are replicated as Genesis order books.

  [Parity]: https://github.com/paritytrading/parity

Genesis requires [Vagrant][] and [VirtualBox][].

  [Vagrant]: https://www.vagrantup.com
  [VirtualBox]: https://www.virtualbox.org

## Limitations

Genesis has the following limitations:

- The GDAX order books ETH-BTC and LTC-BTC are not replicated as Genesis order
  books because Parity supports only two decimal places in prices at the moment.

- A scaling factor of 1000 is applied to all quantities as Parity supports
  only integer quantities at the moment.

## Usage

Launch Genesis:

```
vagrant up
```

After Genesis has launched, you can display market data and enter orders using
bundled Parity applications. These require Java.

To display market data, download Parity Stock Ticker:

```
curl -Os "http://192.168.10.10/parity-ticker.{conf,jar}"
```

Run the application to see the best bids and offers (BBOs) and latest trades
on Genesis:

```
java -jar parity-ticker.jar parity-ticker.conf
```

To enter orders, download Parity Terminal Client:

```
curl -Os "http://192.168.10.10/parity-client.{conf,jar}"
```

Run the application:

```
java -jar parity-client.jar parity-client.conf
```

Once started, the application displays a command prompt:

```
Type 'help' for help.
>
```

You can interact with the application by entering commands into the command
prompt. For example, to enter a buy order of 1 BTC for $5,000.00 on Genesis,
use the `buy` command:

```
> buy 1000 BTC-USD 5000.00
```

Depending on the current USD price of BTC on GDAX, the order might immediately
execute partially or fully. Use the `trades` command to list occurred trades:

```
> trades
```

If the order did not execute fully, it remains open on the Genesis order book.
Use the `orders` command to list open orders:

```
> orders
```

## Connectivity

Genesis accepts inbound TCP connections at the following ports.

Role        | Protocol | Transport  | Port
------------|----------|------------|-----
Order entry | [POE][]  | SoupBinTCP | 4000
Order entry | [FIX][]  | TCP        | 4010
Market data | [PMD][]  | SoupBinTCP | 5000

Genesis publishes outbound UDP datagrams to the following multicast groups.

Role             | Protocol | Transport | Multicast Group | Multicast Port | Request Port
-----------------|----------|-----------|-----------------|----------------|-------------
Market data      | [PMD][]  | MoldUDP64 | 224.0.0.1       | 5000           | 5001
Market reporting | [PMR][]  | MoldUDP64 | 224.0.0.1       | 6000           | 6001

  [POE]: https://github.com/paritytrading/parity/blob/master/libraries/net/doc/POE.md
  [FIX]: https://github.com/paritytrading/parity/blob/master/applications/fix/doc/FIX.md
  [PMD]: https://github.com/paritytrading/parity/blob/master/libraries/net/doc/PMD.md
  [PMR]: https://github.com/paritytrading/parity/blob/master/libraries/net/doc/PMR.md

## Architecture

Genesis is a Ubuntu 16.04 server that runs the following services:

- `parity-system.service`: a Parity Trading System process accepting inbound
  order entry connections and publishing market data and market reports using
  the native protocols.

- `parity-fix.service`: a Parity FIX Gateway process accepting inbound order
  entry connections using the FIX protocol.

- `nassau-market-data-gateway.service`: a Nassau SoupBinTCP Gateway process
  accepting inbound market data connections using SoupBinTCP as the underlying
  transport protocol.

- `genesis-replicator-btc-usd.service`: a [Genesis Replicator][] process
  replicating the GDAX order book BTC-USD as the Genesis order book BTC-USD.
  One service of this type exists for each replicated order book.

  [Genesis Replicator]: applications/replicator

- `nginx.service`: a Web server hosting the bundled Parity applications.

## License

Copyright 2017 Jussi Virtanen.

Released under the Apache License, Version 2.0. See `LICENSE.txt` for details.
