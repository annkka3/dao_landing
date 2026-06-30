import { Component, type ReactNode } from "react";
import { ErrorState } from "../State/ErrorState";
import { Button } from "../Button/Button";

type ViteEnv = { DEV?: boolean };
const isDev = Boolean((import.meta as unknown as { env: ViteEnv }).env.DEV);

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  error: Error | null;
}

/**
 * Top-level render-error boundary. Prevents a blank white screen when
 * bootstrap, auth, or any page render throws an exception that the
 * AppContext bootstrap try/catch can't see (e.g. an error thrown during
 * React's render pass itself, not inside an awaited API call).
 *
 * Never shows secrets (no initData/token) — only a generic message, plus a
 * short error message in dev builds for debugging.
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, info: { componentStack?: string | null }): void {
    // Local devtools console only — never transmitted anywhere.
    console.error("[ErrorBoundary] render crashed:", error, info.componentStack);
  }

  render(): ReactNode {
    if (this.state.error) {
      return (
        <ErrorState
          title="Не удалось загрузить игру"
          message={
            <>
              Проверьте интернет и откройте приложение заново.
              {isDev && (
                <>
                  <br />
                  <span style={{ opacity: 0.5, fontSize: "0.8em" }}>{this.state.error.message}</span>
                </>
              )}
            </>
          }
          action={<Button onClick={() => window.location.reload()}>Открыть заново</Button>}
        />
      );
    }
    return this.props.children;
  }
}
