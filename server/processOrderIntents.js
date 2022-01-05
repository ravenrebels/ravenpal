const createPayment = require("./createPayment");
const throttle = require("lodash.throttle");
async function work(firebase) {
  const db = firebase.database();

  //Get all order intents
  const ref = db.ref("/order-intents");

  const eventListener = (snapshot, previousKey) => {
    const data = snapshot.val();
    if (!data) {
      return;
    }
    //Data structure order-intent > userid > order
    const users = Object.keys(data);

    for (const user of users) {
      const orderIntents = data[user];
      const orderIntentKeys = Object.keys(orderIntents);

      for (const orderIntentKey of orderIntentKeys) {
        const orderIntent = orderIntents[orderIntentKey];
        console.log("Processing order intent", orderIntent, orderIntentKey);
        //convert the order-intent to an order, users do not have write access to /orders
        const orderRef = db.ref("/orders/" + user + "/" + orderIntentKey);

        const toSave = {};
        //Cherry pick white-listed properties
        const whiteList = ["metadata", "ravencoinAddress", "userTime"];

        whiteList.map(function (prop) {
          const value = orderIntent[prop];
          if (value) {
            toSave[prop] = value;
          }
        });
        console.log("Updating order", orderIntentKey, "with", toSave);

        orderRef.update(toSave);

        //Delete the intent
        const intentRef = db.ref(
          "/order-intents/" + user + "/" + orderIntentKey
        );
        intentRef.remove();
      }
    }
  };

  //Three second throttle, multiple updates can come at once
  const throttledEventListener = throttle(eventListener, 3000);
  ref.on("value", throttledEventListener);
}
module.exports = work;
