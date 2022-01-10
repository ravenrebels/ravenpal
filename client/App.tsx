import * as React from "react";
import { Instructions } from "./Instructions";
import { User } from "@firebase/auth-types";
import { OrderStatus } from "./OrderStatus";
import * as products from "../products.json";

import validateAddress from "./validateAddress";

interface IProps {
  firebase: any;
  user: User;
}

enum Routes {
  HOME,
  STEP1,
  STEP2,
  STEP3,
  SUCCESS,
  CANCEL,
}
export function App({ firebase, user }: IProps) {
  const [route, setRoute] = React.useState(Routes.STEP1);
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
 
  return (
    <div>
      {/* PAYPAL LOGO */}
      <img className="paypal-logo" src="https://www.paypalobjects.com/webstatic/mktg/logo/pp_cc_mark_37x23.jpg"/>
     

      {/* INSTRUCTIONS */}
      <Instructions product={products[0]} />

      {route === Routes.STEP1 && (
        <Step1
          firebase={firebase}
          next={() => {
            //Subscribe to changes in Firebase, unregister on getting redirect URL
            const orderIntentRef = submitBuyOrder(
              firebase,
              user,
              ravencoinAddress
            );
            const str = "orders/" + user.uid + "/" + orderIntentRef.key;

            const orderRef = firebase.database().ref(str);
            console.log("Submit order", str, orderRef);

            const asdf = () => {
              orderRef.once("value", (snapshot) => {
                console.log("Datta", snapshot.val());
              });
            };

            setTimeout(asdf, 2000);
            const listener = orderRef.on("value", function (snapshot) {
              console.log("Got data for", snapshot);
              const data = snapshot.val();
              if (!data) {
                return;
              }
              console.log(data);
              if (data.redirectURL) {
                orderRef.off("value", listener);
                window.location = data.redirectURL;
              }
            });
          }}
          ravencoinAddress={ravencoinAddress}
          setRavencoinAddress={setRavencoinAddress}
        />
      )}

      {route === Routes.STEP2 && <Step2 />}

      {/* LIST OF ORDERS */}
      <Orders orders={ordersArray} />
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

function Orders({ orders }) {
  if (!orders || orders.length === 0) {
    return null;
  }

  return (
    <div>
      <h3 className="mt-5">My order history</h3>
      <ul className="order-status">
        {orders.map(function (order) {
          return <OrderStatus order={order} />;
        })}
      </ul>
    </div>
  );
}

function Step(props) {
  return <div className="glasscard">{props.children}</div>;
}
function Step1({ firebase, next, ravencoinAddress, setRavencoinAddress }) {
  enum Status {
    NORMAL,
    VALIDATING,
  }
  const [status, setStatus] = React.useState(Status.NORMAL);
  return (
    <Step>
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

        <button
          className="btn btn-primary mt-4"
          onClick={async () => {
            setStatus(Status.VALIDATING);
            const promise = validateAddress(firebase, ravencoinAddress);

            promise.then((d) => {
              if (d === true) {
                next();
              } else {
                alert("Ravencoin address is not valid");
              }
            });
          }}
        >
          Next
        </button>
      </div>
    </Step>
  );
}
function Step2(props) {
  return <div>Step 2</div>;
}
function Step3(props) {
  return <div> Step 2</div>;
}
