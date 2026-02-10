import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { getUserFacingError } from '@/utils/userFacingError';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  errorMessage: string;
  errorDetails?: string;
}

/**
 * React error boundary component that catches runtime errors and displays
 * a user-friendly fallback screen with reload button, preventing blank/white screens.
 * Hardened to handle known production/runtime failures including draft-editor disallowed origin errors.
 */
export class AppErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      errorMessage: '',
      errorDetails: undefined,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    const { userMessage } = getUserFacingError(error);
    
    return {
      hasError: true,
      errorMessage: userMessage,
      errorDetails: error.message,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('AppErrorBoundary caught an error:', error, errorInfo);
    
    // Enhanced logging for draft preview issues
    if (error.message.includes('disallowed origin')) {
      console.error('[AppErrorBoundary] Draft editor security error detected:', error);
      console.error('[AppErrorBoundary] This error should be prevented by the draft preview blocker');
    }
    
    // Log script injection errors
    if (error.message.includes('script') || error.message.includes('Script')) {
      console.error('[AppErrorBoundary] Script-related error:', error.message);
    }
    
    // Log component stack for debugging
    console.error('[AppErrorBoundary] Component stack:', errorInfo.componentStack);
  }

  handleReload = () => {
    // Clear any cached state before reload
    try {
      sessionStorage.clear();
    } catch (e) {
      console.warn('Could not clear sessionStorage:', e);
    }
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-background">
          <Card className="max-w-md w-full">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-destructive/10">
                  <AlertTriangle className="h-6 w-6 text-destructive" />
                </div>
                <div>
                  <CardTitle>Something went wrong</CardTitle>
                  <CardDescription>
                    The application encountered an unexpected error
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-muted rounded-lg p-4">
                <p className="text-sm text-foreground">
                  {this.state.errorMessage}
                </p>
                {this.state.errorDetails && (
                  <details className="mt-2">
                    <summary className="text-xs text-muted-foreground cursor-pointer hover:text-foreground">
                      Technical details
                    </summary>
                    <pre className="mt-2 text-xs text-muted-foreground overflow-auto max-h-32">
                      {this.state.errorDetails}
                    </pre>
                  </details>
                )}
              </div>
              <Button
                onClick={this.handleReload}
                className="w-full"
                size="lg"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Reload Application
              </Button>
              <p className="text-xs text-muted-foreground text-center">
                If this error persists, try clearing your browser cache
              </p>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}
