const admin = require("firebase-admin");

const processOrderIntents = require("./processOrderIntents");
const processOrders = require("./processOrders");
const executeOrders = require("./executeOrders");
const getRPC = require("./getRPC");
const config = require("./ravenConfig.json");
//SETUP FIREBASE
const serviceAccount = require("./firebaseServiceAccount.json");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL:
    "https://ravencoin--staging-default-rtdb.europe-west1.firebasedatabase.app",
});

//User generated order-intents should be moved to /orders
processOrderIntents(admin);

//Process the orders, users do not have write access to orders
processOrders(admin);

//Execute orders in state "created", where the endn user has accepted them

executeOrders(admin);

processValidationOfAddresses(admin);

//Check that we have sent assets to all orders that are approved. orders that are approved
//TODO, send digital assets to the buyer

function processValidationOfAddresses(firebase) {
  const rpc = getRPC(config);
  firebase
    .database()
    .ref("validateaddress")
    .on("value", (snapshot) => {
      const data = snapshot.val();
      console.log("Validate address", data);
      if (!data) {
        console.log("No return of address, return");
        return;
      }
      const keys = Object.keys(data);
      console.log("keys", keys);

      for (const key of keys) {
        const address = data[key];
        if (address.isValid === true) {
          continue;
        }
        if (address.isValid === false) {
          continue;
        }
        if (!address.ravencoinAddress) {
          continue;
        }
        console.log("Will call validate address with ", address);
        const promise = rpc("validateaddress", [address.ravencoinAddress]);
        promise.then((d) => {
          firebase
            .database()
            .ref("validateaddress/" + key)
            .update({
              isValid: d.isvalid,
            });
        });
        promise.catch((e) => {
          console.log("SUPER DUPER MEGA FEL");
        });
      }
    });
}
