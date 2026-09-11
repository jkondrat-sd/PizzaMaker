import { createSlice } from '@reduxjs/toolkit';

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    loggedIn: false,
    uid: '',
    firstName: '',
    emailId: '',
    userType: '',
    // Set when a request 401s on an expired/invalid token. A top-level
    // component watches this to redirect via the router instead of a hard
    // page reload. Cleared on the next successful login/logout.
    sessionExpired: false,
  },
  reducers: {
    setLoggedIn(state, action) {
      state.loggedIn = action.payload;
    },
    setUid(state, action) {
      state.uid = action.payload;
    },
    setFirstName(state, action) {
      state.firstName = action.payload;
    },
    setEmailId(state, action) {
      state.emailId = action.payload;
    },
    setUserType(state, action) {
      state.userType = action.payload;
    },
    sessionExpired(state) {
      state.loggedIn = false;
      state.uid = '';
      state.firstName = '';
      state.emailId = '';
      state.userType = '';
      state.sessionExpired = true;
    },
    reset(state) {
      state.loggedIn = false;
      state.uid = '';
      state.firstName = '';
      state.emailId = '';
      state.userType = '';
      state.sessionExpired = false;
    },
  },
});

export const authActions = authSlice.actions;

export default authSlice;
