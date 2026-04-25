import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';

export default function StudentGrades() {
  const menuItems = [
    { path: '/student', label: 'Dashboard', icon: '🎓' },
    { path: '/student/schedules', label: 'My Schedules', icon: '📅' },
    { path: '/student/assignments', label: 'Assignments', icon: '📝' },
    { path: '/student/grades', label: 'Grades', icon: '📊' },
  ];

  const courses = [
    { id: 1, name: 'CS 101 - Intro to Programming', instructor: 'Prof. Johnson', grade: 'A-', gpa: '3.7', assignments: [
      { name: 'Assignment 1', score: 95 },
      { name: 'Midterm Exam', score: 92 },
      { name: 'Project 1', score: 96 }
    ]},
    { id: 2, name: 'MATH 201 - Calculus II', instructor: 'Prof. Brown', grade: 'B+', gpa: '3.3', assignments: [
      { name: 'Problem Set 1', score: 88 },
      { name: 'Midterm Exam', score: 85 },
      { name: 'Problem Set 2', score: 87 }
    ]},
    { id: 3, name: 'PHY 101 - Physics', instructor: 'Prof. Williams', grade: 'A', gpa: '3.9', assignments: [
      { name: 'Lab Report 1', score: 98 },
      { name: 'Quiz', score: 94 },
      { name: 'Lab Report 2', score: 97 }
    ]},
  ];

  return (
    <div className="flex">
      <Sidebar role="student" menuItems={menuItems} />
      <div className="flex-1 flex flex-col">
        <Navbar role="student" />
        <main className="flex-1 bg-gray-50 p-8">
          <div className="max-w-6xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">My Grades</h1>
            <p className="text-gray-600 mb-8">View your grades and academic performance.</p>

            <div className="space-y-6">
              {courses.map(course => (
                <div key={course.id} className="bg-white rounded-lg shadow-md p-6 border-l-4 border-[#E05F6B]">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-gray-800">{course.name}</h3>
                      <p className="text-gray-600 text-sm">{course.instructor}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-4xl font-bold text-[#E05F6B]">{course.grade}</p>
                      <p className="text-gray-600 text-xs">GPA: {course.gpa}</p>
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <h4 className="font-bold text-gray-800 text-sm mb-3">Recent Assignments</h4>
                    <div className="space-y-2">
                      {course.assignments.map((assignment, idx) => (
                        <div key={idx} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                          <span className="text-gray-700 text-sm">{assignment.name}</span>
                          <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded text-sm font-bold">
                            {assignment.score}%
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Overall Statistics</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <p className="text-3xl font-bold text-blue-600">3.8</p>
                  <p className="text-gray-600 text-sm">Current GPA</p>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <p className="text-3xl font-bold text-green-600">93</p>
                  <p className="text-gray-600 text-sm">Avg. Score</p>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <p className="text-3xl font-bold text-purple-600">3</p>
                  <p className="text-gray-600 text-sm">Total Courses</p>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
