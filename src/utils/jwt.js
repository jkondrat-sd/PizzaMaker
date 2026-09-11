// Reads the exp claim without verifying the signature. The server is still the
// authority; this only stops the client from rendering a session it knows is dead.
export const isTokenExpired = (token) => {
  try {
    const [, payload] = token.split('.');
    const { exp } = JSON.parse(
      atob(payload.replace(/-/g, '+').replace(/_/g, '/')),
    );
    return typeof exp !== 'number' || exp * 1000 <= Date.now();
  } catch (_) {
    return true;
  }
};
