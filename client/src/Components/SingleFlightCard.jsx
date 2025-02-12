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
    // If type is null or empty string, use 'child'
    const type = passenger.type || 'child';
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {});

  const formattedPassengerTypes = Object.entries(passengerTypes)
    .map(([type, count]) => `${count} ${type}${count > 1 ? 's' : ''}`)
    .join(' , ');

  const handleDownloadTicket = () => {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });
  
    // Set initial position
    const margin = 20;
    let y = margin;
  
  
    // Header section with flight times and route
    y = margin;
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text(`${firstSegment.departureTime} - ${lastSegment.arrivalTime}`, doc.internal.pageSize.width / 2, y + 10, { align: 'center' });
  
    doc.setFontSize(18);
    doc.setFont('helvetica', 'normal');
    doc.text(airlineName, doc.internal.pageSize.width / 2, y + 20, { align: 'center' });
  
    // Duration and route
    doc.setFontSize(20);
    doc.text(calculateTotalDuration(validSegments), doc.internal.pageSize.width - margin - 40, y + 10);
    doc.text(`${firstSegment.origin} - ${lastSegment.destination}`, doc.internal.pageSize.width - margin - 40, y + 20);
  
    // Flight type (e.g., "Non-stop" if only one segment)
    doc.setFontSize(16);
    doc.text(validSegments.length === 1 ? 'Non-stop' : `${validSegments.length - 1} stops`, doc.internal.pageSize.width - margin, y + 10, { align: 'right' });
  
    // Departure details
    y += 50;
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text(`${firstSegment.departureDate}, ${firstSegment.departureTime}`, margin, y);
    
    doc.setFontSize(14);
    doc.setFont('helvetica', 'normal');
    doc.text(`Depart from ${firstSegment.departureAirport}`, doc.internal.pageSize.width - margin, y, { align: 'right' });
    doc.text(`(${firstSegment.origin}), Terminal ${firstSegment.departureTerminal || 'M'}`, doc.internal.pageSize.width - margin, y + 10, { align: 'right' });
  
    // Flight duration
    y += 25;
    doc.setFontSize(14);
    doc.text(`Flight duration: ${calculateTotalDuration(validSegments)}`, margin, y);
  
    // Arrival details
    y += 15;
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text(`${lastSegment.arrivalDate}, ${lastSegment.arrivalTime}`, margin, y);
    
    doc.setFontSize(14);
    doc.setFont('helvetica', 'normal');
    doc.text(`Arrive at ${lastSegment.arrivalAirport}`, doc.internal.pageSize.width - margin, y, { align: 'right' });
    doc.text(`(${lastSegment.destination}), Terminal ${lastSegment.arrivalTerminal || '3'}`, doc.internal.pageSize.width - margin, y + 10, { align: 'right' });
  
    // Flight details
    y += 30;
    doc.setFontSize(14);
    const flightDetails = [
      ['Class', firstSegment.cabinClass],
      ['Airline', airlineName]
    ];
  
    flightDetails.forEach(([label, value], index) => {
      doc.text(label, margin, y + (index * 10));
      doc.text(value, margin + 80, y + (index * 10));
    });
  
    // Passenger and baggage info
    y += 50;
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Passenger Information', margin, y);
    
    y += 10;
    doc.setFont('helvetica', 'normal');
    doc.text(`Passengers: ${formattedPassengerTypes}`, margin, y);
    doc.text(`Checked Bags: ${passengerBaggage.checkedBags || 0}`, margin, y + 10);
    doc.text(`Carry-on Bags: ${passengerBaggage.carryOnBags || 0}`, margin, y + 20);
  
    // Price
    y += 40;
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text(`Total Price: £${price}`, margin, y);
  
    // Add a subtle border around the ticket
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.5);
    doc.rect(10, 10, doc.internal.pageSize.width - 20, doc.internal.pageSize.height - 20);
  
    // Save the PDF
    doc.save(`flight-ticket-${offerId}.pdf`);
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