import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import API from "../services/api";

export default function Notices() {
    const [notices, setNotices] = useState([]);
    const [loading, setLoading] = useState(false);
    const [creating, setCreating] = useState(false);
    const [showForm, setShowForm] = useState(false);

    const [form, setForm] = useState({
        title: "",
        description: "",
        priority: "normal"
    });

    const user = JSON.parse(localStorage.getItem("user"));

    useEffect(() => {
        fetchNotices();
    }, []);

    const fetchNotices = async () => {
        setLoading(true);
        try {
            const res = await API.get("/notices");
            setNotices(res.data);
        } catch (error) {
            console.error("Error fetching notices:", error);
        }
        setLoading(false);
    };

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value
        });
    };

    const createNotice = async () => {
        if (!form.title || !form.description) {
            alert("Please fill in all fields");
            return;
        }
        setCreating(true);
        try {
            await API.post("/notices", form);
            setForm({ title: "", description: "", priority: "normal" });
            setShowForm(false);
            fetchNotices();
        } catch (error) {
            alert("Error creating notice");
        }
        setCreating(false);
    };

    const deleteNotice = async (id) => {
        if (window.confirm("Are you sure you want to delete this notice?")) {
            try {
                await API.delete(`/notices/${id}`);
                fetchNotices();
            } catch (error) {
                alert("Error deleting notice");
            }
        }
    };

    const getPriorityConfig = (priority) => {
        switch (priority) {
            case "urgent":
                return {
                    bg: "bg-red-100",
                    text: "text-red-800",
                    border: "border-red-300",
                    badge: "bg-red-500",
                    icon: (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    )
                };
            case "important":
                return {
                    bg: "bg-amber-50",
                    text: "text-amber-800",
                    border: "border-amber-300",
                    badge: "bg-amber-500",
                    icon: (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    )
                };
            default:
                return {
                    bg: "bg-blue-50",
                    text: "text-blue-800",
                    border: "border-blue-200",
                    badge: "bg-blue-500",
                    icon: (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    )
                };
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const canManageNotices = user?.role === "admin" || user?.role === "faculty";

    return (
        <div className="min-h-screen bg-gray-100">
            <Navbar />

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
                    <div>
                        <h2 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
                            <div className="p-2 bg-indigo-100 rounded-lg">
                                <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                                </svg>
                            </div>
                            Notice Board
                        </h2>
                        <p className="text-gray-600 mt-2">
                            Stay updated with the latest announcements
                        </p>
                    </div>

                    {canManageNotices && (
                        <button
                            onClick={() => setShowForm(!showForm)}
                            className="mt-4 sm:mt-0 inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-300 transition-all shadow-lg shadow-indigo-200"
                        >
                            {showForm ? (
                                <>
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                    Cancel
                                </>
                            ) : (
                                <>
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                    </svg>
                                    Add Notice
                                </>
                            )}
                        </button>
                    )}
                </div>

                {/* Create Notice Form */}
                {canManageNotices && showForm && (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8 animate-fadeIn">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                            <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            Create New Notice
                        </h3>

                        <div className="space-y-4">
                            {/* Title Input */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Title <span className="text-red-500">*</span>
                                </label>
                                <input
                                    name="title"
                                    value={form.title}
                                    placeholder="Enter notice title"
                                    onChange={handleChange}
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                                />
                            </div>

                            {/* Description Input */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Description <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    name="description"
                                    value={form.description}
                                    placeholder="Enter notice description..."
                                    onChange={handleChange}
                                    rows={4}
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors resize-none"
                                />
                            </div>

                            {/* Priority Select */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Priority
                                </label>
                                <div className="flex gap-3">
                                    {["normal", "important", "urgent"].map((priority) => (
                                        <label
                                            key={priority}
                                            className={`flex-1 cursor-pointer rounded-lg border-2 p-3 text-center transition-all ${
                                                form.priority === priority
                                                    ? priority === "urgent"
                                                        ? "border-red-500 bg-red-50 text-red-700"
                                                        : priority === "important"
                                                        ? "border-amber-500 bg-amber-50 text-amber-700"
                                                        : "border-blue-500 bg-blue-50 text-blue-700"
                                                    : "border-gray-200 hover:border-gray-300"
                                            }`}
                                        >
                                            <input
                                                type="radio"
                                                name="priority"
                                                value={priority}
                                                checked={form.priority === priority}
                                                onChange={handleChange}
                                                className="sr-only"
                                            />
                                            <span className="font-medium capitalize">{priority}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Submit Button */}
                            <div className="flex justify-end pt-2">
                                <button
                                    onClick={createNotice}
                                    disabled={creating}
                                    className="inline-flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {creating ? (
                                        <>
                                            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                            </svg>
                                            Publishing...
                                        </>
                                    ) : (
                                        <>
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                            </svg>
                                            Publish Notice
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Notices List */}
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-16">
                        <svg className="animate-spin h-12 w-12 text-indigo-600 mb-4" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        <p className="text-gray-500">Loading notices...</p>
                    </div>
                ) : notices.length === 0 ? (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-1">No notices yet</h3>
                        <p className="text-gray-500">
                            {canManageNotices
                                ? "Create your first notice to get started"
                                : "Check back later for announcements"
                            }
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {notices.map((notice) => {
                            const config = getPriorityConfig(notice.priority);
                            return (
                                <div
                                    key={notice._id}
                                    className={`bg-white rounded-xl shadow-sm border-l-4 ${config.border} overflow-hidden hover:shadow-md transition-shadow`}
                                >
                                    <div className="p-6">
                                        {/* Notice Header */}
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex items-start gap-3">
                                                <div className={`p-2 rounded-lg ${config.bg} ${config.text}`}>
                                                    {config.icon}
                                                </div>
                                                <div>
                                                    <h3 className="text-lg font-semibold text-gray-900">
                                                        {notice.title}
                                                    </h3>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
                                                            {notice.priority.charAt(0).toUpperCase() + notice.priority.slice(1)}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            {canManageNotices && (
                                                <button
                                                    onClick={() => deleteNotice(notice._id)}
                                                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                    title="Delete notice"
                                                >
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                </button>
                                            )}
                                        </div>

                                        {/* Notice Body */}
                                        <p className="mt-4 text-gray-600 leading-relaxed">
                                            {notice.description}
                                        </p>

                                        {/* Notice Footer */}
                                        <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-sm font-medium">
                                                    {notice.createdBy?.name?.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-gray-900">
                                                        {notice.createdBy?.name}
                                                    </p>
                                                    <p className="text-xs text-gray-500">
                                                        {notice.createdBy?.role?.charAt(0).toUpperCase() + notice.createdBy?.role?.slice(1)}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-1 text-sm text-gray-500">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                                {formatDate(notice.createdAt)}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Stats Footer */}
                {notices.length > 0 && (
                    <div className="mt-8 grid grid-cols-3 gap-4">
                        <div className="bg-blue-50 rounded-lg p-4 text-center">
                            <p className="text-2xl font-bold text-blue-600">
                                {notices.filter(n => n.priority === "normal").length}
                            </p>
                            <p className="text-sm text-blue-600">Normal</p>
                        </div>
                        <div className="bg-amber-50 rounded-lg p-4 text-center">
                            <p className="text-2xl font-bold text-amber-600">
                                {notices.filter(n => n.priority === "important").length}
                            </p>
                            <p className="text-sm text-amber-600">Important</p>
                        </div>
                        <div className="bg-red-50 rounded-lg p-4 text-center">
                            <p className="text-2xl font-bold text-red-600">
                                {notices.filter(n => n.priority === "urgent").length}
                            </p>
                            <p className="text-sm text-red-600">Urgent</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}