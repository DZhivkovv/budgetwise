import './App.css';
import { Routes, Route } from 'react-router-dom';

import AuthProvider from './context/AuthContext';
import Homepage from './pages/Homepage';
import DashboardPage from './pages/Dashboard';
import LoginPage from './pages/Login';
import RegistrationPage from './pages/Registration';

function App() {

  return (
      <>
      <AuthProvider>
        <Routes>
            <Route path='/' element={<Homepage/>}/>
            <Route path='/login' element={<LoginPage/>}/>
            <Route path='/register' element={<RegistrationPage/>}/>
            <Route path='/dashboard' element={<DashboardPage/>}/>
        </Routes>
      </AuthProvider>
      </>
  );
}

export default App;
