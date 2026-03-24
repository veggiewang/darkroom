import { Component } from 'react';
import type { ReactNode, ErrorInfo } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught:", error, errorInfo);
    this.setState({ errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ 
          padding: '40px', 
          background: '#18181b', 
          color: '#fafafa', 
          minHeight: '100vh',
          fontFamily: 'monospace'
        }}>
          <h1 style={{ color: '#ef4444', fontSize: '24px', marginBottom: '16px' }}>
            ⚠️ 页面渲染崩溃
          </h1>
          <div style={{ 
            background: '#0a0a0a', 
            padding: '20px', 
            borderRadius: '8px', 
            border: '1px solid #333',
            marginBottom: '16px',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-all',
            fontSize: '14px'
          }}>
            <p style={{ color: '#f97316', marginBottom: '8px' }}>
              <strong>Error:</strong> {this.state.error?.message}
            </p>
            <p style={{ color: '#71717a', fontSize: '12px' }}>
              <strong>Stack:</strong><br/>
              {this.state.error?.stack}
            </p>
            {this.state.errorInfo && (
              <p style={{ color: '#71717a', fontSize: '12px', marginTop: '12px' }}>
                <strong>Component Stack:</strong><br/>
                {this.state.errorInfo.componentStack}
              </p>
            )}
          </div>
          <button 
            onClick={() => window.location.reload()} 
            style={{ 
              padding: '10px 24px', 
              background: '#fff', 
              color: '#000', 
              border: 'none', 
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: '14px'
            }}
          >
            刷新页面
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
