import { createContext, useContext, useState } from "react";

const FlightContext = createContext();

export const FlightProvider = ({ children }) => {
    const [selectedFlight, setSelectedFlight] = useState(null);

    return (
        <FlightContext.Provider value={{ selectedFlight, setSelectedFlight }}>
            {children}
        </FlightContext.Provider>
    );
};

export const useFlight = () => useContext(FlightContext);
