function getAmountFromExecutedOrder(order) {
  if (!order) {
    return 0;
  }

  if (!order.transactions) {
    return 0;
  }

  if(order.transactions.length < 1){
      return 0;
  }
  if(!order.transactions[0].amount){
      return 0;
  }
  return parseFloat(order.transactions[0].amount.total);
}

module.exports = {
  getAmountFromExecutedOrder,
};
