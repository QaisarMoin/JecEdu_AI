import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import API from "../services/api";

export default function AdminSubjects() {

    const [subjects, setSubjects] = useState([]);

    const [facultyList, setFacultyList] = useState([]);

    const [form, setForm] = useState({
        name: "",
        code: "",
        faculty: "",
        department: "",
        semester: ""
    });

    const user = JSON.parse(localStorage.getItem("user"));

    useEffect(() => {

        if (user.role !== "admin") {
            alert("Access denied");
            return;
        }

        fetchSubjects();
        fetchFaculty();

    }, []);

    const fetchSubjects = async () => {

        const res = await API.get("/subjects");

        setSubjects(res.data);

    };

    const fetchFaculty = async () => {

        const res = await API.get("/users/faculty");

        setFacultyList(res.data);

    };

    const handleChange = (e) => {

        setForm({
            ...form,
            [e.target.name]: e.target.value
        });

    };

    const createSubject = async () => {

        try {

            await API.post("/subjects", form);

            alert("Subject created");

            fetchSubjects();

        } catch {

            alert("Error creating subject");

        }

    };

    return (

        <div>

            <Navbar />

            <div style={{ padding: 20 }}>

                <h2>Create Subject</h2>

                <input
                    name="name"
                    placeholder="Subject Name"
                    onChange={handleChange}
                />

                <br /><br />

                <input
                    name="code"
                    placeholder="Subject Code"
                    onChange={handleChange}
                />

                <br /><br />

                {/* FACULTY DROPDOWN */}

                <select
                    name="faculty"
                    onChange={handleChange}
                >

                    <option value="">
                        Select Faculty
                    </option>

                    {

                        facultyList.map(faculty => (

                            <option
                                key={faculty._id}
                                value={faculty._id}
                            >

                                {faculty.name} ({faculty.email})

                            </option>

                        ))

                    }

                </select>

                <br /><br />

                <input
                    name="department"
                    placeholder="Department"
                    onChange={handleChange}
                />

                <br /><br />

                <input
                    name="semester"
                    placeholder="Semester"
                    onChange={handleChange}
                />

                <br /><br />

                <button onClick={createSubject}>
                    Create Subject
                </button>

                <hr />

                <h2>All Subjects</h2>

                {

                    subjects.map(subject => (

                        <div key={subject._id}>

                            {subject.name} ({subject.code})

                        </div>

                    ))

                }

            </div>

        </div>

    );
}