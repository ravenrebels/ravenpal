const paypal = require("./paypal");
const pay = require("./pay");
const fs = require("fs");
const debounce = require("lodash.debounce");

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
          const orderRef = db.ref("/orders/" + userId + "/" + orderKey);
          pay(orderRef, order.ravencoinAddress);
        }
      }
    }
  };

  const debouncedEventListener = debounce(eventListener, 1000);
  ref.on("value", debouncedEventListener);
}

function backupOrders(data) {
  //Backup the orders
  //Make sure that the folder backup/orders exists
  fs.mkdirSync("./backup/orders", { recursive: true });

  const json = JSON.stringify(data);

  fs.writeFileSync("./backup/orders/" + Date.now() + ".json", json);
}

module.exports = processOrders;
