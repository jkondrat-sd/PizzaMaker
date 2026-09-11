import toast from 'react-hot-toast';

// Axios sets err.code on a timeout ('ECONNABORTED') or a network failure
// ('ERR_NETWORK'), and leaves err.response undefined either way since nothing
// ever came back. Distinguishing this from a real server response matters —
// "Login failed, check your credentials" is actively misleading when the
// truth is the request never reached the server at all.
export const isUnreachable = (err) =>
  !err?.response && (err?.code === 'ECONNABORTED' || err?.code === 'ERR_NETWORK' || !!err?.request);

export const unreachableMessage =
  "Couldn't reach the server. It may still be waking up — please try again in a moment.";

// Shows an error toast for a failed request, with a Retry button when a retry
// function is given. Used at call sites (login, placing an order) where a
// cold-start timeout or a genuinely dead backend previously failed silently
// or with a misleading message, leaving no way to try again short of
// reloading the page.
export const toastApiError = (err, { fallback, onRetry } = {}) => {
  const message = isUnreachable(err)
    ? unreachableMessage
    : err?.response?.data?.error || fallback || 'Something went wrong. Please try again.';

  if (!onRetry) {
    toast.error(message);
    return;
  }

  toast((t) => (
    <span style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      {message}
      <button
        type='button'
        onClick={() => {
          toast.dismiss(t.id);
          onRetry();
        }}
        style={{
          background: 'rgba(255, 107, 0, 0.18)',
          border: '1px solid rgba(255, 107, 0, 0.5)',
          borderRadius: 6,
          color: '#fff',
          padding: '4px 10px',
          cursor: 'pointer',
          flexShrink: 0,
        }}
      >
        Retry
      </button>
    </span>
  ), { duration: 8000 });
};
