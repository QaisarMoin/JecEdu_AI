import { useEffect, useState } from "react";
import Sidebar from "../components/Navbar";
import API from "../services/api";

export default function StudentAttendanceDashboard() {
    const [subjects, setSubjects] = useState([]);
    const [loading, setLoading] = useState(false);
    const [viewMode, setViewMode] = useState('list');
    const [sortBy, setSortBy] = useState('name');
    const [selectedSubject, setSelectedSubject] = useState(null);

    const MINIMUM_ATTENDANCE = 75;

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
                label: 'Healthy',
                color: 'text-emerald-700',
                bgColor: 'bg-emerald-50',
                borderColor: 'border-emerald-200',
                progressColor: 'bg-gradient-to-r from-emerald-400 to-emerald-500',
                ringColor: 'stroke-emerald-500',
                dotColor: 'bg-emerald-500'
            };
        }
        if (percentage >= 60) {
            return {
                status: 'warning',
                label: 'Warning',
                color: 'text-amber-700',
                bgColor: 'bg-amber-50',
                borderColor: 'border-amber-200',
                progressColor: 'bg-gradient-to-r from-amber-400 to-amber-500',
                ringColor: 'stroke-amber-500',
                dotColor: 'bg-amber-500'
            };
        }
        return {
            status: 'danger',
            label: 'Critical',
            color: 'text-red-700',
            bgColor: 'bg-red-50',
            borderColor: 'border-red-200',
            progressColor: 'bg-gradient-to-r from-red-400 to-red-500',
            ringColor: 'stroke-red-500',
            dotColor: 'bg-red-500'
        };
    };

    const calculateClassesNeeded = (present, total, targetPercentage = 75) => {
        const needed = Math.ceil((targetPercentage / 100 * total - present) / (1 - targetPercentage / 100));
        return Math.max(0, needed);
    };

    const calculateClassesCanMiss = (present, total, targetPercentage = 75) => {
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

        return { totalPresent, totalClasses, overallPercentage, safeCount, warningCount, dangerCount, subjectCount: subjects.length };
    };

    const sortedSubjects = [...subjects].sort((a, b) => {
        switch (sortBy) {
            case 'percentage': return a.percentage - b.percentage;
            case 'total': return b.total - a.total;
            default: return a.subjectName?.localeCompare(b.subjectName);
        }
    });

    const stats = getOverallStats();

    // Semi-circular gauge component
    const AttendanceGauge = ({ percentage, size = 140 }) => {
        const status = getAttendanceStatus(percentage);
        const radius = 60;
        const circumference = Math.PI * radius;
        const progress = (percentage / 100) * circumference;

        return (
            <div className="relative flex items-center justify-center" style={{ width: size, height: size / 2 + 30 }}>
                <svg width={size} height={size / 2 + 20} className="overflow-visible">
                    {/* Background arc */}
                    <path
                        d={`M ${size * 0.1} ${size / 2} A ${radius} ${radius} 0 0 1 ${size * 0.9} ${size / 2}`}
                        fill="none"
                        stroke="#e5e7eb"
                        strokeWidth="12"
                        strokeLinecap="round"
                    />
                    {/* Progress arc */}
                    <path
                        d={`M ${size * 0.1} ${size / 2} A ${radius} ${radius} 0 0 1 ${size * 0.9} ${size / 2}`}
                        fill="none"
                        className={status.ringColor}
                        strokeWidth="12"
                        strokeLinecap="round"
                        strokeDasharray={circumference}
                        strokeDashoffset={circumference - progress}
                        style={{ transition: 'stroke-dashoffset 0.8s cubic-bezier(0.4, 0, 0.2, 1)' }}
                    />
                </svg>
                <div className="absolute bottom-0 text-center">
                    <span className={`text-3xl font-bold ${status.color}`}>{percentage}</span>
                    <span className={`text-lg ${status.color}`}>%</span>
                </div>
            </div>
        );
    };

    // Mini progress bar component
    const MiniProgressBar = ({ percentage, className = "" }) => {
        const status = getAttendanceStatus(percentage);
        return (
            <div className={`h-1.5 bg-gray-100 rounded-full overflow-hidden ${className}`}>
                <div
                    className={`h-full rounded-full ${status.progressColor} transition-all duration-500`}
                    style={{ width: `${percentage}%` }}
                />
            </div>
        );
    };

    return (
        <div className="flex min-h-screen bg-slate-50">
            <Sidebar />

            <div className="flex-1 ml-64">
                {/* Top Header Bar */}
                <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-slate-200">
                    <div className="px-8 py-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-200">
                                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h1 className="text-xl font-semibold text-slate-800">Attendance Overview</h1>
                                    </div>
                                </div>
                            </div>

                            {subjects.length > 0 && (
                                <div className="flex items-center gap-3">
                                    {/* Sort Dropdown */}
                                    <div className="relative">
                                        <select
                                            value={sortBy}
                                            onChange={(e) => setSortBy(e.target.value)}
                                            className="appearance-none pl-4 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:ring-2 focus:ring-indigo-500 focus:border-transparent cursor-pointer hover:bg-slate-100 transition-colors"
                                        >
                                            <option value="name">Sort: Name</option>
                                            <option value="percentage">Sort: Attendance</option>
                                            <option value="total">Sort: Classes</option>
                                        </select>
                                        <svg className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </div>

                                    {/* View Toggle */}
                                    <div className="flex items-center bg-slate-100 rounded-xl p-1">
                                        <button
                                            onClick={() => setViewMode('cards')}
                                            className={`p-2.5 rounded-lg transition-all duration-200 ${
                                                viewMode === 'cards'
                                                    ? 'bg-white shadow-sm text-indigo-600'
                                                    : 'text-slate-500 hover:text-slate-700'
                                            }`}
                                        >
                                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                                            </svg>
                                        </button>
                                        <button
                                            onClick={() => setViewMode('list')}
                                            className={`p-2.5 rounded-lg transition-all duration-200 ${
                                                viewMode === 'list'
                                                    ? 'bg-white shadow-sm text-indigo-600'
                                                    : 'text-slate-500 hover:text-slate-700'
                                            }`}
                                        >
                                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="p-8">
                    {/* Loading State */}
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-24">
                            <div className="relative w-16 h-16">
                                <div className="absolute inset-0 rounded-full border-4 border-slate-200"></div>
                                <div className="absolute inset-0 rounded-full border-4 border-indigo-600 border-t-transparent animate-spin"></div>
                            </div>
                            <p className="text-slate-500 mt-4 font-medium">Loading attendance data...</p>
                        </div>
                    ) : subjects.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-24">
                            <div className="w-24 h-24 rounded-2xl bg-slate-100 flex items-center justify-center mb-6">
                                <svg className="w-12 h-12 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-semibold text-slate-800 mb-2">No Records Found</h3>
                            <p className="text-slate-500 text-center max-w-md">
                                Attendance records will appear here once your classes begin.
                            </p>
                        </div>
                    ) : (
                        <>
                            {/* Stats Overview */}
                            {stats && (
                                <div className="grid grid-cols-12 gap-6 mb-8">
                                    {/* Main Stats Card */}
                                    <div className="col-span-12 lg:col-span-8 bg-white rounded-2xl border border-slate-200 p-6">
                                        <div className="flex items-start justify-between mb-6">
                                            <div>
                                                <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wide">Overall Attendance</h3>
                                                <div className="flex items-baseline gap-3 mt-2">
                                                    <span className="text-5xl font-bold text-slate-800">{stats.overallPercentage}%</span>
                                                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                                                        stats.overallPercentage >= 75 
                                                            ? 'bg-emerald-100 text-emerald-700' 
                                                            : stats.overallPercentage >= 60 
                                                            ? 'bg-amber-100 text-amber-700'
                                                            : 'bg-red-100 text-red-700'
                                                    }`}>
                                                        {stats.overallPercentage >= 75 ? 'Excellent' : stats.overallPercentage >= 60 ? 'Needs Work' : 'Critical'}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm text-slate-500">Classes Attended</p>
                                                <p className="text-2xl font-bold text-slate-800 mt-1">
                                                    {stats.totalPresent}<span className="text-slate-400 font-normal">/{stats.totalClasses}</span>
                                                </p>
                                            </div>
                                        </div>

                                        {/* Progress Bar */}
                                        <div className="relative h-3 bg-slate-100 rounded-full overflow-hidden mb-6">
                                            <div
                                                className={`h-full rounded-full transition-all duration-700 ${
                                                    stats.overallPercentage >= 75 
                                                        ? 'bg-gradient-to-r from-emerald-400 to-emerald-500' 
                                                        : stats.overallPercentage >= 60 
                                                        ? 'bg-gradient-to-r from-amber-400 to-amber-500'
                                                        : 'bg-gradient-to-r from-red-400 to-red-500'
                                                }`}
                                                style={{ width: `${stats.overallPercentage}%` }}
                                            />
                                            {/* 75% marker */}
                                            <div className="absolute top-0 bottom-0 w-0.5 bg-slate-400" style={{ left: '75%' }} />
                                        </div>

                                        {/* Quick Stats */}
                                        <div className="grid grid-cols-4 gap-4">
                                            <div className="text-center p-4 rounded-xl bg-slate-50">
                                                <p className="text-2xl font-bold text-slate-800">{stats.subjectCount}</p>
                                                <p className="text-xs text-slate-500 mt-1">Subjects</p>
                                            </div>
                                            <div className="text-center p-4 rounded-xl bg-emerald-50">
                                                <p className="text-2xl font-bold text-emerald-600">{stats.safeCount}</p>
                                                <p className="text-xs text-emerald-600 mt-1">Healthy</p>
                                            </div>
                                            <div className="text-center p-4 rounded-xl bg-amber-50">
                                                <p className="text-2xl font-bold text-amber-600">{stats.warningCount}</p>
                                                <p className="text-xs text-amber-600 mt-1">Warning</p>
                                            </div>
                                            <div className="text-center p-4 rounded-xl bg-red-50">
                                                <p className="text-2xl font-bold text-red-600">{stats.dangerCount}</p>
                                                <p className="text-xs text-red-600 mt-1">Critical</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Requirement Card */}
                                    <div className="col-span-12 lg:col-span-4 bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-6 text-white">
                                        <div className="flex items-center gap-3 mb-6">
                                            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                            </div>
                                            <h3 className="font-semibold">Requirements</h3>
                                        </div>

                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between p-3 rounded-xl bg-white/5">
                                                <span className="text-slate-300 text-sm">Minimum Required</span>
                                                <span className="text-xl font-bold">{MINIMUM_ATTENDANCE}%</span>
                                            </div>
                                            <div className="flex items-center justify-between p-3 rounded-xl bg-white/5">
                                                <span className="text-slate-300 text-sm">Your Current</span>
                                                <span className={`text-xl font-bold ${
                                                    stats.overallPercentage >= 75 ? 'text-emerald-400' : 'text-amber-400'
                                                }`}>{stats.overallPercentage}%</span>
                                            </div>
                                            <div className={`p-3 rounded-xl ${
                                                stats.overallPercentage >= 75 ? 'bg-emerald-500/20' : 'bg-amber-500/20'
                                            }`}>
                                                <p className={`text-sm ${
                                                    stats.overallPercentage >= 75 ? 'text-emerald-300' : 'text-amber-300'
                                                }`}>
                                                    {stats.overallPercentage >= 75 
                                                        ? '✓ You meet the minimum attendance requirement'
                                                        : '⚠ Below minimum requirement - improve now!'
                                                    }
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Cards View */}
                            {viewMode === 'cards' && (
                                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                                    {sortedSubjects.map(subject => {
                                        const status = getAttendanceStatus(subject.percentage);
                                        const classesNeeded = calculateClassesNeeded(subject.present, subject.total);
                                        const classesCanMiss = calculateClassesCanMiss(subject.present, subject.total);

                                        return (
                                            <div
                                                key={subject.subjectId}
                                                className="group bg-white rounded-2xl border border-slate-200 hover:border-slate-300 hover:shadow-lg hover:shadow-slate-200/50 transition-all duration-300 overflow-hidden"
                                            >
                                                {/* Card Header */}
                                                <div className="p-5 pb-0">
                                                    <div className="flex items-start justify-between gap-4">
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <div className={`w-2 h-2 rounded-full ${status.dotColor}`} />
                                                                <span className={`text-xs font-medium ${status.color} ${status.bgColor} px-2 py-0.5 rounded-full`}>
                                                                    {status.label}
                                                                </span>
                                                            </div>
                                                            <h3 className="font-semibold text-slate-800 text-lg truncate group-hover:text-indigo-600 transition-colors">
                                                                {subject.subjectName}
                                                            </h3>
                                                            <p className="text-sm text-slate-400 font-mono">
                                                                {subject.subjectCode}
                                                            </p>
                                                        </div>
                                                        <div className="text-right">
                                                            <span className={`text-3xl font-bold ${status.color}`}>
                                                                {subject.percentage}
                                                            </span>
                                                            <span className={`text-lg ${status.color}`}>%</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Progress Section */}
                                                <div className="px-5 py-4">
                                                    <MiniProgressBar percentage={subject.percentage} className="mb-4" />
                                                    
                                                    {/* Stats Row */}
                                                    <div className="flex items-center justify-between text-sm">
                                                        <div className="flex items-center gap-4">
                                                            <div className="flex items-center gap-1.5">
                                                                <div className="w-3 h-3 rounded-full bg-emerald-100 flex items-center justify-center">
                                                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                                                </div>
                                                                <span className="text-slate-600">{subject.present}</span>
                                                            </div>
                                                            <div className="flex items-center gap-1.5">
                                                                <div className="w-3 h-3 rounded-full bg-red-100 flex items-center justify-center">
                                                                    <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                                                                </div>
                                                                <span className="text-slate-600">{subject.absent}</span>
                                                            </div>
                                                        </div>
                                                        <span className="text-slate-400">{subject.total} classes</span>
                                                    </div>
                                                </div>

                                                {/* Footer Action */}
                                                <div className={`px-5 py-3 border-t ${status.borderColor} ${status.bgColor}`}>
                                                    {subject.percentage >= MINIMUM_ATTENDANCE ? (
                                                        <div className="flex items-center gap-2">
                                                            <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                            </svg>
                                                            <span className="text-sm text-emerald-700">
                                                                <span className="font-semibold">{classesCanMiss}</span> leaves available
                                                            </span>
                                                        </div>
                                                    ) : (
                                                        <div className="flex items-center gap-2">
                                                            <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                                            </svg>
                                                            <span className="text-sm text-red-700">
                                                                Attend <span className="font-semibold">{classesNeeded}</span> more classes
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
                                <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="border-b border-slate-100">
                                                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                                    Subject
                                                </th>
                                                <th className="px-4 py-4 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                                    Attendance
                                                </th>
                                                <th className="px-4 py-4 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                                    Present
                                                </th>
                                                <th className="px-4 py-4 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                                    Absent
                                                </th>
                                                <th className="px-4 py-4 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                                    Status
                                                </th>
                                                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                                    Recommendation
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {sortedSubjects.map((subject) => {
                                                const status = getAttendanceStatus(subject.percentage);
                                                const classesNeeded = calculateClassesNeeded(subject.present, subject.total);
                                                const classesCanMiss = calculateClassesCanMiss(subject.present, subject.total);

                                                return (
                                                    <tr key={subject.subjectId} className="hover:bg-slate-50 transition-colors">
                                                        <td className="px-6 py-4">
                                                            <div className="flex items-center gap-3">
                                                                <div className={`w-10 h-10 rounded-xl ${status.bgColor} flex items-center justify-center`}>
                                                                    <span className={`text-sm font-bold ${status.color}`}>
                                                                        {subject.subjectName?.charAt(0)}
                                                                    </span>
                                                                </div>
                                                                <div>
                                                                    <p className="font-medium text-slate-800">{subject.subjectName}</p>
                                                                    <p className="text-xs text-slate-400 font-mono">{subject.subjectCode}</p>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-4 py-4">
                                                            <div className="flex flex-col items-center gap-1.5">
                                                                <span className={`text-lg font-bold ${status.color}`}>
                                                                    {subject.percentage}%
                                                                </span>
                                                                <MiniProgressBar percentage={subject.percentage} className="w-16" />
                                                            </div>
                                                        </td>
                                                        <td className="px-4 py-4 text-center">
                                                            <span className="inline-flex items-center justify-center w-10 h-8 rounded-lg bg-emerald-50 text-emerald-700 font-semibold text-sm">
                                                                {subject.present}
                                                            </span>
                                                        </td>
                                                        <td className="px-4 py-4 text-center">
                                                            <span className="inline-flex items-center justify-center w-10 h-8 rounded-lg bg-red-50 text-red-700 font-semibold text-sm">
                                                                {subject.absent}
                                                            </span>
                                                        </td>
                                                        <td className="px-4 py-4 text-center">
                                                            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${status.bgColor} ${status.color}`}>
                                                                <span className={`w-1.5 h-1.5 rounded-full ${status.dotColor}`} />
                                                                {status.label}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            {subject.percentage >= MINIMUM_ATTENDANCE ? (
                                                                <span className="text-sm text-emerald-600 font-medium">
                                                                    {classesCanMiss} leaves available
                                                                </span>
                                                            ) : (
                                                                <span className="text-sm text-red-600 font-medium">
                                                                    Attend {classesNeeded} more
                                                                </span>
                                                            )}
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            )}

                            {/* Info Section */}
                            <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
                                {/* Status Legend */}
                                <div className="bg-white rounded-2xl border border-slate-200 p-6">
                                    <h3 className="text-sm font-semibold text-slate-800 uppercase tracking-wide mb-4">Status Guide</h3>
                                    <div className="space-y-3">
                                        {[
                                            { label: 'Healthy', range: '≥ 75%', color: 'emerald', desc: 'Good standing' },
                                            { label: 'Warning', range: '60-74%', color: 'amber', desc: 'Needs attention' },
                                            { label: 'Critical', range: '< 60%', color: 'red', desc: 'Action required' },
                                        ].map((item) => (
                                            <div key={item.label} className="flex items-center gap-3">
                                                <div className={`w-3 h-3 rounded-full bg-${item.color}-500`} />
                                                <div className="flex-1">
                                                    <span className="text-sm font-medium text-slate-700">{item.label}</span>
                                                    <span className="text-slate-400 mx-2">·</span>
                                                    <span className="text-sm text-slate-500">{item.range}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Quick Tips */}
                                <div className="lg:col-span-2 bg-gradient-to-r from-indigo-500 to-violet-500 rounded-2xl p-6 text-white">
                                    <h3 className="text-sm font-semibold uppercase tracking-wide mb-4 text-indigo-100">Important Guidelines</h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {[
                                            { icon: '📋', text: `Minimum ${MINIMUM_ATTENDANCE}% required for exams` },
                                            { icon: '📝', text: 'Medical leaves require documentation' },
                                            { icon: '👤', text: 'Contact advisor if below 60%' },
                                            { icon: '📊', text: 'Attendance updates daily at midnight' },
                                        ].map((tip, index) => (
                                            <div key={index} className="flex items-center gap-3 p-3 rounded-xl bg-white/10">
                                                <span className="text-xl">{tip.icon}</span>
                                                <span className="text-sm text-white/90">{tip.text}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}