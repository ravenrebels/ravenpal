const admin = require("firebase-admin");

const processOrderIntents = require("./processOrderIntents");
const processOrders = require("./processOrders");
const executeOrders = require("./executeOrders");

//SETUP FIREBASE
const serviceAccount = require("./firebaseServiceAccount.json");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL:
    "https://ravencoin--staging-default-rtdb.europe-west1.firebasedatabase.app",
});

//User generated order-intents should be moved to /orders
processOrderIntents(admin);

//Process the orders, users do not have write access t orders
processOrders(admin);

//Execute orders in state "created", where the endn user has accepted them

executeOrders(admin);

//TODO, send digital assets to the buyer
