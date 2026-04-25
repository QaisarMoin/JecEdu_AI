import { useEffect, useState } from "react";
import API from "../services/api";
import Sidebar from "../components/Navbar";
import { BookOpen, Code, User, Search, Loader2, AlertCircle } from "lucide-react";

export default function Subjects() {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchSubjects();
  }, []);

  const fetchSubjects = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await API.get("/subjects/student");
      setSubjects(res.data);
    } catch (err) {
      setError("Failed to load subjects. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const filteredSubjects = subjects.filter(
    (subject) =>
      subject.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      subject.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />

      <div className="flex-1 p-6 lg:p-8 ml-64">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-1">
            <div className="p-2 bg-blue-100 rounded-lg">
              <BookOpen className="w-6 h-6 text-blue-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-800">My Subjects</h1>
          </div>
          <p className="text-gray-500 ml-14">
            You are enrolled in{" "}
            <span className="font-semibold text-blue-600">{subjects.length}</span>{" "}
            subject{subjects.length !== 1 ? "s" : ""}
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative mb-6 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name or code..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white
                       text-sm text-gray-700 placeholder-gray-400
                       focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                       shadow-sm transition"
          />
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-24 text-gray-400">
            <Loader2 className="w-10 h-10 animate-spin mb-3 text-blue-500" />
            <p className="text-sm">Loading your subjects...</p>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-700
                          rounded-xl px-5 py-4 max-w-lg shadow-sm">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <div>
              <p className="font-medium">Something went wrong</p>
              <p className="text-sm text-red-500">{error}</p>
            </div>
            <button
              onClick={fetchSubjects}
              className="ml-auto text-sm font-medium underline hover:text-red-900 transition"
            >
              Retry
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && filteredSubjects.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-gray-400">
            <BookOpen className="w-12 h-12 mb-3 text-gray-300" />
            <p className="text-lg font-medium text-gray-500">
              {searchQuery ? "No subjects match your search" : "No subjects found"}
            </p>
            <p className="text-sm mt-1">
              {searchQuery
                ? "Try a different keyword"
                : "You are not enrolled in any subjects yet"}
            </p>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="mt-4 text-sm text-blue-600 hover:underline"
              >
                Clear search
              </button>
            )}
          </div>
        )}

        {/* Subjects Grid */}
        {!loading && !error && filteredSubjects.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredSubjects.map((subject, index) => (
              <div
                key={subject._id}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm
                           hover:shadow-md hover:-translate-y-1 transition-all duration-200
                           overflow-hidden group"
              >
                {/* Card Color Bar */}
                <div
                  className={`h-2 w-full ${getColorBar(index)}`}
                />

                <div className="p-5">
                  {/* Subject Name */}
                  <h3 className="text-base font-semibold text-gray-800 mb-3 group-hover:text-blue-600 transition-colors line-clamp-2">
                    {subject.name}
                  </h3>

                  <div className="flex flex-wrap gap-2">
                    {/* Subject Code Badge */}
                    <span className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-700
                                     text-xs font-medium px-3 py-1 rounded-full border border-blue-100">
                      <Code className="w-3 h-3" />
                      {subject.code}
                    </span>

                    {/* Teacher Badge */}
                    {subject.teacher && (
                      <span className="inline-flex items-center gap-1.5 bg-gray-100 text-gray-600
                                       text-xs font-medium px-3 py-1 rounded-full">
                        <User className="w-3 h-3" />
                        {subject.teacher.name ?? subject.teacher}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Cycles through a set of tailwind gradient colors for visual variety
function getColorBar(index) {
  const colors = [
    "bg-blue-400",
    "bg-purple-400",
    "bg-emerald-400",
    "bg-orange-400",
    "bg-pink-400",
    "bg-cyan-400",
    "bg-yellow-400",
    "bg-rose-400",
  ];
  return colors[index % colors.length];
}