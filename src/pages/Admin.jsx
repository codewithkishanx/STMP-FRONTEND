import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { CheckCircle2 } from "../components/Icon";
import api from "../lib/api";
import NotificationBell from "../components/NotificationBell";
import { useAuth } from "../context/AuthContext";
import "./Admin.css";

const initials = (n) => String(n || "?").split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();
const fmtTime = (iso) => { try { return new Date(iso).toLocaleString([], { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }); } catch { return ""; } };
const PROG_COLOR = { submitted: "var(--gold)", reviewed: "var(--green)", "needs-changes": "var(--red)" };
const VERIFY_LABEL = {
  verified: "Verified",
  "no-profile": "No profile",
  "profile-incomplete": "Incomplete",
  "pending-approval": "Pending",
  rejected: "Rejected",
};

function Stats({ stats }) {
  const s = stats || {};
  return (
    <div className="adm-stats">
      <div className="adm-stat">
        <div className="num">{s.totalStudents ?? 0}</div>
        <div className="lbl">Students registered</div>
        <div className="lbl" style={{ color: "var(--green)", marginTop: 2 }}>{s.studentsProfiled ?? 0} verified · {s.unverifiedStudents ?? 0} unverified</div>
      </div>
      <div className="adm-stat">
        <div className="num">{s.totalMentors ?? 0}</div>
        <div className="lbl">Mentors registered</div>
        <div className="lbl" style={{ color: "var(--green)", marginTop: 2 }}>{s.mentorsApproved ?? 0} verified · {s.unverifiedMentors ?? 0} unverified</div>
      </div>
      <div className={"adm-stat" + (s.pendingMentors > 0 ? " hot" : "")}>
        <div className="num">{s.pendingMentors ?? 0}</div>
        <div className="lbl">Pending mentors</div>
      </div>
      <div className="adm-stat">
        <div className="num">{s.totalGroups ?? 0}</div>
        <div className="lbl">Groups</div>
      </div>
      <div className="adm-stat">
        <div className="num">{s.totalProjects ?? 0}</div>
        <div className="lbl">Projects</div>
      </div>
      <div className="adm-stat">
        <div className="num">{s.blockedUsers ?? 0}</div>
        <div className="lbl">Blocked users</div>
      </div>
    </div>
  );
}

function Approvals({ items, onDecide, busy }) {
  const [reasons, setReasons] = useState({});
  const withProfile = items.filter((m) => m._id);
  if (!withProfile.length) return <div className="adm-empty">No pending mentors. The queue is clear.</div>;
  return (
    <div className="adm-queue">
      {withProfile.map((m) => (
        <div className="adm-mentor-card" key={m._id}>
          <div className="adm-mentor-top">
            <div className="adm-avatar">{m.image?.url ? <img src={m.image.url} alt="" /> : initials(m.user?.fullName)}</div>
            <div>
              <strong>{m.user?.fullName || "Mentor"}</strong>
              <span>{m.user?.email || ""}</span>
            </div>
          </div>
          <div className="adm-mentor-meta">
            {m.designation || "—"}{m.department ? ` · ${m.department}` : ""}{m.experience ? ` · ${m.experience}y exp` : ""}
          </div>
          {m.bio && <p className="adm-mentor-bio">{m.bio}</p>}
          <div className="adm-actions">
            <button className="adm-approve" disabled={busy} onClick={() => onDecide(m._id, "approve")}>Approve</button>
            <button className="adm-reject" disabled={busy} onClick={() => onDecide(m._id, "reject", reasons[m._id] || "")}>Reject</button>
          </div>
          <div className="adm-reject-box">
            <input
              placeholder="Rejection reason (for reject)"
              value={reasons[m._id] || ""}
              onChange={(e) => setReasons((r) => ({ ...r, [m._id]: e.target.value }))}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

function BlockCell({ userId, blocked, onBlock, busy }) {
  return (
    <div className="adm-row-actions">
      {blocked ? (
        <button className="go" disabled={busy} onClick={() => onBlock(userId, false)}>Unblock</button>
      ) : (
        <button className="danger" disabled={busy} onClick={() => onBlock(userId, true)}>Block</button>
      )}
    </div>
  );
}

function VerifyTabs({ value, onChange }) {
  return (
    <div className="adm-tabs">
      {[["", "All"], ["true", "Verified"], ["false", "Unverified"]].map(([v, lbl]) => (
        <button key={v} className={"adm-tab" + (value === v ? " active" : "")} onClick={() => onChange(v)}>
          {lbl}
        </button>
      ))}
    </div>
  );
}

function MentorsTable({ rows, groups, page, totalPages, vfilter, onVfilter, onPage, onBlock, onDecide, busy }) {
  const groupsByMentor = {};
  for (const g of groups) {
    const mid = String(g.mentor?._id || g.mentor || "");
    if (mid) {
      groupsByMentor[mid] = groupsByMentor[mid] || [];
      groupsByMentor[mid].push(g);
    }
  }
  return (
    <>
      <VerifyTabs value={vfilter} onChange={onVfilter} />
      <div className="adm-table-wrap">
        <table className="adm-table">
          <thead>
            <tr><th>Mentor</th><th>Department</th><th>Verification</th><th>Groups</th><th>User</th></tr>
          </thead>
          <tbody>
            {rows.map(({ user, profile, verification }) => {
              const gs = profile ? groupsByMentor[String(profile._id)] || [] : [];
              return (
                <tr key={user._id}>
                  <td><strong>{user.fullName || "—"}</strong><br /><span style={{ color: "var(--ink-faint)", fontSize: 12 }}>{user.email}</span></td>
                  <td>{profile?.department || "—"}{profile?.designation ? ` · ${profile.designation}` : ""}</td>
                  <td>
                    <span className={"adm-pill " + (verification === "verified" ? "approved" : verification === "rejected" ? "rejected" : "pending")}>
                      {VERIFY_LABEL[verification]}
                    </span>
                    {user.isBlocked && <span className="adm-pill blocked" style={{ marginLeft: 6 }}>blocked</span>}
                  </td>
                  <td>{gs.length ? gs.map((g) => `${g.name} (${g.students?.length || 0}/${g.maxMembers || 4})`).join(" · ") : "—"}</td>
                  <td>
                    <div className="adm-row-actions">
                      {verification === "pending-approval" && profile && (
                        <>
                          <button className="go" disabled={busy} onClick={() => onDecide(profile._id, "approve")}>Approve</button>
                          <button className="danger" disabled={busy} onClick={() => onDecide(profile._id, "reject", "")}>Reject</button>
                        </>
                      )}
                      <BlockCell userId={user._id} blocked={user.isBlocked} onBlock={onBlock} busy={busy} />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {rows.length === 0 && <div className="adm-empty" style={{ marginTop: 14 }}>No mentors in this view.</div>}
      <div className="pager">
        <button disabled={page <= 1} onClick={() => onPage(page - 1)}>← Prev</button>
        <span>Page {page} of {totalPages}</span>
        <button disabled={page >= totalPages} onClick={() => onPage(page + 1)}>Next →</button>
      </div>
    </>
  );
}

function StudentsTable({ rows, page, totalPages, vfilter, onVfilter, onPage, onBlock, busy }) {
  return (
    <>
      <VerifyTabs value={vfilter} onChange={onVfilter} />
      <div className="adm-table-wrap">
        <table className="adm-table">
          <thead>
            <tr><th>Student</th><th>Roll No</th><th>Department</th><th>Verification</th><th>Group</th><th>User</th></tr>
          </thead>
          <tbody>
            {rows.map(({ user, profile, verification }) => (
              <tr key={user._id}>
                <td><strong>{user.fullName || "—"}</strong><br /><span style={{ color: "var(--ink-faint)", fontSize: 12 }}>{user.email}</span></td>
                <td style={{ fontFamily: "var(--mono)", fontWeight: 700 }}>{profile?.rollNo || "—"}</td>
                <td>{profile?.department || "—"}{profile?.semester ? ` · Sem ${profile.semester}` : ""}</td>
                <td>
                  <span className={"adm-pill " + (verification === "verified" ? "approved" : "pending")}>
                    {VERIFY_LABEL[verification]}
                  </span>
                  {user.isBlocked && <span className="adm-pill blocked" style={{ marginLeft: 6 }}>blocked</span>}
                </td>
                <td>{profile?.groupId ? "In group" : "—"}</td>
                <td><BlockCell userId={user._id} blocked={user.isBlocked} onBlock={onBlock} busy={busy} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {rows.length === 0 && <div className="adm-empty" style={{ marginTop: 14 }}>No students in this view.</div>}
      <div className="pager">
        <button disabled={page <= 1} onClick={() => onPage(page - 1)}>← Prev</button>
        <span>Page {page} of {totalPages}</span>
        <button disabled={page >= totalPages} onClick={() => onPage(page + 1)}>Next →</button>
      </div>
    </>
  );
}

function GroupProgress({ groups }) {
  const [activeId, setActiveId] = useState(groups[0]?._id || null);
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const load = async (gid, p = 1) => {
    if (!gid) return;
    try {
      const { data } = await api.get(`/api/progress/groups/${gid}/progress`, { params: { page: p, limit: 10 } });
      setItems(data.progress || []);
      setPage(data.page || 1);
      setTotalPages(data.totalPages || 1);
    } catch {
      setItems([]);
    }
  };

  useEffect(() => {
    if (groups.length && !activeId) setActiveId(groups[0]._id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groups.length]);

  useEffect(() => {
    if (activeId) load(activeId, 1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeId]);

  const active = groups.find((g) => g._id === activeId);

  if (!groups.length) return <div className="adm-empty">No groups yet. Progress will appear here once mentors create groups.</div>;

  return (
    <div className="adm-progress-layout">
      <div className="adm-group-list">
        <h4>Groups ({groups.length})</h4>
        {groups.map((g) => (
          <div key={g._id} className={"adm-group-item" + (activeId === g._id ? " active" : "")} onClick={() => setActiveId(g._id)}>
            <strong>{g.name}</strong>
            <span>{g.students?.length || 0}/{g.maxMembers || 4} members · {g.status}</span>
          </div>
        ))}
      </div>
      <div className="adm-feed">
        <h4>{active?.name || "Progress"} — feedback + private remarks</h4>
        {items.map((p) => (
          <div className="adm-feed-item" key={p._id}>
            <strong className="t">{p.title}</strong>
            <div className="adm-feed-meta">{fmtTime(p.createdAt)} · <span style={{ color: PROG_COLOR[p.status] }}>{p.status}</span></div>
            {p.description && <p className="adm-feed-note">{p.description}</p>}
            {p.feedback && (
              <div className="adm-feedback">
                <span className="adm-tag" style={{ color: "var(--green)" }}>Mentor feedback (student sees this)</span>
                <p className="adm-feed-note">{p.feedback}</p>
              </div>
            )}
            {p.remark && (
              <div className="adm-remark">
                <span className="adm-tag" style={{ color: "var(--red)" }}>Private remark (mentor + admin only)</span>
                <p className="adm-feed-note" style={{ color: "var(--ink)" }}>{p.remark}</p>
              </div>
            )}
          </div>
        ))}
        {items.length === 0 && <div className="adm-empty">No progress submitted in this group yet.</div>}
        <div className="pager">
          <button disabled={page <= 1} onClick={() => load(activeId, page - 1)}>← Prev</button>
          <span>Page {page} of {totalPages}</span>
          <button disabled={page >= totalPages} onClick={() => load(activeId, page + 1)}>Next →</button>
        </div>
      </div>
    </div>
  );
}

export default function Admin() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [pending, setPending] = useState([]);
  const [mRows, setMRows] = useState([]);
  const [mPage, setMPage] = useState(1);
  const [mPages, setMPages] = useState(1);
  const [mVer, setMVer] = useState("");
  const [sRows, setSRows] = useState([]);
  const [sPage, setSPage] = useState(1);
  const [sPages, setSPages] = useState(1);
  const [sVer, setSVer] = useState("");
  const [groups, setGroups] = useState([]);
  const [error, setError] = useState("");
  const [ok, setOk] = useState("");
  const [busy, setBusy] = useState(false);

  const flash = (setter, msg) => {
    setter(msg);
    setTimeout(() => setter(""), 3000);
  };

  const loadDashboard = async () => {
    const { data } = await api.get("/api/admin/dashboard");
    setStats(data.stats);
    setPending(data.pendingMentors || []);
  };

  const loadMentors = async (p = 1, ver = mVer) => {
    const { data } = await api.get("/api/admin/users", { params: { role: "mentor", page: p, limit: 20, ...(ver ? { verified: ver } : {}) } });
    setMRows(data.users || []);
    setMPage(data.page || 1);
    setMPages(data.totalPages || 1);
  };

  const loadStudents = async (p = 1, ver = sVer) => {
    const { data } = await api.get("/api/admin/users", { params: { role: "student", page: p, limit: 20, ...(ver ? { verified: ver } : {}) } });
    setSRows(data.users || []);
    setSPage(data.page || 1);
    setSPages(data.totalPages || 1);
  };

  const loadGroups = async () => {
    try {
      const { data } = await api.get("/api/groups/", { params: { page: 1, limit: 50 } });
      setGroups(data.groups || []);
    } catch {
      setGroups([]);
    }
  };

  const boot = async () => {
    setError("");
    try {
      await Promise.all([loadDashboard(), loadMentors(1, ""), loadStudents(1, ""), loadGroups()]);
    } catch (err) {
      setError(err.response?.data?.message || "Could not load admin data.");
    }
  };

  useEffect(() => { boot(); /* eslint-disable-next-line */ }, []);

  // Approvals queue shows mentor PROFILES; no-profile accounts can't be approved (nothing to approve).
  const decide = async (id, action, reason = "") => {
    setBusy(true);
    try {
      if (action === "approve") {
        await api.patch(`/api/admin/mentor/${id}/verify`);
        flash(setOk, "Mentor approved.");
      } else {
        await api.patch(`/api/admin/mentor/${id}/reject`, { reason });
        flash(setOk, "Mentor rejected.");
      }
      await Promise.all([loadDashboard(), loadMentors(mPage, mVer)]);
    } catch (err) {
      flash(setError, err.response?.data?.message || "Action failed.");
    } finally {
      setBusy(false);
    }
  };

  const block = async (userId, doBlock) => {
    if (!userId) return;
    setBusy(true);
    try {
      await api.patch(`/api/admin/user/${userId}/${doBlock ? "block" : "unblock"}`);
      flash(setOk, doBlock ? "User blocked." : "User unblocked.");
      await Promise.all([loadDashboard(), loadMentors(mPage, mVer), loadStudents(sPage, sVer)]);
    } catch (err) {
      flash(setError, err.response?.data?.message || "Action failed.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="adm-root">
      <header className="adm-header">
        <Link to="/" className="adm-logo"><span className="adm-logo-pin" />Loomboard · Admin</Link>
        <div className="adm-me">
          <NotificationBell />
          <span>{user?.fullName} · admin</span>
          <button onClick={async () => { await logout(); navigate("/login"); }}>Log out</button>
        </div>
      </header>
      <main className="adm-main">
        <div className="adm-title">
          <span className="eyebrow">Monitor everything</span>
          <h1>Admin dashboard</h1>
          <p>Registered vs verified accounts, mentor metrics, group progress, and approvals. No chats here — students and mentors own their threads.</p>
        </div>
        {error && <div className="page-error">{error}</div>}
        {ok && <div className="page-ok"><CheckCircle2 size={16} /><span>{ok}</span></div>}

        <div className="adm-section">
          <h2>Metrics</h2>
          <p>Live counts across the whole system — registered vs verified.</p>
          <Stats stats={stats} />
        </div>

        <div className="adm-section">
          <h2>Approve mentors ({pending.length} pending)</h2>
          <p>Only approved mentors can create groups and chat.</p>
          <Approvals items={pending} onDecide={decide} busy={busy} />
        </div>

        <div className="adm-section">
          <h2>Mentor metrics</h2>
          <p>Every mentor account — including profiles never completed. Filter by verification.</p>
          <MentorsTable
            rows={mRows} groups={groups} page={mPage} totalPages={mPages} vfilter={mVer}
            onVfilter={(v) => { setMVer(v); loadMentors(1, v); }}
            onPage={(p) => loadMentors(p)} onBlock={block} onDecide={decide} busy={busy}
          />
        </div>

        <div className="adm-section">
          <h2>Students</h2>
          <p>Every student account — including profiles never completed. Blocked users cannot log in.</p>
          <StudentsTable
            rows={sRows} page={sPage} totalPages={sPages} vfilter={sVer}
            onVfilter={(v) => { setSVer(v); loadStudents(1, v); }}
            onPage={(p) => loadStudents(p)} onBlock={block} busy={busy}
          />
        </div>

        <div className="adm-section">
          <h2>Group progress</h2>
          <p>What each group submitted, mentor feedback, and private remarks.</p>
          <GroupProgress groups={groups} />
        </div>
      </main>
    </div>
  );
}
