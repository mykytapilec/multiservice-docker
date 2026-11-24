import { useEffect, useState } from 'react';

type ApiHealthResponse = {
  status: string;
  service: string;
};

type ApiState =
  | { status: 'loading' }
  | { status: 'connected'; data: ApiHealthResponse }
  | { status: 'error'; message: string };

function App() {
  const [apiState, setApiState] = useState<ApiState>({
    status: 'loading',
  });
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    const timer = setTimeout(async () => {
      try {
        const response = await fetch('/api/health', {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(`API request failed with status ${response.status}`);
        }

        const data: ApiHealthResponse = await response.json();

        if (data.status !== 'ok' || data.service !== 'api') {
          throw new Error('Unexpected API response');
        }

        setApiState({ status: 'connected', data });
      } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') {
          return;
        }

        setApiState({
          status: 'error',
          message:
            error instanceof Error
              ? error.message
              : 'An unexpected error occurred',
        });
      }
    }, 0);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [retryCount]);

  return (
    <main className="app">
      <section className="dashboard">
        <h1>Multiservice Docker</h1>
        <p className="subtitle">Frontend and API integration</p>

        <div className="service-card">
          <div className="service-header">
            <h2>API Service</h2>

            <span className={`status-badge ${apiState.status}`}>
              {apiState.status === 'loading' && 'Checking...'}
              {apiState.status === 'connected' && 'Connected'}
              {apiState.status === 'error' && 'Disconnected'}
            </span>
          </div>

          {apiState.status === 'loading' && (
            <p className="service-message">Checking API connection...</p>
          )}

          {apiState.status === 'connected' && (
            <div className="service-details">
              <p>
                <strong>Status:</strong> {apiState.data.status}
              </p>
              <p>
                <strong>Service:</strong> {apiState.data.service}
              </p>
            </div>
          )}

          {apiState.status === 'error' && (
            <p className="error-message">{apiState.message}</p>
          )}

          <button
            className="retry-button"
            onClick={() => {
              setApiState({ status: 'loading' });
              setRetryCount((count) => count + 1);
            }}
            disabled={apiState.status === 'loading'}
          >
            {apiState.status === 'loading' ? 'Checking...' : 'Check connection'}
          </button>
        </div>
      </section>
    </main>
  );
}

export default App;
