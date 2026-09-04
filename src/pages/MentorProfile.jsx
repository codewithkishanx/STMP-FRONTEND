import { useRef, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Camera, User, Briefcase, Building2, Mail, MessageSquareText, X, CheckCircle2, Save } from "../components/Icon";
import api from "../lib/api";
import { useAuth } from "../context/AuthContext";
import "./Profile.css";

const DEPARTMENTS = ["Computer Science", "Electronics & Communication", "Mechanical", "Civil", "Electrical", "Information Technology", "Other"];
const DESIGNATIONS = ["Assistant Professor", "Associate Professor", "Professor", "Lab Instructor", "Industry Mentor", "PhD Scholar"];

export default function MentorProfile() {
  const { user, mentor, refreshProfiles, logout } = useAuth();
  const navigate = useNavigate();
  const fileRef = useRef(null);
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(mentor?.image?.url || null);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({
    designation: mentor?.designation || "",
    department: mentor?.department || "",
    bio: mentor?.bio || "",
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
      fd.append("designation", form.designation);
      fd.append("department", form.department);
      if (form.bio) fd.append("bio", form.bio);
      if (photoFile) fd.append("photo", photoFile);
      const exists = !!mentor;
      const { data } = exists
        ? await api.put("/api/mentors/me", fd, { headers: { "Content-Type": "multipart/form-data" } })
        : await api.post("/api/mentors/", fd, { headers: { "Content-Type": "multipart/form-data" } });
      if (data.mentor?.image?.url) setPhotoPreview(data.mentor.image.url);
      await refreshProfiles(user);
      setSaved(true);
      setTimeout(() => navigate("/groups", { replace: true }), 1400);
    } catch (err) {
      setError(err.response?.data?.message || "Could not save profile. Is the backend running?");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="prof-root">
      <header className="prof-header">
        <Link to="/" className="prof-logo"><span className="prof-logo-pin teal" />Loomboard</Link>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div className="prof-crumb">Mentor · Profile setup</div>
          <button className="prof-logout" onClick={async () => { await logout(); navigate("/login"); }}>Log out</button>
        </div>
      </header>
      <main className="prof-main">
        <div className="prof-title teal">
          <span className="eyebrow">Step 1 of setup</span>
          <h1>Complete your mentor profile</h1>
          <p>This is what your student groups see at the top of their board.</p>
        </div>
        <form className="prof-panel" onSubmit={save}>
          <div className="prof-photo-side">
            <div className="prof-polaroid tilt-right">
              <div className="prof-avatar-frame round" onClick={() => fileRef.current?.click()}>
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
                <button type="button" className="prof-photo-btn remove" onClick={() => { setPhotoPreview(mentor?.image?.url || null); setPhotoFile(null); }}>
                  <X size={13} /> Remove
                </button>
              )}
            </div>
            <p className="prof-photo-hint">A clear headshot helps students recognize you in the thread.</p>
            <div className="prof-badge"><span className="dot" />Mentor account</div>
            {mentor?.approvalStatus === "pending" && (
              <div className="prof-badge pending" style={{ marginTop: 10 }}><span className="dot" />Awaiting admin approval</div>
            )}
          </div>
          <div className="prof-form-side">
            {saved && <div className="page-ok"><CheckCircle2 size={16} /><span>Profile pinned. {mentor?.approvalStatus === "approved" ? "Taking you to groups…" : "Waiting for admin approval — taking you to groups…"}</span></div>}
            {error && <div className="page-error">{error}</div>}
            <div className="prof-section-label">Basic details</div>
            <div className="prof-grid">
              <div className="prof-field full">
                <label>Full name</label>
                <div className="prof-input-shell readonly"><User size={15} /><input value={user?.fullName || ""} readOnly /></div>
              </div>
              <div className="prof-field">
                <label htmlFor="designation">Designation</label>
                <div className="prof-input-shell teal"><Briefcase size={15} />
                  <select id="designation" value={form.designation} onChange={(e) => setForm({ ...form, designation: e.target.value })} required>
                    <option value="">Select designation</option>
                    {DESIGNATIONS.map((d) => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
              </div>
              <div className="prof-field">
                <label htmlFor="department">Department</label>
                <div className="prof-input-shell teal"><Building2 size={15} />
                  <select id="department" value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} required>
                    <option value="">Select department</option>
                    {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
              </div>
              <div className="prof-field full">
                <label htmlFor="email">Email</label>
                <div className="prof-input-shell readonly"><Mail size={15} /><input value={user?.email || ""} readOnly /></div>
              </div>
              <div className="prof-field full">
                <label htmlFor="bio">Short bio</label>
                <div className="prof-input-shell textarea teal"><MessageSquareText size={15} />
                  <textarea id="bio" rows={3} maxLength={220} placeholder="A line students will see on your mentor card…" value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} />
                </div>
                <div className="prof-char-count">{form.bio.length}/220</div>
              </div>
            </div>
            <div className="prof-footer-row">
              <div className="prof-progress"><strong className="teal">{filled}</strong>/4 complete</div>
              <button type="submit" className="prof-save-btn teal" disabled={busy}><Save size={15} /> {busy ? "Saving…" : "Save profile"}</button>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
}
