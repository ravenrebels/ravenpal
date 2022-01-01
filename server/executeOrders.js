const paypal = require("./paypal");

function executeOrders(firebase) {
  const db = firebase.database();
  const ref = db.ref("/orders");

  ref.on("value", (snapshot) => {
    const data = snapshot.val();

    if (data === null) {
      return;
    }
    const userIds = Object.keys(data);
    for (const userId of userIds) {
      console.log("process orders, user", userId);
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
  });
}

function executeOrder(firebaseRef, paypal, order) {
  const payerId = order.metadata.PayerID;
  const paymentId = order.metadata.paymentId;

  const execute_payment_json = {
    payer_id: payerId,
    transactions: [
      {
        amount: {
          currency: "USD",
          total: "10.00",
        },
      },
    ],
  };

  paypal.payment.execute(
    paymentId,

    execute_payment_json,
    function (error, payment) {
      if (error) {
        console.log("Error processing payment id", paymentId, error);
      } else {
        firebaseRef.update({
          payment: payment,
        });
        const json = JSON.stringify(payment, null, 4);
        console.log(JSON.stringify(payment));
      }
    }
  );
}

function shouldExecuteOrder(order) {
  if (!order) {
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
