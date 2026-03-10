import React from 'react';

interface Props extends React.PropsWithChildren {
  resetQueryCache?: boolean;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export default class ErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('[ErrorBoundary]', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          height: '100%', flexDirection: 'column', gap: 14,
          background: '#0b0f1a', color: '#f87171',
          fontFamily: "'Segoe UI', system-ui, sans-serif",
        }}>
          <span style={{ fontSize: 40 }}>⚠</span>
          <span style={{ fontWeight: 700, fontSize: 16 }}>Algo salió mal</span>
          <span style={{ fontSize: 12, color: '#64748b', maxWidth: 340, textAlign: 'center' }}>
            {this.state.error?.message}
          </span>
          <button
            onClick={() => this.setState({ hasError: false })}
            style={{
              background: '#ef444420', border: '1px solid #ef4444', borderRadius: 8,
              padding: '7px 18px', color: '#f87171', cursor: 'pointer', fontSize: 13,
            }}
          >
            Reintentar
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
