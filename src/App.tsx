import { BrowserRouter as Router, Routes, Route, Navigate, Link, useNavigate } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LayoutDashboard, 
  PlusCircle, 
  Search, 
  User, 
  Bell, 
  Menu, 
  X,
  Home as HomeIcon,
  ChevronRight,
  Wrench,
  MessageSquare
} from 'lucide-react';

// Components
import { TaskCard } from './components/TaskCard';
import { PWAInstallButton } from './components/PWAInstallButton';
import { OfflineIndicator } from './components/OfflineIndicator';

// Pages
import HomePage from './pages/Home';
import Dashboard from './pages/Dashboard';
import BrowseTasks from './pages/BrowseTasks';
import PostTask from './pages/PostTask';
import Login from './pages/Login';
import ProviderWizard from './pages/ProviderWizard';
import ProviderDashboard from './pages/ProviderDashboard';
import BrowseServices from './pages/BrowseServices';
import JoinAs from './pages/JoinAs';
import CompanyProfile from './pages/CompanyProfile';
import CreateService from './pages/CreateService';

// Hooks
import { useAuth } from './hooks/useAuth';
import { auth as firebaseAuth } from './lib/firebase';
import { signOut } from 'firebase/auth';

// Components
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );
  
  if (!user) return <Navigate to="/login" replace />;
  
  return <>{children}</>;
};

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut(firebaseAuth);
    navigate('/');
  };
  
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-200">
              <Wrench className="text-white w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-indigo-800 leading-none">
                Comfort Handyman
              </span>
              <span className="text-[10px] font-bold text-emerald-600 tracking-wider uppercase">
                Tasks & WhatsApp Orders
              </span>
            </div>
          </Link>
          
          <div className="hidden md:flex items-center gap-6">
            <Link to="/" className="text-gray-600 hover:text-blue-600 font-semibold text-sm transition-colors">Home</Link>
            <Link to="/services" className="text-emerald-700 hover:text-emerald-800 font-bold text-sm transition-colors flex items-center gap-1.5 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200">
              <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
              <span>1-Tap Services</span>
            </Link>
            <Link to="/tasks" className="text-gray-600 hover:text-blue-600 font-semibold text-sm transition-colors">Browse Tasks</Link>
            <PWAInstallButton />
            {user ? (
              <>
                <Link to="/dashboard" className="text-gray-600 hover:text-blue-600 font-medium transition-colors">Dashboard</Link>
                {profile?.role === 'provider' && (
                  <>
                    <Link to="/provider-dashboard" className="text-gray-600 hover:text-blue-600 font-medium transition-colors">Provider Dashboard</Link>
                    <Link to="/company-profile" className="text-gray-600 hover:text-blue-600 font-medium transition-colors">Profile</Link>
                  </>
                )}
                <div className="flex items-center gap-4">
                  <button 
                    onClick={handleLogout}
                    className="text-gray-600 hover:text-red-600 font-medium transition-colors"
                  >
                    Logout
                  </button>
                  {profile?.role === 'provider' ? (
                    <Link to={profile.isProviderSetupComplete ? "/create-service" : "/provider-setup"} className="bg-blue-600 text-white px-6 py-2 rounded-full font-medium hover:bg-blue-700 transition-all shadow-md hover:shadow-lg active:scale-95">
                      Create Service
                    </Link>
                  ) : (
                    <Link to="/post-task" className="bg-blue-600 text-white px-6 py-2 rounded-full font-medium hover:bg-blue-700 transition-all shadow-md hover:shadow-lg active:scale-95">
                      Post a Task
                    </Link>
                  )}
                </div>
              </>
            ) : (
              <Link to="/login" className="bg-blue-600 text-white px-8 py-2 rounded-full font-medium hover:bg-blue-700 transition-all shadow-md active:scale-95">
                Login
              </Link>
            )}
          </div>

          <div className="md:hidden">
            <button onClick={() => setIsOpen(!isOpen)} className="p-2 text-gray-600">
              {isOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="md:hidden bg-white border-b border-gray-100 px-4 py-6 flex flex-col gap-4"
          >
            <Link to="/" onClick={() => setIsOpen(false)} className="text-lg font-medium text-gray-600">Home</Link>
            <Link to="/services" onClick={() => setIsOpen(false)} className="text-lg font-bold text-emerald-700">1-Tap Services</Link>
            <Link to="/tasks" onClick={() => setIsOpen(false)} className="text-lg font-medium text-gray-600">Browse Tasks</Link>
            <div className="pt-2 pb-1">
              <PWAInstallButton variant="mobile" />
            </div>
            {user ? (
              <>
                <Link to="/dashboard" onClick={() => setIsOpen(false)} className="text-lg font-medium text-gray-600">Dashboard</Link>
                {profile?.role === 'provider' && (
                  <>
                    <Link to="/provider-dashboard" onClick={() => setIsOpen(false)} className="text-lg font-medium text-gray-600">Provider Dashboard</Link>
                    <Link to="/company-profile" onClick={() => setIsOpen(false)} className="text-lg font-medium text-gray-600">Company Profile</Link>
                  </>
                )}
                {profile?.role === 'provider' ? (
                  <Link to={profile.isProviderSetupComplete ? "/create-service" : "/provider-setup"} onClick={() => setIsOpen(false)} className="bg-blue-600 text-white px-6 py-3 rounded-xl font-medium w-full text-center">
                    Create Service
                  </Link>
                ) : (
                  <Link to="/post-task" onClick={() => setIsOpen(false)} className="bg-blue-600 text-white px-6 py-3 rounded-xl font-medium w-full text-center">
                    Post a Task
                  </Link>
                )}
                <button 
                  onClick={() => { handleLogout(); setIsOpen(false); }}
                  className="text-lg font-medium text-red-600 text-left"
                >
                  Logout
                </button>
              </>
            ) : (
              <Link to="/login" onClick={() => setIsOpen(false)} className="bg-blue-600 text-white px-6 py-3 rounded-xl font-medium w-full text-center">
                Login
              </Link>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
        <Navbar />
        <OfflineIndicator />
        <main>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/tasks" element={<ProtectedRoute><BrowseTasks /></ProtectedRoute>} />
            <Route path="/services" element={<BrowseServices />} />
            <Route path="/join" element={<JoinAs />} />
            <Route path="/post-task" element={<ProtectedRoute><PostTask /></ProtectedRoute>} />
            <Route path="/provider-setup" element={<ProtectedRoute><ProviderWizard /></ProtectedRoute>} />
            <Route path="/provider-dashboard" element={<ProtectedRoute><ProviderDashboard /></ProtectedRoute>} />
            <Route path="/company-profile" element={<ProtectedRoute><CompanyProfile /></ProtectedRoute>} />
            <Route path="/create-service" element={<ProtectedRoute><CreateService /></ProtectedRoute>} />
            <Route path="/login" element={<Login />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}
