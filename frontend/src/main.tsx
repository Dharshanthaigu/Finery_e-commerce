import React from "react";
import ReactDOM from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";
import App from "./App";
import "./index.css";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: "#1a1a2e",
            color: "#fff",
            borderRadius: "10px",
            border: "1px solid rgba(255,255,255,0.1)",
          },
          success: { iconTheme: { primary: "#00d4aa", secondary: "#fff" } },
          error: { iconTheme: { primary: "#ff6b6b", secondary: "#fff" } },
        }}
      />
      <App />
    </QueryClientProvider>
  </React.StrictMode>
);