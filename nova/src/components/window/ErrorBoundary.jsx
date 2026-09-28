import React from 'react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
    this.setState({ error, errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center h-full w-full bg-red-900/90 text-white p-6 font-mono text-sm overflow-auto">
          <h2 className="text-xl font-bold mb-4">Application Crashed</h2>
          <p className="mb-2">An error occurred in this window.</p>
          <pre className="bg-black/50 p-4 rounded text-red-200 whitespace-pre-wrap text-left w-full max-w-2xl">
            {this.state.error && this.state.error.toString()}
            <br />
            {this.state.errorInfo && this.state.errorInfo.componentStack}
          </pre>
        </div>
      );
    }
    return this.props.children;
  }
}
