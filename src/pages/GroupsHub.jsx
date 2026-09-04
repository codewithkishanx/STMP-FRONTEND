import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, Users, MessageCircle, X, Send, CheckCircle2, Clock, ChevronRight, GraduationCap, Lock, LayoutGrid, ClipboardList, MessagesSquare } from "../components/Icon";
import api from "../lib/api";
import { getSocket } from "../lib/socket";
import NotificationBell from "../components/NotificationBell";
import { useAuth } from "../context/AuthContext";
import "./GroupsHub.css";

const STATUS_META = {
  active: { label: "Active", color: "var(--green)" },
  completed: { label: "Completed", color: "var(--teal)" },
  archived: { label: "Archived", color: "var(--ink-faint)" },
};
const PROG_COLOR = { submitted: "var(--gold)", reviewed: "var(--green)", "needs-changes": "var(--red)" };
const AVATAR_COLORS = ["var(--red)", "var(--teal)", "#8a6512", "#6b4f8a", "#3d6f8c"];

const mentorName = (m) => m?.user?.fullName || `${m?.designation || "Mentor"}${m?.department ? ` · ${m.department}` : ""}`;
const studentName = (s) => s?.user?.fullName || s?.rollNo || "Student";
const initials = (n) => String(n || "?").split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();
const colorFor = (n) => AVATAR_COLORS[String(n || "").split("").reduce((a, c) => a + c.charCodeAt(0), 0) % AVATAR_COLORS.length];
const fmtTime = (iso) => { try { return new Date(iso).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }); } catch { return ""; } };

/* ================= BROWSE ================= */

function GroupCard({ group, joined, requested, onView, onJoin }) {
  const meta = STATUS_META[group.status] || STATUS_META.active;
  const full = (group.students?.length || 0) >= (group.maxMembers || 4);
  return (
    <div className="ghub-card" onClick={() => onView(group)}>
      <div className="ghub-card-top">
        <span className="ghub-card-tag">{group.leader ? `Led · ${studentName(group.leader)}` : "Open group"}</span>
        <span className="ghub-status" style={{ color: meta.color }}><span className="ghub-dot" style={{ background: meta.color }} />{meta.label}</span>
      </div>
      <h3 className="ghub-serif">{group.name}</h3>
      <div className="ghub-card-mentor"><GraduationCap size={13} /> {mentorName(group.mentor)}</div>
      <div style={{ display: "flex", alignItems: "center" }}>
        <div className="ghub-avatars">
          {(group.students || []).slice(0, 4).map((m) => (
            <div className="ghub-mini-avatar" key={m._id} title={studentName(m)}>{initials(studentName(m))}</div>
          ))}
        </div>
        <span className="ghub-slots">{group.students?.length || 0}/{group.maxMembers || 4} members</span>
      </div>
      <div className="ghub-card-footer">
        <span className="ghub-viewlink">View details <ChevronRight size={13} /></span>
        <button
          className={"ghub-join-btn" + (joined || requested ? " requested" : full ? " full" : "")}
          onClick={(e) => { e.stopPropagation(); if (!full && !joined && !requested) onJoin(group); }}
        >
          {joined ? (<><CheckCircle2 size={13} /> Joined</>) : full ? "Full" : requested ? (<><Clock size={13} /> Requested</>) : "Join group"}
        </button>
      </div>
    </div>
  );
}

function GroupDrawer({ group, open, onClose, joined, requested, onJoin, busy }) {
  if (!group) return null;
  const meta = STATUS_META[group.status] || STATUS_META.active;
  const full = (group.students?.length || 0) >= (group.maxMembers || 4);
  return (
    <>
      <div className={"ghub-backdrop" + (open ? " open" : "")} onClick={onClose} />
      <div className={"ghub-drawer" + (open ? " open" : "")}>
        <div className="ghub-drawer-head">
          <div>
            <h2 className="ghub-serif">{group.name}</h2>
            <span className="ghub-card-tag">{group.description || "Project group"}</span>
          </div>
          <button className="ghub-close-btn" onClick={onClose}><X size={20} /></button>
        </div>
        <div className="ghub-drawer-body">
          <div className="ghub-drawer-section">
            <h4>Mentor</h4>
            <div className="ghub-mentor-row">
              <div className="ghub-mentor-avatar">{initials(mentorName(group.mentor))}</div>
              <div><strong>{mentorName(group.mentor)}</strong><span>{group.mentor?.designation || ""}{group.mentor?.department ? ` · ${group.mentor.department}` : ""}</span></div>
            </div>
          </div>
          <div className="ghub-drawer-section">
            <h4>Status</h4>
            <div className="ghub-status" style={{ color: meta.color, fontSize: 13 }}>
              <span className="ghub-dot" style={{ background: meta.color }} />{meta.label} · {group.students?.length || 0}/{group.maxMembers || 4} members
            </div>
          </div>
          <div className="ghub-drawer-section">
            <h4>Members ({group.students?.length || 0}/{group.maxMembers || 4})</h4>
            {(group.students || []).map((m) => (
              <div className="ghub-member-row" key={m._id}>
                <div className="ghub-member-avatar" style={{ background: colorFor(studentName(m)) }}>{initials(studentName(m))}</div>
                <div><strong>{studentName(m)}</strong><span>{m.rollNo || ""}{m.department ? ` · ${m.department}` : ""}</span></div>
              </div>
            ))}
          </div>
        </div>
        <div className="ghub-drawer-footer">
          <button
            className={"ghub-join-btn" + (joined || requested ? " requested" : full ? " full" : "")}
            disabled={busy}
            onClick={() => { if (!full && !joined && !requested) onJoin(group); }}
          >
            {joined ? (<><CheckCircle2 size={14} /> You&apos;re in this group</>) : full ? (<><Lock size={14} /> Group is full</>) : requested ? (<><Clock size={14} /> Request sent — mentor/leader must approve</>) : (<>Request to join</>)}
          </button>
        </div>
      </div>
    </>
  );
}

function BrowseGroups({ myGroupId, onChanged }) {
  const { user } = useAuth();
  const [groups, setGroups] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [requested, setRequested] = useState([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const load = async (p = 1) => {
    setError("");
    try {
      const { data } = await api.get("/api/groups/", { params: { page: p, limit: 12 } });
      setGroups(data.groups || []);
      setPage(data.page || 1);
      setTotalPages(data.totalPages || 1);
    } catch (err) {
      setError(err.response?.data?.message || "Could not load groups.");
    }
  };

  useEffect(() => { load(1); }, []);

  const filtered = groups.filter((g) => (g.name + (g.description || "") + mentorName(g.mentor)).toLowerCase().includes(query.toLowerCase()));
  const openGroup = async (g) => {
    setSelected(g);
    setDrawerOpen(true);
    try {
      const { data } = await api.get(`/api/groups/${g._id}`);
      setSelected(data.group);
    } catch {}
  };

  const join = async (g) => {
    setBusy(true);
    setError("");
    try {
      await api.post(`/api/groups/${g._id}/request`, {});
      setRequested((r) => [...r, g._id]);
    } catch (err) {
      setError(err.response?.data?.message || "Request failed.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <div className="ghub-title">
        <span className="eyebrow">Groups</span>
        <h1 className="ghub-serif">Browse &amp; join a group</h1>
        <p>Only approved mentors create groups. Request to join one with an open seat — the mentor or team leader approves.</p>
      </div>
      {user?.role === "student" && myGroupId && (
        <div className="ghub-pending-wall">You&apos;re already in a group (one-group rule). Leave it from <strong>My group</strong> before joining another.</div>
      )}
      {error && <div className="page-error">{error}</div>}
      <div className="ghub-toolbar">
        <div className="ghub-search">
          <Search size={15} />
          <input placeholder="Search by project or mentor…" value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
      </div>
      <div className="ghub-grid">
        {filtered.map((g) => (
          <GroupCard key={g._id} group={g} joined={myGroupId === g._id} requested={requested.includes(g._id)} onView={openGroup} onJoin={join} />
        ))}
      </div>
      {filtered.length === 0 && <p style={{ color: "var(--ink-soft)", fontSize: 14, marginTop: 20 }}>No groups found.</p>}
      <div className="pager">
        <button disabled={page <= 1} onClick={() => load(page - 1)}>← Prev</button>
        <span>Page {page} of {totalPages}</span>
        <button disabled={page >= totalPages} onClick={() => load(page + 1)}>Next →</button>
      </div>
      <GroupDrawer group={selected} open={drawerOpen} onClose={() => setDrawerOpen(false)} joined={selected && myGroupId === selected._id} requested={selected && requested.includes(selected._id)} onJoin={join} busy={busy} />
    </div>
  );
}

/* ================= MY GROUP ================= */

function TeamChat({ group }) {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [hasMore, setHasMore] = useState(false);
  const scrollRef = useRef(null);

  const load = async (before) => {
    const { data } = await api.get(`/api/chat/group/${group._id}`, { params: { limit: 30, ...(before ? { before } : {}) } });
    if (before) setMessages((m) => [...data.messages, ...m]);
    else {
      setMessages(data.messages || []);
      requestAnimationFrame(() => scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight }));
    }
    setHasMore((data.messages || []).length >= 30);
  };

  useEffect(() => {
    load();
    let sock = null;
    let cancelled = false;
    const onMsg = (msg) => {
      if (String(msg.group) === String(group._id)) {
        setMessages((m) => [...m, msg]);
        requestAnimationFrame(() => scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" }));
      }
    };
    Promise.resolve(getSocket()).then((s) => {
      if (cancelled || !s?.emit) return;
      sock = s;
      s.emit("group:join", group._id);
      s.on("group:message", onMsg);
    });
    return () => { cancelled = true; sock?.off?.("group:message", onMsg); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [group._id]);

  const send = async () => {
    const body = input.trim();
    if (!body) return;
    setInput("");
    try {
      const { data } = await api.post(`/api/chat/group/${group._id}`, { body });
      setMessages((m) => [...m, { ...data.message, from: { _id: user.id, fullName: user.fullName } }]);
      requestAnimationFrame(() => scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" }));
    } catch {}
  };

  return (
    <div className="ghub-chat-wrap">
      <div className="ghub-chat-head">
        <div className="ghub-chat-avatar" style={{ background: "var(--red)" }}><Users size={17} /></div>
        <div>
          <strong>{group.name} — Team thread</strong>
          <div className="ghub-chat-status">{group.students?.length || 0} teammates · mentor sees this thread</div>
        </div>
      </div>
      <div className="ghub-chat-msgs" ref={scrollRef}>
        {hasMore && <button className="ghub-chip" onClick={() => messages[0] && load(messages[0].createdAt)}>Load older messages</button>}
        {messages.map((m) => {
          const mine = String(m.from?._id || m.from) === String(user.id);
          const sender = mine ? "You" : m.from?.fullName || "Member";
          return (
            <div className={"ghub-msg " + (mine ? "me" : "them")} key={m._id}>
              {!mine && <div className="ghub-msg-sender">{sender}</div>}
              <div className="ghub-bubble">{m.body}</div>
              <div className="ghub-msg-time">{fmtTime(m.createdAt)}</div>
            </div>
          );
        })}
        {messages.length === 0 && <p style={{ color: "var(--ink-faint)", fontSize: 13, textAlign: "center" }}>No messages yet — say hi to your team.</p>}
      </div>
      <div className="ghub-chat-input-row">
        <input placeholder="Message your team…" value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send()} />
        <button className="ghub-send-btn" onClick={send} disabled={!input.trim()}><Send size={16} /></button>
      </div>
    </div>
  );
}

function ProgressPanel({ group }) {
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const load = async (p = 1) => {
    try {
      const { data } = await api.get(`/api/progress/groups/${group._id}/progress`, { params: { page: p, limit: 10 } });
      setItems(data.progress || []);
      setPage(data.page || 1);
      setTotalPages(data.totalPages || 1);
    } catch {}
  };

  useEffect(() => { load(1); }, [group._id]);

  const submit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    setBusy(true);
    setError("");
    try {
      await api.post(`/api/progress/groups/${group._id}/progress`, { title, description });
      setTitle("");
      setDescription("");
      load(1);
    } catch (err) {
      setError(err.response?.data?.message || "Submit failed.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <div className="ghub-submit-form">
        <h4>Submit a progress update</h4>
        <form onSubmit={submit}>
          {error && <div className="page-error">{error}</div>}
          <div className="ghub-field">
            <label>Title</label>
            <div className="ghub-input-shell2"><input style={{ border: "none", outline: "none", flex: 1, fontSize: 14, background: "transparent" }} placeholder="e.g. Auth API milestone" value={title} onChange={(e) => setTitle(e.target.value)} /></div>
          </div>
          <div className="ghub-field">
            <label>Update note</label>
            <div className="ghub-input-shell2">
              <textarea rows={3} placeholder="What did you work on? What's next?" value={description} onChange={(e) => setDescription(e.target.value)} />
            </div>
          </div>
          <button type="submit" className="ghub-submit-btn" disabled={busy}><ClipboardList size={15} /> {busy ? "Submitting…" : "Submit update"}</button>
        </form>
      </div>
      <div className="ghub-milestones-list">
        <h4>Updates &amp; mentor feedback</h4>
        {items.map((p) => (
          <div className="ghub-feed-item" key={p._id}>
            <div className="ghub-feed-avatar" style={{ background: colorFor(p.title) }}>{initials(p.title)}</div>
            <div className="ghub-feed-body">
              <strong>{p.title}</strong>
              <div className="ghub-feed-meta">{fmtTime(p.createdAt)}</div>
              {p.description && <p className="ghub-feed-note">{p.description}</p>}
              {p.feedback && <p className="ghub-feed-note"><strong>Mentor feedback:</strong> {p.feedback}</p>}
              <div className="ghub-feed-status" style={{ color: PROG_COLOR[p.status] || "var(--ink-faint)" }}>
                <span className="ghub-dot" style={{ background: PROG_COLOR[p.status] || "var(--ink-faint)" }} /> {p.status}
              </div>
            </div>
          </div>
        ))}
        {items.length === 0 && <p style={{ color: "var(--ink-faint)", fontSize: 13 }}>No updates yet.</p>}
        <div className="pager">
          <button disabled={page <= 1} onClick={() => load(page - 1)}>← Prev</button>
          <span>Page {page} of {totalPages}</span>
          <button disabled={page >= totalPages} onClick={() => load(page + 1)}>Next →</button>
        </div>
      </div>
    </div>
  );
}

function MyGroup({ group, refresh }) {
  const [sub, setSub] = useState("chat");
  const [leaving, setLeaving] = useState(false);

  if (!group) {
    return (
      <div>
        <div className="ghub-title">
          <span className="eyebrow">My group</span>
          <h1 className="ghub-serif">You haven&apos;t joined a group yet</h1>
          <p>Head to the Groups tab and request to join one — this space will hold your team chat and progress once you&apos;re in.</p>
        </div>
        <div className="ghub-chat-wrap">
          <div className="ghub-locked">
            <Lock size={30} />
            <h3>No group yet</h3>
            <p>Once your request is accepted, you&apos;ll see your team&apos;s chat and progress here.</p>
          </div>
        </div>
      </div>
    );
  }

  const meta = STATUS_META[group.status] || STATUS_META.active;

  const leave = async () => {
    if (!confirm("Leave this group? You can join another afterwards.")) return;
    setLeaving(true);
    try {
      await api.post(`/api/groups/${group._id}/leave`);
      refresh();
    } catch (err) {
      alert(err.response?.data?.message || "Could not leave.");
    } finally {
      setLeaving(false);
    }
  };

  return (
    <div>
      <div className="ghub-title">
        <span className="eyebrow">My group</span>
        <h1 className="ghub-serif">{group.name}</h1>
        <p>Chat with your teammates, track milestones, and submit progress your mentor will see.</p>
      </div>
      <div className="ghub-overview">
        <div className="ghub-overview-left">
          <h2 className="ghub-serif">{group.description || "Project group"}</h2>
          <div className="ghub-card-mentor"><GraduationCap size={13} /> Mentored by {mentorName(group.mentor)}</div>
        </div>
        <div className="ghub-overview-right" style={{ display: "flex", alignItems: "center", gap: 22 }}>
          <div className="ghub-status" style={{ color: meta.color }}>
            <span className="ghub-dot" style={{ background: meta.color }} /> {meta.label} · {group.students?.length || 0}/{group.maxMembers || 4}
          </div>
          <button className="ghub-chip" onClick={leave} disabled={leaving}>{leaving ? "Leaving…" : "Leave group"}</button>
        </div>
      </div>
      <div className="ghub-subtabs">
        <button className={"ghub-subtab" + (sub === "chat" ? " active" : "")} onClick={() => setSub("chat")}><MessagesSquare size={15} /> Team chat</button>
        <button className={"ghub-subtab" + (sub === "progress" ? " active" : "")} onClick={() => setSub("progress")}><ClipboardList size={15} /> Progress &amp; updates</button>
      </div>
      <div className="ghub-mygroup-layout">
        <div className="ghub-side-card">
          <h4>Team ({group.students?.length || 0})</h4>
          {(group.students || []).map((m) => (
            <div className="ghub-member-row" key={m._id}>
              <div className="ghub-member-avatar" style={{ background: colorFor(studentName(m)) }}>{initials(studentName(m))}</div>
              <div><strong>{studentName(m)}</strong><span>{m.rollNo || ""}</span></div>
            </div>
          ))}
        </div>
        {sub === "chat" ? <TeamChat group={group} /> : <ProgressPanel group={group} />}
      </div>
    </div>
  );
}

/* ================= MENTOR CHAT ================= */

function MentorChat() {
  const { user } = useAuth();
  const [mentors, setMentors] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [activeId, setActiveId] = useState(null);
  const [threads, setThreads] = useState({});
  const [input, setInput] = useState("");
  const scrollRef = useRef(null);

  const loadMentors = async (p = 1) => {
    try {
      const { data } = await api.get("/api/mentors/available", { params: { page: p, limit: 20, ...(search ? { search } : {}) } });
      setMentors(data.mentors || []);
      setPage(data.page || 1);
      setTotalPages(data.totalPages || 1);
      if (!activeId && data.mentors?.length) setActiveId(data.mentors[0]._id);
    } catch {}
  };

  useEffect(() => { loadMentors(1); /* eslint-disable-next-line */ }, []);

  const active = mentors.find((m) => m._id === activeId);
  const messages = (activeId && threads[activeId]) || [];

  const loadHistory = async (mid) => {
    const m = mentors.find((x) => x._id === mid);
    const uid = m?.user?._id || m?.user;
    if (!uid || threads[mid]) return;
    try {
      const { data } = await api.get(`/api/chat/direct/${uid}`, { params: { limit: 30 } });
      setThreads((t) => ({ ...t, [mid]: (data.messages || []).map((x) => ({ from: String(x.from?._id || x.from) === String(user.id) ? "me" : "them", text: x.body, time: fmtTime(x.createdAt) })) }));
    } catch {}
  };

  useEffect(() => {
    if (activeId) loadHistory(activeId);
    let sock = null;
    let cancelled = false;
    const onDirect = (msg) => {
      const otherUid = String(msg.from?._id || msg.from) === String(user.id) ? msg.toUser : (msg.from?._id || msg.from);
      const mid = mentors.find((x) => String(x.user?._id || x.user) === String(otherUid))?._id;
      if (mid) {
        setThreads((t) => ({ ...t, [mid]: [...(t[mid] || []), { from: String(msg.from?._id || msg.from) === String(user.id) ? "me" : "them", text: msg.body, time: fmtTime(msg.createdAt) }] }));
        requestAnimationFrame(() => scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" }));
      }
    };
    Promise.resolve(getSocket()).then((s) => {
      if (cancelled || !s?.on) return;
      sock = s;
      s.on("direct:message", onDirect);
    });
    return () => { cancelled = true; sock?.off?.("direct:message", onDirect); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeId, mentors.length]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [messages.length, activeId]);

  const send = async (text) => {
    const value = (text ?? input).trim();
    if (!value || !active) return;
    const uid = active.user?._id || active.user;
    setInput("");
    const time = new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
    setThreads((t) => ({ ...t, [activeId]: [...(t[activeId] || []), { from: "me", text: value, time }] }));
    try {
      await api.post("/api/chat/direct", { to: uid, body: value });
    } catch {}
  };

  return (
    <div>
      <div className="ghub-title">
        <span className="eyebrow">Mentors</span>
        <h1 className="ghub-serif">Chat with any mentor</h1>
        <p>Reach any approved mentor for guidance. After joining a group, your mentor reviews your progress there.</p>
      </div>
      <div className="ghub-mygroup-layout">
        <div className="ghub-side-card">
          <h4>Approved mentors</h4>
          <div className="ghub-search" style={{ marginBottom: 10 }}>
            <Search size={14} />
            <input placeholder="Search…" value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => e.key === "Enter" && loadMentors(1)} />
          </div>
          {mentors.map((m) => (
            <div key={m._id} className={"ghub-mentor-list-item" + (activeId === m._id ? " active" : "")} onClick={() => setActiveId(m._id)}>
              <div className="ghub-mentor-avatar" style={{ background: colorFor(mentorName(m)) }}>{initials(mentorName(m))}</div>
              <div><strong>{mentorName(m)}</strong><span>{m.designation || ""}{m.department ? ` · ${m.department}` : ""}</span></div>
            </div>
          ))}
          {mentors.length === 0 && <p style={{ fontSize: 12, color: "var(--ink-faint)" }}>No approved mentors yet.</p>}
          <div className="pager">
            <button disabled={page <= 1} onClick={() => loadMentors(page - 1)}>←</button>
            <span>{page}/{totalPages}</span>
            <button disabled={page >= totalPages} onClick={() => loadMentors(page + 1)}>→</button>
          </div>
        </div>
        <div className="ghub-chat-wrap">
          {!active ? (
            <div className="ghub-locked"><Lock size={30} /><h3>No mentor selected</h3><p>Pick a mentor from the list to start chatting.</p></div>
          ) : (
            <>
              <div className="ghub-chat-head">
                <div className="ghub-chat-avatar" style={{ background: colorFor(mentorName(active)) }}>{initials(mentorName(active))}</div>
                <div>
                  <strong>{mentorName(active)}</strong>
                  <div className="ghub-chat-status">{active.designation || "Mentor"}{active.department ? ` · ${active.department}` : ""}</div>
                </div>
              </div>
              <div className="ghub-chat-msgs" ref={scrollRef}>
                {messages.map((m, i) => (
                  <div className={"ghub-msg " + (m.from === "me" ? "me" : "them")} key={i}>
                    <div className="ghub-bubble">{m.text}</div>
                    <div className="ghub-msg-time">{m.time}</div>
                  </div>
                ))}
                {messages.length === 0 && <p style={{ color: "var(--ink-faint)", fontSize: 13, textAlign: "center" }}>No messages yet — say hello.</p>}
              </div>
              <div className="ghub-chips">
                {["Can we get an extension?", "Ready for feedback", "Quick question about scope"].map((c) => (
                  <button className="ghub-chip" key={c} onClick={() => send(c)}>{c}</button>
                ))}
              </div>
              <div className="ghub-chat-input-row">
                <input placeholder={`Message ${mentorName(active)}…`} value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send()} />
                <button className="ghub-send-btn" onClick={() => send()} disabled={!input.trim()}><Send size={16} /></button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/* ================= ROOT ================= */

export default function GroupsHub() {
  const { user, student, mentor, mentorApproved, logout } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState("browse");
  const [myGroup, setMyGroup] = useState(null);

  const loadMyGroup = async () => {
    if (user?.role !== "student") return;
    try {
      const { data } = await api.get("/api/students/me");
      const gid = data.student?.groupId?._id || data.student?.groupId;
      if (gid) {
        const g = await api.get(`/api/groups/${gid}`);
        setMyGroup(g.data.group);
      } else setMyGroup(null);
    } catch {
      setMyGroup(null);
    }
  };

  useEffect(() => {
    loadMyGroup();
    getSocket();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const displayName = user?.fullName || "Member";

  return (
    <div className="ghub-root">
      <header className="ghub-header">
        <Link to="/" className="ghub-logo"><span className="ghub-logo-pin" />Loomboard</Link>
        <div className="ghub-me">
          <NotificationBell onNavigate={(n) => {
            if (n.type === "request-received" || n.type === "request-decided") setTab("browse");
            if (n.type === "progress-submitted" || n.type === "review-added") setTab("mygroup");
            if (n.type === "chat") setTab("mentor");
          }} />
          <span>{displayName} · {user?.role}</span>
          <div className="ghub-me-avatar">{initials(displayName)}</div>
          <button onClick={async () => { await logout(); navigate("/login"); }}>Log out</button>
        </div>
      </header>
      <div className="ghub-body">
        <nav className="ghub-nav">
          <button className={"ghub-nav-item" + (tab === "browse" ? " active" : "")} onClick={() => setTab("browse")}><LayoutGrid size={16} /> Groups</button>
          {user?.role === "student" && (
            <button className={"ghub-nav-item" + (tab === "mygroup" ? " active" : "")} onClick={() => setTab("mygroup")}>
              <Users size={16} /> My group{myGroup && <span className="ghub-nav-badge">✓</span>}
            </button>
          )}
          {user?.role !== "admin" && (
            <button className={"ghub-nav-item" + (tab === "mentor" ? " active" : "")} onClick={() => setTab("mentor")}><MessageCircle size={16} /> Mentor chat</button>
          )}
          {user?.role === "admin" && (
            <button className="ghub-nav-item" onClick={() => navigate("/admin")}>Admin dashboard</button>
          )}
        </nav>
        <main className="ghub-main">
          {user?.role === "mentor" && !mentorApproved && (
            <div className="ghub-pending-wall">Your mentor profile is <strong>pending admin approval</strong>. You can browse groups, but creating groups and full chat unlock after approval.</div>
          )}
          {tab === "browse" && <BrowseGroups myGroupId={myGroup?._id} onChanged={loadMyGroup} />}
          {tab === "mygroup" && user?.role === "student" && <MyGroup group={myGroup} refresh={loadMyGroup} />}
          {tab === "mentor" && user?.role !== "admin" && <MentorChat />}
        </main>
      </div>
    </div>
  );
}
