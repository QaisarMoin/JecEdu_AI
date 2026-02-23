import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import API from "../services/api";

export default function StudentAttendanceDashboard() {

    const [subjects, setSubjects] = useState([]);

    useEffect(() => {

        fetchAttendance();

    }, []);

    const fetchAttendance = async () => {

        const res = await API.get(
            "/attendance/student-summary"
        );

        setSubjects(res.data);

    };

    const getColor = (percentage) => {

        if (percentage >= 75)
            return "green";

        if (percentage >= 60)
            return "orange";

        return "red";

    };

    return (

        <div>

            <Navbar />

            <div style={{ padding: 20 }}>

                <h2>My Attendance Dashboard</h2>

                {

                    subjects.map(subject => (

                        <div
                            key={subject.subjectId}
                            style={{
                                border: "1px solid gray",
                                padding: 15,
                                marginBottom: 10,
                                borderRadius: 5
                            }}
                        >

                            <h3>
                                {subject.subjectName}
                                ({subject.subjectCode})
                            </h3>

                            <p>
                                Attendance:
                                <span style={{
                                    color:
                                        getColor(subject.percentage),
                                    fontWeight: "bold"
                                }}>
                                    {" "}
                                    {subject.percentage}%
                                </span>
                            </p>

                            <p>
                                Total Classes:
                                {subject.total}
                            </p>

                            <p style={{ color: "green" }}>
                                Present:
                                {subject.present}
                            </p>

                            <p style={{ color: "red" }}>
                                Absent:
                                {subject.absent}
                            </p>

                        </div>

                    ))

                }

            </div>

        </div>

    );
}