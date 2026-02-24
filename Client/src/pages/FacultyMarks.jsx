import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import API from "../services/api";

export default function FacultyMarks() {

    const [subjects, setSubjects] = useState([]);
    const [students, setStudents] = useState([]);
    const [selectedSubject, setSelectedSubject] = useState("");
    const [marks, setMarks] = useState({});

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

        const initial = {};

        res.data.forEach(student => {

            initial[student._id] = {
                mst1Marks: 0,
                mst2Marks: 0,
                assignmentMarks: 0,
                practicalMarks: 0
            };

        });

        setMarks(initial);

    };

    const updateMarks = (studentId, field, value) => {

        setMarks({
            ...marks,
            [studentId]: {
                ...marks[studentId],
                [field]: Number(value)
            }
        });

    };

    const submitMarks = async () => {

        const marksArray = students.map(student => ({

            studentId: student._id,

            mst1Marks:
                marks[student._id]?.mst1Marks || 0,

            mst2Marks:
                marks[student._id]?.mst2Marks || 0,

            assignmentMarks:
                marks[student._id]?.assignmentMarks || 0,

            practicalMarks:
                marks[student._id]?.practicalMarks || 0

        }));

        await API.post("/marks", {
            subjectId: selectedSubject,
            marks: marksArray
        });

        alert("Marks saved");

    };

    return (

        <div>

            <Navbar />

            <div style={{ padding: 20 }}>

                <h2>Enter Marks</h2>

                <select
                    onChange={(e) =>
                        selectSubject(e.target.value)}
                >

                    <option>Select Subject</option>

                    {

                        subjects.map(subject => (

                            <option
                                key={subject._id}
                                value={subject._id}>
                                {subject.name}
                            </option>

                        ))

                    }

                </select>

                <hr />

                {

                    students.map(student => (

                        <div key={student._id}>

                            {student.rollNo} - {student.name}

                            <input
                                type="number"
                                placeholder="MST 1"
                                onChange={(e) =>
                                    updateMarks(
                                        student._id,
                                        "mst1Marks",
                                        e.target.value
                                    )}
                            />

                            <input
                                type="number"
                                placeholder="MST 2"
                                onChange={(e) =>
                                    updateMarks(
                                        student._id,
                                        "mst2Marks",
                                        e.target.value
                                    )}
                            />

                            <input
                                type="number"
                                placeholder="Assignment"
                                onChange={(e) =>
                                    updateMarks(
                                        student._id,
                                        "assignmentMarks",
                                        e.target.value
                                    )}
                            />

                            <input
                                type="number"
                                placeholder="Practical"
                                onChange={(e) =>
                                    updateMarks(
                                        student._id,
                                        "practicalMarks",
                                        e.target.value
                                    )}
                            />

                        </div>

                    ))

                }

                {

                    students.length > 0 && (

                        <button onClick={submitMarks}>
                            Submit Marks
                        </button>

                    )

                }

            </div>

        </div>

    );

}