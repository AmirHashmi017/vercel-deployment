import React, { useState, useEffect, useRef } from 'react';
import './PassengerSelector.css';
import { usePassengers } from "../context/PassengerContext";

function PassengerSelector() {
    const [modalError, setModalError] = useState("");
    const { setPassengers } = usePassengers();
    const [isOpen, setIsOpen] = useState(false);
    const [adults, setAdults] = useState(1);
    const [children, setChildren] = useState(0);
    const [childAges, setChildAges] = useState([]);
    const [errors, setErrors] = useState({});
    const dropdownRef = useRef(null);
    
    useEffect(() => {
        setPassengers([
            ...Array(adults).fill({ type: "adult" }),
            ...childAges.map(age => ({ age })),
        ]);
    }, [adults, children, childAges]);

    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                if (children > 0 && childAges.some(age => age === '')) {
                    setModalError("Please select the age for all children before closing.");
                    return;
                }
                setIsOpen(false);
                setModalError("");
            }
        }

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [children, childAges]);

    const getInfantCount = () => {
        return childAges.filter(age => age === '0' || age === '1').length;
    };

    const canAddChild = () => {
        return childAges.every(age => age !== '');
    };
  
    const handleIncrement = (type) => {
        if (type === 'adult' && adults < 9) {
            setAdults(adults + 1);
        } else if (type === 'child' && children < 9) {
            if (!canAddChild()) {
                const newErrors = {};
                childAges.forEach((age, index) => {
                    if (age === '') {
                        newErrors[`child${index + 1}`] = true;
                    }
                });
                setErrors(newErrors);
                return;
            }
            setChildren(children + 1);
            setChildAges(prev => [...prev, '']);
            setErrors(prev => ({ ...prev, [`child${children + 1}`]: false }));
        }
    };
  
    const handleDecrement = (type) => {
        if (type === 'adult') {
            const infantCount = getInfantCount();
            if (adults > 1 && (adults - 1) >= infantCount) {
                setAdults(adults - 1);
            } else if (adults > 1) {
                setModalError("Cannot reduce adults below number of infants (ages 0-1)");
                return;
            }
        } else if (type === 'child' && children > 0) {
            setChildren(children - 1);
            setChildAges(prev => prev.slice(0, -1));
            const newErrors = { ...errors };
            delete newErrors[`child${children}`];
            setErrors(newErrors);
        }
    };
  
    const handleChildAgeChange = (index, value) => {
        const newAges = [...childAges];
        const oldAge = newAges[index];
        const wasInfant = oldAge === '0' || oldAge === '1';
        const willBeInfant = value === '0' || value === '1';
        
        // Check if this change would make infants exceed adults
        const currentInfants = getInfantCount();
        const infantDiff = willBeInfant ? (wasInfant ? 0 : 1) : (wasInfant ? -1 : 0);
        
        if (currentInfants + infantDiff > adults) {
            setModalError("Number of infants (ages 0-1) cannot exceed number of adults");
            return;
        }

        newAges[index] = value;
        setChildAges(newAges);
        
        if (value) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[`child${index + 1}`];
                return newErrors;
            });
            setModalError("");
        } else {
            setErrors(prev => ({ ...prev, [`child${index + 1}`]: true }));
        }
    };
  
    const getSummaryText = () => {
        const totalPassengers = adults + children;
        const adultText = adults === 1 ? '1 adult' : `${adults} adults`;
        const childText = children === 0 ? '' : children === 1 ? ' and 1 child' : ` and ${children} children`;
        return `${adultText}${childText}`;
    };
  
    return (
        <div className="passenger-selector" ref={dropdownRef}>
            <button 
                type="button"
                className="selector-button" 
                onClick={() => {
                    if (isOpen) {
                        if (children > 0 && childAges.some(age => age === '')) {
                            setModalError("Please select the age for all children before closing.");
                            return;
                        }
                        setModalError("");
                    }
                    setIsOpen(!isOpen);
                }}
            >
                {getSummaryText()}
                <span className="arrow-down"></span>
            </button>
  
            {isOpen && (
                <div className="dropdown-content">
                    <div className="passenger-type">
                        <div className="passenger-info">
                            <h3>Adults</h3>
                            <span className="age-range">18+</span>
                        </div>
                        <div className="counter">
                            <button 
                                type="button"
                                className={`counter-button ${adults <= 1 || adults <= getInfantCount() ? 'disabled' : ''}`}
                                onClick={() => handleDecrement('adult')}
                                disabled={adults <= 1 || adults <= getInfantCount()}
                            >
                                −
                            </button>
                            <span className="count">{adults}</span>
                            <button 
                                type="button"
                                className={`counter-button ${adults >= 9 ? 'disabled' : ''}`}
                                onClick={() => handleIncrement('adult')}
                                disabled={adults >= 9}
                            >
                                +
                            </button>
                        </div>
                    </div>
  
                    <div className="passenger-type">
                        <div className="passenger-info">
                            <h3>Children</h3>
                            <span className="age-range">0–17</span>
                        </div>
                        <div className="counter">
                            <button 
                                type="button"
                                className={`counter-button ${children <= 0 ? 'disabled' : ''}`}
                                onClick={() => handleDecrement('child')}
                                disabled={children <= 0}
                            >
                                −
                            </button>
                            <span className="count">{children}</span>
                            <button 
                                type="button"
                                className={`counter-button ${children >= 9 || !canAddChild() ? 'disabled' : ''}`}
                                onClick={() => handleIncrement('child')}
                                disabled={children >= 9 || !canAddChild()}
                            >
                                +
                            </button>
                        </div>
                    </div>
  
                    {children > 0 && childAges.map((age, index) => (
                        <div className="child-age" key={index}>
                            <label>
                                Age of child {index + 1} *
                                {modalError && <p className="error-message fade-in">{modalError}</p>}
                                <select 
                                    value={age} 
                                    onChange={(e) => handleChildAgeChange(index, e.target.value)}
                                    className={errors[`child${index + 1}`] ? 'error' : ''}
                                >
                                    <option value="">Select age</option>
                                    {[...Array(18)].map((_, i) => (
                                        <option key={i} value={i}>{i} years</option>
                                    ))}
                                </select>
                                {errors[`child${index + 1}`] && (
                                    <span className="error-message">Please select the passenger's age</span>
                                )}
                            </label>
                        </div>
                    ))}
  
                    {children > 0 && (
                        <p className="info-text">
                            A child's age must be valid for the full duration of journey. For example, if a child has a birthday during a trip please use their age on the date of the returning flight. Infants (ages 0-1) must be accompanied by an adult (one infant per adult).
                        </p>
                    )}
                </div>
            )}
        </div>
    );
}

export default PassengerSelector;