import * as React from "react";
import { IOrder } from "./App";

export function Cancel({ firebase, ordersTemp, user }) {
  const orders: Array<IOrder> = Object.values(ordersTemp);
  if (!orders) {
    return null;
  }

  let searchParams = new URLSearchParams(window.location.href);
  const token = searchParams.get("token");

  //Iterate over order, find the order that contains the token value in the redirectURL field
  if (token) {
    orders.map((order) => {
      const URL = order.redirectURL;
      if (URL.indexOf("token=" + token) > -1) {
        const promise = firebase
          .database()
          .ref("/order-intents/" + user.uid + "/" + order.id)
          .update({
            canceledByUser: true,
          });
        promise.then((d) => {
          //Successfully canceled order, redirect to start page
          alert("Order canceled");
          window.location.href = "/";
        });
      }
    });
  }
  return <div>User has canceled something</div>;
}
