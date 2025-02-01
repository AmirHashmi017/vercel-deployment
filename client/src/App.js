import React, { useState, useEffect } from 'react'; // Import useState and useEffect
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css'; // Import your CSS file
import LoginRegisterForm from "./Components/LoginRegistrationForm";
import PassengerForms from "./Components/BookingForm";
import FlightSearch from './Components/Home';
import Checkout from './Components/CheckoutPage';
import YourBookings from './Components/YourBookings';

const App = () => {
  return (
    <Router>
    <Routes>
      <Route path="/" element={<FlightSearch />} />
      <Route path="/login" element={<LoginRegisterForm />} />
      <Route path="/bookflight" element={<PassengerForms />} />
      <Route path="/checkout" element={<Checkout />} />
      <Route path="/yourbookings" element={<YourBookings />} />
    </Routes>
    </Router>
  );
};

export default App;

