import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import LOGO from "./assets/Images/LOGO.png";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Check token on mount and when localStorage changes
useEffect(() => {
  const checkToken = () => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);
  };

  // Initial check
  checkToken();

  // Listen to storage events (other tabs)
  const handleStorageChange = () => checkToken();
  window.addEventListener("storage", handleStorageChange);

  // Listen to custom event (same tab login/register)
  const handleLoginEvent = () => checkToken();
  window.addEventListener("user-login", handleLoginEvent);

  return () => {
    window.removeEventListener("storage", handleStorageChange);
    window.removeEventListener("user-login", handleLoginEvent);
  };
}, []);


  return (
    <nav className="bg-gray-900 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex-shrink-0">
            <Link to="/" className="font-bold text-xl text-yellow-400"><img className="h-24 w-24" src={LOGO} alt="logo" /></Link>
          </div>
          <div className="hidden md:flex space-x-4">
            <Link to="/" className="hover:text-yellow-400">Home</Link>
            <Link to="/pricing" className="hover:text-yellow-400">Pricing</Link>
            <Link to="/FAQ" className="hover:text-yellow-400">FAQ</Link>
            {!isLoggedIn && <Link to="/login" className="hover:text-yellow-400">Login</Link>}
            {!isLoggedIn && <Link to="/register" className="hover:text-yellow-400">Register</Link>}
            {isLoggedIn && <Link to="/dashboard" className="hover:text-yellow-400">Dashboard</Link>}
            {isLoggedIn && <Link to="/profile" className="hover:text-yellow-400">Profile</Link>}
          </div>
          <div className="md:hidden">
            <button onClick={() => setIsOpen(!isOpen)} className="focus:outline-none text-yellow-400">
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16"/>
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>
      {isOpen && (
        <div className="md:hidden bg-gray-800">
          <Link to="/" onClick={() => setIsOpen(false)} className="block px-4 py-2 hover:bg-gray-700">Home</Link>
          <Link to="/pricing" onClick={() => setIsOpen(false)} className="block px-4 py-2 hover:bg-gray-700">Pricing</Link>
          <Link to="/FAQ" onClick={() => setIsOpen(false)} className="block px-4 py-2 hover:bg-gray-700">FAQ</Link>
          {!isLoggedIn && <Link to="/login" onClick={() => setIsOpen(false)} className="block px-4 py-2 hover:bg-gray-700">Login</Link>}
          {!isLoggedIn && <Link to="/register" onClick={() => setIsOpen(false)} className="block px-4 py-2 hover:bg-gray-700">Register</Link>}
          {isLoggedIn && <Link to="/dashboard" onClick={() => setIsOpen(false)} className="block px-4 py-2 hover:bg-gray-700">Dashboard</Link>}
          {isLoggedIn && <Link to="/profile" onClick={() => setIsOpen(false)} className="block px-4 py-2 hover:bg-gray-700">Profile</Link>}
        </div>
      )}
    </nav>
  );
}