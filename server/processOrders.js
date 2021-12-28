const pay = require("./pay");

function processOrders(firebase) {
  const db = firebase.database();
  const ref = db.ref("/orders");

  ref.on("value", (snapshot) => {
    const data = snapshot.val();

    if (!data) {
      return;
    }

    const userIds = Object.keys(data);
    for (const userId of userIds) {
      console.log("process orders, user", userId);

      const orders = data[userId];
      const orderKeys = Object.keys(orders);

      for (const orderKey of orderKeys) {
        const order = orders[orderKey];

        if (!order.payment) {
          const orderRef = db.ref("/orders/" + userId + "/" + orderKey);
          pay(orderRef, order.ravencoinAddress);
        }
      }
    }
  });
}

module.exports = processOrders;
