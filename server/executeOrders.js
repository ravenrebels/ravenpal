const paypal = require("./paypal");
const axios = require("axios");
const products = require("../products.json");
const throttle = require("lodash.throttle");

const getRPC = require("./getRPC");
const config = require("./ravenConfig.json");
const rpc = getRPC(config);

const getQuantityToSend = require("./getQuantityToSend");

/*
 Execute order, is the last step.
 The customer has accepted the payment over at Paypal.
 We are ready to so, "hit it".

*/
function executeOrders(firebase) {
  const db = firebase.database();
  const ref = db.ref("/orders");

  const valueListener = (snapshot) => {
    const data = snapshot.val();

    if (data === null) {
      return;
    }
    const userIds = Object.keys(data);
    for (const userId of userIds) {
      const orders = data[userId];
      const orderKeys = Object.keys(orders);

      for (const orderKey of orderKeys) {
        const order = orders[orderKey];

        if (shouldExecuteOrder(order) === true) {
          const firebaseRef = db.ref("/orders/" + userId + "/" + orderKey);
          executeOrder(firebaseRef, paypal, order);
        }
      }
    }
  };

  const throttledEventListener = throttle(valueListener, 3000);
  ref.on("value", throttledEventListener);
}

function executeOrder(firebaseRef, paypal, order) {
  const payerId = order.metadata.PayerID;
  const paymentId = order.metadata.paymentId;
  const product = products[0];

  const execute_payment_json = {
    payer_id: payerId,
    /*  transactions: [
      {
        amount: {
          currency: product.currency,
          total: product.price,
        },
      },
    ],*/
  };

  const callback = async function (error, payment) {
    if (error) {
      console.log("Error processing payment id", paymentId, error);
      firebaseRef.update({
        error: error,
      });
    } else {
      firebaseRef.update({
        payment: payment,
      });

      console.log(JSON.stringify(payment));

      /*
            transfer "asset_name" qty "to_address" "message" expire_time "change_address" "asset_change_address"

            Transfers a quantity of an owned asset to a given address
            Arguments:
            1. "asset_name"               (string, required) name of asset
            2. "qty"                      (numeric, required) number of assets you want to send to the address
            3. "to_address"               (string, required) address to send the asset to
            4. "message"                  (string, optional) Once RIP5 is voted in ipfs hash or txid hash to send along with the transfer
            5. "expire_time"              (numeric, optional) UTC timestamp of when the message expires
            6. "change_address"       (string, optional, default = "") the transactions RVN change will be sent to this address
            7. "asset_change_address"     (string, optional, default = "") the transactions Asset change will be sent to this address
      */

      console.log("Payment", payment);
      //Fetch current RVN price from Binance
      const URL = "https://api1.binance.com/api/v3/ticker/price?symbol=RVNUSDT";

      const response = await axios.get(URL);
      const rvnPrice = response.data;

      //Quantity is product.price / price of RVN minus product.fees
      //SEND RAVENCOIN
      {
        const qty = getQuantityToSend(product, parseFloat(rvnPrice.price));
        console.log("Will send", qty, "RVN to", order.ravencoinAddress);
        const to_address = order.ravencoinAddress;
        const args = [to_address, qty];
        const ravencoinTransactionId = await rpc("sendtoaddress", args);
        firebaseRef.update({
          rvnQuantity: qty,
          rvnPrice,
          ravencoinTransactionId,
        });
      }

      {
        //Send tokens
        const method = "transfer";
        const asset_name = product.assetName;
        const qty = 1;
        const to_address = order.ravencoinAddress;
        const args = [asset_name, qty, to_address];
        rpc(method, args);
      }
    }
  };
  paypal.payment.execute(paymentId, execute_payment_json, callback);
}

function shouldExecuteOrder(order) {
  if (!order) {
    return false;
  }
  if (order.error) {
    return false;
  }
  if (!order.metadata) {
    return false;
  }

  if (!order.payment) {
    return false;
  }

  //Only execute orders with state set to created
  if (order.payment.state === "created") {
    return true;
  }
  return false;
}

module.exports = executeOrders;
