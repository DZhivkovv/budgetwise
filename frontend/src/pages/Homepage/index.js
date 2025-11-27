import useRedirectIfAuthenticated from '../../hooks/useRedirectIfAuthenticated'

// The app's homepage
const Homepage = () => {
    // A hook that checks if the user is already authenticated. If he is, he will be redirected to Dashboard page
    useRedirectIfAuthenticated('/dashboard');

    return (
    <div>Homepage</div>
  )
}

export default Homepage