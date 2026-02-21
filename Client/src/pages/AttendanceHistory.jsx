import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import API from "../services/api";

export default function AttendanceHistory() {

    const [subjects, setSubjects] = useState([]);
    const [selectedSubject, setSelectedSubject] = useState("");
    const [history, setHistory] = useState({});
    const [editData, setEditData] = useState([]);

    useEffect(() => {

        fetchSubjects();

    }, []);

    const fetchSubjects = async () => {

        const res = await API.get("/subjects/faculty");

        setSubjects(res.data);

    };

    const fetchHistory = async (subjectId) => {

        const res = await API.get(`/attendance/history/${subjectId}`);

        setHistory(res.data);

    };

    const startEdit = (records) => {

        setEditData(records);

    };

    const changeStatus = (index, status) => {

        const updated = [...editData];

        updated[index].status = status;

        setEditData(updated);

    };

    const saveEdit = async () => {

        await API.put("/attendance/update", {
            attendance: editData
        });

        alert("Attendance updated");

        fetchHistory(selectedSubject);

    };

    return (

        <div>

            <Navbar />

            <div style={{ padding: 20 }}>

                <h2>Attendance History</h2>

                <select
                    onChange={(e) => {
                        setSelectedSubject(e.target.value);
                        fetchHistory(e.target.value);
                    }}
                >

                    <option>Select Subject</option>

                    {

                        subjects.map(subject => (

                            <option key={subject._id} value={subject._id}>
                                {subject.name}
                            </option>

                        ))

                    }

                </select>

                <hr />

                {

                    Object.keys(history).map(date => (

                        <div key={date}>

                            <h3>{date}</h3>

                            <button
                                onClick={() =>
                                    startEdit(history[date])
                                }
                            >
                                Edit
                            </button>

                        </div>

                    ))

                }

                {

                    editData.length > 0 && (

                        <div>

                            <h3>Edit Attendance</h3>

                            {

                                editData.map((record, index) => (

                                    <div key={record._id} style={{ marginBottom: "10px" }}>

                                        <span style={{ marginRight: "10px" }}>
                                            {record.student.name}
                                        </span>

                                        <button
                                            onClick={() => changeStatus(index, "present")}
                                            style={{
                                                backgroundColor:
                                                    editData[index].status === "present"
                                                        ? "green"
                                                        : "lightgray",
                                                color: "white",
                                                marginRight: "5px"
                                            }}
                                        >
                                            Present
                                        </button>

                                        <button
                                            onClick={() => changeStatus(index, "absent")}
                                            style={{
                                                backgroundColor:
                                                    editData[index].status === "absent"
                                                        ? "red"
                                                        : "lightgray",
                                                color: "white"
                                            }}
                                        >
                                            Absent
                                        </button>

                                    </div>

                                ))

                            }

                            <button onClick={saveEdit}>
                                Save Changes
                            </button>

                        </div>

                    )

                }

            </div>

        </div>

    );
}