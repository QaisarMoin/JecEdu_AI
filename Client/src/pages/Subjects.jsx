import { useEffect, useState } from "react";
import API from "../services/api";
import Navbar from "../components/Navbar";

export default function Subjects() {

    const [subjects, setSubjects] = useState([]);

    useEffect(() => {

        fetchSubjects();

    }, []);

    const fetchSubjects = async () => {

        const res = await API.get("/subjects/student");

        setSubjects(res.data);

    };

    return (

        <>
        <Navbar />
        <div style={{ padding: 20 }}>

            <h2>Subjects</h2>

            {

                subjects.map(subject => (

                    <div key={subject._id}>

                        {subject.name} ({subject.code})

                    </div>

                ))

            }

        </div>
</>
    );
}