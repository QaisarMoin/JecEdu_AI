import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Subjects from "./pages/Subjects";
import Notices from "./pages/Notices";
import Attendance from "./pages/Attendance";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminSubjects from "./pages/AdminSubjects";
import FacultyAttendance from "./pages/FacultyAttendance";
import AttendanceHistory from "./pages/AttendanceHistory";
import AttendanceAnalytics from "./pages/AttendanceAnalytics";

function App() {

  return (

    <BrowserRouter>

      <Routes>

        <Route path="/" element={<Login />} />
        <Route path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route path="/subjects"
          element={
            <ProtectedRoute>
              <Subjects />
            </ProtectedRoute>
          }
        />

        <Route path="/notices"
          element={
            <ProtectedRoute>
              <Notices />
            </ProtectedRoute>
          }
        />

        <Route path="/attendance"
          element={
            <ProtectedRoute>
              <Attendance />
            </ProtectedRoute>
          }
        />

        <Route path="/admin/subjects"
          element={
            <ProtectedRoute>
              <AdminSubjects />
            </ProtectedRoute>
          }
        />

        <Route path="/faculty/attendance"
          element={
            <ProtectedRoute>
              <FacultyAttendance />
            </ProtectedRoute>
          }
        />

        <Route
          path="/faculty/history"
          element={
            <ProtectedRoute>
              <AttendanceHistory />
            </ProtectedRoute>
          }
        />

        <Route
          path="/faculty/analytics"
          element={
            <ProtectedRoute>
              <AttendanceAnalytics />
            </ProtectedRoute>
          }
        />

      </Routes>

    </BrowserRouter>

  );
}

export default App;