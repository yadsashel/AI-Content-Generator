import { useState, useEffect } from "react";
import emailjs from "@emailjs/browser";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

export default function Register() {
  const [email, setEmail] = useState("");
  const [codeSent, setCodeSent] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [userCode, setUserCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // stable 6-digit code
  const generatedCode = useState(
    () => Math.floor(100000 + Math.random() * 900000)
  )[0];

  const BACKEND = process.env.REACT_APP_BACKEND_URL || "http://localhost:8000";

  const isValidGmail = (email) => /^[a-zA-Z0-9._%+-]+@gmail\.com$/.test(email);

  const sendCode = async () => {
    if (!isValidGmail(email)) return alert("Please enter a valid Gmail address.");

    // check local storage quick-block
    const users = JSON.parse(localStorage.getItem("registeredUsers") || "[]");
    if (users.find((u) => u.email === email)) {
      return alert("This email is already registered. Please login.");
    }

    try {
      await emailjs.send(
        "service_e7ofow1",    // your service id
        "template_2ra6hk7",   // your template id
        { email, code: generatedCode },
        "cZ3EttIuBjfGPaglJ"   // your public key
      );
      setCodeSent(true);
      setVerificationCode(generatedCode);
      alert("Verification code sent! Check your Gmail.");
    } catch (err) {
      console.error("EmailJS send error:", err);
      alert("Failed to send code. Try again.");
    }
  };

  const handleRegister = async (e) => {
    e?.preventDefault();
    if (!isValidGmail(email)) return alert("Please enter a valid Gmail address.");
    if (!codeSent) return alert("You must send the verification code first!");
    if (userCode.trim() !== verificationCode.toString())
      return alert("Incorrect verification code!");
    if (password !== confirm) return alert("Passwords do not match!");
    if (password.length < 8) return alert("Password must be at least 8 characters.");

    setLoading(true);
    try {
      // 1) Call backend register endpoint
      const regRes = await fetch(`${BACKEND}/api/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const regData = await regRes.json();
      if (!regRes.ok) {
        throw new Error(regData.detail || regData.message || "Registration failed");
      }

      // 2) (Optional) Save locally as fallback
      const users = JSON.parse(localStorage.getItem("registeredUsers") || "[]");
      if (!users.find((u) => u.email === email)) {
        users.push({ email, password });
        localStorage.setItem("registeredUsers", JSON.stringify(users));
      }

      // 3) Auto-login: call /api/login to get token
      const loginRes = await fetch(`${BACKEND}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const loginData = await loginRes.json();
      if (!loginRes.ok) {
        // registration ok but login failed — let user know
        alert("Registered but failed to auto-login. Please login manually.");
        navigate("/login");
        return;
      }

      // backend returns { access_token, token_type }
      const token = loginData.access_token || loginData.token || loginData.accessToken;
      if (!token) {
        alert("Registered but no token returned. Please login manually.");
        navigate("/login");
        return;
      }

      localStorage.setItem("token", token);
      localStorage.setItem("email", email);
      alert("Registered & logged in! Redirecting...");
      navigate("/profile");
    } catch (err) {
      console.error("Register error:", err);
      alert(err.message || "Registration failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    document.title = "Register";
  }, []);

  return (
    <div className="bg-[#0B1020] min-h-screen flex items-center justify-center text-white px-6">
      <motion.form
        onSubmit={handleRegister}
        variants={fadeUp}
        initial="hidden"
        animate="show"
        className="w-full max-w-md p-8 rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl"
      >
        <h2 className="text-3xl font-bold mb-6 text-center">Create Account</h2>
        <div className="space-y-4">
          <div className="flex gap-2">
            <input
              type="email"
              placeholder="Gmail"
              value={email}
              onChange={(e) => setEmail(e.target.value.trim())}
              required
              className="flex-1 px-4 py-3 rounded-xl bg-white/5 border border-white/10 placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-fuchsia-400"
            />
            <button
              type="button"
              onClick={sendCode}
              disabled={codeSent}
              className="px-4 py-3 bg-fuchsia-500 rounded-xl font-semibold hover:bg-fuchsia-600 disabled:opacity-50"
            >
              {codeSent ? "Sent" : "Send"}
            </button>
          </div>

          <input
            type="text"
            placeholder="Verification Code"
            value={userCode}
            onChange={(e) => setUserCode(e.target.value.trim())}
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
          <input
            type="password"
            placeholder="Confirm Password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-fuchsia-400"
          />

          <button
            type="submit"
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
      </motion.form>
    </div>
  );
}