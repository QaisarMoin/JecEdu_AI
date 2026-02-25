import { Link, useNavigate, useLocation } from "react-router-dom";
import {
    LayoutDashboard,
    Users,
    BookOpen,
    Bell,
    Calendar,
    ClipboardCheck,
    BarChart,
    GraduationCap,
    FileText,
    LogOut
} from "lucide-react";

export default function Sidebar() {

    const navigate = useNavigate();
    const location = useLocation();

    const user = JSON.parse(localStorage.getItem("user"));

    const logout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/");
    };

    const isActive = (path) => {
        // Exact match or starts with (for nested routes like /admin/timetable/edit/...)
        return location.pathname === path ||
            location.pathname.startsWith(path + "/");
    };


    /* ROLE BASED LINKS */

    const links = {

        admin: [

            {
                to: "/dashboard",
                label: "Dashboard",
                icon: LayoutDashboard
            },

            {
                to: "/admin/users",
                label: "User Management",
                icon: Users
            },

            {
                to: "/admin/subjects",
                label: "Subject Management",
                icon: BookOpen
            },

            {
                to: "/notices",
                label: "Notice Board",
                icon: Bell
            },

            {
                to: "/admin/timetable",
                label: "Timetable",
                icon: Calendar
            }

        ],


        faculty: [

            {
                to: "/dashboard",
                label: "Dashboard",
                icon: LayoutDashboard
            },

            {
                to: "/faculty/attendance",
                label: "Mark Attendance",
                icon: ClipboardCheck
            },

            {
                to: "/faculty/history",
                label: "Attendance History",
                icon: FileText
            },

            {
                to: "/faculty/marks",
                label: "Marks",
                icon: GraduationCap
            },

            {
                to: "/faculty/timetable",
                label: "My Timetable",
                icon: Calendar
            },

            {
                to: "/notices",
                label: "Notice Board",
                icon: Bell
            }

        ],


        student: [

            {
                to: "/dashboard",
                label: "Dashboard",
                icon: LayoutDashboard
            },

            {
                to: "/subjects",
                label: "Subjects",
                icon: BookOpen
            },

            {
                to: "/attendance",
                label: "Attendance",
                icon: ClipboardCheck
            },

            {
                to: "/student/dashboard",
                label: "Attendance Analytics",
                icon: BarChart
            },

            {
                to: "/marks",
                label: "Marks",
                icon: GraduationCap
            },

            {
                to: "/student/timetable",
                label: "Class Timetable",
                icon: Calendar
            },

            {
                to: "/notices",
                label: "Notice Board",
                icon: Bell
            }

        ]

    };


    const navLinks = links[user?.role] || [];


    return (

        <div className="w-64 h-screen fixed bg-white border-r flex flex-col justify-between z-50">


            {/* Top Logo */}

            <div>

                <div className="px-6 py-5 border-b">

                    <h1 className="text-xl font-bold text-indigo-600">
                        SDAS
                    </h1>

                    <p className="text-xs text-gray-400 capitalize">
                        {user?.role} panel
                    </p>

                </div>


                {/* Navigation */}

                <nav className="p-3 space-y-1 overflow-y-auto max-h-[calc(100vh-180px)]">

                    {navLinks.map(link => {

                        const Icon = link.icon;

                        const active = isActive(link.to);

                        return (

                            <Link
                                key={link.to}
                                to={link.to}
                                className={`
                                    flex items-center gap-3 px-4 py-2.5
                                    rounded-lg transition-all duration-200
                                    ${
                                        active
                                        ?
                                        "bg-indigo-50 text-indigo-600 font-semibold border-l-4 border-indigo-600"
                                        :
                                        "text-gray-600 hover:bg-gray-50 hover:text-gray-800"
                                    }
                                `}
                            >

                                <Icon
                                    size={18}
                                    className={
                                        active
                                        ? "text-indigo-600"
                                        : "text-gray-400"
                                    }
                                />

                                <span className="text-sm">
                                    {link.label}
                                </span>

                            </Link>

                        );

                    })}

                </nav>

            </div>



            {/* Bottom User Profile */}

            <div className="p-4 border-t bg-gray-50">

                <div className="flex items-center gap-3">

                    <div className="w-10 h-10 bg-indigo-500 text-white rounded-full flex items-center justify-center font-semibold text-sm">
                        {user?.name?.charAt(0)?.toUpperCase()}
                    </div>

                    <div className="flex-1 min-w-0">

                        <p className="text-sm font-medium text-gray-800 truncate">
                            {user?.name}
                        </p>

                        <p className="text-xs text-gray-500 capitalize">
                            {user?.role}
                            {user?.department &&
                                ` • ${user.department}`
                            }
                        </p>

                    </div>


                    <button
                        onClick={logout}
                        title="Logout"
                        className="p-1.5 rounded-lg hover:bg-red-50 transition-colors"
                    >
                        <LogOut
                            className="text-gray-400 hover:text-red-500 transition-colors"
                            size={18}
                        />
                    </button>

                </div>

            </div>


        </div>

    );

}