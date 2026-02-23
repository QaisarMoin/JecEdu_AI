import { useEffect, useState } from "react";
import API from "../services/api";
import Navbar from "../components/Navbar";

export default function Attendance() {
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAttendance();
  }, []);

  const fetchAttendance = async () => {
    try {
      setLoading(true);
      const res = await API.get("/attendance/student");
      setAttendance(res.data);
    } catch (error) {
      console.error("Failed to fetch attendance:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusStyles = (status) => {
    switch (status?.toLowerCase()) {
      case "present":
        return "bg-green-100 text-green-800 border-green-200";
      case "absent":
        return "bg-red-100 text-red-800 border-red-200";
      case "late":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "excused":
        return "bg-blue-100 text-blue-800 border-blue-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case "present":
        return "✓";
      case "absent":
        return "✗";
      case "late":
        return "⏱";
      case "excused":
        return "ℹ";
      default:
        return "•";
    }
  };

  const stats = {
    total: attendance.length,
    present: attendance.filter((a) => a.status?.toLowerCase() === "present").length,
    absent: attendance.filter((a) => a.status?.toLowerCase() === "absent").length,
    late: attendance.filter((a) => a.status?.toLowerCase() === "late").length,
  };

  const percentage = stats.total > 0 ? ((stats.present / stats.total) * 100).toFixed(1) : 0;

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900">Attendance</h2>
            <p className="mt-1 text-sm text-gray-500">
              Track your attendance across all subjects
            </p>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-10 w-10 border-4 border-indigo-500 border-t-transparent"></div>
            </div>
          ) : (
            <>
              {/* Stats Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                  <p className="text-sm font-medium text-gray-500">Total Classes</p>
                  <p className="mt-1 text-2xl font-bold text-gray-900">{stats.total}</p>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-green-200 p-5">
                  <p className="text-sm font-medium text-green-600">Present</p>
                  <p className="mt-1 text-2xl font-bold text-green-700">{stats.present}</p>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-red-200 p-5">
                  <p className="text-sm font-medium text-red-600">Absent</p>
                  <p className="mt-1 text-2xl font-bold text-red-700">{stats.absent}</p>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-indigo-200 p-5">
                  <p className="text-sm font-medium text-indigo-600">Attendance %</p>
                  <p className="mt-1 text-2xl font-bold text-indigo-700">{percentage}%</p>
                </div>
              </div>

              {/* Progress Bar */}
              {stats.total > 0 && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 mb-8">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Overall Attendance</span>
                    <span
                      className={`text-sm font-semibold ${
                        percentage >= 75 ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {percentage}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className={`h-3 rounded-full transition-all duration-500 ${
                        percentage >= 75 ? "bg-green-500" : "bg-red-500"
                      }`}
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                  {percentage < 75 && (
                    <p className="mt-2 text-xs text-red-500 font-medium">
                      ⚠ Your attendance is below the required 75% threshold
                    </p>
                  )}
                </div>
              )}

              {/* Attendance List */}
              {attendance.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                  <div className="text-5xl mb-4">📋</div>
                  <h3 className="text-lg font-semibold text-gray-900">No attendance records</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Your attendance records will appear here once available.
                  </p>
                </div>
              ) : (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                  <div className="px-5 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900">Attendance Records</h3>
                  </div>
                  <ul className="divide-y divide-gray-100">
                    {attendance.map((a) => (
                      <li
                        key={a._id}
                        className="px-5 py-4 hover:bg-gray-50 transition-colors duration-150 flex items-center justify-between"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`flex items-center justify-center w-10 h-10 rounded-full text-lg font-bold ${getStatusStyles(
                              a.status
                            )}`}
                          >
                            {getStatusIcon(a.status)}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-900">
                              {a.subject?.name || "Unknown Subject"}
                            </p>
                            {a.date && (
                              <p className="text-xs text-gray-500">
                                {new Date(a.date).toLocaleDateString("en-US", {
                                  weekday: "short",
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                })}
                              </p>
                            )}
                          </div>
                        </div>
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${getStatusStyles(
                            a.status
                          )}`}
                        >
                          {a.status}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}