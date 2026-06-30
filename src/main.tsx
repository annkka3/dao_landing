import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClientProvider } from "@tanstack/react-query";
import App from "./App";
import { queryClient } from "./store/queryClient";
import { AppProvider } from "./store/AppContext";
import { ErrorBoundary } from "./shared/ui/ErrorBoundary/ErrorBoundary";
import { NotificationProvider } from "./shared/notifications/NotificationProvider";
import { ThemeProvider } from "./shared/theme/ThemeProvider";
import { LandingPage } from "./pages/LandingPage/LandingPage";
import { LandingStoryPage } from "./pages/LandingStoryPage/LandingStoryPage";
import "./shared/styles/typography.css";
import "./shared/styles/tokens.css";
import { getWebApp } from "./telegram/webapp";

const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("Root element not found");
}
const rootContainer = rootElement;

const publicLandingRoutes = new Set(["/landing", "/landing-classic", "/landing-story"]);
const isLandingRoute = publicLandingRoutes.has(window.location.pathname);

function loadTelegramSdk(): Promise<void> {
  if (window.Telegram?.WebApp) return Promise.resolve();

  return new Promise((resolve) => {
    const existing = document.querySelector<HTMLScriptElement>('script[src="https://telegram.org/js/telegram-web-app.js"]');
    if (existing) {
      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener("error", () => resolve(), { once: true });
      window.setTimeout(resolve, 2500);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://telegram.org/js/telegram-web-app.js";
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => resolve();
    document.head.appendChild(script);
    window.setTimeout(resolve, 2500);
  });
}

async function bootstrap() {
  if (!isLandingRoute) {
    await loadTelegramSdk();
    const webApp = getWebApp();
    webApp?.ready();
    webApp?.expand();
  }

  createRoot(rootContainer).render(
    <StrictMode>
      <ErrorBoundary>
        {window.location.pathname === "/landing-story" || (window.location.pathname === "/landing" && window.matchMedia("(max-width: 900px)").matches) ? (
          <LandingStoryPage />
        ) : isLandingRoute ? (
          <LandingPage />
        ) : (
          <QueryClientProvider client={queryClient}>
            <ThemeProvider>
              <AppProvider>
                <NotificationProvider>
                  <App />
                </NotificationProvider>
              </AppProvider>
            </ThemeProvider>
          </QueryClientProvider>
        )}
      </ErrorBoundary>
    </StrictMode>
  );
}

void bootstrap();
