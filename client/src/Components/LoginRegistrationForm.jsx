import React, { useState } from 'react';
import { useUser } from '../context/UserContext';
import { useNavigate } from 'react-router-dom';
import './Login.css';
import axios from 'axios';
import 'boxicons/css/boxicons.min.css';
import MessageModal from "./MessageModal";
import './MessageModal.css';
import  {useFlight} from '../context/FlightContext';

const LoginRegisterForm = () => {

  const [showModal, setShowModal] = useState(false);
  const [message, setMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const { setUsername } = useUser();
  const { selectedFlight } = useFlight();
  const navigate = useNavigate();
  const [isActive, setIsActive] = useState(false);
  const [formData, setFormData] = useState({ username: "", password: "" });
  const [error, setError] = useState(null);

  const showMessageModal = (modalMessage) => {
    setMessage(modalMessage);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setLoadingMessage('Logging in...');
    try {
      const response = await axios.post("https://vercel-deployment-server-wine.vercel.app/login", {
        username: formData.username,
        password: formData.password,
      });
      console.log(response.data.user.username);
      setUsername(response.data.user.username);
      setFormData({ username: "", password: "" });
      if(selectedFlight)
      {
        navigate('/checkout');
      }
      else{
      navigate('/');
      }
    } catch (err) {
      setIsLoading(false);
      if (err.response?.status === 401) {
        showMessageModal('Invalid credentials. Please try again.');
      }
    }
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setLoadingMessage('Creating your account...');
    try {
      await axios.post("https://vercel-deployment-server-wine.vercel.app/signup", {
        username: formData.username,
        password: formData.password,
      });
      setFormData({ username: "", password: "" });
      setIsLoading(false);
      toggleForm();
    } catch (err) {
      setIsLoading(false);
      if (err.response?.status === 409) {
        showMessageModal("Username already exists. Please choose a different username.");
      }
    }
  };

  const toggleForm = () => {
    setFormData({ username: "", password: "" });
    setIsActive(!isActive);
  };

  return (
    <div>
      <span className="rotate-bg"></span>
      <span className="rotate-bg2"></span>
      
      {isLoading && (
        <div className="loading-overlay">
          <div className="loading-content">
            <div className="loading-spinner"></div>
            <p className="loading-text">{loadingMessage}</p>
          </div>
        </div>
      )}

      {showModal && (
        <MessageModal message={message} onClose={handleCloseModal} />
      )}
      
      {isActive ? (
        <div className="form-box login">
          <h2 className="title animation" style={{ "--i": 0, "--j": 21 }}>
            Login
          </h2>
          <form onSubmit={handleLogin}>
            <div className="input-box animation" style={{ "--i": 1, "--j": 22 }}>
              <input 
                type="text" 
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                required
              />
              <label>Username</label>
              <i className="bx bxs-user"></i>
            </div>
            <div className="input-box animation" style={{ "--i": 2, "--j": 23 }}>
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                required
              />
              <label>Password</label>
              <i className="bx bxs-lock-alt"></i>
              <i
                className={`bx ${showPassword ? "bxs-show" : "bxs-hide"}`}
                onClick={togglePasswordVisibility}
                style={{
                  position: 'absolute',
                  right: '30px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  cursor: 'pointer',
                  color: '#888',
                }}
              ></i>
            </div>
            <button type="submit" className="btn animation" style={{ "--i": 3, "--j": 24 }}>
              Login
            </button>
            <div className="linkTxt animation" style={{ "--i": 5, "--j": 25 }}>
              <p>
                Don't have an account?{' '}
                <a href="#!" className="register-link" onClick={toggleForm}>
                  Sign Up
                </a>
              </p>
            </div>
          </form>
        </div>
      ) : (
        <div className="form-box register">
          <h2 className="title animation" style={{ "--i": 17, "--j": 0 }}>
            Sign Up
          </h2>
          <form onSubmit={handleSignUp}>
            <div className="input-box animation" style={{ "--i": 18, "--j": 1 }}>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                required
              />
              <label>Username</label>
              <i className="bx bxs-user"></i>
            </div>
            <div className="input-box animation" style={{ "--i": 20, "--j": 3 }}>
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                required
                minLength={8}
              />
              <label>Password</label>
              <i className="bx bxs-lock-alt"></i>
              <i
                className={`bx ${showPassword ? "bxs-show" : "bxs-hide"}`}
                onClick={togglePasswordVisibility}
                style={{
                  position: 'absolute',
                  right: '30px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  cursor: 'pointer',
                  color: '#888',
                }}
              ></i>
            </div>
            <button type="submit" className="btn animation" style={{ "--i": 21, "--j": 4 }}>
              Sign Up
            </button>
            <div className="linkTxt animation" style={{ "--i": 22, "--j": 5 }}>
              <p>
                Already have an account?{' '}
                <a href="#!" className="login-link" onClick={toggleForm}>
                  Login
                </a>
              </p>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default LoginRegisterForm;