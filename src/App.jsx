import { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { RequireAuth, RequireProfile, RequireAdmin } from "./components/Guards";
import Landing from "./pages/Landing";

// Split on top of Landing: auth bundle, profile bundles, hub bundle.
const LoginPage = lazy(() => import("./pages/Auth").then((m) => ({ default: m.LoginPage })));
const RegisterPage = lazy(() => import("./pages/Auth").then((m) => ({ default: m.RegisterPage })));
const StudentProfile = lazy(() => import("./pages/StudentProfile"));
const MentorProfile = lazy(() => import("./pages/MentorProfile"));
const GroupsHub = lazy(() => import("./pages/GroupsHub"));
const Admin = lazy(() => import("./pages/Admin"));

const Fallback = (
  <div style={{ padding: 60, textAlign: "center", fontFamily: "monospace", fontWeight: 700 }}>
    LOADING BOARD…
  </div>
);

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Suspense fallback={Fallback}>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/profile/student" element={<RequireAuth><StudentProfile /></RequireAuth>} />
            <Route path="/profile/mentor" element={<RequireAuth><MentorProfile /></RequireAuth>} />
            <Route path="/groups/*" element={<RequireProfile><GroupsHub /></RequireProfile>} />
            <Route path="/admin/*" element={<RequireAdmin><Admin /></RequireAdmin>} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </AuthProvider>
    </BrowserRouter>
  );
}
