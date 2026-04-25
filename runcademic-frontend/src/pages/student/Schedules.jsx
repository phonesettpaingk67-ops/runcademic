import Layout from '../../components/Layout';

export default function Schedules() {
  const mockSchedules = [
    { id: 1, title: 'Physics Lecture', date: '2024-04-20', time: '10:00 AM - 11:30 AM', location: 'Room 101' },
    { id: 2, title: 'Mathematics Lab', date: '2024-04-21', time: '2:00 PM - 4:00 PM', location: 'Lab 5' },
    { id: 3, title: 'Chemistry Tutorial', date: '2024-04-22', time: '3:00 PM - 4:00 PM', location: 'Room 205' },
  ];

  return (
    <Layout role="student">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Schedules</h1>
          <p className="text-gray-500 text-sm mt-1">View your upcoming classes and appointments.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {mockSchedules.map((schedule) => (
            <div key={schedule.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">{schedule.title}</h3>
              <div className="space-y-2 text-sm text-gray-600">
                <p><span className="font-semibold text-gray-700">Date:</span> {schedule.date}</p>
                <p><span className="font-semibold text-gray-700">Time:</span> {schedule.time}</p>
                <p><span className="font-semibold text-gray-700">Location:</span> {schedule.location}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
}
