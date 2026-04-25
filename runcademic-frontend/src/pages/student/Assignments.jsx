import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';

export default function StudentAssignments() {
  const menuItems = [
    { path: '/student', label: 'Dashboard', icon: '🎓' },
    { path: '/student/schedules', label: 'My Schedules', icon: '📅' },
    { path: '/student/assignments', label: 'Assignments', icon: '📝' },
    { path: '/student/grades', label: 'Grades', icon: '📊' },
  ];

  const assignments = [
    { id: 1, name: 'Programming Assignment 1', course: 'CS 101', dueDate: '2024-04-20', status: 'pending', submitted: false },
    { id: 2, name: 'Math Problem Set 3', course: 'MATH 201', dueDate: '2024-04-18', status: 'pending', submitted: false },
    { id: 3, name: 'Physics Lab Report', course: 'PHY 101', dueDate: '2024-04-22', status: 'pending', submitted: false },
    { id: 4, name: 'CS 101 Project 1', course: 'CS 101', dueDate: '2024-03-28', status: 'submitted', submitted: true },
    { id: 5, name: 'Calculus Quiz', course: 'MATH 201', dueDate: '2024-03-20', status: 'graded', submitted: true },
  ];

  return (
    <div className="flex">
      <Sidebar role="student" menuItems={menuItems} />
      <div className="flex-1 flex flex-col">
        <Navbar role="student" />
        <main className="flex-1 bg-gray-50 p-8">
          <div className="max-w-6xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Assignments</h1>
            <p className="text-gray-600 mb-8">Track your assignments and submissions.</p>

            <div className="space-y-4">
              {assignments.map(assignment => (
                <div key={assignment.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="text-lg font-bold text-gray-800">{assignment.name}</h3>
                      <p className="text-gray-600 text-sm">{assignment.course}</p>
                    </div>
                    <span className={`px-3 py-1 rounded text-sm font-bold ${
                      assignment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      assignment.status === 'submitted' ? 'bg-blue-100 text-blue-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {assignment.status}
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm mb-4">Due: {assignment.dueDate}</p>
                  {!assignment.submitted && assignment.status === 'pending' ? (
                    <button className="bg-[#E05F6B] hover:bg-[#D94D5A] text-white font-bold py-2 px-4 rounded transition text-sm">
                      Submit Assignment
                    </button>
                  ) : (
                    <button className="bg-gray-400 text-white font-bold py-2 px-4 rounded text-sm cursor-not-allowed">
                      Already Submitted
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
