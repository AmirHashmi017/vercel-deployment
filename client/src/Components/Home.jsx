import React, { useState, useEffect,useContext } from 'react'; // Import useState and useEffect
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ProfileComponent from './Profile';
import { useNavigate } from 'react-router-dom';
import './Home.css'; // Import your CSS file
import PassengerSelector from './PassengerSelector';
import { usePassengers } from "../context/PassengerContext";
import Select from 'react-select';
import Loader from './Loader'
import FlightCard from './FlightCard'
import { useUser } from '../context/UserContext'; 
import MessageModal from "./MessageModal"; // Import the modal component
import './MessageModal.css';
import LoginRegisterForm from './LoginRegistrationForm';
const FlightSearch = () => {
  const apiKey = process.env.REACT_APP_DUFFLE_TEST_API_KEY;
  const [showModal, setShowModal] = useState(false); // Modal visibility state
  const [message, setMessage] = useState('');
  const{passengers}=usePassengers();
  const { username } = useUser();
  const { setUsername } = useUser(); 
  const navigate = useNavigate();
  const [travelClass,setTravelClass]=useState("economy");
  const [departureDate, setDepartureDate] = useState("");
  const [returnDate, setReturnDate] = useState("");
  const [showLoginRegisterForm, setShowLoginRegisterForm] = useState(false);
  const [airports, setAirports] = useState([]);
  const [flightsresult, setFlightsresult] = useState([]);
  const [tempFlights, setTempFlights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchloading, setSearchLoading] = useState(false);
  const [source, setSource] = useState(null);
  const [destination, setDestination] = useState(null);
  // const [source, setSource] = useState("");
  const [after,setAfter] = useState("");
  // const [destination, setDestination] = useState("");
  const [currentPage, setCurrentPage] = useState(1); // To track current page
  const [totalPages, setTotalPages] = useState(0); // Total pages
  const [limit] = useState(100); // Set limit per page (you can adjust this)
  const [tripType, setTripType] = useState("oneWay"); // State to track selected trip type
  
  useEffect(() => {
    if (flightsresult.length > 0 && tempFlights.length === 0) {
      setTempFlights(flightsresult); 
    }
  }, [flightsresult]); 
  
  const ResetFlights = () => {
    setFlightsresult([...tempFlights]); 
  };
  
  const filterNonStopFlights = () => {
    setFlightsresult(tempFlights.filter((flight) => flight.segments.length === 1));
  };
  
  const sortFlightsAscending = () => {
    ResetFlights();
    setTimeout(() => {
      setFlightsresult(prevFlights => [...prevFlights].sort((a, b) => a.price - b.price));
    }, 0); 
  };
  
  const sortFlightsDescending = () => {
    ResetFlights();
    setTimeout(() => {
      setFlightsresult(prevFlights => [...prevFlights].sort((a, b) => b.price - a.price));
    }, 0);
  };
  
  const handleButtonClick = (event) => {
    event.preventDefault();
    setShowLoginRegisterForm(true);
    navigate('/login')
  };
  const showMessageModal = (modalMessage) => {
    setMessage(modalMessage); // Set the modal message
    setShowModal(true); // Show the modal
  };

  const handleCloseModal = () => {
    setShowModal(false); 
    setSearchLoading(false);// Close the modal
  };
  const fetchOfferRequest = async (offerId) => {
    if (!offerId) {
      // alert("Offer ID is required.");
      return;
    }
  
    const url = `https://vercel-deployment-server-wine.vercel.app/api/air/offer_requests/${offerId}`;
    // The working OfferID
    // const url = `/api/air/offer_requests/orq_0000AqVpQyFcYV2StxChKI`
  
    try {
      const response = await fetch(url, {
        method: "GET", // Since you're fetching data, use GET
        headers: {
          "Duffel-Version": "v2",
          "Authorization": `Bearer ${apiKey}`,
        },
      });
  
      if (response.ok) {
        setSearchLoading(false);
        const data = await response.json();
        console.log(data)
        const flights = data.data?.offers;
        const formattedFlights = flights.map((flight) => {
          const slices = flight.slices || [];
          const segments = slices.flatMap((slice) => slice.segments || []);
          const passengers = flight.passengers || [];
  
          // Extract passenger details
          const passengerDetails = passengers.map((passenger) => ({
              passengerId: passenger.id,
              type: passenger.type,
              age: passenger.type === "child" ? passenger.age : null, // Only include age for children
          }));
  
          // Extract baggage details
          const baggageDetails = segments.flatMap((segment) =>
              segment.passengers.map((passenger) => ({
                  passengerId: passenger.passenger_id,
                  checkedBags: passenger.baggages.find((bag) => bag.type === "checked")?.quantity || 0,
                  carryOnBags: passenger.baggages.find((bag) => bag.type === "carry_on")?.quantity || 0,
              }))
          );
  
          return {
              offerId: flight.id, // Include the offer ID
              airlineLogo: segments[0]?.operating_carrier?.logo_symbol_url,
              airlineName: segments[0]?.operating_carrier?.name,
              segments: segments.map((segment) => ({
                  departureTime: formatTime(segment?.departing_at),
                  arrivalTime: formatTime(segment?.arriving_at),
                  duration: formatDuration(segment?.duration),
                  origin: segment?.origin?.iata_code,
                  destination: segment?.destination?.iata_code,
                  departureDate: formatDate(segment?.departing_at),
                  arrivalDate: formatDate(segment?.arriving_at),
                  departureAirport: segment?.origin?.name,
                  arrivalAirport: segment?.destination?.name,
                  cabinClass: segment?.passengers?.[0]?.cabin_class_marketing_name,
              })),
              price: flight.total_amount,
              passengers: passengerDetails, // Include passenger details
              baggage: baggageDetails, // Include baggage details
          };
      });
      console.log(formattedFlights)

      
      // Helper function to format the duration (e.g., "PT1H45M" to "1h 45m")
      function formatDuration(duration) {
          const regex = /PT(\d+)H(\d+)M/;
          const match = duration.match(regex);
          if (match) {
              return `${match[1]}h ${match[2]}m`;
          }
          return duration; // fallback in case the format isn't matched
      }
      function formatTime(dateTimeString) {
        if (!dateTimeString) return "N/A";
        const date = new Date(dateTimeString);
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return `${hours}:${minutes}`;
      }
      // Helper function to format date (e.g., "2025-01-30T09:30:00" to "30 Jan 2025")
      function formatDate(dateString) {
          const date = new Date(dateString);
          const options = { year: 'numeric', month: 'short', day: 'numeric' };
          return date.toLocaleDateString('en-US', options);
      }
      
      
      // Setting the formatted flights data to state
      // setFlightsresult(formattedFlights);
      return formattedFlights
      
      console.log("Formatted flights data:", formattedFlights);
        console.log("Offer request data:", data);
        // Handle the response data as required (e.g., set state or process the response)
      } else {
        let errorData;
        try {
          errorData = await response.json();
        } catch (error) {
          errorData = await response.text();
          console.error("Error response (not JSON):", errorData);
        }
        const errorMessage =
          errorData.message || errorData || "Unknown error occurred";
        console.error("Error fetching offer request:", errorMessage);
      }
    } catch (error) {
      console.error("Error fetching offer request:", error);
      
    }
  };


  
const fetchFlightOffers = async () => {
  setFlightsresult([]);
  setSearchLoading(true);
  // Validate source and destination
  if (!source) {
    showMessageModal("Please select a source airport.");
    setSearchLoading(false);
    return;

  }
  if (!destination) {
    showMessageModal("Please select a destination airport.");
    setSearchLoading(false);
    return;
  }
  if (source === destination) {
    showMessageModal("Source and Destination can't be the same.");
    setSearchLoading(false);
    return;
  }

  // Validate departure date
  const currentDate = new Date();
  currentDate.setHours(0, 0, 0, 0);
  const parsedDepartureDate = new Date(departureDate);
  if (parsedDepartureDate < currentDate) {
    showMessageModal("Departure date must be today or later.");
    return;
  }

  // Prepare the payload for the one-way trip
  const oneWayPayload = {
    data: {
      slices: [
        {
          origin: source,
          destination: destination,
          departure_date: departureDate,
        },
      ],
      passengers: passengers,
      cabin_class: travelClass,
    },
  };

  // Prepare the payload for the return trip (if applicable)
  let returnPayload = null;
  if (tripType === "return" && returnDate) {
    const parsedReturnDate = new Date(returnDate);
    if (parsedReturnDate < parsedDepartureDate) {
      showMessageModal("Return date must be greater than or equal to the departure date.");
      return;
    }

    returnPayload = {
      data: {
        slices: [
          {
            origin: destination,
            destination: source,
            departure_date: returnDate,
          },
        ],
        passengers: passengers,
        cabin_class: travelClass,
      },
    };
  }
  console.log(passengers);
  try {
    // Fetch one-way trip offers
    // const proxyUrl = "https://cors-anywhere.herokuapp.com/";
    const proxyUrl = "https://my-proxy-ruby.vercel.app/proxy";
    const apiUrl = "/air/offer_requests";

const oneWayResponse = await fetch(proxyUrl + apiUrl,  {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Duffel-Version": "v2",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify(oneWayPayload),
    });

    if (!oneWayResponse.ok) {
      console.error("Failed to fetch one-way flight offers.");
      return;
    }

    const oneWayData = await oneWayResponse.json();
    const oneWayOfferId = oneWayData.data?.id;
    console.log("One-way flight offers:", oneWayOfferId);

    // Fetch return trip offers (if applicable)
    let returnOfferId = null;
    if (returnPayload) {
      // const proxyUrl = "https://cors-anywhere.herokuapp.com/";
      const proxyUrl = "https://my-proxy-ruby.vercel.app/proxy";
      const apiUrl = "/air/offer_requests";

const returnResponse = await fetch(proxyUrl + apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Duffel-Version": "v2",
          "Authorization": `Bearer ${apiKey}`,
        },
        body: JSON.stringify(returnPayload),
      });

      if (!returnResponse.ok) {
        console.error("Failed to fetch return flight offers.");
        return;
      }

      const returnData = await returnResponse.json();
      returnOfferId = returnData.data?.id;
      console.log("Return flight offers:", returnOfferId);
    }

    // Fetch and combine the results
    const oneWayOffers = await fetchOfferRequest(oneWayOfferId);
    let returnOffers = null;
    if (returnOfferId) {
      returnOffers = await fetchOfferRequest(returnOfferId);
    }

    // Combine the results and update the state
    const combinedResults = returnOffers ? [...oneWayOffers, ...returnOffers] : oneWayOffers;
    if(combinedResults.length==0)
      {
        showMessageModal("Sorry, no flights available for your search criteria right now. Please try again later.");
        return;
      }
    setFlightsresult(combinedResults);

  } catch (error) {
    console.error("Error fetching flight offers:", error);
  }
};

useEffect(() => {
  
 


    const fetchAllAirports = async (after = null, allAirports = []) => {
      console.log("Fetching airports...");
      let url = "https://vercel-deployment-server-wine.vercel.app/api/air/airports?limit=200";
      if (after) {
        url = `${url}&after=${after}`;
      }

      try {
        const response = await fetch(url, {
          method: "GET",
          headers: {
            "Duffel-Version": "v2",
            "Authorization": `Bearer ${apiKey}`,
          },
        });

        if (response.ok) {
          const data = await response.json();

          // Combine the fetched airports with the previously loaded ones
          const updatedAirports = [...allAirports, ...data.data];
          const options = updatedAirports.map((airport) => ({
            value: airport.iata_code,
            label: `${airport.name} (${airport.city_name})`,
          }));
          setAirports(options);
          // setAirports(updatedAirports);

          if (data.meta.after) {
            // Continue fetching the next batch
            console.log("Fetching next batch with after:", data.meta.after);
            await fetchAllAirports(data.meta.after, updatedAirports);
          } else {
            // No more records to fetch
            // setAirports(updatedAirports); // Update the state with all airports
            const options = updatedAirports.map((airport) => ({
              value: airport.iata_code,
              label: `${airport.name} (${airport.city_name})`,
            }));
            setAirports(options);
            setLoading(false);
            console.log("All airports loaded:", updatedAirports.length);
          }
        } else {
          let errorData;
          try {
            errorData = await response.json();
          } catch (error) {
            errorData = await response.text();
            console.error("Error response (not JSON):", errorData);
          }
          const errorMessage =
            errorData.message || errorData || "Unknown error occurred";
          console.error("Error response:", errorMessage);
          setSearchLoading(false);
        }
      } catch (error) {
        console.error("Error fetching airports:", error);
        setSearchLoading(false);
      }
    };

    fetchAllAirports(); // Start fetching from the first batch
  }, []);

  const goToPage = (page) => {
    if (page > 0 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // Handle trip type button click (One Way or Return)
  const handleTripTypeChange = (type) => {
    setTripType(type);
  };
  
  
  return (
    <div className="App">
      <header className="navbar">
        <div className="navbar-logo">
          {/* <button className="hamburger-menu">☰</button> */}
          <span className="logo">Shayan.uk</span>
        </div>
        <div className="navbar-links">
        {username && <a href="#" onClick={() => navigate('/yourbookings')}>View your Bookings</a>}
          <span>Call 24/7 <a href="tel:+921111172782">+92 21-111-172-782</a></span>
          <a href="tel:+923047772782">WhatsApp: +92 304 777 2782 </a>
          <ProfileComponent />
          
          {/* <a href="login" onClick={()=>{navigate('/login')}}>Sign In</a> */}
        </div>
      </header>

      <div className="search-bar">
        <div className="search-options">
          {/* One Way and Return buttons */}
          <button
            onClick={() => handleTripTypeChange("oneWay")}
            className={tripType === "oneWay" ? "active" : "inactive"}
          >
            One Way
          </button>
          <button
            onClick={() => handleTripTypeChange("return")}
            className={tripType === "return" ? "active" : "inactive"}
          >
            Return
          </button>
        </div>
        <form 
  onSubmit={(e) => {
    e.preventDefault(); 
    // Prevent default form submission
    fetchFlightOffers(); // Call your search function
  }}
>       <div id="container">
       <PassengerSelector />
       <label for="travel-class"></label>
<select 
id="travel-class"
name="travelClass"
value={travelClass}
onChange={(e) => setTravelClass(e.target.value)}
required>
  <option value="economy">Economy</option>
  <option value="premium_economy">Premium Economy</option>
  <option value="business">Business</option>
  
  <option value="first">First</option>
</select>


     </div>
        <div className="search-fields">
          <Select
  id="source"
  options={airports} // options with value as iata_code and label as name + city
  value={source?.label} // current selected source
  onChange={(selectedOption) => setSource(selectedOption?.value)} 
  placeholder="Select Source Airport"
  isLoading={loading} // Loading state
  isClearable // Allow clearing the selection
  styles={{
    control: (base) => ({
      ...base,
      padding: '10px', // Adjust padding
      marginRight: '10px', // Margin to the right
      border: '1px solid #ddd', // Border styling
      borderRadius: '5px', // Rounded corners
      width: '25vw', 
      minHeight: '40px', // Adjust height
      '@media (max-width: 768px)': {
        width:'100%', // Apply 25vw only on desktop
        }
    }),
  }}
/>


          

          {/* Destination Select */}
          <Select
  id="destination"
  options={airports}
  value={destination?.label}
  onChange={(selectedOption) => setDestination(selectedOption?.value)}
  placeholder="Select Destination Airport"
  isLoading={loading}
  isClearable
  styles={{
    control: (base) => ({
      ...base,
      padding: '10px',
      marginRight: '10px',
      border: '1px solid #ddd',
      borderRadius: '5px',
      width: '25vw',
      
      minHeight: '40px',
      '@media (max-width: 768px)': {
        width:'100%',
        }
    }),
  }}
/>

         

          {/* Previous code remains the same */}

<input 
  type="date"  
  value={departureDate}
  onChange={(e) => setDepartureDate(e.target.value)}
  required
  placeholder="Departure "
/>

{/* Always render the "Returning" field, but disable it based on trip type */}
<input
  type="date"
  value={returnDate}
  onChange={(e) => setReturnDate(e.target.value)}
  disabled={tripType === "oneWay"}
  className={tripType === "oneWay" ? "disabled" : ""}
  required={tripType !== "oneWay"}
  placeholder="Return "
/>

          <button type="submit" className="search-button">Search</button>
        </div>
        </form>
      </div>

      <main className="content">
        <div className="filters">
          <button type="button" onClick={sortFlightsAscending}>Least Expensive</button>
          <button type="button" onClick={sortFlightsDescending}>Most Expensive</button>
          <button type="button" onClick={filterNonStopFlights}>Nonstop</button>
        </div>
        <section className="results">
        {searchloading ? <div>
      <Loader />
    </div>: (
    flightsresult.map((flight, index) => (
        <FlightCard key={index} flight={flight} />
    ))
)}
        {showModal && (
        <MessageModal message={message} onClose={handleCloseModal} />
      )}
          <div className="container">
          {flightsresult.map((flight, index) => (
          <FlightCard key={index} {...flight} />
        ))}
    </div>
        </section>
        
      </main>
    </div>
  );
}

export default FlightSearch;
