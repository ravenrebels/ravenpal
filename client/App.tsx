import * as React from "react";
import { Instructions } from "./Instructions";
import { User } from "@firebase/auth-types";
import { OrderStatus } from "./OrderStatus";

interface IProps {
  firebase: any;
  logOut: any;
  user: User;
}
export function App({ firebase, logOut, user }: IProps) {
  const dollarAmountPay = 60;
  const dollarAmountGet = 57;

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

  //Does any order have state "created"?
  ordersArray.map(function (order) {
    if (order.payment && order.payment.state === "created") {
     // window.location = order.redirectURL;
    }
  });

  return (
    <div className="card">
      <img src={user.photoURL} className="profile-image"></img>
      <Instructions
        dollarAmountPay={dollarAmountPay}
        dollarAmountGet={dollarAmountGet}
      />
      <button
        className="button-27"
        onClick={() => {
          const firebaseOrderRef = postBuyOrder(firebase, user);
          //Get reference to /order/userid/key, can we use parent().parent()?
          const key = firebaseOrderRef.key;

          //Subscribe to changes in Firebase, unregister on getting redirect URL
          const listener = firebaseOrderRef.on("value", function (snapshot) {
            const data = snapshot.val();

            if (data.redirectURL) {
              window.location = data.redirectURL;
            }
          });
        }}
      >
        Buy Ravencoin with Paypal
      </button>
      <button className="button-27 sign-out-button" onClick={logOut}>
        Sign out
      </button>
      <h1>My order history</h1>
      <ul className="order-status">
        {ordersArray.map(function (order) {
          return <OrderStatus order={order} />;
        })}
      </ul>
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
function postBuyOrder(firebase, user) {
  const userRef = firebase.database().ref("/order-intents/" + user.uid);
  const orderRef = userRef.push();
  orderRef.set({
    ravencoinAddress: "RFb2XBw4WC1rZYave93DorxLBym3piGVLo",
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
