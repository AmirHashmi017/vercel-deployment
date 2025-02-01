import { createContext, useContext, useState } from "react";

const PassengerContext = createContext();

export const PassengerProvider = ({ children }) => {
    const [passengers, setPassengers] = useState([]);

    return (
        <PassengerContext.Provider value={{ passengers, setPassengers }}>
            {children}
        </PassengerContext.Provider>
    );
};

export const usePassengers = () => useContext(PassengerContext);
