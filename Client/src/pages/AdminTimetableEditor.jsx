import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Sidebar from "../components/Navbar";
import API from "../services/api";

const DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

const COLORS = [
  "#E3F2FD", "#E8F5E9", "#FFF3E0", "#F3E5F5",
  "#FCE4EC", "#E0F7FA", "#FFF9C4", "#F1F8E9",
  "#E8EAF6", "#FBE9E7",
];

const getColor = (code) => {
  if (!code) return "#f5f5f5";
  let hash = 0;
  for (let i = 0; i < code.length; i++) {
    hash = code.charCodeAt(i) + ((hash << 5) - hash);
  }
  return COLORS[Math.abs(hash) % COLORS.length];
};

export default function AdminTimetableEditor() {
  const { weekId } = useParams();
  const navigate = useNavigate();

  const [week, setWeek] = useState(null);
  const [entries, setEntries] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [conflicts, setConflicts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Edit modal
  const [editModal, setEditModal] = useState(null);
  const [addModal, setAddModal] = useState(null);

  // Clone
  const [cloneDate, setCloneDate] = useState("");
  const [showClone, setShowClone] = useState(false);

  useEffect(() => {
    fetchData();
  }, [weekId]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await API.get(`/timetable/week/${weekId}`);
      setWeek(res.data.week);
      setEntries(res.data.entries);

      // Fetch subjects for this dept/sem
      if (res.data.week) {
        const subRes = await API.get(
          `/subjects?department=${res.data.week.department}&semester=${res.data.week.semester}`
        );
        setSubjects(subRes.data);
      }

      // Check conflicts
      const conflictRes = await API.get(
        `/timetable/conflicts/${weekId}`
      );
      setConflicts(conflictRes.data.conflicts);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getEntry = (day, slotIndex) => {
    return entries.find(
      (e) => e.day === day && e.slotIndex === slotIndex
    );
  };

  const handleFinalize = async () => {
    if (conflicts.length > 0) {
      if (
        !window.confirm(
          `There are ${conflicts.length} conflicts. Finalize anyway?`
        )
      )
        return;
    }
    try {
      await API.post(`/timetable/finalize/${weekId}`);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || "Error");
    }
  };

  const handleUnfinalize = async () => {
    try {
      await API.post(`/timetable/unfinalize/${weekId}`);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || "Error");
    }
  };

  const handleDeleteEntry = async (entryId) => {
    if (!window.confirm("Delete this entry?")) return;
    try {
      await API.delete(`/timetable/entry/${entryId}`);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || "Error");
    }
  };

  const handleDeleteWeek = async () => {
    if (
      !window.confirm(
        "Delete this entire timetable week? This cannot be undone."
      )
    )
      return;
    try {
      await API.delete(`/timetable/week/${weekId}`);
      navigate("/admin/timetable");
    } catch (err) {
      alert(err.response?.data?.message || "Error");
    }
  };

  const handleClone = async () => {
    if (!cloneDate) return;
    try {
      const res = await API.post(`/timetable/clone/${weekId}`, {
        newWeekStartDate: cloneDate,
      });
      navigate(`/admin/timetable/edit/${res.data.weekId}`);
    } catch (err) {
      alert(err.response?.data?.message || "Error");
    }
  };

  const handleUpdateEntry = async () => {
    if (!editModal) return;
    try {
      await API.put(`/timetable/entry/${editModal.entryId}`, {
        subjectId: editModal.subjectId,
        facultyId: editModal.facultyId,
        room: editModal.room,
      });
      setEditModal(null);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || "Error");
    }
  };

  const handleAddEntry = async () => {
    if (!addModal) return;
    try {
      await API.post("/timetable/entry", {
        weekId,
        subjectId: addModal.subjectId,
        facultyId: addModal.facultyId,
        day: addModal.day,
        slotIndex: addModal.slotIndex,
        room: addModal.room,
      });
      setAddModal(null);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || "Error");
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 p-8 ml-64 flex items-center justify-center">
          <div className="text-xl text-gray-400">Loading...</div>
        </div>
      </div>
    );
  }

  if (!week) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 p-8 ml-64 flex items-center justify-center">
          <div className="text-xl text-red-400">
            Timetable week not found
          </div>
        </div>
      </div>
    );
  }

  const activeDays = DAYS.filter(
    (d) => week.includeSaturday || d !== "Saturday"
  );

  const selectedSubjectForAdd = addModal
    ? subjects.find((s) => s._id === addModal.subjectId)
    : null;

  const selectedSubjectForEdit = editModal
    ? subjects.find((s) => s._id === editModal.subjectId)
    : null;

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 p-6 ml-64">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between mb-6 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              Timetable Editor
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              {week.department} — Semester {week.semester} —{" "}
              Week of{" "}
              {new Date(week.weekStartDate).toLocaleDateString()}
              <span
                className={`ml-3 px-2 py-0.5 rounded-full text-xs font-semibold ${
                  week.status === "finalized"
                    ? "bg-green-100 text-green-700"
                    : "bg-yellow-100 text-yellow-700"
                }`}
              >
                {week.status.toUpperCase()}
              </span>
            </p>
          </div>

          <div className="flex gap-2 flex-wrap">
            {week.status === "draft" ? (
              <button
                onClick={handleFinalize}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 text-sm font-medium"
              >
                ✓ Finalize
              </button>
            ) : (
              <button
                onClick={handleUnfinalize}
                className="bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600 text-sm font-medium"
              >
                ↩ Unfinalize
              </button>
            )}

            <button
              onClick={() => setShowClone(!showClone)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm font-medium"
            >
              📋 Clone to Next Week
            </button>

            <button
              onClick={handleDeleteWeek}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 text-sm font-medium"
            >
              🗑 Delete Week
            </button>

            <button
              onClick={() => navigate("/admin/timetable")}
              className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 text-sm font-medium"
            >
              ← Back
            </button>
          </div>
        </div>

        {/* Clone Section */}
        {showClone && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 flex items-center gap-4">
            <label className="text-sm font-medium text-blue-800">
              Clone to week starting:
            </label>
            <input
              type="date"
              value={cloneDate}
              onChange={(e) => setCloneDate(e.target.value)}
              className="border rounded px-3 py-1"
            />
            <button
              onClick={handleClone}
              className="bg-blue-600 text-white px-4 py-1 rounded hover:bg-blue-700 text-sm"
            >
              Clone
            </button>
          </div>
        )}

        {/* Conflicts */}
        {conflicts.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <h3 className="text-red-700 font-semibold mb-2">
              ⚠ {conflicts.length} Faculty Conflict(s) Detected
            </h3>
            {conflicts.map((c, i) => (
              <p key={i} className="text-red-600 text-sm">
                {c.faculty} — {c.day} Slot {c.slotIndex}:{" "}
                {c.entry1.subject} (Sem {c.entry1.semester}) vs{" "}
                {c.entry2.subject} (Sem {c.entry2.semester})
              </p>
            ))}
          </div>
        )}

        {/* Timetable Grid */}
        <div className="bg-white rounded-xl shadow-sm border overflow-x-auto">
          <table className="w-full border-collapse min-w-[900px]">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-200 px-4 py-3 text-left text-sm font-semibold text-gray-600 w-28">
                  Time
                </th>
                {activeDays.map((day) => (
                  <th
                    key={day}
                    className="border border-gray-200 px-4 py-3 text-center text-sm font-semibold text-gray-600"
                  >
                    {day}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {week.timeSlots.map((slot, slotIndex) => {
                if (slot.isLunch) {
                  return (
                    <tr key={`lunch-${slotIndex}`}>
                      <td
                        colSpan={activeDays.length + 1}
                        className="border border-gray-200 text-center py-3 bg-yellow-50 text-yellow-700 font-semibold text-sm"
                      >
                        🍽 Lunch Break ({slot.start} - {slot.end})
                      </td>
                    </tr>
                  );
                }

                return (
                  <tr key={slotIndex}>
                    <td className="border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 bg-gray-50">
                      {slot.start}
                      <br />
                      <span className="text-gray-400">
                        {slot.end}
                      </span>
                    </td>
                    {activeDays.map((day) => {
                      const entry = getEntry(day, slotIndex);

                      return (
                        <td
                          key={day}
                          className="border border-gray-200 p-1 align-top h-24 relative group cursor-pointer"
                          onClick={() => {
                            if (!entry && week.status === "draft") {
                              setAddModal({
                                day,
                                slotIndex,
                                subjectId: "",
                                facultyId: "",
                                room: "",
                              });
                            }
                          }}
                        >
                          {entry ? (
                            <div
                              className="rounded-lg p-2 h-full relative"
                              style={{
                                backgroundColor: getColor(
                                  entry.subject?.code
                                ),
                              }}
                            >
                              <div className="font-bold text-sm text-gray-800">
                                {entry.subject?.code}
                              </div>
                              <div className="text-xs text-gray-600 mt-0.5">
                                {entry.subject?.name}
                              </div>
                              <div className="text-xs text-gray-500 mt-0.5">
                                👤 {entry.faculty?.name}
                              </div>
                              {entry.room && (
                                <div className="text-xs text-gray-400">
                                  📍 {entry.room}
                                </div>
                              )}
                              {entry.isManual && (
                                <span className="absolute top-1 right-1 text-xs text-orange-500">
                                  ✏
                                </span>
                              )}

                              {week.status === "draft" && (
                                <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 flex gap-1 transition-opacity">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setEditModal({
                                        entryId: entry._id,
                                        subjectId:
                                          entry.subject?._id,
                                        facultyId:
                                          entry.faculty?._id,
                                        room: entry.room || "",
                                      });
                                    }}
                                    className="bg-blue-500 text-white text-xs px-1.5 py-0.5 rounded"
                                  >
                                    ✏
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDeleteEntry(entry._id);
                                    }}
                                    className="bg-red-500 text-white text-xs px-1.5 py-0.5 rounded"
                                  >
                                    ✕
                                  </button>
                                </div>
                              )}
                            </div>
                          ) : (
                            week.status === "draft" && (
                              <div className="h-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <span className="text-gray-400 text-2xl">
                                  +
                                </span>
                              </div>
                            )
                          )}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Edit Modal */}
        {editModal && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-2xl">
              <h3 className="text-lg font-bold text-gray-800 mb-4">
                Edit Entry
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Subject
                  </label>
                  <select
                    value={editModal.subjectId}
                    onChange={(e) => {
                      const sub = subjects.find(
                        (s) => s._id === e.target.value
                      );
                      setEditModal({
                        ...editModal,
                        subjectId: e.target.value,
                        facultyId: sub?.faculty?._id || sub?.faculty || "",
                      });
                    }}
                    className="w-full border rounded-lg px-3 py-2"
                  >
                    <option value="">Select Subject</option>
                    {subjects.map((s) => (
                      <option key={s._id} value={s._id}>
                        {s.code} - {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Faculty
                  </label>
                  <p className="text-sm text-gray-500 border rounded-lg px-3 py-2 bg-gray-50">
                    {selectedSubjectForEdit?.faculty?.name ||
                      "Select a subject first"}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Room
                  </label>
                  <input
                    type="text"
                    value={editModal.room}
                    onChange={(e) =>
                      setEditModal({
                        ...editModal,
                        room: e.target.value,
                      })
                    }
                    className="w-full border rounded-lg px-3 py-2"
                    placeholder="e.g., Room 301"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 mt-6">
                <button
                  onClick={() => setEditModal(null)}
                  className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdateEntry}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Add Modal */}
        {addModal && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-2xl">
              <h3 className="text-lg font-bold text-gray-800 mb-4">
                Add Entry — {addModal.day},{" "}
                {week.timeSlots[addModal.slotIndex]?.start}
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Subject
                  </label>
                  <select
                    value={addModal.subjectId}
                    onChange={(e) => {
                      const sub = subjects.find(
                        (s) => s._id === e.target.value
                      );
                      setAddModal({
                        ...addModal,
                        subjectId: e.target.value,
                        facultyId: sub?.faculty?._id || sub?.faculty || "",
                      });
                    }}
                    className="w-full border rounded-lg px-3 py-2"
                  >
                    <option value="">Select Subject</option>
                    {subjects.map((s) => (
                      <option key={s._id} value={s._id}>
                        {s.code} - {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Faculty
                  </label>
                  <p className="text-sm text-gray-500 border rounded-lg px-3 py-2 bg-gray-50">
                    {selectedSubjectForAdd?.faculty?.name ||
                      "Select a subject first"}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Room
                  </label>
                  <input
                    type="text"
                    value={addModal.room}
                    onChange={(e) =>
                      setAddModal({
                        ...addModal,
                        room: e.target.value,
                      })
                    }
                    className="w-full border rounded-lg px-3 py-2"
                    placeholder="e.g., Room 301"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 mt-6">
                <button
                  onClick={() => setAddModal(null)}
                  className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddEntry}
                  disabled={!addModal.subjectId}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm disabled:bg-gray-300"
                >
                  Add Entry
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}