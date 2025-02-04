import React from 'react';
import './SingleFlightCard.css';
import jsPDF from 'jspdf';

function SFlightCard({ 
  airlineLogo,
  airlineName,
  segments = [],
  price,
  offerId,
  passengers = [],
  baggage = []
}) {
  const validSegments = segments.filter(segment => segment.departureTime && segment.arrivalTime);
  if (validSegments.length === 0) return null;

  const firstSegment = validSegments[0];
  const lastSegment = validSegments[validSegments.length - 1];

  // Get the first passenger's baggage details
  const passengerBaggage = baggage.find(bag => bag.passengerId === passengers[0]?.passengerId) || {};

  // Count passenger types
  const passengerTypes = passengers.reduce((acc, passenger) => {
    acc[passenger.type] = (acc[passenger.type] || 0) + 1;
    return acc;
  }, {});
  const formattedPassengerTypes = Object.entries(passengerTypes)
    .map(([type, count]) => `${count} ${type}${count > 1 ? 's' : ''}`)
    .join(' , ');

  // Function to generate and download PDF
  const handleDownloadTicket = () => {
    const doc = new jsPDF({
      orientation: 'landscape', // Set to landscape for a ticket-like layout
      unit: 'mm',
      format: [100, 150] // Custom size for a ticket
    });


    // Add a border around the ticket
    doc.setDrawColor(0);
    doc.setLineWidth(0.5);
    doc.rect(5, 5, 90, 140); // Draw a rectangle around the ticket

    // Add flight details
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(`Flight Ticket`, 50, 20, { align: 'center' });

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Airline: ${airlineName}`, 10, 30);
    doc.text(`Departure: ${firstSegment.departureTime}`, 10, 40);
    doc.text(`Arrival: ${lastSegment.arrivalTime}`, 10, 50);
    doc.text(`Duration: ${calculateTotalDuration(validSegments)}`, 10, 60);
    doc.text(`Route: ${firstSegment.origin} - ${lastSegment.destination}`, 10, 70);
    doc.text(`Cabin Class: ${firstSegment.cabinClass}`, 10, 80);

    // Add passenger details
    doc.text(`Passengers: ${formattedPassengerTypes}`, 10, 90);
    doc.text(`Checked Bags: ${passengerBaggage.checkedBags || 0}`, 10, 100);
    doc.text(`Carry-on Bags: ${passengerBaggage.carryOnBags || 0}`, 10, 110);

    // Add price
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(`Total Price: £${price}`, 10, 120);

    // Add a barcode or QR code placeholder (optional)
    doc.setFontSize(8);
    doc.text(`Ticket ID: ${offerId}`, 10, 130);
    doc.text(`Scan this code at the airport`, 10, 135);

    // Save the PDF
    doc.save(`ticket_${offerId}.pdf`);
  };

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

      {/* Price, Bags, and Info */}
      <div className="card-footer">
        <div>
          <div className="price-label">Total Price</div>
          <div className="price">£{price}</div>
        </div>

        <div className="passenger-info">
            <strong>Passengers: </strong>
          <div>{formattedPassengerTypes || 'N/A'}</div>
        </div>
        {/* Display Baggage Info */}
        <div className="baggage-info">
          <div>Checked Bags: {passengerBaggage.checkedBags || 0}</div>
          <div>Carry-on Bags: {passengerBaggage.carryOnBags || 0}</div>
        </div>

        {/* Download Ticket Button */}
        <button className="download-ticket-button" onClick={handleDownloadTicket}>
          Download Ticket
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

export default SFlightCard;