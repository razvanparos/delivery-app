import './App.css';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import CheckLoggedIn from './pages/checkLoggedIn/checkLoggedIn';
import LoginPage from './pages/loginPage/loginPage';
import RegisterPage from './pages/registerPage/registerPage';
import Dashboard from './pages/dashboard/dashboard';

function App() {
  return (
    <div className="App">
      <Router>
        <Routes>
          <Route path="/"  element={<CheckLoggedIn/>}/>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
