const PayPalHelper  = require("./PayPalHelper");

function getQuantityToSend(product, executedOrder, priceOfRavencoin) {


  const whatDidTheCustomerActuallyPay = PayPalHelper.getAmountFromExecutedOrder(executedOrder);
  console.log("Customer actually paid", whatDidTheCustomerActuallyPay);
  //First step, remove fee
  let sum = whatDidTheCustomerActuallyPay - whatDidTheCustomerActuallyPay * product.fee;

  let qty = parseFloat(sum) / priceOfRavencoin;

  return Math.ceil(qty);
}

module.exports = getQuantityToSend;
