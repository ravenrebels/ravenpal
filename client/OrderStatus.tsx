import * as React from "react";

export function OrderStatus({ order }) {
  if (!order) {
    return null;
  }

  if (!order.payment) {
    return null;
  }
  const json = JSON.stringify(order, null, 4);
  console.log(order);

  let amount = "";
  let currency = "";
  let description = "";
  let pay = "";
  let state = "";
  if (order.payment && order.payment.transactions) {
    description = (
      <LabeledOutputField
        label="Description"
        value={order.payment.transactions[0].description}
      />
    );
    amount = (
      <LabeledOutputField
        label="Currency"
        value={order.payment.transactions[0].amount.currency}
      />
    );

    currency = (
      <LabeledOutputField
        label="Total"
        value={order.payment.transactions[0].amount.total}
      />
    );

    state = (
      <LabeledOutputField label="State/Status" value={order.payment.state} />
    );

    pay = order.payment.state === "created" && (
      <div>
        <a href={order.redirectURL}>Pay</a>
      </div>
    );
  }

  let id = "";
  if (order.payment) {
    id = <LabeledOutputField label={"id"} value={order.payment.id} />;
  }
  return (
    <li
      className="order-status"
      key={order.id}
      style={{
        border: "1px solid black",
        padding: "20px",
        marginBottom: "10px",
        borderRadius: "10px",
      }}
    >
      <h3 className="order-status__headline">
        {new Date(order.payment.create_time).toLocaleString()}
      </h3>
      {id}
      {state}
      {currency}
      {amount}
      {description}
      {pay}
    </li>
  );
}

function LabeledOutputField({ label, value }) {
  return (
    <div className="order-status__labeled-output-field">
      <label>{label}</label>
      <output>{value}</output>
    </div>
  );
}
