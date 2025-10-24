import { BrowserRouter as Router, Routes, Route} from "react-router-dom";
import Navbar from "./Components/Navbar";
import Auth from "./Pages/Auth";
import Educator from "./Pages/Educator";
import Student from "./Pages/Student";
import CourseDetail from "./Pages/CourseDetail";
import Home from "./Pages/HomePage";
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider } from "./contexts/AuthContext";

function Layout() {
  return (
    <>
      <Routes>
        <Route path="/auth" element={<Auth />} />
        <Route path="/" element={<Home/>} />
        <Route path="/student" element={
          <ProtectedRoute requiredRole="student">
            <Student/>
          </ProtectedRoute>
        } />
        <Route path="/educator" element={
          <ProtectedRoute requiredRole="educator">
            <Educator />
          </ProtectedRoute>
        } />
        <Route path="/course/:courseId" element={
          <ProtectedRoute requiredRole="student">
            <CourseDetail />
          </ProtectedRoute>
        } />
      </Routes>
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Layout />
      </Router>
    </AuthProvider>
  );
}

export default App;
