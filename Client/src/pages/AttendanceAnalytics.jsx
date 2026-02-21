import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import API from "../services/api";

export default function AttendanceAnalytics() {

    const [subjects, setSubjects] = useState([]);
    const [analytics, setAnalytics] = useState(null);

    useEffect(() => {

        fetchSubjects();

    }, []);

    const fetchSubjects = async () => {

        const res = await API.get("/subjects/faculty");

        setSubjects(res.data);

    };

    const fetchAnalytics = async (subjectId) => {

        const res = await API.get(
            `/attendance/analytics/${subjectId}`
        );

        setAnalytics(res.data);

    };

    return (

        <div>

            <Navbar />

            <div style={{ padding: 20 }}>

                <h2>Attendance Analytics</h2>

                <select
                    onChange={(e) =>
                        fetchAnalytics(e.target.value)
                    }
                >

                    <option>Select Subject</option>

                    {

                        subjects.map(subject => (

                            <option
                                key={subject._id}
                                value={subject._id}
                            >
                                {subject.name}
                            </option>

                        ))

                    }

                </select>

                {

                    analytics && (

                        <div>

                            <h3>
                                Attendance Percentage:
                                <span style={{
                                    color:
                                        analytics.percentage >= 75
                                            ? "green"
                                            : "red"
                                }}>
                                    {" "}
                                    {analytics.percentage}%
                                </span>
                            </h3>

                            <p>
                                Total Classes: {analytics.total}
                            </p>

                            <p style={{ color: "green" }}>
                                Present: {analytics.present}
                            </p>

                            <p style={{ color: "red" }}>
                                Absent: {analytics.absent}
                            </p>

                        </div>

                    )

                }

            </div>

        </div>

    );
}