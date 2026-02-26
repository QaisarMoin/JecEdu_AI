import { useEffect, useState } from "react";
import Sidebar from "../components/Navbar";
import API from "../services/api";

const MAX_MARKS = {
    mst1Marks: 25,
    mst2Marks: 25,
    mstBest: 25,
    assignmentMarks: 10,
    practicalMarks: 40,
    totalMarks: 75
};

export default function StudentMarks() {
    const [marks, setMarks] = useState([]);
    const [loading, setLoading] = useState(false);
    const [expandedCard, setExpandedCard] = useState(null);

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

    const pct = (obtained, max) => {
        if (obtained === null || obtained === undefined) return null;
        return ((obtained / max) * 100).toFixed(1);
    };

    const getGrade = (percentage) => {
        if (percentage === null) return null;
        const p = parseFloat(percentage);
        if (p >= 90) return { grade: "A+", label: "Outstanding", color: "emerald" };
        if (p >= 80) return { grade: "A", label: "Excellent", color: "emerald" };
        if (p >= 70) return { grade: "B+", label: "Very Good", color: "blue" };
        if (p >= 60) return { grade: "B", label: "Good", color: "blue" };
        if (p >= 50) return { grade: "C", label: "Average", color: "amber" };
        if (p >= 40) return { grade: "D", label: "Pass", color: "orange" };
        return { grade: "F", label: "Fail", color: "red" };
    };

    const getProgressWidth = (obtained, max) => {
        if (obtained === null || obtained === undefined) return 0;
        return Math.min((obtained / max) * 100, 100);
    };

    const getColorClasses = (color) => ({
        bg: `bg-${color}-500`,
        bgLight: `bg-${color}-50`,
        bgMedium: `bg-${color}-100`,
        text: `text-${color}-700`,
        textLight: `text-${color}-500`,
        border: `border-${color}-200`,
        bar: `bg-${color}-200`
    });

    // Calculate overall stats from available (published) data
    const getOverallStats = () => {
        if (marks.length === 0) return null;

        let totalObtained = 0;
        let totalMax = 0;
        let subjectsWithTotal = 0;

        marks.forEach((m) => {
            // Calculate total from available published components
            let subTotal = 0;
            let subMax = 0;

            if (m.mst1Marks !== undefined && m.mst2Marks !== undefined) {
                // Both MSTs available - use best
                const best = Math.max(m.mst1Marks || 0, m.mst2Marks || 0);
                subTotal += best;
                subMax += MAX_MARKS.mstBest;
            } else if (m.mst1Marks !== undefined) {
                subTotal += m.mst1Marks || 0;
                subMax += MAX_MARKS.mst1Marks;
            } else if (m.mst2Marks !== undefined) {
                subTotal += m.mst2Marks || 0;
                subMax += MAX_MARKS.mst2Marks;
            }

            if (m.assignmentMarks !== undefined) {
                subTotal += m.assignmentMarks || 0;
                subMax += MAX_MARKS.assignmentMarks;
            }

            if (m.practicalMarks !== undefined) {
                subTotal += m.practicalMarks || 0;
                subMax += MAX_MARKS.practicalMarks;
            }

            if (subMax > 0) {
                totalObtained += subTotal;
                totalMax += subMax;
                subjectsWithTotal++;
            }
        });

        if (totalMax === 0) return null;

        const percentage = ((totalObtained / totalMax) * 100).toFixed(1);

        return {
            totalObtained,
            totalMax,
            percentage,
            subjectCount: marks.length,
            grade: getGrade(percentage)
        };
    };

    const stats = getOverallStats();

    const componentConfig = [
        {
            key: "mst1Marks",
            label: "MST 1",
            max: MAX_MARKS.mst1Marks,
            color: "blue",
            icon: "1"
        },
        {
            key: "mst2Marks",
            label: "MST 2",
            max: MAX_MARKS.mst2Marks,
            color: "violet",
            icon: "2"
        },
        {
            key: "assignmentMarks",
            label: "Assignment",
            max: MAX_MARKS.assignmentMarks,
            color: "amber",
            icon: "A"
        },
        {
            key: "practicalMarks",
            label: "Practical",
            max: MAX_MARKS.practicalMarks,
            color: "rose",
            icon: "P"
        }
    ];

    return (
        <div className="flex min-h-screen bg-gray-50">
            <Sidebar />

            <div className="flex-1 p-6 lg:p-8 ml-64">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-gray-900">My Marks</h1>
                    <p className="text-gray-500 mt-1 text-sm">
                        Your academic performance across all subjects
                    </p>
                </div>

                {/* Loading */}
                {loading && (
                    <div className="flex flex-col items-center justify-center py-20">
                        <svg
                            className="animate-spin h-8 w-8 text-indigo-500 mb-3"
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
                        <p className="text-sm text-gray-400">Loading marks...</p>
                    </div>
                )}

                {/* Empty State */}
                {!loading && marks.length === 0 && (
                    <div className="bg-white border border-gray-200 rounded-xl p-16 text-center">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg
                                className="w-8 h-8 text-gray-400"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={1.5}
                                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                />
                            </svg>
                        </div>
                        <h3 className="text-lg font-medium text-gray-700 mb-1">
                            No marks published yet
                        </h3>
                        <p className="text-sm text-gray-400 max-w-sm mx-auto">
                            Your faculty hasn't published any marks yet. Check back after exams.
                        </p>
                    </div>
                )}

                {/* Content */}
                {!loading && marks.length > 0 && (
                    <>
                        {/* Overall Summary */}
                        {stats && (
                            <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                    <div>
                                        <p className="text-xs text-gray-400 uppercase tracking-wider font-medium">
                                            Overall Performance
                                        </p>
                                        <div className="flex items-baseline gap-3 mt-2">
                                            <span className="text-4xl font-bold text-gray-900">
                                                {stats.percentage}%
                                            </span>
                                            {stats.grade && (
                                                <span
                                                    className={`px-2.5 py-1 rounded-lg text-sm font-bold bg-${stats.grade.color}-100 text-${stats.grade.color}-700`}
                                                >
                                                    {stats.grade.grade}
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-xs text-gray-400 mt-1">
                                            {stats.totalObtained} out of {stats.totalMax} (
                                            {stats.subjectCount} subjects)
                                        </p>
                                    </div>

                                    <div className="flex gap-4">
                                        <div className="text-center">
                                            <p className="text-2xl font-bold text-gray-800">
                                                {stats.subjectCount}
                                            </p>
                                            <p className="text-[10px] text-gray-400 uppercase tracking-wider">
                                                Subjects
                                            </p>
                                        </div>
                                        <div className="w-px bg-gray-200" />
                                        <div className="text-center">
                                            <p className="text-2xl font-bold text-gray-800">
                                                {stats.totalObtained}
                                            </p>
                                            <p className="text-[10px] text-gray-400 uppercase tracking-wider">
                                                Total
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Progress bar */}
                                <div className="mt-5">
                                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full rounded-full transition-all duration-700 bg-${stats.grade?.color || "gray"}-500`}
                                            style={{
                                                width: `${stats.percentage}%`
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Subject Cards */}
                        <div className="space-y-4">
                            {marks.map((mark) => {
                                const published = mark.publishedComponents || [];
                                const isExpanded = expandedCard === mark._id;

                                // Calculate available total
                                let availableTotal = 0;
                                let availableMax = 0;

                                if (published.includes("mst1") && published.includes("mst2")) {
                                    availableTotal += Math.max(
                                        mark.mst1Marks || 0,
                                        mark.mst2Marks || 0
                                    );
                                    availableMax += MAX_MARKS.mstBest;
                                } else if (published.includes("mst1")) {
                                    availableTotal += mark.mst1Marks || 0;
                                    availableMax += MAX_MARKS.mst1Marks;
                                } else if (published.includes("mst2")) {
                                    availableTotal += mark.mst2Marks || 0;
                                    availableMax += MAX_MARKS.mst2Marks;
                                }

                                if (published.includes("assignment")) {
                                    availableTotal += mark.assignmentMarks || 0;
                                    availableMax += MAX_MARKS.assignmentMarks;
                                }
                                if (published.includes("practical")) {
                                    availableTotal += mark.practicalMarks || 0;
                                    availableMax += MAX_MARKS.practicalMarks;
                                }

                                const totalPct =
                                    availableMax > 0
                                        ? ((availableTotal / availableMax) * 100).toFixed(1)
                                        : null;
                                const gradeInfo = totalPct ? getGrade(totalPct) : null;

                                return (
                                    <div
                                        key={mark._id}
                                        className="bg-white border border-gray-200 rounded-xl overflow-hidden transition-shadow hover:shadow-sm"
                                    >
                                        {/* Card Header - Always visible */}
                                        <button
                                            onClick={() =>
                                                setExpandedCard(
                                                    isExpanded ? null : mark._id
                                                )
                                            }
                                            className="w-full p-5 flex items-center justify-between text-left"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center flex-shrink-0">
                                                    <span className="text-sm font-bold text-indigo-600">
                                                        {mark.subject?.code?.slice(0, 2) || "—"}
                                                    </span>
                                                </div>
                                                <div>
                                                    <h3 className="font-semibold text-gray-800 text-sm">
                                                        {mark.subject?.name || "Subject"}
                                                    </h3>
                                                    <p className="text-xs text-gray-400 mt-0.5">
                                                        {mark.subject?.code} •{" "}
                                                        {published.length} component
                                                        {published.length !== 1 ? "s" : ""}{" "}
                                                        published
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-4">
                                                {/* Quick score display */}
                                                <div className="text-right hidden sm:block">
                                                    {totalPct !== null ? (
                                                        <>
                                                            <p className="text-lg font-bold text-gray-800">
                                                                {availableTotal}
                                                                <span className="text-sm font-normal text-gray-400">
                                                                    /{availableMax}
                                                                </span>
                                                            </p>
                                                            <p className="text-xs text-gray-400">
                                                                {totalPct}%
                                                            </p>
                                                        </>
                                                    ) : (
                                                        <p className="text-sm text-gray-300">—</p>
                                                    )}
                                                </div>

                                                {/* Grade badge */}
                                                {gradeInfo && (
                                                    <span
                                                        className={`px-2.5 py-1 rounded-lg text-xs font-bold bg-${gradeInfo.color}-100 text-${gradeInfo.color}-700 hidden sm:block`}
                                                    >
                                                        {gradeInfo.grade}
                                                    </span>
                                                )}

                                                {/* Expand arrow */}
                                                <svg
                                                    className={`w-5 h-5 text-gray-400 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M19 9l-7 7-7-7"
                                                    />
                                                </svg>
                                            </div>
                                        </button>

                                        {/* Expanded Content */}
                                        {isExpanded && (
                                            <div className="border-t border-gray-100">
                                                {/* Component Marks */}
                                                <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                    {componentConfig.map((comp) => {
                                                        const compId = comp.key
                                                            .replace("Marks", "")
                                                            .replace("mst1", "mst1")
                                                            .replace("mst2", "mst2")
                                                            .replace("assignment", "assignment")
                                                            .replace("practical", "practical");

                                                        // Map key to published component id
                                                        const publishId =
                                                            comp.key === "mst1Marks"
                                                                ? "mst1"
                                                                : comp.key === "mst2Marks"
                                                                  ? "mst2"
                                                                  : comp.key === "assignmentMarks"
                                                                    ? "assignment"
                                                                    : "practical";

                                                        const isPublished =
                                                            published.includes(publishId);
                                                        const value = mark[comp.key];
                                                        const percentage = pct(value, comp.max);

                                                        if (!isPublished) {
                                                            return (
                                                                <div
                                                                    key={comp.key}
                                                                    className="bg-gray-50 rounded-xl p-4 border border-dashed border-gray-200"
                                                                >
                                                                    <div className="flex items-center justify-between">
                                                                        <span className="text-sm font-medium text-gray-400">
                                                                            {comp.label}
                                                                        </span>
                                                                        <span className="text-xs text-gray-300 bg-gray-100 px-2 py-0.5 rounded-full">
                                                                            Not yet published
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            );
                                                        }

                                                        return (
                                                            <div
                                                                key={comp.key}
                                                                className={`bg-${comp.color}-50 rounded-xl p-4 border border-${comp.color}-100`}
                                                            >
                                                                <div className="flex items-center justify-between mb-3">
                                                                    <div className="flex items-center gap-2">
                                                                        <div
                                                                            className={`w-6 h-6 rounded-md bg-${comp.color}-200 flex items-center justify-center`}
                                                                        >
                                                                            <span
                                                                                className={`text-[10px] font-bold text-${comp.color}-700`}
                                                                            >
                                                                                {comp.icon}
                                                                            </span>
                                                                        </div>
                                                                        <span
                                                                            className={`text-sm font-medium text-${comp.color}-700`}
                                                                        >
                                                                            {comp.label}
                                                                        </span>
                                                                    </div>
                                                                    <span
                                                                        className={`text-xs text-${comp.color}-400`}
                                                                    >
                                                                        {percentage !== null
                                                                            ? `${percentage}%`
                                                                            : "—"}
                                                                    </span>
                                                                </div>

                                                                <div className="flex items-baseline gap-1">
                                                                    <span
                                                                        className={`text-2xl font-bold text-${comp.color}-700`}
                                                                    >
                                                                        {value !== null &&
                                                                        value !== undefined
                                                                            ? value
                                                                            : "—"}
                                                                    </span>
                                                                    <span
                                                                        className={`text-sm text-${comp.color}-400`}
                                                                    >
                                                                        /{comp.max}
                                                                    </span>
                                                                </div>

                                                                <div
                                                                    className={`h-1.5 bg-${comp.color}-200 rounded-full mt-3 overflow-hidden`}
                                                                >
                                                                    <div
                                                                        className={`h-full bg-${comp.color}-500 rounded-full transition-all duration-500`}
                                                                        style={{
                                                                            width: `${getProgressWidth(value, comp.max)}%`
                                                                        }}
                                                                    />
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>

                                                {/* Best MST indicator */}
                                                {published.includes("mst1") &&
                                                    published.includes("mst2") && (
                                                        <div className="mx-5 mb-4 p-3 bg-emerald-50 border border-emerald-100 rounded-xl">
                                                            <div className="flex items-center justify-between">
                                                                <div className="flex items-center gap-2">
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
                                                                            d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                                                                        />
                                                                    </svg>
                                                                    <span className="text-sm font-medium text-emerald-700">
                                                                        Best MST (considered for
                                                                        total)
                                                                    </span>
                                                                </div>
                                                                <span className="text-lg font-bold text-emerald-700">
                                                                    {mark.mstBest ??
                                                                        Math.max(
                                                                            mark.mst1Marks || 0,
                                                                            mark.mst2Marks || 0
                                                                        )}
                                                                    <span className="text-sm font-normal text-emerald-400">
                                                                        /{MAX_MARKS.mstBest}
                                                                    </span>
                                                                </span>
                                                            </div>
                                                        </div>
                                                    )}

                                                {/* Total Bar */}
                                                <div className="px-5 pb-5">
                                                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                                                        <div className="flex items-center justify-between mb-2">
                                                            <span className="text-sm font-medium text-gray-600">
                                                                Total (published components)
                                                            </span>
                                                            <div className="flex items-center gap-2">
                                                                {gradeInfo && (
                                                                    <span
                                                                        className={`px-2 py-0.5 rounded text-xs font-bold bg-${gradeInfo.color}-100 text-${gradeInfo.color}-700`}
                                                                    >
                                                                        {gradeInfo.grade}
                                                                    </span>
                                                                )}
                                                                <span className="text-lg font-bold text-gray-800">
                                                                    {availableTotal}
                                                                    <span className="text-sm font-normal text-gray-400">
                                                                        /{availableMax}
                                                                    </span>
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                                            <div
                                                                className={`h-full rounded-full transition-all duration-700 ${
                                                                    gradeInfo
                                                                        ? `bg-${gradeInfo.color}-500`
                                                                        : "bg-gray-400"
                                                                }`}
                                                                style={{
                                                                    width: `${totalPct || 0}%`
                                                                }}
                                                            />
                                                        </div>
                                                        {totalPct && (
                                                            <p className="text-xs text-gray-400 mt-2">
                                                                {totalPct}% •{" "}
                                                                {gradeInfo?.label || "—"}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Remarks */}
                                                {mark.remarks && (
                                                    <div className="mx-5 mb-5 p-3 bg-amber-50 border border-amber-100 rounded-xl">
                                                        <div className="flex items-start gap-2">
                                                            <svg
                                                                className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0"
                                                                fill="none"
                                                                stroke="currentColor"
                                                                viewBox="0 0 24 24"
                                                            >
                                                                <path
                                                                    strokeLinecap="round"
                                                                    strokeLinejoin="round"
                                                                    strokeWidth={2}
                                                                    d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
                                                                />
                                                            </svg>
                                                            <div>
                                                                <p className="text-xs font-medium text-amber-700">
                                                                    Faculty Remark
                                                                </p>
                                                                <p className="text-sm text-amber-600 mt-0.5">
                                                                    {mark.remarks}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>

                        {/* Info Footer */}
                        <div className="mt-8 bg-white border border-gray-200 rounded-xl p-5">
                            <div className="flex items-start gap-3">
                                <svg
                                    className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={1.5}
                                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                    />
                                </svg>
                                <div className="text-sm text-gray-500 space-y-1">
                                    <p>
                                        Marks are published by your faculty as each exam/assessment
                                        is completed and evaluated.
                                    </p>
                                    <p>
                                        Components marked as "Not yet published" are either not
                                        conducted yet or still being evaluated.
                                    </p>
                                    <p>
                                        <span className="font-medium">Total marks formula:</span>{" "}
                                        Best of MST 1 & MST 2 ({MAX_MARKS.mstBest}) + Assignment (
                                        {MAX_MARKS.assignmentMarks}) + Practical (
                                        {MAX_MARKS.practicalMarks}) = {MAX_MARKS.totalMarks}
                                    </p>
                                </div>
                            </div>
                        </div>  
                    </>
                )}
            </div>
        </div>
    );
}