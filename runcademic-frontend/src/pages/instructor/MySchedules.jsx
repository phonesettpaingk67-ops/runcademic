import Layout from '../../components/Layout';
import { Link } from 'react-router-dom';
import { useState } from 'react';

export default function MySchedules() {
  const [message, setMessage] = useState('');

  const handleComingSoon = () => {
    setMessage('Schedule editing will be available soon.');
  };

  const mockSchedules = [
    { id: 1, title: 'Physics 101 - Lecture', date: '2024-04-20', time: '10:00 AM - 11:30 AM', location: 'Room 101', students: 45 },
    { id: 2, title: 'Physics Lab Session', date: '2024-04-21', time: '2:00 PM - 4:00 PM', location: 'Lab 5', students: 25 },
    { id: 3, title: 'Office Hours', date: '2024-04-22', time: '3:00 PM - 5:00 PM', location: 'Room 205', students: 0 },
  ];

  return (
    <Layout role="instructor">
      <div className="space-y-6">
        {message && (
          <div className="bg-emerald-50 border border-emerald-100 rounded-2xl text-emerald-700 px-4 py-3 text-sm">
            {message}
          </div>
        )}

        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Schedules</h1>
            <p className="text-gray-500 text-sm mt-1">Manage your classes and events.</p>
          </div>
          <Link to="/instructor/create-schedule" className="px-4 py-2.5 text-sm font-semibold text-white bg-[#E05F6B] hover:bg-[#d4515d] rounded-xl transition-all shadow-sm">
            + Create Schedule
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {mockSchedules.map((schedule) => (
            <div key={schedule.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">{schedule.title}</h3>
              <div className="space-y-2 text-sm text-gray-600 mb-5">
                <p><span className="font-semibold text-gray-700">Date:</span> {schedule.date}</p>
                <p><span className="font-semibold text-gray-700">Time:</span> {schedule.time}</p>
                <p><span className="font-semibold text-gray-700">Location:</span> {schedule.location}</p>
                {schedule.students > 0 && <p><span className="font-semibold text-gray-700">Students:</span> {schedule.students}</p>}
              </div>
              <div className="flex gap-2">
                <button onClick={handleComingSoon} className="px-4 py-2.5 text-sm font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-all">
                  Edit
                </button>
                <button onClick={handleComingSoon} className="px-4 py-2.5 text-sm font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-all">
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
}
