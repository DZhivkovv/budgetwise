import { Link } from "react-router-dom";
import useRedirectIfAuthenticated from "../../hooks/useRedirectIfAuthenticated";
import "./Homepage.css";

// Data
const FEATURES = [
  {
    icon: "📊",
    title: "Expense Tracking",
    description:
      "Categorize and visualize every transaction. Understand your spending patterns at a glance.",
    accent: false,
  },
  {
    icon: "🎯",
    title: "Financial Goals",
    description:
      "Set savings targets and spending limits. Stay on track with real-time progress indicators.",
    accent: true,
  },
  {
    icon: "📈",
    title: "Smart Reports",
    description:
      "Weekly and monthly summaries that reveal trends and opportunities to save more.",
    accent: false,
  },
  {
    icon: "⚡",
    title: "Instant Setup",
    description:
      "No lengthy onboarding. Create an account and start tracking in under two minutes.",
    accent: false,
  },
];

const TESTIMONIALS = [
  {
    quote: "Finally a budget app that doesn't overwhelm me.",
    author: "Maria K.",
    role: "Freelancer",
  },
  {
    quote: "I saved €400 in my first month using Budgetwise.",
    author: "Stefan R.",
    role: "Software Engineer",
  },
  {
    quote: "The goal tracking feature is genuinely life-changing.",
    author: "Elena T.",
    role: "Designer",
  },
];

// Components
const FeatureCard = ({ icon, title, description, accent }) => (
  <div className={`feature-card${accent ? " feature-card--accent" : ""}`}>
    <div className="feature-icon">{icon}</div>
    <h3>{title}</h3>
    <p>{description}</p>
  </div>
);

const TestimonialCard = ({ quote, author, role }) => (
  <div className="testimonial-card">
    <p className="testimonial-quote">"{quote}"</p>
    <div className="testimonial-author">
      <div className="testimonial-avatar">{author[0]}</div>
      <div>
        <p className="testimonial-name">{author}</p>
        <p className="testimonial-role">{role}</p>
      </div>
    </div>
  </div>
);

const HeroSection = () => (
  <section className="hero">
    <div className="hero-badge">Personal Finance, Simplified</div>
    <h1 className="hero-title">
      Take Control of <br />
      <span className="hero-accent">Your Money</span>
    </h1>
    <p className="hero-subtitle">
      Track expenses, set goals, and build the financial future you deserve —
      all in one beautifully simple dashboard.
    </p>
    <div className="hero-buttons">
      <Link to="/register" className="btn-primary">
        Start for Free
      </Link>
      <Link to="/login" className="btn-ghost">
        Sign In →
      </Link>
    </div>
  </section>
);

const FeaturesSection = () => (
  <section className="features">
    <div className="section-label">What You Get</div>
    <h2 className="section-title">Everything you need, nothing you don't</h2>
    <div className="features-grid">
      {FEATURES.map((feature) => (
        <FeatureCard key={feature.title} {...feature} />
      ))}
    </div>
  </section>
);

const TestimonialsSection = () => (
  <section className="testimonials">
    <div className="testimonial-track">
      {TESTIMONIALS.map((testimonial) => (
        <TestimonialCard key={testimonial.author} {...testimonial} />
      ))}
    </div>
  </section>
);

const CtaSection = () => (
  <section className="cta">
    <h2 className="cta-title">Ready to change how you manage money?</h2>
    <p className="cta-sub">
      It's never been easier to take control of your finances.
    </p>
    <Link to="/register" className="btn-primary btn-lg">
      Create Your Free Account
    </Link>
  </section>
);

const Footer = () => (
  <footer className="footer">
    <span className="footer-logo">Budgetwise</span>
    <span className="footer-copy">
      © {new Date().getFullYear()} All rights reserved.
    </span>
  </footer>
);

// Page component
const Homepage = () => {
  useRedirectIfAuthenticated("/dashboard");

  return (
    <div className="homepage">
      <HeroSection />
      <FeaturesSection />
      <TestimonialsSection />
      <CtaSection />
      <Footer />
    </div>
  );
};

export default Homepage;
