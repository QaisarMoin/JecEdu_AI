import { useEffect, useState } from "react";
import API from "../services/api";
import Navbar from "../components/Navbar";

export default function Notices() {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedNotice, setSelectedNotice] = useState(null);

  useEffect(() => {
    fetchNotices();
  }, []);

  const fetchNotices = async () => {
    setLoading(true);
    try {
      const res = await API.get("/notices");
      setNotices(res.data);
    } catch {
      alert("Error fetching notices");
    } finally {
      setLoading(false);
    }
  };

  const filteredNotices = notices.filter(
    (notice) =>
      notice.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notice.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatTime = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getTimeAgo = (dateStr) => {
    if (!dateStr) return "";
    const now = new Date();
    const date = new Date(dateStr);
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return formatDate(dateStr);
  };

  const isNew = (dateStr) => {
    if (!dateStr) return false;
    const now = new Date();
    const date = new Date(dateStr);
    const diffMs = now - date;
    const diffHours = diffMs / 3600000;
    return diffHours < 48;
  };

  const getPriorityColor = (index) => {
    if (index === 0)
      return "border-l-indigo-500 bg-gradient-to-r from-indigo-50/50 to-white";
    if (index === 1)
      return "border-l-blue-500 bg-gradient-to-r from-blue-50/30 to-white";
    if (index === 2)
      return "border-l-cyan-500 bg-gradient-to-r from-cyan-50/30 to-white";
    return "border-l-gray-300";
  };

  const getIconColor = (index) => {
    if (index === 0) return "bg-indigo-100 text-indigo-600";
    if (index === 1) return "bg-blue-100 text-blue-600";
    if (index === 2) return "bg-cyan-100 text-cyan-600";
    return "bg-gray-100 text-gray-600";
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/25">
                  <svg
                    className="w-6 h-6 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                    />
                  </svg>
                </div>
                Notices & Announcements
              </h1>
              <p className="mt-2 text-gray-500 ml-13">
                Stay updated with the latest department announcements
              </p>
            </div>

            {/* Notice Count Badge */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl shadow-sm">
                <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-gray-700">
                  {notices.length} {notices.length === 1 ? "Notice" : "Notices"}
                </span>
              </div>
            </div>
          </div>

          {/* Search Bar */}
          <div className="mt-6 relative max-w-md">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <svg
                className="w-5 h-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search notices..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500 transition-all duration-200 shadow-sm hover:border-gray-300"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg
                  className="w-5 h-5"
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
            )}
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-amber-100 rounded-full"></div>
              <div className="w-16 h-16 border-4 border-amber-500 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
            </div>
            <p className="mt-6 text-gray-500 font-medium">
              Loading notices...
            </p>
          </div>
        ) : filteredNotices.length === 0 ? (
          /* Empty State */
          <div className="flex flex-col items-center justify-center py-24 px-6">
            <div className="w-24 h-24 bg-gray-100 rounded-3xl flex items-center justify-center mb-6">
              <svg
                className="w-12 h-12 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              {searchTerm ? "No notices found" : "No notices yet"}
            </h3>
            <p className="text-gray-500 text-center max-w-sm">
              {searchTerm
                ? `No notices matching "${searchTerm}". Try a different search term.`
                : "There are no announcements at this time. Check back later for updates."}
            </p>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="mt-4 px-5 py-2.5 bg-amber-50 text-amber-700 font-medium rounded-xl hover:bg-amber-100 transition-colors"
              >
                Clear Search
              </button>
            )}
          </div>
        ) : (
          /* Notices List */
          <div className="space-y-4">
            {filteredNotices.map((notice, index) => (
              <div
                key={notice._id}
                onClick={() =>
                  setSelectedNotice(
                    selectedNotice === notice._id ? null : notice._id
                  )
                }
                className={`bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer border-l-4 overflow-hidden ${getPriorityColor(
                  index
                )} ${
                  selectedNotice === notice._id
                    ? "ring-2 ring-amber-500/30"
                    : ""
                }`}
              >
                <div className="p-6">
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${getIconColor(
                        index
                      )}`}
                    >
                      {index === 0 ? (
                        <svg
                          className="w-6 h-6"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                          />
                        </svg>
                      ) : (
                        <svg
                          className="w-6 h-6"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                          />
                        </svg>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="text-lg font-semibold text-gray-900">
                              {notice.title}
                            </h3>
                            {isNew(notice.createdAt) && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-50 text-red-600 text-xs font-semibold rounded-full border border-red-100">
                                <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></span>
                                NEW
                              </span>
                            )}
                          </div>

                          {/* Date & Time */}
                          {notice.createdAt && (
                            <div className="flex items-center gap-3 mt-1.5">
                              <span className="inline-flex items-center gap-1.5 text-xs text-gray-400">
                                <svg
                                  className="w-3.5 h-3.5"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                                  />
                                </svg>
                                {formatDate(notice.createdAt)}
                              </span>
                              <span className="inline-flex items-center gap-1.5 text-xs text-gray-400">
                                <svg
                                  className="w-3.5 h-3.5"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                  />
                                </svg>
                                {formatTime(notice.createdAt)}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Time Ago Badge */}
                        {notice.createdAt && (
                          <span className="hidden sm:inline-flex items-center px-3 py-1 bg-gray-100 text-gray-500 text-xs font-medium rounded-full flex-shrink-0">
                            {getTimeAgo(notice.createdAt)}
                          </span>
                        )}
                      </div>

                      {/* Description Preview / Full */}
                      <div className="mt-3">
                        {selectedNotice === notice._id ? (
                          <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">
                            {notice.description}
                          </p>
                        ) : (
                          <p className="text-gray-500 text-sm leading-relaxed line-clamp-2">
                            {notice.description}
                          </p>
                        )}
                      </div>

                      {/* Expand Indicator */}
                      {notice.description && notice.description.length > 150 && (
                        <div className="mt-3 flex items-center gap-1.5 text-amber-600">
                          <span className="text-xs font-semibold">
                            {selectedNotice === notice._id
                              ? "Click to collapse"
                              : "Click to read more"}
                          </span>
                          <svg
                            className={`w-3.5 h-3.5 transition-transform duration-200 ${
                              selectedNotice === notice._id ? "rotate-180" : ""
                            }`}
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
                      )}
                    </div>
                  </div>
                </div>

                {/* Posted By Footer */}
                {notice.postedBy && selectedNotice === notice._id && (
                  <div className="px-6 py-3 bg-gray-50/80 border-t border-gray-100">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-indigo-100 rounded-full flex items-center justify-center">
                        <svg
                          className="w-3.5 h-3.5 text-indigo-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                          />
                        </svg>
                      </div>
                      <span className="text-xs text-gray-500">
                        Posted by{" "}
                        <span className="font-semibold text-gray-700">
                          {notice.postedBy.name || notice.postedBy.email || "Admin"}
                        </span>
                      </span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Bottom Info */}
        {!loading && filteredNotices.length > 0 && (
          <div className="mt-8 flex items-center justify-center">
            <div className="flex items-center gap-2 px-5 py-3 bg-white border border-gray-200 rounded-xl shadow-sm">
              <svg
                className="w-4 h-4 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span className="text-sm text-gray-500">
                Showing{" "}
                <span className="font-semibold text-gray-700">
                  {filteredNotices.length}
                </span>{" "}
                of{" "}
                <span className="font-semibold text-gray-700">
                  {notices.length}
                </span>{" "}
                notices
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}