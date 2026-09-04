import { useRef, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Camera, Hash, BookOpen, Layers, Mail, X, CheckCircle2, Save } from "../components/Icon";
import api from "../lib/api";
import { useAuth } from "../context/AuthContext";
import "./Profile.css";

const BRANCHES = ["Computer Science", "Electronics & Communication", "Mechanical", "Civil", "Electrical", "Information Technology", "Other"];
const SECTIONS = ["A", "B", "C", "D"];
const SEMESTERS = ["1", "2", "3", "4", "5", "6", "7", "8"];

export default function StudentProfile() {
  const { user, student, refreshProfiles, logout } = useAuth();
  const navigate = useNavigate();
  const fileRef = useRef(null);
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(student?.image?.url || null);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({
    rollNo: student?.rollNo || "",
    branch: student?.department || "",
    section: student?.section || "",
    semester: student?.semester?.toString() || "",
  });

  const filled = Object.values(form).filter((v) => String(v).trim() !== "").length + (photoPreview ? 1 : 0);

  const handlePhoto = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setSaved(false);
      setPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const save = async (e) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const fd = new FormData();
      fd.append("rollNo", form.rollNo);
      fd.append("department", form.branch);
      fd.append("semester", form.semester);
      if (form.section) fd.append("section", form.section);
      if (photoFile) fd.append("photo", photoFile);
      const exists = !!student;
      const { data } = exists
        ? await api.put("/api/students/me", fd, { headers: { "Content-Type": "multipart/form-data" } })
        : await api.post("/api/students/", fd, { headers: { "Content-Type": "multipart/form-data" } });
      if (data.student?.image?.url) setPhotoPreview(data.student.image.url);
      await refreshProfiles(user);
      setSaved(true);
      setTimeout(() => navigate("/groups", { replace: true }), 1200);
    } catch (err) {
      setError(err.response?.data?.message || "Could not save profile. Is the backend running?");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="prof-root">
      <header className="prof-header">
        <Link to="/" className="prof-logo"><span className="prof-logo-pin" />Loomboard</Link>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div className="prof-crumb">Student · Profile setup</div>
          <button className="prof-logout" onClick={async () => { await logout(); navigate("/login"); }}>Log out</button>
        </div>
      </header>
      <main className="prof-main">
        <div className="prof-title">
          <span className="eyebrow">Step 1 of setup</span>
          <h1>Complete your student profile</h1>
          <p>Your mentor and group will see this on your board card.</p>
        </div>
        <form className="prof-panel" onSubmit={save}>
          <div className="prof-photo-side">
            <div className="prof-polaroid">
              <div className="prof-avatar-frame" onClick={() => fileRef.current?.click()}>
                {photoPreview ? <img src={photoPreview} alt="Profile" /> : (
                  <div className="prof-avatar-placeholder"><Camera size={26} /><span>UPLOAD PHOTO</span></div>
                )}
                <div className="prof-avatar-overlay"><Camera size={22} /></div>
              </div>
            </div>
            <input ref={fileRef} type="file" accept="image/*" hidden onChange={handlePhoto} />
            <div className="prof-photo-actions">
              <button type="button" className="prof-photo-btn" onClick={() => fileRef.current?.click()}>
                <Camera size={13} /> {photoPreview ? "Change" : "Upload"}
              </button>
              {photoPreview && (
                <button type="button" className="prof-photo-btn remove" onClick={() => { setPhotoPreview(student?.image?.url || null); setPhotoFile(null); }}>
                  <X size={13} /> Remove
                </button>
              )}
            </div>
            <p className="prof-photo-hint">Square photo works best. JPG or PNG, under 5MB.</p>
          </div>
          <div className="prof-form-side">
            {saved && <div className="page-ok"><CheckCircle2 size={16} /><span>Profile pinned. Taking you to groups…</span></div>}
            {error && <div className="page-error">{error}</div>}
            <div className="prof-section-label">Basic details</div>
            <div className="prof-grid">
              <div className="prof-field">
                <label htmlFor="rollNo">Roll number</label>
                <div className="prof-input-shell"><Hash size={15} />
                  <input id="rollNo" placeholder="21CS0142" value={form.rollNo} onChange={(e) => setForm({ ...form, rollNo: e.target.value })} required />
                </div>
              </div>
              <div className="prof-field">
                <label htmlFor="email">Email</label>
                <div className="prof-input-shell readonly"><Mail size={15} />
                  <input id="email" value={user?.email || ""} readOnly />
                </div>
              </div>
              <div className="prof-field">
                <label htmlFor="branch">Branch</label>
                <div className="prof-input-shell"><BookOpen size={15} />
                  <select id="branch" value={form.branch} onChange={(e) => setForm({ ...form, branch: e.target.value })} required>
                    <option value="">Select branch</option>
                    {BRANCHES.map((b) => <option key={b} value={b}>{b}</option>)}
                  </select>
                </div>
              </div>
              <div className="prof-field">
                <label htmlFor="section">Section</label>
                <div className="prof-input-shell"><Layers size={15} />
                  <select id="section" value={form.section} onChange={(e) => setForm({ ...form, section: e.target.value })}>
                    <option value="">Select section</option>
                    {SECTIONS.map((s) => <option key={s} value={s}>Section {s}</option>)}
                  </select>
                </div>
              </div>
              <div className="prof-field">
                <label htmlFor="semester">Semester</label>
                <div className="prof-input-shell"><Layers size={15} />
                  <select id="semester" value={form.semester} onChange={(e) => setForm({ ...form, semester: e.target.value })} required>
                    <option value="">Select semester</option>
                    {SEMESTERS.map((s) => <option key={s} value={s}>Semester {s}</option>)}
                  </select>
                </div>
              </div>
            </div>
            <div className="prof-footer-row">
              <div className="prof-progress"><strong>{filled}</strong>/5 complete</div>
              <button type="submit" className="prof-save-btn" disabled={busy}><Save size={15} /> {busy ? "Saving…" : "Save profile"}</button>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
}
