const paypal = require("paypal-rest-sdk");
const paypalSettings = require("./paypalsettings.json");
paypal.configure({
  mode: "sandbox", //sandbox or live
  client_id: paypalSettings.client_id,
  client_secret: paypalSettings.client_secret,
});

const payerId = "GT7DJFQJ2H74W";
const paymentId = "PAYID-MHDR5OY98P11371MM975770E";

const execute_payment_json = {
  payer_id: payerId,
  transactions: [
    {
      amount: {
        currency: "USD",
        total: "10.00",
      },
    },
  ],
};

paypal.payment.execute(
  paymentId,
  execute_payment_json,
  function (error, payment) {
    if (error) {
      console.log(error.response);
      throw error;
    } else {
      console.log(JSON.stringify(payment));
      res.send("Success");
    }
  }
);
