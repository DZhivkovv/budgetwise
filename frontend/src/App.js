import './App.css';
import { Routes, Route } from 'react-router-dom';

import Homepage from './pages/Homepage';
import AuthProvider from './context/AuthContext';
import LoginPage from './pages/Login';
import RegistrationPage from './pages/Registration';

function App() {

  return (
      <>
      <AuthProvider>
        <Routes>
            <Route path='/auth/login' element={<LoginPage/>}/>
            <Route path='/auth/register' element={<RegistrationPage/>}/>
        </Routes>
      </AuthProvider>
      </>
  );
}

export default App;
