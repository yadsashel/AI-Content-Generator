import { useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import Navbar from "./components/Navbar";
import Pricing from "./pages/Pricing";
import FAQ from "./pages/FAQ";
import ResetPassword from "./pages/ResetPassword"; 

export default function App() {
  // State to track login status
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("token"));

  return (
    <BrowserRouter>
      <Navbar isLoggedIn={isLoggedIn} />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login setIsLoggedIn={setIsLoggedIn} />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/pricing" element={<Pricing />} />      
        <Route path="faq" element={<FAQ />} /> 
        <Route path="/resetpassword" element={<ResetPassword />} />
      </Routes>
    </BrowserRouter>
  );
}