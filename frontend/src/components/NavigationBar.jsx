import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Link } from 'react-router-dom';

import logo from '../assets/logo.png';

// Global CSS styles.
import '../styles/navigation.css';

const NavigationBar = () => {
    // A context that tracks if the user is logged in or not
    const { isLoggedIn } = useContext(AuthContext);

    // Placeholder navigation links.
    let links = ['Home', 'Settings'];
    // Authentication-related links
    const authenticationLinks = isLoggedIn ? ['Sign Out'] : ['Log In', 'Sign Up'];

    return (
        <nav className='g_navbar g_height-10'>
            <div className='g_navbar__section'>
                {/* Logo */}
                <div className='g_navbar__logo-container'>
                    <img src={logo} className="g_logo" alt="Budgetwise" />
                </div>
                <div className='g_navbar__links-container'>
                    {/* Navigation links */}
                    {links.map( link => <Link className='g_navbar__item' key={link}>{link}</Link> )}
                </div>
            </div>
            <div className='g_navbar__section'>
                {/* Authentication-related links */}
                {authenticationLinks.map( link => <Link className='g_navbar__item' key={link}>{link}</Link>)}
            </div>
        </nav>
    )
}

export default NavigationBar