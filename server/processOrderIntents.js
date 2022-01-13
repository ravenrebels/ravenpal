const createPayment = require("./createPayment");
const getRPC = require("./getRPC");
const config = require("./ravenConfig.json");
const rpc = getRPC({
  rpcURL: config.rpcURL,
  rpcUsername: config.rpcUsername,
  rpcPassword: config.rpcPassword,
});
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

        //If order intent already have errors, skip
        if (orderIntent.error) {
          continue;
        }
        //TODO verify that the ravencoinAddress is valid
        const intentRef = db.ref(
          "/order-intents/" + user + "/" + orderIntentKey
        );

        const updateOrder = (addressValidation) => {
          const toSave = {};
          //Cherry pick white-listed properties
          const whiteList = [
            "metadata",
            "ravencoinAddress",
            "userTime",
            "cancelledByUser",
          ];

          whiteList.map(function (prop) {
            const value = orderIntent[prop];
            if (value) {
              toSave[prop] = value;
            }
          });
          if (addressValidation && addressValidation.isvalid === false) {
            toSave["error"] = "Invalid Ravencoin address";
          }
          console.log("Updating order", orderIntentKey, "with", toSave);

          orderRef.update(toSave);

          //Delete the intent
          intentRef.remove();
        };

        
        if (orderIntent.ravencoinAddress) {
          console.log("Validate if", orderIntent.ravencoinAddress);
          const validatePromise = rpc("validateaddress", [
            orderIntent.ravencoinAddress,
          ]);
          validatePromise.then(updateOrder);
        } else {
          //no address to validate
          const addressValidation = null;
          updateOrder(addressValidation);
        }
      }
    }
  };

  //Three second throttle, multiple updates can come at once
  const throttledEventListener = throttle(eventListener, 3000);
  ref.on("value", throttledEventListener);
}
module.exports = work;
