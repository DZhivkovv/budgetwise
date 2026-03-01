import { Routes, Route } from 'react-router-dom';
import AppProviders from './providers/AppProviders';

import NavigationBar from './components/NavigationBar';
import ProtectedRoute from './components/ProtectedRoute';

import Homepage from './pages/Homepage';
import LoginPage from './pages/Login';
import RegistrationPage from './pages/Registration';
import LogoutPage from './pages/Logout';
import DashboardPage from './pages/Dashboard';
import StatisticsPage from './pages/Statistics';

function App() {

  return (
    <>
      <AppProviders>
        <NavigationBar/>
        <Routes>
          <Route path='/' element={<Homepage/>}/>
          <Route path='/login' element={<LoginPage/>}/>
          <Route path='/register' element={<RegistrationPage/>}/>
          <Route path='/logout' element={<LogoutPage/>}/>

          <Route path='/dashboard' element={
            <ProtectedRoute>
              <DashboardPage/>
            </ProtectedRoute>
          }/>

          <Route path='/statistics' element={
            <ProtectedRoute>
              <StatisticsPage/>
            </ProtectedRoute>
          }/>
        </Routes>
      </AppProviders>
      </>
  );
}

export default App;
