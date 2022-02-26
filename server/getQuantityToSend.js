function getQuantityToSend(product, priceOfRavencoin) {
  //First step, remove fee
  let sum = product.price - product.price * product.fee;

  let qty = parseFloat(sum) / priceOfRavencoin;

  return Math.ceil(qty);
}

module.exports = getQuantityToSend;
