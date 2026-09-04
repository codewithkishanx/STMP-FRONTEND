import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./Landing.css";

export default function Landing() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <nav className={"nav" + (scrolled ? " scrolled" : "")}>
        <div className="wrap nav-inner">
          <div className="logo"><span className="logo-pin" />Loomboard</div>
          <div className="nav-links" style={menuOpen ? { display: "flex", position: "absolute", top: 72, left: 0, right: 0, background: "#fbf7ed", flexDirection: "column", padding: "20px 32px", borderBottom: "1px solid rgba(35,48,61,0.1)" } : undefined}>
            <a href="#features">Features</a>
            <a href="#how">How it works</a>
            <a href="#audience">For mentors &amp; students</a>
            <a href="#testimonials">Stories</a>
          </div>
          <div className="nav-cta">
            <Link to="/login" className="nav-signin">Log in</Link>
            <Link to="/register" className="btn btn-primary">Get started</Link>
          </div>
          <button className="menu-btn" aria-label="Menu" onClick={() => setMenuOpen((o) => !o)}><span /><span /><span /></button>
        </div>
      </nav>

      <header className="hero">
        <div className="wrap hero-grid">
          <div className="hero-copy reveal in">
            <span className="eyebrow">For mentors &amp; student project teams</span>
            <h1>Every project, <em>pinned</em>.<br />Every group, in one thread.</h1>
            <p className="hero-sub">Loomboard gives mentors a clear view of every group&apos;s progress and gives students one thread to reach their mentor and each other — no more feedback lost in email or updates scattered across chats.</p>
            <div className="hero-actions">
              <Link to="/register" className="btn btn-primary">Start a board</Link>
              <a href="#how" className="btn btn-ghost">See how it works</a>
            </div>
            <div className="hero-meta">
              <div><strong>1 thread</strong>per group, always</div>
              <div><strong>0</strong>feedback comments lost in email</div>
              <div><strong>100%</strong>visibility for mentors</div>
            </div>
          </div>

          <div className="board-frame reveal in">
            <div className="board-scene">
              <svg className="threads" viewBox="0 0 600 470" fill="none">
                <path d="M300,95 C260,150 200,180 118,232" stroke="#b8402a" strokeWidth="2" strokeDasharray="1 7" strokeLinecap="round" />
                <path d="M300,95 C300,150 300,190 300,265" stroke="#b8402a" strokeWidth="2" strokeDasharray="1 7" strokeLinecap="round" />
                <path d="M300,95 C340,150 400,180 470,225" stroke="#b8402a" strokeWidth="2" strokeDasharray="1 7" strokeLinecap="round" />
                <path d="M150,255 Q300,215 450,248" stroke="#23303d" strokeOpacity="0.35" strokeWidth="1.5" strokeDasharray="1 5" />
              </svg>
              <div className="pin-card card-mentor">
                <div className="role">Mentor</div>
                <div className="name">Dr. Osei</div>
                <div className="status"><span className="dot green" />3 groups on track</div>
              </div>
              <div className="pin-card card-s1">
                <div className="role">Group 4 · UX</div>
                <div className="name">Wireframe review</div>
                <div className="status"><span className="dot amber" />Needs revision</div>
              </div>
              <div className="pin-card card-s2">
                <div className="role">Group 4 · Backend</div>
                <div className="name">API milestone</div>
                <div className="status"><span className="dot green" />On track</div>
              </div>
              <div className="pin-card card-s3">
                <div className="role">Group 4 · Report</div>
                <div className="name">Draft chapter 2</div>
                <div className="status"><span className="dot red" />Stuck — 2 days</div>
              </div>
              <div className="sticky-note">Nice progress on the wireframes 👍 fix the nav flow and resubmit — Dr. Osei</div>
            </div>
          </div>
        </div>
      </header>

      <section className="section" id="features">
        <div className="wrap">
          <div className="section-head reveal">
            <span className="eyebrow">What it does</span>
            <h2>Built around the two things group projects break on</h2>
            <p>Feedback that gets lost, and updates that never reach everyone. Loomboard pins both to a place your whole group and your mentor already check.</p>
          </div>
          <div className="features-row">
            <div className="feature-card reveal">
              <div className="feature-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M4 4h16v12H8l-4 4V4z" stroke="#b8402a" strokeWidth="1.6" strokeLinejoin="round" /></svg>
              </div>
              <h3>Feedback that sticks</h3>
              <p>Mentors leave comments directly on a milestone card. Students see exactly what to fix next — pinned where they&apos;ll actually look for it.</p>
            </div>
            <div className="feature-card reveal">
              <div className="feature-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><circle cx="8" cy="8" r="3" stroke="#b8402a" strokeWidth="1.6" /><circle cx="17" cy="9" r="2.4" stroke="#b8402a" strokeWidth="1.6" /><path d="M3 20c0-3 2.5-5 5-5s5 2 5 5M14 20c0-2.4 2-4.2 4.5-4.2S21 17.6 21 20" stroke="#b8402a" strokeWidth="1.6" strokeLinecap="round" /></svg>
              </div>
              <h3>One thread per group</h3>
              <p>Every group gets a shared thread for chat, files, and updates. Teammates and mentors reply in the same place — nothing scattered across five apps.</p>
            </div>
            <div className="feature-card reveal">
              <div className="feature-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><rect x="4" y="12" width="4" height="8" stroke="#b8402a" strokeWidth="1.6" /><rect x="10" y="7" width="4" height="13" stroke="#b8402a" strokeWidth="1.6" /><rect x="16" y="4" width="4" height="16" stroke="#b8402a" strokeWidth="1.6" /></svg>
              </div>
              <h3>Progress at a glance</h3>
              <p>Status pins — on track, needs review, stuck — update as groups post. Mentors know exactly which group to check in on first.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="how" id="how">
        <div className="wrap section">
          <div className="section-head reveal">
            <span className="eyebrow">How it works</span>
            <h2>From kickoff to final review, in four pinned steps</h2>
            <p>The same flow every group and mentor follows, from the first milestone to the last one.</p>
          </div>
          <div className="how-steps">
            {[["01", "Create a board", "Your mentor sets up a board for your group with milestones, due dates, and what's expected at each one."], ["02", "Team pins updates", "Students post progress, files, and questions straight to the group thread, so everyone sees the same version."], ["03", "Mentor leaves feedback", "Comments land directly on the milestone card — not buried three replies deep in an email chain."], ["04", "Everyone stays in thread", "Group members and mentor reply in one place, so revisions, questions, and decisions don't slip through."]].map(([n, h, p]) => (
              <div className="how-step reveal" key={n}>
                <div className="num">{n}</div>
                <h3>{h}</h3>
                <p>{p}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section" id="audience">
        <div className="wrap">
          <div className="section-head reveal">
            <span className="eyebrow">Two views, one board</span>
            <h2>Built for what each side actually needs</h2>
            <p>Mentors need oversight across many groups. Students need one clear place to coordinate and ask for help. Loomboard gives each side its own view of the same board.</p>
          </div>
          <div className="audience-row">
            <div className="aud-card mentors reveal">
              <span className="aud-tag">For mentors</span>
              <h3>See every group without opening six inboxes</h3>
              <ul className="aud-list">
                {["See every group's status pinned on one board", "Leave feedback directly on the milestone in question", "Get flagged automatically when a group is stuck", "Compare progress across all your groups at a glance"].map((t) => <li key={t}><span className="check">✓</span>{t}</li>)}
              </ul>
            </div>
            <div className="aud-card students reveal">
              <span className="aud-tag">For students</span>
              <h3>One thread for your group and your mentor</h3>
              <ul className="aud-list">
                {["Message your group and mentor in the same thread", "See exactly what feedback to act on next", "Track shared milestones and deadlines together", "Share files without digging through old emails"].map((t) => <li key={t}><span className="check">✓</span>{t}</li>)}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="section" id="testimonials">
        <div className="wrap">
          <div className="section-head reveal">
            <span className="eyebrow">From the boards</span>
            <h2>What mentors and teams say once they&apos;ve pinned their first project</h2>
          </div>
          <div className="testi-row">
            <div className="testi-note reveal">&quot;I can tell which of my six groups needs me most before I even open my email.&quot;<span className="testi-who">— Dr. Osei, Project Mentor</span></div>
            <div className="testi-note reveal">&quot;Loomboard is the first place all four of us actually agree on what&apos;s due next.&quot;<span className="testi-who">— Priya M., Final-year Computer Science</span></div>
          </div>
        </div>
      </section>

      <section className="cta-section" id="cta">
        <div className="wrap">
          <div className="cta-card reveal">
            <div className="cta-inner">
              <span className="eyebrow" style={{ color: "#f3e6a8" }}>Ready when your next cohort is</span>
              <h2>Pin your first project board</h2>
              <p>Free for student teams and mentors. Set up a board for your first group in under five minutes.</p>
              <div className="cta-actions">
                <Link to="/register" className="btn btn-primary">Start a board</Link>
                <Link to="/login" className="btn btn-ghost">Log in</Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="footer">
        <div className="wrap">
          <div className="footer-top">
            <div className="footer-brand">
              <div className="logo"><span className="logo-pin" />Loomboard</div>
              <p>The board where mentors track, feedback lands, and student groups stay in one thread.</p>
            </div>
            <div className="footer-col">
              <h4>Product</h4>
              <a href="#features">Features</a>
              <a href="#how">How it works</a>
              <a href="#audience">For mentors</a>
              <a href="#audience">For students</a>
            </div>
            <div className="footer-col">
              <h4>Resources</h4>
              <a href="#cta">Guides</a>
              <a href="#cta">Help center</a>
              <a href="#cta">Status</a>
            </div>
            <div className="footer-col">
              <h4>Company</h4>
              <a href="#cta">About</a>
              <a href="#cta">Contact</a>
            </div>
          </div>
          <div className="footer-bottom">
            <span>© 2026 Loomboard. Built for classrooms and capstones.</span>
            <span>Privacy · Terms</span>
          </div>
        </div>
      </footer>
    </>
  );
}
