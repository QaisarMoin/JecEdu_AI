import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard, Users, BookOpen, Bell, Calendar,
  ClipboardCheck, BarChart, GraduationCap, FileText,
  LogOut, ChevronRight, Sparkles, Menu, X
} from "lucide-react";

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem("user"));
  const [mobileOpen, setMobileOpen] = useState(false);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  const isActive = (path) =>
    location.pathname === path || location.pathname.startsWith(path + "/");

  const links = {
    admin: [
      { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
      { to: "/admin/users", label: "User Management", icon: Users },
      { to: "/admin/subjects", label: "Subject Management", icon: BookOpen },
      { to: "/notices", label: "Notice Board", icon: Bell },
      { to: "/admin/timetable", label: "Timetable", icon: Calendar },
      { to: "/assignments", label: "Assignments", icon: FileText },
    ],
    faculty: [
      { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
      { to: "/faculty/timetable", label: "My Timetable", icon: Calendar },
      { to: "/faculty/attendance", label: "Mark Attendance", icon: ClipboardCheck },
      { to: "/faculty/history", label: "Attendance History", icon: FileText },
      { to: "/faculty/marks", label: "Marks", icon: GraduationCap },
      { to: "/notices", label: "Notice Board", icon: Bell },
    ],
    student: [
      { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
      { to: "/subjects", label: "Subjects", icon: BookOpen },
      { to: "/student/timetable", label: "Class Timetable", icon: Calendar },
      { to: "/attendance", label: "Attendance", icon: ClipboardCheck },
      { to: "/student/dashboard", label: "Attendance Analytics", icon: BarChart },
      { to: "/assignments", label: "Assignments", icon: FileText },
      { to: "/notices", label: "Notice Board", icon: Bell },
    ],
  };

  const roleConfig = {
    admin: {
      gradient: "from-red-500 to-orange-500",
      bg: "bg-red-50",
      text: "text-red-600",
      ring: "ring-red-200",
      activeBg: "bg-red-50",
      activeText: "text-red-600",
      activeBorder: "border-red-500",
      activeIcon: "text-red-500",
      hoverBg: "hover:bg-red-50/50",
    },
    faculty: {
      gradient: "from-violet-500 to-purple-600",
      bg: "bg-violet-50",
      text: "text-violet-600",
      ring: "ring-violet-200",
      activeBg: "bg-violet-50",
      activeText: "text-violet-700",
      activeBorder: "border-violet-500",
      activeIcon: "text-violet-500",
      hoverBg: "hover:bg-violet-50/50",
    },
    student: {
      gradient: "from-blue-500 to-indigo-600",
      bg: "bg-blue-50",
      text: "text-blue-600",
      ring: "ring-blue-200",
      activeBg: "bg-blue-50",
      activeText: "text-blue-700",
      activeBorder: "border-blue-500",
      activeIcon: "text-blue-500",
      hoverBg: "hover:bg-blue-50/40",
    },
  };

  const navLinks = links[user?.role] || [];
  const rc = roleConfig[user?.role] || roleConfig.student;

  const roleLabels = {
    admin: "Administrator",
    faculty: "Faculty Member",
    student: "Student",
  };

  const closeMobile = () => setMobileOpen(false);

  const SidebarContent = () => (
    <div className="w-64 h-full flex flex-col bg-white border-r border-gray-100">
      {/* ── Logo / Brand ────────────────── */}
      <div className="px-5 py-5 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${rc.gradient} flex items-center justify-center shadow-lg`}>
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className="text-base font-bold text-gray-900 tracking-tight">SDAS</h1>
            <p className="text-[10px] text-gray-400 font-medium tracking-wider uppercase">
              {roleLabels[user?.role] || "Panel"}
            </p>
          </div>
          {/* Mobile close button */}
          <button className="ml-auto lg:hidden text-gray-400 hover:text-gray-600" onClick={closeMobile}>
            <X size={20} />
          </button>
        </div>
      </div>

      {/* ── Navigation ──────────────────── */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto space-y-0.5">
        <p className="text-[10px] font-semibold text-gray-300 uppercase tracking-widest px-3 mb-3">
          Menu
        </p>

        {navLinks.map((link) => {
          const Icon = link.icon;
          const active = isActive(link.to);

          return (
            <Link
              key={link.to}
              to={link.to}
              onClick={closeMobile}
              className={`
                relative flex items-center gap-3 px-3 py-2.5 rounded-xl
                transition-all duration-200 group
                ${active
                  ? `${rc.activeBg} ${rc.activeText} font-semibold shadow-sm`
                  : `text-gray-500 ${rc.hoverBg} hover:text-gray-800`
                }
              `}
            >
              {active && (
                <span className={`absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full bg-gradient-to-b ${rc.gradient}`} />
              )}
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-all duration-200 ${
                active
                  ? `bg-gradient-to-br ${rc.gradient} shadow-sm`
                  : "bg-gray-100 group-hover:bg-gray-200"
              }`}>
                <Icon size={15} className={active ? "text-white" : "text-gray-500 group-hover:text-gray-700"} />
              </div>
              <span className="text-sm flex-1 truncate">{link.label}</span>
              {active && (
                <ChevronRight size={14} className={`${rc.activeIcon} flex-shrink-0`} />
              )}
            </Link>
          );
        })}
      </nav>

      {/* ── User Profile + Logout ────────── */}
      <div className="p-3 border-t border-gray-100 bg-gray-50/50">
        <div className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-gray-100 transition-colors group cursor-default">
          <div className={`relative w-9 h-9 rounded-xl bg-gradient-to-br ${rc.gradient} flex items-center justify-center text-white font-bold text-sm flex-shrink-0 shadow-md`}>
            {user?.name?.charAt(0)?.toUpperCase()}
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 border-2 border-white rounded-full" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-800 truncate leading-tight">
              {user?.name}
            </p>
            <p className="text-[11px] text-gray-400 capitalize truncate mt-0.5 leading-tight">
              {user?.department
                ? `${user.department}${user?.semester ? ` • Sem ${user.semester}` : ""}`
                : roleLabels[user?.role]
              }
            </p>
          </div>
          <button
            onClick={logout}
            title="Sign out"
            className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400
                       hover:bg-red-100 hover:text-red-500 transition-all duration-200 flex-shrink-0"
          >
            <LogOut size={15} />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* ── Mobile Top Bar ─────────────────── */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-100 shadow-sm px-4 py-3 flex items-center gap-3 no-print">
        <button
          onClick={() => setMobileOpen(true)}
          className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
        >
          <Menu size={20} className="text-gray-600" />
        </button>
        <div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${rc.gradient} flex items-center justify-center shadow`}>
          <Sparkles className="w-3.5 h-3.5 text-white" />
        </div>
        <h1 className="text-base font-bold text-gray-900">SDAS</h1>
      </div>

      {/* ── Mobile Overlay ─────────────────── */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/40 z-40 no-print"
          onClick={closeMobile}
        />
      )}

      {/* ── Mobile Drawer ─────────────────── */}
      <div className={`
        lg:hidden fixed top-0 left-0 h-full z-50 no-print shadow-2xl
        transition-transform duration-300
        ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
      `}>
        <SidebarContent />
      </div>

      {/* ── Desktop Sidebar ─────────────────── */}
      <div className="hidden lg:flex w-64 h-screen fixed flex-col shadow-xl shadow-gray-100/50 z-50 no-print">
        <SidebarContent />
      </div>
    </>
  );
}