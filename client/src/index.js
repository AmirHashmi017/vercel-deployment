import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { UserProvider } from './context/UserContext';  // Import UserContext provider
import { PassengerProvider } from "./context/PassengerContext";
import { FlightProvider } from "./context/FlightContext";
import { BookingProvider } from './context/BookingContext';
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BookingProvider>
    <FlightProvider>
    <PassengerProvider>
    <UserProvider>  {/* Wrap App with UserContext.Provider */}
      <App />
    </UserProvider>
    </PassengerProvider>
    </FlightProvider>
    </BookingProvider>
  </React.StrictMode>
);

reportWebVitals();
