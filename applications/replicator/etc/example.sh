# The GDAX product to replicate.
if [ -z $GDAX_PRODUCT_ID ]; then
  export GDAX_PRODUCT_ID="BTC-USD"
fi

# The Parity Trading System instrument to replicate the GDAX product as.
export PARITY_INSTRUMENT="$GDAX_PRODUCT_ID"

# The scaling factor for prices on Parity Trading System.
if [ -z $PARITY_PRICE_FACTOR ]; then
  export PARITY_PRICE_FACTOR="100"
fi

# The scaling factor for sizes on Parity Trading System.
if [ -z $PARITY_SIZE_FACTOR ]; then
  export PARITY_SIZE_FACTOR="100000000"
fi

# The IP address and TCP port of the market data gateway.
export PARITY_MARKET_DATA_ADDRESS="127.0.0.1"
export PARITY_MARKET_DATA_PORT="5000"

# The username and password of the market data gateway.
export PARITY_MARKET_DATA_USERNAME=""
export PARITY_MARKET_DATA_PASSWORD=""

# The IP address and TCP port for order entry at Parity Trading System.
export PARITY_ORDER_ENTRY_ADDRESS="127.0.0.1"
export PARITY_ORDER_ENTRY_PORT="4000"

# The username and password for order entry at Parity Trading System.
export PARITY_ORDER_ENTRY_USERNAME="`echo $GDAX_PRODUCT_ID | tr -d -`"
export PARITY_ORDER_ENTRY_PASSWORD="$PARITY_ORDER_ENTRY_USERNAME"
