import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { User } from './types';
import { mockBackend } from './services/mockBackend';
import Navbar from './components/Navbar';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import RequestBlood from './pages/RequestBlood';
import Profile from './pages/Profile';
import AiAssistant from './pages/AiAssistant';
import FindCenter from './pages/FindCenter';
import History from './pages/History';

// Top Header Component
const TopHeader: React.FC<{ user: User, navigate: (p: string) => void }> = ({ user, navigate }) => {
  return (
    <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-200 px-4 py-3 flex justify-between items-center md:hidden">
      <div className="font-bold text-lg text-gray-800 flex items-center">
        <span className="mr-2 text-xl">🩸</span> CBC
      </div>
      <button 
        onClick={() => navigate('/profile')}
        className="w-9 h-9 bg-red-100 rounded-full flex items-center justify-center text-red-600 font-bold text-sm border-2 border-white shadow-sm"
      >
        {user.name[0]}
      </button>
    </div>
  );
};

// Layout wrapper to handle Navbar visibility
const Layout: React.FC<{ children: React.ReactNode, user: User | null, onLogout: () => void }> = ({ children, user, onLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const hideNavPaths = ['/', '/login'];
  
  const showNav = user && !hideNavPaths.includes(location.pathname);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      {/* Sidebar for Desktop / Bottom Nav for Mobile */}
      {showNav && (
        <div className="md:sticky md:top-0 md:h-screen z-50">
           <Navbar currentPath={location.pathname} navigate={navigate} role={user.role} />
        </div>
      )}
      
      {/* Main Content Area */}
      <main className="flex-1 h-screen overflow-y-auto w-full">
        {showNav && <TopHeader user={user} navigate={navigate} />}
        <div className="px-4 md:px-8 max-w-5xl mx-auto w-full">
          {children}
        </div>
      </main>
    </div>
  );
};

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [init, setInit] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      const currentUser = mockBackend.getCurrentUser();
      setUser(currentUser);
      setInit(false);
    };
    checkUser();
  }, []);

  const handleLogin = () => {
    setUser(mockBackend.getCurrentUser());
  };

  const handleLogout = () => {
    mockBackend.logout();
    setUser(null);
  };

  if (init) return <div className="min-h-screen flex items-center justify-center text-red-600">Loading...</div>;

  return (
    <Router>
      <Layout user={user} onLogout={handleLogout}>
        <Routes>
          <Route path="/" element={!user ? <Auth onLogin={handleLogin} /> : <Navigate to="/dashboard" />} />
          
          {/* Pass handleLogin as onUserUpdate to allow Dashboard to refresh user role */}
          <Route path="/dashboard" element={user ? <Dashboard user={user} navigate={(p) => window.location.hash = '#' + p} onUserUpdate={handleLogin} /> : <Navigate to="/" />} />
          
          <Route path="/request" element={user ? <RequestBlood navigate={(p) => window.location.hash = '#' + p} /> : <Navigate to="/" />} />
          
          <Route path="/requests" element={user ? <Dashboard user={user} navigate={(p) => window.location.hash = '#' + p} onUserUpdate={handleLogin} /> : <Navigate to="/" />} />
          
          <Route path="/find-center" element={user ? <FindCenter /> : <Navigate to="/" />} />
          
          <Route path="/history" element={user ? <History /> : <Navigate to="/" />} />
          
          <Route path="/profile" element={user ? <Profile user={user} onLogout={handleLogout} navigate={(p) => window.location.hash = '#' + p} /> : <Navigate to="/" />} />
          
          <Route path="/assistant" element={user ? <AiAssistant /> : <Navigate to="/" />} />
          
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Layout>
    </Router>
  );
};

export default App;