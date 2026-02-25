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
import StudentAttendanceDashboard from "./pages/StudentAttendanceDashboard";
import FacultyMarks from "./pages/FacultyMarks";
import StudentMarks from "./pages/StudentMarks";
import AdminUsers from "./pages/AdminUsers";
import AdminTimetableList from "./pages/AdminTimetableList";
import AdminTimetableGenerator from "./pages/AdminTimetableGenerator";
import AdminTimetableEditor from "./pages/AdminTimetableEditor";
import FacultyTimetable from "./pages/FacultyTimetable";
import StudentTimetable from "./pages/StudentTimetable";

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

        <Route
          path="/student/dashboard"
          element={
            <ProtectedRoute>
              <StudentAttendanceDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/faculty/marks"
          element={
            <ProtectedRoute>
              <FacultyMarks />
            </ProtectedRoute>
          }
        />

        <Route
          path="/marks"
          element={
            <ProtectedRoute>
              <StudentMarks />
            </ProtectedRoute>
          }
        />

        <Route path="/admin/users" element={<ProtectedRoute><AdminUsers /></ProtectedRoute>} />

        // Admin routes
        <Route path="/admin/timetable" element={<AdminTimetableList />} />
        <Route path="/admin/timetable/generate" element={<AdminTimetableGenerator />} />
        <Route path="/admin/timetable/edit/:weekId" element={<AdminTimetableEditor />} />

        // Faculty route
        <Route path="/faculty/timetable" element={<FacultyTimetable />} />

        // Student route
        <Route path="/student/timetable" element={<StudentTimetable />} />
      </Routes>

    </BrowserRouter>

  );
}

export default App;