const paypal = require("./paypal");
const axios = require("axios");
const products = require("../products.json");
const throttle = require("lodash.throttle");
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
