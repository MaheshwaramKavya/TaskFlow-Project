import { useState, useEffect, useCallback } from "react";

// ─── Simulated "Backend" (in-memory DB + auth) ────────────────────────────────
const DB = {
  users: [
    { id: 1, name: "Alex Rivera", email: "admin@taskflow.io", password: "admin123", role: "admin", avatar: "AR" },
    { id: 2, name: "Jordan Lee", email: "jordan@taskflow.io", password: "member123", role: "member", avatar: "JL" },
    { id: 3, name: "Sam Patel", email: "sam@taskflow.io", password: "member123", role: "member", avatar: "SP" },
  ],
  projects: [
    { id: 1, name: "Website Redesign", description: "Complete overhaul of the company website", color: "#6366f1", members: [1, 2, 3], createdAt: "2025-04-01", ownerId: 1 },
    { id: 2, name: "Mobile App v2", description: "New features for the iOS and Android app", color: "#ec4899", members: [1, 3], createdAt: "2025-04-10", ownerId: 1 },
    { id: 3, name: "Backend API", description: "RESTful API refactoring and optimization", color: "#14b8a6", members: [1, 2], createdAt: "2025-04-15", ownerId: 1 },
  ],
  tasks: [
    { id: 1, title: "Design new homepage", description: "Create Figma mockups for the homepage", status: "completed", dueDate: "2025-04-20", projectId: 1, assigneeId: 2, createdBy: 1, priority: "high" },
    { id: 2, title: "Implement auth flow", description: "JWT-based login and signup", status: "in-progress", dueDate: "2025-05-10", projectId: 1, assigneeId: 3, createdBy: 1, priority: "high" },
    { id: 3, title: "Responsive CSS", description: "Mobile-first responsive styles for all pages", status: "pending", dueDate: "2025-05-02", projectId: 1, assigneeId: 2, createdBy: 1, priority: "medium" },
    { id: 4, title: "Push notifications", description: "Implement Firebase push notifications", status: "in-progress", dueDate: "2025-05-15", projectId: 2, assigneeId: 3, createdBy: 1, priority: "high" },
    { id: 5, title: "Offline mode", description: "Cache API responses for offline usage", status: "pending", dueDate: "2025-04-25", projectId: 2, assigneeId: 3, createdBy: 1, priority: "medium" },
    { id: 6, title: "Rate limiting", description: "Add rate limiting middleware", status: "completed", dueDate: "2025-04-18", projectId: 3, assigneeId: 2, createdBy: 1, priority: "low" },
    { id: 7, title: "Database indexing", description: "Optimize slow queries with proper indexes", status: "pending", dueDate: "2025-04-28", projectId: 3, assigneeId: 2, createdBy: 1, priority: "high" },
  ],
};

let nextId = { users: 4, projects: 4, tasks: 8 };
const getId = (k) => nextId[k]++;

// ─── Auth API ────────────────────────────────────────────────────────────────
const api = {
  login: (email, password) => {
    const user = DB.users.find(u => u.email === email && u.password === password);
    if (!user) return { error: "Invalid credentials" };
    return { user: { ...user, password: undefined } };
  },
  signup: (name, email, password) => {
    if (DB.users.find(u => u.email === email)) return { error: "Email already exists" };
    const initials = name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);
    const user = { id: getId("users"), name, email, password, role: "member", avatar: initials };
    DB.users.push(user);
    return { user: { ...user, password: undefined } };
  },
  getProjects: (userId, role) => {
    if (role === "admin") return DB.projects;
    return DB.projects.filter(p => p.members.includes(userId));
  },
  getTasks: (userId, role, projectId = null) => {
    let tasks = projectId ? DB.tasks.filter(t => t.projectId === projectId) : DB.tasks;
    if (role !== "admin") tasks = tasks.filter(t => t.assigneeId === userId);
    return tasks;
  },
  createProject: (data) => {
    const p = { id: getId("projects"), ...data, createdAt: new Date().toISOString().slice(0, 10) };
    DB.projects.push(p);
    return p;
  },
  updateProject: (id, data) => {
    const idx = DB.projects.findIndex(p => p.id === id);
    if (idx === -1) return null;
    DB.projects[idx] = { ...DB.projects[idx], ...data };
    return DB.projects[idx];
  },
  deleteProject: (id) => {
    const idx = DB.projects.findIndex(p => p.id === id);
    if (idx === -1) return false;
    DB.projects.splice(idx, 1);
    DB.tasks = DB.tasks.filter(t => t.projectId !== id);
    return true;
  },
  createTask: (data) => {
    const t = { id: getId("tasks"), ...data };
    DB.tasks.push(t);
    return t;
  },
  updateTask: (id, data) => {
    const idx = DB.tasks.findIndex(t => t.id === id);
    if (idx === -1) return null;
    DB.tasks[idx] = { ...DB.tasks[idx], ...data };
    return DB.tasks[idx];
  },
  deleteTask: (id) => {
    const idx = DB.tasks.findIndex(t => t.id === id);
    if (idx === -1) return false;
    DB.tasks.splice(idx, 1);
    return true;
  },
  getUsers: () => DB.users.map(u => ({ ...u, password: undefined })),
};

// ─── Utility ──────────────────────────────────────────────────────────────────
const isOverdue = (d) => d && new Date(d) < new Date() && new Date(d).toDateString() !== new Date().toDateString();
const fmtDate = (d) => d ? new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—";
const statusColors = { pending: "#f59e0b", "in-progress": "#3b82f6", completed: "#22c55e" };
const statusLabels = { pending: "Pending", "in-progress": "In Progress", completed: "Completed" };
const priorityColors = { high: "#ef4444", medium: "#f59e0b", low: "#6b7280" };

// ─── Components ──────────────────────────────────────────────────────────────

function Avatar({ initials, size = 32, color = "#6366f1" }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%", background: color,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: size * 0.38, fontWeight: 700, color: "#fff", flexShrink: 0,
      fontFamily: "'DM Sans', sans-serif", letterSpacing: "-0.02em"
    }}>
      {initials}
    </div>
  );
}

function Badge({ label, color }) {
  return (
    <span style={{
      padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600,
      background: color + "22", color, letterSpacing: "0.03em",
      textTransform: "uppercase", fontFamily: "'DM Mono', monospace"
    }}>
      {label}
    </span>
  );
}

function Modal({ title, onClose, children }) {
  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", zIndex: 1000,
      display: "flex", alignItems: "center", justifyContent: "center",
      backdropFilter: "blur(4px)"
    }} onClick={onClose}>
      <div style={{
        background: "#fff", borderRadius: 16, padding: 28, width: 480, maxWidth: "92vw",
        boxShadow: "0 24px 80px rgba(0,0,0,0.18)", maxHeight: "90vh", overflowY: "auto"
      }} onClick={e => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: "#111", fontFamily: "'DM Sans', sans-serif" }}>{title}</h3>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 20, color: "#888", lineHeight: 1 }}>×</button>
        </div>
        {children}
      </div>
    </div>
  );
}

function Input({ label, ...props }) {
  return (
    <div style={{ marginBottom: 14 }}>
      {label && <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#555", marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.04em", fontFamily: "'DM Sans', sans-serif" }}>{label}</label>}
      <input style={{
        width: "100%", padding: "10px 12px", border: "1.5px solid #e5e7eb", borderRadius: 8,
        fontSize: 14, color: "#111", outline: "none", fontFamily: "'DM Sans', sans-serif",
        boxSizing: "border-box", transition: "border-color 0.15s"
      }} onFocus={e => e.target.style.borderColor = "#6366f1"}
        onBlur={e => e.target.style.borderColor = "#e5e7eb"} {...props} />
    </div>
  );
}

function Select({ label, children, ...props }) {
  return (
    <div style={{ marginBottom: 14 }}>
      {label && <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#555", marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.04em", fontFamily: "'DM Sans', sans-serif" }}>{label}</label>}
      <select style={{
        width: "100%", padding: "10px 12px", border: "1.5px solid #e5e7eb", borderRadius: 8,
        fontSize: 14, color: "#111", outline: "none", fontFamily: "'DM Sans', sans-serif",
        boxSizing: "border-box", background: "#fff", cursor: "pointer"
      }} {...props}>{children}</select>
    </div>
  );
}

function Textarea({ label, ...props }) {
  return (
    <div style={{ marginBottom: 14 }}>
      {label && <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#555", marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.04em", fontFamily: "'DM Sans', sans-serif" }}>{label}</label>}
      <textarea style={{
        width: "100%", padding: "10px 12px", border: "1.5px solid #e5e7eb", borderRadius: 8,
        fontSize: 14, color: "#111", outline: "none", fontFamily: "'DM Sans', sans-serif",
        boxSizing: "border-box", resize: "vertical", minHeight: 80
      }} onFocus={e => e.target.style.borderColor = "#6366f1"}
        onBlur={e => e.target.style.borderColor = "#e5e7eb"} {...props} />
    </div>
  );
}

function Btn({ children, variant = "primary", size = "md", ...props }) {
  const base = {
    border: "none", borderRadius: 8, fontWeight: 600, cursor: "pointer",
    fontFamily: "'DM Sans', sans-serif", transition: "all 0.15s",
    display: "inline-flex", alignItems: "center", gap: 6
  };
  const sizes = { sm: { padding: "6px 12px", fontSize: 12 }, md: { padding: "10px 18px", fontSize: 14 }, lg: { padding: "14px 24px", fontSize: 16 } };
  const variants = {
    primary: { background: "#6366f1", color: "#fff" },
    danger: { background: "#ef4444", color: "#fff" },
    ghost: { background: "#f3f4f6", color: "#374151" },
    outline: { background: "#fff", color: "#6366f1", border: "1.5px solid #6366f1" },
  };
  return <button style={{ ...base, ...sizes[size], ...variants[variant] }} {...props}>{children}</button>;
}

// ─── Auth Screen ─────────────────────────────────────────────────────────────
function AuthScreen({ onLogin }) {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");

  const handleSubmit = () => {
    setError("");
    if (mode === "login") {
      const res = api.login(form.email, form.password);
      if (res.error) { setError(res.error); return; }
      onLogin(res.user);
    } else {
      if (!form.name.trim()) { setError("Name is required"); return; }
      const res = api.signup(form.name, form.email, form.password);
      if (res.error) { setError(res.error); return; }
      onLogin(res.user);
    }
  };

  return (
    <div style={{
      minHeight: "100vh", background: "linear-gradient(135deg, #1e1b4b 0%, #312e81 40%, #4c1d95 100%)",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: "'DM Sans', sans-serif"
    }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Mono:wght@400;500;600&display=swap');`}</style>
      <div style={{ width: 420, maxWidth: "90vw" }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <div style={{
            width: 56, height: 56, borderRadius: 16, background: "rgba(255,255,255,0.15)",
            display: "inline-flex", alignItems: "center", justifyContent: "center",
            fontSize: 28, marginBottom: 12, backdropFilter: "blur(8px)",
            border: "1px solid rgba(255,255,255,0.2)"
          }}>⚡</div>
          <h1 style={{ margin: 0, color: "#fff", fontSize: 28, fontWeight: 800, letterSpacing: "-0.03em" }}>TaskFlow</h1>
          <p style={{ color: "rgba(255,255,255,0.5)", margin: "4px 0 0", fontSize: 14 }}>Team productivity, simplified.</p>
        </div>

        {/* Card */}
        <div style={{
          background: "rgba(255,255,255,0.08)", backdropFilter: "blur(20px)",
          border: "1px solid rgba(255,255,255,0.15)", borderRadius: 20, padding: 32
        }}>
          {/* Toggle */}
          <div style={{
            display: "flex", background: "rgba(0,0,0,0.2)", borderRadius: 10, padding: 4, marginBottom: 24
          }}>
            {["login", "signup"].map(m => (
              <button key={m} onClick={() => { setMode(m); setError(""); }}
                style={{
                  flex: 1, padding: "8px", border: "none", cursor: "pointer", borderRadius: 8,
                  fontWeight: 600, fontSize: 13, fontFamily: "'DM Sans', sans-serif",
                  background: mode === m ? "#fff" : "transparent",
                  color: mode === m ? "#1e1b4b" : "rgba(255,255,255,0.6)",
                  transition: "all 0.2s"
                }}>
                {m === "login" ? "Sign In" : "Create Account"}
              </button>
            ))}
          </div>

          {mode === "signup" && (
            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.5)", marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.04em" }}>Full Name</label>
              <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                placeholder="Your name" style={inputStyle} />
            </div>
          )}
          <div>
            <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.5)", marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.04em" }}>Email</label>
            <input value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
              type="email" placeholder="you@company.io" style={inputStyle} />
          </div>
          <div style={{ marginTop: 12 }}>
            <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.5)", marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.04em" }}>Password</label>
            <input value={form.password} onChange={e => setForm({ ...form, password: e.target.value })}
              type="password" placeholder="••••••••" style={inputStyle}
              onKeyDown={e => e.key === "Enter" && handleSubmit()} />
          </div>

          {error && <div style={{ color: "#fca5a5", fontSize: 13, marginTop: 8, fontWeight: 500 }}>⚠ {error}</div>}

          <button onClick={handleSubmit} style={{
            width: "100%", marginTop: 20, padding: "12px", background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
            border: "none", borderRadius: 10, color: "#fff", fontSize: 15, fontWeight: 700,
            cursor: "pointer", fontFamily: "'DM Sans', sans-serif", letterSpacing: "-0.01em"
          }}>
            {mode === "login" ? "Sign In →" : "Create Account →"}
          </button>

          <div style={{ marginTop: 20, padding: "12px 16px", background: "rgba(0,0,0,0.2)", borderRadius: 10, fontSize: 12, color: "rgba(255,255,255,0.5)" }}>
            <strong style={{ color: "rgba(255,255,255,0.7)" }}>Demo credentials:</strong><br />
            Admin: admin@taskflow.io / admin123<br />
            Member: jordan@taskflow.io / member123
          </div>
        </div>
      </div>
    </div>
  );
}
const inputStyle = {
  width: "100%", padding: "10px 14px", border: "1.5px solid rgba(255,255,255,0.15)",
  borderRadius: 8, fontSize: 14, color: "#fff", background: "rgba(0,0,0,0.2)",
  outline: "none", fontFamily: "'DM Sans', sans-serif", boxSizing: "border-box"
};

// ─── Task Form ────────────────────────────────────────────────────────────────
function TaskForm({ task, projectId, onSave, onClose, currentUser }) {
  const users = api.getUsers();
  const projects = api.getProjects(currentUser.id, currentUser.role);
  const [form, setForm] = useState({
    title: task?.title || "",
    description: task?.description || "",
    status: task?.status || "pending",
    dueDate: task?.dueDate || "",
    priority: task?.priority || "medium",
    assigneeId: task?.assigneeId || currentUser.id,
    projectId: task?.projectId || projectId || (projects[0]?.id ?? ""),
  });

  const handleSave = () => {
    if (!form.title.trim()) return;
    if (task) {
      onSave(api.updateTask(task.id, form));
    } else {
      onSave(api.createTask({ ...form, createdBy: currentUser.id }));
    }
    onClose();
  };

  return (
    <Modal title={task ? "Edit Task" : "New Task"} onClose={onClose}>
      <Input label="Title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Task title..." />
      <Textarea label="Description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Describe the task..." />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <Select label="Status" value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
          <option value="pending">Pending</option>
          <option value="in-progress">In Progress</option>
          <option value="completed">Completed</option>
        </Select>
        <Select label="Priority" value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })}>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </Select>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        {currentUser.role === "admin" && (
          <Select label="Assignee" value={form.assigneeId} onChange={e => setForm({ ...form, assigneeId: parseInt(e.target.value) })}>
            {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
          </Select>
        )}
        <Select label="Project" value={form.projectId} onChange={e => setForm({ ...form, projectId: parseInt(e.target.value) })}>
          {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
        </Select>
      </div>
      <Input label="Due Date" type="date" value={form.dueDate} onChange={e => setForm({ ...form, dueDate: e.target.value })} />
      <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 4 }}>
        <Btn variant="ghost" onClick={onClose}>Cancel</Btn>
        <Btn onClick={handleSave}>Save Task</Btn>
      </div>
    </Modal>
  );
}

// ─── Project Form ─────────────────────────────────────────────────────────────
function ProjectForm({ project, onSave, onClose, currentUser }) {
  const allUsers = api.getUsers();
  const colors = ["#6366f1", "#ec4899", "#14b8a6", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4"];
  const [form, setForm] = useState({
    name: project?.name || "",
    description: project?.description || "",
    color: project?.color || colors[0],
    members: project?.members || [currentUser.id],
    ownerId: project?.ownerId || currentUser.id,
  });

  const toggleMember = (uid) => {
    setForm(f => ({
      ...f,
      members: f.members.includes(uid) ? f.members.filter(m => m !== uid) : [...f.members, uid]
    }));
  };

  const handleSave = () => {
    if (!form.name.trim()) return;
    if (project) {
      onSave(api.updateProject(project.id, form));
    } else {
      onSave(api.createProject({ ...form }));
    }
    onClose();
  };

  return (
    <Modal title={project ? "Edit Project" : "New Project"} onClose={onClose}>
      <Input label="Project Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Project name..." />
      <Textarea label="Description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="What is this project about?" />
      <div style={{ marginBottom: 14 }}>
        <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#555", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.04em", fontFamily: "'DM Sans', sans-serif" }}>Color</label>
        <div style={{ display: "flex", gap: 8 }}>
          {colors.map(c => (
            <div key={c} onClick={() => setForm({ ...form, color: c })} style={{
              width: 28, height: 28, borderRadius: "50%", background: c, cursor: "pointer",
              border: form.color === c ? "3px solid #111" : "3px solid transparent",
              transition: "all 0.15s"
            }} />
          ))}
        </div>
      </div>
      <div style={{ marginBottom: 16 }}>
        <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#555", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.04em", fontFamily: "'DM Sans', sans-serif" }}>Members</label>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {allUsers.map(u => (
            <label key={u.id} style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", padding: "6px 10px", borderRadius: 8, background: form.members.includes(u.id) ? "#eef2ff" : "transparent" }}>
              <input type="checkbox" checked={form.members.includes(u.id)} onChange={() => toggleMember(u.id)} />
              <Avatar initials={u.avatar} size={28} color={form.color} />
              <span style={{ fontSize: 14, fontFamily: "'DM Sans', sans-serif", color: "#333" }}>{u.name}</span>
              <Badge label={u.role} color={u.role === "admin" ? "#6366f1" : "#14b8a6"} />
            </label>
          ))}
        </div>
      </div>
      <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
        <Btn variant="ghost" onClick={onClose}>Cancel</Btn>
        <Btn onClick={handleSave}>Save Project</Btn>
      </div>
    </Modal>
  );
}

// ─── Task Card ────────────────────────────────────────────────────────────────
function TaskCard({ task, currentUser, onEdit, onDelete, onStatusChange, projects, users }) {
  const project = projects.find(p => p.id === task.projectId);
  const assignee = users.find(u => u.id === task.assigneeId);
  const overdue = isOverdue(task.dueDate) && task.status !== "completed";

  return (
    <div style={{
      background: "#fff", border: `1.5px solid ${overdue ? "#fecaca" : "#f0f0f0"}`,
      borderRadius: 12, padding: "14px 16px", marginBottom: 10,
      boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
      borderLeft: `4px solid ${project?.color || "#6366f1"}`,
      transition: "box-shadow 0.15s"
    }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 4 }}>
            <span style={{
              fontSize: 14, fontWeight: 600, color: task.status === "completed" ? "#9ca3af" : "#111",
              textDecoration: task.status === "completed" ? "line-through" : "none",
              fontFamily: "'DM Sans', sans-serif"
            }}>{task.title}</span>
            <Badge label={task.priority} color={priorityColors[task.priority]} />
          </div>
          {task.description && (
            <p style={{ margin: "0 0 8px", fontSize: 13, color: "#6b7280", fontFamily: "'DM Sans', sans-serif", lineHeight: 1.5 }}>
              {task.description}
            </p>
          )}
          <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
            <select value={task.status} onChange={e => onStatusChange(task.id, e.target.value)}
              style={{
                padding: "4px 10px", borderRadius: 20, border: "none", fontSize: 11, fontWeight: 600,
                background: statusColors[task.status] + "22", color: statusColors[task.status],
                cursor: "pointer", fontFamily: "'DM Mono', monospace", textTransform: "uppercase", letterSpacing: "0.03em"
              }}>
              {Object.entries(statusLabels).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
            {project && <span style={{ fontSize: 12, color: project.color, fontWeight: 600, fontFamily: "'DM Sans', sans-serif" }}>● {project.name}</span>}
            <span style={{ fontSize: 12, color: overdue ? "#ef4444" : "#9ca3af", fontFamily: "'DM Mono', monospace", fontWeight: overdue ? 600 : 400 }}>
              {overdue ? "⚠ " : ""}Due {fmtDate(task.dueDate)}
            </span>
            {assignee && <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <Avatar initials={assignee.avatar} size={18} color={project?.color || "#6366f1"} />
              <span style={{ fontSize: 12, color: "#6b7280", fontFamily: "'DM Sans', sans-serif" }}>{assignee.name}</span>
            </div>}
          </div>
        </div>
        {(currentUser.role === "admin" || task.assigneeId === currentUser.id) && (
          <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
            <Btn variant="ghost" size="sm" onClick={() => onEdit(task)}>✏</Btn>
            {currentUser.role === "admin" && <Btn variant="ghost" size="sm" onClick={() => onDelete(task.id)} style={{ color: "#ef4444" }}>✕</Btn>}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Dashboard ────────────────────────────────────────────────────────────────
function Dashboard({ currentUser, onNavigate }) {
  const projects = api.getProjects(currentUser.id, currentUser.role);
  const tasks = api.getTasks(currentUser.id, currentUser.role);
  const users = api.getUsers();

  const stats = {
    total: tasks.length,
    pending: tasks.filter(t => t.status === "pending").length,
    inProgress: tasks.filter(t => t.status === "in-progress").length,
    completed: tasks.filter(t => t.status === "completed").length,
    overdue: tasks.filter(t => isOverdue(t.dueDate) && t.status !== "completed").length,
  };

  const recentTasks = [...tasks].sort((a, b) => b.id - a.id).slice(0, 5);

  const StatCard = ({ label, value, color, icon }) => (
    <div style={{
      background: "#fff", borderRadius: 14, padding: "20px 22px",
      border: "1.5px solid #f0f0f0", boxShadow: "0 1px 4px rgba(0,0,0,0.04)"
    }}>
      <div style={{ fontSize: 24, marginBottom: 6 }}>{icon}</div>
      <div style={{ fontSize: 28, fontWeight: 800, color, fontFamily: "'DM Sans', sans-serif", letterSpacing: "-0.04em" }}>{value}</div>
      <div style={{ fontSize: 13, color: "#9ca3af", fontWeight: 500, fontFamily: "'DM Sans', sans-serif" }}>{label}</div>
    </div>
  );

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h2 style={{ margin: "0 0 4px", fontSize: 22, fontWeight: 800, color: "#111", fontFamily: "'DM Sans', sans-serif", letterSpacing: "-0.03em" }}>
          Good day, {currentUser.name.split(" ")[0]} 👋
        </h2>
        <p style={{ margin: 0, color: "#9ca3af", fontSize: 14, fontFamily: "'DM Sans', sans-serif" }}>
          Here's what's happening across your workspace.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 14, marginBottom: 28 }}>
        <StatCard label="Total Tasks" value={stats.total} color="#111" icon="📋" />
        <StatCard label="Pending" value={stats.pending} color="#f59e0b" icon="⏳" />
        <StatCard label="In Progress" value={stats.inProgress} color="#3b82f6" icon="🔄" />
        <StatCard label="Completed" value={stats.completed} color="#22c55e" icon="✅" />
        <StatCard label="Overdue" value={stats.overdue} color="#ef4444" icon="🚨" />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        {/* Projects */}
        <div style={{ background: "#fff", borderRadius: 14, padding: 20, border: "1.5px solid #f0f0f0" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "#111", fontFamily: "'DM Sans', sans-serif" }}>Projects</h3>
            <Btn variant="ghost" size="sm" onClick={() => onNavigate("projects")}>View all</Btn>
          </div>
          {projects.slice(0, 4).map(p => {
            const ptasks = tasks.filter(t => t.projectId === p.id);
            const done = ptasks.filter(t => t.status === "completed").length;
            const pct = ptasks.length ? Math.round(done / ptasks.length * 100) : 0;
            return (
              <div key={p.id} style={{ marginBottom: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ width: 10, height: 10, borderRadius: "50%", background: p.color }} />
                    <span style={{ fontSize: 13, fontWeight: 600, color: "#333", fontFamily: "'DM Sans', sans-serif" }}>{p.name}</span>
                  </div>
                  <span style={{ fontSize: 11, color: "#9ca3af", fontFamily: "'DM Mono', monospace" }}>{done}/{ptasks.length}</span>
                </div>
                <div style={{ height: 5, background: "#f3f4f6", borderRadius: 10, overflow: "hidden" }}>
                  <div style={{ width: pct + "%", height: "100%", background: p.color, borderRadius: 10, transition: "width 0.4s" }} />
                </div>
              </div>
            );
          })}
        </div>

        {/* Recent Tasks */}
        <div style={{ background: "#fff", borderRadius: 14, padding: 20, border: "1.5px solid #f0f0f0" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "#111", fontFamily: "'DM Sans', sans-serif" }}>Recent Tasks</h3>
            <Btn variant="ghost" size="sm" onClick={() => onNavigate("tasks")}>View all</Btn>
          </div>
          {recentTasks.map(t => {
            const project = projects.find(p => p.id === t.projectId);
            const overdue = isOverdue(t.dueDate) && t.status !== "completed";
            return (
              <div key={t.id} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10, padding: "8px 10px", borderRadius: 8, background: overdue ? "#fef2f2" : "#fafafa" }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: statusColors[t.status], flexShrink: 0 }} />
                <span style={{ flex: 1, fontSize: 13, fontWeight: 500, color: "#333", fontFamily: "'DM Sans', sans-serif", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.title}</span>
                {project && <span style={{ fontSize: 11, color: project.color, fontWeight: 600, fontFamily: "'DM Sans', sans-serif", flexShrink: 0 }}>● {project.name}</span>}
              </div>
            );
          })}
          {recentTasks.length === 0 && <p style={{ color: "#9ca3af", fontSize: 13, fontFamily: "'DM Sans', sans-serif" }}>No tasks yet.</p>}
        </div>
      </div>
    </div>
  );
}

// ─── Tasks View ───────────────────────────────────────────────────────────────
function TasksView({ currentUser }) {
  const [tasks, setTasks] = useState([]);
  const [filter, setFilter] = useState("all");
  const [projectFilter, setProjectFilter] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [editTask, setEditTask] = useState(null);
  const projects = api.getProjects(currentUser.id, currentUser.role);
  const users = api.getUsers();

  const refresh = useCallback(() => {
    setTasks(api.getTasks(currentUser.id, currentUser.role));
  }, [currentUser]);

  useEffect(() => { refresh(); }, [refresh]);

  const filtered = tasks.filter(t => {
    const statusOk = filter === "all" || (filter === "overdue" ? isOverdue(t.dueDate) && t.status !== "completed" : t.status === filter);
    const projectOk = projectFilter === "all" || t.projectId === parseInt(projectFilter);
    return statusOk && projectOk;
  });

  const handleStatusChange = (id, status) => {
    api.updateTask(id, { status });
    refresh();
  };

  const handleDelete = (id) => {
    if (window.confirm("Delete this task?")) { api.deleteTask(id); refresh(); }
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: "#111", fontFamily: "'DM Sans', sans-serif", letterSpacing: "-0.03em" }}>Tasks</h2>
        {(currentUser.role === "admin") && (
          <Btn onClick={() => { setEditTask(null); setShowForm(true); }}>+ New Task</Btn>
        )}
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
        {[["all", "All"], ["pending", "Pending"], ["in-progress", "In Progress"], ["completed", "Completed"], ["overdue", "Overdue"]].map(([v, l]) => (
          <button key={v} onClick={() => setFilter(v)} style={{
            padding: "6px 14px", borderRadius: 20, border: "none", cursor: "pointer", fontSize: 12,
            fontWeight: 600, fontFamily: "'DM Sans', sans-serif",
            background: filter === v ? "#6366f1" : "#f3f4f6",
            color: filter === v ? "#fff" : "#6b7280"
          }}>{l}</button>
        ))}
        <select value={projectFilter} onChange={e => setProjectFilter(e.target.value)}
          style={{ padding: "6px 14px", borderRadius: 20, border: "1.5px solid #e5e7eb", fontSize: 12, fontWeight: 600, fontFamily: "'DM Sans', sans-serif", color: "#374151", background: "#fff", cursor: "pointer" }}>
          <option value="all">All Projects</option>
          {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
      </div>

      {filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: "40px 20px", color: "#9ca3af", fontFamily: "'DM Sans', sans-serif" }}>
          <div style={{ fontSize: 36, marginBottom: 10 }}>📭</div>
          <p style={{ margin: 0 }}>No tasks found.</p>
        </div>
      ) : (
        filtered.map(t => (
          <TaskCard key={t.id} task={t} currentUser={currentUser}
            onEdit={(task) => { setEditTask(task); setShowForm(true); }}
            onDelete={handleDelete} onStatusChange={handleStatusChange}
            projects={projects} users={users} />
        ))
      )}

      {showForm && (
        <TaskForm
          task={editTask}
          onSave={refresh}
          onClose={() => { setShowForm(false); setEditTask(null); }}
          currentUser={currentUser}
        />
      )}
    </div>
  );
}

// ─── Projects View ────────────────────────────────────────────────────────────
function ProjectsView({ currentUser }) {
  const [projects, setProjects] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editProject, setEditProject] = useState(null);
  const users = api.getUsers();

  const refresh = useCallback(() => {
    setProjects(api.getProjects(currentUser.id, currentUser.role));
  }, [currentUser]);
  useEffect(() => { refresh(); }, [refresh]);

  const handleDelete = (id) => {
    if (window.confirm("Delete this project and all its tasks?")) { api.deleteProject(id); refresh(); }
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: "#111", fontFamily: "'DM Sans', sans-serif", letterSpacing: "-0.03em" }}>Projects</h2>
        {currentUser.role === "admin" && <Btn onClick={() => { setEditProject(null); setShowForm(true); }}>+ New Project</Btn>}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
        {projects.map(p => {
          const ptasks = api.getTasks(currentUser.id, currentUser.role, p.id);
          const done = ptasks.filter(t => t.status === "completed").length;
          const pct = ptasks.length ? Math.round(done / ptasks.length * 100) : 0;
          const members = p.members.map(mid => users.find(u => u.id === mid)).filter(Boolean);

          return (
            <div key={p.id} style={{
              background: "#fff", borderRadius: 16, overflow: "hidden",
              border: "1.5px solid #f0f0f0", boxShadow: "0 1px 6px rgba(0,0,0,0.05)"
            }}>
              <div style={{ height: 6, background: p.color }} />
              <div style={{ padding: "18px 20px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                  <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "#111", fontFamily: "'DM Sans', sans-serif" }}>{p.name}</h3>
                  {currentUser.role === "admin" && (
                    <div style={{ display: "flex", gap: 4 }}>
                      <Btn variant="ghost" size="sm" onClick={() => { setEditProject(p); setShowForm(true); }}>✏</Btn>
                      <Btn variant="ghost" size="sm" onClick={() => handleDelete(p.id)} style={{ color: "#ef4444" }}>✕</Btn>
                    </div>
                  )}
                </div>
                <p style={{ margin: "0 0 14px", fontSize: 13, color: "#9ca3af", fontFamily: "'DM Sans', sans-serif", lineHeight: 1.5 }}>{p.description}</p>

                <div style={{ marginBottom: 12 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                    <span style={{ fontSize: 12, color: "#6b7280", fontFamily: "'DM Sans', sans-serif", fontWeight: 500 }}>Progress</span>
                    <span style={{ fontSize: 12, color: p.color, fontFamily: "'DM Mono', monospace", fontWeight: 600 }}>{pct}%</span>
                  </div>
                  <div style={{ height: 6, background: "#f3f4f6", borderRadius: 10, overflow: "hidden" }}>
                    <div style={{ width: pct + "%", height: "100%", background: p.color, borderRadius: 10, transition: "width 0.4s" }} />
                  </div>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ display: "flex", gap: -4 }}>
                    {members.slice(0, 4).map((u, i) => (
                      <div key={u.id} style={{ marginLeft: i > 0 ? -6 : 0, border: "2px solid #fff", borderRadius: "50%" }}>
                        <Avatar initials={u.avatar} size={26} color={p.color} />
                      </div>
                    ))}
                    {members.length > 4 && <div style={{ width: 26, height: 26, borderRadius: "50%", background: "#f3f4f6", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, color: "#6b7280", marginLeft: -6, border: "2px solid #fff" }}>+{members.length - 4}</div>}
                  </div>
                  <span style={{ fontSize: 12, color: "#9ca3af", fontFamily: "'DM Mono', monospace" }}>{ptasks.length} task{ptasks.length !== 1 ? "s" : ""}</span>
                </div>
              </div>
            </div>
          );
        })}
        {projects.length === 0 && (
          <div style={{ gridColumn: "1/-1", textAlign: "center", padding: "40px 20px", color: "#9ca3af", fontFamily: "'DM Sans', sans-serif" }}>
            <div style={{ fontSize: 36, marginBottom: 10 }}>📁</div>
            <p style={{ margin: 0 }}>No projects yet.</p>
          </div>
        )}
      </div>

      {showForm && (
        <ProjectForm
          project={editProject}
          onSave={refresh}
          onClose={() => { setShowForm(false); setEditProject(null); }}
          currentUser={currentUser}
        />
      )}
    </div>
  );
}

// ─── Users View (Admin only) ──────────────────────────────────────────────────
function UsersView() {
  const users = api.getUsers();
  const tasks = DB.tasks;

  return (
    <div>
      <h2 style={{ margin: "0 0 20px", fontSize: 22, fontWeight: 800, color: "#111", fontFamily: "'DM Sans', sans-serif", letterSpacing: "-0.03em" }}>Team Members</h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 14 }}>
        {users.map(u => {
          const userTasks = tasks.filter(t => t.assigneeId === u.id);
          const done = userTasks.filter(t => t.status === "completed").length;
          return (
            <div key={u.id} style={{
              background: "#fff", borderRadius: 14, padding: "20px 22px",
              border: "1.5px solid #f0f0f0", boxShadow: "0 1px 4px rgba(0,0,0,0.04)"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
                <Avatar initials={u.avatar} size={44} color={u.role === "admin" ? "#6366f1" : "#14b8a6"} />
                <div>
                  <div style={{ fontWeight: 700, fontSize: 15, color: "#111", fontFamily: "'DM Sans', sans-serif" }}>{u.name}</div>
                  <div style={{ fontSize: 12, color: "#9ca3af", fontFamily: "'DM Sans', sans-serif" }}>{u.email}</div>
                </div>
              </div>
              <Badge label={u.role} color={u.role === "admin" ? "#6366f1" : "#14b8a6"} />
              <div style={{ marginTop: 14, display: "flex", gap: 16 }}>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 20, fontWeight: 800, color: "#111", fontFamily: "'DM Sans', sans-serif" }}>{userTasks.length}</div>
                  <div style={{ fontSize: 11, color: "#9ca3af", fontFamily: "'DM Sans', sans-serif" }}>Assigned</div>
                </div>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 20, fontWeight: 800, color: "#22c55e", fontFamily: "'DM Sans', sans-serif" }}>{done}</div>
                  <div style={{ fontSize: 11, color: "#9ca3af", fontFamily: "'DM Sans', sans-serif" }}>Done</div>
                </div>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 20, fontWeight: 800, color: "#f59e0b", fontFamily: "'DM Sans', sans-serif" }}>{userTasks.length - done}</div>
                  <div style={{ fontSize: 11, color: "#9ca3af", fontFamily: "'DM Sans', sans-serif" }}>Open</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Main App ─────────────────────────────────────────────────────────────────
export default function App() {
  const [user, setUser] = useState(null);
  const [page, setPage] = useState("dashboard");

  if (!user) return <AuthScreen onLogin={setUser} />;

  const navItems = [
    { id: "dashboard", icon: "⊞", label: "Dashboard" },
    { id: "tasks", icon: "✓", label: "Tasks" },
    { id: "projects", icon: "◈", label: "Projects" },
    ...(user.role === "admin" ? [{ id: "users", icon: "◉", label: "Users" }] : []),
  ];

  return (
    <div style={{ minHeight: "100vh", background: "#f8f9fb", fontFamily: "'DM Sans', sans-serif", display: "flex" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=DM+Mono:wght@400;500;600&display=swap');
        * { box-sizing: border-box; }
        select option { font-family: 'DM Sans', sans-serif; }
        ::-webkit-scrollbar { width: 5px; } ::-webkit-scrollbar-thumb { background: #e5e7eb; border-radius: 10px; }
      `}</style>

      {/* Sidebar */}
      <div style={{
        width: 220, flexShrink: 0, background: "#fff",
        borderRight: "1.5px solid #f0f0f0",
        display: "flex", flexDirection: "column",
        padding: "24px 12px", minHeight: "100vh", position: "sticky", top: 0, height: "100vh"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "0 8px", marginBottom: 28 }}>
          <div style={{
            width: 34, height: 34, borderRadius: 10, background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16
          }}>⚡</div>
          <span style={{ fontWeight: 800, fontSize: 16, color: "#111", letterSpacing: "-0.03em" }}>TaskFlow</span>
        </div>

        <nav style={{ flex: 1 }}>
          {navItems.map(item => (
            <button key={item.id} onClick={() => setPage(item.id)} style={{
              width: "100%", padding: "10px 12px", display: "flex", alignItems: "center", gap: 10,
              border: "none", borderRadius: 10, cursor: "pointer", marginBottom: 2,
              background: page === item.id ? "#eef2ff" : "transparent",
              color: page === item.id ? "#6366f1" : "#6b7280",
              fontWeight: page === item.id ? 700 : 500, fontSize: 14,
              fontFamily: "'DM Sans', sans-serif", transition: "all 0.15s", textAlign: "left"
            }}>
              <span style={{ fontSize: 16, width: 20, textAlign: "center" }}>{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>

        {/* User */}
        <div style={{ borderTop: "1.5px solid #f0f0f0", paddingTop: 14 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 10px", borderRadius: 10 }}>
            <Avatar initials={user.avatar} size={34} color={user.role === "admin" ? "#6366f1" : "#14b8a6"} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#111", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user.name}</div>
              <Badge label={user.role} color={user.role === "admin" ? "#6366f1" : "#14b8a6"} />
            </div>
          </div>
          <button onClick={() => setUser(null)} style={{
            width: "100%", marginTop: 6, padding: "8px 12px", border: "none", borderRadius: 8,
            background: "#fef2f2", color: "#ef4444", fontWeight: 600, fontSize: 13,
            cursor: "pointer", fontFamily: "'DM Sans', sans-serif"
          }}>Sign Out</button>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, padding: "32px", overflowY: "auto" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          {page === "dashboard" && <Dashboard currentUser={user} onNavigate={setPage} />}
          {page === "tasks" && <TasksView currentUser={user} />}
          {page === "projects" && <ProjectsView currentUser={user} />}
          {page === "users" && user.role === "admin" && <UsersView />}
        </div>
      </div>
    </div>
  );
}
