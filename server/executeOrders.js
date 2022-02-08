const paypal = require("./paypal");
const axios = require("axios");
const products = require("../products.json");
const throttle = require("lodash.throttle");

const getRPC = require("./getRPC");
const config = require("./ravenConfig.json");
const rpc = getRPC(config);
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
          console.log("Execute order, should process", order);
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

  paypal.payment.execute(
    paymentId,

    execute_payment_json,
    function (error, payment) {
      if (error) {
        console.log("Error processing payment id", paymentId, error);
        firebaseRef.update({
          error: error,
        });
      } else {
        firebaseRef.update({
          payment: payment,
        });
        const json = JSON.stringify(payment, null, 4);
        console.log(JSON.stringify(payment));

        //Fetch current RVN price from Binance

        const URL =
          "https://api1.binance.com/api/v3/ticker/price?symbol=RVNUSDT";
        axios.get(URL).then((response) => {
          firebaseRef.update({
            rvnPrice: response.data,
          });
        });

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

        {
          //Send tokens
          const method = "transfer";
          const asset_name = product.assetName;
          const qty = 1;
          const to_address = order.ravencoinAddress;
          const args = [asset_name, qty, to_address];
          rpc(method, args).then((r) => {
            const transactionId = r[0];

            firebaseRef.update({
              ravencoinTransactionId: transactionId,
            });
          });
        }

        //SEND RAVENCOIN
        {
          const qty = 10;
          const to_address = order.ravencoinAddress;
          const args = [to_address, qty];
          rpc("sendtoaddress", args);
        }
      }
    }
  );
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
