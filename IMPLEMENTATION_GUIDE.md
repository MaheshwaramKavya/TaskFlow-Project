# TaskFlow - Quick Reference Guide

## 🎯 Key Updates Overview

### What's New in This Update?
1. ✅ **Chat/Messaging** - Real-time team communication
2. ✅ **User Profiles** - Personalized user management
3. ✅ **Landing Page** - Professional home page
4. ✅ **Enhanced Design** - Beautiful UI improvements
5. ✅ **Email Reminders** - Automated deadline alerts
6. ✅ **Live Code Execution** - Run JavaScript in-app
7. ✅ **App Branding** - Professional logo and identity
8. ✅ **Navigation** - Improved page routing

---

## 🚀 Quick Start

### Installation
```bash
cd c:\Users\sweth\Downloads\taskflow
npm run install-all
```

### Running the App
```bash
npm run dev
# or
npm start
```

**Frontend:** http://localhost:3000
**Backend:** http://localhost:5000

---

## 📂 New File Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── ChatBox.js          [NEW]
│   │   ├── AuthContext.js
│   │   ├── CodeEditor.js
│   │   ├── Sidebar.js          [UPDATED]
│   │   └── UI.js
│   ├── pages/
│   │   ├── HomePage.js         [NEW]
│   │   ├── ProfilePage.js      [NEW]
│   │   ├── AuthPage.js
│   │   ├── Dashboard.js
│   │   ├── TasksPage.js
│   │   ├── ProjectsPage.js
│   │   └── UsersPage.js
│   ├── App.js                  [UPDATED]
│   ├── styles.css              [UPDATED]
│   └── api/
│       └── index.js

backend/
├── controllers/
│   ├── authController.js
│   ├── projectController.js
│   ├── taskController.js
│   ├── userController.js
│   └── messageController.js    [NEW]
├── routes/
│   ├── auth.js
│   ├── projects.js
│   ├── tasks.js
│   ├── users.js
│   ├── messages.js             [NEW]
│   └── index.js
├── models/
│   └── db.js                   [UPDATED - Added tables]
├── services/
│   ├── emailService.js         [Already complete]
│   └── reminderService.js      [Already complete]
└── server.js                   [UPDATED]

Project Root/
├── FEATURES_ADDED.md           [NEW]
├── IMPLEMENTATION_GUIDE.md     [THIS FILE]
├── FIXES_SUMMARY.md
└── README.md
```

---

## 💬 Using the Chat System

### For Users
1. Open a project or task
2. Scroll to the Chat Box component
3. Type your message
4. Click "Send"
5. See real-time updates

### For Developers
```javascript
// Import ChatBox
import ChatBox from '../components/ChatBox';

// Use in component
<ChatBox taskId={taskId} projectId={projectId} />

// API Calls (from api/index.js)
// Messages are handled automatically by the ChatBox component
```

---

## 👤 Profile Management

### For Users
1. Click "Profile" in sidebar
2. View your information and stats
3. Click "Edit Profile" to update
4. Changes save automatically

### For Developers
```javascript
// Import ProfilePage
import ProfilePage from '../pages/ProfilePage';

// Use as route
<Route path="profile" component={ProfilePage} />

// API Endpoint
PUT /api/users/:id - Update user profile
```

---

## 📧 Email Reminders Configuration

### Setup Gmail SMTP
1. Enable 2-factor authentication on Gmail
2. Generate App Password: https://myaccount.google.com/apppasswords
3. Update `.env`:
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

### What Users Will Receive
- **Deadline Reminders:** 1 day before due date (customizable)
- **Overdue Alerts:** When tasks are late
- **Daily Summaries:** At 9 AM with task status

---

## 💻 Code Execution Features

### For Users
1. Create a task with code
2. Go to the "Live Coding Workspace" tab
3. Write or select a template
4. Click "Run Code"
5. View output in "Output" tab

### Available Templates
- Hello World
- Function Definition
- Array Operations
- Object Manipulation

### For Developers
```javascript
// Code execution happens in taskController.js
// Endpoints: POST /api/tasks/execute-code

// Safe execution features:
// - VM-based sandboxing
// - 5-second timeout
// - No require() allowed
// - No setTimeout/setInterval
// - No process access
```

---

## 🎨 Styling & CSS Classes

### New CSS Classes
```css
/* Chat */
.chatbox-container
.chatbox-message
.chatbox-input

/* Profile */
.profile-header
.profile-stats
.profile-stat-card

/* Code */
.code-execution-panel
.code-output

/* Hero */
.hero-section
.hero-title
.features-grid
.feature-card
```

### Color Variables (CSS)
```css
--cyan: #69e6ff
--indigo: #7b5cff
--magenta: #ff65d0
--text: #e8ebff
--muted: #a9b0d4
--success: #6effc2
--danger: #ff7eb3
```

---

## 🗄️ Database Changes

### New Tables
```sql
-- Messages table
CREATE TABLE messages (
  id SERIAL PRIMARY KEY,
  content TEXT NOT NULL,
  sender_id INTEGER REFERENCES users(id),
  task_id INTEGER REFERENCES tasks(id),
  project_id INTEGER REFERENCES projects(id),
  created_at TIMESTAMP DEFAULT NOW()
);

-- User Profiles table
CREATE TABLE user_profiles (
  id SERIAL PRIMARY KEY,
  user_id INTEGER UNIQUE REFERENCES users(id),
  bio TEXT,
  avatar_url VARCHAR(255),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

---

## 🔌 API Endpoints (New)

### Messages
```
GET    /api/tasks/:taskId/messages
POST   /api/tasks/:taskId/messages
GET    /api/projects/:projectId/messages
POST   /api/projects/:projectId/messages
DELETE /api/messages/:messageId
```

### User Profiles
```
GET    /api/users/:id          - Get user profile
PUT    /api/users/:id          - Update profile
GET    /api/users              - List all users
```

### Code Execution
```
POST   /api/tasks/execute-code - Execute JavaScript code
```

---

## 🔐 Security Notes

1. **Messages:** Only authenticated users can send/receive
2. **Code Execution:** Safe VM sandbox prevents file access
3. **Profiles:** Users can only edit their own profiles
4. **Email:** SMTP credentials should never be in version control

---

## 🧪 Testing the Features

### Test Chat
1. Create a task
2. Scroll to Chat Box
3. Send test messages
4. Refresh page to verify persistence

### Test Code Execution
1. Create a task with code
2. Enter: `console.log("Hello from TaskFlow!");`
3. Click Run Code
4. Should see output immediately

### Test Email Reminders
1. Create task with due date tomorrow
2. Check spam folder
3. Verify reminder arrives 1 day before

### Test Profile
1. Go to Profile page
2. Click Edit Profile
3. Update bio
4. Verify changes save

---

## 🐛 Troubleshooting

### Chat Not Working
- Check backend server is running
- Verify API routes in `backend/routes/messages.js`
- Check browser console for errors

### Emails Not Sending
- Verify SMTP credentials in .env
- Check `backend/services/emailService.js` logs
- Ensure 2FA and app password are set correctly

### Code Execution Fails
- Check syntax in code editor
- Verify language is JavaScript
- Check console output for error details

### Styles Not Applying
- Clear browser cache
- Restart frontend dev server
- Check `frontend/src/styles.css` is imported

---

## 📖 File Descriptions

| File | Purpose | Status |
|------|---------|--------|
| ChatBox.js | Real-time messaging component | New ✨ |
| ProfilePage.js | User profile management | New ✨ |
| HomePage.js | Landing page | New ✨ |
| messageController.js | Message CRUD operations | New ✨ |
| messages.js routes | Message API endpoints | New ✨ |
| db.js | Database schemas | Updated 🔄 |
| App.js | Main app routes | Updated 🔄 |
| Sidebar.js | Navigation menu | Updated 🔄 |
| styles.css | Component styles | Updated 🔄 |
| server.js | Backend server setup | Updated 🔄 |

---

## 🎓 Learning Resources

### Understanding Components
- View `ChatBox.js` to understand real-time updates
- View `ProfilePage.js` for form management
- View `CodeEditor.js` for advanced features

### Understanding Backend
- `messageController.js` - Message operations
- `emailService.js` - Email templates
- `reminderService.js` - Scheduled tasks

### Understanding Styles
- `styles.css` - All design tokens and animations
- Search for `.chatbox-`, `.profile-`, `.code-` prefixes

---

## ✅ Verification Checklist

After setup, verify:
- [ ] Frontend loads without errors
- [ ] Can navigate to all pages
- [ ] Profile page displays user info
- [ ] Chat box appears in tasks/projects
- [ ] Code execution runs JavaScript
- [ ] Emails are configured (check .env)
- [ ] No console errors
- [ ] Responsive on mobile

---

## 📞 Support

For questions about specific features, check:
1. The component source code (comments included)
2. This guide's relevant section
3. FEATURES_ADDED.md for detailed info
4. Backend controller files

---

**Document Version:** 1.0
**Last Updated:** May 5, 2026
