const admin = require("firebase-admin");
const pay = require("./pay");

console.log(pay);
//SETUP FIREBASE
const serviceAccount = require("./firebaseServiceAccount.json");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL:
    "https://ravencoin--staging-default-rtdb.europe-west1.firebasedatabase.app",
});

async function work() {
  const db = admin.database();

  //Get all orders
  const ref = db.ref("/orders");
  ref.on("value", function (snapshot) {
    const data = snapshot.val();

    //Data structure orders > userid > order
    const users = Object.keys(data);

    let addNewListener = false;
    for (const user of users) {
      const orders = data[users];
      const orderKeys = Object.keys(orders);

      for (const key of orderKeys) {
        const order = orders[key];

        const orderRef = db.ref("/orders/" + user + "/" + key);

        if (!order.payment || !order.payment.state) {
          console.log("Will process order", order);
          //Stop listening to prevent race conditions since we will make updates
          ref.off("value");

          //Start listening again in 30 seconds
          addNewListener = true;
          pay(orderRef, order.ravencoinAddress);
        } else {
          console.log("Will not process", key);
        }
      }
    }
    if (addNewListener === true) {
      setTimeout(work, 30 * 1000);
    }
  });
}
work();
