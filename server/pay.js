const paypal = require("./paypal");

function pay(firebaseOrderRef, ravencoinAddress) {
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
              name: "$10 worth of RVN: " + ravencoinAddress,
              sku: ravencoinAddress,
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
        description: "10$ worth of Ravencoin to " + ravencoinAddress,
      },
    ],
  };

  paypal.payment.create(create_payment_json, function (error, payment) {
    if (error) {
      firebaseOrderRef.update({ error: error });
    } else {
      firebaseOrderRef.update({ payment });
      for (let i = 0; i < payment.links.length; i++) {
        if (payment.links[i].rel === "approval_url") {
          firebaseOrderRef.update({ redirectURL: payment.links[i].href });
        }
      }
    }
  });
}
module.exports = pay;
