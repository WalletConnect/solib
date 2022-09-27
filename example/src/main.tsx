import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { getDefaultConnectors, init } from "solib";
import "./index.css";

init({ connectors: getDefaultConnectors(), chosenCluster: "devnet" });

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
