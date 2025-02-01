import React from 'react';
import './Loader.css';

function Loader() {
  return (
    <div className="loader-container">
      <div className="loader">
        <div className="circles"></div>
        <div className="circles"></div>
        <div className="circles"></div>
      </div>
    </div>
  );
}

export default Loader;
