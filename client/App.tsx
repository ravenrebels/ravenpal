import * as React from "react";
import { Instructions } from "./Instructions";
import { User } from "@firebase/auth-types";
import { OrderStatus } from "./OrderStatus";
import * as products from "../products.json";

import validateAddress from "./validateAddress";

interface IProps {
  firebase: any;
  logOut: any;
  user: User;
}

enum Routes {
  HOME,
  BUY,
  SUCCESS,
  CANCEL,
}
export function App({ firebase, logOut, user }: IProps) {
  const [route, setRoute] = React.useState(Routes.HOME);
  const dollarAmountPay = parseInt(products[0].price);
  const dollarAmountGet = (dollarAmountPay - 3) * 0.99; //Paypal fees plus our 1 percent fee
  const [ravencoinAddress, setRavencoinAddress] = React.useState(null);

  const [orders, setOrders] = React.useState(null);

  React.useEffect(() => {
    const ref = firebase.database().ref("/orders/" + user.uid);
    const listener = ref.on("value", (snapshot) => {
      setOrders(snapshot.val());
    });
    const cleanup = () => {
      ref.off("value", listener);
    };

    return cleanup;
  }, []);

  const buyEventListener = async () => {
    //Validate address
    const isAddressValid = await validateAddress(firebase, ravencoinAddress);
    if (isAddressValid) {
      const orderRef = submitBuyOrder(firebase, user, ravencoinAddress);

      //Subscribe to changes in Firebase, unregister on getting redirect URL
      const listener = orderRef.on("value", function (snapshot) {
        const data = snapshot.val();
        if (!data) {
          return;
        }
        if (data.redirectURL) {
          orderRef.off("value", listener);
          window.location = data.redirectURL;
        }
      });
    }

    if (isAddressValid === false) {
      alert(ravencoinAddress + " is not a valid Ravencoin address");
    }
  };
  //Orders sorted by date
  const ordersArray = ordersByDate(orders);

  if (window.location.href.indexOf("cancel=true&token=") > -1) {
    return (
      <Cancel firebase={firebase} orders={ordersArray} user={user}></Cancel>
    );
  }

  //Does any order have state "created"?
  ordersArray.map(function (order) {
    if (order.payment && order.payment.state === "created") {
      // window.location = order.redirectURL;
    }
  });
  const showPayButton = ravencoinAddress && ravencoinAddress.length > 20;
  const payButtonStyle = {
    display: (showPayButton && "block") || "none",
  };
  return (
    <div>
      {/* PROFILE PICTURE */}
      <img src={user.photoURL} className="profile-image"></img>
      <button className="btn btn-secondary  sign-out-button" onClick={logOut}>
        Sign out
      </button>

      {/* INSTRUCTIONS */}
      <Instructions
        dollarAmountPay={dollarAmountPay}
        dollarAmountGet={dollarAmountGet}
      />

      {/* RAVENCOIN ADDRESS */}
      <div className="mb-3">
        <label htmlFor="exampleFormControlInput1" className="form-label">
          Ravencoin address
        </label>
        <input
          className="form-control"
          id="exampleFormControlInput1"
          onChange={(event) => {
            setRavencoinAddress(event.target.value);
          }}
          placeholder="Your Ravencoin address"
          type="text"
          value={ravencoinAddress || ""}
        />
      </div>

      {/* BUY BUTTON */}
      <button style={payButtonStyle} onClick={buyEventListener}>
        Buy Ravencoin with{" "}
        <img
          className="paypal-logo"
          src="https://www.paypalobjects.com/digitalassets/c/website/logo/full-text/pp_fc_hl.svg"
        ></img>
      </button>

      {/* LIST OF ORDERS */}
      {orders && Object.keys(orders).length > 0 && (
        <div>
          <h1>My order history</h1>
          <ul className="order-status">
            {ordersArray.map(function (order) {
              return <OrderStatus order={order} />;
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
const sortOrdersByDate = function (a, b) {
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
function submitBuyOrder(firebase, user, ravencoinAddress) {
  //Validate ravencoin address

  const userRef = firebase.database().ref("/order-intents/" + user.uid);
  const orderRef = userRef.push();
  orderRef.set({
    ravencoinAddress: ravencoinAddress,
    userTime: new Date().toISOString(),
  });
  return orderRef;
}

function reloadPageWithoutQueryString() {
  var u = new URL(window.location.href);
  u.hash = "";
  u.search = "";
  window.location.href = u.toString();
}

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

function Cancel({ firebase, orders, user }) {
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
  FileSystemDirectoryReader;

  return <div>Cancel</div>;
}
