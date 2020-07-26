import Order from "../../models/order";

export const ADD_ORDER = "ADD_ORDER";
export const SET_ORDERS = "SET_ORDERS";
import { key } from "firebase-key";

export const fetchOrders = () => {
  return async (dispatch) => {
    try {
      const response = await fetch(
        "https://fyp-1f572.firebaseio.com/orders/u1.json"
      );

      if (!response.ok) {
        throw new Error("Something went wrong!");
      }

      const resData = await response.json();
      const loadedOrders = [];

      for (const key in resData) {
        loadedOrders.push(
          new Order(
            key,
            resData[key].cartItems,
            resData[key].totalAmount,
            new Date(resData[key].date)
          )
        );
      }
      dispatch({ type: SET_ORDERS, orders: loadedOrders });
    } catch (err) {
      throw err;
    }
  };
};

const sendOrderToUsmanTable = async (tableNo, cartItems, price,collectionName) => {
  console.log(cartItems,"itemData nominomi")
  let productObject = {};
  cartItems.map(async (cartItem) => {
    productObject = {
      name: cartItem.productTitle,
      price:cartItem.productPrice,
      tableno: tableNo,
      quantity:cartItem.quantity
    };

    await fetch(`https://fyp-1f572.firebaseio.com/${collectionName}/${tableNo}.json`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(productObject),
    });
  });
};

export const addOrder = (cartItems, totalAmount, tableno,isCard) => {
  return async (dispatch) => {
    const date = new Date();
    const response = await fetch(
      "https://fyp-1f572.firebaseio.com/orders/u1.json",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          cartItems,
          totalAmount,
          date: date.toISOString(),
        }),
      }
    );

    if (!response.ok) {
      throw new Error("Something went wrong!");
    } else {
      sendOrderToUsmanTable(tableno, cartItems, totalAmount,"order");
      if(isCard)
      {
        sendOrderToUsmanTable(tableno, cartItems, totalAmount,"card");
      }
      else
      {
        sendOrderToUsmanTable(tableno, cartItems, totalAmount,"payment");
      }
    }

    const resData = await response.json();

    dispatch({
      type: ADD_ORDER,
      orderData: {
        id: resData.name,
        items: cartItems,
        amount: totalAmount,
        date: date,
      },
    });
  };
};
