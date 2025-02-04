import React, { useEffect, useState } from 'react';
import { useFlight } from "../context/FlightContext";
import axios from "axios";
import './CheckoutPage.css';
import SBFlightCard from './SingleFlightcardB';
import PassengerForms from './BookingForm';
import { useNavigate } from 'react-router-dom';
import { useBooking } from '../context/BookingContext';
import MessageModal from './MessageModal';
import { useUser } from '../context/UserContext'; 

function Checkout() {
    const navigate = useNavigate();
    const [showModal, setShowModal] = useState(false); 
const apiKey = process.env.REACT_APP_DUFFLE_TEST_API_KEY;
    const { selectedFlight } = useFlight();
    const { booking, setBooking } = useBooking();
    const [apiResponse, setApiResponse] = useState(null);
    const [loading, setLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');
    const [error, setError] = useState(null);
    const [message, setMessage] = useState('');
    const { username } = useUser();

    useEffect(() => {
        const handleBeforeUnload = (e) => {
            e.preventDefault();
            e.returnValue = '';
            navigate('/');
        };

        const handleLoad = () => {
            if (performance.navigation.type === 1) {
                alert('Page was reloaded. Redirecting to home page...');
                navigate('/');
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        window.addEventListener('load', handleLoad);

        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
            window.removeEventListener('load', handleLoad);
        };
    }, [navigate]);
    const saveBookingToDatabase = async (orderId) => {
        try {
            await axios.post("https://vercel-deployment-server-wine.vercel.app/bookings", {
                username: username,
                orderid: orderId,
            });
            showMessageModal("Offer Booked Successfully. Redirecting you to Booked Offers.");
            setBooking([])
            navigate('/yourbookings')
            console.log("Booking saved in database successfully.");
        } catch (error) {
            showMessageModal("An error occurred while processing your booking.");
            console.error("Error saving booking to database:", error);
        }
    };
    const submitBooking = async () => {
        if (!booking) {
            console.log("No Booking");
            setError("Booking data is not available.");
            return;
        }

        setLoading(true);
        setLoadingMessage('Processing your booking...');
        setError(null);

        try {
            console.log("API hit");
            console.log(booking)
            const proxyUrl = "https://my-proxy-ruby.vercel.app/proxy";
            const apiUrl = "/air/orders";
            const response = await fetch(proxyUrl + apiUrl,  {
                method: "POST",
                headers: {
                    "Accept-Encoding": "gzip",
                    "Accept": "application/json",
                    "Content-Type": "application/json",
                    "Duffel-Version": "v2",
                    "Authorization": `Bearer ${apiKey}`,
                },
                body: JSON.stringify({
                    data: {
                        selected_offers: [selectedFlight.offerId],
                        payments: [
                            {
                                type: "balance",
                                currency: "GBP",
                                amount: selectedFlight.price,
                            },
                        ],
                        passengers: booking.data.passengers,
                    },
                }),
            });

            if (!response.ok) {
                if (response.status === 422) {
                    showMessageModal("The selected offer is no longer available. Please choose another flight.");
                } else {
                    showMessageModal("Failed to submit booking.");
                }
                return;
            }

            const data = await response.json();
            setApiResponse(data);
            
            const orderId = data.data?.id;
            if (orderId) {
                console.log("Order ID:", orderId);
            }
            await saveBookingToDatabase(orderId)
            navigate('/yourbookings');
        } catch (error) {
            // console.error("Booking failed:", error);
            showMessageModal("Unstable Internet Connection.");
            setError(error.message || "An error occurred while booking.");
            
        } finally {
            setLoading(false);
        }
    };

    const showMessageModal = (modalMessage) => {
        setMessage(modalMessage);
        setShowModal(true);
    };
    
    const handleCloseModal = () => {
        setShowModal(false);
        if (message.includes("Successfully")) {
            // navigate('/booked-offers');
        }
    };

    useEffect(() => {
        console.log("Booking Data:", { booking });
        if (booking ) {
            submitBooking();
        }
    }, [booking]);

    if (!selectedFlight) {
        return null;
    }

    const {
        airlineLogo,
        airlineName,
        segments = [],
        price,
        offerId,
        passengers = [],
        baggage = [],
    } = selectedFlight;

    return (
        <div className="checkout-container">
          {loading && (
            <div className="loading-overlay">
              <div className="loading-content">
                <div className="loading-spinner"></div>
                <p className="loading-text">{loadingMessage}</p>
              </div>
            </div>
          )}
    
          <div className="flight-summary">
            <h1>Selected Offer</h1>
            <SBFlightCard
              airlineLogo={airlineLogo}
              airlineName={airlineName}
              segments={segments}
              price={price}
              offerId={offerId}
              passengers={passengers}
              baggage={baggage}
            />
          </div>
    
          <div className="passenger-formsd">
            <h1>Checkout</h1>
            {showModal && <MessageModal message={message} onClose={handleCloseModal} />}
            <PassengerForms />
          </div>
    
          {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mt-4">{error}</div>}
    
          <button
            className="select-buttons mt-6 mb-8"
            onClick={() => {
              setBooking([])
    
              setTimeout(() => {
                navigate("/") // Navigate after a short delay
              }, 1000) // Adjust delay as needed
            }}
          >
            Go to Search Flights
          </button>
        </div>
      )
    }
    
    export default Checkout