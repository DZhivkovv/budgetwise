import { Link } from 'react-router-dom';
import RegistrationForm from './RegistrationForm'
import useRedirectIfAuthenticated from '../../hooks/useRedirectIfAuthenticated';

const RegistrationPage = () => {

  // A custom hook that checks if the user is already logged in. 
  // If the user is already logged in when trying to access this page,he will be redirected to the homepage.
  // As a result, he wont have access to this page
  useRedirectIfAuthenticated('/');

  return (
    <main>
        <h2>Register</h2>

        {/* Registration form component where the user inputs account details */}
        <RegistrationForm/>

        {/* Navigation link for users who already have an account */}
        <div>
          Already have an account? <Link to='/auth/login'>Login</Link>
        </div>
    </main>
  
  )
}

export default RegistrationPage