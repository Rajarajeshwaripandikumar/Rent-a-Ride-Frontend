// src/main.jsx
import ReactDOM from "react-dom/client";
import App from "./App.jsx";

// ✅ Bootstrap (from npm)
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";

// ✅ (Optional) Bootstrap Icons – only if you installed it via npm
// npm install bootstrap-icons
// import "bootstrap-icons/font/bootstrap-icons.css";

// ✅ Your own styles (Tailwind / custom)
import "./index.css";

import { Provider } from "react-redux";
import { persistor, store } from "./redux/store.js";
import { PersistGate } from "redux-persist/integration/react";

ReactDOM.createRoot(document.getElementById("root")).render(
  <Provider store={store}>
    <PersistGate persistor={persistor} loading={null}>
      <App />
    </PersistGate>
  </Provider>
);
