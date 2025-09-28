import './App.css';
import { Routes, Route } from 'react-router-dom';

import Homepage from './pages/Homepage';
import AuthProvider from './context/AuthContext';
import LoginPage from './pages/Login';
import RegisterPage from './pages/Register';

function App() {

  return (
      <>
      <AuthProvider>
        <Routes>
            <Route path='/' element={<Homepage/>}/>
            <Route path='/auth/login' element={<LoginPage/>}/>
            <Route path='/auth/register' element={<RegisterPage/>}/>
        </Routes>
      </AuthProvider>
      </>
  );
}

export default App;
