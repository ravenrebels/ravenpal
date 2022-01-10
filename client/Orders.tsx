import * as React from "react";
import { OrderStatus } from "./OrderStatus";

export const sortOrdersByDate = function (a, b) {
  const aPayment = a.payment || {};
  const bPayment = b.payment || {};

  if (aPayment.create_time > bPayment.create_time) {
    return -1;
  }
  if (aPayment.create_time === bPayment.create_time) {
    return 0;
  }
  return 1;
};
export function Orders({ orders }) {
  console.log("ORDERS", orders);
  if (!orders) {
    return null;
  }
  const ordersArray = ordersByDate(orders);

  function ordersByDate(orders) {
    let ordersArray = [];
    if (orders) {
      const keys = Object.keys(orders);
      ordersArray = keys.map(function (key) {
        const obj = orders[key];
        obj.id = key;
        return obj;
      });
      ordersArray = Object.values(orders);

      ordersArray.sort(sortOrdersByDate);
    }
    return ordersArray;
  }

  return (
    <div>
      <h3 className="mt-5">My order history</h3>
      <ul className="order-status">
        {ordersArray.map(function (order) {
          return <OrderStatus order={order} />;
        })}
      </ul>
    </div>
  );
}
