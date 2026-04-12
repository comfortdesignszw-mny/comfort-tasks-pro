import React from 'react';
import { motion } from 'motion/react';
import { MapPin, Clock, DollarSign, Tag, MessageSquare, Phone, User, CheckCircle2 } from 'lucide-react';
import { Task } from '../types';
import { formatDistanceToNow } from 'date-fns';
import { doc, updateDoc } from 'firebase/firestore';
import { db, auth } from '../lib/firebase';

interface TaskCardProps {
  key?: string | number;
  task: Task;
  onClick?: () => void;
  showConnect?: boolean;
}

export function TaskCard({ task, onClick, showConnect = false }: TaskCardProps) {
  const statusColors = {
    open: 'bg-green-100 text-green-700',
    pending_approval: 'bg-orange-100 text-orange-700',
    assigned: 'bg-blue-100 text-blue-700',
    'in-progress': 'bg-yellow-100 text-yellow-700',
    completed: 'bg-gray-100 text-gray-700',
    cancelled: 'bg-red-100 text-red-700',
  };

  const handleConnect = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    // If it's a provider viewing a task
    if (showConnect && task.status === 'open') {
      const confirmAccept = window.confirm(`Accept this task? This will send an approval request to ${task.customerName}.`);
      if (confirmAccept) {
        try {
          const taskRef = doc(db, 'tasks', task.id);
          await updateDoc(taskRef, {
            status: 'pending_approval',
            acceptedByProviderId: auth.currentUser?.uid,
            acceptedByProviderName: auth.currentUser?.displayName || 'A Provider',
            updatedAt: Date.now()
          });
          alert(`Request Sent! Waiting for ${task.customerName} to approve.`);
        } catch (error) {
          console.error("Error accepting task:", error);
          alert("Failed to send request. Please try again.");
        }
      }
      return;
    }

    // Default behavior for already assigned or other cases
    if (task.customerPhone) {
      window.location.href = `tel:${task.customerPhone}`;
    } else {
      alert(`Connecting with ${task.customerName}... (Chat feature coming soon)`);
    }
  };

  return (
    <motion.div
      whileHover={{ y: -4 }}
      onClick={onClick}
      className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl transition-all cursor-pointer group"
    >
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          {task.customerAvatarUrl ? (
            <img 
              src={task.customerAvatarUrl} 
              alt={task.customerName} 
              className="w-10 h-10 rounded-full object-cover border-2 border-blue-50"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
              <User className="w-6 h-6" />
            </div>
          )}
          <div>
            <h4 className="font-bold text-gray-900 text-sm">{task.customerName}</h4>
            <p className="text-xs text-gray-500">Customer</p>
          </div>
        </div>
        <div className="flex flex-col items-end gap-2">
          <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${statusColors[task.status]}`}>
            {task.status}
          </span>
          <div className="flex items-center text-blue-600 font-bold text-lg">
            <DollarSign className="w-4 h-4" />
            {task.budget}
          </div>
        </div>
      </div>

      <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
        {task.title}
      </h3>
      
      <p className="text-gray-600 text-sm line-clamp-2 mb-4">
        {task.description}
      </p>

      <div className="grid grid-cols-2 gap-3 pt-4 border-t border-gray-50 mb-4">
        <div className="flex items-center gap-2 text-gray-500 text-xs">
          <MapPin className="w-3.5 h-3.5" />
          <span className="truncate">{task.location}</span>
        </div>
        <div className="flex items-center gap-2 text-gray-500 text-xs">
          <Clock className="w-3.5 h-3.5" />
          <span>{formatDistanceToNow(task.date)} ago</span>
        </div>
        <div className="flex items-center gap-2 text-gray-500 text-xs">
          <Tag className="w-3.5 h-3.5" />
          <span>{task.category}</span>
        </div>
      </div>

      {showConnect && task.status === 'open' && (
        <button
          onClick={handleConnect}
          className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-blue-700 transition-all active:scale-95 shadow-lg shadow-blue-100"
        >
          <CheckCircle2 className="w-4 h-4" />
          Accept Task
        </button>
      )}

      {task.status === 'pending_approval' && task.acceptedByProviderId === auth.currentUser?.uid && (
        <div className="mt-4 p-4 bg-orange-50 rounded-2xl border border-orange-100">
          <p className="text-xs font-bold text-orange-600 mb-1 uppercase tracking-wider">Pending Approval</p>
          <p className="text-xs text-orange-700">Waiting for the client to approve your request.</p>
        </div>
      )}

      {task.status === 'assigned' && task.acceptedByProviderId === auth.currentUser?.uid && (
        <div className="mt-4 p-4 bg-blue-50 rounded-2xl border border-blue-100">
          <p className="text-xs font-bold text-blue-600 mb-2 uppercase tracking-wider">Contact Details Revealed</p>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <Phone className="w-4 h-4 text-blue-500" />
              {task.customerPhone || 'No phone provided'}
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <MessageSquare className="w-4 h-4 text-blue-500" />
              {task.customerEmail || 'No email provided'}
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}
