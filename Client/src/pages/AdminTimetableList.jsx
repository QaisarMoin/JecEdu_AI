import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Navbar";
import API from "../services/api";

const DEFAULT_DEPARTMENT = "IT";
const SEMESTERS = [1, 2, 3, 4, 5, 6, 7, 8];

export default function AdminTimetableList() {

    const navigate = useNavigate();

    const [weeks, setWeeks] = useState([]);
    const [semester, setSemester] = useState("");
    const [loading, setLoading] = useState(false);


    useEffect(() => {
        fetchWeeks();
    }, [semester]);


    const fetchWeeks = async () => {

        setLoading(true);

        try {

            let url = `/timetable/weeks?department=${DEFAULT_DEPARTMENT}`;

            if (semester) {
                url += `&semester=${semester}`;
            }

            const res = await API.get(url);
            setWeeks(res.data);

        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }

    };


    return (

        <div className="flex min-h-screen bg-gray-50">

            <Sidebar />

            <div className="flex-1 p-8 ml-64">

                <div className="max-w-6xl mx-auto">

                    {/* Header */}
                    <div className="flex items-center justify-between mb-8">

                        <div>
                            <h1 className="text-3xl font-bold text-gray-800">
                                Timetable Management
                            </h1>
                            <p className="text-gray-500 mt-1">
                                {DEFAULT_DEPARTMENT} Department
                            </p>
                        </div>

                        <button
                            onClick={() => navigate("/admin/timetable/generate")}
                            className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all"
                        >
                            + Generate New Timetable
                        </button>

                    </div>


                    {/* Filter */}
                    <div className="bg-white rounded-xl shadow-sm border p-4 mb-6 flex gap-4 items-center">

                        <span className="text-sm font-medium text-gray-600">
                            Filter by Semester:
                        </span>

                        <div className="flex gap-2 flex-wrap">

                            <button
                                onClick={() => setSemester("")}
                                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                                    semester === ""
                                        ? "bg-indigo-600 text-white"
                                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                }`}
                            >
                                All
                            </button>

                            {SEMESTERS.map(s => (

                                <button
                                    key={s}
                                    onClick={() => setSemester(s.toString())}
                                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                                        semester === s.toString()
                                            ? "bg-indigo-600 text-white"
                                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                    }`}
                                >
                                    Sem {s}
                                </button>

                            ))}

                        </div>

                    </div>


                    {/* Weeks List */}
                    {loading ? (

                        <div className="text-center text-gray-400 py-16">
                            <div className="text-4xl mb-3 animate-spin">⏳</div>
                            Loading timetables...
                        </div>

                    ) : weeks.length === 0 ? (

                        <div className="text-center py-16 bg-white rounded-xl shadow-sm border">
                            <div className="text-5xl mb-4">📅</div>
                            <p className="text-xl text-gray-400 mb-2">
                                No timetables found
                            </p>
                            <p className="text-sm text-gray-300">
                                {semester
                                    ? `No timetables for Semester ${semester}`
                                    : "Generate a new timetable to get started"
                                }
                            </p>
                        </div>

                    ) : (

                        <div className="grid gap-4">

                            {weeks.map(w => (

                                <div
                                    key={w._id}
                                    onClick={() => navigate(`/admin/timetable/edit/${w._id}`)}
                                    className="bg-white rounded-xl shadow-sm border p-5 hover:shadow-md hover:border-indigo-200 transition-all cursor-pointer group"
                                >

                                    <div className="flex items-center justify-between">

                                        <div>

                                            <div className="flex items-center gap-3 mb-1">

                                                <h3 className="font-bold text-gray-800 text-lg">
                                                    Semester {w.semester}
                                                </h3>

                                                <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                                                    w.status === "finalized"
                                                        ? "bg-green-100 text-green-700"
                                                        : "bg-yellow-100 text-yellow-700"
                                                }`}>
                                                    {w.status === "finalized" ? "✓ FINALIZED" : "DRAFT"}
                                                </span>

                                                {w.clonedFrom && (
                                                    <span className="text-xs text-blue-500 bg-blue-50 px-2 py-0.5 rounded-full">
                                                        📋 Cloned
                                                    </span>
                                                )}

                                            </div>

                                            <p className="text-gray-500 text-sm">
                                                Week of{" "}
                                                {new Date(w.weekStartDate).toLocaleDateString("en-IN", {
                                                    weekday: "long",
                                                    year: "numeric",
                                                    month: "long",
                                                    day: "numeric"
                                                })}
                                            </p>

                                            <p className="text-gray-400 text-xs mt-1">
                                                Created by: {w.createdBy?.name || "Unknown"}
                                                {" • "}
                                                {w.includeSaturday ? "Mon–Sat" : "Mon–Fri"}
                                                {" • "}
                                                {w.timeSlots?.filter(s => !s.isLunch).length} teaching slots/day
                                            </p>

                                        </div>

                                        <div className="text-gray-300 text-2xl group-hover:text-indigo-400 transition-colors">
                                            →
                                        </div>

                                    </div>

                                </div>

                            ))}

                        </div>

                    )}

                </div>

            </div>

        </div>

    );

}