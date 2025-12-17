import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

// ⭐ 引入 MUI ThemeProvider
import { ThemeProvider } from "@mui/material/styles";
import theme from "./Theme"; // ⭐ 引入你建立的橘色 theme

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <ThemeProvider theme={theme}> 
      <App />
    </ThemeProvider>
  </React.StrictMode>
);

reportWebVitals();
