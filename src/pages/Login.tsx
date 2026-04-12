import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate, useLocation } from 'react-router-dom';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, collection, query, where, getDocs, deleteDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { LogIn, Mail, AlertTriangle, ArrowRight } from 'lucide-react';
import { UserProfile } from '../types';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [switchRoleData, setSwitchRoleData] = useState<{
    profile: UserProfile;
    intendedRole: 'customer' | 'provider';
  } | null>(null);

  const handleGoogleLogin = async () => {
    setLoading(true);
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const intendedRole = location.state?.intendedRole as 'customer' | 'provider' | undefined;
      
      if (result.user) {
        const docRef = doc(db, 'users', result.user.uid);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const existingProfile = docSnap.data() as UserProfile;
          
          if (intendedRole && existingProfile.role !== intendedRole) {
            setSwitchRoleData({ profile: existingProfile, intendedRole });
            setLoading(false);
            return;
          }
        } else if (intendedRole) {
          const newProfile = {
            id: result.user.uid,
            email: result.user.email || '',
            fullName: result.user.displayName || 'Anonymous User',
            avatarUrl: result.user.photoURL || '',
            phoneNumber: result.user.phoneNumber || '',
            role: intendedRole,
            createdAt: Date.now(),
          };
          await setDoc(docRef, newProfile);
          
          if (intendedRole === 'provider') {
            navigate('/provider-setup');
            return;
          }
        }
      }

      const redirectTo = location.state?.redirectTo || '/dashboard';
      navigate(redirectTo);
    } catch (error) {
      console.error("Login failed:", error);
      alert("Login failed. Please try again.");
      setLoading(false);
    }
  };

  const handleConfirmSwitch = async () => {
    if (!switchRoleData || !auth.currentUser) return;
    setLoading(true);
    try {
      const { profile, intendedRole } = switchRoleData;
      const uid = auth.currentUser.uid;

      // 1. Delete role-specific data
      if (profile.role === 'provider') {
        const q = query(collection(db, 'products_services'), where('providerId', '==', uid));
        const snapshot = await getDocs(q);
        const deletePromises = snapshot.docs.map(d => deleteDoc(d.ref));
        await Promise.all(deletePromises);
      } else {
        const q = query(collection(db, 'tasks'), where('customerId', '==', uid));
        const snapshot = await getDocs(q);
        const deletePromises = snapshot.docs.map(d => deleteDoc(d.ref));
        await Promise.all(deletePromises);
      }

      // 2. Update profile
      const userRef = doc(db, 'users', uid);
      const updates: any = {
        role: intendedRole,
        updatedAt: Date.now()
      };

      // Clear provider fields if switching to customer
      if (intendedRole === 'customer') {
        updates.businessName = null;
        updates.businessType = null;
        updates.industry = null;
        updates.businessLogoUrl = null;
        updates.isProviderSetupComplete = false;
      }

      await updateDoc(userRef, updates);

      if (intendedRole === 'provider') {
        navigate('/provider-setup');
      } else {
        navigate('/dashboard');
      }
    } catch (error) {
      console.error("Error switching role:", error);
      alert("Failed to switch role. Please try again.");
    } finally {
      setLoading(false);
      setSwitchRoleData(null);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gray-50">
      <AnimatePresence>
        {switchRoleData && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl text-center"
            >
              <div className="w-16 h-16 bg-orange-100 text-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <AlertTriangle className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Switch Account Type?</h2>
              <p className="text-gray-600 mb-8">
                This account is already registered as a <span className="font-bold text-blue-600 capitalize">{switchRoleData.profile.role}</span>. 
                Switching to <span className="font-bold text-blue-600 capitalize">{switchRoleData.intendedRole}</span> will 
                <span className="font-bold text-red-600"> permanently delete</span> all your current {switchRoleData.profile.role} data.
              </p>
              <div className="space-y-3">
                <button
                  onClick={handleConfirmSwitch}
                  disabled={loading}
                  className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
                >
                  {loading ? "Processing..." : `Yes, Switch to ${switchRoleData.intendedRole.charAt(0).toUpperCase() + switchRoleData.intendedRole.slice(1)}`}
                  <ArrowRight className="w-5 h-5" />
                </button>
                <button
                  onClick={() => {
                    setSwitchRoleData(null);
                    navigate(switchRoleData.profile.role === 'provider' ? '/provider-dashboard' : '/dashboard');
                  }}
                  disabled={loading}
                  className="w-full bg-gray-100 text-gray-600 py-4 rounded-2xl font-bold hover:bg-gray-200 transition-all"
                >
                  No, Keep my {switchRoleData.profile.role} account
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-gray-100 p-8 md:p-12 text-center"
      >
        <div className="w-20 h-20 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-lg shadow-blue-200">
          <LogIn className="text-white w-10 h-10" />
        </div>
        
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h1>
        <p className="text-gray-600 mb-12">Sign in to Comfort Tasks Pro to manage your tasks and connect with pros.</p>

        <div className="space-y-4">
          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 bg-white border-2 border-gray-100 py-4 rounded-2xl font-bold text-gray-700 hover:border-blue-600 hover:text-blue-600 transition-all active:scale-95 disabled:opacity-50"
          >
            {loading ? (
              <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <img src="https://www.google.com/favicon.ico" className="w-5 h-5" alt="Google" />
                Continue with Google
              </>
            )}
          </button>

          <div className="relative py-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-100"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-400 uppercase tracking-widest text-xs font-bold">Or</span>
            </div>
          </div>

          <button
            disabled
            className="w-full flex items-center justify-center gap-3 bg-gray-50 py-4 rounded-2xl font-bold text-gray-400 cursor-not-allowed"
          >
            <Mail className="w-5 h-5" />
            Continue with Email
          </button>
        </div>

        <p className="mt-8 text-sm text-gray-500">
          By continuing, you agree to our <a href="#" className="text-blue-600 font-bold">Terms of Service</a> and <a href="#" className="text-blue-600 font-bold">Privacy Policy</a>.
        </p>
      </motion.div>
    </div>
  );
}
