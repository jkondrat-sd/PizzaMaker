import { combineReducers, configureStore } from '@reduxjs/toolkit';
import navigationSlice from './navigationSlice';
import orderSlice from './orderSlice';
import pizzaHubSlice from './pizzaHubSlice';
import pizzaSlice from './pizzaSlice';
import uiSlice from './uiSlice';
import authSlice from './authSlice';

const appReducer = combineReducers({
  navigation: navigationSlice.reducer,
  pizzaHub: pizzaHubSlice.reducer,
  pizza: pizzaSlice.reducer,
  auth: authSlice.reducer,
  order: orderSlice.reducer,
  ui: uiSlice.reducer,
});

export const RESET_APP = 'app/reset';
// Dispatch to wipe every slice back to its first-load defaults: the pizza
// being built, its step in the hub, any open menu, the current/past orders.
// Logout used to only clear `auth`, so the builder and dashboard kept
// whatever the previous session left them in — including topping overrides
// that no longer matched what was on screen, which is what broke dragging.
export const resetApp = () => ({ type: RESET_APP });

const rootReducer = (state, action) => {
  if (action.type === RESET_APP) {
    const fresh = appReducer(undefined, action);
    // sizePricing is fetched from the backend on boot, not user flow state —
    // PizzaHub doesn't remount on logout, so nothing re-fetches it, and
    // resetting it would silently fall back to placeholder prices.
    state = { ...fresh, navigation: { ...fresh.navigation, sizePricing: state.navigation.sizePricing } };
    return state;
  }
  return appReducer(state, action);
};

const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware(),
});

export default store;
