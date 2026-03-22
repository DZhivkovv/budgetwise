import { Link } from "react-router-dom";
import useRedirectIfAuthenticated from "../../hooks/useRedirectIfAuthenticated";

import RegistrationForm from "./RegistrationForm";

import piggybank from "../../assets/piggybank.png";
import "../../styles/forms.css";
import "../../styles/images.css";
import "../../styles/layout.css";
import "../../styles/typography.css";

const RegistrationPage = () => {
  // Redirect to dashboard page if already logged in.
  useRedirectIfAuthenticated("/dashboard");

  return (
    <main className="g_items-in-a-row g_items-in-a-row--flex-wrap--nowrap g_height-90">
      <section className="g_left-section">
        <div>
          <div className="g_text-center">
            <h2 className="g_title">Create Account🎉</h2>
            <p className="g_subtitle">
              Join us and start managing your budget today.
            </p>
          </div>

          <RegistrationForm />

          <div className="g_page-footer-link">
            Already have an account?{" "}
            <Link to="/login" className="g_link g_link--color--black">
              Login
            </Link>
          </div>
        </div>
      </section>

      <section className="g_right-section">
        <img src={piggybank} alt="A piggy bank" className="g_floating-image" />
      </section>
    </main>
  );
};

export default RegistrationPage;
