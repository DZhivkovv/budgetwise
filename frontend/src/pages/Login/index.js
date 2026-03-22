import { Link } from "react-router-dom";
import useRedirectIfAuthenticated from "../../hooks/useRedirectIfAuthenticated";

import LoginForm from "./LoginForm";

import piggybank from "../../assets/piggybank.png";
import "../../styles/images.css";
import "../../styles/layout.css";
import "../../styles/typography.css";
import "../../styles/containers.css";

const LoginPage = () => {
  useRedirectIfAuthenticated("/dashboard");

  return (
    <main className="g_items-in-a-row g_items-in-a-row--flex-wrap--nowrap g_height-90">
      <section className="g_left-section">
        <div>
          <h2 className="g_title">Welcome back 👋</h2>
          <p className="g_subtitle">
            Enter your details to access your dashboard.
          </p>

          <LoginForm />

          <div className="g_page-footer-link">
            Don't have an account?{" "}
            <Link to="/register" className="g_link g_link--color--black">
              Register
            </Link>
          </div>
        </div>
      </section>

      <section className="g_right-section">
        <img src={piggybank} alt="Illustration" className="g_floating-image" />
      </section>
    </main>
  );
};

export default LoginPage;
