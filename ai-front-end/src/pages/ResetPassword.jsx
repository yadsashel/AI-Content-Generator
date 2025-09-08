import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import emailjs from "@emailjs/browser";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

export default function ResetPassword() {
  const [email, setEmail] = useState("");
  const [codeSent, setCodeSent] = useState(false);
  const [generatedCode, setGeneratedCode] = useState("");
  const [userCode, setUserCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Reset Password";
  }, []);

  const sendCode = async () => {
    if (!email.endsWith("@gmail.com")) return alert("Please enter a valid Gmail address.");

    const users = JSON.parse(localStorage.getItem("registeredUsers") || "[]");
    if (!users.find(u => u.email === email)) {
      return alert("Email not registered!");
    }

    const code = Math.floor(100000 + Math.random() * 900000);
    setGeneratedCode(code);

    try {
      await emailjs.send(
        "service_e7ofow1",
        "template_2ra6hk7",
        { email, code },
        "cZ3EttIuBjfGPaglJ"
      );
      setCodeSent(true);
      alert("Verification code sent! Check your Gmail.");
    } catch (err) {
      console.error(err);
      alert("Failed to send code. Try again.");
    }
  };

  const handleReset = () => {
    if (!codeSent) return alert("Please send the verification code first!");
    if (userCode !== generatedCode.toString()) return alert("Incorrect code!");
    if (newPassword.length < 8) return alert("Password must be at least 8 characters.");
    if (newPassword !== confirmPassword) return alert("Passwords do not match!");

    setLoading(true);
    const users = JSON.parse(localStorage.getItem("registeredUsers") || "[]");
    const index = users.findIndex(u => u.email === email);
    users[index].password = newPassword;
    localStorage.setItem("registeredUsers", JSON.stringify(users));

    alert("Password reset successfully! You can now login.");
    navigate("/login");
  };

  return (
    <div className="bg-[#0B1020] min-h-screen flex items-center justify-center text-white px-6">
      <motion.div
        variants={fadeUp}
        initial="hidden"
        animate="show"
        className="w-full max-w-md p-8 rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl"
      >
        <h2 className="text-3xl font-bold mb-6 text-center">Reset Password</h2>
        <div className="space-y-4">
          <input
            type="email"
            placeholder="Gmail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-fuchsia-400"
            disabled={codeSent}
          />
          <button
            onClick={sendCode}
            disabled={codeSent}
            className="w-full rounded-xl bg-fuchsia-500 px-5 py-3 font-semibold text-white shadow-lg hover:bg-fuchsia-600 transition disabled:opacity-50"
          >
            {codeSent ? "Code Sent" : "Send Verification Code"}
          </button>

          {codeSent && (
            <>
              <input
                type="text"
                placeholder="Verification Code"
                value={userCode}
                onChange={(e) => setUserCode(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-fuchsia-400"
              />
              <input
                type="password"
                placeholder="New Password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-fuchsia-400"
              />
              <input
                type="password"
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-fuchsia-400"
              />
              <button
                onClick={handleReset}
                disabled={loading}
                className="w-full rounded-xl bg-fuchsia-500 px-5 py-3 font-semibold text-white shadow-lg hover:bg-fuchsia-600 transition disabled:opacity-50"
              >
                {loading ? "Resetting..." : "Reset Password"}
              </button>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}