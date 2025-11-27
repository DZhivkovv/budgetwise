import { Link } from 'react-router-dom';
import LoginForm from './LoginForm';
import useRedirectIfAuthenticated from '../../hooks/useRedirectIfAuthenticated';
// Global CSS styles used across the whole application.
import '../../styles/images.css';
import '../../styles/layout.css';
import '../../styles/typography.css';
// Images
import piggybank from '../../assets/piggybank.png';
import logo from '../../assets/logo.png'

const LoginPage = () => {
  // A hook that checks if the user is already authenticated. If he is, he will be redirected to dashboard page.
  useRedirectIfAuthenticated('/dashboard');

  return (
    <main className='g_flex-container g_height-90'>
      {/* Left section of the page */}
      <section className='g_left-section'>    
        <div className="contentBox">

          {/* Introductory text */}
          <div className="g_text-center">
            <h2 className="g_title">Welcome</h2>
            <p className="g_subtitle">Let's get started</p>
          </div>

          {/* Login form component where the user inputs account details. */}
          <LoginForm/>
          
          {/* Navigation link for users who do not have an account. */}
          <div>
            Don't have an account? <Link to='/register' className="g_link">Register</Link>
          </div>

        </div>
      </section>

      {/* Right section of the page */}
      <section className='g_right-section'>
        <img src={piggybank} alt="A piggy bank" className="g_width-50 g_floating-image" />
      </section>

    </main>
  )
}

export default LoginPage