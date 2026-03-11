import { Link } from "react-router-dom";
import useRedirectIfAuthenticated from "../../hooks/useRedirectIfAuthenticated";
import "./Homepage.css";

const Homepage = () => {
  // A hook that checks if the user is already authenticated. If he is, he will be redirected to Dashboard page
  useRedirectIfAuthenticated("/dashboard");

  return (
    <div className="homepage">
      <section className="hero">
        <h1>Take Control of Your Money</h1>

        <p>
          Track your expenses, manage your monthly budget, and achieve your
          financial goals.
        </p>

        <div className="hero-buttons">
          <Link to="/register" className="btn-primary">
            Get Started
          </Link>

          <Link to="/login" className="btn-secondary">
            Login
          </Link>
        </div>
      </section>

      <section className="features">
        <div className="feature">
          <h3>Track Expenses</h3>
          <p>
            Monitor where your money goes and understand your spending habits.
          </p>
        </div>

        <div className="feature">
          <h3>Set Financial Goals</h3>
          <p>
            Define spending limits or saving goals to stay financially
            disciplined.
          </p>
        </div>

        <div className="feature">
          <h3>Simple & Clear</h3>
          <p>
            A clean and intuitive interface designed to make budgeting easy.
          </p>
        </div>
      </section>
    </div>
  );
};

export default Homepage;
