import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import MessageModal from "./MessageModal";
import { useUser } from "../context/UserContext";
import SFlightCard from "./SingleFlightCard";
import "./YourBookings.css";

function YourBookings() {
  const apiKey = process.env.REACT_APP_DUFFLE_TEST_API_KEY;
  const navigate = useNavigate();
  const { username } = useUser();
  const [orderIDs, setOrderIDs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");
  const [error, setError] = useState(null);
  const [message, setMessage] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [orderDetails, setOrderDetails] = useState([]);

  const transformOrderData = (orderData) => {
    const { slices, passengers, total_amount, offer_id, owner } = orderData.data;
  
    const airlineLogo = owner.logo_symbol_url;
    const airlineName = owner.name;
  
    const segments = slices.flatMap((slice) =>
      slice.segments.map((segment) => ({
        departureTime: formatTime(segment.departing_at),
        arrivalTime: formatTime(segment.arriving_at),
        departureDate: formatDate(segment.departing_at),
        arrivalDate: formatDate(segment.arriving_at),
        origin: segment.origin.iata_code,
        destination: segment.destination.iata_code,
        departureAirport: segment.origin.name,
        arrivalAirport: segment.destination.name,
        cabinClass: segment.passengers[0]?.cabin_class_marketing_name || "Economy",
        duration: formatDuration(segment.duration),
      }))
    );
  
    const formattedPassengers = passengers.map((passenger) => ({
      passengerId: passenger.id,
      type: passenger.type,
      age: passenger.type === "child" ? passenger.age : null,
    }));
  
    const baggage = slices.flatMap((slice) =>
      slice.segments.flatMap((segment) =>
        segment.passengers.map((passenger) => ({
          passengerId: passenger.passenger_id,
          checkedBags: passenger.baggages.find((bag) => bag.type === "checked")?.quantity || 0,
          carryOnBags: passenger.baggages.find((bag) => bag.type === "carry_on")?.quantity || 0,
        }))
      )
    );
  
    return {
      airlineLogo,
      airlineName,
      segments,
      price: total_amount,
      offerId: offer_id,
      passengers: formattedPassengers,
      baggage,
    };
  };
  
  const formatTime = (dateTimeString) => {
    if (!dateTimeString) return "N/A";
    const date = new Date(dateTimeString);
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${hours}:${minutes}`;
  };
  
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const options = { year: "numeric", month: "short", day: "numeric" };
    return date.toLocaleDateString("en-US", options);
  };
  
  const formatDuration = (duration) => {
    const regex = /PT(\d+)H(\d+)M/;
    const match = duration.match(regex);
    if (match) {
      return `${match[1]}h ${match[2]}m`;
    }
    return duration;
  };

  const showMessageModal = (modalMessage) => {
    setMessage(modalMessage);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const fetchBookings = async () => {
    if (!username) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setLoadingMessage("Fetching your bookings...");
      setError(null);

      const response = await axios.get(`https://vercel-deployment-server-wine.vercel.app/bookings/${username}`);
      
      if (response.status === 200) {
        const orders = response.data.orders || [];
        setOrderIDs(orders);
        
        if (orders.length === 0) {
          setLoading(false);
          return;
        }

        // Fetch order details immediately after getting order IDs
        await fetchAllOrderDetails(orders);
      }
    } catch (error) {
    //   setError("Failed to fetch your bookings. Please try again later.");
      console.error("Error fetching bookings:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchOrderDetails = async (orderId) => {
    if (!orderId) return null;

    const url = `https://vercel-deployment-server-wine.vercel.app/api/air/orders/${orderId}`;

    try {
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Duffel-Version": "v2",
          "Authorization": `Bearer ${apiKey}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch order ${orderId}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Error fetching order ${orderId}:`, error);
      return null;
    }
  };

  const fetchAllOrderDetails = async (orderIds) => {
    setLoadingMessage("Fetching order details...");
    
    try {
      const details = await Promise.all(
        orderIds.map(orderId => fetchOrderDetails(orderId))
      );

      const transformedDetails = details
        .filter(detail => detail !== null)
        .map(detail => transformOrderData(detail));

      setOrderDetails(transformedDetails);
    } catch (error) {
    //   setError("Failed to fetch order details. Please try again later.");
      console.error("Error fetching order details:", error);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [username]);

  return (
    <div className="relative min-h-screen bg-gray-50 pt-16 pb-12">
      {loading && (
        <div className="loading-overlay">
          <div className="loading-content">
            <div className="loading-spinner"></div>
            <p className="loading-text">{loadingMessage}</p>
          </div>
        </div>
      )}

      <button
        className="select-buttons"
        onClick={() => {
          setOrderIDs([]);
          setTimeout(() => {
            navigate("/");
          }, 1000);
        }}
      >
        Go to Search Flights
      </button>

      <div className="passenger-formsdx">
        <h1>My Bookings</h1>
        {showModal && <MessageModal message={message} onClose={handleCloseModal} />}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mx-auto max-w-3xl">
          {error}
        </div>
      )}

      <div className="flight-cards">
        {!loading && orderDetails.length === 0 ? (
          <div className="no-bookings-message">
            <h2>No Bookings Found</h2>
            <p>You haven't made any bookings yet. Start your journey by searching for flights!</p>
          </div>
        ) : (
          orderDetails.reverse().map((order, index) => (
            <SFlightCard
              key={index}
              airlineLogo={order.airlineLogo}
              airlineName={order.airlineName}
              segments={order.segments}
              price={order.price}
              offerId={order.offerId}
              passengers={order.passengers}
              baggage={order.baggage}
            />
          ))
        )}
      </div>
    </div>
  );
}

export default YourBookings;