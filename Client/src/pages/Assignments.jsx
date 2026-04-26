import { useEffect, useState } from "react";
import Sidebar from "../components/Navbar";
import API from "../services/api";
import {
  FileText,
  Plus,
  X,
  Calendar,
  BookOpen,
  User,
  Trash2,
  Clock,
  Inbox,
  Loader2,
  Send,
  Search,
  Filter
} from "lucide-react";

export default function Assignments() {
  const [assignments, setAssignments] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [creating, setCreating] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  const [form, setForm] = useState({
    title: "",
    description: "",
    subject: "",
    department: "IT",
    semester: "",
    startDate: "",
    endDate: ""
  });

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const isFaculty = user.role === "faculty";
  const isAdmin = user.role === "admin";

  useEffect(() => {
    fetchAssignments();
    if (isFaculty || isAdmin) {
      fetchSubjects();
    }
  }, []);

  const fetchAssignments = async () => {
    setLoading(true);
    try {
      const res = await API.get("/assignments");
      setAssignments(res.data);
    } catch (error) {
      console.error("Error fetching assignments:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSubjects = async () => {
    try {
      const res = await API.get("/subjects");
      setSubjects(res.data);
    } catch (error) {
      console.error("Error fetching subjects:", error);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.title || !form.subject || !form.startDate || !form.endDate || !form.department || !form.semester) {
      alert("Please fill in all required fields");
      return;
    }

    setCreating(true);
    try {
      await API.post("/assignments", form);
      setForm({
        title: "",
        description: "",
        subject: "",
        department: "IT",
        semester: "",
        startDate: "",
        endDate: ""
      });
      setShowForm(false);
      fetchAssignments();
    } catch (error) {
      alert(error.response?.data?.message || "Failed to create assignment");
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this assignment?")) return;
    setDeleteLoading(id);
    try {
      await API.delete(`/assignments/${id}`);
      setAssignments(assignments.filter(a => a._id !== id));
    } catch (error) {
      alert("Failed to delete assignment");
    } finally {
      setDeleteLoading(null);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric"
    });
  };

  const filteredAssignments = assignments.filter(a => 
    a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.subject?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.subject?.code?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />

      <div className="flex-1 ml-64">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-indigo-700 to-blue-600 px-8 pt-10 pb-20">
          <div className="max-w-6xl mx-auto">
            <div className="flex justify-between items-end">
              <div>
                <div className="flex items-center gap-3 mb-2 text-indigo-100">
                  <FileText className="w-5 h-5" />
                  <span className="text-sm font-medium tracking-wider uppercase">Academic Portal</span>
                </div>
                <h1 className="text-3xl font-bold text-white tracking-tight">Assignments</h1>
                <p className="text-indigo-100/80 mt-2 max-w-lg">
                  {isFaculty 
                    ? "Manage and track assignments for your classes." 
                    : "View all active assignments and deadlines for your semester."}
                </p>
              </div>

              {(isFaculty || isAdmin) && (
                <button
                  onClick={() => setShowForm(!showForm)}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold transition-all shadow-lg ${
                    showForm 
                    ? "bg-white/10 text-white backdrop-blur-md border border-white/20" 
                    : "bg-white text-indigo-700 hover:bg-indigo-50"
                  }`}
                >
                  {showForm ? <X className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                  {showForm ? "Cancel" : "New Assignment"}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-6xl mx-auto px-8 -mt-10">
          
          {/* Create Form */}
          {showForm && (isFaculty || isAdmin) && (
            <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 p-8 mb-10 animate-in slide-in-from-top-4 duration-300">
              <h2 className="text-2xl font-bold text-gray-800 mb-8 flex items-center gap-3">
                <div className="p-2 bg-indigo-50 rounded-lg">
                  <Plus className="w-5 h-5 text-indigo-600" />
                </div>
                Post New Assignment
              </h2>
              <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Assignment Title</label>
                  <input
                    type="text"
                    required
                    onChange={(e) => setForm({...form, title: e.target.value})}
                    placeholder="e.g. Unit 1 Project - Architecture Draft"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all bg-gray-50/50"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2 font-medium">Instructions / Description</label>
                  <textarea
                    rows={4}
                    value={form.description}
                    onChange={(e) => setForm({...form, description: e.target.value})}
                    placeholder="Provide details about the assignment..."
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all resize-none bg-gray-50/50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Subject</label>
                  <select
                    required
                    value={form.subject}
                    onChange={(e) => setForm({...form, subject: e.target.value})}
                    className="w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                  >
                    <option value="">Select Subject</option>
                    {subjects.map(s => (
                      <option key={s._id} value={s._id}>{s.code} - {s.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Start Date</label>
                  <input
                    type="date"
                    required
                    value={form.startDate}
                    onChange={(e) => setForm({...form, startDate: e.target.value})}
                    className="w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">End Date</label>
                  <input
                    type="date"
                    required
                    value={form.endDate}
                    onChange={(e) => setForm({...form, endDate: e.target.value})}
                    className="w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Semester</label>
                  <select
                    required
                    value={form.semester}
                    onChange={(e) => setForm({...form, semester: e.target.value})}
                    className="w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                  >
                    <option value="">Select Semester</option>
                    {[1,2,3,4,5,6,7,8].map(s => (
                      <option key={s} value={s}>Semester {s}</option>
                    ))}
                  </select>
                </div>

                <div className="col-span-2 flex justify-end gap-3 pt-4">
                  <button
                    type="submit"
                    disabled={creating}
                    className="px-8 py-2.5 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg flex items-center gap-2"
                  >
                    {creating ? <Loader2 className="animate-spin w-4 h-4" /> : <Send className="w-4 h-4" />}
                    {creating ? "Posting..." : "Post Assignment"}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* List Section */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden min-h-[400px] mb-20">
            <div className="p-6 border-b border-gray-100 bg-gray-50/30 flex items-center justify-between">
              <div className="relative max-w-sm w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search assignments..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-1.5 border rounded-lg text-sm bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
              <div className="flex items-center gap-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                <span>{filteredAssignments.length} Assignments Found</span>
              </div>
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mb-4" />
                <p className="text-gray-500">Loading assignments...</p>
              </div>
            ) : filteredAssignments.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <Inbox className="w-10 h-10 text-gray-300" />
                </div>
                <h3 className="text-lg font-bold text-gray-700">No Assignments Yet</h3>
                <p className="text-gray-400 max-w-xs mt-1">
                  Once teachers post assignments, they will appear here for your class.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
                {filteredAssignments.map(assignment => (
                  <div 
                    key={assignment._id}
                    className="bg-white border border-gray-100 rounded-2xl p-6 hover:shadow-2xl transition-all duration-500 group relative overflow-hidden flex flex-col"
                  >
                    {/* Header: Subject Label */}
                    <div className="flex items-center justify-between mb-4">
                      <span className="px-3 py-1 bg-indigo-50 text-indigo-600 text-[10px] font-bold uppercase rounded-full tracking-wider border border-indigo-100">
                        {assignment.subject?.code}
                      </span>
                      <div className="flex items-center gap-1.5 text-gray-400">
                        <Clock className="w-3.5 h-3.5" />
                        <span className="text-[10px] font-medium">{formatDate(assignment.createdAt)}</span>
                      </div>
                    </div>

                    <h3 className="text-lg font-bold text-gray-800 mb-2 group-hover:text-indigo-600 transition-colors">
                      {assignment.title}
                    </h3>
                    
                    <p className="text-sm text-gray-500 mb-6 line-clamp-3 leading-relaxed flex-1">
                      {assignment.description || "No description provided."}
                    </p>

                    <div className="space-y-3 pt-4 border-t border-gray-50">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <User className="w-4 h-4 text-gray-300" />
                        <span className="font-medium text-xs">Prof. {assignment.faculty?.name}</span>
                      </div>
                      
                      <div className="flex flex-col gap-2 pt-4 border-t border-gray-50">
                        <div className="flex items-center gap-2 text-indigo-500">
                          <Calendar className="w-4 h-4" />
                          <span className="text-[10px] font-bold uppercase tracking-wider">Start: {formatDate(assignment.startDate)}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-red-500">
                            <Clock className="w-4 h-4" />
                            <span className="text-[10px] font-bold uppercase tracking-wider">End: {formatDate(assignment.endDate)}</span>
                          </div>
                          
                          {(isFaculty && assignment.faculty?._id === user.id) || isAdmin ? (
                            <button 
                              onClick={() => handleDelete(assignment._id)}
                              disabled={deleteLoading === assignment._id}
                              className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                            >
                              {deleteLoading === assignment._id ? <Loader2 className="animate-spin w-3.5 h-3.5" /> : <Trash2 className="w-3.5 h-3.5" />}
                            </button>
                          ) : null}
                        </div>
                      </div>

                      <div className="flex items-center gap-3 pt-2">
                        <span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">
                          SEM {assignment.semester}
                        </span>
                      </div>
                    </div>

                    {/* Progress Indicator (Dummy for visual appeal) */}
                    <div className="absolute top-0 left-0 w-1 h-full bg-indigo-600 opacity-0 group-hover:opacity-100 transition-all"></div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
