import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Navbar";
import API from "../services/api";
import {
  BookOpen, ChevronRight, Users, GraduationCap,
  BarChart3, Clock, Search, Filter,
  BookMarked, Layers, Hash, Building2,
  TrendingUp, AlertCircle, CheckCircle,
  Loader2, ArrowUpRight, X
} from "lucide-react";

export default function FacultySubjects() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user")) || {};

  const [subjects, setSubjects] = useState([]);
  const [attendanceStats, setAttendanceStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDept, setSelectedDept] = useState("All");

  useEffect(() => {
    fetchSubjects();
  }, []);

  const fetchSubjects = async () => {
    setLoading(true);
    try {
      const res = await API.get("/subjects/faculty");
      const subjectList = res.data || [];
      setSubjects(subjectList);
      fetchAttendanceStats(subjectList);
    } catch (err) {
      console.error("Failed to fetch subjects:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAttendanceStats = async (subjectList) => {
    setStatsLoading(true);
    try {
      const statsPromises = subjectList.map((s) =>
        API.get(`/attendance/subject/${s._id}/stats`).catch(() => ({ data: null }))
      );
      const results = await Promise.all(statsPromises);
      const statsMap = {};
      results.forEach((r, i) => {
        if (r.data) {
          statsMap[subjectList[i]._id] = r.data;
        }
      });
      setAttendanceStats(statsMap);
    } catch (err) {
      console.error("Failed to fetch attendance stats:", err);
    } finally {
      setStatsLoading(false);
    }
  };

  // ── Derived Data ──────────────────────────────────────

  const departments = useMemo(() => {
    const depts = ["All", ...new Set(subjects.map((s) => s.department).filter(Boolean))];
    return depts;
  }, [subjects]);

  const filteredSubjects = useMemo(() => {
    return subjects.filter((s) => {
      const matchSearch =
        s.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.code?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchDept = selectedDept === "All" || s.department === selectedDept;
      return matchSearch && matchDept;
    });
  }, [subjects, searchQuery, selectedDept]);

  // Group filtered subjects by semester, then department
  const groupedBySemester = useMemo(() => {
    const map = {};
    filteredSubjects.forEach((s) => {
      const sem = s.semester || "Unknown";
      const dept = s.department || "Unknown";
      if (!map[sem]) map[sem] = {};
      if (!map[sem][dept]) map[sem][dept] = [];
      map[sem][dept].push(s);
    });
    // Sort semesters numerically
    return Object.entries(map)
      .sort(([a], [b]) => Number(a) - Number(b))
      .map(([sem, depts]) => ({
        semester: sem,
        departments: Object.entries(depts).map(([dept, subs]) => ({
          department: dept,
          subjects: subs,
        })),
      }));
  }, [filteredSubjects]);

  // Overall stats
  const overallStats = useMemo(() => {
    const totalSubjects = subjects.length;
    const totalStudents = new Set(
      subjects.map((s) => `${s.department}-${s.semester}`)
    ).size;
    const semesters = new Set(subjects.map((s) => s.semester)).size;
    const depts = new Set(subjects.map((s) => s.department)).size;

    let totalAvg = 0;
    let statCount = 0;
    Object.values(attendanceStats).forEach((stat) => {
      if (stat?.averagePercentage !== undefined) {
        totalAvg += stat.averagePercentage;
        statCount++;
      }
    });

    return {
      totalSubjects,
      totalStudents,
      semesters,
      depts,
      avgAttendance: statCount > 0 ? (totalAvg / statCount).toFixed(1) : null,
    };
  }, [subjects, attendanceStats]);

  // ── Loading ───────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 lg:ml-64 flex items-center justify-center pt-16 lg:pt-0">
          <div className="text-center">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-blue-100 rounded-full mx-auto" />
              <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin absolute inset-0 mx-auto" />
            </div>
            <p className="text-sm text-gray-400 mt-6 font-medium">Loading your subjects...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 lg:ml-64 pt-16 lg:pt-0">

        {/* ── Hero Header ───────────────────────────────── */}
        <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900 px-4 lg:px-8 pt-8 pb-24 relative overflow-hidden">
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-40 -right-40 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl" />
            <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl" />
          </div>
          <div className="max-w-6xl mx-auto relative">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
              <div>
                <p className="text-sm text-indigo-300 font-medium mb-1 flex items-center gap-2">
                  <BookMarked className="w-4 h-4" />
                  Faculty Portal
                </p>
                <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                  My Subjects
                </h1>
                <p className="text-slate-400 text-sm mt-2">
                  All subjects you teach, organised by semester
                </p>
              </div>
              {/* Quick stats in header */}
              <div className="flex gap-3 flex-wrap">
                <HeaderBadge label="Subjects" value={overallStats.totalSubjects} icon={BookOpen} />
                <HeaderBadge label="Semesters" value={overallStats.semesters} icon={Layers} />
                <HeaderBadge label="Departments" value={overallStats.depts} icon={Building2} />
              </div>
            </div>
          </div>
        </div>

        {/* ── Main Content ──────────────────────────────── */}
        <div className="max-w-6xl mx-auto px-4 lg:px-8 -mt-16 pb-8 relative">

          {/* ── Overview Cards ────────────────────────── */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <OverviewCard
              label="Total Subjects"
              value={overallStats.totalSubjects}
              icon={BookOpen}
              color="indigo"
            />
            <OverviewCard
              label="Semesters"
              value={overallStats.semesters}
              icon={Layers}
              color="blue"
            />
            <OverviewCard
              label="Batches"
              value={overallStats.totalStudents}
              icon={GraduationCap}
              color="violet"
              sub="Dept-Sem combos"
            />
            <OverviewCard
              label="Avg Attendance"
              value={
                statsLoading
                  ? "..."
                  : overallStats.avgAttendance !== null
                    ? `${overallStats.avgAttendance}%`
                    : "—"
              }
              icon={BarChart3}
              color={
                overallStats.avgAttendance === null
                  ? "blue"
                  : overallStats.avgAttendance >= 75
                    ? "emerald"
                    : overallStats.avgAttendance >= 50
                      ? "amber"
                      : "rose"
              }
              sub="Across all subjects"
            />
          </div>

          {/* ── Search & Filter Bar ───────────────────── */}
          <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm mb-6 flex flex-col sm:flex-row gap-3">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by subject name or code..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300 transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Department Filter */}
            <div className="flex items-center gap-2 flex-wrap">
              <Filter className="w-4 h-4 text-gray-400 flex-shrink-0" />
              {departments.map((dept) => (
                <button
                  key={dept}
                  onClick={() => setSelectedDept(dept)}
                  className={`text-xs font-semibold px-3 py-2 rounded-xl transition-all ${
                    selectedDept === dept
                      ? "bg-indigo-600 text-white shadow-sm"
                      : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                  }`}
                >
                  {dept}
                </button>
              ))}
            </div>
          </div>

          {/* ── No Results ────────────────────────────── */}
          {groupedBySemester.length === 0 && (
            <div className="bg-white border border-gray-100 rounded-2xl p-16 shadow-sm text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <BookOpen className="w-8 h-8 text-gray-300" />
              </div>
              <p className="text-gray-500 font-semibold">
                {subjects.length === 0
                  ? "No subjects assigned to you yet"
                  : "No subjects match your search"}
              </p>
              <p className="text-gray-400 text-sm mt-1">
                {subjects.length === 0
                  ? "Contact the admin to get subjects assigned"
                  : "Try adjusting your search or filter"}
              </p>
              {(searchQuery || selectedDept !== "All") && (
                <button
                  onClick={() => { setSearchQuery(""); setSelectedDept("All"); }}
                  className="mt-4 text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                >
                  Clear filters
                </button>
              )}
            </div>
          )}

          {/* ── Semester Sections ─────────────────────── */}
          <div className="space-y-8">
            {groupedBySemester.map(({ semester, departments: deptGroups }) => (
              <SemesterSection
                key={semester}
                semester={semester}
                deptGroups={deptGroups}
                attendanceStats={attendanceStats}
                statsLoading={statsLoading}
                navigate={navigate}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}


// ─── SEMESTER SECTION ────────────────────────────────────

function SemesterSection({ semester, deptGroups, attendanceStats, statsLoading, navigate }) {
  const totalSubjectsInSem = deptGroups.reduce((sum, d) => sum + d.subjects.length, 0);

  // Compute average attendance for this semester
  const semStats = useMemo(() => {
    let total = 0, count = 0;
    deptGroups.forEach(({ subjects }) => {
      subjects.forEach((s) => {
        const stat = attendanceStats[s._id];
        if (stat?.averagePercentage !== undefined) {
          total += stat.averagePercentage;
          count++;
        }
      });
    });
    return count > 0 ? (total / count).toFixed(1) : null;
  }, [deptGroups, attendanceStats]);

  return (
    <div>
      {/* Semester Header */}
      <div className="flex items-center gap-4 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-md shadow-indigo-200">
            <span className="text-white font-bold text-sm">{semester}</span>
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-800">
              Semester {semester}
            </h2>
            <p className="text-xs text-gray-400">
              {totalSubjectsInSem} subject{totalSubjectsInSem !== 1 && "s"}
              {" · "}
              {deptGroups.length} department{deptGroups.length !== 1 && "s"}
            </p>
          </div>
        </div>

        {/* Semester avg attendance pill */}
        {semStats !== null && !statsLoading && (
          <div className={`ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold ${
            semStats >= 75
              ? "bg-emerald-100 text-emerald-700"
              : semStats >= 50
                ? "bg-amber-100 text-amber-700"
                : "bg-red-100 text-red-700"
          }`}>
            <BarChart3 className="w-3.5 h-3.5" />
            Avg {semStats}% attendance
          </div>
        )}

        <div className="flex-1 h-px bg-gray-100 ml-2" />
      </div>

      {/* Department groups within semester */}
      <div className="space-y-4">
        {deptGroups.map(({ department, subjects }) => (
          <DepartmentGroup
            key={department}
            department={department}
            semester={semester}
            subjects={subjects}
            attendanceStats={attendanceStats}
            statsLoading={statsLoading}
            navigate={navigate}
          />
        ))}
      </div>
    </div>
  );
}


// ─── DEPARTMENT GROUP ────────────────────────────────────

function DepartmentGroup({ department, semester, subjects, attendanceStats, statsLoading, navigate }) {
  const [expanded, setExpanded] = useState(true);

  return (
    <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
      {/* Department Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gray-100 rounded-xl flex items-center justify-center">
            <Building2 className="w-4 h-4 text-gray-500" />
          </div>
          <div className="text-left">
            <p className="text-sm font-bold text-gray-800">{department}</p>
            <p className="text-xs text-gray-400">
              {subjects.length} subject{subjects.length !== 1 && "s"}
            </p>
          </div>
        </div>
        <ChevronRight className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${expanded ? "rotate-90" : ""}`} />
      </button>

      {/* Subjects Grid */}
      {expanded && (
        <div className="px-4 pb-4 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
          {subjects.map((subject) => (
            <SubjectCard
              key={subject._id}
              subject={subject}
              stats={attendanceStats[subject._id]}
              statsLoading={statsLoading}
              navigate={navigate}
            />
          ))}
        </div>
      )}
    </div>
  );
}


// ─── SUBJECT CARD ────────────────────────────────────────

const SUBJECT_COLORS = [
  { bg: "bg-blue-50", border: "border-blue-100", icon: "bg-blue-100 text-blue-600", accent: "text-blue-600" },
  { bg: "bg-indigo-50", border: "border-indigo-100", icon: "bg-indigo-100 text-indigo-600", accent: "text-indigo-600" },
  { bg: "bg-violet-50", border: "border-violet-100", icon: "bg-violet-100 text-violet-600", accent: "text-violet-600" },
  { bg: "bg-emerald-50", border: "border-emerald-100", icon: "bg-emerald-100 text-emerald-600", accent: "text-emerald-600" },
  { bg: "bg-amber-50", border: "border-amber-100", icon: "bg-amber-100 text-amber-600", accent: "text-amber-600" },
  { bg: "bg-rose-50", border: "border-rose-100", icon: "bg-rose-100 text-rose-600", accent: "text-rose-600" },
];

const getSubjectColor = (code) => {
  if (!code) return SUBJECT_COLORS[0];
  let hash = 0;
  for (let i = 0; i < code.length; i++) {
    hash = code.charCodeAt(i) + ((hash << 5) - hash);
  }
  return SUBJECT_COLORS[Math.abs(hash) % SUBJECT_COLORS.length];
};

function SubjectCard({ subject, stats, statsLoading, navigate }) {
  const color = getSubjectColor(subject.code);
  const avg = stats?.averagePercentage;
  const totalClasses = stats?.totalClasses || 0;
  const totalStudents = stats?.totalStudents || 0;

  const attendanceColor =
    avg === undefined
      ? "text-gray-400"
      : avg >= 75
        ? "text-emerald-600"
        : avg >= 50
          ? "text-amber-600"
          : "text-red-600";

  const progressColor =
    avg >= 75 ? "bg-emerald-500" : avg >= 50 ? "bg-amber-500" : "bg-red-500";

  return (
    <div
      onClick={() => navigate(`/faculty/attendance/${subject._id}`)}
      className={`group relative border rounded-xl p-4 cursor-pointer transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 ${color.bg} ${color.border}`}
    >
      {/* Top row: icon + code */}
      <div className="flex items-start justify-between mb-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${color.icon}`}>
          <BookOpen className="w-5 h-5" />
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] font-bold bg-white/70 border border-white/50 px-2 py-0.5 rounded-lg text-gray-600">
            {subject.code}
          </span>
          <ChevronRight className={`w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity ${color.accent}`} />
        </div>
      </div>

      {/* Subject name */}
      <h3 className="text-sm font-bold text-gray-800 leading-snug mb-3 line-clamp-2">
        {subject.name}
      </h3>

      {/* Stats row */}
      {statsLoading ? (
        <div className="flex items-center gap-2 mt-2">
          <Loader2 className="w-3.5 h-3.5 text-gray-400 animate-spin" />
          <span className="text-xs text-gray-400">Loading stats...</span>
        </div>
      ) : stats ? (
        <div>
          {/* Attendance bar */}
          <div className="mb-2">
            <div className="flex justify-between items-center mb-1">
              <span className="text-[10px] text-gray-500 font-medium">Avg Attendance</span>
              <span className={`text-xs font-bold ${attendanceColor}`}>
                {avg !== undefined ? `${avg}%` : "—"}
              </span>
            </div>
            <div className="h-1.5 bg-white/60 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-700 ${progressColor}`}
                style={{ width: `${Math.min(avg || 0, 100)}%` }}
              />
            </div>
          </div>

          {/* Classes + students */}
          <div className="flex gap-3 mt-2">
            <div className="flex items-center gap-1 text-[10px] text-gray-500">
              <Clock className="w-3 h-3" />
              {totalClasses} class{totalClasses !== 1 && "es"}
            </div>
            <div className="flex items-center gap-1 text-[10px] text-gray-500">
              <Users className="w-3 h-3" />
              {totalStudents} student{totalStudents !== 1 && "s"}
            </div>
          </div>

          {/* Warning if low attendance */}
          {avg !== undefined && avg < 75 && (
            <div className="mt-2 flex items-center gap-1 text-[10px] text-red-600 font-medium bg-red-50 border border-red-100 rounded-lg px-2 py-1">
              <AlertCircle className="w-3 h-3" />
              Low average attendance
            </div>
          )}
        </div>
      ) : (
        <div className="flex items-center gap-1.5 text-[10px] text-gray-400 mt-1">
          <CheckCircle className="w-3 h-3" />
          No attendance recorded yet
        </div>
      )}

      {/* Subject type badge if available */}
      {subject.type && (
        <div className="absolute top-3 right-10">
          <span className="text-[9px] font-semibold bg-white/70 text-gray-500 px-1.5 py-0.5 rounded border border-white/50">
            {subject.type}
          </span>
        </div>
      )}
    </div>
  );
}


// ─── SMALL SHARED COMPONENTS ─────────────────────────────

function HeaderBadge({ label, value, icon: Icon }) {
  return (
    <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/10 rounded-xl px-3 py-2">
      <Icon className="w-4 h-4 text-indigo-300" />
      <div>
        <p className="text-lg font-bold text-white leading-none">{value}</p>
        <p className="text-[10px] text-indigo-300 font-medium">{label}</p>
      </div>
    </div>
  );
}

function OverviewCard({ label, value, icon: Icon, color, sub }) {
  const colorMap = {
    blue: { bg: "bg-blue-50", text: "text-blue-600" },
    indigo: { bg: "bg-indigo-50", text: "text-indigo-600" },
    violet: { bg: "bg-violet-50", text: "text-violet-600" },
    emerald: { bg: "bg-emerald-50", text: "text-emerald-600" },
    amber: { bg: "bg-amber-50", text: "text-amber-600" },
    rose: { bg: "bg-rose-50", text: "text-rose-600" },
  };
  const c = colorMap[color] || colorMap.indigo;

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-xl hover:shadow-2xl transition-all duration-300">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-gray-500 font-medium">{label}</p>
          <h3 className="text-2xl font-bold text-gray-900 mt-1">{value}</h3>
          {sub && <p className="text-[10px] text-gray-400 mt-1 italic">{sub}</p>}
        </div>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${c.bg} ${c.text}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
}