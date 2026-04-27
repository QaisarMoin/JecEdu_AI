import { useEffect, useState, useMemo } from "react";
import Sidebar from "../components/Navbar";
import API from "../services/api";

export default function AdminSubjects() {
  const [subjects, setSubjects] = useState([]);
  const [facultyList, setFacultyList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingSubject, setEditingSubject] = useState(null);

  // ── New filter state ──────────────────────────────────
  const [selectedSemester, setSelectedSemester] = useState("all");
  const [selectedFaculty, setSelectedFaculty] = useState("all");
  const [selectedDepartment, setSelectedDepartment] = useState("all");

  const [form, setForm] = useState({
    name: "",
    code: "",
    faculty: "",
    department: "",
    semester: "",
  });

  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    if (user.role !== "admin") {
      alert("Access denied");
      return;
    }
    fetchSubjects();
    fetchFaculty();
  }, []);

  const fetchSubjects = async () => {
    setLoading(true);
    try {
      const res = await API.get("/subjects");
      setSubjects(res.data);
    } catch {
      alert("Error fetching subjects");
    } finally {
      setLoading(false);
    }
  };

  const fetchFaculty = async () => {
    try {
      const res = await API.get("/users/faculty");
      setFacultyList(res.data);
    } catch {
      alert("Error fetching faculty");
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const createSubject = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      if (editingSubject) {
        await API.put(`/subjects/${editingSubject._id}`, form);
        alert("Subject updated successfully");
      } else {
        await API.post("/subjects", form);
        alert("Subject created successfully");
      }
      setForm({ name: "", code: "", faculty: "", department: "", semester: "" });
      setShowForm(false);
      setEditingSubject(null);
      fetchSubjects();
    } catch {
      alert(editingSubject ? "Error updating subject" : "Error creating subject");
    } finally {
      setCreating(false);
    }
  };

  const handleEdit = (subject) => {
    setEditingSubject(subject);
    setForm({
      name: subject.name,
      code: subject.code,
      faculty: subject.faculty?._id || subject.faculty || "",
      department: subject.department,
      semester: subject.semester,
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this subject?")) {
      try {
        await API.delete(`/subjects/${id}`);
        fetchSubjects();
      } catch {
        alert("Error deleting subject");
      }
    }
  };

  // ── Derived filter options ────────────────────────────

  const availableSemesters = useMemo(() => {
    const sems = [...new Set(subjects.map((s) => s.semester).filter(Boolean))];
    return sems.sort((a, b) => Number(a) - Number(b));
  }, [subjects]);

  const availableDepartments = useMemo(() => {
    return [...new Set(subjects.map((s) => s.department).filter(Boolean))].sort();
  }, [subjects]);

  // Faculty that actually teach at least one subject
  const activeFaculty = useMemo(() => {
    const map = {};
    subjects.forEach((s) => {
      const f = s.faculty;
      if (f && f._id) map[f._id] = f;
    });
    return Object.values(map).sort((a, b) => a.name.localeCompare(b.name));
  }, [subjects]);

  // ── Filtered subjects ─────────────────────────────────

  const filteredSubjects = useMemo(() => {
    return subjects.filter((subject) => {
      const matchSearch =
        subject.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        subject.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (subject.department &&
          subject.department.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (subject.faculty?.name &&
          subject.faculty.name.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchSemester =
        selectedSemester === "all" ||
        String(subject.semester) === String(selectedSemester);

      const matchFaculty =
        selectedFaculty === "all" ||
        subject.faculty?._id === selectedFaculty ||
        subject.faculty === selectedFaculty;

      const matchDepartment =
        selectedDepartment === "all" ||
        subject.department === selectedDepartment;

      return matchSearch && matchSemester && matchFaculty && matchDepartment;
    });
  }, [subjects, searchTerm, selectedSemester, selectedFaculty, selectedDepartment]);

  const hasActiveFilters =
    searchTerm ||
    selectedSemester !== "all" ||
    selectedFaculty !== "all" ||
    selectedDepartment !== "all";

  const clearAllFilters = () => {
    setSearchTerm("");
    setSelectedSemester("all");
    setSelectedFaculty("all");
    setSelectedDepartment("all");
  };

  const getSemesterColor = (semester) => {
    const colors = [
      "bg-blue-100 text-blue-700 border-blue-200",
      "bg-emerald-100 text-emerald-700 border-emerald-200",
      "bg-violet-100 text-violet-700 border-violet-200",
      "bg-amber-100 text-amber-700 border-amber-200",
      "bg-rose-100 text-rose-700 border-rose-200",
      "bg-cyan-100 text-cyan-700 border-cyan-200",
      "bg-indigo-100 text-indigo-700 border-indigo-200",
      "bg-teal-100 text-teal-700 border-teal-200",
    ];
    const num = parseInt(semester);
    if (!isNaN(num) && num >= 1 && num <= 8) return colors[num - 1];
    return "bg-gray-100 text-gray-700 border-gray-200";
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />

      <div className="flex-1 p-4 lg:p-8 lg:ml-64 pt-20 lg:pt-8 overflow-x-hidden">

        {/* ── Page Header ───────────────────────────────── */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/25">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                Subject Management
              </h1>
              <p className="mt-2 text-gray-500 ml-13">
                Create and manage department subjects and faculty assignments
              </p>
            </div>

            <button
              onClick={() => {
                setShowForm(!showForm);
                if (showForm) {
                  setEditingSubject(null);
                  setForm({ name: "", code: "", faculty: "", department: "", semester: "" });
                }
              }}
              className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm shadow-lg transition-all duration-200 ${
                showForm
                  ? "bg-gray-200 text-gray-700 hover:bg-gray-300 shadow-gray-200/50"
                  : "bg-gradient-to-r from-indigo-600 to-blue-600 text-white hover:from-indigo-700 hover:to-blue-700 shadow-indigo-500/30"
              }`}
            >
              {showForm ? (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  {editingSubject ? "Cancel Edit" : "Cancel"}
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add Subject
                </>
              )}
            </button>
          </div>
        </div>

        {/* ── Create / Edit Form ────────────────────────── */}
        {showForm && (
          <div className="mb-10 bg-white border border-gray-100 rounded-2xl shadow-2xl overflow-hidden">
            <div className="bg-gradient-to-r from-indigo-600 to-blue-600 px-6 py-4">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {editingSubject ? "Edit Subject" : "Create New Subject"}
              </h2>
              <p className="text-indigo-100 text-sm mt-1">
                {editingSubject
                  ? "Update the details of the existing subject"
                  : "Fill in the details below to add a new subject"}
              </p>
            </div>

            <form onSubmit={createSubject} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Subject Name */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Subject Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                          d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                    </div>
                    <input name="name" placeholder="e.g. Data Structures & Algorithms"
                      value={form.name} onChange={handleChange} required
                      className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all duration-200 hover:border-gray-300" />
                  </div>
                </div>

                {/* Subject Code */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Subject Code <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                      </svg>
                    </div>
                    <input name="code" placeholder="e.g. CS301" value={form.code}
                      onChange={handleChange} required
                      className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all duration-200 hover:border-gray-300 uppercase" />
                  </div>
                </div>

                {/* Faculty */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Assign Faculty <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <select name="faculty" value={form.faculty} onChange={handleChange} required
                      className="w-full pl-11 pr-10 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all duration-200 hover:border-gray-300 appearance-none cursor-pointer">
                      <option value="">Select Faculty</option>
                      {facultyList.map((f) => (
                        <option key={f._id} value={f._id}>{f.name} ({f.email})</option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none">
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Department */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Department <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                          d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    </div>
                    <input name="department" placeholder="e.g. Computer Science"
                      value={form.department} onChange={handleChange} required
                      className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all duration-200 hover:border-gray-300" />
                  </div>
                </div>

                {/* Semester */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Semester <span className="text-red-500">*</span>
                  </label>
                  <div className="relative max-w-xs">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <input name="semester" placeholder="e.g. 5" value={form.semester}
                      onChange={handleChange} required type="number" min="1" max="8"
                      className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all duration-200 hover:border-gray-300" />
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 mt-8 pt-6 border-t border-gray-100">
                <button type="submit" disabled={creating}
                  className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-semibold rounded-xl shadow-lg shadow-indigo-500/30 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed">
                  {creating ? (
                    <>
                      <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      {editingSubject ? "Updating..." : "Creating..."}
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {editingSubject ? "Update Subject" : "Create Subject"}
                    </>
                  )}
                </button>
                <button type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingSubject(null);
                    setForm({ name: "", code: "", faculty: "", department: "", semester: "" });
                  }}
                  className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-all duration-200">
                  Discard
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ── Stats Cards ───────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {[
            {
              label: "Total Subjects", value: subjects.length,
              color: "indigo",
              icon: (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              ),
            },
            {
              label: "Faculty Members", value: facultyList.length,
              color: "emerald",
              icon: (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              ),
            },
            {
              label: "Departments",
              value: [...new Set(subjects.map((s) => s.department).filter(Boolean))].length,
              color: "amber",
              icon: (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              ),
            },
          ].map(({ label, value, color, icon }) => (
            <div key={label} className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 bg-${color}-50 rounded-xl flex items-center justify-center`}>
                  <svg className={`w-6 h-6 text-${color}-600`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {icon}
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-medium">{label}</p>
                  <p className="text-2xl font-bold text-gray-900">{value}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ── Filter & Search Panel ─────────────────────── */}
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-5 mb-6">
          <div className="flex flex-col gap-4">

            {/* Row 1: Search */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search by subject name, code, department or faculty..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all duration-200"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>

            {/* Row 2: Dropdown filters */}
            <div className="flex flex-wrap gap-3 items-center">
              {/* Semester filter */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-gray-500 whitespace-nowrap">Semester:</span>
                <div className="flex flex-wrap gap-1.5">
                  <FilterPill
                    active={selectedSemester === "all"}
                    onClick={() => setSelectedSemester("all")}
                    label="All"
                  />
                  {availableSemesters.map((sem) => (
                    <FilterPill
                      key={sem}
                      active={selectedSemester === String(sem)}
                      onClick={() => setSelectedSemester(String(sem))}
                      label={`Sem ${sem}`}
                      color={getSemesterPillColor(sem)}
                    />
                  ))}
                </div>
              </div>

              {/* Divider */}
              <div className="hidden sm:block w-px h-6 bg-gray-200" />

              {/* Department filter */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-gray-500 whitespace-nowrap">Dept:</span>
                <select
                  value={selectedDepartment}
                  onChange={(e) => setSelectedDepartment(e.target.value)}
                  className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-all cursor-pointer"
                >
                  <option value="all">All Departments</option>
                  {availableDepartments.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              {/* Divider */}
              <div className="hidden sm:block w-px h-6 bg-gray-200" />

              {/* Faculty filter */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-gray-500 whitespace-nowrap">Faculty:</span>
                <select
                  value={selectedFaculty}
                  onChange={(e) => setSelectedFaculty(e.target.value)}
                  className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-all cursor-pointer max-w-[200px]"
                >
                  <option value="all">All Faculty</option>
                  {activeFaculty.map((f) => (
                    <option key={f._id} value={f._id}>{f.name}</option>
                  ))}
                </select>
              </div>

              {/* Clear filters */}
              {hasActiveFilters && (
                <button
                  onClick={clearAllFilters}
                  className="ml-auto flex items-center gap-1.5 text-xs font-semibold text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg transition-colors"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Clear All
                </button>
              )}
            </div>

            {/* Active filter summary */}
            {hasActiveFilters && (
              <div className="flex flex-wrap gap-2 pt-1 border-t border-gray-100">
                <span className="text-[11px] text-gray-400 font-medium self-center">Active filters:</span>
                {searchTerm && (
                  <ActiveFilterTag
                    label={`Search: "${searchTerm}"`}
                    onRemove={() => setSearchTerm("")}
                  />
                )}
                {selectedSemester !== "all" && (
                  <ActiveFilterTag
                    label={`Semester ${selectedSemester}`}
                    onRemove={() => setSelectedSemester("all")}
                  />
                )}
                {selectedDepartment !== "all" && (
                  <ActiveFilterTag
                    label={`Dept: ${selectedDepartment}`}
                    onRemove={() => setSelectedDepartment("all")}
                  />
                )}
                {selectedFaculty !== "all" && (
                  <ActiveFilterTag
                    label={`Faculty: ${activeFaculty.find((f) => f._id === selectedFaculty)?.name || "?"}`}
                    onRemove={() => setSelectedFaculty("all")}
                  />
                )}
                <span className="text-[11px] text-indigo-600 font-semibold self-center ml-auto">
                  {filteredSubjects.length} result{filteredSubjects.length !== 1 && "s"}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* ── Subjects Table ────────────────────────────── */}
        <div className="bg-white border border-gray-100 rounded-2xl shadow-xl overflow-hidden mb-12">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
              All Subjects
              <span className="ml-2 px-2.5 py-0.5 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">
                {filteredSubjects.length}
                {hasActiveFilters && subjects.length !== filteredSubjects.length && (
                  <span className="text-gray-400"> of {subjects.length}</span>
                )}
              </span>
            </h2>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <svg className="animate-spin h-10 w-10 text-indigo-500 mb-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <p className="text-gray-500 font-medium">Loading subjects...</p>
            </div>
          ) : filteredSubjects.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 px-6">
              <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mb-5">
                <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-1">
                {hasActiveFilters ? "No subjects match your filters" : "No subjects yet"}
              </h3>
              <p className="text-gray-500 text-sm text-center max-w-sm">
                {hasActiveFilters
                  ? "Try adjusting your search or filter criteria."
                  : 'Click "Add Subject" to create your first subject.'}
              </p>
              {hasActiveFilters && (
                <button
                  onClick={clearAllFilters}
                  className="mt-4 text-sm text-indigo-600 hover:text-indigo-700 font-semibold underline underline-offset-2"
                >
                  Clear all filters
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse min-w-[800px] md:min-w-full">
                <thead>
                  <tr className="bg-gray-50/80">
                    {[
                      { label: "Subject", always: true },
                      { label: "Code", cls: "hidden md:table-cell" },
                      { label: "Faculty", cls: "hidden lg:table-cell" },
                      { label: "Department", cls: "hidden sm:table-cell" },
                      { label: "Semester", always: true },
                      { label: "Actions", right: true },
                    ].map(({ label, cls = "", always, right }) => (
                      <th key={label}
                        className={`px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider ${right ? "text-right" : "text-left"} ${cls}`}>
                        {label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredSubjects.map((subject) => (
                    <tr key={subject._id} className="hover:bg-indigo-50/40 transition-colors duration-150">
                      {/* Subject name */}
                      <td className="px-4 py-4">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-indigo-100 to-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                            <span className="text-sm font-bold text-indigo-600">
                              {subject.name?.charAt(0)?.toUpperCase()}
                            </span>
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-gray-900 text-sm">{subject.name}</p>
                            <p className="text-xs text-gray-500">{subject.code}</p>
                            {/* Mobile actions */}
                            <div className="flex gap-2 mt-2 sm:hidden">
                              <button onClick={() => handleEdit(subject)}
                                className="text-xs text-indigo-600 font-semibold bg-indigo-50 px-2.5 py-1 rounded-lg hover:bg-indigo-100">
                                Edit
                              </button>
                              <button onClick={() => handleDelete(subject._id)}
                                className="text-xs text-red-500 font-semibold bg-red-50 px-2.5 py-1 rounded-lg hover:bg-red-100">
                                Delete
                              </button>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Code */}
                      <td className="px-6 py-4 hidden md:table-cell">
                        <span className="inline-flex items-center px-2.5 py-1 bg-gray-100 text-gray-700 text-xs font-mono font-semibold rounded-lg">
                          {subject.code}
                        </span>
                      </td>

                      {/* Faculty */}
                      <td className="px-6 py-4 hidden lg:table-cell">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <svg className="w-3.5 h-3.5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                          </div>
                          <div>
                            <span className="text-sm text-gray-700 font-medium">
                              {subject.faculty?.name || (
                                <span className="text-gray-400 italic">Unassigned</span>
                              )}
                            </span>
                            {/* Highlight if this faculty is the active filter */}
                            {selectedFaculty !== "all" && subject.faculty?._id === selectedFaculty && (
                              <span className="ml-1.5 text-[10px] bg-indigo-100 text-indigo-600 px-1.5 py-0.5 rounded font-semibold">
                                filtered
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Department */}
                      <td className="px-6 py-4 hidden sm:table-cell">
                        <span className="text-sm text-gray-600">
                          {subject.department || "—"}
                        </span>
                      </td>

                      {/* Semester */}
                      <td className="px-4 py-4">
                        <span className={`inline-flex items-center px-2.5 py-1 text-xs font-semibold rounded-lg border ${getSemesterColor(subject.semester)}`}>
                          Sem {subject.semester}
                        </span>
                      </td>

                      {/* Desktop actions */}
                      <td className="px-4 py-4 text-right hidden sm:table-cell">
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => handleEdit(subject)}
                            className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                            title="Edit Subject">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button onClick={() => handleDelete(subject._id)}
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete Subject">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


// ─── FILTER PILL ─────────────────────────────────────────

function FilterPill({ active, onClick, label, color }) {
  return (
    <button
      onClick={onClick}
      className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all duration-150 ${
        active
          ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
          : color
            ? `${color} border-transparent hover:border-gray-300`
            : "bg-gray-100 text-gray-600 border-transparent hover:bg-gray-200"
      }`}
    >
      {label}
    </button>
  );
}


// ─── ACTIVE FILTER TAG ───────────────────────────────────

function ActiveFilterTag({ label, onRemove }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-[11px] font-medium bg-indigo-50 text-indigo-700 border border-indigo-100 px-2.5 py-1 rounded-lg">
      {label}
      <button
        onClick={onRemove}
        className="text-indigo-400 hover:text-indigo-700 transition-colors"
      >
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </span>
  );
}


// ─── HELPERS ─────────────────────────────────────────────

function getSemesterColor(semester) {
  const colors = [
    "bg-blue-100 text-blue-700 border-blue-200",
    "bg-emerald-100 text-emerald-700 border-emerald-200",
    "bg-violet-100 text-violet-700 border-violet-200",
    "bg-amber-100 text-amber-700 border-amber-200",
    "bg-rose-100 text-rose-700 border-rose-200",
    "bg-cyan-100 text-cyan-700 border-cyan-200",
    "bg-indigo-100 text-indigo-700 border-indigo-200",
    "bg-teal-100 text-teal-700 border-teal-200",
  ];
  const num = parseInt(semester);
  if (!isNaN(num) && num >= 1 && num <= 8) return colors[num - 1];
  return "bg-gray-100 text-gray-700 border-gray-200";
}

function getSemesterPillColor(semester) {
  const colors = [
    "bg-blue-50 text-blue-700",
    "bg-emerald-50 text-emerald-700",
    "bg-violet-50 text-violet-700",
    "bg-amber-50 text-amber-700",
    "bg-rose-50 text-rose-700",
    "bg-cyan-50 text-cyan-700",
    "bg-indigo-50 text-indigo-700",
    "bg-teal-50 text-teal-700",
  ];
  const num = parseInt(semester);
  if (!isNaN(num) && num >= 1 && num <= 8) return colors[num - 1];
  return "bg-gray-50 text-gray-600";
}