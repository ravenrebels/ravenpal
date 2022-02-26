const getQuantityToSend = require("./getQuantityToSend");

const products = require("../products.json");
const product = products[0];

var a = getQuantityToSend(product, 0.057);

console.log(a);