import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate, Link } from "react-router-dom";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const BACKEND = process.env.REACT_APP_BACKEND_URL || "http://localhost:8000";

  const handleLogin = async (e) => {
    e?.preventDefault();
    if (!email.endsWith("@gmail.com")) return alert("Please login with a Gmail address.");
    if (!password) return alert("Enter your password.");
    setLoading(true);

    try {
      const res = await fetch(`${BACKEND}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.detail || data.message || "Invalid credentials!");
      }

      // fastapi returns { access_token, token_type }
      const token = data.access_token || data.token || data.accessToken;
      if (!token) throw new Error("No token returned from server");

      localStorage.setItem("token", token);
      localStorage.setItem("email", email);

      // optional: keep local fallback users in sync
      const users = JSON.parse(localStorage.getItem("registeredUsers") || "[]");
      if (!users.find((u) => u.email === email)) {
        users.push({ email, password });
        localStorage.setItem("registeredUsers", JSON.stringify(users));
      }

      navigate("/profile");
    } catch (err) {
      console.error("Login error:", err);
      alert(err.message || "Invalid credentials!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    document.title = "Login";
  }, []);

  return (
    <div className="bg-[#0B1020] min-h-screen flex items-center justify-center text-white px-6">
      <motion.form
        onSubmit={handleLogin}
        variants={fadeUp}
        initial="hidden"
        animate="show"
        className="w-full max-w-md p-8 rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl"
      >
        <h2 className="text-3xl font-bold mb-6 text-center">Welcome Back</h2>
        <div className="space-y-4">
          <input
            type="email"
            placeholder="Gmail"
            value={email}
            onChange={(e) => setEmail(e.target.value.trim())}
            required
            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-fuchsia-400"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-fuchsia-400"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-fuchsia-500 px-5 py-3 font-semibold text-white shadow-lg hover:bg-fuchsia-600 transition disabled:opacity-50"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </div>
        <div className="mt-4 text-center">
          <Link to="/resetpassword" className="text-fuchsia-400 hover:underline">Forgot your password?</Link>
        </div>
        <div className="mt-6 text-center text-white/60">
          Don’t have an account? <Link to="/register" className="text-fuchsia-400 hover:underline">Register</Link>
        </div>
      </motion.form>
    </div>
  );
}