import { BrowserRouter as Router, Routes, Route} from "react-router-dom";
import Navbar from "./Components/Navbar";
import Auth from "./Pages/Auth";
import Educator from "./Pages/Educator";
import Student from "./Pages/Student";
import CourseDetail from "./Pages/CourseDetail";
import Home from "./Pages/HomePage";
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider } from "./contexts/AuthContext";
import Mathematics from "./Components/mathematics";
import Physics from "./Components/physics";

function Layout() {
  return (
    <>
      <Routes>
        <Route path="/auth" element={<Auth />} />
        <Route path="/" element={<Home/>} />
        <Route path="/physics" element={<Physics />} />
        <Route path="/mathematics" element={<Mathematics />} />
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
    <div className="scientific-app">
      <AuthProvider>
        <Router>
          <Layout />
        </Router>
      </AuthProvider>
    </div>
  );
}

export default App;
