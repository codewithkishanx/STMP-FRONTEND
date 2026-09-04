import { createContext, useContext, useEffect, useState } from "react";
import api, { setToken } from "../lib/api";
import { disconnectSocket } from "../lib/socket";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [student, setStudent] = useState(null);
  const [mentor, setMentor] = useState(null);
  const [loading, setLoading] = useState(true);

  const refreshProfiles = async (u) => {
    if (!u) {
      setStudent(null);
      setMentor(null);
      return;
    }
    try {
      if (u.role === "student") {
        const { data } = await api.get("/api/students/me");
        setStudent(data.student);
      } else if (u.role === "mentor") {
        const { data } = await api.get("/api/mentors/me");
        setMentor(data.mentor);
      }
    } catch {
      setStudent(null);
      setMentor(null);
    }
  };

  const boot = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/api/auth/me");
      setUser(data.user);
      await refreshProfiles(data.user);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    boot();
  }, []);

  const register = async ({ fullName, email, password, role }) => {
    const { data } = await api.post("/api/auth/register", { fullName, email, password, role });
    if (data.token) setToken(data.token);
    setUser(data.user);
    await refreshProfiles(data.user);
    return data;
  };

  const login = async ({ email, password }) => {
    const { data } = await api.post("/api/auth/login", { email, password });
    if (data.token) setToken(data.token);
    setUser(data.user);
    await refreshProfiles(data.user);
    return data;
  };

  const logout = async () => {
    try {
      await api.post("/api/auth/logout");
    } catch {}
    setToken(null);
    disconnectSocket();
    setUser(null);
    setStudent(null);
    setMentor(null);
  };

  const profileCompleted =
    user?.role === "student"
      ? !!student?.profileCompleted
      : user?.role === "mentor"
        ? !!mentor?.profileCompleted
        : user?.role === "admin";

  const mentorApproved = mentor?.approvalStatus === "approved";

  return (
    <AuthContext.Provider
      value={{ user, student, mentor, loading, profileCompleted, mentorApproved, register, login, logout, refresh: boot, refreshProfiles }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
