import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Navbar";
import API from "../services/api";

const DEFAULT_DEPARTMENT = "IT";

const DEFAULT_TIME_SLOTS = [
    { label: "9:00 - 10:00", start: "09:00", end: "10:00", isLunch: false },
    { label: "10:00 - 11:00", start: "10:00", end: "11:00", isLunch: false },
    { label: "11:00 - 12:00", start: "11:00", end: "12:00", isLunch: false },
    { label: "12:00 - 1:00 (Lunch)", start: "12:00", end: "13:00", isLunch: true },
    { label: "1:00 - 2:00", start: "13:00", end: "14:00", isLunch: false },
    { label: "2:00 - 3:00", start: "14:00", end: "15:00", isLunch: false },
    { label: "3:00 - 4:00", start: "15:00", end: "16:00", isLunch: false },
];

// Keep for future scalability — just add more departments here
const DEPARTMENTS = ["IT"];

const SEMESTERS = [1, 2, 3, 4, 5, 6, 7, 8];

export default function AdminTimetableGenerator() {

    const navigate = useNavigate();

    const [department, setDepartment] = useState(DEFAULT_DEPARTMENT);
    const [semester, setSemester] = useState("");
    const [weekStartDate, setWeekStartDate] = useState("");
    const [includeSaturday, setIncludeSaturday] = useState(true);
    const [timeSlots, setTimeSlots] = useState(DEFAULT_TIME_SLOTS);

    const [allSubjects, setAllSubjects] = useState([]);
    const [selectedSubjects, setSelectedSubjects] = useState([]);
    const [subjectsLoading, setSubjectsLoading] = useState(false);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // Custom slot
    const [newSlotStart, setNewSlotStart] = useState("");
    const [newSlotEnd, setNewSlotEnd] = useState("");
    const [newSlotIsLunch, setNewSlotIsLunch] = useState(false);


    // Fetch subjects whenever semester changes
    useEffect(() => {

        if (semester) {
            fetchSubjects();
        } else {
            setAllSubjects([]);
            setSelectedSubjects([]);
        }

    }, [semester, department]);


    const fetchSubjects = async () => {

        setSubjectsLoading(true);
        setSelectedSubjects([]);

        try {

            const res = await API.get(
                `/subjects?department=${department}&semester=${semester}`
            );

            setAllSubjects(res.data);

        } catch (err) {
            console.error("Failed to fetch subjects:", err);
            setAllSubjects([]);
        } finally {
            setSubjectsLoading(false);
        }

    };


    const toggleSubject = (subjectId) => {

        setSelectedSubjects(prev => {

            const exists = prev.find(s => s.subjectId === subjectId);

            if (exists) {
                return prev.filter(s => s.subjectId !== subjectId);
            }

            return [...prev, { subjectId, lecturesNeeded: 3 }];

        });

    };


    const updateLectures = (subjectId, count) => {

        setSelectedSubjects(prev =>
            prev.map(s =>
                s.subjectId === subjectId
                    ? { ...s, lecturesNeeded: parseInt(count) || 0 }
                    : s
            )
        );

    };


    const selectAllSubjects = () => {

        if (selectedSubjects.length === allSubjects.length) {
            setSelectedSubjects([]);
        } else {
            setSelectedSubjects(
                allSubjects.map(s => ({
                    subjectId: s._id,
                    lecturesNeeded: 3
                }))
            );
        }

    };


    const addTimeSlot = () => {

        if (!newSlotStart || !newSlotEnd) return;

        if (newSlotStart >= newSlotEnd) {
            alert("Start time must be before end time");
            return;
        }

        // Check for overlap
        const hasOverlap = timeSlots.some(slot =>
            (newSlotStart >= slot.start && newSlotStart < slot.end) ||
            (newSlotEnd > slot.start && newSlotEnd <= slot.end) ||
            (newSlotStart <= slot.start && newSlotEnd >= slot.end)
        );

        if (hasOverlap) {
            alert("This time slot overlaps with an existing slot");
            return;
        }

        setTimeSlots(prev =>
            [
                ...prev,
                {
                    label: newSlotIsLunch
                        ? `${newSlotStart} - ${newSlotEnd} (Lunch)`
                        : `${newSlotStart} - ${newSlotEnd}`,
                    start: newSlotStart,
                    end: newSlotEnd,
                    isLunch: newSlotIsLunch
                }
            ].sort((a, b) => a.start.localeCompare(b.start))
        );

        setNewSlotStart("");
        setNewSlotEnd("");
        setNewSlotIsLunch(false);

    };


    const removeTimeSlot = (index) => {
        setTimeSlots(prev => prev.filter((_, i) => i !== index));
    };


    const toggleLunch = (index) => {

        setTimeSlots(prev =>
            prev.map((slot, i) =>
                i === index
                    ? { ...slot, isLunch: !slot.isLunch }
                    : slot
            )
        );

    };


    const resetTimeSlots = () => {
        setTimeSlots(DEFAULT_TIME_SLOTS);
    };


    const getTotalLectures = () => {
        return selectedSubjects.reduce(
            (sum, s) => sum + s.lecturesNeeded, 0
        );
    };


    const getAvailableSlots = () => {

        const teachingSlots = timeSlots.filter(s => !s.isLunch).length;
        const days = includeSaturday ? 6 : 5;

        // Saturday has max 3 slots
        if (includeSaturday) {
            return (teachingSlots * 5) + Math.min(teachingSlots, 3);
        }

        return teachingSlots * days;

    };


    const handleGenerate = async () => {

        setError("");

        if (!semester) {
            setError("Please select a semester");
            return;
        }

        if (!weekStartDate) {
            setError("Please select a week start date");
            return;
        }

        if (selectedSubjects.length === 0) {
            setError("Please select at least one subject");
            return;
        }

        const lunchExists = timeSlots.some(s => s.isLunch);
        if (!lunchExists) {
            setError("Please mark at least one slot as lunch break");
            return;
        }

        const totalLectures = getTotalLectures();
        const availableSlots = getAvailableSlots();

        if (totalLectures > availableSlots) {
            setError(
                `Total lectures (${totalLectures}) exceed available slots (${availableSlots}). Reduce lectures or add more time slots.`
            );
            return;
        }

        setLoading(true);

        try {

            const res = await API.post("/timetable/generate", {
                department,
                semester: parseInt(semester),
                weekStartDate,
                timeSlots,
                includeSaturday,
                subjects: selectedSubjects
            });

            navigate(`/admin/timetable/edit/${res.data.weekId}`);

        } catch (err) {

            setError(
                err.response?.data?.message || "Generation failed"
            );

        } finally {
            setLoading(false);
        }

    };


    return (

        <div className="flex min-h-screen bg-gray-50">

            <Sidebar />

            <div className="flex-1 p-8 ml-64">

                <div className="max-w-5xl mx-auto">

                    {/* Header */}
                    <div className="mb-8">

                        <h1 className="text-3xl font-bold text-gray-800">
                            Generate New Timetable
                        </h1>

                        <p className="text-gray-500 mt-1">
                            Configure and generate a weekly timetable
                            for {DEFAULT_DEPARTMENT} department
                        </p>

                    </div>


                    {/* Error */}
                    {error && (
                        <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-center gap-2">
                            <span className="text-lg">⚠</span>
                            {error}
                        </div>
                    )}


                    {/* ========== BASIC INFO ========== */}
                    <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">

                        <h2 className="text-xl font-semibold mb-4 text-gray-700">
                            Basic Information
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">

                            {/* Department — fixed to IT for now */}
                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1">
                                    Department
                                </label>

                                {DEPARTMENTS.length === 1 ? (

                                    <div className="w-full border rounded-lg px-3 py-2 bg-gray-50 text-gray-700 font-medium">
                                        {DEFAULT_DEPARTMENT}
                                    </div>

                                ) : (

                                    <select
                                        value={department}
                                        onChange={(e) => setDepartment(e.target.value)}
                                        className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                                    >
                                        {DEPARTMENTS.map(d => (
                                            <option key={d} value={d}>{d}</option>
                                        ))}
                                    </select>

                                )}
                            </div>


                            {/* Semester */}
                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1">
                                    Semester *
                                </label>

                                <select
                                    value={semester}
                                    onChange={(e) => setSemester(e.target.value)}
                                    className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                                >
                                    <option value="">Select Semester</option>

                                    {SEMESTERS.map(s => (
                                        <option key={s} value={s}>
                                            Semester {s}
                                        </option>
                                    ))}
                                </select>
                            </div>


                            {/* Week Start Date */}
                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1">
                                    Week Start Date (Monday) *
                                </label>

                                <input
                                    type="date"
                                    value={weekStartDate}
                                    onChange={(e) => setWeekStartDate(e.target.value)}
                                    className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                                />
                            </div>


                            {/* Include Saturday */}
                            <div className="flex items-end pb-2">
                                <label className="flex items-center gap-2 cursor-pointer">

                                    <input
                                        type="checkbox"
                                        checked={includeSaturday}
                                        onChange={(e) => setIncludeSaturday(e.target.checked)}
                                        className="w-4 h-4 text-indigo-600 rounded"
                                    />

                                    <span className="text-sm font-medium text-gray-600">
                                        Include Saturday
                                    </span>

                                </label>
                            </div>

                        </div>

                    </div>


                    {/* ========== TIME SLOTS ========== */}
                    <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">

                        <div className="flex items-center justify-between mb-4">

                            <h2 className="text-xl font-semibold text-gray-700">
                                Time Slots Configuration
                            </h2>

                            <button
                                onClick={resetTimeSlots}
                                className="text-sm text-indigo-600 hover:text-indigo-800 hover:underline"
                            >
                                Reset to Default
                            </button>

                        </div>

                        {/* Existing Slots */}
                        <div className="space-y-2 mb-4">

                            {timeSlots.map((slot, index) => (

                                <div
                                    key={index}
                                    className={`flex items-center gap-3 p-3 rounded-lg transition-all ${
                                        slot.isLunch
                                            ? "bg-amber-50 border border-amber-200"
                                            : "bg-gray-50 border border-gray-200"
                                    }`}
                                >

                                    <div className="flex-1">

                                        <span className="font-medium text-sm text-gray-700">
                                            {slot.start} — {slot.end}
                                        </span>

                                        {slot.isLunch && (
                                            <span className="ml-2 text-xs text-amber-600 font-medium">
                                                (Lunch Break)
                                            </span>
                                        )}

                                    </div>

                                    <button
                                        onClick={() => toggleLunch(index)}
                                        className={`text-xs px-3 py-1.5 rounded-full font-medium transition-all ${
                                            slot.isLunch
                                                ? "bg-amber-200 text-amber-800 hover:bg-amber-300"
                                                : "bg-gray-200 text-gray-600 hover:bg-gray-300"
                                        }`}
                                    >
                                        {slot.isLunch ? "🍽 Lunch" : "📚 Class"}
                                    </button>

                                    <button
                                        onClick={() => removeTimeSlot(index)}
                                        className="text-red-400 hover:text-red-600 text-sm font-bold w-6 h-6 flex items-center justify-center rounded hover:bg-red-50"
                                    >
                                        ✕
                                    </button>

                                </div>

                            ))}

                        </div>


                        {/* Add New Slot */}
                        <div className="flex items-center gap-3 p-3 bg-indigo-50 rounded-lg border border-indigo-100">

                            <span className="text-sm text-indigo-600 font-medium">Add:</span>

                            <input
                                type="time"
                                value={newSlotStart}
                                onChange={(e) => setNewSlotStart(e.target.value)}
                                className="border rounded-lg px-2 py-1.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                            />

                            <span className="text-gray-400">to</span>

                            <input
                                type="time"
                                value={newSlotEnd}
                                onChange={(e) => setNewSlotEnd(e.target.value)}
                                className="border rounded-lg px-2 py-1.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                            />

                            <label className="flex items-center gap-1 text-sm text-gray-600 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={newSlotIsLunch}
                                    onChange={(e) => setNewSlotIsLunch(e.target.checked)}
                                    className="rounded"
                                />
                                Lunch
                            </label>

                            <button
                                onClick={addTimeSlot}
                                className="bg-indigo-600 text-white px-4 py-1.5 rounded-lg text-sm hover:bg-indigo-700 transition-colors"
                            >
                                + Add
                            </button>

                        </div>

                    </div>


                    {/* ========== SUBJECT SELECTION ========== */}
                    <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">

                        <div className="flex items-center justify-between mb-4">

                            <div>
                                <h2 className="text-xl font-semibold text-gray-700">
                                    Select Subjects & Lectures Per Week
                                </h2>

                                {semester && (
                                    <p className="text-sm text-gray-400 mt-1">
                                        Showing subjects for {department} — Semester {semester}
                                    </p>
                                )}
                            </div>

                            {allSubjects.length > 0 && (
                                <button
                                    onClick={selectAllSubjects}
                                    className="text-sm text-indigo-600 hover:text-indigo-800 hover:underline"
                                >
                                    {selectedSubjects.length === allSubjects.length
                                        ? "Deselect All"
                                        : "Select All"
                                    }
                                </button>
                            )}

                        </div>


                        {/* No semester selected */}
                        {!semester ? (

                            <div className="text-center py-8">
                                <div className="text-4xl mb-3">📋</div>
                                <p className="text-gray-400 italic">
                                    Select a semester to view available subjects
                                </p>
                            </div>

                        ) : subjectsLoading ? (

                            <div className="text-center py-8">
                                <div className="text-4xl mb-3 animate-spin">⏳</div>
                                <p className="text-gray-400">
                                    Loading subjects...
                                </p>
                            </div>

                        ) : allSubjects.length === 0 ? (

                            <div className="text-center py-8">
                                <div className="text-4xl mb-3">📭</div>
                                <p className="text-gray-400 italic">
                                    No subjects found for {department} — Semester {semester}
                                </p>
                                <p className="text-gray-300 text-sm mt-1">
                                    Add subjects first in Subject Management
                                </p>
                            </div>

                        ) : (

                            <div className="space-y-3">

                                {allSubjects.map(subject => {

                                    const selected = selectedSubjects.find(
                                        s => s.subjectId === subject._id
                                    );

                                    return (

                                        <div
                                            key={subject._id}
                                            className={`flex items-center gap-4 p-4 rounded-lg border cursor-pointer transition-all duration-200 ${
                                                selected
                                                    ? "border-indigo-400 bg-indigo-50 shadow-sm"
                                                    : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                                            }`}
                                            onClick={() => toggleSubject(subject._id)}
                                        >

                                            <input
                                                type="checkbox"
                                                checked={!!selected}
                                                readOnly
                                                className="w-4 h-4 text-indigo-600 rounded pointer-events-none"
                                            />

                                            <div className="flex-1 min-w-0">

                                                <div className="flex items-center gap-2 flex-wrap">

                                                    <span className="font-bold text-gray-800 bg-gray-100 px-2 py-0.5 rounded text-sm">
                                                        {subject.code}
                                                    </span>

                                                    <span className="text-gray-600">
                                                        {subject.name}
                                                    </span>

                                                </div>

                                                <p className="text-gray-400 text-xs mt-1">
                                                    Faculty: {subject.faculty?.name || "Not Assigned"}
                                                    {subject.credits &&
                                                        ` • ${subject.credits} credits`
                                                    }
                                                </p>

                                            </div>

                                            {selected && (

                                                <div
                                                    className="flex items-center gap-2 shrink-0"
                                                    onClick={(e) => e.stopPropagation()}
                                                >

                                                    <label className="text-sm text-gray-600 whitespace-nowrap">
                                                        Lectures/week:
                                                    </label>

                                                    <div className="flex items-center border rounded-lg overflow-hidden">

                                                        <button
                                                            onClick={() =>
                                                                updateLectures(
                                                                    subject._id,
                                                                    Math.max(1, selected.lecturesNeeded - 1)
                                                                )
                                                            }
                                                            className="px-2 py-1 bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold"
                                                        >
                                                            −
                                                        </button>

                                                        <input
                                                            type="number"
                                                            min="1"
                                                            max="10"
                                                            value={selected.lecturesNeeded}
                                                            onChange={(e) =>
                                                                updateLectures(
                                                                    subject._id,
                                                                    e.target.value
                                                                )
                                                            }
                                                            className="w-12 text-center text-sm py-1 outline-none"
                                                        />

                                                        <button
                                                            onClick={() =>
                                                                updateLectures(
                                                                    subject._id,
                                                                    Math.min(10, selected.lecturesNeeded + 1)
                                                                )
                                                            }
                                                            className="px-2 py-1 bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold"
                                                        >
                                                            +
                                                        </button>

                                                    </div>

                                                </div>

                                            )}

                                        </div>

                                    );

                                })}

                            </div>

                        )}

                    </div>


                    {/* ========== SUMMARY & GENERATE ========== */}
                    <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">

                        <h2 className="text-xl font-semibold mb-4 text-gray-700">
                            Summary
                        </h2>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">

                            <div className="bg-indigo-50 rounded-lg p-3 text-center">
                                <p className="text-2xl font-bold text-indigo-600">
                                    {selectedSubjects.length}
                                </p>
                                <p className="text-xs text-gray-500">
                                    Subjects Selected
                                </p>
                            </div>

                            <div className="bg-green-50 rounded-lg p-3 text-center">
                                <p className="text-2xl font-bold text-green-600">
                                    {getTotalLectures()}
                                </p>
                                <p className="text-xs text-gray-500">
                                    Total Lectures
                                </p>
                            </div>

                            <div className="bg-blue-50 rounded-lg p-3 text-center">
                                <p className="text-2xl font-bold text-blue-600">
                                    {getAvailableSlots()}
                                </p>
                                <p className="text-xs text-gray-500">
                                    Available Slots
                                </p>
                            </div>

                            <div className={`rounded-lg p-3 text-center ${
                                getTotalLectures() > getAvailableSlots()
                                    ? "bg-red-50"
                                    : "bg-emerald-50"
                            }`}>
                                <p className={`text-2xl font-bold ${
                                    getTotalLectures() > getAvailableSlots()
                                        ? "text-red-600"
                                        : "text-emerald-600"
                                }`}>
                                    {getAvailableSlots() - getTotalLectures()}
                                </p>
                                <p className="text-xs text-gray-500">
                                    Remaining Slots
                                </p>
                            </div>

                        </div>

                        {getTotalLectures() > getAvailableSlots() && (
                            <p className="text-red-500 text-sm mb-4">
                                ⚠ Total lectures exceed available slots.
                                Reduce lectures or add more time slots.
                            </p>
                        )}

                    </div>


                    {/* Generate Button */}
                    <div className="flex justify-between items-center">

                        <button
                            onClick={() => navigate("/admin/timetable")}
                            className="px-6 py-3 rounded-xl text-gray-600 font-medium border hover:bg-gray-50 transition-colors"
                        >
                            ← Back to List
                        </button>

                        <button
                            onClick={handleGenerate}
                            disabled={loading || getTotalLectures() > getAvailableSlots()}
                            className={`px-8 py-3 rounded-xl text-white font-semibold text-lg shadow-lg transition-all ${
                                loading || getTotalLectures() > getAvailableSlots()
                                    ? "bg-gray-400 cursor-not-allowed"
                                    : "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 hover:shadow-xl"
                            }`}
                        >
                            {loading
                                ? "⏳ Generating..."
                                : "🚀 Generate Timetable"
                            }
                        </button>

                    </div>

                </div>

            </div>

        </div>

    );

}