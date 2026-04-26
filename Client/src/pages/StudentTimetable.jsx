import { useEffect, useState } from "react";
import Sidebar from "../components/Navbar";
import API from "../services/api";
import { Printer } from "lucide-react";
import { printElement } from "../utils/printUtils";

const DEFAULT_DEPARTMENT = "IT";

const DAYS = [
    "Monday", "Tuesday", "Wednesday",
    "Thursday", "Friday", "Saturday"
];

const COLORS = [
    "#E3F2FD", "#E8F5E9", "#FFF3E0", "#F3E5F5",
    "#FCE4EC", "#E0F7FA", "#FFF9C4", "#F1F8E9"
];

const getColor = (code) => {
    if (!code) return "#f5f5f5";
    let hash = 0;
    for (let i = 0; i < code.length; i++) {
        hash = code.charCodeAt(i) + ((hash << 5) - hash);
    }
    return COLORS[Math.abs(hash) % COLORS.length];
};

export default function StudentTimetable() {

    const [week, setWeek] = useState(null);
    const [entries, setEntries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [weekStart, setWeekStart] = useState("");

    const user = JSON.parse(localStorage.getItem("user") || "{}");

    const department = user.department || DEFAULT_DEPARTMENT;
    const semester = user.semester;


    useEffect(() => {
        if (semester) {
            fetchTimetable();
        }
    }, [weekStart]);


    const fetchTimetable = async () => {

        setLoading(true);

        try {

            let url = `/timetable/student?department=${department}&semester=${semester}`;

            if (weekStart) {
                url += `&weekStartDate=${weekStart}`;
            }

            const res = await API.get(url);
            setWeek(res.data.week);
            setEntries(res.data.entries);

        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }

    };


    const activeDays = week
        ? DAYS.filter(d => week.includeSaturday || d !== "Saturday")
        : DAYS.slice(0, 5);


    return (

        <div className="flex min-h-screen bg-gray-50">

            <Sidebar />

            <div className="flex-1 p-4 lg:p-8 lg:ml-64 pt-20 lg:pt-8">

                <div className="max-w-7xl mx-auto">

                    <h1 className="text-3xl font-bold text-gray-800 mb-1">
                        My Class Timetable
                    </h1>

                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <p className="text-gray-500">
                                {department} — Semester {semester || "N/A"}
                            </p>
                        </div>
                    </div>


                    {/* Week Filter */}
                    <div className="bg-white rounded-xl shadow-sm border p-4 mb-6 flex items-center gap-3 flex-wrap">

                        <label className="text-sm font-medium text-gray-600">
                            View specific week:
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
                                className="text-sm text-indigo-600 hover:underline"
                            >
                                Show Latest
                            </button>
                        )}

                    </div>


                    {/* Content */}
                    {!semester ? (

                        <div className="text-center py-16 bg-white rounded-xl shadow-sm border">
                            <div className="text-5xl mb-4">⚠️</div>
                            <p className="text-xl text-gray-400">
                                Semester not set in your profile
                            </p>
                            <p className="text-sm text-gray-300 mt-2">
                                Contact admin to update your profile
                            </p>
                        </div>

                    ) : loading ? (

                        <div className="text-center text-gray-400 py-16">
                            <div className="text-4xl mb-3 animate-spin">⏳</div>
                            Loading timetable...
                        </div>

                    ) : !week ? (

                        <div className="text-center py-16 bg-white rounded-xl shadow-sm border">
                            <div className="text-5xl mb-4">📅</div>
                            <p className="text-xl text-gray-400">
                                No finalized timetable available
                            </p>
                            <p className="text-sm text-gray-300 mt-2">
                                Please check back later
                            </p>
                        </div>

                    ) : (

                        <div className="bg-white rounded-xl shadow-sm border overflow-x-auto">

                            <div className="p-4 border-b bg-gray-50 flex items-center justify-between">

                                <h2 className="font-bold text-gray-700">
                                    Week of{" "}
                                    {new Date(week.weekStartDate).toLocaleDateString("en-IN", {
                                        weekday: "long",
                                        year: "numeric",
                                        month: "long",
                                        day: "numeric"
                                    })}
                                </h2>

                                <div className="flex items-center gap-3">
                                    <span className="bg-green-100 text-green-700 text-xs font-semibold px-2.5 py-1 rounded-full">
                                        ✓ FINALIZED
                                    </span>
                                    <button
                                        onClick={() => printElement("student-timetable-card")}
                                        className="text-gray-400 hover:text-indigo-600 p-1.5 rounded-lg hover:bg-white shadow-sm transition-all"
                                        title="Print Timetable"
                                    >
                                        <Printer size={18} />
                                    </button>
                                </div>

                            </div>

                            <div id="student-timetable-card" className="p-4 print:p-0">
                                {/* Print only watermark/header */}
                                <div className="hidden print:block mb-6 text-center border-b pb-4">
                                    <h1 className="text-2xl font-bold text-indigo-600">JEC TIMETABLE</h1>
                                    <p className="text-base font-medium text-gray-600 mt-1">
                                        {department} — Semester {semester}
                                    </p>
                                    <p className="text-sm text-gray-500 mt-1">
                                        Week of {new Date(week.weekStartDate).toLocaleDateString("en-IN", {
                                            weekday: "long",
                                            year: "numeric",
                                            month: "long",
                                            day: "numeric"
                                        })}
                                    </p>
                                    <p className="text-xs text-gray-400 mt-2 italic">Student: {user.name} ({user.email})</p>
                                </div>

                            <table className="w-full border-collapse min-w-[800px]">

                                <thead>
                                    <tr className="bg-gray-100">

                                        <th className="border border-gray-200 px-3 py-3 text-sm text-gray-600 w-28">
                                            Time
                                        </th>

                                        {activeDays.map(day => (
                                            <th
                                                key={day}
                                                className="border border-gray-200 px-3 py-3 text-sm text-gray-600"
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
                                                        className="border border-gray-200 text-center py-3 bg-amber-50 text-amber-700 font-semibold text-sm"
                                                    >
                                                        🍽 Lunch Break ({slot.start} — {slot.end})
                                                    </td>
                                                </tr>
                                            );
                                        }

                                        return (

                                            <tr key={slotIndex}>

                                                <td className="border border-gray-200 px-3 py-2 text-sm font-medium text-gray-600 bg-gray-50">
                                                    {slot.start}
                                                    <br />
                                                    <span className="text-gray-400">{slot.end}</span>
                                                </td>

                                                {activeDays.map(day => {

                                                    const entry = entries.find(
                                                        e => e.day === day && e.slotIndex === slotIndex
                                                    );

                                                    return (
                                                        <td
                                                            key={day}
                                                            className="border border-gray-200 p-1 h-24"
                                                        >
                                                            {entry ? (

                                                                <div
                                                                    className="rounded-lg p-3 h-full"
                                                                    style={{
                                                                        backgroundColor: getColor(entry.subject?.code)
                                                                    }}
                                                                >
                                                                    <div className="font-bold text-sm text-gray-800">
                                                                        {entry.subject?.code}
                                                                    </div>
                                                                    <div className="text-xs text-gray-600 mt-0.5">
                                                                        {entry.subject?.name}
                                                                    </div>
                                                                    <div className="text-xs text-gray-500 mt-1">
                                                                        👤 {entry.faculty?.name}
                                                                    </div>
                                                                    {entry.room && (
                                                                        <div className="text-xs text-gray-400">
                                                                            📍 {entry.room}
                                                                        </div>
                                                                    )}
                                                                </div>

                                                            ) : null}
                                                        </td>
                                                    );

                                                })}

                                            </tr>

                                        );

                                    })}

                                </tbody>

                            </table>
                            </div>

                        </div>

                    )}

                </div>

            </div>

        </div>

    );

}