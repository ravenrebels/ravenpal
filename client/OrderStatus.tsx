import { privateDecrypt } from "crypto";
import * as React from "react";

export function OrderStatus({ order }) {
  if (!order) {
    return null;
  }

  if (order.error) {
    console.log("order id", order.id, "has error", order.error);
  }
  if (!order.payment) {
    return null;
  }

  if (order.canceledByUser) {
    return null;
  }
  const json = JSON.stringify(order, null, 4);
  console.log(order);

  let amount = null;
  let currency = null;
  let description = null;
  let date = null;

  let headline = order.id;
  let id = null;

  let pay = null;
  let state = null;

  let err = null;

  let fees = null;

  if (order && order.error) {
    err = (
      <LabeledOutputField label="Error" value={JSON.stringify(order.error)} />
    );
  }
  if (order.payment && order.payment.transactions) {
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
    description = (
      <LabeledOutputField
        label="Description"
        value={order.payment.transactions[0].description}
      />
    );

    if (order.payment.transactions && order.payment.transactions[0]) {
      const transaction = order.payment.transactions[0];

      const related =
        transaction.related_resources && transaction.related_resources[0];
      if (related) {
        fees = (
          <LabeledOutputField
            label={"Fee"}
            value={
              related.sale.transaction_fee.value +
              " " +
              related.sale.transaction_fee.currency
            }
          />
        );
      }
    }
    id = <LabeledOutputField label={"id"} value={order.payment.id} />;

    state = (
      <LabeledOutputField label="State/Status" value={order.payment.state} />
    );

    headline = new Date(order.payment.create_time).toLocaleString();

    if (order.canceledByUser === true) {
      pay = <h2>You have canceled this order</h2>;
    } else if (order.payment.state === "created") {
      pay = (
        <div>
          <a href={order.redirectURL}>Pay</a>
        </div>
      );
    }
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
      <h3 className="order-status__headline">{headline}</h3>
      {!order.ravencoinTransactionId && (
        <h3>Digital goods not sent to you yet!</h3>
      )}
      {id}
      {err}
      {fees}
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
