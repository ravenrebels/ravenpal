const pay = require("./pay");
const debounce = require("lodash.debounce");
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

      for (const key of orderIntentKeys) {
        const orderIntent = orderIntents[key];

        //Cherry pick white-listed properties

        //convert the order-intent to an order, users do not have write access to /order
        const orderRef = db.ref("/orders/" + user + "/" + key);

        const toSave = {};
        const whiteList = ["metadata", "ravencoinaddress", "userTime"];

        whiteList.map(function (prop) {
          const value = orderIntent[prop];
          if (value) {
            toSave[prop] = value;
          }
        });

        orderRef.update(toSave);

        //Delete the intent
        const intentRef = db.ref("/order-intents/" + user + "/" + key);
        intentRef.remove();
      }
    }

    // ref.on("child_added", eventListener);
    //  ref.on("child_changed", eventListener);
  };

  //One second debounce, multiple updates can come at once
  const debouncedEventListener = debounce(eventListener, 1000);
  ref.on("value", debouncedEventListener);
}
module.exports = work;
