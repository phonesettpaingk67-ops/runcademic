import { useState } from 'react';
import Layout from '../../components/Layout';

export default function Tasks() {
  const [tasks, setTasks] = useState([
    { id: 1, title: 'Grade Midterm Exams', status: 'pending', dueDate: '2024-04-25', priority: 'high' },
    { id: 2, title: 'Prepare Lecture Notes', status: 'in_progress', dueDate: '2024-04-20', priority: 'medium' },
    { id: 3, title: 'Review Student Projects', status: 'pending', dueDate: '2024-04-28', priority: 'high' },
    { id: 4, title: 'Update Course Materials', status: 'done', dueDate: '2024-04-15', priority: 'low' },
  ]);

  const handleStatusChange = (id, newStatus) => {
    setTasks(tasks.map(task => task.id === id ? { ...task, status: newStatus } : task));
  };

  return (
    <Layout role="instructor">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Tasks</h1>
          <p className="text-gray-500 text-sm mt-1">Track and manage your assigned tasks.</p>
        </div>

        <div className="space-y-4">
          {tasks.map((task) => (
            <div key={task.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <div className="flex flex-wrap justify-between items-start gap-4">
                <div className="flex-1 min-w-[220px]">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{task.title}</h3>
                  <div className="flex gap-3 text-sm flex-wrap">
                    <p className="text-gray-600"><span className="font-semibold text-gray-700">Due:</span> {task.dueDate}</p>
                    <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${
                      task.priority === 'high' ? 'bg-red-100 text-red-700' :
                      task.priority === 'medium' ? 'bg-amber-100 text-amber-700' :
                      'bg-emerald-100 text-emerald-700'
                    }`}>
                      {task.priority} priority
                    </span>
                  </div>
                </div>
                <select
                  value={task.status}
                  onChange={(e) => handleStatusChange(task.id, e.target.value)}
                  className="w-full md:w-48 px-4 py-3 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E05F6B]/20 focus:border-[#E05F6B] focus:bg-white transition-all"
                >
                  <option value="pending">Pending</option>
                  <option value="in_progress">In Progress</option>
                  <option value="done">Done</option>
                </select>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
}
