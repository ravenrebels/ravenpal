import * as React from "react";

//Fetch price from Binance every 60 seconds
function useHowManyRVN(dollarAmountGet) {
  const [howMany, setHowMany] = React.useState(0);
  React.useEffect(() => {
    async function work() {
      const URL = "https://api1.binance.com/api/v3/ticker/price?symbol=RVNUSDT";
      fetch(URL)
        .then((response) => response.json())
        .then((data) => {
          const h = Math.round(dollarAmountGet / data.price);
          setHowMany(h);
        });
    }

    work();
    const interval = setInterval(work, 60 * 1000);

    const cleanUp = () => {
      clearInterval(interval);
    };
    return cleanUp;
  }, []);

  return howMany;
}
interface IProduct {
  price: string;
  currency: string;
  description: string;
  name: string;
  imageURL?: string;
}
interface IProps {
  product: IProduct;
}
export function Instructions({ product }: IProps) {
  return (
    <div>
      <h1 className="mt-4 mb-5">Project Ravenpal</h1>
      <p className="lead">{product.description}</p>
      <p>
        Price {product.price} {product.currency}
      </p>{" "}
      {product.imageURL && (
        <img
          className="mt-4 mb-4 product-image"
          src={product.imageURL}
          width="200"
        />
      )}
    </div>
  );
  /*  const howMany = useHowManyRVN(dollarAmountGet);
  return (
    <div>
      <h1>Buy some RVN</h1>
      <p>
        Buy approximately {howMany} RVN for <em>${dollarAmountPay}</em> so you
        can start doing stuff on Ravencoin blockchain.
      </p>
      <p>No more, no less.</p>

    
    </div>
  );*/
}
