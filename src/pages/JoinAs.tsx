import React from 'react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { Briefcase, User, ArrowRight } from 'lucide-react';

export default function JoinAs() {
  const navigate = useNavigate();

  const handleSelection = (role: 'customer' | 'provider') => {
    // Navigate to login with the intended role
    navigate('/login', { state: { intendedRole: role } });
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gray-50">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-12">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4"
          >
            How would you like to join?
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-gray-600"
          >
            Choose the account type that best fits your needs.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Client Option */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            onClick={() => handleSelection('customer')}
            className="bg-white p-8 rounded-3xl border-2 border-transparent hover:border-blue-600 shadow-xl cursor-pointer group transition-all"
          >
            <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-blue-600 group-hover:text-white transition-all">
              <User className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">I'm a Client</h2>
            <p className="text-gray-600 mb-8 leading-relaxed">
              I want to post tasks, request services, and find top-rated professionals to get things done.
            </p>
            <div className="flex items-center gap-2 text-blue-600 font-bold">
              Join as Client <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </div>
          </motion.div>

          {/* Provider Option */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            onClick={() => handleSelection('provider')}
            className="bg-white p-8 rounded-3xl border-2 border-transparent hover:border-blue-600 shadow-xl cursor-pointer group transition-all"
          >
            <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-blue-600 group-hover:text-white transition-all">
              <Briefcase className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">I'm a Provider</h2>
            <p className="text-gray-600 mb-8 leading-relaxed">
              I want to showcase my products and services, grow my business, and connect with new clients.
            </p>
            <div className="flex items-center gap-2 text-blue-600 font-bold">
              Join as Provider <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </div>
          </motion.div>
        </div>

        <div className="mt-12 text-center">
          <p className="text-gray-500">
            Already have an account? <button onClick={() => navigate('/login')} className="text-blue-600 font-bold hover:underline">Sign In</button>
          </p>
        </div>
      </div>
    </div>
  );
}
