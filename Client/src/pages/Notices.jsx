import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import API from "../services/api";

export default function Notices() {

    const [notices, setNotices] = useState([]);

    const [form, setForm] = useState({
        title: "",
        description: "",
        priority: "normal"
    });

    const user = JSON.parse(localStorage.getItem("user"));

    useEffect(() => {

        fetchNotices();

    }, []);


    const fetchNotices = async () => {

        const res = await API.get("/notices");

        setNotices(res.data);

    };


    const handleChange = (e) => {

        setForm({
            ...form,
            [e.target.name]: e.target.value
        });

    };


    const createNotice = async () => {

        await API.post("/notices", form);

        alert("Notice created");

        fetchNotices();

    };


    const deleteNotice = async (id) => {

        await API.delete(`/notices/${id}`);

        fetchNotices();

    };


    const getPriorityColor = (priority) => {

        if (priority === "urgent")
            return "red";

        if (priority === "important")
            return "orange";

        return "black";

    };


    return (

        <div>

            <Navbar />

            <div style={{ padding: 20 }}>

                <h2>Notice Board</h2>


                {(user.role === "admin" ||
                  user.role === "faculty") && (

                    <div>

                        <h3>Add Notice</h3>

                        <input
                            name="title"
                            placeholder="Title"
                            onChange={handleChange}
                        />

                        <br /><br />

                        <textarea
                            name="description"
                            placeholder="Description"
                            onChange={handleChange}
                        />

                        <br /><br />

                        <select
                            name="priority"
                            onChange={handleChange}
                        >

                            <option value="normal">
                                Normal
                            </option>

                            <option value="important">
                                Important
                            </option>

                            <option value="urgent">
                                Urgent
                            </option>

                        </select>

                        <br /><br />

                        <button onClick={createNotice}>
                            Add Notice
                        </button>

                        <hr />

                    </div>

                )}


                {

                    notices.map(notice => (

                        <div key={notice._id}
                        style={{
                            border: "1px solid gray",
                            padding: 10,
                            marginBottom: 10
                        }}>

                            <h3
                            style={{
                                color:
                                getPriorityColor(
                                    notice.priority
                                )
                            }}>
                                {notice.title}
                            </h3>

                            <p>
                                {notice.description}
                            </p>

                            <small>
                                By:
                                {notice.createdBy.name}
                            </small>

                            <br />

                            <small>
                                Priority:
                                {notice.priority}
                            </small>

                            <br />

                            {(user.role === "admin" ||
                              user.role === "faculty") && (

                                <button
                                onClick={() =>
                                deleteNotice(notice._id)}>
                                    Delete
                                </button>

                            )}

                        </div>

                    ))

                }

            </div>

        </div>

    );

}