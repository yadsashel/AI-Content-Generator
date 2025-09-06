import { useState, useEffect } from "react";
import { motion } from "framer-motion";

const samplePrompts = {
  "Social Media Post": [
    "Write a short, catchy social media post promoting a new Moroccan Amlou product in 2–3 sentences.",
    "Create an Instagram caption highlighting the health benefits of Amlou in a fun way.",
    "Generate a witty Facebook post announcing our weekend Amlou discount."
  ],
  Email: [
    "Write a professional email to a customer announcing a 10% discount on our Moroccan Amlou products for this weekend only.",
    "Compose a warm welcome email for new subscribers introducing them to Amlou MiZahra and our story.",
    "Draft an email to inform customers about our new Amlou flavors launching this month."
  ],
  "Blog Article": [
    "Write a 300-word blog article about the history and health benefits of Moroccan Amlou.",
    "Generate a blog post explaining why Amlou is the perfect addition to breakfast or snacks.",
    "Write an informative blog post comparing traditional Moroccan Amlou recipes with modern variations."
  ],
  "Ad Copy": [
    "Create a short, persuasive ad copy to promote our Moroccan Amlou on Instagram Ads.",
    "Write a catchy Google Ads description for a special Amlou weekend sale.",
    "Generate a promotional text for a flyer advertising our new Amlou flavors."
  ],
  Caption: [
    "Write a fun Instagram caption for a picture of our freshly made Amlou.",
    "Create a short, engaging Twitter caption to announce a discount on Amlou.",
    "Generate a Pinterest caption highlighting the natural ingredients in our Amlou."
  ],
  AnythingElse: [
  "Write an Instagram caption for a picture of our freshly made Amlou.",
  "Create a short, engaging Twitter caption to announce a discount on Amlou.",
  "Generate a Pinterest caption highlighting the natural ingredients in our Amlou.",
  "Freeform: type anything—AI can generate posts, ads, blog intros, emails, captions, or anything you need!"
],
};

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

export default function Dashboard() {
  const [contentType, setContentType] = useState("Social Media Post");
  const [prompt, setPrompt] = useState("");
  const [generatedContent, setGeneratedContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [userPlan, setUserPlan] = useState("free");
  const [credits, setCredits] = useState(0);

  useEffect(() => {
    document.title = "Dashboard";
    fetchUserInfo();
  }, []);

  const fetchUserInfo = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setUserPlan(data.plan);
        setCredits(data.credit_remaining ?? "∞");
      }
    } catch (err) {
      console.error("Failed to fetch user info:", err);
    }
  };

  const handleUseSamplePrompt = () => {
    const prompts = samplePrompts[contentType];
    if (prompts?.length) {
      const randomIndex = Math.floor(Math.random() * prompts.length);
      setPrompt(prompts[randomIndex]);
    }
  };

  const handleGenerate = async () => {
    if (!prompt) return alert("Enter a prompt first!");

    setGeneratedContent("");
    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/generate_fast`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ prompt, chat_name: contentType }),
      });

      if (res.status === 403) {
        const data = await res.json();
        alert(data.error || "No credits left. Please upgrade your plan.");
        window.location.href = "/pricing";
        return;
      }

      const data = await res.json();
      if (data.output) {
        setGeneratedContent(data.output);
        setCredits(data.credit_remaining ?? "∞");
        setHistory(prev => [{ prompt, output: data.output, type: contentType, id: Date.now() }, ...prev]);
      } else if (data.error) {
        setGeneratedContent("❌ Error: " + data.error);
      }
    } catch (err) {
      setGeneratedContent("❌ Request failed. Try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedContent);
    alert("Copied to clipboard!");
  };

  const handleClearHistory = () => setHistory([]);

  return (
    <div className="bg-[#0B1020] text-white min-h-screen">
      {/* Top Bar with Plan + Credits */}
      <div className="bg-[#0C1226] border-b border-white/10 py-3 px-6 flex justify-between items-center">
        <span className="text-sm">Plan: <strong>{userPlan}</strong></span>
        <span className="text-sm">Credits: <strong>{credits}</strong></span>
      </div>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <motion.div initial="hidden" animate="show" className="grid md:grid-cols-2 gap-10 items-center">
          <motion.div variants={fadeUp} className="space-y-6">
            <h1 className="text-4xl font-extrabold md:text-6xl">
              Generate{" "}
              <span className="bg-gradient-to-r from-fuchsia-400 via-sky-300 to-violet-300 bg-clip-text text-transparent">
                AI-powered content
              </span>{" "}
              instantly
            </h1>
            <p className="text-white/70 md:text-lg">
              Create posts, emails, blog articles, ad copy, and captions tailored for any platform in seconds.
            </p>
          </motion.div>

          <motion.div variants={fadeUp} className="relative">
            <div className="rounded-3xl border border-white/10 bg-gradient-to-tr from-white/10 to-white/5 p-5 backdrop-blur-xl shadow-2xl">
              <div className="rounded-2xl bg-[#0B1020]/60 border border-white/10 p-4 max-h-[600px] overflow-auto break-words">
                <p className="text-sm text-white/80 whitespace-pre-wrap">
                  {generatedContent || "Your AI-generated content will appear here!"}
                </p>
              </div>
              {generatedContent && (
                <button
                  onClick={handleCopy}
                  className="mt-3 px-4 py-2 bg-white text-slate-900 rounded-xl font-semibold hover:bg-gray-200 transition"
                >
                  Copy
                </button>
              )}
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* Content Generator */}
      <section className="border-t border-white/10 bg-[#0C1226]">
        <div className="max-w-3xl mx-auto px-6 py-20">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 md:p-8 backdrop-blur-xl">
            <h3 className="text-2xl font-bold mb-4">Generate your content</h3>

            <div className="flex flex-col md:flex-row gap-3 mb-3">
              <select
                value={contentType}
                onChange={(e) => setContentType(e.target.value)}
                className="w-full md:w-1/3 rounded-xl border border-white/10 bg-[#0B1020]/60 px-4 py-3 text-white"
              >
                {Object.keys(samplePrompts).map(key => (
                  <option key={key}>{key}</option>
                ))}
              </select>

              <input
                type="text"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Enter your prompt here..."
                className="w-full rounded-xl border border-white/10 bg-[#0B1020]/60 px-4 py-3 text-white"
              />

              <button
                onClick={handleUseSamplePrompt}
                className="rounded-xl bg-gray-600 px-5 py-3 font-semibold text-white hover:bg-gray-500 transition"
              >
                Sample Prompt
              </button>
            </div>

            <button
              onClick={handleGenerate}
              disabled={loading}
              className="w-full rounded-xl bg-white px-5 py-3 font-semibold text-slate-900 shadow-lg hover:-translate-y-0.5 transition disabled:opacity-50"
            >
              {loading ? "Generating..." : "Generate"}
            </button>
          </div>

          {/* History */}
          {history.length > 0 && (
            <div className="mt-10 rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold">History</h3>
                <button
                  onClick={handleClearHistory}
                  className="px-3 py-1 bg-red-500 rounded-xl font-semibold hover:bg-red-400 transition"
                >
                  Clear All
                </button>
              </div>
              <div className="max-h-96 overflow-auto space-y-3">
                {history.map(item => (
                  <div key={item.id} className="rounded-xl bg-[#0B1020]/60 p-3 border border-white/10">
                    <p className="text-sm text-white/70 mb-2">
                      <strong>Prompt ({item.type}):</strong> {item.prompt}
                    </p>
                    <p className="text-sm text-white/80 whitespace-pre-wrap">{item.output}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}