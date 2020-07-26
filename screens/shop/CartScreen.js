import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  Button,
  StyleSheet,
  ActivityIndicator,
  TextInput,
  Keyboard,
  TouchableOpacity
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';

import Colors from '../../constants/Colors';
import CartItem from '../../components/shop/CartItem';
import Card from '../../components/UI/Card';
import * as cartActions from '../../store/actions/cart';
import * as ordersActions from '../../store/actions/orders';
import { CreditCardInput, LiteCreditCardInput } from "react-native-credit-card-input";


const CartScreen = props => {
  const [isLoading, setIsLoading] = useState(false);
  const [tableno, setTableno] = useState("");
  const [isCard, setIsCard] = useState(true);
  const [form, setForm] = useState({
    "status": {
      "cvc": "incomplete",
      "expiry": "incomplete",
      "name": "incomplete",
      "number": "incomplete",
      "postalCode": "incomplete",
    }
  });

  const cartTotalAmount = useSelector(state => parseFloat(state.cart.totalAmount));
  const cartItems = useSelector(state => {
    const transformedCartItems = [];
    for (const key in state.cart.items) {
      transformedCartItems.push({
        productId: key,
        productTitle: state.cart.items[key].productTitle,
        productPrice: state.cart.items[key].productPrice,
        quantity: state.cart.items[key].quantity,
        sum: state.cart.items[key].sum
      });
    }
    return transformedCartItems.sort((a, b) =>
      a.productId > b.productId ? 1 : -1
    );
  });

  const changePaymentMethod=()=>{
    setIsCard(!isCard)
  }

  const dispatch = useDispatch();

  const sendOrderHandler = async () => {
    if(isCard)
    {
          if(form.status.number  ==="incomplete" || form.status.number  ==="invalid")
        {
          alert("please enter correct number")
          return;
        }
        else if(form.status.expiry==="incomplete"|| form.status.expiry  ==="invalid")
        {
          alert("please enter correct expiry")
          return;
        }
        else if(form.status.cvc==="incomplete"|| form.status.cvc  ==="invalid")
        {
          alert("please enter correct cvc")
          return;
        }
        
      
        else if(form.status.name  ==="incomplete"|| form.status.name  ==="invalid")
        {
          alert("please enter correct name")
          return;
        }
    }
   
    
    
    if(tableno==="")
    {
      alert("please enter table no")
      return;
    }
    setIsLoading(true);
    await dispatch(ordersActions.addOrder(cartItems, cartTotalAmount,tableno,isCard));
    setTableno("")
    setIsLoading(false);
  };
  const _onChange = (formData) =>{console.log(formData); setForm(formData)};
  const _onFocus = (field) => console.log("focusing", field);
  const _setUseLiteCreditCardInput = (useLiteCreditCardInput) => this.setState({ useLiteCreditCardInput });
  return (
    <View style={styles.screen}>

    <TouchableOpacity onPress={changePaymentMethod}>
    <View style={{backgroundColor:"darkblue",borderRadius:5,height:40,justifyContent: 'center',alignItems:"center"}}>
    <Text style={{color:"#FFFFFF",fontSize:20}}>Switch to {isCard?"Cash Payment":"Pay by Card"}</Text>
    </View>
    </TouchableOpacity>

    <FlatList
    style={{marginVertical:10}}
      data={cartItems}
      keyExtractor={item => item.productId}
      renderItem={itemData => (
        <CartItem
          quantity={itemData.item.quantity}
          title={itemData.item.productTitle}
          amount={itemData.item.sum}
          deletable
          onRemove={() => {
            dispatch(cartActions.removeFromCart(itemData.item.productId));
          }}
          onChangeTableNo={(tno)=>setTableno(tno)}
        />
      )}
    />
    
        {isCard && <CreditCardInput
          autoFocus

          requiresName
          requiresCVC
          requiresPostalCode

          labelStyle={styles.label}
          inputStyle={styles.input}
          validColor={"black"}
          invalidColor={"red"}
          placeholderColor={"darkgray"}

          onFocus={_onFocus}
          onChange={_onChange} />}

          

      <Card style={styles.summary}>
      
        <Text style={styles.summaryText}>
          Total:{' '}
          <Text style={styles.amount}>
            Rs{Math.round(cartTotalAmount.toFixed(2) * 100) / 100}
          </Text>
        </Text>

      

      <Text style={styles.title}>Table No</Text>
      <TextInput style={{borderColor:"darkblue",borderWidth:1.5,width:"80%",marginTop:3,marginBottom:5}} onChangeText={setTableno} />
        {isLoading ? (
          <ActivityIndicator size="small" color={Colors.primary} />
        ) : (
          <Button
            color='darkblue'
            title="Order Now"
            disabled={cartItems.length === 0}
            onPress={sendOrderHandler}
          />
        
        )}
        
      </Card>
      
     
    </View>
  );
};

CartScreen.navigationOptions = {
  headerTitle: 'Your Cart'
};

const styles = StyleSheet.create({
  screen: {
    margin: 20
  },
  summary: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
    padding: 10
  },
  summaryText: {
    fontFamily: 'open-sans-bold',
    fontSize: 18
  },
  amount: {
    color: Colors.primary
  },

  switch: {
    alignSelf: "center",
    marginTop: 20,
    marginBottom: 20,
  },
  container: {
    backgroundColor: "#F5F5F5",
    marginTop: 60,
  },
  label: {
    color: "black",
    fontSize: 12,
  },
  input: {
    fontSize: 16,
    color: "black",
  },
});

export default CartScreen;
