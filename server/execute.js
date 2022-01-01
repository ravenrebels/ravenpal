const paypal = require("./paypal");
const payerId = "GT7DJFQJ2H74W";
const paymentId = "PAYID-MHEEJZY0N463546GJ050324H";

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
      throw error;
    } else {
      const json = JSON.stringify(payment, null, 4);
      console.log(JSON.stringify(payment));
    }
  }
);
