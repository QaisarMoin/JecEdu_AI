import { useEffect, useState } from "react";
import Sidebar from "../components/Navbar";
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
    setEditData(JSON.parse(JSON.stringify(records)));
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
    const updated = editData.map((r) => ({ ...r, status }));
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
      alert("Failed to update attendance.");
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

  const filteredDates = Object.keys(history)
    .filter((date) => !searchDate || date.includes(searchDate))
    .sort((a, b) => new Date(b) - new Date(a));

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
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />

      <div className="flex-1 p-8 ml-64">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-gray-800">
            Attendance History
          </h1>
          <p className="text-gray-500 mt-1">
            View, analyze, and edit previously recorded attendance sessions.
          </p>
        </div>

        {/* Subject Selector */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <label className="text-sm font-medium text-gray-700 mr-2">
            Select Subject
          </label>
          <select
            value={selectedSubject}
            onChange={(e) => {
              setSelectedSubject(e.target.value);
              fetchHistory(e.target.value);
            }}
            className="mt-2 w-full md:w-96 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">Choose subject...</option>
            {subjects.map((s) => (
              <option key={s._id} value={s._id}>
                {s.name} - Sem {s.semester}
              </option>
            ))}
          </select>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex justify-center py-20">
            <div className="animate-spin h-10 w-10 border-4 border-indigo-500 border-t-transparent rounded-full"></div>
          </div>
        )}

        {!loading && selectedSubject && Object.keys(history).length > 0 && (
          <>
            {/* Overall Stats */}
            <div className="grid md:grid-cols-4 gap-6 mb-8">
              <StatCard label="Total Classes" value={overallStats.totalClasses} />
              <StatCard label="Total Records" value={overallStats.totalRecords} />
              <StatCard label="Total Present" value={overallStats.totalPresent} green />
              <StatCard label="Total Absent" value={overallStats.totalAbsent} red />
            </div>

            {/* Date Filter */}
            <div className="bg-white rounded-xl shadow-sm p-4 mb-6 flex justify-between items-center">
              <input
                type="date"
                value={searchDate}
                onChange={(e) => setSearchDate(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
              {searchDate && (
                <button
                  onClick={() => setSearchDate("")}
                  className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  Clear Filter
                </button>
              )}
            </div>

            {/* History Cards */}
            <div className="space-y-5">
              {filteredDates.map((date) => {
                const stats = getStats(history[date]);

                return (
                  <div
                    key={date}
                    className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition"
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800">
                          {formatDate(date)}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {stats.total} Students Recorded
                        </p>
                      </div>

                      <button
                        onClick={() => startEdit(date, history[date])}
                        className="px-4 py-2 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200"
                      >
                        Edit
                      </button>
                    </div>

                    <div className="mt-4 w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          stats.percentage >= 75
                            ? "bg-green-500"
                            : "bg-red-500"
                        }`}
                        style={{ width: `${stats.percentage}%` }}
                      ></div>
                    </div>

                    <div className="mt-3 text-sm text-gray-600">
                      Present: {stats.present} | Absent: {stats.absent} |{" "}
                      {stats.percentage}%
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {!loading && selectedSubject && Object.keys(history).length === 0 && (
          <EmptyState
            icon="📭"
            title="No attendance history"
            subtitle="No records found for this subject."
          />
        )}

        {!loading && !selectedSubject && (
          <EmptyState
            icon="📊"
            title="Select a Subject"
            subtitle="Choose a subject to view attendance history."
          />
        )}
      </div>

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-xl p-6">
            <h3 className="text-xl font-semibold mb-4">
              Edit Attendance - {formatDate(editDate)}
            </h3>

            <div className="max-h-80 overflow-y-auto space-y-3">
              {editData.map((record, index) => (
                <div
                  key={record._id}
                  className="flex justify-between items-center bg-gray-50 p-3 rounded-lg"
                >
                  <div>
                    <p className="font-medium">
                      {record.student?.name || "Unknown"}
                    </p>
                    <p className="text-xs text-gray-500">
                      {record.student?.rollNo}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => changeStatus(index, "present")}
                      className={`px-3 py-1 rounded-lg ${
                        record.status === "present"
                          ? "bg-green-500 text-white"
                          : "bg-gray-200"
                      }`}
                    >
                      Present
                    </button>
                    <button
                      onClick={() => changeStatus(index, "absent")}
                      className={`px-3 py-1 rounded-lg ${
                        record.status === "absent"
                          ? "bg-red-500 text-white"
                          : "bg-gray-200"
                      }`}
                    >
                      Absent
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={closeModal}
                className="px-4 py-2 bg-gray-200 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={saveEdit}
                disabled={saving}
                className="px-6 py-2 bg-indigo-600 text-white rounded-lg"
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, green, red }) {
  return (
    <div
      className={`bg-white rounded-xl shadow-sm p-6 ${
        green ? "border-l-4 border-green-500" : ""
      } ${red ? "border-l-4 border-red-500" : ""}`}
    >
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-2xl font-bold text-gray-800 mt-1">{value}</p>
    </div>
  );
}

function EmptyState({ icon, title, subtitle }) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-12 text-center">
      <div className="text-5xl mb-4">{icon}</div>
      <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
      <p className="text-gray-500 mt-1">{subtitle}</p>
    </div>
  );
}