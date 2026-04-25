-- Runcademic Database Schema (PostgreSQL)
-- Normalized 3NF design

-- ===== CORE TABLES =====

CREATE TABLE departments (
  department_id SERIAL PRIMARY KEY,
  department_name VARCHAR(255) NOT NULL,
  description TEXT,
  head_user_id INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  status VARCHAR(50) DEFAULT 'active'
);

CREATE TABLE users (
  user_id SERIAL PRIMARY KEY,
  username VARCHAR(100) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255),
  github_id VARCHAR(100),
  github_username VARCHAR(100),
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  role VARCHAR(50) NOT NULL CHECK (role IN ('student', 'instructor', 'admin', 'user', 'faculty', 'support_staff')),
  department_id INT REFERENCES departments(department_id),
  phone VARCHAR(20),
  avatar_url VARCHAR(255),
  bio TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_login TIMESTAMP,
  status VARCHAR(50) DEFAULT 'active'
);

-- ===== TICKETS (SERVICE REQUESTS) =====

CREATE TABLE ticket_categories (
  category_id SERIAL PRIMARY KEY,
  category_name VARCHAR(100) NOT NULL,
  description TEXT,
  department_id INT REFERENCES departments(department_id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE tickets (
  ticket_id SERIAL PRIMARY KEY,
  ticket_number VARCHAR(50) UNIQUE NOT NULL,
  user_id INT NOT NULL REFERENCES users(user_id),
  assigned_to INT REFERENCES users(user_id),
  category_id INT REFERENCES ticket_categories(category_id),
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  priority INT CHECK (priority BETWEEN 1 AND 5) DEFAULT 3,
  status VARCHAR(50) NOT NULL CHECK (status IN ('open', 'assigned', 'in_progress', 'resolved', 'closed', 'reopened')) DEFAULT 'open',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  resolved_at TIMESTAMP,
  resolution_notes TEXT
);

CREATE TABLE ticket_attachments (
  attachment_id SERIAL PRIMARY KEY,
  ticket_id INT NOT NULL REFERENCES tickets(ticket_id) ON DELETE CASCADE,
  file_name VARCHAR(255),
  file_url VARCHAR(255),
  file_size INT,
  mime_type VARCHAR(100),
  uploaded_by INT REFERENCES users(user_id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ===== COMMENTS & COMMUNICATION =====

CREATE TABLE comments (
  comment_id SERIAL PRIMARY KEY,
  ticket_id INT NOT NULL REFERENCES tickets(ticket_id) ON DELETE CASCADE,
  user_id INT NOT NULL REFERENCES users(user_id),
  comment_text TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  is_internal BOOLEAN DEFAULT FALSE
);

-- ===== SCHEDULING =====

CREATE TABLE schedules (
  schedule_id SERIAL PRIMARY KEY,
  event_title VARCHAR(255) NOT NULL,
  user_id INT NOT NULL REFERENCES users(user_id),
  assigned_to INT REFERENCES users(user_id),
  description TEXT,
  start_time TIMESTAMP NOT NULL,
  end_time TIMESTAMP NOT NULL,
  location VARCHAR(255),
  event_type VARCHAR(50) CHECK (event_type IN ('appointment', 'meeting', 'deadline', 'event')) DEFAULT 'event',
  status VARCHAR(50) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE schedule_attendees (
  attendee_id SERIAL PRIMARY KEY,
  schedule_id INT NOT NULL REFERENCES schedules(schedule_id) ON DELETE CASCADE,
  user_id INT NOT NULL REFERENCES users(user_id),
  status VARCHAR(50) DEFAULT 'invited' CHECK (status IN ('invited', 'accepted', 'declined', 'no_response'))
);

-- ===== TASKS =====

CREATE TABLE tasks (
  task_id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  created_by INT NOT NULL REFERENCES users(user_id),
  assigned_to INT REFERENCES users(user_id),
  related_ticket_id INT REFERENCES tickets(ticket_id),
  priority INT CHECK (priority BETWEEN 1 AND 5) DEFAULT 3,
  status VARCHAR(50) NOT NULL CHECK (status IN ('pending', 'in_progress', 'review', 'completed', 'cancelled')) DEFAULT 'pending',
  due_date DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP
);

-- ===== NOTIFICATIONS =====

CREATE TABLE notifications (
  notification_id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  related_ticket_id INT REFERENCES tickets(ticket_id),
  related_schedule_id INT REFERENCES schedules(schedule_id),
  notification_type VARCHAR(50) NOT NULL,
  title VARCHAR(255),
  message TEXT,
  read_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ===== AUDIT & LOGGING =====

CREATE TABLE audit_logs (
  log_id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(user_id),
  action VARCHAR(100),
  entity_type VARCHAR(50),
  entity_id INT,
  old_values JSONB,
  new_values JSONB,
  ip_address VARCHAR(45),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ===== INDEXES FOR PERFORMANCE =====

CREATE INDEX idx_users_department ON users(department_id);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_tickets_user ON tickets(user_id);
CREATE INDEX idx_tickets_assigned_to ON tickets(assigned_to);
CREATE INDEX idx_tickets_status ON tickets(status);
CREATE INDEX idx_tickets_created_at ON tickets(created_at);
CREATE INDEX idx_schedules_user ON schedules(user_id);
CREATE INDEX idx_schedules_start_time ON schedules(start_time);
CREATE INDEX idx_tasks_assigned_to ON tasks(assigned_to);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_comments_ticket ON comments(ticket_id);
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(read_at);

-- ===== CONSTRAINTS =====

ALTER TABLE departments 
ADD CONSTRAINT fk_dept_head FOREIGN KEY (head_user_id) REFERENCES users(user_id);

-- ===== VIEWS FOR REPORTING =====

CREATE VIEW ticket_summary AS
SELECT 
  t.ticket_id,
  t.ticket_number,
  t.title,
  u.username as created_by,
  a.username as assigned_to,
  t.priority,
  t.status,
  COUNT(c.comment_id) as comment_count,
  t.created_at
FROM tickets t
LEFT JOIN users u ON t.user_id = u.user_id
LEFT JOIN users a ON t.assigned_to = a.user_id
LEFT JOIN comments c ON t.ticket_id = c.ticket_id
GROUP BY t.ticket_id, u.username, a.username;

CREATE VIEW department_workload AS
SELECT 
  d.department_id,
  d.department_name,
  COUNT(DISTINCT t.ticket_id) as total_tickets,
  COUNT(DISTINCT CASE WHEN t.status IN ('open', 'assigned') THEN t.ticket_id END) as open_tickets,
  COUNT(DISTINCT ts.task_id) as total_tasks
FROM departments d
LEFT JOIN users u ON d.department_id = u.department_id
LEFT JOIN tickets t ON u.user_id = t.assigned_to
LEFT JOIN tasks ts ON u.user_id = ts.assigned_to
GROUP BY d.department_id, d.department_name;
