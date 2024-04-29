import './App.css';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import CheckLoggedIn from './pages/checkLoggedIn/checkLoggedIn';
import LoginPage from './pages/loginPage/loginPage';
import RegisterPage from './pages/registerPage/registerPage';
import Dashboard from './pages/dashboard/dashboard';
import DashboardRestaurant from './pages/dashboardRestaurant/dashboardRestaurant';
import DashboardDelivery from './pages/dashboardDelivery/dashboardDelivery';
import RestaurantIndividual from './pages/restaurantIndividual/restaurantIndividual';

function App() {
  return (
    <div className="App">
      <Router>
        <Routes>
          <Route path="/"  element={<CheckLoggedIn/>}/>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/dashboard-client" element={<Dashboard />} />
          <Route path="/dashboard-restaurant" element={<DashboardRestaurant/>} />
          <Route path="/dashboard-restaurant/:restaurantName/:restaurantId" element={<RestaurantIndividual/>} />
          <Route path="/dashboard-delivery" element={<DashboardDelivery/>} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
