import { Link } from 'react-router-dom';
import LoginForm from './LoginForm';
import useRedirectIfAuthenticated from '../../hooks/useRedirectIfAuthenticated';

const LoginPage = () => {
  // A custom hook that checks if the user is already logged in. 
  // If the user is already logged in when trying to access this page,he will be redirected to the homepage.
  // As a result, he wont have access to this page.
  useRedirectIfAuthenticated('/');

  return (
    <main>
        <h2>Login</h2>

        {/* Login form component where the user inputs account details. */}
        <LoginForm/>

        {/* Navigation link for users who do not have an account. */}
        <div>
          Don't have an account? <Link to='/auth/register'>Register</Link>
        </div>
    </main>
  )
}

export default LoginPage