# ravenpal

This a single purpose application.
Use Paypal as payment rails when selling Ravecoin digital assets/goods (RVN/ASSETS/TOKENS/NFTs).


# DO NOT USE THIS CODE, NOT YET READY
Sell Ravencoin (RVN) using Paypal



Flow

- User visits web application
- User sign in using Google
- User specify her Ravencoin address
- Server validates Ravencoin address

After Ravencoin address has been validated.

- When user clicks buy, then web client sent buy-intent-request to Firebase 
- Server subscribes to Firebase and reacts on buy-intent-request.
- Server post payment request to Paypal.
- Server upates Firebase with response from Paypal.

