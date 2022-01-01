const paypal = require("paypal-rest-sdk");
const paypalSettings = require("./paypalsettings.json");
const pay = require("./pay");
const fs = require("fs");
const debounce = require("lodash.debounce");

//SETUP PAYPAL
paypal.configure({
  mode: "sandbox", //sandbox or live
  client_id: paypalSettings.client_id,
  client_secret: paypalSettings.client_secret,
});

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
      console.log("process orders, user", userId);

      const orders = data[userId];
      const orderKeys = Object.keys(orders);

      for (const orderKey of orderKeys) {
        const order = orders[orderKey];

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

  const json = JSON.stringify(data, null, 4);

  fs.writeFileSync("./backup/orders/" + Date.now() + ".json", json);
}

module.exports = processOrders;
