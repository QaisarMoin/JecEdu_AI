import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import API from "../services/api";

export default function StudentMarks() {

    const [marks, setMarks] = useState([]);

    useEffect(() => {

        fetchMarks();

    }, []);

    const fetchMarks = async () => {

        const res = await API.get("/marks/student");

        setMarks(res.data);

    };

    return (

        <div>

            <Navbar />

            <div style={{ padding: 20 }}>

                <h2>My Marks</h2>

                {

                    marks.map(mark => (

                        <div key={mark._id}>

                            <h3>
                                {mark.subject.name}
                            </h3>

                            MST 1: {mark.mst1Marks}
                            <br />

                            MST 2: {mark.mst2Marks}
                            <br />

                            Best MST: {mark.mstBest}
                            <br />

                            Assignment:
                            {mark.assignmentMarks}
                            <br />

                            Practical:
                            {mark.practicalMarks}
                            <br />

                            Total:
                            {mark.totalMarks}

                        </div>

                    ))

                }

            </div>

        </div>

    );

}