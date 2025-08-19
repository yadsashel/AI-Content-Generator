import { useState, useEffect } from "react";
import { motion } from "framer-motion";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (password !== confirm) return alert("Passwords do not match!");
    setLoading(true);
    try {
      const res = await fetch("http://127.0.0.1:8000/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.detail || "Registration failed");

      alert(`Registered successfully: ${data.email}`);
      setEmail("");
      setPassword("");
      setConfirm("");
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    document.title = "Register";
  }, []);

  return (
    <div className="bg-[#0B1020] min-h-screen flex items-center justify-center text-white px-6">
      <motion.div
        variants={fadeUp}
        initial="hidden"
        animate="show"
        className="w-full max-w-md p-8 rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl"
      >
        <h2 className="text-3xl font-bold mb-6 text-center">Create Account</h2>
        <div className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-fuchsia-400"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-fuchsia-400"
          />
          <input
            type="password"
            placeholder="Confirm Password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-fuchsia-400"
          />
          <button
            onClick={handleRegister}
            disabled={loading}
            className="w-full rounded-xl bg-fuchsia-500 px-5 py-3 font-semibold text-white shadow-lg hover:bg-fuchsia-600 transition disabled:opacity-50"
          >
            {loading ? "Registering..." : "Register"}
          </button>
        </div>
        <div className="mt-6 text-center text-white/60">
          Already have an account?{" "}
          <a href="/login" className="text-fuchsia-400 hover:underline">
            Login
          </a>
        </div>
      </motion.div>
    </div>
  );
}