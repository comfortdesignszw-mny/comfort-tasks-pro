import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Search, Filter, MapPin, DollarSign, ChevronRight, Wifi, WifiOff } from 'lucide-react';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { TaskCard } from '../components/TaskCard';
import { Task } from '../types';
import { CATEGORIES } from '../constants/categories';

export default function BrowseTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    if (!auth.currentUser) return;

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    let q = query(
      collection(db, 'tasks'),
      where('status', '==', 'open'),
      orderBy('createdAt', 'desc')
    );

    if (selectedCategory) {
      q = query(
        collection(db, 'tasks'),
        where('status', '==', 'open'),
        where('category', '==', selectedCategory),
        orderBy('createdAt', 'desc')
      );
    }

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
  }, [selectedCategory]);

  const filteredTasks = tasks.filter(t => 
    t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="pt-24 pb-12 px-4 max-w-7xl mx-auto">
      <div className="mb-12">
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-4xl font-extrabold text-gray-900">Available Tasks</h1>
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
        <p className="text-xl text-gray-600">Find work that matches your skills and schedule.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Filters Sidebar */}
        <aside className="w-full lg:w-64 space-y-8">
          <div>
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Filter className="w-4 h-4" />
              Categories
            </h3>
            <div className="space-y-2">
              <button
                onClick={() => setSelectedCategory(null)}
                className={`w-full text-left px-4 py-2 rounded-xl transition-all ${!selectedCategory ? 'bg-blue-600 text-white shadow-md' : 'hover:bg-gray-100 text-gray-600'}`}
              >
                All Categories
              </button>
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.name)}
                  className={`w-full text-left px-4 py-2 rounded-xl transition-all ${selectedCategory === cat.name ? 'bg-blue-600 text-white shadow-md' : 'hover:bg-gray-100 text-gray-600'}`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1 space-y-6">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search for tasks (e.g. 'plumbing', 'cleaning')..."
              className="w-full pl-12 pr-4 py-4 bg-white border border-gray-100 rounded-2xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Tasks Grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="bg-white p-6 rounded-3xl border border-gray-100 h-48 animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredTasks.map((task) => (
                <TaskCard 
                  key={task.id} 
                  task={task} 
                  showConnect={task.customerId !== auth.currentUser?.uid}
                />
              ))}
            </div>
          )}

          {!loading && filteredTasks.length === 0 && (
            <div className="text-center py-24 bg-white rounded-3xl border border-gray-100">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-gray-300" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">No tasks found</h3>
              <p className="text-gray-500">Try adjusting your filters or search query.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
