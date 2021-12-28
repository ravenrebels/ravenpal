import * as React from "react";

export function OrderStatus({ order }) {
  if (!order) {
    return null;
  }

  if (!order.payment) {
    return null;
  }
  const json = JSON.stringify(order, null, 4);
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
      Order date: {new Date(order.payment.create_time).toLocaleString()}
      <br />
      State: {order.payment.state}
      <div>
        <strong>Meta data</strong>
        {JSON.stringify(order.metadata)}
      </div>
      <br />
      id: {order.payment.id}
      <br />
      {order.payment.transactions[0].amount.currency}{" "}
      {order.payment.transactions[0].amount.total}
      <br />
      {order.payment.transactions[0].description}
      <a href={order.redirectURL}>Pay</a>
    </div>
  );
}
