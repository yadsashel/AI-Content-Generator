import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Logout() {
  const navigate = useNavigate();

  useEffect(() => {
    localStorage.removeItem("token"); // remove JWT token
    navigate("/login"); // redirect to login
  }, [navigate]);

  return (
    <div className="bg-[#0B1020] min-h-screen flex items-center justify-center text-white">
      <h2 className="text-2xl font-bold">Logging out...</h2>
    </div>
  );
}