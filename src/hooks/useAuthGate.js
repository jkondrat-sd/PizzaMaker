import { useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import toast from 'react-hot-toast';
import { LOGIN_PATH } from '@/utils/routes';

// Building a pizza needs no account, but every control in the base, toppings
// and preset panels mutates a pizza that only means something once it can be
// ordered — so a logged-out click prompts login instead of quietly working,
// the same treatment OrderButton already gets.
//
// Returns an onClickCapture handler: capture phase runs before the clicked
// control's own onClick, so nothing downstream (a topping toggle, a size
// button) needs to know or care about auth. Only intercepts clicks that
// actually land on an interactive control, so clicking a heading or blank
// panel space doesn't redirect anyone.
const INTERACTIVE_SELECTOR = 'button, input, select, textarea, [role="button"]';

export const useAuthGate = (message = 'Log in to customize your pizza.') => {
  const loggedIn = useSelector((state) => state.auth.loggedIn);
  const history = useHistory();

  return (e) => {
    if (loggedIn) return;
    if (!e.target.closest(INTERACTIVE_SELECTOR)) return;
    e.preventDefault();
    e.stopPropagation();
    toast.error(message);
    history.push(LOGIN_PATH);
  };
};

export default useAuthGate;
