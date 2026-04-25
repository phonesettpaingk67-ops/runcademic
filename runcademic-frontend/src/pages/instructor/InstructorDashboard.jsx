import Layout from '../../components/Layout';
import { Link } from 'react-router-dom';

export default function InstructorDashboard() {
  const mockStats = {
    assignedTickets: 8,
    schedulesCreated: 5,
    pendingTasks: 3,
  };

  return (
    <Layout role="instructor">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Instructor Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1">Manage your classes, schedules, and assigned tickets.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link to="/instructor/tickets" className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-all">
            <p className="text-sm text-gray-500">Assigned Tickets</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">{mockStats.assignedTickets}</p>
          </Link>
          <Link to="/instructor/schedules" className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-all">
            <p className="text-sm text-gray-500">Schedules Created</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">{mockStats.schedulesCreated}</p>
          </Link>
          <Link to="/instructor/tasks" className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-all">
            <p className="text-sm text-gray-500">Pending Tasks</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">{mockStats.pendingTasks}</p>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link to="/instructor/tickets" className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 hover:shadow-md transition-all">
            <h3 className="text-lg font-semibold text-gray-900">View Assigned Tickets</h3>
            <p className="text-gray-500 text-sm mt-1">Review and update student support tickets.</p>
          </Link>
          <Link to="/instructor/create-schedule" className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 hover:shadow-md transition-all">
            <h3 className="text-lg font-semibold text-gray-900">Create New Schedule</h3>
            <p className="text-gray-500 text-sm mt-1">Add a class session or event to your calendar.</p>
          </Link>
          <Link to="/instructor/schedules" className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 hover:shadow-md transition-all">
            <h3 className="text-lg font-semibold text-gray-900">My Schedules</h3>
            <p className="text-gray-500 text-sm mt-1">View and manage your existing schedule entries.</p>
          </Link>
          <Link to="/instructor/tasks" className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 hover:shadow-md transition-all">
            <h3 className="text-lg font-semibold text-gray-900">My Tasks</h3>
            <p className="text-gray-500 text-sm mt-1">Track your grading and administrative tasks.</p>
          </Link>
        </div>
      </div>
    </Layout>
  );
}
