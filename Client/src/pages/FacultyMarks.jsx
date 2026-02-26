import { useEffect, useState, useCallback } from "react";
import Sidebar from "../components/Navbar";
import API from "../services/api";

const COMPONENTS = [
    {
        key: "mst1Marks",
        id: "mst1",
        label: "MST 1",
        max: 25,
        color: "blue",
        lockKey: "mst1Locked"
    },
    {
        key: "mst2Marks",
        id: "mst2",
        label: "MST 2",
        max: 25,
        color: "violet",
        lockKey: "mst2Locked"
    },
    {
        key: "assignmentMarks",
        id: "assignment",
        label: "Assignment",
        max: 10,
        color: "amber",
        lockKey: "assignmentLocked"
    },
    {
        key: "practicalMarks",
        id: "practical",
        label: "Practical",
        max: 40,
        color: "emerald",
        lockKey: "practicalLocked"
    }
];

export default function FacultyMarks() {
    const [subjects, setSubjects] = useState([]);
    const [students, setStudents] = useState([]);
    const [selectedSubject, setSelectedSubject] = useState("");
    const [activeComponent, setActiveComponent] = useState(null);
    const [marks, setMarks] = useState({});
    const [lockStatus, setLockStatus] = useState({});
    const [publishedComponents, setPublishedComponents] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(false);
    const [loadingData, setLoadingData] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [toast, setToast] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [confirmDialog, setConfirmDialog] = useState(null);

    useEffect(() => {
        fetchSubjects();
    }, []);

    useEffect(() => {
        if (toast) {
            const t = setTimeout(() => setToast(null), 3500);
            return () => clearTimeout(t);
        }
    }, [toast]);

    const showToast = (message, type = "success") => {
        setToast({ message, type });
    };

    const fetchSubjects = async () => {
        setLoading(true);
        try {
            const res = await API.get("/subjects/faculty");
            setSubjects(res.data);
        } catch {
            showToast("Failed to load subjects", "error");
        }
        setLoading(false);
    };

    const selectSubject = async (subjectId) => {
        if (!subjectId) {
            setSelectedSubject("");
            setStudents([]);
            setMarks({});
            setActiveComponent(null);
            setStats(null);
            return;
        }

        setSelectedSubject(subjectId);
        setActiveComponent(null);
        setLoadingData(true);

        try {
            const subject = subjects.find(
                (s) => s._id === subjectId
            );

            const [studentsRes, marksRes, statsRes] =
                await Promise.all([
                    API.get(
                        `/users/students?department=${subject.department}&semester=${subject.semester}`
                    ),
                    API.get(`/marks/subject/${subjectId}`),
                    API.get(
                        `/marks/subject/${subjectId}/stats`
                    )
                ]);

            setStudents(studentsRes.data);
            setStats(statsRes.data);

            const { marks: existingMarks, lockStatus: ls } =
                marksRes.data;

            setLockStatus(ls || {});
            setPublishedComponents(
                ls?.publishedComponents || []
            );

            // Build marks map
            const marksMap = {};
            existingMarks.forEach((mark) => {
                const sid =
                    mark.student?._id || mark.student;
                marksMap[sid] = {
                    mst1Marks: mark.mst1Marks,
                    mst2Marks: mark.mst2Marks,
                    assignmentMarks: mark.assignmentMarks,
                    practicalMarks: mark.practicalMarks
                };
            });

            // Initialize for all students
            const initial = {};
            studentsRes.data.forEach((student) => {
                initial[student._id] = marksMap[
                    student._id
                ] || {
                    mst1Marks: null,
                    mst2Marks: null,
                    assignmentMarks: null,
                    practicalMarks: null
                };
            });

            setMarks(initial);
        } catch {
            showToast("Failed to load data", "error");
        }
        setLoadingData(false);
    };

    const refreshData = useCallback(() => {
        if (selectedSubject) {
            selectSubject(selectedSubject);
        }
    }, [selectedSubject]);

    const updateMark = (studentId, value) => {
        if (!activeComponent) return;
        const max = activeComponent.max;
        let numValue = value === "" ? null : Number(value);
        if (numValue !== null) {
            numValue = Math.min(Math.max(0, numValue), max);
        }
        setMarks((prev) => ({
            ...prev,
            [studentId]: {
                ...prev[studentId],
                [activeComponent.key]: numValue
            }
        }));
    };

    const submitMarks = async () => {
        if (!activeComponent || !selectedSubject) return;

        setSubmitting(true);
        try {
            const marksArray = students
                .map((student) => ({
                    studentId: student._id,
                    value:
                        marks[student._id]?.[
                            activeComponent.key
                        ] ?? null
                }))
                .filter((m) => m.value !== null);

            await API.post("/marks/enter", {
                subjectId: selectedSubject,
                component: activeComponent.key,
                marks: marksArray
            });

            showToast(
                `${activeComponent.label} marks saved for ${marksArray.length} students`
            );
            refreshData();
        } catch (err) {
            showToast(
                err.response?.data?.message ||
                    "Failed to save marks",
                "error"
            );
        }
        setSubmitting(false);
    };

    const handleLockToggle = async (comp) => {
        const isLocked = lockStatus[comp.lockKey];
        const action = isLocked ? "unlock" : "lock";

        setConfirmDialog({
            title: `${isLocked ? "Unlock" : "Lock"} ${comp.label}?`,
            message: isLocked
                ? `This will allow editing ${comp.label} marks again.`
                : `This will prevent any further changes to ${comp.label} marks. You can unlock later if needed.`,
            confirmText: isLocked ? "Unlock" : "Lock",
            confirmColor: isLocked
                ? "bg-amber-600 hover:bg-amber-700"
                : "bg-red-600 hover:bg-red-700",
            onConfirm: async () => {
                try {
                    await API.post(`/marks/${action}`, {
                        subjectId: selectedSubject,
                        component: comp.id
                    });
                    showToast(
                        `${comp.label} marks ${action}ed`
                    );
                    refreshData();
                } catch {
                    showToast(
                        `Failed to ${action} marks`,
                        "error"
                    );
                }
                setConfirmDialog(null);
            }
        });
    };

    const handlePublishToggle = async (comp) => {
        const isPublished = publishedComponents.includes(
            comp.id
        );
        const action = isPublished
            ? "unpublish"
            : "publish";

        setConfirmDialog({
            title: `${isPublished ? "Hide" : "Publish"} ${comp.label} marks?`,
            message: isPublished
                ? `Students will no longer be able to see their ${comp.label} marks.`
                : `Students will be able to see their ${comp.label} marks.`,
            confirmText: isPublished ? "Hide" : "Publish",
            confirmColor: isPublished
                ? "bg-gray-600 hover:bg-gray-700"
                : "bg-indigo-600 hover:bg-indigo-700",
            onConfirm: async () => {
                try {
                    await API.post(`/marks/${action}`, {
                        subjectId: selectedSubject,
                        component: comp.id
                    });
                    showToast(
                        `${comp.label} marks ${action === "publish" ? "published" : "hidden"}`
                    );
                    refreshData();
                } catch {
                    showToast(
                        `Failed to ${action}`,
                        "error"
                    );
                }
                setConfirmDialog(null);
            }
        });
    };

    const filteredStudents = students.filter(
        (s) =>
            s.name
                ?.toLowerCase()
                .includes(searchQuery.toLowerCase()) ||
            s.rollNo
                ?.toLowerCase()
                .includes(searchQuery.toLowerCase())
    );

    const filledCount = activeComponent
        ? filteredStudents.filter(
              (s) =>
                  marks[s._id]?.[activeComponent.key] !==
                      null &&
                  marks[s._id]?.[activeComponent.key] !==
                      undefined
          ).length
        : 0;

    const selectedSubjectData = subjects.find(
        (s) => s._id === selectedSubject
    );

    return (
        <div className="flex min-h-screen bg-gray-50">
            <Sidebar />

            {/* Toast */}
            {toast && (
                <div className="fixed top-5 right-5 z-[100] animate-fade-in">
                    <div
                        className={`flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-xl backdrop-blur-sm border ${
                            toast.type === "success"
                                ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                                : toast.type === "error"
                                  ? "bg-red-50 border-red-200 text-red-800"
                                  : "bg-blue-50 border-blue-200 text-blue-800"
                        }`}
                    >
                        {toast.type === "success" && (
                            <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                                <svg
                                    className="w-4 h-4 text-emerald-600"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M5 13l4 4L19 7"
                                    />
                                </svg>
                            </div>
                        )}
                        {toast.type === "error" && (
                            <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                                <svg
                                    className="w-4 h-4 text-red-600"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M6 18L18 6M6 6l12 12"
                                    />
                                </svg>
                            </div>
                        )}
                        <span className="text-sm font-medium">
                            {toast.message}
                        </span>
                        <button
                            onClick={() => setToast(null)}
                            className="ml-2 opacity-60 hover:opacity-100"
                        >
                            <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M6 18L18 6M6 6l12 12"
                                />
                            </svg>
                        </button>
                    </div>
                </div>
            )}

            {/* Confirm Dialog */}
            {confirmDialog && (
                <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/40 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full mx-4">
                        <h3 className="text-lg font-semibold text-gray-900">
                            {confirmDialog.title}
                        </h3>
                        <p className="text-sm text-gray-600 mt-2">
                            {confirmDialog.message}
                        </p>
                        <div className="flex justify-end gap-3 mt-6">
                            <button
                                onClick={() =>
                                    setConfirmDialog(null)
                                }
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={
                                    confirmDialog.onConfirm
                                }
                                className={`px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors ${confirmDialog.confirmColor}`}
                            >
                                {confirmDialog.confirmText}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="flex-1 p-6 lg:p-8 ml-64">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-gray-900">
                        Marks Management
                    </h1>
                    <p className="text-gray-500 mt-1 text-sm">
                        Enter, manage, and publish student
                        marks by component
                    </p>
                </div>

                {/* Subject Selection */}
                <div className="mb-6">
                    <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">
                        Select Subject
                    </label>

                    {loading ? (
                        <div className="flex items-center gap-2 text-gray-400 text-sm">
                            <svg
                                className="animate-spin h-4 w-4"
                                viewBox="0 0 24 24"
                            >
                                <circle
                                    className="opacity-25"
                                    cx="12"
                                    cy="12"
                                    r="10"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                    fill="none"
                                />
                                <path
                                    className="opacity-75"
                                    fill="currentColor"
                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                                />
                            </svg>
                            Loading...
                        </div>
                    ) : subjects.length === 0 ? (
                        <div className="bg-white border border-dashed border-gray-300 rounded-xl p-8 text-center">
                            <p className="text-gray-400 text-sm">
                                No subjects assigned
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                            {subjects.map((subject) => (
                                <button
                                    key={subject._id}
                                    onClick={() =>
                                        selectSubject(
                                            subject._id
                                        )
                                    }
                                    className={`group relative p-4 rounded-xl border text-left transition-all duration-200 ${
                                        selectedSubject ===
                                        subject._id
                                            ? "border-indigo-400 bg-indigo-50 shadow-sm"
                                            : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm"
                                    }`}
                                >
                                    <p
                                        className={`font-semibold text-sm ${
                                            selectedSubject ===
                                            subject._id
                                                ? "text-indigo-700"
                                                : "text-gray-800"
                                        }`}
                                    >
                                        {subject.name}
                                    </p>
                                    <p className="text-xs text-gray-400 mt-0.5">
                                        {subject.code} •
                                        Sem{" "}
                                        {subject.semester}
                                    </p>
                                    {selectedSubject ===
                                        subject._id && (
                                        <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-indigo-500" />
                                    )}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Loading State */}
                {loadingData && (
                    <div className="bg-white rounded-xl border border-gray-200 p-16 text-center">
                        <svg
                            className="animate-spin h-8 w-8 text-indigo-500 mx-auto mb-3"
                            viewBox="0 0 24 24"
                        >
                            <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                                fill="none"
                            />
                            <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                            />
                        </svg>
                        <p className="text-sm text-gray-400">
                            Loading data...
                        </p>
                    </div>
                )}

                {/* Main Content */}
                {!loadingData &&
                    selectedSubject &&
                    students.length > 0 && (
                        <>
                            {/* Subject Info Bar */}
                            <div className="bg-white border border-gray-200 rounded-xl p-4 mb-6">
                                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                                    <div>
                                        <h2 className="font-semibold text-gray-900">
                                            {
                                                selectedSubjectData?.name
                                            }
                                        </h2>
                                        <p className="text-xs text-gray-400 mt-0.5">
                                            {
                                                selectedSubjectData?.code
                                            }{" "}
                                            •{" "}
                                            {
                                                selectedSubjectData?.department
                                            }{" "}
                                            • Semester{" "}
                                            {
                                                selectedSubjectData?.semester
                                            }{" "}
                                            •{" "}
                                            {students.length}{" "}
                                            students
                                        </p>
                                    </div>

                                    {/* Quick Stats */}
                                    {stats?.stats && (
                                        <div className="flex gap-6 text-center">
                                            {COMPONENTS.map(
                                                (comp) => {
                                                    const s =
                                                        stats
                                                            .stats[
                                                            comp
                                                                .id
                                                        ];
                                                    return (
                                                        <div
                                                            key={
                                                                comp.id
                                                            }
                                                            className="min-w-0"
                                                        >
                                                            <p className="text-xs text-gray-400">
                                                                {
                                                                    comp.label
                                                                }
                                                            </p>
                                                            <p className="text-sm font-semibold text-gray-700 mt-0.5">
                                                                {s
                                                                    ? `${s.avg}/${comp.max}`
                                                                    : "—"}
                                                            </p>
                                                            <p className="text-[10px] text-gray-300">
                                                                {s
                                                                    ? `${s.count} entered`
                                                                    : "none"}
                                                            </p>
                                                        </div>
                                                    );
                                                }
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Component Selector Tabs */}
                            <div className="mb-6">
                                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">
                                    Select Component to
                                    Enter Marks
                                </label>
                                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                                    {COMPONENTS.map(
                                        (comp) => {
                                            const isLocked =
                                                lockStatus[
                                                    comp
                                                        .lockKey
                                                ];
                                            const isPublished =
                                                publishedComponents.includes(
                                                    comp.id
                                                );
                                            const isActive =
                                                activeComponent?.id ===
                                                comp.id;
                                            const s =
                                                stats?.stats?.[
                                                    comp.id
                                                ];

                                            return (
                                                <button
                                                    key={
                                                        comp.id
                                                    }
                                                    onClick={() =>
                                                        setActiveComponent(
                                                            comp
                                                        )
                                                    }
                                                    className={`relative p-4 rounded-xl border transition-all duration-200 text-left ${
                                                        isActive
                                                            ? `border-${comp.color}-400 bg-${comp.color}-50 shadow-sm`
                                                            : "border-gray-200 bg-white hover:border-gray-300"
                                                    }`}
                                                >
                                                    <div className="flex items-center justify-between mb-2">
                                                        <span
                                                            className={`text-sm font-semibold ${
                                                                isActive
                                                                    ? `text-${comp.color}-700`
                                                                    : "text-gray-700"
                                                            }`}
                                                        >
                                                            {
                                                                comp.label
                                                            }
                                                        </span>
                                                        <div className="flex gap-1">
                                                            {isLocked && (
                                                                <span
                                                                    className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center"
                                                                    title="Locked"
                                                                >
                                                                    <svg
                                                                        className="w-3 h-3 text-red-500"
                                                                        fill="none"
                                                                        stroke="currentColor"
                                                                        viewBox="0 0 24 24"
                                                                    >
                                                                        <path
                                                                            strokeLinecap="round"
                                                                            strokeLinejoin="round"
                                                                            strokeWidth={
                                                                                2
                                                                            }
                                                                            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                                                                        />
                                                                    </svg>
                                                                </span>
                                                            )}
                                                            {isPublished && (
                                                                <span
                                                                    className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center"
                                                                    title="Published"
                                                                >
                                                                    <svg
                                                                        className="w-3 h-3 text-green-500"
                                                                        fill="none"
                                                                        stroke="currentColor"
                                                                        viewBox="0 0 24 24"
                                                                    >
                                                                        <path
                                                                            strokeLinecap="round"
                                                                            strokeLinejoin="round"
                                                                            strokeWidth={
                                                                                2
                                                                            }
                                                                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                                                        />
                                                                        <path
                                                                            strokeLinecap="round"
                                                                            strokeLinejoin="round"
                                                                            strokeWidth={
                                                                                2
                                                                            }
                                                                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                                                        />
                                                                    </svg>
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <p className="text-xs text-gray-400">
                                                        Max:{" "}
                                                        {
                                                            comp.max
                                                        }{" "}
                                                        •{" "}
                                                        {s
                                                            ? `${s.count} entered`
                                                            : "None entered"}
                                                    </p>
                                                    {isActive && (
                                                        <div
                                                            className={`absolute bottom-0 left-4 right-4 h-0.5 bg-${comp.color}-500 rounded-full`}
                                                        />
                                                    )}
                                                </button>
                                            );
                                        }
                                    )}
                                </div>
                            </div>

                            {/* Component Actions */}
                            {activeComponent && (
                                <div className="bg-white border border-gray-200 rounded-xl mb-6">
                                    <div className="p-4 border-b border-gray-100">
                                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                                            <div className="flex items-center gap-3">
                                                <h3 className="font-semibold text-gray-800">
                                                    {
                                                        activeComponent.label
                                                    }{" "}
                                                    Marks
                                                </h3>
                                                <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-full">
                                                    Max:{" "}
                                                    {
                                                        activeComponent.max
                                                    }
                                                </span>
                                                {lockStatus[
                                                    activeComponent
                                                        .lockKey
                                                ] && (
                                                    <span className="text-xs text-red-600 bg-red-50 px-2 py-1 rounded-full font-medium">
                                                        Locked
                                                    </span>
                                                )}
                                                {publishedComponents.includes(
                                                    activeComponent.id
                                                ) && (
                                                    <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full font-medium">
                                                        Published
                                                    </span>
                                                )}
                                            </div>

                                            <div className="flex items-center gap-2">
                                                {/* Lock/Unlock */}
                                                <button
                                                    onClick={() =>
                                                        handleLockToggle(
                                                            activeComponent
                                                        )
                                                    }
                                                    className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${
                                                        lockStatus[
                                                            activeComponent
                                                                .lockKey
                                                        ]
                                                            ? "border-amber-200 text-amber-700 bg-amber-50 hover:bg-amber-100"
                                                            : "border-gray-200 text-gray-600 hover:bg-gray-50"
                                                    }`}
                                                >
                                                    {lockStatus[
                                                        activeComponent
                                                            .lockKey
                                                    ]
                                                        ? "Unlock"
                                                        : "Lock"}
                                                </button>

                                                {/* Publish/Unpublish */}
                                                <button
                                                    onClick={() =>
                                                        handlePublishToggle(
                                                            activeComponent
                                                        )
                                                    }
                                                    className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${
                                                        publishedComponents.includes(
                                                            activeComponent.id
                                                        )
                                                            ? "border-green-200 text-green-700 bg-green-50 hover:bg-green-100"
                                                            : "border-gray-200 text-gray-600 hover:bg-gray-50"
                                                    }`}
                                                >
                                                    {publishedComponents.includes(
                                                        activeComponent.id
                                                    )
                                                        ? "Unpublish"
                                                        : "Publish to Students"}
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Search & Info */}
                                    <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center gap-3">
                                        <div className="relative flex-1 max-w-xs">
                                            <svg
                                                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={
                                                        2
                                                    }
                                                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                                                />
                                            </svg>
                                            <input
                                                type="text"
                                                placeholder="Search by name or roll no..."
                                                value={
                                                    searchQuery
                                                }
                                                onChange={(
                                                    e
                                                ) =>
                                                    setSearchQuery(
                                                        e
                                                            .target
                                                            .value
                                                    )
                                                }
                                                className="w-full pl-10 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-300"
                                            />
                                        </div>
                                        <div className="text-xs text-gray-400">
                                            {filledCount}/
                                            {
                                                filteredStudents.length
                                            }{" "}
                                            filled
                                        </div>
                                    </div>

                                    {/* Marks Table */}
                                    <div className="overflow-x-auto">
                                        <table className="w-full">
                                            <thead>
                                                <tr className="border-b border-gray-100">
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider w-12">
                                                        #
                                                    </th>
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                                        Student
                                                    </th>
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider w-16">
                                                        Roll
                                                        No
                                                    </th>
                                                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-400 uppercase tracking-wider w-40">
                                                        Marks
                                                        (out
                                                        of{" "}
                                                        {
                                                            activeComponent.max
                                                        }
                                                        )
                                                    </th>
                                                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-400 uppercase tracking-wider w-24">
                                                        Status
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-50">
                                                {filteredStudents.map(
                                                    (
                                                        student,
                                                        idx
                                                    ) => {
                                                        const val =
                                                            marks[
                                                                student
                                                                    ._id
                                                            ]?.[
                                                                activeComponent
                                                                    .key
                                                            ];
                                                        const isFilled =
                                                            val !==
                                                                null &&
                                                            val !==
                                                                undefined;
                                                        const isLocked =
                                                            lockStatus[
                                                                activeComponent
                                                                    .lockKey
                                                            ];

                                                        return (
                                                            <tr
                                                                key={
                                                                    student._id
                                                                }
                                                                className="hover:bg-gray-50/50 transition-colors"
                                                            >
                                                                <td className="px-4 py-3 text-xs text-gray-300">
                                                                    {idx +
                                                                        1}
                                                                </td>
                                                                <td className="px-4 py-3">
                                                                    <p className="text-sm font-medium text-gray-800">
                                                                        {
                                                                            student.name
                                                                        }
                                                                    </p>
                                                                </td>
                                                                <td className="px-4 py-3">
                                                                    <span className="text-xs text-gray-500 font-mono">
                                                                        {
                                                                            student.rollNo
                                                                        }
                                                                    </span>
                                                                </td>
                                                                <td className="px-4 py-3">
                                                                    <div className="flex justify-center">
                                                                        <input
                                                                            type="number"
                                                                            min="0"
                                                                            max={
                                                                                activeComponent.max
                                                                            }
                                                                            value={
                                                                                val ??
                                                                                ""
                                                                            }
                                                                            onChange={(
                                                                                e
                                                                            ) =>
                                                                                updateMark(
                                                                                    student._id,
                                                                                    e
                                                                                        .target
                                                                                        .value
                                                                                )
                                                                            }
                                                                            disabled={
                                                                                isLocked
                                                                            }
                                                                            placeholder="—"
                                                                            className={`w-24 px-3 py-2 text-center text-sm border rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-300 ${
                                                                                isLocked
                                                                                    ? "bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200"
                                                                                    : isFilled
                                                                                      ? "border-green-300 bg-green-50 text-gray-800"
                                                                                      : "border-gray-200 text-gray-800"
                                                                            }`}
                                                                        />
                                                                    </div>
                                                                </td>
                                                                <td className="px-4 py-3 text-center">
                                                                    {isFilled ? (
                                                                        <span className="inline-flex items-center gap-1 text-xs text-green-600">
                                                                            <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                                                                            Filled
                                                                        </span>
                                                                    ) : (
                                                                        <span className="inline-flex items-center gap-1 text-xs text-gray-300">
                                                                            <span className="w-1.5 h-1.5 rounded-full bg-gray-300" />
                                                                            Empty
                                                                        </span>
                                                                    )}
                                                                </td>
                                                            </tr>
                                                        );
                                                    }
                                                )}
                                            </tbody>
                                        </table>
                                    </div>

                                    {/* Submit Bar */}
                                    <div className="p-4 border-t border-gray-100 flex items-center justify-between">
                                        <p className="text-xs text-gray-400">
                                            {filledCount}{" "}
                                            of{" "}
                                            {
                                                filteredStudents.length
                                            }{" "}
                                            marks filled
                                        </p>
                                        <button
                                            onClick={
                                                submitMarks
                                            }
                                            disabled={
                                                submitting ||
                                                lockStatus[
                                                    activeComponent
                                                        .lockKey
                                                ]
                                            }
                                            className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {submitting ? (
                                                <>
                                                    <svg
                                                        className="animate-spin h-4 w-4"
                                                        viewBox="0 0 24 24"
                                                    >
                                                        <circle
                                                            className="opacity-25"
                                                            cx="12"
                                                            cy="12"
                                                            r="10"
                                                            stroke="currentColor"
                                                            strokeWidth="4"
                                                            fill="none"
                                                        />
                                                        <path
                                                            className="opacity-75"
                                                            fill="currentColor"
                                                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                                                        />
                                                    </svg>
                                                    Saving...
                                                </>
                                            ) : (
                                                <>
                                                    Save{" "}
                                                    {
                                                        activeComponent.label
                                                    }{" "}
                                                    Marks
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* No component selected prompt */}
                            {!activeComponent && (
                                <div className="bg-white border border-dashed border-gray-300 rounded-xl p-12 text-center">
                                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                        <svg
                                            className="w-6 h-6 text-gray-400"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={
                                                    1.5
                                                }
                                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                            />
                                        </svg>
                                    </div>
                                    <p className="text-sm text-gray-500">
                                        Select a component
                                        above to start
                                        entering marks
                                    </p>
                                </div>
                            )}
                        </>
                    )}

                {/* No students */}
                {!loadingData &&
                    selectedSubject &&
                    students.length === 0 && (
                        <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
                            <p className="text-sm text-gray-400">
                                No students found for
                                this subject
                            </p>
                        </div>
                    )}

                {/* No subject selected */}
                {!loadingData && !selectedSubject && (
                    <div className="bg-white border border-dashed border-gray-300 rounded-xl p-16 text-center">
                        <div className="w-14 h-14 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg
                                className="w-7 h-7 text-indigo-400"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={1.5}
                                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                                />
                            </svg>
                        </div>
                        <h3 className="text-base font-medium text-gray-700 mb-1">
                            Select a Subject
                        </h3>
                        <p className="text-sm text-gray-400">
                            Choose a subject to manage
                            marks
                        </p>
                    </div>
                )}
            </div>

            <style>{`
                @keyframes fade-in {
                    from { opacity: 0; transform: translateY(-8px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in {
                    animation: fade-in 0.2s ease-out;
                }
            `}</style>
        </div>
    );
}