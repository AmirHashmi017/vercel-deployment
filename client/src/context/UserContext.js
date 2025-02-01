import React, { createContext, useState, useContext } from 'react';

// Create a context to hold the user information
const UserContext = createContext();

// Create a provider component
export const UserProvider = ({ children }) => {
  const [username, setUsername] = useState(null);

  return (
    <UserContext.Provider value={{ username, setUsername }}>
      {children}
    </UserContext.Provider>
  );
};

// Create a custom hook to access the username and setUsername function
export const useUser = () => {
  return useContext(UserContext);
};

