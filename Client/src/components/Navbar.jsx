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

    const isActive = (path) => location.pathname === path;


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
                to: "/timetable",
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

            // {
            //     to: "/faculty/analytics",
            //     label: "Analytics",
            //     icon: BarChart
            // },

            {
                to: "/faculty/marks",
                label: "Marks",
                icon: GraduationCap
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
                icon: ClipboardCheck
            },

            {
                to: "/marks",
                label: "Marks",
                icon: GraduationCap
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

        <div className="w-64 h-screen fixed bg-white border-r flex flex-col justify-between">


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

                <nav className="p-3 space-y-2">

                    {navLinks.map(link => {

                        const Icon = link.icon;

                        return (

                            <Link
                                key={link.to}
                                to={link.to}
                                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition
                                
                                ${
                                    isActive(link.to)
                                    ?
                                    "bg-indigo-100 text-indigo-600 font-medium"
                                    :
                                    "text-gray-600 hover:bg-gray-100"
                                }
                                
                                `}
                            >

                                <Icon size={18} />

                                {link.label}

                            </Link>

                        );

                    })}

                </nav>

            </div>



            {/* Bottom User Profile */}

            <div className="p-4 border-t">

                <div className="flex items-center gap-3">

                    <div className="w-10 h-10 bg-indigo-500 text-white rounded-full flex items-center justify-center font-semibold">
                        {user?.name?.charAt(0)}
                    </div>

                    <div className="flex-1">

                        <p className="text-sm font-medium">
                            {user?.name}
                        </p>

                        <p className="text-xs text-gray-500 capitalize">
                            {user?.role}
                        </p>

                    </div>


                    <button onClick={logout}>
                        <LogOut className="text-gray-500 hover:text-red-500" size={18} />
                    </button>

                </div>

            </div>


        </div>

    );

}