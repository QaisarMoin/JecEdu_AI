import { Link, useNavigate } from "react-router-dom";

export default function Navbar() {

    const navigate = useNavigate();

    const user = JSON.parse(localStorage.getItem("user"));

    const logout = () => {

        localStorage.removeItem("token");
        localStorage.removeItem("user");

        navigate("/");

    };

    return (

        <div style={{
            padding: 15,
            background: "#222",
            color: "white",
            display: "flex",
            justifyContent: "space-between"
        }}>

            <div>

                <b>SDAS</b>

                &nbsp;&nbsp;&nbsp;

                <Link to="/dashboard" style={{ color: "white" }}>
                    Dashboard
                </Link>

                &nbsp;&nbsp;

                {user?.role === "student" && (
                    <>
                        <Link to="/subjects" style={{ color: "white" }}>
                            Subjects
                        </Link>

                        &nbsp;&nbsp;

                        <Link to="/attendance" style={{ color: "white" }}>
                            Attendance
                        </Link>
                    </>
                )}

                {(user?.role === "admin" || user?.role === "faculty") && (
                    <>
                        <Link to="/notices" style={{ color: "white" }}>
                            Notices
                        </Link>
                    </>
                )}

                {user?.role === "admin" && (
                    <>
                        &nbsp;&nbsp;
                        <Link to="/admin/subjects" style={{ color: "white" }}>
                            Manage Subjects
                        </Link>
                    </>
                )}

                {user?.role === "faculty" && (
                    <>
                        &nbsp;&nbsp;
                        <Link to="/faculty/attendance" style={{ color: "white" }}>
                            Mark Attendance
                        </Link>
                        &nbsp;&nbsp;
                        <Link to="/faculty/history" style={{ color: "white" }}>
                            Attendance History
                        </Link>
                        &nbsp;&nbsp;
                        <Link to="/faculty/analytics" style={{ color: "white" }}>
                            Analytics
                        </Link>
                    </>
                )}

            </div>

            <div>

                {user?.name} ({user?.role})

                &nbsp;&nbsp;

                <button onClick={logout}>
                    Logout
                </button>

            </div>

        </div>

    );
}