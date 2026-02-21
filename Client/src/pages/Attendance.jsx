import { useEffect, useState } from "react";
import API from "../services/api";
import Navbar from "../components/Navbar";

export default function Attendance() {

    const [attendance, setAttendance] = useState([]);

    useEffect(() => {

        fetchAttendance();

    }, []);

    const fetchAttendance = async () => {

        const res = await API.get("/attendance/student");

        setAttendance(res.data);

    };

    return (
        <>
        <Navbar />
        <div style={{ padding: 20 }}>

            <h2>Attendance</h2>

            {

                attendance.map(a => (

                    <div key={a._id}>

                        {a.subject.name} - {a.status}

                    </div>

                ))

            }

        </div>
</>
    );
}