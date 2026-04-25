import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';

export default function InstructorReports() {
  const menuItems = [
    { path: '/instructor', label: 'Dashboard', icon: '📊' },
    { path: '/instructor/schedules', label: 'My Schedules', icon: '📅' },
    { path: '/instructor/students', label: 'My Students', icon: '👥' },
    { path: '/instructor/grading', label: 'Assignment Grading', icon: '✏️' },
    { path: '/instructor/reports', label: 'Reports', icon: '📈' },
  ];

  const courseStats = [
    { name: 'CS 101', students: 45, avgGrade: '3.6', attendance: '94%', passRate: '98%' },
    { name: 'CS 201', students: 32, avgGrade: '3.7', attendance: '92%', passRate: '96%' },
  ];

  return (
    <div className="flex">
      <Sidebar role="instructor" menuItems={menuItems} />
      <div className="flex-1 flex flex-col">
        <Navbar role="instructor" />
        <main className="flex-1 bg-gray-50 p-8">
          <div className="max-w-6xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Class Reports</h1>
            <p className="text-gray-600 mb-8">View performance and attendance reports for your courses.</p>

            <div className="bg-white rounded-lg shadow-md overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-100 border-b">
                    <th className="px-6 py-3 text-left font-semibold">Course</th>
                    <th className="px-6 py-3 text-left font-semibold">Students</th>
                    <th className="px-6 py-3 text-left font-semibold">Avg Grade</th>
                    <th className="px-6 py-3 text-left font-semibold">Attendance</th>
                    <th className="px-6 py-3 text-left font-semibold">Pass Rate</th>
                    <th className="px-6 py-3 text-center font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {courseStats.map((course, idx) => (
                    <tr key={idx} className="border-b hover:bg-gray-50">
                      <td className="px-6 py-4 font-bold text-gray-800">{course.name}</td>
                      <td className="px-6 py-4">{course.students}</td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded font-semibold">
                          {course.avgGrade}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 bg-green-100 text-green-800 rounded">
                          {course.attendance}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded">
                          {course.passRate}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center text-gray-500 text-sm">N/A</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Class Distribution</h2>
                <div className="space-y-3">
                  {['A', 'B', 'C', 'D'].map((grade, idx) => (
                    <div key={idx}>
                      <div className="flex justify-between mb-1">
                        <span className="font-semibold text-gray-700">Grade {grade}</span>
                        <span className="text-gray-600">{20 + idx * 5}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-[#E05F6B] h-2 rounded-full" style={{ width: `${20 + idx * 5}%` }}></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Performance Summary</h2>
                <div className="space-y-3">
                  <div className="flex justify-between p-2 bg-gray-50 rounded">
                    <span className="text-gray-700">Total Students</span>
                    <span className="font-bold text-gray-800">77</span>
                  </div>
                  <div className="flex justify-between p-2 bg-gray-50 rounded">
                    <span className="text-gray-700">Avg Attendance</span>
                    <span className="font-bold text-gray-800">93%</span>
                  </div>
                  <div className="flex justify-between p-2 bg-gray-50 rounded">
                    <span className="text-gray-700">Class GPA</span>
                    <span className="font-bold text-gray-800">3.65</span>
                  </div>
                  <div className="flex justify-between p-2 bg-gray-50 rounded">
                    <span className="text-gray-700">Pass Rate</span>
                    <span className="font-bold text-gray-800">97%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
