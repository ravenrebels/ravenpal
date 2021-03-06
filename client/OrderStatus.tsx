import { privateDecrypt } from "crypto";
import * as React from "react";

export function OrderStatus({ order }) {
  if (!order) {
    return null;
  }

  if (!order.payment) {
    return null;
  }

  let amount = null;
  let currency = null;
  let description = null;
  let err = null;
  let fees = null;
  let headline = order.id;
  let id = null;
  let name = null;
  let pay = null;
  let rvnPrice = null;
  let ravencoinTransactionId = null;
  let state = null;

  if (order.error) {
    err = (
      <LabeledOutputField label="Error" value={JSON.stringify(order.error)} />
    );
  }

  if (order.rvnPrice) {
    rvnPrice = (
      <LabeledOutputField
        label="Price per RVN"
        value={order.rvnPrice.price + " USD"}
      />
    );
  }
  if (order.payment.transactions) {
    ravencoinTransactionId = (
      <LabeledOutputField
        label="Ravencoin transaction id"
        value={
          <a
            href={
              "https://rvn.cryptoscope.io/tx/?txid=" +
              order.ravencoinTransactionId
            }
            target="_blank"
          >
            {order.ravencoinTransactionId}
          </a>
        }
      />
    );

    currency = (
      <LabeledOutputField
        label="Total"
        value={
          order.payment.transactions[0].amount.total +
          " " +
          order.payment.transactions[0].amount.currency
        }
      />
    );
    description = (
      <LabeledOutputField
        label="Description"
        value={order.payment.transactions[0].description}
      />
    );

    try {
      console.log("item", order.payment.transactions[0].item_list.items[0]);
      name = (
        <LabeledOutputField
          label="Name"
          value={order.payment.transactions[0].item_list.items[0].name}
        />
      );
    } catch (e) {}

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
    let stateTemp = "Order created by you";
    if (order.payment.state === "approved") {
      stateTemp = "Order is paid";
    }
    if (order.cancelledByUser) {
      stateTemp = "CANCELLED";
    }
    state = <LabeledOutputField label="State/Status" value={stateTemp} />;

    headline = new Date(order.payment.create_time).toLocaleString();

    if (order.cancelledByUser === true) {
      pay = <h2>You have cancelled this order</h2>;
    } else if (order.payment.state === "created") {
      pay = (
        <div>
          <a href={order.redirectURL} className="btn btn-primary">
            Pay
          </a>
        </div>
      );
    }
  }
  return (
    <li className="order-status" key={order.id}>
      <div className="glasscard">
        <h5 className="card-title">{headline}</h5>

        {id}
        {name}

        {err}
        {order.ravencoinAddress && (
          <LabeledOutputField
            label="Ravencoin address"
            value={order.ravencoinAddress}
          ></LabeledOutputField>
        )}
        {rvnPrice}
        {fees}
        {state}
        {currency}
        {amount}
        {description}
        {ravencoinTransactionId}
        {pay}
      </div>
    </li>
  );
}

function LabeledOutputField({ label, value }) {
  return (
    <div className="row order-status mt-4">
      <div className="col col-sm-12">
        <label className="order-status__label">{label}</label>
      </div>
      <div className="col col-sm-12">
        <output>{value}</output>
      </div>
    </div>
  );
}
