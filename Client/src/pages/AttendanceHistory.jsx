import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import API from "../services/api";

export default function AttendanceHistory() {
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState("");
  const [history, setHistory] = useState({});
  const [editData, setEditData] = useState([]);
  const [editDate, setEditDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [searchDate, setSearchDate] = useState("");

  useEffect(() => {
    fetchSubjects();
  }, []);

  const fetchSubjects = async () => {
    try {
      const res = await API.get("/subjects/faculty");
      setSubjects(res.data);
    } catch (error) {
      console.error("Failed to fetch subjects:", error);
    }
  };

  const fetchHistory = async (subjectId) => {
    if (!subjectId) {
      setHistory({});
      return;
    }

    setLoading(true);
    try {
      const res = await API.get(`/attendance/history/${subjectId}`);
      setHistory(res.data);
    } catch (error) {
      console.error("Failed to fetch history:", error);
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (date, records) => {
    setEditDate(date);
    setEditData(JSON.parse(JSON.stringify(records))); // Deep copy
    setShowEditModal(true);
  };

  const closeModal = () => {
    setShowEditModal(false);
    setEditData([]);
    setEditDate("");
  };

  const changeStatus = (index, status) => {
    const updated = [...editData];
    updated[index].status = status;
    setEditData(updated);
  };

  const markAllEditAs = (status) => {
    const updated = editData.map((record) => ({
      ...record,
      status: status,
    }));
    setEditData(updated);
  };

  const saveEdit = async () => {
    setSaving(true);
    try {
      await API.put("/attendance/update", {
        attendance: editData,
      });
      alert("Attendance updated successfully!");
      closeModal();
      fetchHistory(selectedSubject);
    } catch (error) {
      console.error("Failed to update attendance:", error);
      alert("Failed to update attendance. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getStats = (records) => {
    const present = records.filter((r) => r.status === "present").length;
    const absent = records.filter((r) => r.status === "absent").length;
    const total = records.length;
    const percentage = total > 0 ? ((present / total) * 100).toFixed(0) : 0;
    return { present, absent, total, percentage };
  };

  const selectedSubjectData = subjects.find((s) => s._id === selectedSubject);

  const filteredDates = Object.keys(history)
    .filter((date) => {
      if (!searchDate) return true;
      return date.includes(searchDate);
    })
    .sort((a, b) => new Date(b) - new Date(a)); // Sort by newest first

  const overallStats = {
    totalClasses: Object.keys(history).length,
    totalRecords: Object.values(history).flat().length,
    totalPresent: Object.values(history)
      .flat()
      .filter((r) => r.status === "present").length,
    totalAbsent: Object.values(history)
      .flat()
      .filter((r) => r.status === "absent").length,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900">
            Attendance History
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            View and edit past attendance records
          </p>
        </div>

        {/* Subject Selection Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Subject
          </label>
          <select
            value={selectedSubject}
            onChange={(e) => {
              setSelectedSubject(e.target.value);
              fetchHistory(e.target.value);
            }}
            className="w-full md:w-96 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white text-gray-900 transition-colors"
          >
            <option value="">Choose a subject...</option>
            {subjects.map((subject) => (
              <option key={subject._id} value={subject._id}>
                {subject.name} - Sem {subject.semester}
              </option>
            ))}
          </select>

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

        {/* History Content */}
        {!loading && selectedSubject && Object.keys(history).length > 0 && (
          <>
            {/* Overall Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                <p className="text-sm font-medium text-gray-500">
                  Total Classes
                </p>
                <p className="mt-1 text-2xl font-bold text-gray-900">
                  {overallStats.totalClasses}
                </p>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-blue-200 p-5">
                <p className="text-sm font-medium text-blue-600">
                  Total Records
                </p>
                <p className="mt-1 text-2xl font-bold text-blue-700">
                  {overallStats.totalRecords}
                </p>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-green-200 p-5">
                <p className="text-sm font-medium text-green-600">
                  Total Present
                </p>
                <p className="mt-1 text-2xl font-bold text-green-700">
                  {overallStats.totalPresent}
                </p>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-red-200 p-5">
                <p className="text-sm font-medium text-red-600">Total Absent</p>
                <p className="mt-1 text-2xl font-bold text-red-700">
                  {overallStats.totalAbsent}
                </p>
              </div>
            </div>

            {/* Search/Filter Bar */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
              <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                <div className="relative w-full sm:w-64">
                  <input
                    type="date"
                    value={searchDate}
                    onChange={(e) => setSearchDate(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                  />
                </div>
                {searchDate && (
                  <button
                    onClick={() => setSearchDate("")}
                    className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                  >
                    Clear Filter
                  </button>
                )}
              </div>
            </div>

            {/* History Cards */}
            <div className="space-y-4">
              {filteredDates.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
                  <p className="text-gray-500">
                    No records found for the selected date.
                  </p>
                </div>
              ) : (
                filteredDates.map((date) => {
                  const stats = getStats(history[date]);
                  return (
                    <div
                      key={date}
                      className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
                    >
                      <div className="p-5">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          {/* Date Info */}
                          <div className="flex items-center gap-4">
                            <div className="flex items-center justify-center w-14 h-14 bg-indigo-100 rounded-xl">
                              <span className="text-2xl">📅</span>
                            </div>
                            <div>
                              <h3 className="text-lg font-semibold text-gray-900">
                                {formatDate(date)}
                              </h3>
                              <p className="text-sm text-gray-500">
                                {stats.total} students recorded
                              </p>
                            </div>
                          </div>

                          {/* Stats & Actions */}
                          <div className="flex items-center gap-4">
                            {/* Mini Stats */}
                            <div className="flex items-center gap-3">
                              <div className="flex items-center gap-1">
                                <span className="flex items-center justify-center w-6 h-6 bg-green-100 text-green-600 rounded-full text-xs font-bold">
                                  ✓
                                </span>
                                <span className="text-sm font-medium text-green-700">
                                  {stats.present}
                                </span>
                              </div>
                              <div className="flex items-center gap-1">
                                <span className="flex items-center justify-center w-6 h-6 bg-red-100 text-red-600 rounded-full text-xs font-bold">
                                  ✗
                                </span>
                                <span className="text-sm font-medium text-red-700">
                                  {stats.absent}
                                </span>
                              </div>
                              <div
                                className={`px-3 py-1 rounded-full text-sm font-semibold ${
                                  stats.percentage >= 75
                                    ? "bg-green-100 text-green-700"
                                    : "bg-red-100 text-red-700"
                                }`}
                              >
                                {stats.percentage}%
                              </div>
                            </div>

                            {/* Edit Button */}
                            <button
                              onClick={() => startEdit(date, history[date])}
                              className="px-4 py-2 bg-indigo-100 text-indigo-700 hover:bg-indigo-200 rounded-lg font-medium text-sm transition-colors flex items-center gap-2"
                            >
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                                />
                              </svg>
                              Edit
                            </button>
                          </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="mt-4">
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full transition-all duration-300 ${
                                stats.percentage >= 75
                                  ? "bg-green-500"
                                  : "bg-red-500"
                              }`}
                              style={{ width: `${stats.percentage}%` }}
                            ></div>
                          </div>
                        </div>

                        {/* Expandable Student List Preview */}
                        <div className="mt-4 flex flex-wrap gap-2">
                          {history[date].slice(0, 5).map((record) => (
                            <span
                              key={record._id}
                              className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                record.status === "present"
                                  ? "bg-green-100 text-green-700"
                                  : "bg-red-100 text-red-700"
                              }`}
                            >
                              {record.student?.name || "Unknown"}
                            </span>
                          ))}
                          {history[date].length > 5 && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                              +{history[date].length - 5} more
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </>
        )}

        {/* Empty State - No History */}
        {!loading && selectedSubject && Object.keys(history).length === 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <div className="text-5xl mb-4">📭</div>
            <h3 className="text-lg font-semibold text-gray-900">
              No attendance history
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              No attendance records found for this subject.
            </p>
          </div>
        )}

        {/* Initial State */}
        {!loading && !selectedSubject && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <div className="text-5xl mb-4">📊</div>
            <h3 className="text-lg font-semibold text-gray-900">
              Select a Subject
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Choose a subject from the dropdown above to view attendance
              history.
            </p>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:p-0">
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
              onClick={closeModal}
            ></div>

            {/* Modal */}
            <div className="relative bg-white rounded-2xl shadow-xl transform transition-all w-full max-w-2xl mx-auto">
              {/* Modal Header */}
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">
                      Edit Attendance
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                      {formatDate(editDate)}
                    </p>
                  </div>
                  <button
                    onClick={closeModal}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <svg
                      className="w-5 h-5 text-gray-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>

                {/* Bulk Actions */}
                <div className="flex gap-2 mt-4">
                  <button
                    onClick={() => markAllEditAs("present")}
                    className="px-3 py-1.5 text-sm font-medium text-green-700 bg-green-100 hover:bg-green-200 rounded-lg transition-colors"
                  >
                    Mark All Present
                  </button>
                  <button
                    onClick={() => markAllEditAs("absent")}
                    className="px-3 py-1.5 text-sm font-medium text-red-700 bg-red-100 hover:bg-red-200 rounded-lg transition-colors"
                  >
                    Mark All Absent
                  </button>
                </div>
              </div>

              {/* Modal Body */}
              <div className="px-6 py-4 max-h-96 overflow-y-auto">
                <div className="space-y-3">
                  {editData.map((record, index) => (
                    <div
                      key={record._id}
                      className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${
                        record.status === "absent"
                          ? "bg-red-50 border-red-200"
                          : "bg-gray-50 border-gray-200"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="flex items-center justify-center w-8 h-8 bg-white border border-gray-200 text-gray-600 rounded-full text-sm font-medium">
                          {index + 1}
                        </span>
                        <div>
                          <p className="font-medium text-gray-900">
                            {record.student?.name || "Unknown Student"}
                          </p>
                          <p className="text-xs text-gray-500">
                            {record.student?.rollNo || "N/A"}
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => changeStatus(index, "present")}
                          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                            record.status === "present"
                              ? "bg-green-500 text-white shadow-md"
                              : "bg-white border border-gray-300 text-gray-600 hover:border-green-300 hover:text-green-600"
                          }`}
                        >
                          ✓ Present
                        </button>
                        <button
                          onClick={() => changeStatus(index, "absent")}
                          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                            record.status === "absent"
                              ? "bg-red-500 text-white shadow-md"
                              : "bg-white border border-gray-300 text-gray-600 hover:border-red-300 hover:text-red-600"
                          }`}
                        >
                          ✗ Absent
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Modal Footer */}
              <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-green-600 font-medium">
                      ✓ Present:{" "}
                      {editData.filter((r) => r.status === "present").length}
                    </span>
                    <span className="text-red-600 font-medium">
                      ✗ Absent:{" "}
                      {editData.filter((r) => r.status === "absent").length}
                    </span>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={closeModal}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={saveEdit}
                      disabled={saving}
                      className={`px-6 py-2 text-sm font-medium text-white rounded-lg transition-all ${
                        saving
                          ? "bg-gray-400 cursor-not-allowed"
                          : "bg-indigo-600 hover:bg-indigo-700"
                      }`}
                    >
                      {saving ? (
                        <span className="flex items-center gap-2">
                          <svg
                            className="animate-spin h-4 w-4"
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
                          Saving...
                        </span>
                      ) : (
                        "Save Changes"
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}