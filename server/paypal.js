const paypal = require("paypal-rest-sdk");
const paypalSettings = require("./paypalsettings.json");

//Configure paypal sdk to use our settings
paypal.configure({
  mode: paypalSettings.mode, //sandbox or live
  client_id: paypalSettings.client_id,
  client_secret: paypalSettings.client_secret,
});

module.exports = paypal;
