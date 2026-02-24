import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import API from "../services/api";

export default function FacultyMarks() {
    const [subjects, setSubjects] = useState([]);
    const [students, setStudents] = useState([]);
    const [selectedSubject, setSelectedSubject] = useState("");
    const [marks, setMarks] = useState({});
    const [existingMarksMap, setExistingMarksMap] = useState({}); // Track which students have existing marks
    const [loading, setLoading] = useState(false);
    const [loadingStudents, setLoadingStudents] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [lastUpdated, setLastUpdated] = useState(null);
    const [notification, setNotification] = useState({ show: false, message: '', type: '' });

    // Max marks configuration
    const maxMarks = {
        mst1Marks: 25,
        mst2Marks: 25,
        assignmentMarks: 10,
        practicalMarks: 40
    };

    useEffect(() => {
        fetchSubjects();
    }, []);

    // Auto-hide notification
    useEffect(() => {
        if (notification.show) {
            const timer = setTimeout(() => {
                setNotification({ show: false, message: '', type: '' });
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [notification.show]);

    const showNotification = (message, type = 'success') => {
        setNotification({ show: true, message, type });
    };

    const fetchSubjects = async () => {
        setLoading(true);
        try {
            const res = await API.get("/subjects/faculty");
            setSubjects(res.data);
        } catch (error) {
            console.error("Error fetching subjects:", error);
            showNotification("Error fetching subjects", "error");
        }
        setLoading(false);
    };

    const selectSubject = async (subjectId) => {
        if (!subjectId) {
            setSelectedSubject("");
            setStudents([]);
            setMarks({});
            setExistingMarksMap({});
            setLastUpdated(null);
            return;
        }

        setSelectedSubject(subjectId);
        setLoadingStudents(true);

        try {
            const subject = subjects.find(s => s._id === subjectId);
            
            // Fetch students
            const studentsRes = await API.get(
                `/users/students?department=${subject.department}&semester=${subject.semester}`
            );
            setStudents(studentsRes.data);

            // Fetch existing marks for this subject
            let existingMarks = [];
            try {
                const marksRes = await API.get(`/marks/subject/${subjectId}`);
                existingMarks = marksRes.data;
                
                // Find the most recent update time
                if (existingMarks.length > 0) {
                    const latestMark = existingMarks.reduce((latest, mark) => {
                        const markDate = new Date(mark.updatedAt || mark.createdAt);
                        return markDate > latest ? markDate : latest;
                    }, new Date(0));
                    
                    if (latestMark.getTime() > 0) {
                        setLastUpdated(latestMark);
                    }
                }
            } catch (error) {
                console.log("No existing marks found or error fetching marks");
                existingMarks = [];
            }

            // Convert existing marks into lookup map
            const marksMap = {};
            const existingMap = {};

            existingMarks.forEach(mark => {
                // Handle both populated student object and student ID string
                const studentId = mark.student?._id || mark.student;
                
                if (studentId) {
                    marksMap[studentId] = {
                        mst1Marks: mark.mst1Marks || 0,
                        mst2Marks: mark.mst2Marks || 0,
                        assignmentMarks: mark.assignmentMarks || 0,
                        practicalMarks: mark.practicalMarks || 0
                    };
                    existingMap[studentId] = true; // Mark as having existing data
                }
            });

            setExistingMarksMap(existingMap);

            // Initialize marks for all students
            const initial = {};
            studentsRes.data.forEach(student => {
                initial[student._id] = marksMap[student._id] || {
                    mst1Marks: 0,
                    mst2Marks: 0,
                    assignmentMarks: 0,
                    practicalMarks: 0
                };
            });
            
            setMarks(initial);

            // Show notification if existing marks were loaded
            const existingCount = Object.keys(existingMap).length;
            if (existingCount > 0) {
                showNotification(`Loaded existing marks for ${existingCount} student(s)`, 'info');
            }

        } catch (error) {
            console.error("Error fetching students:", error);
            showNotification("Error fetching students", "error");
        }
        setLoadingStudents(false);
    };

    const updateMarks = (studentId, field, value) => {
        const numValue = Math.min(Math.max(0, Number(value)), maxMarks[field]);
        setMarks({
            ...marks,
            [studentId]: {
                ...marks[studentId],
                [field]: numValue
            }
        });
    };

    const getTotalMarks = (studentId) => {
        const studentMarks = marks[studentId];
        if (!studentMarks) return 0;
        return (
            (studentMarks.mst1Marks || 0) +
            (studentMarks.mst2Marks || 0) +
            (studentMarks.assignmentMarks || 0) +
            (studentMarks.practicalMarks || 0)
        );
    };

    const getMaxTotal = () => {
        return Object.values(maxMarks).reduce((a, b) => a + b, 0);
    };

    const getPercentage = (studentId) => {
        return ((getTotalMarks(studentId) / getMaxTotal()) * 100).toFixed(1);
    };

    const getGrade = (percentage) => {
        if (percentage >= 90) return { grade: 'A+', color: 'text-emerald-600 bg-emerald-100' };
        if (percentage >= 80) return { grade: 'A', color: 'text-emerald-600 bg-emerald-100' };
        if (percentage >= 70) return { grade: 'B+', color: 'text-blue-600 bg-blue-100' };
        if (percentage >= 60) return { grade: 'B', color: 'text-blue-600 bg-blue-100' };
        if (percentage >= 50) return { grade: 'C', color: 'text-amber-600 bg-amber-100' };
        if (percentage >= 40) return { grade: 'D', color: 'text-orange-600 bg-orange-100' };
        return { grade: 'F', color: 'text-red-600 bg-red-100' };
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const submitMarks = async () => {
        setSubmitting(true);
        try {
            const marksArray = students.map(student => ({
                studentId: student._id,
                mst1Marks: marks[student._id]?.mst1Marks || 0,
                mst2Marks: marks[student._id]?.mst2Marks || 0,
                assignmentMarks: marks[student._id]?.assignmentMarks || 0,
                practicalMarks: marks[student._id]?.practicalMarks || 0
            }));

            await API.post("/marks", {
                subjectId: selectedSubject,
                marks: marksArray
            });

            // Update last updated time
            setLastUpdated(new Date());
            
            // Mark all students as having existing marks now
            const newExistingMap = {};
            students.forEach(student => {
                newExistingMap[student._id] = true;
            });
            setExistingMarksMap(newExistingMap);

            showNotification("Marks saved successfully!", "success");
        } catch (error) {
            console.error("Error saving marks:", error);
            showNotification("Error saving marks", "error");
        }
        setSubmitting(false);
    };

    const resetMarks = () => {
        if (window.confirm("Are you sure you want to reset all marks to 0?")) {
            const reset = {};
            students.forEach(student => {
                reset[student._id] = {
                    mst1Marks: 0,
                    mst2Marks: 0,
                    assignmentMarks: 0,
                    practicalMarks: 0
                };
            });
            setMarks(reset);
            showNotification("All marks reset to 0", "info");
        }
    };

    const selectedSubjectData = subjects.find(s => s._id === selectedSubject);
    const existingMarksCount = Object.keys(existingMarksMap).length;

    return (
        <div className="min-h-screen bg-gray-100">
            <Navbar />

            {/* Notification Toast */}
            {notification.show && (
                <div className="fixed top-4 right-4 z-50 animate-slideIn">
                    <div className={`flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg ${
                        notification.type === 'success' 
                            ? 'bg-emerald-500 text-white' 
                            : notification.type === 'error'
                            ? 'bg-red-500 text-white'
                            : 'bg-blue-500 text-white'
                    }`}>
                        {notification.type === 'success' && (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        )}
                        {notification.type === 'error' && (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        )}
                        {notification.type === 'info' && (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        )}
                        <span className="font-medium">{notification.message}</span>
                        <button 
                            onClick={() => setNotification({ show: false, message: '', type: '' })}
                            className="ml-2 hover:opacity-75"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>
            )}

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h2 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
                        <div className="p-2 bg-indigo-100 rounded-lg">
                            <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                            </svg>
                        </div>
                        Enter Marks
                    </h2>
                    <p className="text-gray-600 mt-2">
                        Select a subject and enter marks for students
                    </p>
                </div>

                {/* Subject Selection Card */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Select Subject
                    </label>
                    
                    {loading ? (
                        <div className="flex items-center gap-2 text-gray-500">
                            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                            Loading subjects...
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {subjects.map(subject => (
                                <button
                                    key={subject._id}
                                    onClick={() => selectSubject(subject._id)}
                                    className={`p-4 rounded-lg border-2 text-left transition-all ${
                                        selectedSubject === subject._id
                                            ? 'border-indigo-500 bg-indigo-50 ring-2 ring-indigo-200'
                                            : 'border-gray-200 hover:border-indigo-300 hover:bg-gray-50'
                                    }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-lg ${
                                            selectedSubject === subject._id
                                                ? 'bg-indigo-500 text-white'
                                                : 'bg-gray-100 text-gray-600'
                                        }`}>
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                            </svg>
                                        </div>
                                        <div>
                                            <p className={`font-semibold ${
                                                selectedSubject === subject._id
                                                    ? 'text-indigo-700'
                                                    : 'text-gray-800'
                                            }`}>
                                                {subject.name}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                {subject.code} • Sem {subject.semester}
                                            </p>
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}

                    {subjects.length === 0 && !loading && (
                        <div className="text-center py-8 text-gray-500">
                            <svg className="mx-auto h-12 w-12 text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                            </svg>
                            <p>No subjects assigned to you</p>
                        </div>
                    )}
                </div>

                {/* Selected Subject Info */}
                {selectedSubjectData && (
                    <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl shadow-lg p-6 mb-6 text-white">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                            <div>
                                <h3 className="text-xl font-bold">{selectedSubjectData.name}</h3>
                                <p className="text-indigo-200 mt-1">
                                    {selectedSubjectData.code} • {selectedSubjectData.department} • Semester {selectedSubjectData.semester}
                                </p>
                                {/* Last Updated Info */}
                                {lastUpdated && (
                                    <div className="flex items-center gap-2 mt-2 text-indigo-200">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <span className="text-sm">Last updated: {formatDate(lastUpdated)}</span>
                                    </div>
                                )}
                            </div>
                            <div className="flex gap-4">
                                <div className="bg-white/20 rounded-lg px-4 py-2 text-center">
                                    <p className="text-2xl font-bold">{students.length}</p>
                                    <p className="text-xs text-indigo-200">Students</p>
                                </div>
                                <div className="bg-white/20 rounded-lg px-4 py-2 text-center">
                                    <p className="text-2xl font-bold">{existingMarksCount}</p>
                                    <p className="text-xs text-indigo-200">With Marks</p>
                                </div>
                                <div className="bg-white/20 rounded-lg px-4 py-2 text-center">
                                    <p className="text-2xl font-bold">{getMaxTotal()}</p>
                                    <p className="text-xs text-indigo-200">Max Marks</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Marks Entry Section */}
                {loadingStudents ? (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12">
                        <div className="flex flex-col items-center justify-center">
                            <svg className="animate-spin h-12 w-12 text-indigo-600 mb-4" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                            <p className="text-gray-500">Loading students and existing marks...</p>
                        </div>
                    </div>
                ) : selectedSubject && students.length > 0 ? (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        {/* Marks Legend & Actions */}
                        <div className="bg-gray-50 border-b border-gray-200 p-4">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                <div className="flex flex-wrap gap-4 text-sm">
                                    <span className="flex items-center gap-2">
                                        <span className="w-3 h-3 rounded-full bg-blue-500"></span>
                                        MST 1 (Max: {maxMarks.mst1Marks})
                                    </span>
                                    <span className="flex items-center gap-2">
                                        <span className="w-3 h-3 rounded-full bg-purple-500"></span>
                                        MST 2 (Max: {maxMarks.mst2Marks})
                                    </span>
                                    <span className="flex items-center gap-2">
                                        <span className="w-3 h-3 rounded-full bg-amber-500"></span>
                                        Assignment (Max: {maxMarks.assignmentMarks})
                                    </span>
                                    <span className="flex items-center gap-2">
                                        <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
                                        Practical (Max: {maxMarks.practicalMarks})
                                    </span>
                                </div>
                                <button
                                    onClick={resetMarks}
                                    className="text-sm text-gray-500 hover:text-red-600 flex items-center gap-1 transition-colors"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                    </svg>
                                    Reset All
                                </button>
                            </div>
                            
                            {/* Existing Marks Indicator */}
                            {existingMarksCount > 0 && (
                                <div className="mt-3 flex items-center gap-2 text-sm">
                                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full">
                                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                        </svg>
                                        Previously Saved
                                    </span>
                                    <span className="text-gray-500">
                                        {existingMarksCount} of {students.length} students have existing marks
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Table */}
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="bg-gray-50 border-b border-gray-200">
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                            Student
                                        </th>
                                        <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                            <span className="inline-flex items-center gap-1">
                                                <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                                                MST 1
                                            </span>
                                        </th>
                                        <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                            <span className="inline-flex items-center gap-1">
                                                <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                                                MST 2
                                            </span>
                                        </th>
                                        <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                            <span className="inline-flex items-center gap-1">
                                                <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                                                Assignment
                                            </span>
                                        </th>
                                        <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                            <span className="inline-flex items-center gap-1">
                                                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                                                Practical
                                            </span>
                                        </th>
                                        <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                            Total
                                        </th>
                                        <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                            Grade
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {students.map((student, index) => {
                                        const percentage = getPercentage(student._id);
                                        const gradeInfo = getGrade(percentage);
                                        const hasExistingMarks = existingMarksMap[student._id];
                                        
                                        return (
                                            <tr 
                                                key={student._id} 
                                                className={`hover:bg-gray-50 transition-colors ${
                                                    index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'
                                                }`}
                                            >
                                                {/* Student Info */}
                                                <td className="px-4 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="relative">
                                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-semibold">
                                                                {student.name?.charAt(0).toUpperCase()}
                                                            </div>
                                                            {/* Existing marks indicator badge */}
                                                            {hasExistingMarks && (
                                                                <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                                                                    <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                                    </svg>
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div>
                                                            <p className="font-medium text-gray-900">
                                                                {student.name}
                                                            </p>
                                                            <div className="flex items-center gap-2">
                                                                <p className="text-sm text-gray-500">
                                                                    {student.rollNo}
                                                                </p>
                                                                {hasExistingMarks && (
                                                                    <span className="text-xs text-green-600 bg-green-50 px-1.5 py-0.5 rounded">
                                                                        Saved
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* MST 1 */}
                                                <td className="px-4 py-4">
                                                    <div className="flex justify-center">
                                                        <div className="relative">
                                                            <input
                                                                type="number"
                                                                min="0"
                                                                max={maxMarks.mst1Marks}
                                                                value={marks[student._id]?.mst1Marks || 0}
                                                                onChange={(e) => updateMarks(student._id, "mst1Marks", e.target.value)}
                                                                className={`w-20 px-3 py-2 border rounded-lg text-center focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                                                                    hasExistingMarks && marks[student._id]?.mst1Marks > 0
                                                                        ? 'border-green-300 bg-green-50'
                                                                        : 'border-gray-300'
                                                                }`}
                                                            />
                                                            <span className="absolute -bottom-5 left-0 right-0 text-center text-xs text-gray-400">
                                                                /{maxMarks.mst1Marks}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* MST 2 */}
                                                <td className="px-4 py-4">
                                                    <div className="flex justify-center">
                                                        <div className="relative">
                                                            <input
                                                                type="number"
                                                                min="0"
                                                                max={maxMarks.mst2Marks}
                                                                value={marks[student._id]?.mst2Marks || 0}
                                                                onChange={(e) => updateMarks(student._id, "mst2Marks", e.target.value)}
                                                                className={`w-20 px-3 py-2 border rounded-lg text-center focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors ${
                                                                    hasExistingMarks && marks[student._id]?.mst2Marks > 0
                                                                        ? 'border-green-300 bg-green-50'
                                                                        : 'border-gray-300'
                                                                }`}
                                                            />
                                                            <span className="absolute -bottom-5 left-0 right-0 text-center text-xs text-gray-400">
                                                                /{maxMarks.mst2Marks}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* Assignment */}
                                                <td className="px-4 py-4">
                                                    <div className="flex justify-center">
                                                        <div className="relative">
                                                            <input
                                                                type="number"
                                                                min="0"
                                                                max={maxMarks.assignmentMarks}
                                                                value={marks[student._id]?.assignmentMarks || 0}
                                                                onChange={(e) => updateMarks(student._id, "assignmentMarks", e.target.value)}
                                                                className={`w-20 px-3 py-2 border rounded-lg text-center focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors ${
                                                                    hasExistingMarks && marks[student._id]?.assignmentMarks > 0
                                                                        ? 'border-green-300 bg-green-50'
                                                                        : 'border-gray-300'
                                                                }`}
                                                            />
                                                            <span className="absolute -bottom-5 left-0 right-0 text-center text-xs text-gray-400">
                                                                /{maxMarks.assignmentMarks}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* Practical */}
                                                <td className="px-4 py-4">
                                                    <div className="flex justify-center">
                                                        <div className="relative">
                                                            <input
                                                                type="number"
                                                                min="0"
                                                                max={maxMarks.practicalMarks}
                                                                value={marks[student._id]?.practicalMarks || 0}
                                                                onChange={(e) => updateMarks(student._id, "practicalMarks", e.target.value)}
                                                                className={`w-20 px-3 py-2 border rounded-lg text-center focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors ${
                                                                    hasExistingMarks && marks[student._id]?.practicalMarks > 0
                                                                        ? 'border-green-300 bg-green-50'
                                                                        : 'border-gray-300'
                                                                }`}
                                                            />
                                                            <span className="absolute -bottom-5 left-0 right-0 text-center text-xs text-gray-400">
                                                                /{maxMarks.practicalMarks}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* Total */}
                                                <td className="px-4 py-4">
                                                    <div className="flex flex-col items-center">
                                                        <span className="text-lg font-bold text-gray-800">
                                                            {getTotalMarks(student._id)}
                                                        </span>
                                                        <span className="text-xs text-gray-500">
                                                            {percentage}%
                                                        </span>
                                                    </div>
                                                </td>

                                                {/* Grade */}
                                                <td className="px-4 py-4">
                                                    <div className="flex justify-center">
                                                        <span className={`px-3 py-1 rounded-full text-sm font-bold ${gradeInfo.color}`}>
                                                            {gradeInfo.grade}
                                                        </span>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                        {/* Submit Section */}
                        <div className="bg-gray-50 border-t border-gray-200 p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                            <div className="text-sm text-gray-600">
                                <span className="font-medium">{students.length}</span> students • 
                                <span className="font-medium"> {existingMarksCount}</span> with existing marks • 
                                <span className="font-medium"> {getMaxTotal()}</span> max marks
                            </div>
                            <div className="flex items-center gap-3">
                                {lastUpdated && (
                                    <span className="text-sm text-gray-500">
                                        Last saved: {formatDate(lastUpdated)}
                                    </span>
                                )}
                                <button
                                    onClick={submitMarks}
                                    disabled={submitting}
                                    className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-200"
                                >
                                    {submitting ? (
                                        <>
                                            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                            </svg>
                                            Saving Marks...
                                        </>
                                    ) : (
                                        <>
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                            {existingMarksCount > 0 ? 'Update All Marks' : 'Submit All Marks'}
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                ) : selectedSubject && students.length === 0 ? (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-1">No students found</h3>
                        <p className="text-gray-500">
                            There are no students enrolled in this subject
                        </p>
                    </div>
                ) : (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                        <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-1">Select a Subject</h3>
                        <p className="text-gray-500">
                            Choose a subject above to start entering marks
                        </p>
                    </div>
                )}

                {/* Quick Stats */}
                {selectedSubject && students.length > 0 && (
                    <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-emerald-100 rounded-lg">
                                    <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-gray-800">
                                        {students.filter(s => getPercentage(s._id) >= 40).length}
                                    </p>
                                    <p className="text-xs text-gray-500">Passing</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-red-100 rounded-lg">
                                    <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-gray-800">
                                        {students.filter(s => getPercentage(s._id) < 40).length}
                                    </p>
                                    <p className="text-xs text-gray-500">Failing</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-100 rounded-lg">
                                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-gray-800">
                                        {students.length > 0 
                                            ? (students.reduce((acc, s) => acc + parseFloat(getPercentage(s._id)), 0) / students.length).toFixed(1)
                                            : 0}%
                                    </p>
                                    <p className="text-xs text-gray-500">Class Average</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-purple-100 rounded-lg">
                                    <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-gray-800">
                                        {students.length > 0 
                                            ? Math.max(...students.map(s => parseFloat(getPercentage(s._id)))).toFixed(1)
                                            : 0}%
                                    </p>
                                    <p className="text-xs text-gray-500">Highest Score</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}