import { Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import NotificationProvider from './pages/NotificationProvider';
import Overview from './pages/Overview';


function App() {
  return (
    <NotificationProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path='overview' element={<Overview />}/>
      </Routes>
    </NotificationProvider>
  );
}

export default App;
