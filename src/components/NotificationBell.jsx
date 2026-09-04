import { useEffect, useRef, useState } from "react";
import { Bell, BellRing } from "./Icon";
import api from "../lib/api";
import { getSocket } from "../lib/socket";
import "./NotificationBell.css";

const LABELS = {
  "mentor-approved": "Your mentor profile was approved",
  "request-received": "New request needs your decision",
  "request-decided": "Your join request was decided",
  "group-created": "A new group was created",
  "progress-submitted": "New progress submitted",
  "review-added": "Mentor reviewed progress",
  chat: "New message",
};

const labelFor = (n) => n.text || LABELS[n.type] || "Notification";
const fmtTime = (iso) => {
  try {
    const d = new Date(iso);
    const mins = Math.floor((Date.now() - d.getTime()) / 60000);
    if (mins < 1) return "now";
    if (mins < 60) return `${mins}m ago`;
    if (mins < 1440) return `${Math.floor(mins / 60)}h ago`;
    return d.toLocaleDateString([], { month: "short", day: "numeric" });
  } catch {
    return "";
  }
};

export default function NotificationBell({ onNavigate }) {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([]);
  const [unread, setUnread] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const boxRef = useRef(null);

  const load = async (p = 1, append = false) => {
    try {
      const { data } = await api.get("/api/notifications/", { params: { page: p, limit: 15 } });
      setItems((prev) => (append ? [...prev, ...(data.notifications || [])] : data.notifications || []));
      setUnread(data.unread || 0);
      setPage(data.page || 1);
      setTotalPages(data.totalPages || 1);
    } catch {}
  };

  useEffect(() => {
    load(1);
    let sock = null;
    let cancelled = false;
    const onNotify = (n) => {
      setItems((prev) => [n, ...prev].slice(0, 60));
      setUnread((u) => u + 1);
    };
    Promise.resolve(getSocket()).then((s) => {
      if (cancelled || !s?.on) return;
      sock = s;
      s.on("notify", onNotify);
    });
    const poll = setInterval(() => load(1), 30000);
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    const onClick = (e) => {
      if (boxRef.current && !boxRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onClick);
    return () => {
      cancelled = true;
      sock?.off?.("notify", onNotify);
      clearInterval(poll);
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onClick);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const markOne = async (n) => {
    try {
      await api.patch(`/api/notifications/${n._id}/read`);
      setItems((prev) => prev.map((x) => (x._id === n._id ? { ...x, read: true } : x)));
      setUnread((u) => Math.max(0, u - 1));
    } catch {}
    if (onNavigate) onNavigate(n);
  };

  const markAll = async () => {
    try {
      await api.patch("/api/notifications/read-all");
      setItems((prev) => prev.map((x) => ({ ...x, read: true })));
      setUnread(0);
    } catch {}
  };

  return (
    <div className="nb-wrap" ref={boxRef}>
      <button
        className={"nb-bell" + (unread > 0 ? " has-unread" : "")}
        onClick={() => { setOpen((o) => !o); if (!open) load(1); }}
        aria-label={`Notifications${unread ? `, ${unread} unread` : ""}`}
      >
        {unread > 0 ? <BellRing size={17} /> : <Bell size={17} />}
        {unread > 0 && <span className="nb-badge">{unread > 9 ? "9+" : unread}</span>}
      </button>
      {open && (
        <div className="nb-panel">
          <div className="nb-head">
            <strong>Notifications</strong>
            <button className="nb-all" onClick={markAll} disabled={unread === 0}>Mark all read</button>
          </div>
          <div className="nb-list">
            {items.map((n) => (
              <div key={n._id} className={"nb-item" + (n.read ? "" : " unread")} onClick={() => markOne(n)}>
                <span className="nb-type">{n.type?.replace(/-/g, " ")}</span>
                <p>{labelFor(n)}</p>
                <span className="nb-time">{fmtTime(n.createdAt)}</span>
              </div>
            ))}
            {items.length === 0 && <div className="nb-empty">No notifications yet.</div>}
          </div>
          {page < totalPages && (
            <button className="nb-more" onClick={() => load(page + 1, true)}>Load older</button>
          )}
        </div>
      )}
    </div>
  );
}
