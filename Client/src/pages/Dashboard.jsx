import { useEffect, useState, useMemo } from "react";
import Sidebar from "../components/Navbar";
import API from "../services/api";
import {
  Users, GraduationCap, BookOpen, Bell,
  TrendingUp, Clock, Calendar, Award,
  CheckCircle, XCircle, AlertCircle,
  ChevronRight, BarChart3, PieChart,
  Activity, FileText, Megaphone,
  BookMarked, UserCheck, Timer,
  Loader2, ArrowUpRight, ArrowDownRight,
  Sparkles, Target, Zap, Eye
} from "lucide-react";

export default function Dashboard() {
  const user = JSON.parse(localStorage.getItem("user")) || {};

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    notices: [],
    subjects: [],
    users: [],
    attendance: [],
    marks: [],
    timetable: [],
    facultySubjects: [],
    facultyTimetable: [],
    facultyAttendanceStats: [],
    timetableWeeks: [],
    studentTimetable: { week: null, entries: [] },
  });

  useEffect(() => {
    let mounted = true;
    fetchDashboardData(mounted);
    return () => { mounted = false; };
  }, []);

  const fetchDashboardData = async (mounted) => {
    try {
      const results = {
        notices: [], subjects: [], users: [],
        attendance: [], marks: [], timetable: [],
        facultySubjects: [], facultyTimetable: [],
        facultyAttendanceStats: [], timetableWeeks: [],
        studentTimetable: { week: null, entries: [] },
      };

      const [noticesRes, subjectsRes] = await Promise.all([
        API.get("/notices").catch(() => ({ data: [] })),
        API.get("/subjects").catch(() => ({ data: [] })),
      ]);
      results.notices = noticesRes.data || [];
      results.subjects = subjectsRes.data || [];

      if (user.role === "admin") {
        try {
          const [usersRes, weeksRes] = await Promise.all([
            API.get("/users"),
            API.get("/timetable/weeks").catch(() => ({ data: [] })),
          ]);
          results.users = usersRes.data || [];
          results.timetableWeeks = weeksRes.data || [];
        } catch { }
      }

      if (user.role === "student") {
        try {
          const [attRes, markRes, ttRes] = await Promise.all([
            API.get("/attendance/student-summary"),
            API.get("/marks/student"),
            API.get("/timetable/student", {
              params: { department: user.department, semester: user.semester },
            }).catch(() => ({ data: { week: null, entries: [] } })),
          ]);
          results.attendance = attRes.data || [];
          results.marks = markRes.data || [];
          results.studentTimetable = ttRes.data || { week: null, entries: [] };
        } catch (err) {
          console.error("Student data error:", err);
        }
      }

      if (user.role === "faculty") {
        const userId = user.id || user._id;
        try {
          const [facSubRes, facTTRes] = await Promise.all([
            API.get("/subjects/faculty"),
            API.get(`/timetable/faculty/${userId}`).catch(() => ({ data: [] })),
          ]);
          results.facultySubjects = facSubRes.data || [];
          results.facultyTimetable = facTTRes.data || [];

          const statsPromises = (facSubRes.data || []).map((s) =>
            API.get(`/attendance/subject/${s._id}/stats`).catch(() => ({ data: null }))
          );
          const statsResults = await Promise.all(statsPromises);
          results.facultyAttendanceStats = statsResults
            .map((r, i) => ({ subject: facSubRes.data[i], stats: r.data }))
            .filter((s) => s.stats);
        } catch (err) {
          console.error("Faculty data error:", err);
        }
      }

      if (mounted) setData(results);
    } catch (error) {
      console.error("Dashboard fetch error:", error);
    } finally {
      if (mounted) setLoading(false);
    }
  };

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
            <p className="text-sm text-gray-400 mt-6 font-medium">Loading your dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 lg:ml-64 pt-16 lg:pt-0">
        {/* Hero Header */}
        <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900 px-4 lg:px-8 pt-8 pb-24 relative overflow-hidden">
          {/* Background decoration */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl" />
            <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl" />
            <div className="absolute top-20 right-1/4 w-2 h-2 bg-blue-400/30 rounded-full" />
            <div className="absolute top-32 right-1/3 w-1 h-1 bg-white/20 rounded-full" />
            <div className="absolute top-16 left-1/3 w-1.5 h-1.5 bg-indigo-400/20 rounded-full" />
          </div>

          <div className="max-w-6xl mx-auto relative">
            <DashboardHeader user={user} />
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-6xl mx-auto px-4 lg:px-8 -mt-16 pb-8 relative">
          {user.role === "admin" && <AdminDashboard data={data} user={user} />}
          {user.role === "faculty" && <FacultyDashboard data={data} user={user} />}
          {user.role === "student" && <StudentDashboard data={data} user={user} />}
        </div>
      </div>
    </div>
  );
}


// ─── HEADER ─────────────────────────────

function DashboardHeader({ user }) {
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  };

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });

  return (
    <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
      <div>
        <p className="text-sm text-blue-300 font-medium mb-1">{getGreeting()}</p>
        <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight leading-tight">
          {user?.name || "User"}
        </h1>
        <div className="flex items-center gap-3 mt-3">
          <span className="inline-flex items-center gap-1.5 text-xs text-slate-300">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            {today}
          </span>
          <span className="w-1 h-1 rounded-full bg-slate-600" />
          <span className="capitalize px-2 py-0.5 bg-blue-500/20 text-blue-300 rounded-md text-xs font-semibold border border-blue-500/20">
            {user?.role}
          </span>
          {user?.department && (
            <>
              <span className="w-1 h-1 rounded-full bg-slate-600" />
              <span className="text-xs text-slate-400">{user.department}</span>
            </>
          )}
          {user?.semester && (
            <>
              <span className="w-1 h-1 rounded-full bg-slate-600" />
              <span className="text-xs text-slate-400">Semester {user.semester}</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}


// ─── ADMIN DASHBOARD ────────────────────

function AdminDashboard({ data }) {
  const students = data.users.filter((u) => u.role === "student");
  const faculty = data.users.filter((u) => u.role === "faculty");

  const departmentStats = useMemo(() => {
    const depts = {};
    students.forEach((s) => {
      const d = s.department || "Unknown";
      depts[d] = (depts[d] || 0) + 1;
    });
    return Object.entries(depts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  }, [students]);

  const recentUsers = useMemo(() => {
    return [...data.users]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 8);
  }, [data.users]);

  return (
    <>
      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Total Students" value={students.length} icon={GraduationCap} color="blue"
          sub={`${departmentStats.length} departments`} trend="up" />
        <StatCard label="Faculty Members" value={faculty.length} icon={Users} color="violet"
          sub="Active members" />
        <StatCard label="Subjects" value={data.subjects.length} icon={BookOpen} color="amber"
          sub="All semesters" />
        <StatCard label="Notices" value={data.notices.length} icon={Bell} color="rose"
          sub={data.notices.length > 0 ? `Latest: ${timeAgo(data.notices[0]?.createdAt)}` : "None yet"} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Department Distribution */}
        <Card>
          <SectionTitle icon={PieChart} title="Department Distribution" count={departmentStats.length} />
          {departmentStats.length === 0 ? (
            <EmptyState text="No student data" icon={Users} />
          ) : (
            <div className="space-y-4 mt-5">
              {departmentStats.map((dept, idx) => {
                const colors = ["blue", "violet", "emerald", "amber", "rose", "indigo"];
                const color = colors[idx % colors.length];
                return (
                  <div key={dept.name} className="group">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-700 font-medium flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full bg-${color}-500`} />
                        {dept.name}
                      </span>
                      <span className="text-gray-500 font-semibold">
                        {dept.count}
                        <span className="text-gray-300 font-normal ml-1">
                          ({((dept.count / students.length) * 100).toFixed(0)}%)
                        </span>
                      </span>
                    </div>
                    <ProgressBar value={dept.count} max={students.length} color={color} />
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        {/* Recent Notices */}
        <Card className="lg:col-span-2">
          <SectionTitle icon={Megaphone} title="Recent Notices" count={data.notices.length} />
          {data.notices.length === 0 ? (
            <EmptyState text="No notices posted" icon={Bell} />
          ) : (
            <div className="space-y-3 mt-5">
              {data.notices.slice(0, 5).map((notice) => (
                <NoticeItem key={notice._id} notice={notice} />
              ))}
            </div>
          )}
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Users */}
        <Card>
          <SectionTitle icon={UserCheck} title="Recently Added Users" count={recentUsers.length} />
          {recentUsers.length === 0 ? (
            <EmptyState text="No users yet" icon={Users} />
          ) : (
            <div className="space-y-1 mt-5">
              {recentUsers.map((u) => (
                <div key={u._id}
                  className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-gray-50 transition-all duration-200 group cursor-default">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold shadow-sm shadow-blue-200 flex-shrink-0">
                    {u.name?.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{u.name}</p>
                    <p className="text-xs text-gray-400 truncate">{u.email}</p>
                  </div>
                  <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-lg ${u.role === "admin"
                    ? "bg-red-50 text-red-600 ring-1 ring-red-100"
                    : u.role === "faculty"
                      ? "bg-violet-50 text-violet-600 ring-1 ring-violet-100"
                      : "bg-blue-50 text-blue-600 ring-1 ring-blue-100"
                    }`}>
                    {u.role}
                  </span>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Timetable Weeks */}
        <Card>
          <SectionTitle icon={Calendar} title="Timetable Weeks" count={data.timetableWeeks.length} />
          {data.timetableWeeks.length === 0 ? (
            <EmptyState text="No timetable weeks created" icon={Calendar} />
          ) : (
            <div className="space-y-2 mt-5">
              {data.timetableWeeks.slice(0, 6).map((w) => (
                <div key={w._id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                      <Calendar className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-800">
                        {new Date(w.weekStartDate).toLocaleDateString("en-US", {
                          month: "short", day: "numeric", year: "numeric",
                        })}
                      </p>
                      <p className="text-xs text-gray-400">{w.department} • Sem {w.semester}</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-300" />
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </>
  );
}


// ─── FACULTY DASHBOARD ──────────────────

function FacultyDashboard({ data, user }) {
  const todayDay = new Date().toLocaleDateString("en-US", { weekday: "long" });

  const todayClasses = useMemo(() => {
    return data.facultyTimetable.filter(
      (e) => e.day?.toLowerCase() === todayDay.toLowerCase()
    );
  }, [data.facultyTimetable, todayDay]);

  const totalStudentsTeaching = useMemo(() => {
    const uniqueDepts = new Set(
      data.facultySubjects.map((s) => `${s.department}-${s.semester}`)
    );
    return uniqueDepts.size;
  }, [data.facultySubjects]);

  return (
    <>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="My Subjects" value={data.facultySubjects.length}
          icon={BookMarked} color="indigo" sub="Assigned to you" />
        <StatCard label="Today's Classes" value={todayClasses.length}
          icon={Clock} color="emerald" sub={todayDay} />
        <StatCard label="Batches" value={totalStudentsTeaching}
          icon={Users} color="violet" sub="Dept-Semester combos" />
        <StatCard label="Notices" value={data.notices.length}
          icon={Bell} color="amber" sub="Department notices" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Today's Schedule */}
        <Card className="lg:col-span-2">
          <SectionTitle icon={Timer} title={`Today's Schedule — ${todayDay}`} />
          {todayClasses.length === 0 ? (
            <EmptyState text="No classes scheduled for today" icon={Clock} />
          ) : (
            <div className="space-y-3 mt-5">
              {todayClasses
                .sort((a, b) => (a.slotIndex || 0) - (b.slotIndex || 0))
                .map((entry, idx) => (
                  <ScheduleItem key={entry._id || idx} entry={entry} idx={idx} color="indigo" />
                ))}
            </div>
          )}
        </Card>

        {/* Subjects List */}
        <Card>
          <SectionTitle icon={BookOpen} title="My Subjects" count={data.facultySubjects.length} />
          {data.facultySubjects.length === 0 ? (
            <EmptyState text="No subjects assigned" icon={BookOpen} />
          ) : (
            <div className="space-y-2 mt-5">
              {data.facultySubjects.map((sub) => (
                <div key={sub._id} className="p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                  <p className="text-sm font-medium text-gray-800">{sub.name}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    <span className="inline-flex items-center gap-1 bg-gray-200/60 px-1.5 py-0.5 rounded text-[10px] font-medium text-gray-500">
                      {sub.code}
                    </span>
                    <span className="ml-2">{sub.department} • Sem {sub.semester}</span>
                  </p>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Attendance Overview */}
        <Card>
          <SectionTitle icon={BarChart3} title="Attendance Overview" />
          {data.facultyAttendanceStats.length === 0 ? (
            <EmptyState text="No attendance data yet" icon={BarChart3} />
          ) : (
            <div className="space-y-5 mt-5">
              {data.facultyAttendanceStats.map((item) => {
                const avg = item.stats?.averagePercentage || 0;
                return (
                  <div key={item.subject?._id}>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="font-medium text-gray-700">{item.subject?.name || "Subject"}</span>
                      <span className={`font-bold text-sm ${avg >= 75 ? "text-emerald-600" : avg >= 50 ? "text-amber-600" : "text-red-600"}`}>
                        {avg}%
                      </span>
                    </div>
                    <ProgressBar value={avg} max={100}
                      color={avg >= 75 ? "emerald" : avg >= 50 ? "amber" : "red"} />
                    <p className="text-[11px] text-gray-400 mt-1.5">
                      {item.stats?.totalClasses || 0} classes • {item.stats?.totalStudents || 0} students
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        {/* Recent Notices */}
        <Card>
          <SectionTitle icon={Megaphone} title="Recent Notices" count={data.notices.length} />
          {data.notices.length === 0 ? (
            <EmptyState text="No notices" icon={Bell} />
          ) : (
            <div className="space-y-3 mt-5">
              {data.notices.slice(0, 5).map((notice) => (
                <NoticeItem key={notice._id} notice={notice} />
              ))}
            </div>
          )}
        </Card>
      </div>
    </>
  );
}


// ─── STUDENT DASHBOARD ──────────────────

function StudentDashboard({ data, user }) {
  const date = new Date();

const todayDay = date.toLocaleDateString("en-US", {
    weekday: "long"
});

  const todayClasses = useMemo(() => {
    return (data.studentTimetable?.entries || []).filter(
      (e) => e.day?.toLowerCase() === todayDay.toLowerCase()
    );
  }, [data.studentTimetable, todayDay]);

  const validAttendance = useMemo(() => {
    return data.attendance.filter((s) => s.total !== undefined && s.total !== null && s.total > 0);
  }, [data.attendance]);

  const overallAttendance = useMemo(() => {
    if (validAttendance.length === 0) return null;
    const totalPresent = validAttendance.reduce((sum, s) => sum + (s.present || 0), 0);
    const totalClasses = validAttendance.reduce((sum, s) => sum + (s.total || 0), 0);
    if (totalClasses === 0) return null;
    return ((totalPresent / totalClasses) * 100).toFixed(1);
  }, [validAttendance]);

  const lowAttendance = useMemo(() => {
    return validAttendance.filter((s) => {
      const pct = s.total > 0 ? (s.present / s.total) * 100 : null;
      return pct !== null && pct < 75;
    });
  }, [validAttendance]);

  const pendingSubjects = useMemo(() => {
    return data.attendance.filter((s) => s.total === undefined || s.total === null || s.total === 0);
  }, [data.attendance]);

  const publishedMarksCount = data.marks.filter((m) => (m.publishedComponents || []).length > 0).length;

  const marksSummary = useMemo(() => {
    if (data.marks.length === 0) return null;
    let totalObtained = 0;
    let totalMax = 0;
    data.marks.forEach((m) => {
      const published = m.publishedComponents || [];
      if (published.includes("mst1") && published.includes("mst2")) {
        totalObtained += Math.max(m.mst1Marks || 0, m.mst2Marks || 0);
        totalMax += 25;
      } else if (published.includes("mst1")) {
        totalObtained += m.mst1Marks || 0;
        totalMax += 25;
      } else if (published.includes("mst2")) {
        totalObtained += m.mst2Marks || 0;
        totalMax += 25;
      }
      if (published.includes("assignment")) { totalObtained += m.assignmentMarks || 0; totalMax += 10; }
      if (published.includes("practical")) { totalObtained += m.practicalMarks || 0; totalMax += 40; }
    });
    if (totalMax === 0) return null;
    return { obtained: totalObtained, max: totalMax, percentage: ((totalObtained / totalMax) * 100).toFixed(1) };
  }, [data.marks]);

  const getClassesNeeded = (present, total) => {
    if (total === 0) return null;
    if ((present / total) * 100 >= 75) return 0;
    return Math.max(0, Math.ceil((0.75 * total - present) / 0.25));
  };

  const getSkippable = (present, total) => {
    if (total === 0) return null;
    if ((present / total) * 100 < 75) return 0;
    return Math.max(0, Math.floor(present / 0.75 - total));
  };

  return (
    <>
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <StatCard label="Attendance"
          value={overallAttendance !== null ? `${overallAttendance}%` : "—"}
          icon={CheckCircle}
          color={overallAttendance === null ? "blue" : overallAttendance >= 75 ? "emerald" : overallAttendance >= 50 ? "amber" : "rose"}
          sub={validAttendance.length > 0 ? `${validAttendance.length} subject${validAttendance.length !== 1 ? "s" : ""} tracked` : "No classes yet"}
          trend={overallAttendance >= 75 ? "up" : overallAttendance !== null ? "down" : undefined} />
        <StatCard label="Today's Classes" value={todayClasses.length}
          icon={Clock} color="blue" sub={todayDay} />
        {/* <StatCard label="Marks Published" value={publishedMarksCount}
          icon={Award} color="violet"
          sub={data.marks.length > 0 ? `of ${data.marks.length} subjects` : "No marks yet"} /> */}
        <StatCard label="Notices" value={data.notices.length}
          icon={Bell} color="amber" sub="Active notices" />
      </div>

      {/* Low Attendance Alert */}
      {lowAttendance.length > 0 && (
        <div className="bg-gradient-to-r from-red-50 to-orange-50 border border-red-200/60 rounded-2xl p-5 mb-6 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <AlertCircle className="w-5 h-5 text-red-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-red-800">Attendance Below 75%</p>
              <p className="text-xs text-red-600/80 mt-1">
                Immediate attention required in{" "}
                <span className="font-semibold">{lowAttendance.length} subject{lowAttendance.length !== 1 && "s"}</span>
              </p>
              <div className="mt-3 space-y-2">
                {lowAttendance.map((s) => {
                  const needed = getClassesNeeded(s.present || 0, s.total || 0);
                  const pct = s.total > 0 ? ((s.present / s.total) * 100).toFixed(1) : "0";
                  return (
                    <div key={s.subjectId}
                      className="flex items-center justify-between bg-white/60 backdrop-blur-sm rounded-xl px-4 py-2.5 border border-red-100">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                        <span className="text-xs font-medium text-red-800">{s.subjectName}</span>
                        <span className="text-[10px] text-red-400 bg-red-100 px-1.5 py-0.5 rounded-md font-semibold">{pct}%</span>
                      </div>
                      {needed !== null && needed > 0 && (
                        <span className="text-[10px] text-red-600 font-medium flex items-center gap-1">
                          <Target className="w-3 h-3" />
                          {needed} class{needed !== 1 && "es"} to 75%
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Today's Schedule */}
        <Card className="lg:col-span-3">
          <SectionTitle icon={Timer} title={`Today's Schedule — ${todayDay}`} />
          {todayClasses.length === 0 ? (
            <EmptyState text="No classes today — enjoy your day!" icon={Sparkles} />
          ) : (
            <div className="space-y-3 mt-5">
              {todayClasses
                .sort((a, b) => (a.slotIndex || 0) - (b.slotIndex || 0))
                .map((entry, idx) => (
                  <ScheduleItem key={entry._id || idx} entry={entry} idx={idx} color="blue" showFaculty />
                ))}
            </div>
          )}
        </Card>

        {/* Marks Summary */}
        {/* <Card>
          <SectionTitle icon={Award} title="Marks Overview" />
          {data.marks.length === 0 ? (
            <EmptyState text="No marks published yet" icon={Award} />
          ) : (
            <div className="mt-5">
              {marksSummary && (
                <div className="text-center p-5 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl mb-5 border border-blue-100/50">
                  <div className="relative inline-flex items-center justify-center">
                    <svg className="w-24 h-24 -rotate-90">
                      <circle cx="48" cy="48" r="40" fill="none" stroke="#E0E7FF" strokeWidth="8" />
                      <circle cx="48" cy="48" r="40" fill="none" stroke="#4F46E5" strokeWidth="8"
                        strokeLinecap="round" strokeDasharray={`${(marksSummary.percentage / 100) * 251.2} 251.2`} />
                    </svg>
                    <span className="absolute text-xl font-bold text-indigo-700">{marksSummary.percentage}%</span>
                  </div>
                  <p className="text-xs text-indigo-400 mt-2 font-medium">
                    {marksSummary.obtained} / {marksSummary.max} overall
                  </p>
                </div>
              )}

              <div className="space-y-3">
                {data.marks.slice(0, 5).map((m) => {
                  const published = m.publishedComponents || [];
                  if (published.length === 0) return null;
                  return (
                    <div key={m._id} className="flex items-center justify-between p-2 rounded-xl hover:bg-gray-50 transition-colors">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-gray-700 truncate">{m.subject?.name || "Subject"}</p>
                        <p className="text-[10px] text-gray-400 mt-0.5">{published.join(" • ")}</p>
                      </div>
                      <div className="flex gap-1.5 ml-3">
                        {published.includes("mst1") && <MarkBadge label="M1" value={m.mst1Marks} max={25} />}
                        {published.includes("mst2") && <MarkBadge label="M2" value={m.mst2Marks} max={25} />}
                        {published.includes("assignment") && <MarkBadge label="A" value={m.assignmentMarks} max={10} />}
                        {published.includes("practical") && <MarkBadge label="P" value={m.practicalMarks} max={40} />}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </Card> */}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Attendance Breakdown */}
        <Card>
          <SectionTitle icon={Activity} title="Attendance Breakdown" />
          {validAttendance.length === 0 && pendingSubjects.length === 0 ? (
            <EmptyState text="No attendance data" icon={Activity} />
          ) : (
            <div className="mt-5">
              {validAttendance.length > 0 && (
                <div className="space-y-5">
                  {validAttendance.map((sub) => {
                    const pct = ((sub.present || 0) / sub.total * 100).toFixed(1);
                    const isLow = parseFloat(pct) < 75;
                    const skippable = getSkippable(sub.present || 0, sub.total);
                    const needed = getClassesNeeded(sub.present || 0, sub.total);

                    return (
                      <div key={sub.subjectId} className="group">
                        <div className="flex justify-between text-sm mb-2">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-gray-700">{sub.subjectName}</span>
                            {isLow && <AlertCircle className="w-3.5 h-3.5 text-red-500" />}
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-400">{sub.present || 0}/{sub.total}</span>
                            <span className={`font-bold ${parseFloat(pct) >= 75 ? "text-emerald-600" : parseFloat(pct) >= 50 ? "text-amber-600" : "text-red-600"}`}>
                              {pct}%
                            </span>
                          </div>
                        </div>
                        <ProgressBar value={parseFloat(pct)} max={100}
                          color={parseFloat(pct) >= 75 ? "emerald" : parseFloat(pct) >= 50 ? "amber" : "red"} />

                        <div className="mt-2">
                          {!isLow && skippable !== null && skippable > 0 && (
                            <p className="text-[11px] text-emerald-600 flex items-center gap-1">
                              <CheckCircle className="w-3 h-3" />
                              Can skip {skippable} more class{skippable !== 1 && "es"} safely
                            </p>
                          )}
                          {!isLow && skippable === 0 && (
                            <p className="text-[11px] text-amber-600 flex items-center gap-1">
                              <AlertCircle className="w-3 h-3" />
                              At the edge — cannot miss any more
                            </p>
                          )}
                          {isLow && needed !== null && needed > 0 && (
                            <p className="text-[11px] text-red-500 flex items-center gap-1">
                              <Target className="w-3 h-3" />
                              Attend next {needed} class{needed !== 1 && "es"} to reach 75%
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {pendingSubjects.length > 0 && (
                <div className={validAttendance.length > 0 ? "mt-6 pt-5 border-t border-gray-100" : ""}>
                  <p className="text-[11px] text-gray-400 uppercase tracking-wider font-semibold mb-3">
                    Awaiting Classes
                  </p>
                  <div className="space-y-2">
                    {pendingSubjects.map((sub) => (
                      <div key={sub.subjectId}
                        className="flex items-center gap-3 p-2.5 bg-gray-50 rounded-xl">
                        <div className="w-2 h-2 rounded-full bg-gray-300" />
                        <span className="text-xs text-gray-500 flex-1">{sub.subjectName}</span>
                        <span className="text-[10px] text-gray-300 bg-gray-100 px-2 py-0.5 rounded-md font-medium">Pending</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </Card>

        {/* Notices */}
        <Card>
          <SectionTitle icon={Megaphone} title="Recent Notices" count={data.notices.length} />
          {data.notices.length === 0 ? (
            <EmptyState text="No notices" icon={Bell} />
          ) : (
            <div className="space-y-3 mt-5">
              {data.notices.slice(0, 5).map((notice) => (
                <NoticeItem key={notice._id} notice={notice} />
              ))}
            </div>
          )}
        </Card>
      </div>
    </>
  );
}


// ─── SHARED COMPONENTS ──────────────────

function Card({ children, className = "" }) {
  return (
    <div className={`bg-white border border-gray-100 rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 ${className}`}>
      {children}
    </div>
  );
}

function StatCard({ label, value, icon: Icon, color, sub, trend }) {
  const colorMap = {
    blue: { bg: "bg-blue-50", text: "text-blue-600", ring: "ring-blue-100" },
    indigo: { bg: "bg-indigo-50", text: "text-indigo-600", ring: "ring-indigo-100" },
    violet: { bg: "bg-violet-50", text: "text-violet-600", ring: "ring-violet-100" },
    emerald: { bg: "bg-emerald-50", text: "text-emerald-600", ring: "ring-emerald-100" },
    amber: { bg: "bg-amber-50", text: "text-amber-600", ring: "ring-amber-100" },
    rose: { bg: "bg-rose-50", text: "text-rose-600", ring: "ring-rose-100" },
    red: { bg: "bg-red-50", text: "text-red-600", ring: "ring-red-100" },
  };
  const c = colorMap[color] || colorMap.blue;

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-500 group relative overflow-hidden">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500 font-medium">{label}</p>
          <div className="flex items-baseline gap-2 mt-2">
            <h3 className="text-2xl font-bold text-gray-900 tracking-tight">{value}</h3>
            {trend && (
              <span className={`flex items-center gap-0.5 text-[10px] font-bold px-2 py-1 rounded-full ${trend === "up" ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-red-500"}`}>
                {trend === "up" ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                {trend === "up" ? "12%" : "5%"}
              </span>
            )}
          </div>
          {sub && <p className="text-[10px] text-gray-400 mt-2 font-medium italic">{sub}</p>}
        </div>
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${c.bg} ${c.text} shadow-lg transition-transform group-hover:scale-110 duration-300`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
}

function SectionTitle({ icon: Icon, title, count }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
          <Icon className="w-4 h-4 text-gray-500" />
        </div>
        <h3 className="text-sm font-bold text-gray-800">{title}</h3>
      </div>
      {count !== undefined && (
        <span className="text-[10px] font-semibold text-gray-400 bg-gray-100 px-2 py-1 rounded-lg">
          {count}
        </span>
      )}
    </div>
  );
}

function EmptyState({ text, icon: Icon = FileText }) {
  return (
    <div className="flex flex-col items-center justify-center py-10">
      <div className="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center mb-3">
        <Icon className="w-6 h-6 text-gray-300" />
      </div>
      <p className="text-sm text-gray-400 font-medium">{text}</p>
    </div>
  );
}

function ProgressBar({ value, max, color = "indigo" }) {
  const percentage = Math.min((value / max) * 100, 100);
  const colorMap = {
    indigo: { bar: "bg-indigo-500", track: "bg-indigo-100" },
    blue: { bar: "bg-blue-500", track: "bg-blue-100" },
    emerald: { bar: "bg-emerald-500", track: "bg-emerald-100" },
    amber: { bar: "bg-amber-500", track: "bg-amber-100" },
    red: { bar: "bg-red-500", track: "bg-red-100" },
    violet: { bar: "bg-violet-500", track: "bg-violet-100" },
    rose: { bar: "bg-rose-500", track: "bg-rose-100" },
  };
  const c = colorMap[color] || colorMap.indigo;

  return (
    <div className={`h-2 rounded-full overflow-hidden ${c.track}`}>
      <div className={`h-full rounded-full transition-all duration-700 ease-out ${c.bar}`}
        style={{ width: `${percentage}%` }} />
    </div>
  );
}

function ScheduleItem({ entry, idx, color = "blue", showFaculty = false }) {
  const colorMap = {
    blue: { bg: "bg-blue-100", text: "text-blue-600" },
    indigo: { bg: "bg-indigo-100", text: "text-indigo-600" },
  };
  const c = colorMap[color] || colorMap.blue;

  return (
    <div className="flex items-center gap-4 p-3.5 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors group">
      <div className={`w-11 h-11 ${c.bg} rounded-xl flex items-center justify-center flex-shrink-0`}>
        <span className={`text-sm font-bold ${c.text}`}>{entry.slotIndex || idx + 1}</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-800">{entry.subject?.name || "Subject"}</p>
        <p className="text-xs text-gray-400 mt-0.5">
          {entry.startTime || "—"} – {entry.endTime || "—"}
          {entry.subject?.code && (
            <span className="ml-2 bg-gray-200/60 px-1.5 py-0.5 rounded text-[10px] font-medium text-gray-500">
              {entry.subject.code}
            </span>
          )}
          {showFaculty && entry.faculty?.name && (
            <span className="ml-2 text-gray-400">• {entry.faculty.name}</span>
          )}
        </p>
      </div>
      <div className="text-[10px] text-gray-400 bg-white px-2.5 py-1.5 rounded-lg border border-gray-100 font-medium shadow-sm">
        Slot {entry.slotIndex || idx + 1}
      </div>
    </div>
  );
}

function NoticeItem({ notice }) {
  const priorityConfig = {
    urgent: { bg: "bg-red-100", text: "text-red-600", dot: "bg-red-500" },
    important: { bg: "bg-amber-100", text: "text-amber-600", dot: "bg-amber-500" },
    normal: { bg: "bg-blue-100", text: "text-blue-600", dot: "bg-blue-500" },
  };
  const p = priorityConfig[notice.priority] || priorityConfig.normal;

  return (
    <div className="flex gap-3.5 p-3.5 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors group">
      <div className={`w-9 h-9 ${p.bg} rounded-xl flex items-center justify-center flex-shrink-0`}>
        <FileText className={`w-4 h-4 ${p.text}`} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="text-sm font-semibold text-gray-800 truncate flex-1">{notice.title}</p>
          {notice.priority && notice.priority !== "normal" && (
            <span className={`flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full ${p.bg} ${p.text}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${p.dot}`} />
              {notice.priority}
            </span>
          )}
        </div>
        <p className="text-xs text-gray-400 mt-1 line-clamp-2 leading-relaxed">
          {notice.description?.slice(0, 120)}{notice.description?.length > 120 && "..."}
        </p>
        <div className="flex items-center gap-2 mt-2">
          <div className="w-4 h-4 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0">
            <span className="text-[8px] text-white font-bold">
              {notice.createdBy?.name?.charAt(0).toUpperCase() || "?"}
            </span>
          </div>
          <span className="text-[11px] text-gray-400 font-medium">{notice.createdBy?.name || "System"}</span>
          <span className="text-gray-200">•</span>
          <span className="text-[11px] text-gray-400 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {timeAgo(notice.createdAt)}
          </span>
        </div>
      </div>
    </div>
  );
}

function MarkBadge({ label, value, max }) {
  const pct = value !== null && value !== undefined ? ((value / max) * 100).toFixed(0) : null;
  return (
    <div className={`text-center px-2 py-1 rounded-lg text-[10px] font-bold transition-colors ${pct === null
      ? "bg-gray-100 text-gray-400"
      : pct >= 60
        ? "bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200"
        : pct >= 40
          ? "bg-amber-100 text-amber-700 ring-1 ring-amber-200"
          : "bg-red-100 text-red-700 ring-1 ring-red-200"
      }`}
      title={`${label}: ${value ?? "—"}/${max}`}>
      {label}:{value ?? "—"}
    </div>
  );
}


// ─── UTILITIES ──────────────────────────

function timeAgo(dateStr) {
  if (!dateStr) return "";
  const now = new Date();
  const date = new Date(dateStr);
  const seconds = Math.floor((now - date) / 1000);
  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}