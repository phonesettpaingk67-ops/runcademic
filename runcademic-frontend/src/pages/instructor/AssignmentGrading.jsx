import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import { useState } from 'react';

export default function AssignmentGrading() {
  const menuItems = [
    { path: '/instructor', label: 'Dashboard', icon: '📊' },
    { path: '/instructor/schedules', label: 'My Schedules', icon: '📅' },
    { path: '/instructor/students', label: 'My Students', icon: '👥' },
    { path: '/instructor/grading', label: 'Assignment Grading', icon: '✏️' },
    { path: '/instructor/reports', label: 'Reports', icon: '📈' },
  ];

  const [assignments] = useState([
    { id: 1, name: 'Midterm Exam', course: 'CS 101', submitted: 38, graded: 22, pending: 16, dueDate: '2024-04-10' },
    { id: 2, name: 'Project 1', course: 'CS 101', submitted: 40, graded: 40, pending: 0, dueDate: '2024-03-28' },
    { id: 3, name: 'Lab Assignment 5', course: 'CS 201', submitted: 28, graded: 15, pending: 13, dueDate: '2024-04-15' },
    { id: 4, name: 'Homework Set 3', course: 'CS 201', submitted: 32, graded: 32, pending: 0, dueDate: '2024-04-08' },
  ]);

  return (
    <div className="flex">
      <Sidebar role="instructor" menuItems={menuItems} />
      <div className="flex-1 flex flex-col">
        <Navbar role="instructor" />
        <main className="flex-1 bg-gray-50 p-8">
          <div className="max-w-6xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Assignment Grading</h1>
            <p className="text-gray-600 mb-8">Grade and manage student assignments.</p>

            <div className="space-y-4">
              {assignments.map(assignment => (
                <div key={assignment.id} className="bg-white rounded-lg shadow-md p-6 border-l-4 border-[#E05F6B]">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-gray-800">{assignment.name}</h3>
                      <p className="text-gray-600 text-sm">{assignment.course} • Due: {assignment.dueDate}</p>
                    </div>
                    <button className="bg-[#E05F6B] hover:bg-[#D94D5A] text-white font-bold py-2 px-4 rounded transition text-sm">
                      View & Grade
                    </button>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-3 bg-blue-50 rounded">
                      <p className="text-gray-600 text-xs font-semibold">SUBMITTED</p>
                      <p className="text-2xl font-bold text-blue-600">{assignment.submitted}</p>
                    </div>
                    <div className="text-center p-3 bg-green-50 rounded">
                      <p className="text-gray-600 text-xs font-semibold">GRADED</p>
                      <p className="text-2xl font-bold text-green-600">{assignment.graded}</p>
                    </div>
                    <div className="text-center p-3 bg-yellow-50 rounded">
                      <p className="text-gray-600 text-xs font-semibold">PENDING</p>
                      <p className="text-2xl font-bold text-yellow-600">{assignment.pending}</p>
                    </div>
                  </div>

                  <div className="mt-4 w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full"
                      style={{ width: `${(assignment.graded / assignment.submitted) * 100}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
