const admin = require("firebase-admin");
const paypal = require("paypal-rest-sdk");
const paypalSettings = require("./paypalsettings.json");

const fs = require("fs");

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

    for (const user of users) {
      const orders = data[users];
      const orderKeys = Object.keys(orders);

      for (const key of orderKeys) {
        if (order.processed) {
          continue;
        }
        const order = orders[key];

        const orderRef = db.ref("/orders/" + user + "/" + key);
        pay(orderRef);
      }
    }
  });
}
work();
paypal.configure({
  mode: "sandbox", //sandbox or live
  client_id: paypalSettings.client_id,
  client_secret: paypalSettings.client_secret,
});

function pay(firebaseOrderRef) {
  const create_payment_json = {
    intent: "sale",
    payer: {
      payment_method: "paypal",
    },
    redirect_urls: {
      return_url: paypalSettings.return_url,
      cancel_url: paypalSettings.cancel_url,
    },
    transactions: [
      {
        item_list: {
          items: [
            {
              name: "$10 worth of RVN",
              sku: "" + Math.random(),
              price: "10.00",
              currency: "USD",
              quantity: 1,
            },
          ],
        },
        amount: {
          currency: "USD",
          total: "10.00",
        },
        description: "10$ worth of Ravencoin",
      },
    ],
  };

  paypal.payment.create(create_payment_json, function (error, payment) {
    if (error) {
      firebaseOrderRef.update({ error: true });
    } else {
      firebaseOrderRef.set({ payment });
      for (let i = 0; i < payment.links.length; i++) {
        if (payment.links[i].rel === "approval_url") {
          firebaseOrderRef.update({ redirectURL: payment.links[i].href });
        }
      }
    }
  });
}
