import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

export default function Profile() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Profile";

    if (token) {
      fetch("http://127.0.0.1:8000/api/profile", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })
        .then((res) => {
          if (!res.ok) throw new Error("Unauthorized");
          return res.json();
        })
        .then((data) => {
          setEmail(data.email);
          setPassword("********");
        })
        .catch(() => {
          alert("Unauthorized. Please login again.");
          navigate("/login");
        });
    } else {
      navigate("/login");
    }
  }, [token, navigate]);

  const handleUpdate = (e) => {
    e.preventDefault();

    fetch("http://127.0.0.1:8000/api/profile", {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        password,
      }),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Update failed");
        return res.json();
      })
      .then((data) => {
        alert("Profile updated successfully!");
        setPassword("********");
      })
      .catch(() => {
        alert("Failed to update profile.");
      });
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div className="bg-[#0B1020] text-white min-h-screen">
      <section className="max-w-3xl mx-auto px-6 py-20">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl shadow-2xl"
        >
          <h2 className="text-3xl font-bold mb-6 text-center">Your Profile</h2>
          <form className="grid gap-6" onSubmit={handleUpdate}>
            <div>
              <label className="block text-white/70 mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-[#0B1020]/60 px-4 py-3 outline-none placeholder:text-white/40"
              />
            </div>

            <div>
              <label className="block text-white/70 mb-1">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-[#0B1020]/60 px-4 py-3 outline-none placeholder:text-white/40"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-white/60"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            <motion.button
              whileTap={{ scale: 0.98 }}
              type="submit"
              className="w-full rounded-2xl bg-white text-slate-900 px-5 py-3 font-semibold shadow-lg shadow-white/10 hover:-translate-y-0.5 transition"
            >
              Update Profile
            </motion.button>

            <motion.button
              whileTap={{ scale: 0.98 }}
              type="button"
              onClick={handleLogout}
              className="w-full rounded-2xl bg-red-500 text-white px-5 py-3 font-semibold shadow-lg shadow-red-500/20 hover:-translate-y-0.5 transition"
            >
              Logout
            </motion.button>
          </form>
        </motion.div>
      </section>
    </div>
  );
}