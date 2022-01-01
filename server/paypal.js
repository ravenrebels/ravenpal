const paypal = require("paypal-rest-sdk");
const paypalSettings = require("./paypalsettings.json");

//SETUP PAYPAL
paypal.configure({
  mode: paypalSettings.mode, //sandbox or live
  client_id: paypalSettings.client_id,
  client_secret: paypalSettings.client_secret,
});

exports = paypal;
