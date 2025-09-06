import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

/* -------------------- tiny helpers -------------------- */
const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

/* -------------------- FAQ component -------------------- */
export default function FAQ() {
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "FAQ - AI Content Generator";
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const [openIndex, setOpenIndex] = useState(null);
  const [showTopBtn, setShowTopBtn] = useState(false);

  const toggleIndex = (i) => setOpenIndex(openIndex === i ? null : i);

  const handleScroll = () => {
    if (window.scrollY > 300) setShowTopBtn(true);
    else setShowTopBtn(false);
  };

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  const goToHome = () => {
    navigate("/"); // navigates to Home route
    setTimeout(() => {
      const hero = document.getElementById("hero");
      hero?.scrollIntoView({ behavior: "smooth" });
    }, 50); // slight delay to ensure page has navigated
  };

  const faqs = [
    {
      question: "I just registered but I can't see my profile or dashboard buttons. What should I do?",
      answer:
        "After registration, please refresh the page. This will make your profile and dashboard buttons appear on the navbar.",
    },
    {
      question: "How do I generate AI content?",
      answer:
        "Once you are logged in, go to your dashboard. From there, you can generate posts, threads, captions, ad copy, or blog intros. The 'Try a quick prompt' section on the homepage will redirect to registration if you are not logged in, so always use the dashboard.",
    },
    {
      question: "Can I edit or customize the AI-generated drafts?",
      answer:
        "Yes! You can copy the drafts into your preferred editor and modify them. The AI provides a starting point tailored for each platform.",
    },
    {
      question: "Which platforms are supported?",
      answer:
        "We support all platforms including Instagram, X/Twitter, LinkedIn, TikTok, YouTube, and Facebook. Each draft is optimized for platform-specific formatting.",
    },
    {
      question: "How often can I generate content?",
      answer:
        "You can generate as many drafts as you need! Experimenting is encouraged to get the style and tone that fits your brand.",
    },
    {
      question: "Who can I contact for feedback or issues?",
      answer:
        "Use the contact form at the bottom of the homepage. All messages go directly to our team at webusineservices@gmail.com.",
    },
    {
      question: "Can I unsubscribe from a subscription plan?",
      answer: (
        <>
          <p>You can cancel your subscription anytime with no issues. Just follow these steps:</p>
          <ol className="ml-6 list-decimal text-white/80">
            <li>Log in to your Gumroad account.</li>
            <li>Go to your Purchases or Library.</li>
            <li>Find the subscription plan you want to cancel.</li>
            <li>Click on it and select "Cancel".</li>
          </ol>
          <p>
            Once canceled, your subscription will stop immediately, and you won’t be charged for the next period. Gumroad handles everything — quick and easy!
          </p>
        </>
      ),
    },
  ];

  return (
    <div className="bg-[#0B1020] text-white min-h-screen py-20 relative">
      <div className="max-w-4xl mx-auto px-6">

        {/* ----------------- NEW USER NOTE ----------------- */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="bg-purple-600/20 border border-purple-400 text-purple-50 rounded-xl p-4 mb-8 text-center"
        >
          <strong>Note for new users:</strong> Refresh the page after registering to see your profile and dashboard buttons.
        </motion.div>

        <motion.h1
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="text-4xl md:text-5xl font-extrabold text-center mb-12"
        >
          Frequently Asked Questions
        </motion.h1>

        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="space-y-4"
        >
          {faqs.map((faq, i) => (
            <div
              key={i}
              className="border border-white/10 rounded-2xl bg-white/5 backdrop-blur-xl p-5 cursor-pointer"
              onClick={() => toggleIndex(i)}
            >
              <div className="flex justify-between items-center">
                <h3 className="text-lg md:text-xl font-semibold">{faq.question}</h3>
                <span className="text-2xl">{openIndex === i ? "−" : "+"}</span>
              </div>
              {openIndex === i && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-3 text-white/70"
                >
                  {faq.answer}
                </motion.div>
              )}
            </div>
          ))}
        </motion.div>

        {/* Back to Home button */}
        <div className="flex justify-center mt-12">
          <button
            onClick={goToHome}
            className="rounded-xl bg-white px-6 py-3 text-slate-900 font-semibold shadow-lg shadow-white/20 hover:-translate-y-0.5 transition"
          >
            Back to Home
          </button>
        </div>
      </div>

      {/* Scroll to top button */}
      {showTopBtn && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 rounded-full bg-purple-600 hover:bg-purple-700 text-white p-4 shadow-lg shadow-black/40 transition"
        >
          ↑
        </button>
      )}
    </div>
  );
}