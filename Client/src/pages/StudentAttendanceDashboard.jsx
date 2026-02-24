import { useEffect, useState } from "react";
import Sidebar from "../components/Navbar";
import API from "../services/api";

export default function StudentAttendanceDashboard() {
    const [subjects, setSubjects] = useState([]);
    const [loading, setLoading] = useState(false);
    const [viewMode, setViewMode] = useState('cards'); // 'cards' or 'list'
    const [sortBy, setSortBy] = useState('name'); // 'name', 'percentage', 'total'

    const MINIMUM_ATTENDANCE = 75; // Minimum required attendance percentage

    useEffect(() => {
        fetchAttendance();
    }, []);

    const fetchAttendance = async () => {
        setLoading(true);
        try {
            const res = await API.get("/attendance/student-summary");
            setSubjects(res.data);
        } catch (error) {
            console.error("Error fetching attendance:", error);
        }
        setLoading(false);
    };

    const getAttendanceStatus = (percentage) => {
        if (percentage >= 75) {
            return {
                status: 'safe',
                label: 'On Track',
                color: 'text-emerald-600',
                bgColor: 'bg-emerald-100',
                borderColor: 'border-emerald-300',
                progressColor: 'bg-emerald-500',
                icon: (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                )
            };
        }
        if (percentage >= 60) {
            return {
                status: 'warning',
                label: 'At Risk',
                color: 'text-amber-600',
                bgColor: 'bg-amber-100',
                borderColor: 'border-amber-300',
                progressColor: 'bg-amber-500',
                icon: (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                )
            };
        }
        return {
            status: 'danger',
            label: 'Critical',
            color: 'text-red-600',
            bgColor: 'bg-red-100',
            borderColor: 'border-red-300',
            progressColor: 'bg-red-500',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            )
        };
    };

    const calculateClassesNeeded = (present, total, targetPercentage = 75) => {
        // Calculate how many consecutive classes needed to reach target
        // (present + x) / (total + x) >= targetPercentage/100
        // present + x >= (targetPercentage/100) * (total + x)
        // present + x >= 0.75 * total + 0.75 * x
        // x - 0.75x >= 0.75 * total - present
        // 0.25x >= 0.75 * total - present
        // x >= (0.75 * total - present) / 0.25
        
        const needed = Math.ceil((targetPercentage / 100 * total - present) / (1 - targetPercentage / 100));
        return Math.max(0, needed);
    };

    const calculateClassesCanMiss = (present, total, targetPercentage = 75) => {
        // How many classes can be missed while maintaining target
        // present / (total + x) >= targetPercentage/100
        // present >= (targetPercentage/100) * (total + x)
        // present / (targetPercentage/100) >= total + x
        // x <= present / (targetPercentage/100) - total
        
        const canMiss = Math.floor(present / (targetPercentage / 100) - total);
        return Math.max(0, canMiss);
    };

    const getOverallStats = () => {
        if (subjects.length === 0) return null;

        const totalPresent = subjects.reduce((sum, s) => sum + s.present, 0);
        const totalClasses = subjects.reduce((sum, s) => sum + s.total, 0);
        const overallPercentage = totalClasses > 0 ? ((totalPresent / totalClasses) * 100).toFixed(1) : 0;

        const safeCount = subjects.filter(s => s.percentage >= 75).length;
        const warningCount = subjects.filter(s => s.percentage >= 60 && s.percentage < 75).length;
        const dangerCount = subjects.filter(s => s.percentage < 60).length;

        return {
            totalPresent,
            totalClasses,
            overallPercentage,
            safeCount,
            warningCount,
            dangerCount,
            subjectCount: subjects.length
        };
    };

    const sortedSubjects = [...subjects].sort((a, b) => {
        switch (sortBy) {
            case 'percentage':
                return a.percentage - b.percentage;
            case 'total':
                return b.total - a.total;
            default:
                return a.subjectName?.localeCompare(b.subjectName);
        }
    });

    const stats = getOverallStats();

    // Circular Progress Component
    const CircularProgress = ({ percentage, size = 120, strokeWidth = 8 }) => {
        const radius = (size - strokeWidth) / 2;
        const circumference = radius * 2 * Math.PI;
        const offset = circumference - (percentage / 100) * circumference;
        const status = getAttendanceStatus(percentage);

        return (
            <div className="relative" style={{ width: size, height: size }}>
                <svg className="transform -rotate-90" width={size} height={size}>
                    <circle
                        className="text-gray-200"
                        strokeWidth={strokeWidth}
                        stroke="currentColor"
                        fill="transparent"
                        r={radius}
                        cx={size / 2}
                        cy={size / 2}
                    />
                    <circle
                        className={status.progressColor.replace('bg-', 'text-')}
                        strokeWidth={strokeWidth}
                        strokeDasharray={circumference}
                        strokeDashoffset={offset}
                        strokeLinecap="round"
                        stroke="currentColor"
                        fill="transparent"
                        r={radius}
                        cx={size / 2}
                        cy={size / 2}
                        style={{ transition: 'stroke-dashoffset 0.5s ease' }}
                    />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className={`text-2xl font-bold ${status.color}`}>
                        {percentage}%
                    </span>
                </div>
            </div>
        );
    };

    return (
       <div className="flex min-h-screen bg-gray-100">
             <Sidebar />
       
             <div className="flex-1 p-8 ml-64">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
                    <div>
                        <h2 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
                            <div className="p-2 bg-indigo-100 rounded-lg">
                                <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                                </svg>
                            </div>
                            My Attendance
                        </h2>
                        <p className="text-gray-600 mt-2">
                            Track your attendance across all subjects
                        </p>
                    </div>

                    {/* Controls */}
                    {subjects.length > 0 && (
                        <div className="mt-4 sm:mt-0 flex flex-wrap items-center gap-3">
                            {/* Sort Dropdown */}
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            >
                                <option value="name">Sort by Name</option>
                                <option value="percentage">Sort by Attendance</option>
                                <option value="total">Sort by Classes</option>
                            </select>

                            {/* View Toggle */}
                            <div className="flex items-center gap-1 bg-white rounded-lg p-1 shadow-sm border border-gray-200">
                                <button
                                    onClick={() => setViewMode('cards')}
                                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                                        viewMode === 'cards'
                                            ? 'bg-indigo-600 text-white'
                                            : 'text-gray-600 hover:bg-gray-100'
                                    }`}
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                                    </svg>
                                </button>
                                <button
                                    onClick={() => setViewMode('list')}
                                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                                        viewMode === 'list'
                                            ? 'bg-indigo-600 text-white'
                                            : 'text-gray-600 hover:bg-gray-100'
                                    }`}
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Loading State */}
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-16">
                        <svg className="animate-spin h-12 w-12 text-indigo-600 mb-4" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        <p className="text-gray-500">Loading your attendance...</p>
                    </div>
                ) : subjects.length === 0 ? (
                    /* Empty State */
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                        <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-10 h-10 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">No Attendance Records</h3>
                        <p className="text-gray-500 max-w-md mx-auto">
                            Your attendance records are not available yet. Please check back after your classes begin.
                        </p>
                    </div>
                ) : (
                    <>
                        {/* Overall Statistics Card */}
                        {stats && (
                            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl shadow-lg p-6 mb-8 text-white">
                                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                                    <div className="flex items-center gap-6">
                                        {/* Overall Circular Progress */}
                                        <div className="hidden sm:block">
                                            <div className="relative" style={{ width: 100, height: 100 }}>
                                                <svg className="transform -rotate-90" width={100} height={100}>
                                                    <circle
                                                        className="text-white/20"
                                                        strokeWidth={8}
                                                        stroke="currentColor"
                                                        fill="transparent"
                                                        r={42}
                                                        cx={50}
                                                        cy={50}
                                                    />
                                                    <circle
                                                        className="text-white"
                                                        strokeWidth={8}
                                                        strokeDasharray={264}
                                                        strokeDashoffset={264 - (stats.overallPercentage / 100) * 264}
                                                        strokeLinecap="round"
                                                        stroke="currentColor"
                                                        fill="transparent"
                                                        r={42}
                                                        cx={50}
                                                        cy={50}
                                                        style={{ transition: 'stroke-dashoffset 0.5s ease' }}
                                                    />
                                                </svg>
                                                <div className="absolute inset-0 flex items-center justify-center">
                                                    <span className="text-xl font-bold">{stats.overallPercentage}%</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div>
                                            <h3 className="text-lg font-medium text-indigo-200">Overall Attendance</h3>
                                            <div className="flex items-baseline gap-2 mt-1">
                                                <span className="text-4xl font-bold">{stats.overallPercentage}%</span>
                                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                                                    stats.overallPercentage >= 75 
                                                        ? 'bg-emerald-400 text-emerald-900' 
                                                        : stats.overallPercentage >= 60 
                                                        ? 'bg-amber-400 text-amber-900'
                                                        : 'bg-red-400 text-red-900'
                                                }`}>
                                                    {stats.overallPercentage >= 75 ? 'Good Standing' : stats.overallPercentage >= 60 ? 'Needs Improvement' : 'Critical'}
                                                </span>
                                            </div>
                                            <p className="text-indigo-200 text-sm mt-1">
                                                {stats.totalPresent} present out of {stats.totalClasses} classes
                                            </p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                        <div className="bg-white/10 rounded-lg px-4 py-3 text-center backdrop-blur-sm">
                                            <p className="text-3xl font-bold">{stats.subjectCount}</p>
                                            <p className="text-xs text-indigo-200 mt-1">Subjects</p>
                                        </div>
                                        <div className="bg-white/10 rounded-lg px-4 py-3 text-center backdrop-blur-sm">
                                            <p className="text-3xl font-bold text-emerald-300">{stats.safeCount}</p>
                                            <p className="text-xs text-indigo-200 mt-1">On Track</p>
                                        </div>
                                        <div className="bg-white/10 rounded-lg px-4 py-3 text-center backdrop-blur-sm">
                                            <p className="text-3xl font-bold text-amber-300">{stats.warningCount}</p>
                                            <p className="text-xs text-indigo-200 mt-1">At Risk</p>
                                        </div>
                                        <div className="bg-white/10 rounded-lg px-4 py-3 text-center backdrop-blur-sm">
                                            <p className="text-3xl font-bold text-red-300">{stats.dangerCount}</p>
                                            <p className="text-xs text-indigo-200 mt-1">Critical</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Minimum Attendance Notice */}
                                <div className="mt-4 pt-4 border-t border-white/20">
                                    <div className="flex items-center gap-2 text-sm text-indigo-200">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        Minimum required attendance: {MINIMUM_ATTENDANCE}%
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Cards View */}
                        {viewMode === 'cards' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {sortedSubjects.map(subject => {
                                    const status = getAttendanceStatus(subject.percentage);
                                    const classesNeeded = calculateClassesNeeded(subject.present, subject.total);
                                    const classesCanMiss = calculateClassesCanMiss(subject.present, subject.total);

                                    return (
                                        <div
                                            key={subject.subjectId}
                                            className={`bg-white rounded-xl shadow-sm border-l-4 ${status.borderColor} overflow-hidden hover:shadow-md transition-shadow`}
                                        >
                                            {/* Card Header */}
                                            <div className="p-5">
                                                <div className="flex items-start justify-between">
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2">
                                                            <h3 className="font-semibold text-gray-800 text-lg">
                                                                {subject.subjectName}
                                                            </h3>
                                                        </div>
                                                        <p className="text-sm text-gray-500 mt-0.5">
                                                            {subject.subjectCode}
                                                        </p>
                                                    </div>
                                                    <span className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${status.bgColor} ${status.color}`}>
                                                        {status.icon}
                                                        {status.label}
                                                    </span>
                                                </div>

                                                {/* Circular Progress */}
                                                <div className="flex justify-center my-6">
                                                    <CircularProgress percentage={subject.percentage} />
                                                </div>

                                                {/* Stats Grid */}
                                                <div className="grid grid-cols-3 gap-3 text-center">
                                                    <div className="bg-gray-50 rounded-lg p-3">
                                                        <p className="text-2xl font-bold text-gray-800">{subject.total}</p>
                                                        <p className="text-xs text-gray-500 mt-1">Total</p>
                                                    </div>
                                                    <div className="bg-emerald-50 rounded-lg p-3">
                                                        <p className="text-2xl font-bold text-emerald-600">{subject.present}</p>
                                                        <p className="text-xs text-emerald-600 mt-1">Present</p>
                                                    </div>
                                                    <div className="bg-red-50 rounded-lg p-3">
                                                        <p className="text-2xl font-bold text-red-600">{subject.absent}</p>
                                                        <p className="text-xs text-red-600 mt-1">Absent</p>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Card Footer - Recommendation */}
                                            <div className={`px-5 py-3 ${status.bgColor} border-t ${status.borderColor}`}>
                                                {subject.percentage >= MINIMUM_ATTENDANCE ? (
                                                    <div className="flex items-center gap-2 text-sm">
                                                        <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                        </svg>
                                                        <span className="text-emerald-700">
                                                            You can miss <span className="font-bold">{classesCanMiss}</span> more {classesCanMiss === 1 ? 'class' : 'classes'}
                                                        </span>
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center gap-2 text-sm">
                                                        <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                                        </svg>
                                                        <span className="text-red-700">
                                                            Attend <span className="font-bold">{classesNeeded}</span> consecutive {classesNeeded === 1 ? 'class' : 'classes'} to reach 75%
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {/* List View */}
                        {viewMode === 'list' && (
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="bg-gray-50 border-b border-gray-200">
                                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                                    Subject
                                                </th>
                                                <th className="px-4 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                                    Attendance
                                                </th>
                                                <th className="px-4 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                                    Present
                                                </th>
                                                <th className="px-4 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                                    Absent
                                                </th>
                                                <th className="px-4 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                                    Total
                                                </th>
                                                <th className="px-4 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                                    Status
                                                </th>
                                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                                    Action Needed
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200">
                                            {sortedSubjects.map((subject, index) => {
                                                const status = getAttendanceStatus(subject.percentage);
                                                const classesNeeded = calculateClassesNeeded(subject.present, subject.total);
                                                const classesCanMiss = calculateClassesCanMiss(subject.present, subject.total);

                                                return (
                                                    <tr
                                                        key={subject.subjectId}
                                                        className={`hover:bg-gray-50 transition-colors ${
                                                            index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'
                                                        }`}
                                                    >
                                                        {/* Subject */}
                                                        <td className="px-6 py-4">
                                                            <div className="flex items-center gap-3">
                                                                <div className={`p-2 rounded-lg ${status.bgColor}`}>
                                                                    <svg className={`w-5 h-5 ${status.color}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                                                    </svg>
                                                                </div>
                                                                <div>
                                                                    <p className="font-medium text-gray-900">
                                                                        {subject.subjectName}
                                                                    </p>
                                                                    <p className="text-xs text-gray-500">
                                                                        {subject.subjectCode}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </td>

                                                        {/* Attendance Percentage */}
                                                        <td className="px-4 py-4">
                                                            <div className="flex flex-col items-center">
                                                                <span className={`text-lg font-bold ${status.color}`}>
                                                                    {subject.percentage}%
                                                                </span>
                                                                <div className="w-20 h-1.5 bg-gray-200 rounded-full mt-1 overflow-hidden">
                                                                    <div
                                                                        className={`h-full rounded-full ${status.progressColor}`}
                                                                        style={{ width: `${subject.percentage}%` }}
                                                                    />
                                                                </div>
                                                            </div>
                                                        </td>

                                                        {/* Present */}
                                                        <td className="px-4 py-4 text-center">
                                                            <span className="inline-flex items-center justify-center px-3 py-1 rounded-lg bg-emerald-50 text-emerald-700 font-semibold">
                                                                {subject.present}
                                                            </span>
                                                        </td>

                                                        {/* Absent */}
                                                        <td className="px-4 py-4 text-center">
                                                            <span className="inline-flex items-center justify-center px-3 py-1 rounded-lg bg-red-50 text-red-700 font-semibold">
                                                                {subject.absent}
                                                            </span>
                                                        </td>

                                                        {/* Total */}
                                                        <td className="px-4 py-4 text-center">
                                                            <span className="inline-flex items-center justify-center px-3 py-1 rounded-lg bg-gray-100 text-gray-700 font-semibold">
                                                                {subject.total}
                                                            </span>
                                                        </td>

                                                        {/* Status */}
                                                        <td className="px-4 py-4 text-center">
                                                            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${status.bgColor} ${status.color}`}>
                                                                {status.icon}
                                                                {status.label}
                                                            </span>
                                                        </td>

                                                        {/* Action Needed */}
                                                        <td className="px-6 py-4">
                                                            {subject.percentage >= MINIMUM_ATTENDANCE ? (
                                                                <span className="text-sm text-emerald-600">
                                                                    Can miss {classesCanMiss} more
                                                                </span>
                                                            ) : (
                                                                <span className="text-sm text-red-600">
                                                                    Attend {classesNeeded} consecutive
                                                                </span>
                                                            )}
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {/* Legend & Info */}
                        <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Attendance Guidelines
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Status Legend */}
                                <div>
                                    <h4 className="text-sm font-medium text-gray-600 mb-3">Status Indicators</h4>
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-3">
                                            <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-600">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                                On Track
                                            </span>
                                            <span className="text-sm text-gray-600">75% and above - Good standing</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-600">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                                </svg>
                                                At Risk
                                            </span>
                                            <span className="text-sm text-gray-600">60% - 74% - Needs improvement</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-600">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                                Critical
                                            </span>
                                            <span className="text-sm text-gray-600">Below 60% - Immediate action required</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Important Notes */}
                                <div>
                                    <h4 className="text-sm font-medium text-gray-600 mb-3">Important Notes</h4>
                                    <ul className="space-y-2 text-sm text-gray-600">
                                        <li className="flex items-start gap-2">
                                            <svg className="w-4 h-4 text-indigo-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            Minimum {MINIMUM_ATTENDANCE}% attendance is required to appear in exams
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <svg className="w-4 h-4 text-indigo-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            Medical leaves require valid documentation
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <svg className="w-4 h-4 text-indigo-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            Contact your class advisor if attendance falls below 60%
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}