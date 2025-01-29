import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { CacheProvider } from '@emotion/react';
import createCache from '@emotion/cache';
import App from "./App";

const cache = createCache({ key: 'mui', prepend: true });

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <CacheProvider value={cache}>
        <App />
      </CacheProvider>
    </BrowserRouter>
  </React.StrictMode>
);
