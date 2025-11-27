import { Link } from 'react-router-dom';
// Components
import RegistrationForm from './RegistrationForm';
// Hooks
import useRedirectIfAuthenticated from '../../hooks/useRedirectIfAuthenticated';
// Global CSS styles.
import '../../styles/forms.css';
import '../../styles/images.css';
import '../../styles/layout.css';
import '../../styles/typography.css';
// Page-specific CSS styles.
import './Registration.css';
// Images
import piggybank from '../../assets/piggybank.png';

const RegistrationPage = () => {
  // A hook that checks if the user is already authenticated. If he is, he will be redirected to dashboard page.
  useRedirectIfAuthenticated('/dashboard');

  return (
  <main className='g_flex-container g_height-90'>

    {/* Left section of the page */}
    <section className='g_left-section'>    

      <div className="contentBox">

        <div className="g_text-center">
          <h2 className="g_title">Welcome</h2>
          <p className="g_subtitle">Let's get started</p>
        </div>

        {/* Registration form component where the user inputs account details. */}
        <RegistrationForm />

          {/* Navigation link for users who already have an account. */}
        <div> Already have an account? <Link to="/login" className="g_link">Login</Link> </div>

      </div>
    </section>

    {/* Right section of the page */}
    <section className='g_right-section'>
      <img src={piggybank} alt="A piggy bank" className="g_width-50 g_floating-image" />
    </section>

  </main>
  );
};

export default RegistrationPage;
