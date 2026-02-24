import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import API from "../services/api";

export default function FacultyAttendance() {
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState("");
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [alreadyMarked, setAlreadyMarked] = useState(false);

  useEffect(() => {
    fetchSubjects();
  }, []);

  // Re-check attendance status when date changes
  useEffect(() => {
    if (selectedSubject) {
      checkAttendanceStatus(selectedSubject, selectedDate);
    }
  }, [selectedDate, selectedSubject]);

  const fetchSubjects = async () => {
    try {
      const res = await API.get("/subjects/faculty");
      setSubjects(res.data);
    } catch (error) {
      console.error("Failed to fetch subjects:", error);
    }
  };

  const checkAttendanceStatus = async (subjectId, date) => {
    try {
      const statusRes = await API.get(
        `/attendance/status?subjectId=${subjectId}&date=${date}`
      );
      setAlreadyMarked(statusRes.data.alreadyMarked);
    } catch (error) {
      console.error("Failed to check attendance status:", error);
      setAlreadyMarked(false);
    }
  };

  const selectSubject = async (subjectId) => {
    if (!subjectId) {
      setSelectedSubject("");
      setStudents([]);
      setAttendance({});
      setAlreadyMarked(false);
      return;
    }

    setSelectedSubject(subjectId);
    setLoading(true);

    try {
      const subject = subjects.find((s) => s._id === subjectId);
      
      // Check if attendance already marked
      await checkAttendanceStatus(subjectId, selectedDate);

      // Fetch students
      const res = await API.get(
        `/users/students?department=${subject.department}&semester=${subject.semester}`
      );

      setStudents(res.data);

      const initial = {};
      res.data.forEach((student) => {
        initial[student._id] = "present";
      });
      setAttendance(initial);
    } catch (error) {
      console.error("Failed to fetch students:", error);
    } finally {
      setLoading(false);
    }
  };

  const markAttendance = (studentId, status) => {
    setAttendance({
      ...attendance,
      [studentId]: status,
    });
  };

  const markAllAs = (status) => {
    const updated = {};
    students.forEach((student) => {
      updated[student._id] = status;
    });
    setAttendance(updated);
  };

  const submitAttendance = async () => {
    setSubmitting(true);

    try {
      const attendanceArray = students.map((student) => ({
        studentId: student._id,
        status: attendance[student._id],
      }));

      await API.post("/attendance/mark-class", {
        subjectId: selectedSubject,
        date: selectedDate,
        attendance: attendanceArray,
      });

      alert("Attendance submitted successfully!");
      setAlreadyMarked(true); // Update state after successful submission
    } catch (error) {
      console.error("Failed to submit attendance:", error);
      alert(error.response?.data?.message || "Failed to submit attendance");
    } finally {
      setSubmitting(false);
    }
  };

  const filteredStudents = students.filter(
    (student) =>
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.rollNo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    total: students.length,
    present: Object.values(attendance).filter((s) => s === "present").length,
    absent: Object.values(attendance).filter((s) => s === "absent").length,
  };

  const selectedSubjectData = subjects.find((s) => s._id === selectedSubject);

  // Helper function to get button content
  const getSubmitButtonContent = () => {
    if (submitting) {
      return (
        <span className="flex items-center gap-2">
          <svg
            className="animate-spin h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          Submitting...
        </span>
      );
    }
    
    if (alreadyMarked) {
      return (
        <span className="flex items-center gap-2">
          <span>✓</span>
          Attendance Already Marked
        </span>
      );
    }
    
    return (
      <span className="flex items-center gap-2">
        <span>Submit Attendance</span>
        <span>→</span>
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Mark Attendance</h2>
          <p className="mt-1 text-sm text-gray-500">
            Select a subject and mark attendance for students
          </p>
        </div>

        {/* Subject Selection Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Subject Dropdown */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Subject
              </label>
              <select
                onChange={(e) => selectSubject(e.target.value)}
                value={selectedSubject}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white text-gray-900 transition-colors"
              >
                <option value="">Choose a subject...</option>
                {subjects.map((subject) => (
                  <option key={subject._id} value={subject._id}>
                    {subject.name} - Sem {subject.semester}
                  </option>
                ))}
              </select>
            </div>

            {/* Date Picker */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                max={new Date().toISOString().split("T")[0]}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white text-gray-900 transition-colors"
              />
            </div>
          </div>

          {/* Selected Subject Info */}
          {selectedSubjectData && (
            <div className="mt-4 p-4 bg-indigo-50 rounded-lg border border-indigo-100">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 bg-indigo-100 rounded-full">
                  <span className="text-indigo-600 text-lg">📚</span>
                </div>
                <div>
                  <p className="font-semibold text-indigo-900">
                    {selectedSubjectData.name}
                  </p>
                  <p className="text-sm text-indigo-600">
                    Semester {selectedSubjectData.semester} •{" "}
                    {selectedSubjectData.department}
                  </p>
                </div>
                {alreadyMarked && (
                  <span className="ml-auto px-3 py-1 bg-yellow-100 text-yellow-800 text-sm font-medium rounded-full">
                    Already Marked
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-4 border-indigo-500 border-t-transparent"></div>
          </div>
        )}

        {/* Student List */}
        {!loading && students.length > 0 && (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                <p className="text-sm font-medium text-gray-500">
                  Total Students
                </p>
                <p className="mt-1 text-2xl font-bold text-gray-900">
                  {stats.total}
                </p>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-green-200 p-5">
                <p className="text-sm font-medium text-green-600">Present</p>
                <p className="mt-1 text-2xl font-bold text-green-700">
                  {stats.present}
                </p>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-red-200 p-5">
                <p className="text-sm font-medium text-red-600">Absent</p>
                <p className="mt-1 text-2xl font-bold text-red-700">
                  {stats.absent}
                </p>
              </div>
            </div>

            {/* Actions Bar */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
              <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                {/* Search */}
                <div className="relative w-full sm:w-64">
                  <input
                    type="text"
                    placeholder="Search by name or roll no..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                  />
                  <svg
                    className="absolute left-3 top-2.5 h-5 w-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>

                {/* Bulk Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => markAllAs("present")}
                    disabled={alreadyMarked}
                    className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                      alreadyMarked
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                        : "text-green-700 bg-green-100 hover:bg-green-200"
                    }`}
                  >
                    Mark All Present
                  </button>
                  <button
                    onClick={() => markAllAs("absent")}
                    disabled={alreadyMarked}
                    className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                      alreadyMarked
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                        : "text-red-700 bg-red-100 hover:bg-red-200"
                    }`}
                  >
                    Mark All Absent
                  </button>
                </div>
              </div>
            </div>

            {/* Student Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
              <div className="px-5 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">
                  Students ({filteredStudents.length})
                </h3>
              </div>

              {filteredStudents.length === 0 ? (
                <div className="p-8 text-center">
                  <p className="text-gray-500">
                    No students match your search.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {filteredStudents.map((student, index) => (
                    <div
                      key={student._id}
                      className={`px-5 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors ${
                        attendance[student._id] === "absent" ? "bg-red-50" : ""
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <span className="flex items-center justify-center w-8 h-8 bg-gray-100 text-gray-600 rounded-full text-sm font-medium">
                          {index + 1}
                        </span>
                        <div>
                          <p className="font-semibold text-gray-900">
                            {student.name}
                          </p>
                          <p className="text-sm text-gray-500">
                            {student.rollNo}
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => markAttendance(student._id, "present")}
                          disabled={alreadyMarked}
                          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                            alreadyMarked
                              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                              : attendance[student._id] === "present"
                              ? "bg-green-500 text-white shadow-md scale-105"
                              : "bg-gray-100 text-gray-600 hover:bg-green-100 hover:text-green-700"
                          }`}
                        >
                          <span className="flex items-center gap-1">
                            <span>✓</span>
                            <span className="hidden sm:inline">Present</span>
                          </span>
                        </button>

                        <button
                          onClick={() => markAttendance(student._id, "absent")}
                          disabled={alreadyMarked}
                          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                            alreadyMarked
                              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                              : attendance[student._id] === "absent"
                              ? "bg-red-500 text-white shadow-md scale-105"
                              : "bg-gray-100 text-gray-600 hover:bg-red-100 hover:text-red-700"
                          }`}
                        >
                          <span className="flex items-center gap-1">
                            <span>✗</span>
                            <span className="hidden sm:inline">Absent</span>
                          </span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Submit Button */}
            <div className="flex justify-end">
              <button
                onClick={submitAttendance}
                disabled={submitting || alreadyMarked}
                className={`px-8 py-3 rounded-xl text-white font-semibold text-lg shadow-lg transition-all duration-200 ${
                  submitting || alreadyMarked
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-indigo-600 hover:bg-indigo-700 hover:shadow-xl active:scale-95"
                }`}
              >
                {getSubmitButtonContent()}
              </button>
            </div>
          </>
        )}

        {/* Empty State */}
        {!loading && selectedSubject && students.length === 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <div className="text-5xl mb-4">👥</div>
            <h3 className="text-lg font-semibold text-gray-900">
              No students found
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              No students are enrolled in this subject's department and
              semester.
            </p>
          </div>
        )}

        {/* Initial State */}
        {!loading && !selectedSubject && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <div className="text-5xl mb-4">📋</div>
            <h3 className="text-lg font-semibold text-gray-900">
              Select a Subject
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Choose a subject from the dropdown above to start marking
              attendance.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}