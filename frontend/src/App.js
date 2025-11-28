import { Routes, Route } from 'react-router-dom';
// Component that protects routes so only authorized users can access them
import ProtectedRoute from './components/ProtectedRoute';

import NavigationBar from './components/NavigationBar';
import AuthProvider from './context/AuthContext';
import Homepage from './pages/Homepage';
import DashboardPage from './pages/Dashboard';
import LoginPage from './pages/Login';
import RegistrationPage from './pages/Registration';

function App() {

  return (
      <>
      <AuthProvider>
      <NavigationBar/>
        <Routes>
            <Route path='/' element={<Homepage/>}/>
            <Route path='/login' element={<LoginPage/>}/>
            <Route path='/register' element={<RegistrationPage/>}/>
            {/* Route to dashboard page. If the user is not authenticated, he will not be able to access it and will be redirected to the login page */}
            <Route path='/dashboard' element={
              <ProtectedRoute>
                <DashboardPage/>
              </ProtectedRoute>
            }/>
        </Routes>
      </AuthProvider>
      </>
  );
}

export default App;
