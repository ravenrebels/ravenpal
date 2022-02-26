const getQuantityToSend = require("./getQuantityToSend");
const PayPalHelper = require("./PayPalHelper");
const products = require("../products.json");
const product = products[0];

var a = getQuantityToSend(product, 0.057); 
console.log(a);

//Amount paid by user should be 80
const executed = require("./mock/paypal_execute.json");
const amount = PayPalHelper.getAmountFromExecutedOrder(executed);
console.log(amount);