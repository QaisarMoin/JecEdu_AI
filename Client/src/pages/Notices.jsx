import { useEffect, useState } from "react";
import API from "../services/api";
import Navbar from "../components/Navbar";

export default function Notices() {

    const [notices, setNotices] = useState([]);

    useEffect(() => {

        fetchNotices();

    }, []);

    const fetchNotices = async () => {

        const res = await API.get("/notices");

        setNotices(res.data);

    };

    return (
        <>
        <Navbar />
        <div style={{ padding: 20 }}>

            <h2>Notices</h2>

            {

                notices.map(notice => (

                    <div key={notice._id}>

                        <h4>{notice.title}</h4>
                        <p>{notice.description}</p>

                    </div>

                ))

            }

        </div>
</>
    );
}