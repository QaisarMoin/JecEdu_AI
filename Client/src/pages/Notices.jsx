import { useEffect, useState } from "react";
import Sidebar from "../components/Navbar";
import API from "../services/api";
import {
  Bell,
  Plus,
  X,
  AlertTriangle,
  Info,
  Shield,
  Trash2,
  Send,
  Loader2,
  Clock,
  Inbox,
  PenLine,
  ChevronDown,
  Filter,
  Search,
} from "lucide-react";

export default function Notices() {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterPriority, setFilterPriority] = useState("all");
  const [expandedNotice, setExpandedNotice] = useState(null);

  const [form, setForm] = useState({
    title: "",
    description: "",
    priority: "normal",
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
    setForm({ ...form, [e.target.name]: e.target.value });
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
          bg: "bg-red-50",
          text: "text-red-700",
          border: "border-red-400",
          badgeBg: "bg-red-100",
          dotColor: "bg-red-500",
          icon: <AlertTriangle className="w-5 h-5" />,
          label: "Urgent",
        };
      case "important":
        return {
          bg: "bg-amber-50",
          text: "text-amber-700",
          border: "border-amber-400",
          badgeBg: "bg-amber-100",
          dotColor: "bg-amber-500",
          icon: <Shield className="w-5 h-5" />,
          label: "Important",
        };
      default:
        return {
          bg: "bg-blue-50",
          text: "text-blue-700",
          border: "border-blue-300",
          badgeBg: "bg-blue-100",
          dotColor: "bg-blue-500",
          icon: <Info className="w-5 h-5" />,
          label: "Normal",
        };
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatFullDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const canManageNotices = user?.role === "admin" || user?.role === "faculty";

  const filteredNotices = notices.filter((notice) => {
    const matchesSearch =
      notice.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      notice.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPriority =
      filterPriority === "all" || notice.priority === filterPriority;
    return matchesSearch && matchesPriority;
  });

  const urgentCount = notices.filter((n) => n.priority === "urgent").length;
  const importantCount = notices.filter(
    (n) => n.priority === "important"
  ).length;
  const normalCount = notices.filter((n) => n.priority === "normal").length;

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />

      <div className="flex-1 ml-64">
        {/* Top Section with gradient */}
        <div className="bg-gradient-to-br from-slate-800 via-slate-900 to-slate-800 px-8 pt-8 pb-20">
          <div className="max-w-5xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/10">
                  <Bell className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white tracking-tight">
                    Notice Board
                  </h1>
                  <p className="text-slate-400 text-sm mt-0.5">
                    {notices.length} announcement
                    {notices.length !== 1 ? "s" : ""} posted
                  </p>
                </div>
              </div>

              {canManageNotices && (
                <button
                  onClick={() => setShowForm(!showForm)}
                  className={`mt-4 sm:mt-0 inline-flex items-center gap-2 px-5 py-2.5 font-medium rounded-xl transition-all duration-200 shadow-lg ${
                    showForm
                      ? "bg-white/10 text-white border border-white/20 hover:bg-white/20"
                      : "bg-blue-600 text-white hover:bg-blue-500 shadow-blue-900/30"
                  }`}
                >
                  {showForm ? (
                    <>
                      <X className="w-4 h-4" /> Cancel
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" /> New Notice
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Main Content - Overlapping Cards */}
        <div className="max-w-5xl mx-auto px-8 -mt-12">
          {/* Stats Cards */}
          {notices.length > 0 && (
            <div className="grid grid-cols-3 gap-4 mb-6">
              <button
                onClick={() =>
                  setFilterPriority(
                    filterPriority === "normal" ? "all" : "normal"
                  )
                }
                className={`bg-white rounded-xl p-4 shadow-sm border transition-all duration-200 hover:shadow-md group ${
                  filterPriority === "normal"
                    ? "border-blue-300 ring-2 ring-blue-100"
                    : "border-gray-100"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Normal</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">
                      {normalCount}
                    </p>
                  </div>
                  <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Info className="w-5 h-5 text-blue-600" />
                  </div>
                </div>
              </button>

              <button
                onClick={() =>
                  setFilterPriority(
                    filterPriority === "important" ? "all" : "important"
                  )
                }
                className={`bg-white rounded-xl p-4 shadow-sm border transition-all duration-200 hover:shadow-md group ${
                  filterPriority === "important"
                    ? "border-amber-300 ring-2 ring-amber-100"
                    : "border-gray-100"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      Important
                    </p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">
                      {importantCount}
                    </p>
                  </div>
                  <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Shield className="w-5 h-5 text-amber-600" />
                  </div>
                </div>
              </button>

              <button
                onClick={() =>
                  setFilterPriority(
                    filterPriority === "urgent" ? "all" : "urgent"
                  )
                }
                className={`bg-white rounded-xl p-4 shadow-sm border transition-all duration-200 hover:shadow-md group ${
                  filterPriority === "urgent"
                    ? "border-red-300 ring-2 ring-red-100"
                    : "border-gray-100"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Urgent</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">
                      {urgentCount}
                    </p>
                  </div>
                  <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <AlertTriangle className="w-5 h-5 text-red-600" />
                  </div>
                </div>
              </button>
            </div>
          )}

          {/* Create Notice Form */}
          {canManageNotices && showForm && (
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 mb-6 animate-in slide-in-from-top duration-300">
              <div className="flex items-center gap-2 mb-5">
                <PenLine className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-semibold text-gray-900">
                  Create New Notice
                </h3>
              </div>

              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    name="title"
                    value={form.title}
                    placeholder="Enter a clear, descriptive title"
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50
                               focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent
                               transition-all text-gray-900 placeholder-gray-400"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Description <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="description"
                    value={form.description}
                    placeholder="Provide the details of your announcement..."
                    onChange={handleChange}
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50
                               focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent
                               transition-all resize-none text-gray-900 placeholder-gray-400"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Priority Level
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      {
                        value: "normal",
                        icon: Info,
                        activeClasses:
                          "border-blue-500 bg-blue-50 text-blue-700 shadow-sm shadow-blue-100",
                      },
                      {
                        value: "important",
                        icon: Shield,
                        activeClasses:
                          "border-amber-500 bg-amber-50 text-amber-700 shadow-sm shadow-amber-100",
                      },
                      {
                        value: "urgent",
                        icon: AlertTriangle,
                        activeClasses:
                          "border-red-500 bg-red-50 text-red-700 shadow-sm shadow-red-100",
                      },
                    ].map(({ value, icon: Icon, activeClasses }) => (
                      <label
                        key={value}
                        className={`relative flex items-center justify-center gap-2 cursor-pointer rounded-xl border-2 p-3 transition-all duration-200 ${
                          form.priority === value
                            ? activeClasses
                            : "border-gray-200 text-gray-500 hover:border-gray-300 hover:bg-gray-50"
                        }`}
                      >
                        <input
                          type="radio"
                          name="priority"
                          value={value}
                          checked={form.priority === value}
                          onChange={handleChange}
                          className="sr-only"
                        />
                        <Icon className="w-4 h-4" />
                        <span className="font-medium capitalize text-sm">
                          {value}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
                  <button
                    onClick={() => {
                      setShowForm(false);
                      setForm({
                        title: "",
                        description: "",
                        priority: "normal",
                      });
                    }}
                    className="px-5 py-2.5 text-gray-600 font-medium rounded-xl hover:bg-gray-100 transition-colors"
                  >
                    Discard
                  </button>
                  <button
                    onClick={createNotice}
                    disabled={creating}
                    className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white font-medium
                               rounded-xl hover:bg-blue-700 focus:ring-4 focus:ring-blue-200 transition-all
                               disabled:opacity-50 disabled:cursor-not-allowed shadow-sm shadow-blue-200"
                  >
                    {creating ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />{" "}
                        Publishing...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" /> Publish Notice
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Search Bar */}
          {notices.length > 0 && (
            <div className="flex items-center gap-3 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search notices..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl bg-white
                             text-sm text-gray-700 placeholder-gray-400
                             focus:ring-2 focus:ring-blue-500 focus:border-transparent
                             shadow-sm transition-all"
                />
              </div>
              {(filterPriority !== "all" || searchQuery) && (
                <button
                  onClick={() => {
                    setFilterPriority("all");
                    setSearchQuery("");
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-2.5 text-sm font-medium text-gray-500
                             bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors shadow-sm"
                >
                  <X className="w-3.5 h-3.5" /> Clear filters
                </button>
              )}
            </div>
          )}

          {/* Notices List */}
          {loading ? (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-16">
              <div className="flex flex-col items-center justify-center">
                <Loader2 className="w-10 h-10 text-blue-600 animate-spin mb-4" />
                <p className="text-gray-500 font-medium">Loading notices...</p>
              </div>
            </div>
          ) : filteredNotices.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-16 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Inbox className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                {searchQuery || filterPriority !== "all"
                  ? "No matching notices"
                  : "No notices yet"}
              </h3>
              <p className="text-gray-500 text-sm">
                {searchQuery || filterPriority !== "all"
                  ? "Try adjusting your search or filter criteria"
                  : canManageNotices
                  ? "Create your first notice to get started"
                  : "Check back later for announcements"}
              </p>
              {(searchQuery || filterPriority !== "all") && (
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setFilterPriority("all");
                  }}
                  className="mt-4 text-sm text-blue-600 hover:text-blue-700 font-medium hover:underline"
                >
                  Clear all filters
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-3 pb-8">
              {filteredNotices.map((notice) => {
                const config = getPriorityConfig(notice.priority);
                const isExpanded = expandedNotice === notice._id;

                return (
                  <div
                    key={notice._id}
                    className={`bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden
                                hover:shadow-md transition-all duration-200 group`}
                  >
                    {/* Priority accent line */}
                    <div className={`h-1 w-full ${config.dotColor}`} />

                    <div className="p-5">
                      {/* Header Row */}
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3 flex-1 min-w-0">
                          <div
                            className={`p-2.5 rounded-xl ${config.bg} ${config.text} shrink-0 mt-0.5`}
                          >
                            {config.icon}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="text-base font-semibold text-gray-900 truncate">
                                {notice.title}
                              </h3>
                              <span
                                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${config.badgeBg} ${config.text}`}
                              >
                                <span
                                  className={`w-1.5 h-1.5 rounded-full ${config.dotColor}`}
                                />
                                {config.label}
                              </span>
                            </div>

                            {/* Preview / Full Description */}
                            <p
                              className={`mt-2 text-sm text-gray-600 leading-relaxed ${
                                !isExpanded ? "line-clamp-2" : ""
                              }`}
                            >
                              {notice.description}
                            </p>

                            {notice.description.length > 150 && (
                              <button
                                onClick={() =>
                                  setExpandedNotice(
                                    isExpanded ? null : notice._id
                                  )
                                }
                                className="mt-1.5 inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-700 transition-colors"
                              >
                                {isExpanded ? "Show less" : "Read more"}
                                <ChevronDown
                                  className={`w-3 h-3 transition-transform duration-200 ${
                                    isExpanded ? "rotate-180" : ""
                                  }`}
                                />
                              </button>
                            )}
                          </div>
                        </div>

                        {canManageNotices && (
                          <button
                            onClick={() => deleteNotice(notice._id)}
                            className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl
                                       transition-all duration-200 opacity-0 group-hover:opacity-100 shrink-0"
                            title="Delete notice"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>

                      {/* Footer */}
                      <div className="mt-4 pt-3 border-t border-gray-50 flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div
                            className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600
                                          flex items-center justify-center text-white text-xs font-bold shadow-sm"
                          >
                            {notice.createdBy?.name
                              ?.charAt(0)
                              .toUpperCase() || "?"}
                          </div>
                          <div className="leading-tight">
                            <p className="text-sm font-medium text-gray-800">
                              {notice.createdBy?.name || "Unknown"}
                            </p>
                            <p className="text-xs text-gray-400 capitalize">
                              {notice.createdBy?.role}
                            </p>
                          </div>
                        </div>

                        <div
                          className="flex items-center gap-1.5 text-xs text-gray-400"
                          title={formatFullDate(notice.createdAt)}
                        >
                          <Clock className="w-3.5 h-3.5" />
                          {formatDate(notice.createdAt)}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}