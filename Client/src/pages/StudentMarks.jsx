import { useEffect, useState } from "react";
import Sidebar from "../components/Navbar";
import API from "../services/api";

export default function StudentMarks() {
    const [marks, setMarks] = useState([]);
    const [loading, setLoading] = useState(false);
    const [viewMode, setViewMode] = useState('cards'); // 'cards' or 'table'

    // Max marks configuration
    const maxMarks = {
        mst1Marks: 25,
        mst2Marks: 25,
        mstBest: 25,
        assignmentMarks: 10,
        practicalMarks: 40,
        totalMarks: 75 // Best MST (25) + Assignment (10) + Practical (40)
    };

    useEffect(() => {
        fetchMarks();
    }, []);

    const fetchMarks = async () => {
        setLoading(true);
        try {
            const res = await API.get("/marks/student");
            setMarks(res.data);
        } catch (error) {
            console.error("Error fetching marks:", error);
        }
        setLoading(false);
    };

    const getPercentage = (obtained, max) => {
        return ((obtained / max) * 100).toFixed(1);
    };

    const getProgressColor = (percentage) => {
        if (percentage >= 80) return 'bg-emerald-500';
        if (percentage >= 60) return 'bg-blue-500';
        if (percentage >= 40) return 'bg-amber-500';
        return 'bg-red-500';
    };

    const getGrade = (percentage) => {
        if (percentage >= 90) return { grade: 'A+', color: 'text-emerald-600 bg-emerald-100', description: 'Outstanding' };
        if (percentage >= 80) return { grade: 'A', color: 'text-emerald-600 bg-emerald-100', description: 'Excellent' };
        if (percentage >= 70) return { grade: 'B+', color: 'text-blue-600 bg-blue-100', description: 'Very Good' };
        if (percentage >= 60) return { grade: 'B', color: 'text-blue-600 bg-blue-100', description: 'Good' };
        if (percentage >= 50) return { grade: 'C', color: 'text-amber-600 bg-amber-100', description: 'Average' };
        if (percentage >= 40) return { grade: 'D', color: 'text-orange-600 bg-orange-100', description: 'Pass' };
        return { grade: 'F', color: 'text-red-600 bg-red-100', description: 'Fail' };
    };

    const getOverallStats = () => {
        if (marks.length === 0) return null;

        const totalObtained = marks.reduce((sum, m) => sum + (m.totalMarks || 0), 0);
        const totalMax = marks.length * maxMarks.totalMarks;
        const percentage = getPercentage(totalObtained, totalMax);
        const passCount = marks.filter(m => getPercentage(m.totalMarks, maxMarks.totalMarks) >= 40).length;

        return {
            totalObtained,
            totalMax,
            percentage,
            passCount,
            failCount: marks.length - passCount,
            subjectCount: marks.length,
            grade: getGrade(percentage)
        };
    };

    const stats = getOverallStats();

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
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                </svg>
                            </div>
                            My Marks
                        </h2>
                        <p className="text-gray-600 mt-2">
                            View your academic performance across all subjects
                        </p>
                    </div>

                    {/* View Toggle */}
                    {marks.length > 0 && (
                        <div className="mt-4 sm:mt-0 flex items-center gap-2 bg-white rounded-lg p-1 shadow-sm border border-gray-200">
                            <button
                                onClick={() => setViewMode('cards')}
                                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                                    viewMode === 'cards'
                                        ? 'bg-indigo-600 text-white shadow-sm'
                                        : 'text-gray-600 hover:bg-gray-100'
                                }`}
                            >
                                <span className="flex items-center gap-2">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                                    </svg>
                                    Cards
                                </span>
                            </button>
                            <button
                                onClick={() => setViewMode('table')}
                                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                                    viewMode === 'table'
                                        ? 'bg-indigo-600 text-white shadow-sm'
                                        : 'text-gray-600 hover:bg-gray-100'
                                }`}
                            >
                                <span className="flex items-center gap-2">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                    </svg>
                                    Table
                                </span>
                            </button>
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
                        <p className="text-gray-500">Loading your marks...</p>
                    </div>
                ) : marks.length === 0 ? (
                    /* Empty State */
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                        <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-10 h-10 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">No Marks Available</h3>
                        <p className="text-gray-500 max-w-md mx-auto">
                            Your marks haven't been uploaded yet. Please check back later or contact your faculty.
                        </p>
                    </div>
                ) : (
                    <>
                        {/* Overall Statistics Card */}
                        {stats && (
                            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl shadow-lg p-6 mb-8 text-white">
                                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                                    <div>
                                        <h3 className="text-lg font-medium text-indigo-200">Overall Performance</h3>
                                        <div className="flex items-baseline gap-2 mt-2">
                                            <span className="text-5xl font-bold">{stats.percentage}%</span>
                                            <span className={`px-3 py-1 rounded-full text-sm font-bold ${stats.grade.color}`}>
                                                {stats.grade.grade}
                                            </span>
                                        </div>
                                        <p className="text-indigo-200 mt-1">{stats.grade.description}</p>
                                    </div>

                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                        <div className="bg-white/10 rounded-lg px-4 py-3 text-center backdrop-blur-sm">
                                            <p className="text-3xl font-bold">{stats.subjectCount}</p>
                                            <p className="text-xs text-indigo-200 mt-1">Subjects</p>
                                        </div>
                                        <div className="bg-white/10 rounded-lg px-4 py-3 text-center backdrop-blur-sm">
                                            <p className="text-3xl font-bold">{stats.totalObtained}</p>
                                            <p className="text-xs text-indigo-200 mt-1">Total Marks</p>
                                        </div>
                                        <div className="bg-white/10 rounded-lg px-4 py-3 text-center backdrop-blur-sm">
                                            <p className="text-3xl font-bold text-emerald-300">{stats.passCount}</p>
                                            <p className="text-xs text-indigo-200 mt-1">Passed</p>
                                        </div>
                                        <div className="bg-white/10 rounded-lg px-4 py-3 text-center backdrop-blur-sm">
                                            <p className="text-3xl font-bold text-red-300">{stats.failCount}</p>
                                            <p className="text-xs text-indigo-200 mt-1">Failed</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Overall Progress Bar */}
                                <div className="mt-6">
                                    <div className="flex justify-between text-sm text-indigo-200 mb-2">
                                        <span>Progress</span>
                                        <span>{stats.totalObtained} / {stats.totalMax}</span>
                                    </div>
                                    <div className="h-3 bg-white/20 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-white rounded-full transition-all duration-500"
                                            style={{ width: `${stats.percentage}%` }}
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Cards View */}
                        {viewMode === 'cards' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {marks.map(mark => {
                                    const totalPercentage = getPercentage(mark.totalMarks, maxMarks.totalMarks);
                                    const gradeInfo = getGrade(totalPercentage);

                                    return (
                                        <div
                                            key={mark._id}
                                            className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
                                        >
                                            {/* Card Header */}
                                            <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-5 py-4 border-b border-gray-200">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-3">
                                                        <div className="p-2 bg-indigo-100 rounded-lg">
                                                            <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                                            </svg>
                                                        </div>
                                                        <div>
                                                            <h3 className="font-semibold text-gray-800">
                                                                {mark.subject?.name || 'Subject'}
                                                            </h3>
                                                            <p className="text-xs text-gray-500">
                                                                {mark.subject?.code}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <span className={`px-2.5 py-1 rounded-full text-sm font-bold ${gradeInfo.color}`}>
                                                        {gradeInfo.grade}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Card Body */}
                                            <div className="p-5 space-y-4">
                                                {/* MST Marks */}
                                                <div className="grid grid-cols-2 gap-3">
                                                    {/* MST 1 */}
                                                    <div className="bg-blue-50 rounded-lg p-3">
                                                        <div className="flex items-center justify-between mb-1">
                                                            <span className="text-xs font-medium text-blue-600">MST 1</span>
                                                            <span className="text-xs text-blue-500">/{maxMarks.mst1Marks}</span>
                                                        </div>
                                                        <p className="text-xl font-bold text-blue-700">{mark.mst1Marks || 0}</p>
                                                        <div className="h-1.5 bg-blue-200 rounded-full mt-2 overflow-hidden">
                                                            <div
                                                                className="h-full bg-blue-500 rounded-full"
                                                                style={{ width: `${getPercentage(mark.mst1Marks || 0, maxMarks.mst1Marks)}%` }}
                                                            />
                                                        </div>
                                                    </div>

                                                    {/* MST 2 */}
                                                    <div className="bg-purple-50 rounded-lg p-3">
                                                        <div className="flex items-center justify-between mb-1">
                                                            <span className="text-xs font-medium text-purple-600">MST 2</span>
                                                            <span className="text-xs text-purple-500">/{maxMarks.mst2Marks}</span>
                                                        </div>
                                                        <p className="text-xl font-bold text-purple-700">{mark.mst2Marks || 0}</p>
                                                        <div className="h-1.5 bg-purple-200 rounded-full mt-2 overflow-hidden">
                                                            <div
                                                                className="h-full bg-purple-500 rounded-full"
                                                                style={{ width: `${getPercentage(mark.mst2Marks || 0, maxMarks.mst2Marks)}%` }}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Best MST Highlight */}
                                                <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-lg p-3 border border-emerald-200">
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-2">
                                                            <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                                                            </svg>
                                                            <span className="text-sm font-medium text-emerald-700">Best MST</span>
                                                        </div>
                                                        <span className="text-2xl font-bold text-emerald-700">
                                                            {mark.mstBest || Math.max(mark.mst1Marks || 0, mark.mst2Marks || 0)}
                                                            <span className="text-sm font-normal text-emerald-500">/{maxMarks.mstBest}</span>
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Assignment & Practical */}
                                                <div className="grid grid-cols-2 gap-3">
                                                    {/* Assignment */}
                                                    <div className="bg-amber-50 rounded-lg p-3">
                                                        <div className="flex items-center justify-between mb-1">
                                                            <span className="text-xs font-medium text-amber-600">Assignment</span>
                                                            <span className="text-xs text-amber-500">/{maxMarks.assignmentMarks}</span>
                                                        </div>
                                                        <p className="text-xl font-bold text-amber-700">{mark.assignmentMarks || 0}</p>
                                                        <div className="h-1.5 bg-amber-200 rounded-full mt-2 overflow-hidden">
                                                            <div
                                                                className="h-full bg-amber-500 rounded-full"
                                                                style={{ width: `${getPercentage(mark.assignmentMarks || 0, maxMarks.assignmentMarks)}%` }}
                                                            />
                                                        </div>
                                                    </div>

                                                    {/* Practical */}
                                                    <div className="bg-rose-50 rounded-lg p-3">
                                                        <div className="flex items-center justify-between mb-1">
                                                            <span className="text-xs font-medium text-rose-600">Practical</span>
                                                            <span className="text-xs text-rose-500">/{maxMarks.practicalMarks}</span>
                                                        </div>
                                                        <p className="text-xl font-bold text-rose-700">{mark.practicalMarks || 0}</p>
                                                        <div className="h-1.5 bg-rose-200 rounded-full mt-2 overflow-hidden">
                                                            <div
                                                                className="h-full bg-rose-500 rounded-full"
                                                                style={{ width: `${getPercentage(mark.practicalMarks || 0, maxMarks.practicalMarks)}%` }}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Card Footer - Total */}
                                            <div className="bg-gray-50 px-5 py-4 border-t border-gray-200">
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="text-sm font-medium text-gray-600">Total Marks</span>
                                                    <span className="text-sm text-gray-500">{totalPercentage}%</span>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <div className="flex-1 h-2.5 bg-gray-200 rounded-full overflow-hidden">
                                                        <div
                                                            className={`h-full rounded-full transition-all duration-500 ${getProgressColor(totalPercentage)}`}
                                                            style={{ width: `${totalPercentage}%` }}
                                                        />
                                                    </div>
                                                    <span className="text-lg font-bold text-gray-800">
                                                        {mark.totalMarks || 0}
                                                        <span className="text-sm font-normal text-gray-500">/{maxMarks.totalMarks}</span>
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {/* Table View */}
                        {viewMode === 'table' && (
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="bg-gray-50 border-b border-gray-200">
                                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                                    Subject
                                                </th>
                                                <th className="px-4 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                                    <span className="flex items-center justify-center gap-1">
                                                        <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                                                        MST 1
                                                    </span>
                                                </th>
                                                <th className="px-4 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                                    <span className="flex items-center justify-center gap-1">
                                                        <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                                                        MST 2
                                                    </span>
                                                </th>
                                                <th className="px-4 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                                    <span className="flex items-center justify-center gap-1">
                                                        <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                                                        Best
                                                    </span>
                                                </th>
                                                <th className="px-4 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                                    <span className="flex items-center justify-center gap-1">
                                                        <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                                                        Assignment
                                                    </span>
                                                </th>
                                                <th className="px-4 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                                    <span className="flex items-center justify-center gap-1">
                                                        <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                                                        Practical
                                                    </span>
                                                </th>
                                                <th className="px-4 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                                    Total
                                                </th>
                                                <th className="px-4 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                                    Grade
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200">
                                            {marks.map((mark, index) => {
                                                const totalPercentage = getPercentage(mark.totalMarks, maxMarks.totalMarks);
                                                const gradeInfo = getGrade(totalPercentage);

                                                return (
                                                    <tr
                                                        key={mark._id}
                                                        className={`hover:bg-gray-50 transition-colors ${
                                                            index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'
                                                        }`}
                                                    >
                                                        {/* Subject */}
                                                        <td className="px-6 py-4">
                                                            <div className="flex items-center gap-3">
                                                                <div className="p-2 bg-indigo-100 rounded-lg">
                                                                    <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                                                    </svg>
                                                                </div>
                                                                <div>
                                                                    <p className="font-medium text-gray-900">
                                                                        {mark.subject?.name}
                                                                    </p>
                                                                    <p className="text-xs text-gray-500">
                                                                        {mark.subject?.code}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </td>

                                                        {/* MST 1 */}
                                                        <td className="px-4 py-4 text-center">
                                                            <span className="inline-flex items-center justify-center px-3 py-1 rounded-lg bg-blue-50 text-blue-700 font-semibold">
                                                                {mark.mst1Marks || 0}
                                                                <span className="text-blue-400 text-xs ml-1">/{maxMarks.mst1Marks}</span>
                                                            </span>
                                                        </td>

                                                        {/* MST 2 */}
                                                        <td className="px-4 py-4 text-center">
                                                            <span className="inline-flex items-center justify-center px-3 py-1 rounded-lg bg-purple-50 text-purple-700 font-semibold">
                                                                {mark.mst2Marks || 0}
                                                                <span className="text-purple-400 text-xs ml-1">/{maxMarks.mst2Marks}</span>
                                                            </span>
                                                        </td>

                                                        {/* Best MST */}
                                                        <td className="px-4 py-4 text-center">
                                                            <span className="inline-flex items-center justify-center px-3 py-1 rounded-lg bg-emerald-50 text-emerald-700 font-semibold">
                                                                ⭐ {mark.mstBest || Math.max(mark.mst1Marks || 0, mark.mst2Marks || 0)}
                                                                <span className="text-emerald-400 text-xs ml-1">/{maxMarks.mstBest}</span>
                                                            </span>
                                                        </td>

                                                        {/* Assignment */}
                                                        <td className="px-4 py-4 text-center">
                                                            <span className="inline-flex items-center justify-center px-3 py-1 rounded-lg bg-amber-50 text-amber-700 font-semibold">
                                                                {mark.assignmentMarks || 0}
                                                                <span className="text-amber-400 text-xs ml-1">/{maxMarks.assignmentMarks}</span>
                                                            </span>
                                                        </td>

                                                        {/* Practical */}
                                                        <td className="px-4 py-4 text-center">
                                                            <span className="inline-flex items-center justify-center px-3 py-1 rounded-lg bg-rose-50 text-rose-700 font-semibold">
                                                                {mark.practicalMarks || 0}
                                                                <span className="text-rose-400 text-xs ml-1">/{maxMarks.practicalMarks}</span>
                                                            </span>
                                                        </td>

                                                        {/* Total */}
                                                        <td className="px-4 py-4 text-center">
                                                            <div className="flex flex-col items-center">
                                                                <span className="text-lg font-bold text-gray-800">
                                                                    {mark.totalMarks || 0}
                                                                </span>
                                                                <span className="text-xs text-gray-500">
                                                                    {totalPercentage}%
                                                                </span>
                                                            </div>
                                                        </td>

                                                        {/* Grade */}
                                                        <td className="px-4 py-4 text-center">
                                                            <span className={`px-3 py-1 rounded-full text-sm font-bold ${gradeInfo.color}`}>
                                                                {gradeInfo.grade}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>

                                        {/* Table Footer - Totals */}
                                        <tfoot>
                                            <tr className="bg-indigo-50 border-t-2 border-indigo-200">
                                                <td className="px-6 py-4 font-bold text-indigo-800">
                                                    Overall Total
                                                </td>
                                                <td className="px-4 py-4 text-center font-semibold text-gray-700">
                                                    {marks.reduce((sum, m) => sum + (m.mst1Marks || 0), 0)}
                                                </td>
                                                <td className="px-4 py-4 text-center font-semibold text-gray-700">
                                                    {marks.reduce((sum, m) => sum + (m.mst2Marks || 0), 0)}
                                                </td>
                                                <td className="px-4 py-4 text-center font-semibold text-gray-700">
                                                    {marks.reduce((sum, m) => sum + (m.mstBest || Math.max(m.mst1Marks || 0, m.mst2Marks || 0)), 0)}
                                                </td>
                                                <td className="px-4 py-4 text-center font-semibold text-gray-700">
                                                    {marks.reduce((sum, m) => sum + (m.assignmentMarks || 0), 0)}
                                                </td>
                                                <td className="px-4 py-4 text-center font-semibold text-gray-700">
                                                    {marks.reduce((sum, m) => sum + (m.practicalMarks || 0), 0)}
                                                </td>
                                                <td className="px-4 py-4 text-center">
                                                    <span className="text-xl font-bold text-indigo-700">
                                                        {stats?.totalObtained}
                                                        <span className="text-sm font-normal text-indigo-500">/{stats?.totalMax}</span>
                                                    </span>
                                                </td>
                                                <td className="px-4 py-4 text-center">
                                                    <span className={`px-3 py-1 rounded-full text-sm font-bold ${stats?.grade.color}`}>
                                                        {stats?.grade.grade}
                                                    </span>
                                                </td>
                                            </tr>
                                        </tfoot>
                                    </table>
                                </div>
                            </div>
                        )}

                        {/* Marks Breakdown Legend */}
                        <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Marks Distribution & Grading
                            </h3>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Marks Breakdown */}
                                <div>
                                    <h4 className="text-sm font-medium text-gray-600 mb-3">Marks Breakdown</h4>
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="flex items-center gap-2">
                                                <span className="w-3 h-3 rounded-full bg-blue-500"></span>
                                                MST 1
                                            </span>
                                            <span className="font-medium">{maxMarks.mst1Marks} marks</span>
                                        </div>
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="flex items-center gap-2">
                                                <span className="w-3 h-3 rounded-full bg-purple-500"></span>
                                                MST 2
                                            </span>
                                            <span className="font-medium">{maxMarks.mst2Marks} marks</span>
                                        </div>
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="flex items-center gap-2">
                                                <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
                                                Best MST (considered)
                                            </span>
                                            <span className="font-medium">{maxMarks.mstBest} marks</span>
                                        </div>
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="flex items-center gap-2">
                                                <span className="w-3 h-3 rounded-full bg-amber-500"></span>
                                                Assignment
                                            </span>
                                            <span className="font-medium">{maxMarks.assignmentMarks} marks</span>
                                        </div>
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="flex items-center gap-2">
                                                <span className="w-3 h-3 rounded-full bg-rose-500"></span>
                                                Practical
                                            </span>
                                            <span className="font-medium">{maxMarks.practicalMarks} marks</span>
                                        </div>
                                        <hr className="my-2" />
                                        <div className="flex items-center justify-between text-sm font-bold">
                                            <span>Total (per subject)</span>
                                            <span>{maxMarks.totalMarks} marks</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Grading Scale */}
                                <div>
                                    <h4 className="text-sm font-medium text-gray-600 mb-3">Grading Scale</h4>
                                    <div className="grid grid-cols-2 gap-2">
                                        <div className="flex items-center gap-2 text-sm">
                                            <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-700 font-bold">A+</span>
                                            <span className="text-gray-600">90% & above</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm">
                                            <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-700 font-bold">A</span>
                                            <span className="text-gray-600">80% - 89%</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm">
                                            <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-700 font-bold">B+</span>
                                            <span className="text-gray-600">70% - 79%</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm">
                                            <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-700 font-bold">B</span>
                                            <span className="text-gray-600">60% - 69%</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm">
                                            <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-700 font-bold">C</span>
                                            <span className="text-gray-600">50% - 59%</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm">
                                            <span className="px-2 py-0.5 rounded bg-orange-100 text-orange-700 font-bold">D</span>
                                            <span className="text-gray-600">40% - 49%</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm">
                                            <span className="px-2 py-0.5 rounded bg-red-100 text-red-700 font-bold">F</span>
                                            <span className="text-gray-600">Below 40%</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}