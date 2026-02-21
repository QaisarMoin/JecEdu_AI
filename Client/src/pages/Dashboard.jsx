import Navbar from "../components/Navbar";

export default function Dashboard() {

    const user = JSON.parse(localStorage.getItem("user"));

    return (

        <div>

            <Navbar />

            <div style={{ padding: 20 }}>

                <h2>Dashboard</h2>

                <h3>
                    Welcome {user?.name}
                </h3>

                {user?.role === "admin" && (
                    <div>
                        <p>You are Admin</p>
                        <p>Manage subjects, notices, timetable</p>
                    </div>
                )}

                {user?.role === "faculty" && (
                    <div>
                        <p>You are Faculty</p>
                        <p>Manage attendance and notices</p>
                    </div>
                )}

                {user?.role === "student" && (
                    <div>
                        <p>You are Student</p>
                        <p>View attendance, subjects, notices</p>
                    </div>
                )}

            </div>

        </div>

    );
}