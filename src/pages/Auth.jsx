import { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { Mail, Lock, User, Eye, EyeOff, GraduationCap, UserCog, ArrowRight, CheckCircle2 } from "../components/Icon";
import { useAuth } from "../context/AuthContext";
import "./Auth.css";

function TextField({ label, icon: Icon, type = "text", placeholder, value, onChange, name }) {
  return (
    <div className="auth-field">
      <label htmlFor={name}>{label}</label>
      <div className="auth-input-shell">
        <Icon size={16} />
        <input id={name} name={name} type={type} placeholder={placeholder} value={value} onChange={onChange} autoComplete="off" />
      </div>
    </div>
  );
}

function PasswordField({ label, name, value, onChange, placeholder }) {
  const [show, setShow] = useState(false);
  return (
    <div className="auth-field">
      <label htmlFor={name}>{label}</label>
      <div className="auth-input-shell">
        <Lock size={16} />
        <input id={name} name={name} type={show ? "text" : "password"} placeholder={placeholder} value={value} onChange={onChange} autoComplete="off" />
        <button type="button" className="auth-eye-btn" onClick={() => setShow((s) => !s)} aria-label={show ? "Hide password" : "Show password"}>
          {show ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
    </div>
  );
}

function BrandPanel() {
  return (
    <div className="auth-left">
      <div className="auth-left-glow" />
      <Link to="/" className="auth-logo" style={{ color: "#fbf7ed" }}><span className="auth-logo-pin" />Loomboard</Link>
      <div className="auth-left-copy">
        <span className="eyebrow">For mentors &amp; student teams</span>
        <h1 className="auth-serif">Every project, <em>pinned</em>.<br />Every group, in one thread.</h1>
        <p>One board where mentors track progress, leave feedback, and student groups stay connected — to their team, and to you.</p>
        <div className="auth-board">
          <div className="auth-board-scene">
            <svg viewBox="0 0 320 190" fill="none">
              <path d="M160,44 C130,80 90,95 46,128" stroke="#b8402a" strokeWidth="1.5" strokeDasharray="1 6" strokeLinecap="round" />
              <path d="M160,44 C165,80 170,100 168,120" stroke="#b8402a" strokeWidth="1.5" strokeDasharray="1 6" strokeLinecap="round" />
              <path d="M160,44 C190,80 230,90 268,110" stroke="#b8402a" strokeWidth="1.5" strokeDasharray="1 6" strokeLinecap="round" />
            </svg>
            <div className="auth-pin-card" style={{ top: 6, left: "34%", zIndex: 3 }}>
              <div className="role">Mentor</div>
              <div className="name">Dr. Osei</div>
              <div className="status"><span className="auth-dot" style={{ background: "#4a8f6b" }} />3 on track</div>
            </div>
            <div className="auth-pin-card card-a">
              <div className="role">Group 4</div>
              <div className="name">Wireframes</div>
              <div className="status"><span className="auth-dot" style={{ background: "#d6a237" }} />Review</div>
            </div>
            <div className="auth-pin-card card-c">
              <div className="role">Group 4</div>
              <div className="name">Report draft</div>
              <div className="status"><span className="auth-dot" style={{ background: "#b8402a" }} />Stuck</div>
            </div>
          </div>
        </div>
      </div>
      <div className="auth-left-meta">
        <div><strong>1 thread</strong>per group, always</div>
        <div><strong>0</strong>feedback lost in email</div>
      </div>
    </div>
  );
}

function nextFor(user) {
  if (!user) return "/groups";
  if (user.role === "admin") return "/admin";
  if (user.role === "student") return "/profile/student";
  if (user.role === "mentor") return "/profile/mentor";
  return "/groups";
}

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const from = location.state?.from || "/groups";

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const data = await login(form);
      navigate(data.user?.role === "admin" ? "/admin" : from === "/groups" ? nextFor(data.user) : from, { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || "Login failed. Check your credentials and that the backend is running.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="auth-root">
      <BrandPanel />
      <div className="auth-right">
        <div className="auth-form-wrap">
          <div className="auth-form-card">
            <div className="auth-tabs">
              <button className="auth-tab active" type="button">Log in<span className="underline" /></button>
              <button className="auth-tab" type="button" onClick={() => navigate("/register")}>Create account<span className="underline" /></button>
            </div>
            <form onSubmit={submit}>
              <div className="auth-heading"><h2 className="auth-serif">Welcome back</h2><p>Log in to your boards and threads.</p></div>
              {error && <div className="page-error">{error}</div>}
              <TextField label="Email" icon={Mail} type="email" name="email" placeholder="you@university.edu" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              <PasswordField label="Password" name="password" placeholder="••••••••" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
              <button type="submit" className="auth-submit" disabled={busy}>{busy ? "Logging in…" : <>Log in <ArrowRight size={16} /></>}</button>
              <div className="auth-switch">New to Loomboard?<button type="button" onClick={() => navigate("/register")}>Create an account</button></div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [role, setRole] = useState("student");
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const mismatch = form.confirm.length > 0 && form.confirm !== form.password;

  const submit = async (e) => {
    e.preventDefault();
    if (mismatch) return;
    setError("");
    setBusy(true);
    try {
      const data = await register({ fullName: form.name, email: form.email, password: form.password, role });
      navigate(nextFor(data.user), { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed. Is the backend running on :5000?");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="auth-root">
      <BrandPanel />
      <div className="auth-right">
        <div className="auth-form-wrap">
          <div className="auth-form-card">
            <div className="auth-tabs">
              <button className="auth-tab" type="button" onClick={() => navigate("/login")}>Log in<span className="underline" /></button>
              <button className="auth-tab active" type="button">Create account<span className="underline" /></button>
            </div>
            <form onSubmit={submit}>
              <div className="auth-heading"><h2 className="auth-serif">Pin your first board</h2><p>Create an account as a mentor or a student.</p></div>
              {error && <div className="page-error">{error}</div>}
              <div className="auth-field">
                <label>I&apos;m joining as</label>
                <div className="auth-role-row">
                  <button type="button" className={"auth-role-btn" + (role === "student" ? " active" : "")} onClick={() => setRole("student")}><GraduationCap size={16} /> Student</button>
                  <button type="button" className={"auth-role-btn" + (role === "mentor" ? " active" : "")} onClick={() => setRole("mentor")}><UserCog size={16} /> Mentor</button>
                </div>
              </div>
              <TextField label="Full name" icon={User} name="name" placeholder="Priya Menon" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              <TextField label="Email" icon={Mail} type="email" name="email" placeholder="you@university.edu" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              <PasswordField label="Password" name="password" placeholder="At least 8 characters" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
              <PasswordField label="Confirm password" name="confirm" placeholder="Re-enter password" value={form.confirm} onChange={(e) => setForm({ ...form, confirm: e.target.value })} />
              {mismatch && <p className="auth-hint warn">Passwords don&apos;t match yet.</p>}
              <div style={{ marginTop: 20 }}>
                <button type="submit" className="auth-submit" disabled={busy || mismatch}>{busy ? "Creating…" : <>Create account <ArrowRight size={16} /></>}</button>
              </div>
              <div className="auth-switch">Already have a board?<button type="button" onClick={() => navigate("/login")}>Log in</button></div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export function AuthSuccessNote() {
  return (
    <div className="page-ok"><CheckCircle2 size={16} /><span>Done. Taking you to your boards now.</span></div>
  );
}
