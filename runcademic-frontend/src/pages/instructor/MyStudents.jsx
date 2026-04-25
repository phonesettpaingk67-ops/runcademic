import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import { useState } from 'react';

export default function MyStudents() {
  const menuItems = [
    { path: '/instructor', label: 'Dashboard', icon: '📊' },
    { path: '/instructor/schedules', label: 'My Schedules', icon: '📅' },
    { path: '/instructor/students', label: 'My Students', icon: '👥' },
    { path: '/instructor/grading', label: 'Assignment Grading', icon: '✏️' },
    { path: '/instructor/reports', label: 'Reports', icon: '📈' },
  ];

  const [students] = useState([
    { id: 1, name: 'Alice Johnson', email: 'alice@uni.edu', course: 'CS 101', gpa: '3.8', status: 'active' },
    { id: 2, name: 'Bob Smith', email: 'bob@uni.edu', course: 'CS 101', gpa: '3.5', status: 'active' },
    { id: 3, name: 'Carol White', email: 'carol@uni.edu', course: 'CS 201', gpa: '3.9', status: 'active' },
    { id: 4, name: 'David Brown', email: 'david@uni.edu', course: 'CS 101', gpa: '3.2', status: 'active' },
    { id: 5, name: 'Eve Davis', email: 'eve@uni.edu', course: 'CS 201', gpa: '3.7', status: 'inactive' },
  ]);

  return (
    <div className="flex">
      <Sidebar role="instructor" menuItems={menuItems} />
      <div className="flex-1 flex flex-col">
        <Navbar role="instructor" />
        <main className="flex-1 bg-gray-50 p-8">
          <div className="max-w-6xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">My Students</h1>
            <p className="text-gray-600 mb-8">Manage your enrolled students.</p>

            <div className="bg-white rounded-lg shadow-md overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-100 border-b">
                    <th className="px-6 py-3 text-left font-semibold">Name</th>
                    <th className="px-6 py-3 text-left font-semibold">Email</th>
                    <th className="px-6 py-3 text-left font-semibold">Course</th>
                    <th className="px-6 py-3 text-left font-semibold">GPA</th>
                    <th className="px-6 py-3 text-left font-semibold">Status</th>
                    <th className="px-6 py-3 text-center font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map(student => (
                    <tr key={student.id} className="border-b hover:bg-gray-50">
                      <td className="px-6 py-4 font-medium">{student.name}</td>
                      <td className="px-6 py-4">{student.email}</td>
                      <td className="px-6 py-4">{student.course}</td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded text-sm font-semibold">
                          {student.gpa}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded text-sm ${
                          student.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {student.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button className="text-blue-600 hover:underline text-sm">View Profile</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
