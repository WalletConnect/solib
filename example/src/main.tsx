import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { getDefaultConnectors, init } from "solib";
import "./index.css";
import { ColorModeProvider, ChakraProvider } from "@chakra-ui/react";

init({ connectors: getDefaultConnectors(), chosenCluster: "devnet" });

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <ChakraProvider>
      <ColorModeProvider>
        <App />
      </ColorModeProvider>
    </ChakraProvider>
  </React.StrictMode>
);
