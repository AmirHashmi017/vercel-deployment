import React, { useState, useEffect } from 'react';
import './BookingForm.css';
import { usePassengers } from "../context/PassengerContext";
import { useFlight } from "../context/FlightContext";
import { useBooking } from '../context/BookingContext';

const TITLES = ['Mr.', 'Ms.', 'Mrs.', 'Miss', 'Dr.'];
const GENDERS = ['Male', 'Female'];

function calculateAge(birthDate) {
  if (!birthDate) return null;
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}

const validatePhoneNumber = (phone) => {
  const phoneRegex = /^\+[1-9]\d{1,14}$/;
  return phoneRegex.test(phone);
};

function validateEmail(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

function PassengerForm({ type, index, totalOfType, passenger, onUpdate }) {
  const [dateError, setDateError] = useState('');
  const [formErrors, setFormErrors] = useState({});

  const handleChange = (field, value) => {
    if (field === 'born_on') {
      const age = calculateAge(value);
      if (type === 'adult' && age < 18) {
        setDateError('Adult passengers must be at least 18 years old.');
      } else if (passenger.age && age !== parseInt(passenger.age)) {
        setDateError(`Date of birth does not match the selected age of ${passenger.age} years. Based on birth date, age should be ${age} years.`);
      } else {
        setDateError('');
      }
    }

    if (field === 'email' && !validateEmail(value)) {
      setFormErrors((prev) => ({ ...prev, email: 'Invalid email address' }));
    } else {
      setFormErrors((prev) => ({ ...prev, email: '' }));
    }

    if (field === 'phone_number' && !validatePhoneNumber(value)) {
      setFormErrors((prev) => ({ ...prev, phone_number: 'Phone number must start with a + and follow international format' }));
    } else {
      setFormErrors((prev) => ({ ...prev, phone_number: '' }));
    }

    const formattedValue = field === 'title' ? value.toLowerCase().replace('.', '') :
      field === 'gender' ? value.toLowerCase().charAt(0) :
        value;

    onUpdate({
      ...passenger,
      [field]: formattedValue,
    });
  };

  const validateField = (field, value) => {
    if (!value) {
      setFormErrors((prev) => ({ ...prev, [field]: 'This field is required' }));
      return false;
    }
    return true;
  };

  const handleBlur = (field, value) => {
    validateField(field, value);
  };

  const getPassengerTypeLabel = () => {
    if (type === 'adult') return 'Adult';
    const age = passenger.age ? parseInt(passenger.age) : null;
    if (age !== null && age <= 1) return 'Infant';
    return 'Child';
  };

  return (
    <div className="passenger-form">
      <div className="passenger-type-label">
        {getPassengerTypeLabel()} {totalOfType}
      </div>
      {/* Rest of the form remains the same */}
      <div className="form-section">
        <h2>Personal details</h2>
        <div className="form-row">
          {/* Title field */}
          <div className="form-group">
            <label>Title *</label>
            <select
              value={passenger.title || 'mr'}
              onChange={(e) => handleChange('title', e.target.value)}
              onBlur={(e) => handleBlur('title', e.target.value)}
              className="form-select"
              required
            >
              {TITLES.map((title) => (
                <option key={title} value={title.toLowerCase().replace('.', '')}>
                  {title}
                </option>
              ))}
            </select>
            {formErrors.title && <span className="error-message">{formErrors.title}</span>}
          </div>

          {/* Given name field */}
          <div className="form-group">
            <label>Given name *</label>
            <input
              type="text"
              value={passenger.given_name || ''}
              onChange={(e) => handleChange('given_name', e.target.value)}
              onBlur={(e) => handleBlur('given_name', e.target.value)}
              className="form-input"
              placeholder="Enter given name"
              required
            />
            {formErrors.given_name && <span className="error-message">{formErrors.given_name}</span>}
          </div>

          {/* Family name field */}
          <div className="form-group">
            <label>Family name *</label>
            <input
              type="text"
              value={passenger.family_name || ''}
              onChange={(e) => handleChange('family_name', e.target.value)}
              onBlur={(e) => handleBlur('family_name', e.target.value)}
              className="form-input"
              placeholder="Enter family name"
              required
            />
            {formErrors.family_name && <span className="error-message">{formErrors.family_name}</span>}
          </div>
        </div>

        <div className="form-row">
          {/* Date of birth field */}
          <div className="form-group">
            <label>Date of birth *</label>
            <input
              type="date"
              value={passenger.born_on || ''}
              onChange={(e) => handleChange('born_on', e.target.value)}
              onBlur={(e) => handleBlur('born_on', e.target.value)}
              className={`form-input ${dateError ? 'error' : ''}`}
              max={new Date().toISOString().split('T')[0]}
              required
            />
            {dateError && <span className="error-message">{dateError}</span>}
            {formErrors.born_on && <span className="error-message">{formErrors.born_on}</span>}
          </div>

          {/* Gender field */}
          <div className="form-group">
            <label>Gender *</label>
            <select
              value={passenger.gender === 'm' ? 'Male' : 'Female'}
              onChange={(e) => handleChange('gender', e.target.value)}
              onBlur={(e) => handleBlur('gender', e.target.value)}
              className="form-select"
              required
            >
              {GENDERS.map((gender) => (
                <option key={gender} value={gender}>
                  {gender}
                </option>
              ))}
            </select>
            {formErrors.gender && <span className="error-message">{formErrors.gender}</span>}
          </div>

          {/* Email field */}
          <div className="form-group">
            <label>Email *</label>
            <input
              type="email"
              value={passenger.email || ''}
              onChange={(e) => handleChange('email', e.target.value)}
              onBlur={(e) => handleBlur('email', e.target.value)}
              className="form-input"
              placeholder="Enter email"
              required
            />
            {formErrors.email && <span className="error-message">{formErrors.email}</span>}
          </div>
        </div>

        <div className="form-row">
          {/* Phone number field */}
          <div className="form-group">
            <label>Phone number *</label>
            <input
              type="tel"
              value={passenger.phone_number || ''}
              onChange={(e) => handleChange('phone_number', e.target.value)}
              onBlur={(e) => handleBlur('phone_number', e.target.value)}
              className="form-input"
              placeholder="+1234567890 (include +)"
              required
            />
            {formErrors.phone_number && <span className="error-message">{formErrors.phone_number}</span>}
          </div>
        </div>
      </div>
    </div>
  );
}

function PassengerForms() {
  const [formErrors, setFormErrors] = useState([]);
  const [passengersInfo, setPassengersInfo] = useState([]);
  const { selectedFlight } = useFlight();
  const { passengers } = usePassengers();
  const { setBooking } = useBooking();

  useEffect(() => {
    // Initialize passengers with their IDs and types
    const updatedPassengersInfo = passengers.map((passenger, index) => {
      const isInfant = passenger.age && parseInt(passenger.age) <= 1;
      return {
        ...passenger,
        id: selectedFlight.passengers[index].passengerId,
        title: passenger.title || 'mr',
        gender: passenger.gender || 'm',
        isInfant
      };
    });
    setPassengersInfo(updatedPassengersInfo);
  }, [passengers, selectedFlight]);

  const updatePassenger = (index, updatedPassenger) => {
    const newPassengersInfo = [...passengersInfo];
    newPassengersInfo[index] = {
      ...newPassengersInfo[index],
      ...updatedPassenger,
    };
    setPassengersInfo(newPassengersInfo);
  };

  const validateForm = () => {
    const errors = [];
    const infantAssignments = new Map(); // Track which adult is assigned which infant

    // First, validate all basic fields
    passengersInfo.forEach((passenger, index) => {
      // Basic validation remains the same
      if (!passenger.title) errors.push(`Passenger ${index + 1}: Title is required`);
      if (!passenger.given_name) errors.push(`Passenger ${index + 1}: Given name is required`);
      if (!passenger.family_name) errors.push(`Passenger ${index + 1}: Family name is required`);
      if (!passenger.born_on) errors.push(`Passenger ${index + 1}: Date of birth is required`);
      if (!passenger.gender) errors.push(`Passenger ${index + 1}: Gender is required`);
      if (!passenger.email) errors.push(`Passenger ${index + 1}: Email is required`);
      if (!validateEmail(passenger.email)) errors.push(`Passenger ${index + 1}: Invalid email address`);
      if (!passenger.phone_number) errors.push(`Passenger ${index + 1}: Phone number is required`);
      if (!validatePhoneNumber(passenger.phone_number)) errors.push(`Invalid Phone number`);

      const age = calculateAge(passenger.born_on);
      if (passenger.type === 'adult') {
        if (age < 18) {
          errors.push(`Passenger ${index + 1}: Adult passengers must be at least 18 years old`);
        }
      }
      if (passenger.age !== undefined) {
        const selectedAge = parseInt(passenger.age);
        if (age !== selectedAge) {
          errors.push(`Passenger ${index + 1}: Date of birth does not match the selected age`);
        }
      }
    });

    setFormErrors(errors);
    return errors.length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      // Separate adults and infants
      const adults = passengersInfo.filter(p => p.type === 'adult');
      const infants = passengersInfo.filter(p => p.age && parseInt(p.age) <= 1);
      const children = passengersInfo.filter(p => p.age && parseInt(p.age) > 1);

      // Assign infants to adults (one infant per adult)
      const assignedPassengers = adults.map((adult, index) => {
        const infantToAssign = infants[index];
        return {
          ...adult,
          infant_passenger_id: infantToAssign ? infantToAssign.id : undefined
        };
      });

      // Add remaining passengers (children)
      const allPassengers = [
        ...assignedPassengers,
        ...infants,
        ...children
      ];

      const payload = {
        data: {
          selected_offers: [selectedFlight.offerId],
          payments: [
            {
              type: "balance",
              currency: "GBP",
              amount: selectedFlight.price,
            },
          ],
          passengers: allPassengers.map(passenger => ({
            phone_number: passenger.phone_number,
            email: passenger.email,
            born_on: passenger.born_on,
            title: passenger.title,
            gender: passenger.gender,
            family_name: passenger.family_name,
            given_name: passenger.given_name,
            id: passenger.id,
            infant_passenger_id: passenger.infant_passenger_id
          }))
        }
      };

      setBooking(payload);
      console.log(payload);
    }
  };

  // Count passengers by type for proper numbering
  const getPassengerNumber = (type, index) => {
    const passengersByType = passengersInfo.slice(0, index + 1).filter(p => {
      if (type === 'adult') return p.type === 'adult';
      if (type === 'infant') return p.age && parseInt(p.age) <= 1;
      return p.age && parseInt(p.age) > 1;
    });
    return passengersByType.length;
  };

  return (
    <form onSubmit={handleSubmit} className="passenger-details">
      {formErrors.length > 0 && (
        <div className="form-errors">
          {formErrors.map((error, index) => (
            <div key={index} className="error-message">{error}</div>
          ))}
        </div>
      )}

      <div className="passenger-forms">
        {passengersInfo.map((passenger, index) => (
          <PassengerForm
            key={index}
            type={passenger.type}
            index={index}
            totalOfType={getPassengerNumber(
              passenger.type === 'adult' ? 'adult' : 
              (passenger.age && parseInt(passenger.age) <= 1) ? 'infant' : 'child',
              index
            )}
            passenger={passenger}
            onUpdate={(updatedPassenger) => updatePassenger(index, updatedPassenger)}
          />
        ))}
      </div>

      <button type="submit" className="submit-button">
        Checkout
      </button>
    </form>
  );
}

export default PassengerForms;