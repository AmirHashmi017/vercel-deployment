import React from 'react';
import './FlightCard.css';
import { useNavigate } from 'react-router-dom';
import { useFlight } from "../context/FlightContext"; // Import Flight Context
import { useUser } from '../context/UserContext';

function FlightCard({ 
  airlineLogo,
  airlineName,
  segments = [],
  price,
  offerId,   // Added offerId
  passengers = [],
  baggage = []
}) {
  const validSegments = segments.filter(segment => segment.departureTime && segment.arrivalTime);
  const navigate = useNavigate();
  const { setSelectedFlight } = useFlight();
  const { username } = useUser();
  const handleNavigation = () => {
    
    if (username) {
      navigate('/checkout'); // Navigate to checkout if user exists
    } else {
      navigate('/login'); // Navigate to login if no user
    }
  };
  if (validSegments.length === 0) return null;

  const firstSegment = validSegments[0];
  const lastSegment = validSegments[validSegments.length - 1];

  // Get the first passenger's baggage details
  const passengerBaggage = baggage.find(bag => bag.passengerId === passengers[0]?.passengerId) || {};

  // Function to handle flight selection
  

  return (
    <div className="card">
      <div className="card-header">
        {/* Airline Logo */}
        <div className="logo">
          <img src={airlineLogo} alt={`${airlineName} Logo`} />
        </div>

        {/* Flight Info Header */}
        <div className="flight-info">
          <div className="flight-header">
            <div>
              <div className="time">
                {firstSegment?.departureTime} - {lastSegment?.arrivalTime}
              </div>
              <div className="airline">{airlineName}</div>
            </div>
            <div className="duration">
              <div className="time">
                {calculateTotalDuration(validSegments)}
              </div>
              <div className="route">
                {firstSegment?.origin} - {lastSegment?.destination}
              </div>
            </div>
            <div>
              <div className="class">{firstSegment?.cabinClass}</div>
            </div>
          </div>

          {/* Timeline */}
          <div className="timeline">
            {validSegments.map((segment, index) => (
              <React.Fragment key={index}>
                <div className="timeline-point">
                  <div className="circle"></div>
                  <div>
                    <div className="point-info">{segment.departureDate} at {segment.departureTime}</div>
                    <div className="airport">Depart from {segment.departureAirport} ({segment.origin})</div>
                  </div>
                </div>
              </React.Fragment>
            ))}
            <div className="timeline-point">
              <div className="circle"></div>
              <div>
                <div className="point-info">{lastSegment?.arrivalDate} at {lastSegment?.arrivalTime}</div>
                <div className="airport">Arrive at {lastSegment?.arrivalAirport} ({lastSegment?.destination})</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Price, Bags, and Select Button */}
      <div className="card-footer">
        <div>
          <div className="price-label">From</div>
          <div className="price">£{price}</div>
        </div>

        {/* Display Baggage Info */}
        <div className="baggage-info">
          <div>Checked Bags: {passengerBaggage.checkedBags || 0}</div>
          <div>Carry-on Bags: {passengerBaggage.carryOnBags || 0}</div>
        </div>

        <button className="select-button"  onClick={() => {
    setSelectedFlight({ airlineLogo, airlineName, segments, price, offerId, passengers, baggage });
    {handleNavigation()}// Redirect after setting flight
  }}>
          Select
        </button>
      </div>
    </div>
  );
}

// Converts total minutes to HH:mm format
function formatDuration(totalMinutes) {
  if (typeof totalMinutes !== "number" || isNaN(totalMinutes)) return "Invalid input";

  let days = Math.floor(totalMinutes / (24 * 60));
  let remainingMinutes = totalMinutes % (24 * 60);
  let hours = Math.floor(remainingMinutes / 60);
  let minutes = remainingMinutes % 60;

  let formattedHours = hours.toString().padStart(2, '0');
  let formattedMinutes = minutes.toString().padStart(2, '0');

  return days > 0 ? `${days}d ${formattedHours}:${formattedMinutes}` : `${formattedHours}:${formattedMinutes}`;
}

// Calculate total duration
function calculateTotalDuration(segments) {
  if (!segments || segments.length === 0) return "00:00";

  const firstDeparture = new Date(`${segments[0].departureDate} ${segments[0].departureTime}`);
  const lastArrival = new Date(`${segments[segments.length - 1].arrivalDate} ${segments[segments.length - 1].arrivalTime}`);

  const totalMinutes = Math.floor((lastArrival - firstDeparture) / (1000 * 60));
  return formatDuration(totalMinutes);
}

export default FlightCard;
