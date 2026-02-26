import { useEffect, useState } from "react";
import API from "../services/api";
import Sidebar from "../components/Navbar";

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
        <div className="flex min-h-screen bg-gray-50">
                    <Sidebar />
        
                    <div className="flex-1 p-6 lg:p-8 ml-64">

            <h2>Subjects</h2>

            {

                subjects.map(subject => (

                    <div key={subject._id}>

                        {subject.name} ({subject.code})

                    </div>

                ))

            }

        </div>
        </div>
</>
    );
}