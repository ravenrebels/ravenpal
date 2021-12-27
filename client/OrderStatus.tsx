import * as React from "react";

export function OrderStatus({ order }) {
  if (!order) {
    return null;
  }

  if (!order.payment) {
    return null;
  }

  return (
    <div
      key={order.id}
      style={{
        border: "1px solid black",
        padding: "20px",
        marginBottom: "10px",
        borderRadius: "10px",
      }}
    >
      Created: {order.payment.create_time}
      <br />
      State: {order.payment.state}
      <br />
      id: {order.payment.id}
      <br />
      {order.payment.transactions[0].amount.currency}{" "}
      {order.payment.transactions[0].amount.total}
      <br />
      {order.payment.transactions[0].description}
    </div>
  );
}
