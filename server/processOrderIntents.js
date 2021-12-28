const pay = require("./pay");

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
      const orders = data[user];
      const orderKeys = Object.keys(orders);

      for (const key of orderKeys) {
        const order = orders[key];

        //convert the order-intent to an order, users do not have write access to /order
        const orderRef = db.ref("/orders/" + user + "/" + key);
        orderRef.update(order);

        //Delete the intent
        const intentRef = db.ref("/order-intents/" + user + "/" + key);
        intentRef.remove();
      }
    }

    // ref.on("child_added", eventListener);
    //  ref.on("child_changed", eventListener);
  };
  ref.on("value", eventListener);
}
module.exports = work;

/*


        orderRef.once("value", (snap) => {
          if (snap.exists() === false) {
            pay(orderIntentRef, orderRef, order.ravencoinAddress);
          } else {
            console.log("order", key, "already exists");
          }
        });
      }

      */
