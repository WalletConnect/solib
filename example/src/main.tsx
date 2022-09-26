import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { getDefaultConnectors, init } from "lanakit";
import "./index.css";

init({ connectors: getDefaultConnectors() });

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
