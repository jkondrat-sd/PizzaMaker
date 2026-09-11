import { Client } from '@stomp/stompjs';
import { useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import SockJS from 'sockjs-client';
import { API_BASE } from '@/config/apiBase';

const WS_URL = `${API_BASE}/ws`;

/**
 * Subscribes to /user/queue/orders over STOMP/SockJS.
 * The JWT is sent in the CONNECT headers so the server can establish a
 * user principal and route only this user's status updates here.
 * Automatically reconnects on disconnect.
 */
const useOrderUpdates = (onUpdate) => {
  const loggedIn = useSelector((state) => state.auth.loggedIn);
  const onUpdateRef = useRef(onUpdate);

  useEffect(() => { onUpdateRef.current = onUpdate; }, [onUpdate]);

  useEffect(() => {
    // Nothing to subscribe to when logged out, and connecting anyway would
    // send an empty bearer token that the server rejects on every retry.
    if (!loggedIn) return undefined;

    const client = new Client({
      webSocketFactory: () => new SockJS(WS_URL),
      reconnectDelay: 5000,
      // Read fresh on every (re)connect attempt rather than once at mount, so
      // a token refreshed or invalidated between reconnects is picked up
      // instead of the socket retrying forever with a stale credential.
      beforeConnect: () => {
        client.connectHeaders = {
          Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
        };
      },
      onConnect: () => {
        client.subscribe('/user/queue/orders', (message) => {
          try {
            const update = JSON.parse(message.body);
            onUpdateRef.current(update);
          } catch (e) {
            console.error('WS parse error', e);
          }
        });
      },
      onStompError: (frame) => {
        console.warn('STOMP error', frame);
      },
    });

    client.activate();

    return () => { client.deactivate(); };
  }, [loggedIn]); // reconnect on login, tear down on logout
};

export default useOrderUpdates;
