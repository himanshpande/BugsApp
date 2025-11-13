import { Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import NotificationProvider from './pages/NotificationProvider';
import Overview from './pages/Overview';
import BugMarkerLanding from './pages/landingPage';
import FeaturesPage from './pages/featuresPage';


function App() {
  return (
    <NotificationProvider>
      <Routes>
        <Route path="/" element={<BugMarkerLanding/>}/>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path='overview' element={<Overview />}/>
        <Route path='/features' element={<FeaturesPage/>}/>
      </Routes>
    </NotificationProvider>
  );
}

export default App;
