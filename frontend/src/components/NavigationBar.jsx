import { MAIN_LINKS, AUTH_LINKS_PRIVATE, AUTH_LINKS_PUBLIC } from '../constants/navigationLinks';
import { useContext, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { NavLink } from 'react-router-dom';
import logo from '../assets/logo.png';
import '../styles/navigation.css';

/**
 * NavigationBar component.
 *
 * Renders the navigation bar for the app.
 * Features:
 *  - Logo
 *  - Hamburger menu (for mobile)
 *  - Links
 *
 * @returns {JSX.Element} The navigation bar component.
 */
const NavigationBar = () => {
    // Auth state used to show correct authentication links
    const { isLoggedIn } = useContext(AuthContext);

    // Authentication links change based on login status
    const authLinks = isLoggedIn ? AUTH_LINKS_PRIVATE : AUTH_LINKS_PUBLIC;

    // State to toggle mobile menu open/close
    const [isOpen, setIsOpen] = useState(false);

    return (
        <nav className={`g_navbar ${isOpen ? 'g_navbar--open' : ''}`}>
            <div className='g_navbar__section'>
                {/* Logo */}
                <img src={logo} className="g_logo" alt="Budgetwise" />

                {/* Hamburger button for mobile */}
                <button
                    className="g_navbar__toggle"
                    onClick={() => setIsOpen(prev => !prev)}
                    aria-label="Toggle navigation"
                >
                    ☰
                </button>
            </div>

            {/* Main navigation links */}
            <div className="g_navbar__links-container">
                {MAIN_LINKS.map(link => (
                    <NavLink
                        key={link.label}
                        to={link.path}
                        className={({ isActive }) =>
                            isActive ? "g_navbar__item g_navbar__item__active" : "g_navbar__item"
                        }
                        onClick={() => setIsOpen(false)} // Close menu on link click
                    >
                        {link.label}
                    </NavLink>
                ))}
            </div>

            {/* Authentication links */}
            <div className="g_navbar__auth-container">
                {authLinks.map(link => (
                    <NavLink
                        key={link.label}
                        to={link.path}
                        className={({ isActive }) =>
                            isActive ? "g_navbar__item g_navbar__item__active" : "g_navbar__item"
                        }
                        onClick={() => setIsOpen(false)} // Close menu on click
                    >
                        {link.label}
                    </NavLink>
                ))}
            </div>
        </nav>
    );
};

export default NavigationBar;