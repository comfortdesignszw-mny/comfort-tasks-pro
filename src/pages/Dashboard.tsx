import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Search, 
  Filter, 
  TrendingUp, 
  CheckCircle2, 
  Clock,
  AlertCircle,
  Wifi,
  WifiOff
} from 'lucide-react';
import { collection, query, where, onSnapshot, orderBy, doc, updateDoc } from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { TaskCard } from '../components/TaskCard';
import { Task } from '../types';

export default function Dashboard() {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    if (!auth.currentUser) return;

    const q = query(
      collection(db, 'tasks'),
      where('customerId', '==', auth.currentUser.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const taskList: Task[] = [];
      snapshot.forEach((doc) => {
        taskList.push({ id: doc.id, ...doc.data() } as Task);
      });
      setTasks(taskList);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching tasks:", error);
      setLoading(false);
    });

    return () => {
      unsubscribe();
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleApprove = async (taskId: string, providerId: string, providerName: string) => {
    if (window.confirm(`Approve ${providerName} for this task?`)) {
      try {
        const taskRef = doc(db, 'tasks', taskId);
        await updateDoc(taskRef, {
          status: 'assigned',
          providerId: providerId,
          updatedAt: Date.now()
        });
        alert("Task approved! The provider has been assigned.");
      } catch (error) {
        console.error("Error approving task:", error);
        alert("Failed to approve task.");
      }
    }
  };

  const handleDecline = async (taskId: string, providerName: string) => {
    if (window.confirm(`Decline ${providerName}'s request? The task will remain open for others.`)) {
      try {
        const taskRef = doc(db, 'tasks', taskId);
        await updateDoc(taskRef, {
          status: 'open',
          acceptedByProviderId: null,
          acceptedByProviderName: null,
          updatedAt: Date.now()
        });
        alert("Request declined. The task is open again.");
      } catch (error) {
        console.error("Error declining task:", error);
        alert("Failed to decline task.");
      }
    }
  };

  const stats = {
    active: tasks.filter(t => ['open', 'pending_approval', 'assigned', 'in-progress'].includes(t.status)).length,
    completed: tasks.filter(t => t.status === 'completed').length,
    totalSpent: tasks.reduce((acc, t) => acc + (t.status === 'completed' ? t.budget : 0), 0),
    pendingReviews: tasks.filter(t => t.status === 'completed').length // Simplified
  };

  return (
    <div className="pt-24 pb-12 px-4 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            {isOnline ? (
              <span className="flex items-center gap-1 text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full">
                <Wifi className="w-3 h-3" /> Online
              </span>
            ) : (
              <span className="flex items-center gap-1 text-xs font-bold text-orange-600 bg-orange-50 px-2 py-1 rounded-full">
                <WifiOff className="w-3 h-3" /> Offline Mode
              </span>
            )}
          </div>
          <p className="text-gray-600">Welcome back! Here's what's happening with your tasks.</p>
        </div>
        <button 
          onClick={() => navigate('/post-task')}
          className="bg-blue-600 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 active:scale-95"
        >
          <Plus className="w-5 h-5" />
          Post New Task
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {[
          { label: 'Active Tasks', value: stats.active, icon: Clock, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Completed', value: stats.completed, icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-50' },
          { label: 'Total Spent', value: `$${stats.totalSpent}`, icon: TrendingUp, color: 'text-purple-600', bg: 'bg-purple-50' },
          { label: 'Pending Reviews', value: stats.pendingReviews, icon: AlertCircle, color: 'text-orange-600', bg: 'bg-orange-50' },
        ].map((stat) => (
          <div key={stat.label} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
            <div className={`w-12 h-12 ${stat.bg} ${stat.color} rounded-2xl flex items-center justify-center mb-4`}>
              <stat.icon className="w-6 h-6" />
            </div>
            <p className="text-gray-500 font-medium">{stat.label}</p>
            <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Tasks Section */}
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">Your Tasks</h2>
          <div className="flex gap-2">
            <button className="p-2 bg-white border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors">
              <Search className="w-5 h-5 text-gray-500" />
            </button>
            <button className="p-2 bg-white border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors">
              <Filter className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white p-6 rounded-3xl border border-gray-100 h-48 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tasks.map((task) => (
              <div key={task.id} className="space-y-4">
                <TaskCard task={task} />
                {task.status === 'pending_approval' && (
                  <div className="bg-orange-50 p-4 rounded-3xl border border-orange-100 shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <p className="text-xs font-bold text-orange-600 uppercase tracking-wider">Approval Requested</p>
                        <p className="text-sm font-bold text-gray-900">{task.acceptedByProviderName} wants to help</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleApprove(task.id, task.acceptedByProviderId!, task.acceptedByProviderName!)}
                        className="flex-1 bg-blue-600 text-white py-2.5 rounded-xl text-xs font-bold hover:bg-blue-700 transition-all shadow-md shadow-blue-100"
                      >
                        Approve
                      </button>
                      <button 
                        onClick={() => handleDecline(task.id, task.acceptedByProviderName!)}
                        className="flex-1 bg-white text-red-600 border border-red-200 py-2.5 rounded-xl text-xs font-bold hover:bg-red-50 transition-all"
                      >
                        Decline
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
            
            <motion.div
              whileHover={{ scale: 1.02 }}
              onClick={() => navigate('/post-task')}
              className="border-2 border-dashed border-gray-200 rounded-3xl flex flex-col items-center justify-center p-12 text-center cursor-pointer hover:border-blue-300 hover:bg-blue-50/30 transition-all group"
            >
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4 group-hover:bg-blue-100 transition-colors">
                <Plus className="w-8 h-8 text-gray-400 group-hover:text-blue-600" />
              </div>
              <h3 className="font-bold text-gray-900">Post a new task</h3>
              <p className="text-gray-500 text-sm">Need help with something else?</p>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}
