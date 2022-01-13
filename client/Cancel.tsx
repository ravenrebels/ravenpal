import * as React from "react";
import { IOrder } from "./App";

export function Cancel({ firebase, orders, user }) {
  console.log(orders);
  if (!orders) {
    return null;
  }
  if (!user) {
    return null;
  }
  const orderKeys = Object.keys(orders);
  console.log("Order keys", orderKeys);

  if (!orderKeys) {
    return null;
  }

  let searchParams = new URLSearchParams(window.location.href);
  const token = searchParams.get("token");

  //Iterate over order, find the order that contains the token value in the redirectURL field

  if (token) {
    orderKeys.map((key) => {
      const order = orders[key];
      const URL = order.redirectURL;

      console.log("URL", URL);
      if (URL && URL.indexOf("token=" + token) > -1) {
        console.log("Found", order, key, user.uid);
        const promise = firebase
          .database()
          .ref("/order-intents/" + user.uid + "/" + key)
          .update({
            cancelledByUser: true,
          });
        promise.then((d) => {
          //Successfully cancelled order, redirect to start page
          window.location.href = "/";
        });
      }
    });
  }
  return <div>User has cancelled something</div>;
}
