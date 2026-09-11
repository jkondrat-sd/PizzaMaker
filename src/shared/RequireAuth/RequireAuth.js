import { useSelector } from 'react-redux';
import { Redirect, Route } from 'react-router-dom';
import { LOGIN_PATH } from '@/utils/routes';

// Drop-in replacement for <Route> on any path that needs a session. Only the
// Order button checked `loggedIn` before this — typing /dashboard/orders (or
// /checkout, /profile) directly bypassed that check entirely and rendered
// the page against an empty/guest-less state instead of asking for a login.
const RequireAuth = ({ component: Component, ...rest }) => {
  const loggedIn = useSelector((state) => state.auth.loggedIn);
  return (
    <Route
      {...rest}
      render={(props) =>
        loggedIn ? <Component {...props} /> : <Redirect to={LOGIN_PATH} />
      }
    />
  );
};

export default RequireAuth;
