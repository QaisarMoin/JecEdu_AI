import Sidebar from "../components/Navbar";
import { Users, GraduationCap, BookOpen, Bell } from "lucide-react";

export default function Dashboard() {
  const user = JSON.parse(localStorage.getItem("user"));

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />

      <div className="flex-1 p-8 ml-64">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">
            Dashboard Overview
          </h1>
          <p className="text-gray-500 mt-1">
            Welcome back,{" "}
            <span className="font-semibold text-indigo-600">
              {user?.name}
            </span>
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">

          <StatCard
            title="Total Students"
            value="1,240"
            icon={<GraduationCap />}
            color="blue"
          />

          <StatCard
            title="Total Faculty"
            value="85"
            icon={<Users />}
            color="purple"
          />

          <StatCard
            title="Total Subjects"
            value="42"
            icon={<BookOpen />}
            color="yellow"
          />

          <StatCard
            title="Active Notices"
            value="12"
            icon={<Bell />}
            color="red"
          />
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Recent Activity
          </h3>

          <div className="space-y-4 text-sm text-gray-600">
            <div className="flex justify-between">
              <span>John Doe added new student record</span>
              <span>2 mins ago</span>
            </div>

            <div className="flex justify-between">
              <span>Alice Smith updated faculty timetable</span>
              <span>15 mins ago</span>
            </div>

            <div className="flex justify-between">
              <span>Exam notice posted</span>
              <span>1 hour ago</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* Small reusable stat card component */
function StatCard({ title, value, icon, color }) {
  const colors = {
    blue: "bg-blue-50 text-blue-600",
    purple: "bg-purple-50 text-purple-600",
    yellow: "bg-yellow-50 text-yellow-600",
    red: "bg-red-50 text-red-600",
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-500">{title}</p>
        <p className="text-2xl font-bold text-gray-800 mt-1">{value}</p>
      </div>

      <div className={`p-3 rounded-lg ${colors[color]}`}>
        {icon}
      </div>
    </div>
  );
}