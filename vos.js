var stringify = require("querystring").stringify,
    hmac = require("crypto").createHmac,
    request = require("request"),
    publicMethods = ['ticker', 'orderbook'],
    tradeMethods = ['place', 'cancel'];

function VosClient(key, secret) {

  function api_query(method, callback, args)
  {
    var args_tmp = {};

    for(i in args)
      if(args[i])
        args_tmp[i] = args[i];

    args = args_tmp;

    var options = {
      uri: 'https://api.vaultofsatoshi.com',
      agent: false,
      method: 'POST',
      headers: {
        "User-Agent": "Mozilla/4.0 (compatible; VaultOfSatoshi API node client)",
        "Content-type": "application/x-www-form-urlencoded"
      }
    };

    options.uri = options.uri + method;

    if (!key || !secret) {
      throw new Error("Must provide key and secret to make this API request.");
    }
    else
    {
      args.nonce = new Date().getTime() * 1000;
      var message = method + String.fromCharCode(0) + stringify(args);
      console.log(message);
      var signed_message = new hmac("sha512", secret);
      signed_message.update(message);
      options.headers["Api-Key"] = key;
      options.headers["Api-Sign"] = signed_message.digest('base64');
      options.body = message;
    }
    
    console.log(options);
    request(options, function(err, res, body) {
      console.log(res);
      var response = JSON.parse(body);
      if(response.status === 'success' && typeof callback == typeof Function)
        callback(response.data);
      else if(response.error)
        throw new Error(response.error);
    });
  }

  //PUBLIC
  this.ticker = function(order_currency, payment_currency, callback) {
    api_query('/public/ticker', callback, { order_currency: order_currency, payment_currency: payment_currency });
  }

  this.orderbook = function(order_currency, payment_currency, group_orders, round, count, callback) {
    api_query('/public/orderbook', callback, { order_currency: order_currency, payment_currency: payment_currency, group_orders: group_orders, round: round, count: count });
  }

  //INFO
  this.currency = function(currency, callback) {
    api_query('/info/currency', callback, { currency: currency });
  }
  
  this.account = function(callback) {
    api_query('/info/account', callback);
  }

  this.balance = function(currency, callback) {
    if(currency!=null)
      api_query('/info/balance', callback, { currency: currency });
    else
      api_query('/info/balance', callback);
  }

  this.wallet_address = function(currency, callback) {
      api_query('/info/wallet_address', callback, { currency: currency });
  }

  this.wallet_history = function(currency, count, after, callback) {
      api_query('/info/wallet_history', callback, { currency: currency, count: count, after: after });
  }

  this.quote = function(type, order_currency, units, payment_currency, price, callback) {
      api_query('/info/quote', callback, { type: type, order_currency: order_currency, units: units, payment_currency: payment_currency, price: price });
  }

  this.orders = function(count, after, open_only, callback) {
      api_query('/info/orders', callback, { count: count, after: after, open_only: open_only });
  }

  this.order_detail = function(order_id, callback) {
      api_query('/info/orders', callback, { order_id: order_id });
  }

  //TRADES
  this.place = function(type, order_currency, units, payment_currency, price, callback) {
      api_query('/trade/place', callback, { type: type, order_currency: order_currency, units: units, payment_currency: payment_currency, price: price });
  }

  this.cancel = function(order_id, callback) {
      api_query('/trade/place', callback, { order_id: order_id });
  }
}

module.exports = VosClient;

var client = new VosClient('44abce3ee316fd339d470c186c8d4da3692430e274cb4f705bcf421c7ce74350', '868a20662ec5f90ed05915f1100eeb8c9f0e309cd6674eae0896047e832e9aa5');

// Get the market ID for the NBL<-->BTC market
client.account(function(result) {
    // Display user's trades in that market
    console.log(result);
});
