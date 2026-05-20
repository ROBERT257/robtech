type SessionExpiredListener = (message: string) => void;

const listeners = new Set<SessionExpiredListener>();

export function onSessionExpired(listener: SessionExpiredListener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function emitSessionExpired(message = 'Your session expired') {
  listeners.forEach((listener) => {
    try {
      listener(message);
    } catch (_error) {
      // ignore listener failures
    }
  });
}
