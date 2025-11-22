import './App.css';
import { Routes, Route } from 'react-router-dom';

import AuthProvider from './context/AuthContext';
import LoginPage from './pages/Login';
import RegistrationPage from './pages/Registration';

function App() {

  return (
      <>
      <AuthProvider>
        <Routes>
            <Route path='/login' element={<LoginPage/>}/>
            <Route path='/register' element={<RegistrationPage/>}/>
        </Routes>
      </AuthProvider>
      </>
  );
}

export default App;
