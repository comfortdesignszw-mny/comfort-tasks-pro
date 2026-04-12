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
  Home,
  ChevronRight
} from 'lucide-react';

// Components
import { TaskCard } from './components/TaskCard';

// Pages
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
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200">
              <PlusCircle className="text-white w-6 h-6" />
            </div>
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
              Comfort Tasks Pro
            </span>
          </Link>
          
          <div className="hidden md:flex items-center gap-8">
            <Link to="/" className="text-gray-600 hover:text-blue-600 font-medium transition-colors">Home</Link>
            <Link to="/tasks" className="text-gray-600 hover:text-blue-600 font-medium transition-colors">Browse Tasks</Link>
            {profile?.role !== 'provider' && (
              <Link to="/services" className="text-gray-600 hover:text-blue-600 font-medium transition-colors">Browse Services</Link>
            )}
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
            <Link to="/tasks" onClick={() => setIsOpen(false)} className="text-lg font-medium text-gray-600">Browse Tasks</Link>
            {profile?.role !== 'provider' && (
              <Link to="/services" onClick={() => setIsOpen(false)} className="text-lg font-medium text-gray-600">Browse Services</Link>
            )}
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

const LandingPage = () => {
  const navigate = useNavigate();
  const { user, profile } = useAuth();

  const handleGetStarted = () => {
    if (user) {
      if (profile?.role === 'provider') {
        if (profile?.isProviderSetupComplete) {
          navigate('/provider-dashboard');
        } else {
          navigate('/provider-setup');
        }
      } else {
        navigate('/dashboard');
      }
    } else {
      navigate('/join');
    }
  };

  return (
    <div className="pt-24 pb-12 px-4 max-w-7xl mx-auto">
      <div className="text-center space-y-6 max-w-3xl mx-auto">
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-5xl md:text-7xl font-extrabold tracking-tight text-gray-900"
        >
          Your Tasks, <span className="text-blue-600">Handled</span> with Comfort.
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-xl text-gray-600 leading-relaxed"
        >
          Connect with top-rated local professionals for any task. From home repairs to specialized services, we've got you covered.
        </motion.p>
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex flex-col sm:flex-row gap-4 justify-center pt-4"
        >
          <button 
            onClick={handleGetStarted}
            className="bg-blue-600 text-white px-12 py-4 rounded-2xl font-bold text-lg hover:bg-blue-700 transition-all shadow-xl shadow-blue-200 active:scale-95"
          >
            Get Started
          </button>
        </motion.div>
      </div>

      {/* Categories Grid */}
      <div className="mt-24 grid grid-cols-2 md:grid-cols-4 gap-6">
        {[
          { name: 'Cleaning', icon: '✨', color: 'bg-orange-50' },
          { name: 'Plumbing', icon: '🚰', color: 'bg-blue-50' },
          { name: 'Electrical', icon: '⚡', color: 'bg-yellow-50' },
          { name: 'Moving', icon: '📦', color: 'bg-purple-50' },
        ].map((cat, i) => (
          <motion.div
            key={cat.name}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 + i * 0.1 }}
            onClick={() => navigate('/tasks')}
            className={`${cat.color} p-8 rounded-3xl text-center hover:shadow-lg transition-all cursor-pointer group`}
          >
            <span className="text-4xl mb-4 block group-hover:scale-110 transition-transform">{cat.icon}</span>
            <h3 className="font-bold text-gray-900">{cat.name}</h3>
          </motion.div>
        ))}
      </div>

      {/* Featured Tasks */}
      <div className="mt-32 space-y-12">
        <div className="flex justify-between items-end">
          <div>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Featured Tasks</h2>
            <p className="text-gray-600">See what others are getting done right now.</p>
          </div>
          <button 
            onClick={() => navigate('/tasks')}
            className="text-blue-600 font-bold hover:underline flex items-center gap-1"
          >
            View all tasks <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              id: '1',
              customerId: 'user1',
              customerName: 'Sarah Johnson',
              customerAvatarUrl: 'https://picsum.photos/seed/sarah/100/100',
              title: 'Deep Clean 2-Bedroom Apartment',
              description: 'Looking for a thorough cleaning of my apartment before moving out. Includes windows and appliances.',
              category: 'Cleaning',
              budget: 150,
              status: 'open',
              location: 'Downtown, NY',
              date: Date.now() - 3600000,
              createdAt: Date.now(),
              updatedAt: Date.now()
            },
            {
              id: '2',
              customerId: 'user2',
              customerName: 'Mike Peters',
              customerAvatarUrl: 'https://picsum.photos/seed/mike/100/100',
              title: 'Fix Leaking Kitchen Sink',
              description: 'The faucet is dripping constantly and there is a small leak under the sink. Need a plumber ASAP.',
              category: 'Plumbing',
              budget: 85,
              status: 'open',
              location: 'Brooklyn, NY',
              date: Date.now() - 7200000,
              createdAt: Date.now(),
              updatedAt: Date.now()
            },
            {
              id: '3',
              customerId: 'user3',
              customerName: 'Elena Rodriguez',
              customerAvatarUrl: 'https://picsum.photos/seed/elena/100/100',
              title: 'Assemble IKEA Bookshelf',
              description: 'Need help assembling a large Billy bookshelf. All tools provided.',
              category: 'Assembly',
              budget: 50,
              status: 'open',
              location: 'Queens, NY',
              date: Date.now() - 10800000,
              createdAt: Date.now(),
              updatedAt: Date.now()
            }
          ].map((task) => (
            <TaskCard key={task.id} task={task as any} showConnect={true} />
          ))}
        </div>
      </div>

      {/* How it Works */}
      <div className="mt-32 space-y-16">
        <div className="text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">How it Works</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">Getting things done has never been easier. Follow these simple steps to get started.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {[
            { step: '01', title: 'Post a Task', desc: 'Tell us what you need help with. It takes less than 2 minutes.' },
            { step: '02', title: 'Get Offers', desc: 'Trusted pros will send you quotes. Compare profiles and reviews.' },
            { step: '03', title: 'Task Done', desc: 'Choose the best pro, get the job done, and pay securely.' },
          ].map((item, i) => (
            <motion.div
              key={item.step}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + i * 0.1 }}
              className="relative p-8 bg-white rounded-3xl border border-gray-100 shadow-sm"
            >
              <span className="text-6xl font-black text-blue-50 absolute -top-6 -left-2 z-0">{item.step}</span>
              <div className="relative z-10">
                <h3 className="text-xl font-bold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-600 leading-relaxed">{item.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
        <Navbar />
        <main>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/tasks" element={<ProtectedRoute><BrowseTasks /></ProtectedRoute>} />
            <Route path="/services" element={<ProtectedRoute><BrowseServices /></ProtectedRoute>} />
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
