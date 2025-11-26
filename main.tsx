import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { NexusProvider } from "./context/NexusContext";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <NexusProvider>
      <App />
    </NexusProvider>
  </React.StrictMode>
);

