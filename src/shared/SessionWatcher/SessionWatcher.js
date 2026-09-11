import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import toast from 'react-hot-toast';
import { authActions } from '@/store/authSlice';
import { LOGIN_PATH } from '@/utils/routes';

// Watches for the 401-on-expired-token flag the axios interceptor sets and
// redirects through the router instead of axiosClient forcing a full page
// reload. A hard reload used to re-fetch the JS bundle and every font file,
// replay the boot splash, and silently drop any pizza in progress, since
// pizzaSlice lives in memory only and nothing persists it across a reload.
const SessionWatcher = () => {
  const sessionExpired = useSelector((state) => state.auth.sessionExpired);
  const dispatch = useDispatch();
  const history = useHistory();

  useEffect(() => {
    if (!sessionExpired) return;
    toast.error('Your session has ended. Please log in again.');
    dispatch(authActions.reset());
    history.push(LOGIN_PATH);
  }, [sessionExpired, dispatch, history]);

  return null;
};

export default SessionWatcher;
