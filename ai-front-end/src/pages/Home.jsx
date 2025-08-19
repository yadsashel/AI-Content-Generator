import React, { useEffect } from "react";
import { motion } from "framer-motion";

/* -------------------- tiny helpers -------------------- */
const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};
const stagger = { show: { transition: { staggerChildren: 0.12 } } };

/* -------------------- page -------------------- */
export default function Home() {
   
   useEffect(() => {
    document.title = "Home - AI Content Generator"; // this sets the browser tab name
  }, []);

  return (
    <div className="bg-[#0B1020] text-white">
      {/* ===== HERO ===== */}
      <section id="hero" className="relative overflow-hidden">
        {/* gradient glow */}
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div className="absolute -top-40 left-1/2 h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-purple-600/30 blur-[120px]" />
          <div className="absolute top-40 right-1/4 h-[420px] w-[420px] rounded-full bg-blue-500/20 blur-[100px]" />
        </div>

        <div className="max-w-7xl mx-auto px-6 pt-28 pb-20 md:pt-36">
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.3 }}
            className="grid md:grid-cols-2 gap-10 items-center"
          >
            <motion.div variants={fadeUp} className="space-y-6">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs md:text-sm text-white/80 backdrop-blur">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400" />
                New • AI content in seconds
              </span>

              <h1 className="text-4xl leading-tight font-extrabold md:text-6xl">
                Create <span className="bg-gradient-to-r from-fuchsia-400 via-sky-300 to-violet-300 bg-clip-text text-transparent">scroll-stopping</span> content with AI.
              </h1>

              <p className="text-white/70 md:text-lg">
                Generate posts, threads, captions, ad copy & blog intros tailored for each platform — Instagram, X/Twitter, LinkedIn, TikTok, and more.
              </p>

              <div className="flex flex-col sm:flex-row gap-3">
                <a
                  href="#try"
                  className="inline-flex items-center justify-center rounded-xl bg-white text-slate-900 px-5 py-3 font-semibold shadow-lg shadow-white/10 transition hover:-translate-y-0.5"
                >
                  Try the live demo
                  <svg className="ml-2 h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <path d="M7 17L17 7M17 7H8M17 7V16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </a>
                <a
                  href="#features"
                  className="inline-flex items-center justify-center rounded-xl border border-white/15 bg-white/5 px-5 py-3 font-semibold text-white/90 backdrop-blur transition hover:bg-white/10"
                >
                  See features
                </a>
              </div>

              {/* trust row */}
              <div className="flex items-center gap-6 pt-4">
                <div className="flex -space-x-2">
                  {["https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=120",
                    "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?q=80&w=120",
                    "https://images.unsplash.com/photo-1502685104226-ee32379fefbe?q=80&w=120"].map((src, i) => (
                    <img key={i} src={src} alt="" className="h-9 w-9 rounded-full ring-2 ring-[#0B1020] object-cover" />
                  ))}
                </div>
                <p className="text-sm text-white/60">
                  Loved by creators & marketers
                </p>
              </div>
            </motion.div>

            <motion.div variants={fadeUp} className="relative">
              {/* mock “glass” preview */}
              <div className="relative rounded-3xl border border-white/10 bg-gradient-to-tr from-white/10 to-white/5 p-5 backdrop-blur-xl shadow-2xl">
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full bg-red-400" />
                    <span className="h-3 w-3 rounded-full bg-amber-400" />
                    <span className="h-3 w-3 rounded-full bg-emerald-400" />
                  </div>
                  <span className="text-xs text-white/60">AI Draft • Instagram Caption</span>
                </div>

                <div className="rounded-2xl bg-[#0B1020]/60 border border-white/10 p-4">
                  <p className="text-sm text-white/80">
                    “Launching our new summer line ☀️ Minimal, comfy, and made to move. Drop a 🌊 if you’re ready!”
                  </p>
                </div>

                <div className="mt-4 grid grid-cols-3 gap-3">
                  {[
                    "https://images.unsplash.com/photo-1520975602308-5cbf0c5a3a19?q=80&w=500",
                    "https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?q=80&w=500",
                    "https://images.unsplash.com/photo-1553532435-93d55e2b8f3d?q=80&w=500",
                  ].map((src, i) => (
                    <img key={i} src={src} alt="" className="h-24 w-full rounded-xl object-cover" />
                  ))}
                </div>

                <motion.button
                  whileTap={{ scale: 0.98 }}
                  className="mt-5 w-full rounded-2xl bg-white px-5 py-3 font-semibold text-slate-900 shadow-lg shadow-white/10"
                  onClick={() => {
                    const el = document.getElementById("try");
                    el?.scrollIntoView({ behavior: "smooth" });
                  }}
                >
                  Generate another draft
                </motion.button>
              </div>
              {/* floating orb */}
              <motion.div
                initial={{ y: -10 }}
                animate={{ y: 10 }}
                transition={{ repeat: Infinity, repeatType: "reverse", duration: 2.2, ease: "easeInOut" }}
                className="pointer-events-none absolute -right-6 -top-6 h-20 w-20 rounded-full bg-fuchsia-500/40 blur-2xl"
              />
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ===== LOGOS ===== */}
      <section className="border-t border-white/10 bg-[#0C1226]">
        <div className="max-w-7xl mx-auto px-6 py-10">
          <p className="text-center text-white/50 text-sm mb-6">Optimized for every platform</p>
          <div className="flex flex-wrap items-center justify-center gap-6 opacity-80">
            {["Instagram","X / Twitter","LinkedIn","YouTube","TikTok","Facebook"].map((n) => (
              <span key={n} className="text-white/60 text-sm md:text-base">{n}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ===== FEATURES ===== */}
      <section id="features" className="relative">
        <div className="max-w-7xl mx-auto px-6 py-20">
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.2 }}
            className="grid md:grid-cols-3 gap-6"
          >
            {[
              {
                title: "Platform-aware",
                desc: "Tone, length, and hashtags tuned per platform automatically.",
                icon: "✨",
              },
              {
                title: "Brand voice",
                desc: "Train with 3–5 samples to match your style every time.",
                icon: "🎙️",
              },
              {
                title: "One-click variants",
                desc: "Generate A/B options and pick your favorite in seconds.",
                icon: "⚡",
              },
            ].map((f, i) => (
              <motion.div
                key={i}
                variants={fadeUp}
                className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl"
              >
                <div className="mb-3 text-2xl">{f.icon}</div>
                <h3 className="text-xl font-semibold">{f.title}</h3>
                <p className="text-white/70 mt-2">{f.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ===== SHOWCASE / HOW IT WORKS ===== */}
      <section className="border-t border-white/10 bg-[#0C1226]">
        <div className="max-w-7xl mx-auto px-6 py-20">
          <div className="grid md:grid-cols-2 gap-10 items-center">
            <motion.div
              variants={fadeUp}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              className="space-y-4"
            >
              <h2 className="text-3xl md:text-4xl font-bold">From idea → post in under 30s</h2>
              <ul className="space-y-3 text-white/80">
                <li className="flex gap-3">
                  <span className="mt-1.5 h-2 w-2 rounded-full bg-emerald-400" />
                  Paste an idea or brief — we’ll outline, caption, and hashtag it.
                </li>
                <li className="flex gap-3">
                  <span className="mt-1.5 h-2 w-2 rounded-full bg-sky-400" />
                  Choose a platform and voice (casual, playful, expert).
                </li>
                <li className="flex gap-3">
                  <span className="mt-1.5 h-2 w-2 rounded-full bg-fuchsia-400" />
                  Get ready-to-publish copy with platform best practices.
                </li>
              </ul>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="rounded-3xl overflow-hidden border border-white/10"
            >
              <img
                src="https://images.unsplash.com/photo-1517142089942-ba376ce32a2e?q=80&w=1400"
                alt="Showcase"
                className="w-full h-full object-cover"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* ===== CTA / DEMO INPUT ===== */}
      <section id="try" className="relative">
        <div className="max-w-3xl mx-auto px-6 py-20">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="rounded-3xl border border-white/10 bg-white/5 p-6 md:p-8 backdrop-blur-xl"
          >
            <h3 className="text-2xl font-bold mb-4">Try a quick prompt</h3>
            <div className="flex flex-col md:flex-row gap-3">
              <input
                type="text"
                placeholder="e.g. Launch post for eco water bottle"
                className="w-full rounded-xl border border-white/10 bg-[#0B1020]/60 px-4 py-3 outline-none placeholder:text-white/40"
              />
              <button className="rounded-xl bg-white px-5 py-3 font-semibold text-slate-900 shadow-lg shadow-white/10 hover:-translate-y-0.5 transition">
                Generate draft
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ===== SERVICES ===== */}
      <section id="services" className="border-t border-white/10 bg-[#0C1226]">
        <div className="max-w-7xl mx-auto px-6 py-20">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">Services</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              ["Social Posts", "Instagram, X/Twitter, LinkedIn, TikTok"],
              ["Blog Intros", "SEO-friendly hooks and outlines"],
              ["Ad Copy", "Thumb-stopping headlines + CTAs"],
              ["Email Drafts", "Announcements & newsletters"],
              ["Hashtags", "Smart, non-spammy tags"],
              ["Repurposing", "Turn a thread into a LinkedIn post"],
            ].map(([title, desc], i) => (
              <div key={i} className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
                <h4 className="text-xl font-semibold">{title}</h4>
                <p className="text-white/70 mt-1">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CONTACT / FOOTER ===== */}
      <footer id="contact" className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-16 grid md:grid-cols-2 gap-10">
          <div>
            <h3 className="text-2xl font-bold">Let’s build your content engine</h3>
            <p className="mt-2 text-white/70">
              Questions, feedback, or collabs? I’d love to hear from you.
            </p>
          </div>
          <form
            onSubmit={(e) => e.preventDefault()}
            className="grid gap-3"
          >
            <input
              className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 placeholder:text-white/40"
              placeholder="Your name"
            />
            <input
              type="email"
              className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 placeholder:text-white/40"
              placeholder="Email"
            />
            <textarea
              rows={4}
              className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 placeholder:text-white/40"
              placeholder="Message"
            />
            <button className="justify-self-start rounded-xl bg-white px-5 py-3 font-semibold text-slate-900 shadow-lg shadow-white/10">
              Send message
            </button>
          </form>
        </div>
        <div className="border-t border-white/10 py-6 text-center text-white/50 text-sm">
          © {new Date().getFullYear()} AI Content Generator •
        </div>
      </footer>
    </div>
  );
}
