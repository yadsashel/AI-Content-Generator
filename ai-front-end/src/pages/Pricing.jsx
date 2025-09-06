import { useState, useEffect } from "react";
import { motion } from "framer-motion";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

// 🔥 Gumroad product links (replace with your real slugs)
const GUMROAD_PRODUCTS = {
  starter: "uivryd",    // Starter plan
  pro: "dnvjmb",        // Pro plan
  flexible: "ntaktl",   // Flexible pay-as-you-go
};

export default function Pricing() {
  const [loading, setLoading] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [planMetadata, setPlanMetadata] = useState({});

  useEffect(() => {
    document.title = "Pricing - AI Content Generator";
    fetchUserProfile();
    fetchPlanMetadata();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setUserProfile(data);
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    }
  };

  const fetchPlanMetadata = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/plans`);
      if (response.ok) {
        const data = await response.json();
        setPlanMetadata(data);
      }
    } catch (error) {
      console.error("Error fetching plans:", error);
    }
  };

  const handleSubscribe = (planName) => {
    const slug = GUMROAD_PRODUCTS[planName];
    if (!slug) {
      alert("Plan not available yet.");
      return;
    }
    setLoading(true);
    window.location.href = `https://gumroad.com/l/${slug}`;
  };

  const plans = [
    {
      name: "free",
      title: "Free Trial",
      price: "$0",
      period: "one-time",
      credits: planMetadata.free?.credits || 10,
      features: [
        "10 generations total",
        "Basic AI model",
        "Standard quality",
        "Community support",
        "Perfect for testing",
      ],
      buttonText: userProfile?.plan === "free" ? "Current Plan" : "Get Started",
      popular: false,
    },
    {
      name: "starter",
      title: "Starter",
      price: "$2.99",
      period: "per month",
      credits: planMetadata.starter?.credits || 500,
      features: [
        "500 generations/month",
        "Enhanced AI model",
        "Better quality outputs",
        "Email support",
        "Perfect for individuals",
      ],
      buttonText: userProfile?.plan === "starter" ? "Current Plan" : "Choose Starter",
      popular: true,
    },
    {
      name: "pro",
      title: "Professional",
      price: "$6.99",
      period: "per month",
      credits: planMetadata.pro?.credits || 2500,
      features: [
        "2,500 generations/month",
        "Premium AI model",
        "Highest quality content",
        "Priority support",
        "Advanced system prompts",
        "Perfect for businesses",
      ],
      buttonText: userProfile?.plan === "pro" ? "Current Plan" : "Choose Pro",
      popular: false,
    },
    {
      name: "flexible",
      title: "Pay-as-you-go",
      price: "$0.99 / 30 generations",
      period: "per usage",
      credits: "Unlimited",
      features: [
        "Pay only for what you use",
        "Premium AI model",
        "Highest quality content",
        "Priority support",
        "Advanced system prompts",
        "Ideal for 2500+ generations/month",
      ],
      buttonText: userProfile?.plan === "flexible" ? "Current Plan" : "Choose Flexible",
      popular: false,
    },
  ];

  return (
    <div className="bg-[#0B1020] text-white min-h-screen">
      <section className="max-w-7xl mx-auto px-6 py-20">
        <motion.div
          initial="hidden"
          animate="show"
          variants={fadeUp}
          className="text-center space-y-6 mb-16"
        >
          <h1 className="text-4xl font-extrabold md:text-6xl">
            Choose Your{" "}
            <span className="bg-gradient-to-r from-fuchsia-400 via-sky-300 to-violet-300 bg-clip-text text-transparent">
              Perfect Plan
            </span>
          </h1>
          <p className="text-white/70 md:text-lg max-w-2xl mx-auto">
            Scale your content creation with our flexible pricing plans. Start free and upgrade as you grow.
          </p>

          {userProfile && (
            <div className="inline-flex items-center gap-4 bg-white/5 border border-white/10 rounded-xl px-6 py-3">
              <div className="text-sm">
                <span className="text-white/60">Current Plan:</span>{" "}
                <span className="font-semibold text-white capitalize">{userProfile.plan}</span>
              </div>
              <div className="text-sm">
                <span className="text-white/60">Credits:</span>{" "}
                <span className="font-semibold text-green-400">
                  {userProfile.plan === "flexible"
                    ? "Unlimited"
                    : userProfile.credit_remaining}
                </span>
              </div>
            </div>
          )}
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className={`relative rounded-3xl border p-8 backdrop-blur-xl ${
                plan.popular
                  ? "border-fuchsia-500/50 bg-gradient-to-tr from-fuchsia-500/10 to-violet-500/10"
                  : "border-white/10 bg-white/5"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <div className="bg-gradient-to-r from-fuchsia-500 to-violet-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
                    Most Popular
                  </div>
                </div>
              )}

              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold">{plan.title}</h3>
                  <div className="flex items-baseline gap-2 mt-2">
                    <span className="text-3xl font-extrabold">{plan.price}</span>
                    <span className="text-white/60">{plan.period}</span>
                  </div>
                  <p className="text-white/60 text-sm mt-2">
                    {typeof plan.credits === "number" ? `${plan.credits} generations` : plan.credits}
                  </p>
                </div>

                <ul className="space-y-3">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-3 text-sm">
                      <div className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center">
                        <svg
                          className="w-3 h-3 text-green-500"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                      <span className="text-white/80">{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handleSubscribe(plan.name)}
                  disabled={loading || userProfile?.plan === plan.name}
                  className={`w-full rounded-xl px-6 py-3 font-semibold transition ${
                    userProfile?.plan === plan.name
                      ? "bg-gray-600 text-gray-300 cursor-not-allowed"
                      : plan.popular
                      ? "bg-gradient-to-r from-fuchsia-500 to-violet-500 text-white hover:from-fuchsia-600 hover:to-violet-600"
                      : "bg-white text-slate-900 hover:bg-gray-200"
                  }`}
                >
                  {loading ? "Redirecting..." : plan.buttonText}
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}