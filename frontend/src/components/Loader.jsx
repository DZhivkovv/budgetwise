import { Oval } from 'react-loader-spinner';
import '../styles/containers.css';

/**
 * Loader component.
 *
 * Displays a centered spinner.
 * Can be used to indicate loading states in the application.
 *
 * @param {Object} props
 * @param {boolean} props.visibility - Determines if the loader is visible or hidden.
 * @returns {JSX.Element} A loader spinner element.
 */
const Loader = ({ visibility }) => {
  return (
    <div className={`g_loader__wrapper ${visibility ? "visible" : "hidden"}`}>
      <Oval
        height={80}
        width={80}
        color="#4d67a9ff"
        visible={visibility}
        ariaLabel="oval-loading"
        secondaryColor="#030f12ff"
        strokeWidth={2}
        strokeWidthSecondary={2}
      />
    </div>
  )
}

export default Loader;