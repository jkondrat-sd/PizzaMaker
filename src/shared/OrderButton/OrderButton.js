import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import toast from 'react-hot-toast';
import { isPizzaEmpty } from '@/store/pizzaHubSlice';
import { pizzaActions } from '@/store/pizzaSlice';
import { CHECKOUT_PATH, LOGIN_PATH } from '@/utils/routes';
import { SLICE_ONCE_NAV_DELAY_MS } from '@/features/pizza/PizzaCanvas/PizzaCanvas';
import Button from '@/shared/Button/Button';
import styles from './orderButton.module.css';

const OrderButton = (props) => {
  const pizzahubState = useSelector((state) => state.pizzaHub);
  const loggedIn = useSelector((state) => state.auth.loggedIn);
  const isSlicing = useSelector((state) => state.pizza.isSlicing);
  const baseState = pizzahubState.base;
  const toppingsState = pizzahubState.toppings;
  const orderState = { base: baseState, toppings: toppingsState };
  const dispatch = useDispatch();
  const history = useHistory();
  const navTimerRef = useRef(null);

  // If this component unmounts mid-transition (e.g. the user navigates away
  // some other way during the ~1s cut animation), don't fire a late,
  // surprising redirect on top of wherever they went instead.
  useEffect(() => () => clearTimeout(navTimerRef.current), []);

  // Play the slice-apart animation on the builder's own pizza first, then
  // navigate — so the user actually sees the cut before landing on checkout,
  // instead of it happening on a page they've already left.
  const OrderSubmitHandler = () => {
    if (isSlicing) return; // already mid-transition — ignore a repeat click
    // Building a pizza needs no account, but placing one does. The button
    // stays enabled either way — a dead, unexplained disabled button gave a
    // guest no idea why nothing happened. Clicking it now always does
    // something: proceed, or go log in.
    if (!loggedIn) {
      toast.error('Log in to place your order.');
      history.push(LOGIN_PATH);
      return;
    }
    dispatch(pizzaActions.startSlicing());
    navTimerRef.current = setTimeout(() => {
      history.push(CHECKOUT_PATH);
      dispatch(pizzaActions.stopSlicing());
    }, SLICE_ONCE_NAV_DELAY_MS);
  };
  const empty = isPizzaEmpty(orderState);
  return (
    <Button
      className={`${styles.orderButton} ${!empty ? styles.pulse : ''}`}
      type='submit'
      value='Order'
      onClick={OrderSubmitHandler}
      disabled={empty || isSlicing}
    >
      Order
    </Button>
  );
};

export default OrderButton;
