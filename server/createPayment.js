const paypal = require("./paypal");
const paypalSettings = require("./paypalsettings.json");
const products = require("../products.json");

const product = products[0];

function createPayment(firebaseOrderRef, ravencoinAddress) {
  if (!ravencoinAddress) {
    firebaseOrderRef.update({
      error: "No Ravencoin address",
    });
    return;
  }
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
              name: product.name + " " + ravencoinAddress,
              sku: ravencoinAddress,
              price: product.price,
              currency: product.currency,
              quantity: 1,
            },
          ],
        },
        amount: {
          currency: product.currency,
          total: product.price,
        },
        description: product.description + " " + ravencoinAddress,
      },
    ],
  };

  //From Paypals example of how to use Web Profile
  //https://github.com/paypal/PayPal-node-SDK/blob/master/samples/payment_experience/web_profile/create_payment_with_customized_experience.js

  let profile_name = Math.random().toString(36).substring(7);
  const create_web_profile_json = {
    name: profile_name,
    presentation: {
      brand_name: "Raven Rebels",
      logo_image:
        "https://www.paypalobjects.com/webstatic/mktg/logo/AM_SbyPP_mc_vs_dc_ae.jpg",
      locale_code: "US",
    },
    input_fields: {
      allow_note: true,
      no_shipping: 1,
      address_override: 1,
    },
    flow_config: {
      landing_page_type: "billing",
      bank_txn_pending_url: "https://www.ravenrebels.com",
    },
  };
  paypal.webProfile.create(
    create_web_profile_json,
    function (error, web_profile) {
      if (error) {
        console.error(error);
        throw error;
      } else {
        console.log("Successfully created a new web profile", web_profile);
        //Set the id of the created payment experience in payment json
        var experience_profile_id = web_profile.id;
        create_payment_json.experience_profile_id = experience_profile_id;

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
    }
  );
}
module.exports = createPayment;
