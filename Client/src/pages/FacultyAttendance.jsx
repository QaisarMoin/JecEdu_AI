import { useEffect, useState } from "react";
import Sidebar from "../components/Navbar";
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
      const res = await API.get(
        `/attendance/status?subjectId=${subjectId}&date=${date}`
      );
      setAlreadyMarked(res.data.alreadyMarked);
    } catch {
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

      await checkAttendanceStatus(subjectId, selectedDate);

      const res = await API.get(
        `/users/students?department=${subject.department}&semester=${subject.semester}`
      );

      setStudents(res.data);

      const initial = {};
      res.data.forEach((s) => (initial[s._id] = "present"));
      setAttendance(initial);
    } catch (error) {
      console.error("Failed to fetch students:", error);
    } finally {
      setLoading(false);
    }
  };

  const markAttendance = (studentId, status) => {
    setAttendance({ ...attendance, [studentId]: status });
  };

  const markAllAs = (status) => {
    const updated = {};
    students.forEach((s) => (updated[s._id] = status));
    setAttendance(updated);
  };

  const submitAttendance = async () => {
    setSubmitting(true);
    try {
      const attendanceArray = students.map((s) => ({
        studentId: s._id,
        status: attendance[s._id],
      }));

      await API.post("/attendance/mark-class", {
        subjectId: selectedSubject,
        date: selectedDate,
        attendance: attendanceArray,
      });

      setAlreadyMarked(true);
      alert("Attendance submitted successfully!");
    } catch (error) {
      alert(error.response?.data?.message || "Failed to submit attendance");
    } finally {
      setSubmitting(false);
    }
  };

  const filteredStudents = students.filter(
    (s) =>
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.rollNo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    total: students.length,
    present: Object.values(attendance).filter((s) => s === "present").length,
    absent: Object.values(attendance).filter((s) => s === "absent").length,
  };

  const selectedSubjectData = subjects.find(
    (s) => s._id === selectedSubject
  );

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />

      <div className="flex-1 p-8 ml-64">
        {/* Header */}
        <div className="mb-10 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              Attendance Management
            </h1>
            <p className="text-gray-500 mt-1">
              Mark and manage class attendance efficiently.
            </p>
          </div>
        </div>

        {/* Subject Selection */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="text-sm font-medium text-gray-700">
                Select Subject
              </label>
              <select
                value={selectedSubject}
                onChange={(e) => selectSubject(e.target.value)}
                className="mt-2 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Choose a subject...</option>
                {subjects.map((subject) => (
                  <option key={subject._id} value={subject._id}>
                    {subject.name} - Sem {subject.semester}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">
                Date
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                max={new Date().toISOString().split("T")[0]}
                className="mt-2 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {selectedSubjectData && (
            <div className="mt-6 bg-indigo-50 p-4 rounded-lg">
              <p className="font-semibold text-indigo-700">
                {selectedSubjectData.name}
              </p>
              <p className="text-sm text-indigo-600">
                Semester {selectedSubjectData.semester} •{" "}
                {selectedSubjectData.department}
              </p>
            </div>
          )}
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex justify-center py-20">
            <div className="animate-spin h-10 w-10 border-4 border-indigo-500 border-t-transparent rounded-full"></div>
          </div>
        )}

        {!loading && students.length > 0 && (
          <>
            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 mb-8">
              <div className="bg-white rounded-xl shadow-sm p-6">
                <p className="text-sm text-gray-500">Total</p>
                <p className="text-2xl font-bold text-gray-800">
                  {stats.total}
                </p>
              </div>

              <div className="bg-green-50 rounded-xl shadow-sm p-6">
                <p className="text-sm text-green-600">Present</p>
                <p className="text-2xl font-bold text-green-700">
                  {stats.present}
                </p>
              </div>

              <div className="bg-red-50 rounded-xl shadow-sm p-6">
                <p className="text-sm text-red-600">Absent</p>
                <p className="text-2xl font-bold text-red-700">
                  {stats.absent}
                </p>
              </div>
            </div>

            {/* Search + Bulk */}
            <div className="bg-white rounded-xl shadow-sm p-4 mb-6 flex justify-between items-center">
              <input
                type="text"
                placeholder="Search student..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg w-64 focus:ring-2 focus:ring-indigo-500"
              />

              <div className="flex gap-3">
                <button
                  onClick={() => markAllAs("present")}
                  disabled={alreadyMarked}
                  className="px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200"
                >
                  Mark All Present
                </button>

                <button
                  onClick={() => markAllAs("absent")}
                  disabled={alreadyMarked}
                  className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200"
                >
                  Mark All Absent
                </button>
              </div>
            </div>

            {/* Students */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-8">
              {filteredStudents.map((student, index) => (
                <div
                  key={student._id}
                  className="flex justify-between items-center px-6 py-4 border-b hover:bg-gray-50"
                >
                  <div>
                    <p className="font-semibold text-gray-800">
                      {student.name}
                    </p>
                    <p className="text-sm text-gray-500">
                      {student.rollNo}
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() =>
                        markAttendance(student._id, "present")
                      }
                      disabled={alreadyMarked}
                      className={`px-4 py-2 rounded-lg text-sm ${
                        attendance[student._id] === "present"
                          ? "bg-green-500 text-white"
                          : "bg-gray-100"
                      }`}
                    >
                      Present
                    </button>

                    <button
                      onClick={() =>
                        markAttendance(student._id, "absent")
                      }
                      disabled={alreadyMarked}
                      className={`px-4 py-2 rounded-lg text-sm ${
                        attendance[student._id] === "absent"
                          ? "bg-red-500 text-white"
                          : "bg-gray-100"
                      }`}
                    >
                      Absent
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Submit */}
            <div className="flex justify-end">
              <button
                onClick={submitAttendance}
                disabled={submitting || alreadyMarked}
                className="px-8 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 disabled:bg-gray-400"
              >
                {submitting
                  ? "Submitting..."
                  : alreadyMarked
                  ? "Attendance Already Marked"
                  : "Submit Attendance"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}