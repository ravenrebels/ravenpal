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
    ref.on("value", (snapshot) => {
      setOrders(snapshot.val());
    });
  }, []);

  React.useEffect(() => {
    //Check if we have redirect_url in URL
    const searchParams = new URLSearchParams(window.location.search);

    //Example URL
    //http://localhost:1234/index.html?return_url=true&paymentId=PAYID-MHDRBNY817693342L823750P&token=EC-78J78014HW877442K&PayerID=GT7DJFQJ2H74W

    if (searchParams.get("return_url")) {
      const paymentId = searchParams.get("paymentId");
      const token = searchParams.get("token");
      const PayerID = searchParams.get("PayerID");

      //Get the users orders and locate paymentId
      const ref = firebase.database().ref("/orders/" + user.uid);

      ref.once("value", (snapshot) => {
        const data = snapshot.val();

        if (!data) {
          return;
        }

        const keys = Object.keys(data);
        for (const key of keys) {
          const order = data[key];
          if (!order.payment) {
            continue;
          }
          if (order.payment.id === paymentId) {
            const orderRef = firebase
              .database()
              .ref("/orders/" + user.uid + "/" + key);

            const toSend = {
              metadata: {
                paymentId,
                token,
                PayerID,
              },
            };

            const promise = orderRef.update(toSend);

            promise.then(reloadPageWithoutQueryString);
          }
        }
      });
    } else {
    }
  }, []);

  //Orders sorted by date
  const ordersArray = ordersByDate(orders);

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

          //Subscribe to changes in Firebase, unregister on getting redirect URL
          const listener = firebaseOrderRef.on("value", function (snapshot) {
            const data = snapshot.val();

            if (data.redirectURL) {
              //Unregister listener
              firebaseOrderRef.off("value", listener);
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
      <ul>
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
  const userRef = firebase.database().ref("/orders/" + user.uid);
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
