import { useEffect, useState } from "react";
import Sidebar from "../components/Navbar";
import API from "../services/api";
import { Search } from "lucide-react";

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 5;

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "student",
    rollNo: "",
    department: "",
    semester: ""
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [search, roleFilter, users]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await API.get("/users");
      setUsers(res.data);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const filterUsers = () => {
    let temp = [...users];

    if (search) {
      temp = temp.filter(
        (u) =>
          u.name.toLowerCase().includes(search.toLowerCase()) ||
          u.email.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (roleFilter !== "all") {
      temp = temp.filter((u) => u.role === roleFilter);
    }

    setFilteredUsers(temp);
    setCurrentPage(1);
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const createUser = async () => {
  try {
    if (!form.name || !form.email || !form.password) {
      return alert("Please fill all required fields");
    }

    if (form.role === "student" && !form.rollNo) {
      return alert("Roll Number is required for students");
    }

    const payload = {
      name: form.name,
      email: form.email,
      password: form.password,
      role: form.role,
      department: form.department, // now common for all
    };

    if (form.role === "student") {
      payload.rollNo = form.rollNo;
      payload.semester = form.semester;
    }

    await API.post("/users", payload);

    setShowModal(false);

    setForm({
      name: "",
      email: "",
      password: "",
      role: "student",
      rollNo: "",
      department: "",
      semester: ""
    });

    fetchUsers();

  } catch (err) {
    alert(err.response?.data?.message || "Error creating user");
  }
};

  const deleteUser = async (id) => {
    if (!window.confirm("Delete this user?")) return;
    await API.delete(`/users/${id}`);
    fetchUsers();
  };

  // Pagination logic
  const indexOfLast = currentPage * usersPerPage;
  const indexOfFirst = indexOfLast - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />

      <div className="flex-1 p-8 ml-64">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              User Management
            </h1>
            <p className="text-gray-500">
              Create, manage and oversee all department users.
            </p>
          </div>

          <button
            onClick={() => setShowModal(true)}
            className="bg-indigo-600 text-white px-5 py-2.5 rounded-lg hover:bg-indigo-700"
          >
            + Add New User
          </button>
        </div>

        {/* Search & Filter */}
        <div className="bg-white p-4 rounded-xl shadow-sm flex flex-col md:flex-row gap-4 justify-between mb-6">
          <div className="relative w-full md:w-1/2">
            <Search
              size={18}
              className="absolute left-3 top-3 text-gray-400"
            />
            <input
              type="text"
              placeholder="Search by name or email..."
              className="w-full pl-10 pr-4 py-2 border rounded-lg"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-4 py-2 border rounded-lg"
          >
            <option value="all">Role: All</option>
            <option value="student">Student</option>
            <option value="faculty">Faculty</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                  Name
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                  Email
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                  Role
                </th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="divide-y">
              {currentUsers.map((user) => (
                <tr key={user._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">{user.name}</td>
                  <td className="px-6 py-4 text-gray-500">{user.email}</td>
                  <td className="px-6 py-4 capitalize">{user.role}</td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => deleteUser(user._id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination */}
          <div className="flex justify-end gap-2 p-4">
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentPage(i + 1)}
                className={`px-3 py-1 rounded ${
                  currentPage === i + 1
                    ? "bg-indigo-600 text-white"
                    : "bg-gray-200"
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
  <div className="fixed inset-0 backdrop-blur-xl bg-opacity-70 flex justify-center items-center">
    <div className="bg-white p-6 rounded-xl w-full max-w-md">
      <h2 className="text-xl font-semibold mb-4">
        Create New User
      </h2>

      {/* Name */}
      <input
        name="name"
        value={form.name}
        placeholder="Name *"
        onChange={handleChange}
        className="w-full border p-2 mb-3 rounded"
      />

      {/* Email */}
      <input
        name="email"
        value={form.email}
        placeholder="Email *"
        onChange={handleChange}
        className="w-full border p-2 mb-3 rounded"
      />

      {/* Password */}
      <input
        name="password"
        type="password"
        value={form.password}
        placeholder="Password *"
        onChange={handleChange}
        className="w-full border p-2 mb-3 rounded"
      />

      {/* Role */}
      <select
        name="role"
        value={form.role}
        onChange={handleChange}
        className="w-full border p-2 mb-3 rounded"
      >
        <option value="student">Student</option>
        <option value="faculty">Faculty</option>
        <option value="admin">Admin</option>
      </select>

      {/* Department (For ALL roles) */}
      <input
        name="department"
        value={form.department}
        placeholder="Department"
        onChange={handleChange}
        className="w-full border p-2 mb-3 rounded"
      />

      {/* Student Only Fields */}
      {form.role === "student" && (
        <>
          <input
            name="rollNo"
            value={form.rollNo}
            placeholder="Roll Number *"
            onChange={handleChange}
            className="w-full border p-2 mb-3 rounded"
          />

          <select
            name="semester"
            value={form.semester}
            onChange={handleChange}
            className="w-full border p-2 mb-4 rounded"
          >
            <option value="">Select Semester</option>
            {[1,2,3,4,5,6,7,8].map((sem) => (
              <option key={sem} value={sem}>
                Semester {sem}
              </option>
            ))}
          </select>
        </>
      )}

      <div className="flex justify-end gap-3">
        <button
          onClick={() => setShowModal(false)}
          className="px-4 py-2 bg-gray-200 rounded"
        >
          Cancel
        </button>

        <button
          onClick={createUser}
          className="px-4 py-2 bg-indigo-600 text-white rounded"
        >
          Create
        </button>
      </div>
    </div>
  </div>
)}
    </div>
  );
}