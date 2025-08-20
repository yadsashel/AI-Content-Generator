import { useState, useEffect } from "react";
import { motion } from "framer-motion";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

// =======================
// Sample Prompts per type
// =======================
const samplePrompts = {
  "Social Media Post": [
    "Write a short, catchy social media post promoting a new Moroccan Amlou product in 2–3 sentences.",
    "Create an Instagram caption highlighting the health benefits of Amlou in a fun way.",
    "Generate a witty Facebook post announcing our weekend Amlou discount."
  ],
  Email: [
    "Write a professional email to a customer announcing a 10% discount on our Moroccan Amlou products for this weekend only. Keep it friendly and persuasive.",
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
  ]
};

export default function Dashboard() {
  const [contentType, setContentType] = useState("Social Media Post");
  const [prompt, setPrompt] = useState("");
  const [generatedContent, setGeneratedContent] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    document.title = "Dashboard";
  }, []);

  const handleUseSamplePrompt = () => {
    const prompts = samplePrompts[contentType];
    if (prompts && prompts.length > 0) {
      const randomIndex = Math.floor(Math.random() * prompts.length);
      setPrompt(prompts[randomIndex]);
    }
  };

  const handleGenerate = async () => {
    if (!prompt) return alert("Enter a prompt first!");
    setLoading(true);
    setGeneratedContent("Generating...");
    try {
      const res = await fetch( `${import.meta.env.VITE_BACKEND_URL}/api/generate_fast`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`${res.status} ${res.statusText}: ${text}`);
      }

      const data = await res.json();
      // ✅ FIX: use data.output instead of data.answer
      setGeneratedContent(data.output || "No content returned");
    } catch (err) {
      setGeneratedContent("❌ Failed to generate content: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedContent);
    alert("Copied to clipboard!");
  };

  return (
    <div className="bg-[#0B1020] text-white min-h-screen">
      <section className="max-w-7xl mx-auto px-6 py-20">
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.3 }}
          className="grid md:grid-cols-2 gap-10 items-center"
        >
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

          {/* ====== GENERATED CONTENT BOX ====== */}
          <motion.div variants={fadeUp} className="relative">
            <div className="relative rounded-3xl border border-white/10 bg-gradient-to-tr from-white/10 to-white/5 p-5 backdrop-blur-xl shadow-2xl">
              <div className="rounded-2xl bg-[#0B1020]/60 border border-white/10 p-4 min-h-[120px] break-words">
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

      {/* ===== CONTENT GENERATOR ===== */}
      <section className="border-t border-white/10 bg-[#0C1226]">
        <div className="max-w-3xl mx-auto px-6 py-20">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="rounded-3xl border border-white/10 bg-white/5 p-6 md:p-8 backdrop-blur-xl"
          >
            <h3 className="text-2xl font-bold mb-4">Generate your content</h3>

            <div className="flex flex-col md:flex-row gap-3 mb-3">
              <select
                value={contentType}
                onChange={(e) => setContentType(e.target.value)}
                className="w-full md:w-1/3 rounded-xl border border-white/10 bg-[#0B1020]/60 px-4 py-3 text-white placeholder-white/40"
              >
                <option>Social Media Post</option>
                <option>Email</option>
                <option>Blog Article</option>
                <option>Ad Copy</option>
                <option>Caption</option>
              </select>

              <input
                type="text"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Enter your prompt here..."
                className="w-full rounded-xl border border-white/10 bg-[#0B1020]/60 px-4 py-3 text-white placeholder-white/40"
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
              className="w-full rounded-xl bg-white px-5 py-3 font-semibold text-slate-900 shadow-lg shadow-white/10 hover:-translate-y-0.5 transition disabled:opacity-50"
            >
              {loading ? "Generating..." : "Generate"}
            </button>
          </motion.div>
        </div>
      </section>
    </div>
  );
}