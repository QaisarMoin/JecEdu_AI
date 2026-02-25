import { useEffect, useState } from "react";
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
];

const getColor = (code) => {
  if (!code) return "#f5f5f5";
  let hash = 0;
  for (let i = 0; i < code.length; i++) {
    hash = code.charCodeAt(i) + ((hash << 5) - hash);
  }
  return COLORS[Math.abs(hash) % COLORS.length];
};

export default function FacultyTimetable() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [weekStart, setWeekStart] = useState("");

  const user = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => {
    fetchTimetable();
  }, [weekStart]);

  const fetchTimetable = async () => {
    setLoading(true);
    try {
      let url = `/timetable/faculty/${user.id || user._id}`;
      if (weekStart) url += `?weekStartDate=${weekStart}`;

      const res = await API.get(url);
      setEntries(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Group entries by week
  const groupedByWeek = {};
  entries.forEach((e) => {
    const weekKey = e.timetableWeek?._id || "unknown";
    if (!groupedByWeek[weekKey]) {
      groupedByWeek[weekKey] = {
        week: e.timetableWeek,
        entries: [],
      };
    }
    groupedByWeek[weekKey].entries.push(e);
  });

  // Build grid for a set of entries
  const buildGrid = (weekEntries) => {
    // Find all unique time slots
    const timeSlotMap = {};
    weekEntries.forEach((e) => {
      timeSlotMap[e.slotIndex] = {
        start: e.startTime,
        end: e.endTime,
      };
    });

    const sortedSlots = Object.keys(timeSlotMap)
      .map(Number)
      .sort((a, b) => a - b);

    return { timeSlotMap, sortedSlots };
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 p-8 ml-64">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            My Timetable
          </h1>
          <p className="text-gray-500 mb-6">
            Welcome, {user.name}. Here is your teaching schedule.
          </p>

          <div className="mb-6 flex items-center gap-3">
            <label className="text-sm font-medium text-gray-600">
              Filter by week:
            </label>
            <input
              type="date"
              value={weekStart}
              onChange={(e) => setWeekStart(e.target.value)}
              className="border rounded-lg px-3 py-2"
            />
            {weekStart && (
              <button
                onClick={() => setWeekStart("")}
                className="text-sm text-blue-600 hover:underline"
              >
                Show all
              </button>
            )}
          </div>

          {loading ? (
            <div className="text-center text-gray-400 py-12">
              Loading...
            </div>
          ) : entries.length === 0 ? (
            <div className="text-center text-gray-400 py-12 bg-white rounded-xl shadow-sm border">
              <p className="text-xl">No timetable available</p>
              <p className="text-sm mt-2">
                Your timetable will appear here once finalized by admin
              </p>
            </div>
          ) : (
            Object.values(groupedByWeek).map(
              ({ week, entries: weekEntries }) => {
                const { timeSlotMap, sortedSlots } =
                  buildGrid(weekEntries);

                return (
                  <div
                    key={week?._id || "unknown"}
                    className="bg-white rounded-xl shadow-sm border mb-8 overflow-x-auto"
                  >
                    <div className="p-4 border-b bg-gray-50">
                      <h2 className="font-bold text-gray-700">
                        {week?.department} — Semester{" "}
                        {week?.semester} — Week of{" "}
                        {week?.weekStartDate
                          ? new Date(
                              week.weekStartDate
                            ).toLocaleDateString()
                          : "N/A"}
                      </h2>
                    </div>

                    <table className="w-full border-collapse min-w-[800px]">
                      <thead>
                        <tr className="bg-gray-100">
                          <th className="border border-gray-200 px-3 py-2 text-sm text-gray-600">
                            Time
                          </th>
                          {DAYS.map((day) => (
                            <th
                              key={day}
                              className="border border-gray-200 px-3 py-2 text-sm text-gray-600"
                            >
                              {day}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {sortedSlots.map((slotIndex) => (
                          <tr key={slotIndex}>
                            <td className="border border-gray-200 px-3 py-2 text-sm font-medium text-gray-600 bg-gray-50">
                              {timeSlotMap[slotIndex].start}
                              <br />
                              <span className="text-gray-400">
                                {timeSlotMap[slotIndex].end}
                              </span>
                            </td>
                            {DAYS.map((day) => {
                              const entry = weekEntries.find(
                                (e) =>
                                  e.day === day &&
                                  e.slotIndex === slotIndex
                              );

                              return (
                                <td
                                  key={day}
                                  className="border border-gray-200 p-1 h-20"
                                >
                                  {entry ? (
                                    <div
                                      className="rounded-lg p-2 h-full"
                                      style={{
                                        backgroundColor: getColor(
                                          entry.subject?.code
                                        ),
                                      }}
                                    >
                                      <div className="font-bold text-sm">
                                        {entry.subject?.code}
                                      </div>
                                      <div className="text-xs text-gray-600">
                                        {entry.subject?.name}
                                      </div>
                                      {entry.room && (
                                        <div className="text-xs text-gray-400 mt-1">
                                          📍 {entry.room}
                                        </div>
                                      )}
                                    </div>
                                  ) : null}
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                );
              }
            )
          )}
        </div>
      </div>
    </div>
  );
}