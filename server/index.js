const admin = require("firebase-admin");

const processOrderIntents = require("./processOrderIntents");
const processOrders = require("./processOrders");

//SETUP FIREBASE
const serviceAccount = require("./firebaseServiceAccount.json");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL:
    "https://ravencoin--staging-default-rtdb.europe-west1.firebasedatabase.app",
});

//User generated order-intents should be moved to /orders
processOrderIntents(admin);

processOrders(admin);
