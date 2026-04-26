import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Layout from "../../components/Layout";
import Badge from "../../components/Badge";
import I from "../../components/Icon";
import { api } from "../../services/api";

function getGreeting() {
  const h = new Date().getHours();
  if (h < 5) return "Good night";
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  if (h < 21) return "Good evening";
  return "Good night";
}

const firstName = (n) => (n ? n.split(" ")[0] : "there");

export default function InstructorDashboard() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const user = JSON.parse(localStorage.getItem("runcademic_user") || "{}");

  useEffect(() => {
    api.tickets
      .list()
      .then((res) => {
        const all = res.data?.data || res.data || [];
        const assigned = all.filter(
          (t) => Number(t.assigned_to) === Number(user.id),
        );
        setTickets(assigned);
      })
      .catch(() => setTickets([]))
      .finally(() => setLoading(false));
  }, [user.id]);

  const counts = useMemo(() => {
    const c = { open: 0, in_progress: 0, waiting: 0, resolved: 0, closed: 0 };
    tickets.forEach((t) => {
      if (c[t.status] !== undefined) c[t.status] += 1;
    });
    return c;
  }, [tickets]);

  const total = tickets.length;
  const recent = tickets.slice(0, 5);
  const activeFocus = counts.open + counts.in_progress;

  return (
    <Layout role="instructor">
      <div className="page">
        <div className="page-head">
          <div>
            <div className="eyebrow">Instructor portal · Spring 2026</div>
            <h1>
              {getGreeting()},{" "}
              <span className="serif italic" style={{ color: "var(--accent)" }}>
                Dr. {firstName(user.name)}
              </span>
              .
            </h1>
            <p className="sub">Tickets that need your attention today.</p>
          </div>
          <Link to="/instructor/create-schedule" className="btn btn-accent">
            {I.plus(14)} New schedule
          </Link>
        </div>

        <div className="hero-metric">
          <div style={{ position: "relative", zIndex: 1 }}>
            <div className="hero-eyebrow">
              {I.bookmark(14)} Active queue · open + in progress
            </div>
            <div className="hero-num">{loading ? "—" : activeFocus}</div>
            <div className="hero-cap">
              <em>{loading ? "…" : `${activeFocus} tickets`}</em> waiting on you
              across the term.
            </div>
          </div>
          <div className="chip-row">
            <div className="chip">
              <div className="chip-label">Assigned</div>
              <div className="chip-num">{loading ? "—" : total}</div>
            </div>
            <div className="chip">
              <div className="chip-label">
                <span
                  className="dot"
                  style={{ background: "var(--st-open)" }}
                />
                Open
              </div>
              <div className="chip-num">{loading ? "—" : counts.open}</div>
            </div>
            <div className="chip">
              <div className="chip-label">
                <span
                  className="dot"
                  style={{ background: "var(--st-progress)" }}
                />
                In progress
              </div>
              <div className="chip-num">
                {loading ? "—" : counts.in_progress}
              </div>
            </div>
          </div>
        </div>

        <div className="split">
          <div className="card">
            <div className="card-head">
              <div>
                <h3 className="card-title">Assigned tickets</h3>
                <div className="fine" style={{ marginTop: 2 }}>
                  Last {recent.length} of {total}
                </div>
              </div>
              <Link to="/instructor/tickets" className="btn btn-ghost btn-sm">
                View all {I.arrowRight(12)}
              </Link>
            </div>
            <div className="list">
              {loading ? (
                <div className="empty">
                  <p>Loading…</p>
                </div>
              ) : recent.length === 0 ? (
                <div className="empty">
                  <div className="glyph">¶</div>
                  <h4>Your queue is clearr</h4>
                  <p>No tickets are currently assigned to you.</p>
                </div>
              ) : (
                recent.map((t) => (
                  <Link
                    key={t.id}
                    to={`/instructor/tickets/${t.id}`}
                    className="list-row"
                  >
                    <span className="id mono">#{t.id}</span>
                    <div>
                      <div className="ttl">{t.title}</div>
                      <div className="meta">
                        <span style={{ textTransform: "capitalize" }}>
                          {t.category || "general"}
                        </span>
                        <span style={{ color: "var(--ink-4)" }}>·</span>
                        <span className="pri" data-pri={t.priority || "medium"}>
                          {t.priority || "medium"}
                        </span>
                      </div>
                    </div>
                    <Badge status={t.status} />
                    <span className="row-action">{I.arrowRight(12)}</span>
                  </Link>
                ))
              )}
            </div>
          </div>

          <div className="col gap-6">
            <div className="card">
              <div className="card-head">
                <h3 className="card-title">Quick actions</h3>
              </div>
              <div className="qa">
                <Link to="/instructor/tickets" className="qa-item">
                  <span className="ic">{I.inbox(16)}</span>
                  <div>
                    <div style={{ fontWeight: 500 }}>Assigned tickets</div>
                    <div className="fine">Review queue</div>
                  </div>
                  <span className="arrow">{I.arrowRight(14)}</span>
                </Link>
                <Link to="/instructor/create-schedule" className="qa-item">
                  <span className="ic">{I.send(16)}</span>
                  <div>
                    <div style={{ fontWeight: 500 }}>Create schedule</div>
                    <div className="fine">Add an event</div>
                  </div>
                  <span className="arrow">{I.arrowRight(14)}</span>
                </Link>
                <Link to="/instructor/schedules" className="qa-item">
                  <span className="ic">{I.calendar(16)}</span>
                  <div>
                    <div style={{ fontWeight: 500 }}>My schedules</div>
                    <div className="fine">This week</div>
                  </div>
                  <span className="arrow">{I.arrowRight(14)}</span>
                </Link>
                <Link to="/instructor/tasks" className="qa-item">
                  <span className="ic">{I.tasks(16)}</span>
                  <div>
                    <div style={{ fontWeight: 500 }}>My tasks</div>
                    <div className="fine">Track work</div>
                  </div>
                  <span className="arrow">{I.arrowRight(14)}</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
