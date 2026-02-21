import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import API from "../services/api";

export default function FacultyAttendance() {

    const [subjects, setSubjects] = useState([]);
    const [selectedSubject, setSelectedSubject] = useState("");
    const [students, setStudents] = useState([]);
    const [attendance, setAttendance] = useState({});

    const user = JSON.parse(localStorage.getItem("user"));

    useEffect(() => {

        fetchSubjects();

    }, []);

    const fetchSubjects = async () => {

        const res = await API.get("/subjects/faculty");

        setSubjects(res.data);

    };

    const selectSubject = async (subjectId) => {

        setSelectedSubject(subjectId);

        const subject = subjects.find(s => s._id === subjectId);

        const res = await API.get(
            `/users/students?department=${subject.department}&semester=${subject.semester}`
        );

        setStudents(res.data);

        // initialize attendance
        const initial = {};

        res.data.forEach(student => {

            initial[student._id] = "present";

        });

        setAttendance(initial);

    };

    const markAttendance = (studentId, status) => {

        setAttendance({
            ...attendance,
            [studentId]: status
        });

    };

    const submitAttendance = async () => {

        const today = new Date().toISOString().split("T")[0];

        const attendanceArray = students.map(student => ({
            studentId: student._id,
            status: attendance[student._id]
        }));

        await API.post("/attendance/mark-class", {
            subjectId: selectedSubject,
            date: today,
            attendance: attendanceArray
        });

        alert("Attendance submitted");

    };

    return (

        <div>

            <Navbar />

            <div style={{ padding: 20 }}>

                <h2>Mark Attendance</h2>

                {/* SUBJECT DROPDOWN */}

                <select
                    onChange={(e) => selectSubject(e.target.value)}
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

                <hr />

                {/* STUDENT LIST */}

                {

                    students.map(student => (

                        <div key={student._id}>

                            {student.name}

                            <button
                                onClick={() =>
                                    markAttendance(student._id, "present")
                                }
                                style={{
                                    background:
                                        attendance[student._id] === "present"
                                            ? "green"
                                            : "gray"
                                }}
                            >
                                Present
                            </button>

                            <button
                                onClick={() =>
                                    markAttendance(student._id, "absent")
                                }
                                style={{
                                    background:
                                        attendance[student._id] === "absent"
                                            ? "red"
                                            : "gray"
                                }}
                            >
                                Absent
                            </button>

                        </div>

                    ))

                }

                <br />

                {

                    students.length > 0 && (

                        <button onClick={submitAttendance}>
                            Submit Attendance
                        </button>

                    )

                }

            </div>

        </div>

    );
}