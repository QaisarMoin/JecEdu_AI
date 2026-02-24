import { Link, useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem("user"));
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  const isActive = (path) => location.pathname === path;

  const links = {
    student: [
      { to: "/dashboard", label: "Dashboard" },
      { to: "/subjects", label: "Subjects" },
      { to: "/attendance", label: "Attendance" },
      { to: "/student/dashboard", label: "My Attendance" },
      { to: "/notices", label: "Notices" },
    ],
    admin: [
      { to: "/dashboard", label: "Dashboard" },
      { to: "/notices", label: "Notices" },
      { to: "/admin/subjects", label: "Manage Subjects" },
    ],
    faculty: [
      { to: "/dashboard", label: "Dashboard" },
      { to: "/notices", label: "Notices" },
      { to: "/faculty/attendance", label: "Mark Attendance" },
      { to: "/faculty/history", label: "History" },
      { to: "/faculty/analytics", label: "Analytics" },
    ],
  };

  const navLinks = links[user?.role] || [];

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <Link
            to="/dashboard"
            className="text-lg font-bold text-indigo-600 tracking-tight flex-shrink-0"
          >
            SDAS
          </Link>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  isActive(link.to)
                    ? "bg-indigo-50 text-indigo-700"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 text-sm">
              <span className="text-gray-700 font-medium">{user?.name}</span>
              <span className="text-gray-400">·</span>
              <span className="text-gray-400 capitalize text-xs">
                {user?.role}
              </span>
            </div>

            <button
              onClick={logout}
              className="hidden sm:inline-flex text-sm text-gray-500 hover:text-red-600 font-medium transition-colors"
            >
              Logout
            </button>

            {/* Mobile Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-1.5 text-gray-500 hover:text-gray-700 rounded-md hover:bg-gray-100 transition-colors"
            >
              {mobileMenuOpen ? (
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
              ) : (
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
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white">
          <div className="px-4 py-3 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-3 py-2 rounded-md text-sm font-medium ${
                  isActive(link.to)
                    ? "bg-indigo-50 text-indigo-700"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                {link.label}
              </Link>
            ))}

            <div className="border-t border-gray-100 pt-3 mt-3 flex items-center justify-between px-3">
              <span className="text-sm text-gray-500">
                {user?.name}{" "}
                <span className="text-gray-400 capitalize text-xs">
                  · {user?.role}
                </span>
              </span>
              <button
                onClick={logout}
                className="text-sm text-red-600 font-medium"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}