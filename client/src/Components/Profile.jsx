import React, { useState } from 'react'; 
import { useUser } from '../context/UserContext';
import { useNavigate } from 'react-router-dom';
import './Profile.css';

const ProfileComponent = () => {
  const { username, setUsername } = useUser();
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);

  const handleProfileClick = () => {
    setShowModal(true);
  };

  const handleLogout = () => {
    setUsername(null);
    setShowModal(false);
  };

  return username ? (
    <div className="profile-wrapper">
      <div className="profile-icon" onClick={handleProfileClick}>
        {username[0].toUpperCase()}
      </div>

      {/* Modal for logout */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3 className="modal-title">Welcome, {username}</h3>
            <button className="logout-btn" onClick={handleLogout}>
              Logout
            </button>
            <button className="cancel-btn" onClick={() => setShowModal(false)}>
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  ) : (
    <a href="login" onClick={() => navigate('/login')} className="sign-in-link">
      Sign In
    </a>
  );
};

export default ProfileComponent;
