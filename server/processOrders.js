const paypal = require("./paypal");
const createPayment = require("./createPayment");
const fs = require("fs");
const throttle = require("lodash.throttle");

function processOrders(firebase) {
  const db = firebase.database();
  const ref = db.ref("/orders");

  const eventListener = (snapshot) => {
    const data = snapshot.val();

    if (!data) {
      return;
    }
    backupOrders(data);
    const userIds = Object.keys(data);
    for (const userId of userIds) {
      const orders = data[userId];
      const orderKeys = Object.keys(orders);

      for (const orderKey of orderKeys) {
        const order = orders[orderKey];

        if (order.error) {
          continue; //Skip orders with errors
        }

        //process orders without payemnt
        if (!order.payment) {
          console.info("Creating payment for order", orderKey);
          const orderRef = db.ref("/orders/" + userId + "/" + orderKey);
          createPayment(orderRef, order.ravencoinAddress);
        }
      }
    }
  };

  const throttledEventListener = throttle(eventListener, 5000);
  ref.on("value", throttledEventListener);
}

function backupOrders(data) {
  //Backup the orders
  //Make sure that the folder backup/orders exists
  fs.mkdirSync("./backup/orders", { recursive: true });
  const json = JSON.stringify(data);

  fs.writeFileSync("./backup/orders/" + Date.now() + ".json", json);
}

module.exports = processOrders;
