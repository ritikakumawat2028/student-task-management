# Student Task Management System

A comprehensive education platform for managing assignments, submissions, and communication between teachers and students.

![Angular](https://img.shields.io/badge/Angular-18+-red.svg)
![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)
![Express](https://img.shields.io/badge/Express-4+-blue.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-Latest-blue.svg)

---

## 📋 Table of Contents
- [Features](#features)
- [Quick Start](#quick-start)
- [Project Structure](#project-structure)
- [Tech Stack](#tech-stack)
- [Documentation](#documentation)

---

## ✨ Features

### Admin Panel
- ✅ User registration approval/rejection
- ✅ Class and teacher management
- ✅ User account management & blocking
- ✅ System overview dashboard
- ✅ Manage roles and permissions

### Teacher Dashboard
- ✅ Create and manage assignments
- ✅ Grade student submissions
- ✅ Post announcements
- ✅ View class information
- ✅ Track student progress

### Student Dashboard
- ✅ View assignments with deadlines
- ✅ Submit assignments
- ✅ View grades and feedback
- ✅ Read announcements
- ✅ Profile management

### Security & Validation
- ✅ Email validation
- ✅ Password strength (min 6 characters)
- ✅ Full name validation (min 2 characters)
- ✅ Unique roll number enforcement
- ✅ Role-based access control

---

## 🚀 Quick Start

### Prerequisites
- Node.js v18+
- npm or yarn
- Git

### Installation

**1. Clone the repository**
```bash
git clone <repository-url>
cd Student\ Task\ Management\ System
```

**2. Backend Setup**
```bash
cd backend
npm install
npm start
# Server runs on http://localhost:3000
```

**3. Frontend Setup** (new terminal)
```bash
cd frontend
npm install
ng serve
# App opens at http://localhost:4200
```

### Default Admin Credentials
- **Email**: `admin@school.com`
- **Password**: `admin123`

---

## 📁 Project Structure

```
Student Task Management System/
├── backend/                    # Express.js server
│   ├── src/
│   │   ├── server.ts          # Main entry point
│   │   ├── routes/            # API endpoints
│   │   ├── middleware/        # Express middlewares
│   │   └── config/            # Configuration
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/                   # Angular application
│   ├── src/
│   │   ├── app/
│   │   │   ├── components/    # UI components
│   │   │   ├── services/      # Business logic
│   │   │   ├── guards/        # Route protection
│   │   │   └── models/        # Data models
│   │   ├── index.html
│   │   └── main.ts
│   ├── angular.json
│   └── package.json
│
├── docs/                       # Documentation
│   ├── ARCHITECTURE.md        # System design
│   └── SETUP.md              # Setup guide
│
└── README.md                   # This file
```

---

## 🛠️ Tech Stack

### Frontend
- **Angular 18+** - Modern web framework
- **Angular Material** - Professional UI components
- **SCSS** - Advanced styling
- **TypeScript** - Type-safe development

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - REST API framework
- **TypeScript** - Type-safe development
- **LocalStorage** - Session management

---

## 📚 Documentation

- **[SETUP.md](docs/SETUP.md)** - Detailed installation & configuration
- **[ARCHITECTURE.md](docs/ARCHITECTURE.md)** - System design & folder structure

---

## 🔐 Authentication

- Local storage-based authentication
- Role-based access control (Admin, Teacher, Student)
- Session management
- Auto-logout on session expiry

---

## 🎨 UI/UX

- Responsive design for all devices
- Material Design principles
- Dark & accessible color schemes
- Smooth animations and transitions
- Mobile-first approach

---

## 🧪 Development

### Frontend Commands
```bash
ng serve              # Start dev server
ng build             # Production build
ng test              # Run tests
ng lint              # Code analysis
```

### Backend Commands
```bash
npm start            # Start server
npm run dev          # Dev with hot reload
npm run build        # Build TypeScript
```

---

## 🐛 Troubleshooting

### Port Conflicts
```bash
# Kill process on port
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

### Dependencies Issues
```bash
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

---

## 📝 Form Validations

### Registration Form
| Field | Validation |
|-------|-----------|
| Full Name | Min 2 characters |
| Email | Valid email format |
| Password | Min 6 characters |
| Roll Number (Students) | Required, unique, not 0 |

### Profile Updates
- **Admin**: All fields editable
- **Teacher**: Only Name & Password
- **Student**: Only Name & Password

---

## 🚀 Deployment

Build for production:
```bash
# Frontend
cd frontend
ng build --configuration production

# Backend
cd backend
npm run build
```

---

## 📄 License

This project is part of an educational assignment.

---

## 👥 Team

Developed as a complete student management solution.

---

## 📞 Support

For issues or questions, please refer to the documentation in `/docs` folder.
- **Firebase Admin SDK** - Server-side Firebase
- **TypeScript** - Type safety
- **Node.js** - Runtime environment

### Database & Storage
- **Firebase Firestore** - NoSQL database
- **Firebase Authentication** - User management
- **Firebase Storage** - File storage

---

## 🚀 Quick Start

### Prerequisites
- Node.js v18 or higher
- npm or yarn
- Firebase account
- Angular CLI: `npm install -g @angular/cli`

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd edutask-manager
```

2. **Setup Firebase**
   - Create a Firebase project at https://console.firebase.google.com
   - Enable Authentication, Firestore, and Storage
   - Download configuration files

3. **Install dependencies**
```bash
# Frontend
cd frontend
npm install

# Backend
cd ../backend
npm install
```

4. **Configure environment variables**
   - Frontend: Edit `frontend/src/environments/environment.ts`
   - Backend: Create `backend/.env` from `.env.example`

5. **Create admin user** (see SETUP-INSTRUCTIONS.md)

6. **Run the application**
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
ng serve
```

7. **Access the application**
   - Frontend: http://localhost:4200
   - Backend API: http://localhost:3000

---

## 📖 Documentation

- **[SETUP-INSTRUCTIONS.md](./SETUP-INSTRUCTIONS.md)** - Complete setup guide
- **[MIGRATION-GUIDE.md](./MIGRATION-GUIDE.md)** - Migration from React details
- **[PROJECT-SUMMARY.md](./PROJECT-SUMMARY.md)** - Project overview

---

## 🎨 Screenshots

### Home Page
Beautiful landing page with gradient design and feature highlights.

### Admin Dashboard
Comprehensive admin panel for user and class management.

### Teacher Dashboard
Create assignments, grade submissions, and post announcements.

### Student Dashboard
View assignments, submit work, and track grades.

---

## 📁 Project Structure

```
edutask-manager/
├── frontend/                    # Angular Application ✨
│   ├── src/
│   │   ├── app/
│   │   │   ├── components/     # UI Components
│   │   │   ├── services/       # Business Logic
│   │   │   ├── guards/         # Route Guards
│   │   │   ├── models/         # TypeScript Interfaces
│   │   │   └── shared/         # Shared Utilities & Components
│   │   ├── environments/       # Environment Config
│   │   └── styles.scss         # Global Styles (React theme)
│   └── angular.json
├── backend/                     # Express Server ✨
│   ├── src/
│   │   ├── config/             # Firebase Config
│   │   ├── middleware/         # Auth Middleware
│   │   ├── routes/             # API Routes
│   │   └── server.ts           # Entry Point
│   └── package.json
├── guidelines/                  # Project Guidelines
└── Documentation Files          # Complete guides
```

**Note:** React folder removed after complete code extraction. See `REACT-CODE-EXTRACTED.md` for details.

---

## 🔐 Default Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@school.com | admin123 |
| Teacher | Register and wait for admin approval | - |
| Student | Register and wait for admin approval | - |

---

## 🔄 Workflow

1. **Registration**: Users register as teacher or student
2. **Approval**: Admin approves/rejects registrations
3. **Class Setup**: Admin creates classes and assigns teachers
4. **Enrollment**: Admin enrolls students in classes
5. **Assignments**: Teachers create assignments for classes
6. **Submissions**: Students submit assignments before deadlines
7. **Grading**: Teachers grade submissions with feedback
8. **Announcements**: Teachers post announcements to classes

---

## 🌐 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration

### Users (Admin only)
- `GET /api/users` - Get all users
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user
- `POST /api/users/:id/approve` - Approve user
- `POST /api/users/:id/reject` - Reject user

### Classes
- `GET /api/classes` - Get all classes
- `POST /api/classes` - Create class (Admin)
- `PUT /api/classes/:id` - Update class
- `DELETE /api/classes/:id` - Delete class

### Assignments
- `GET /api/assignments` - Get all assignments
- `POST /api/assignments` - Create assignment (Teacher)
- `PUT /api/assignments/:id` - Update assignment
- `DELETE /api/assignments/:id` - Delete assignment

### Submissions
- `GET /api/submissions` - Get submissions
- `POST /api/submissions` - Submit assignment (Student)
- `PUT /api/submissions/:id/grade` - Grade submission (Teacher)

### Announcements
- `GET /api/announcements` - Get announcements
- `POST /api/announcements` - Create announcement (Teacher)
- `DELETE /api/announcements/:id` - Delete announcement

---

## 🧪 Testing

```bash
# Frontend tests
cd frontend
ng test

# Backend tests
cd backend
npm test
```

---

## 🚢 Deployment

### Frontend (Firebase Hosting)
```bash
cd frontend
ng build --configuration production
firebase deploy --only hosting
```

### Backend (Google Cloud Run / Heroku)
```bash
cd backend
npm run build
# Deploy to your preferred platform
```

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- Angular Team for the amazing framework
- Firebase Team for the backend infrastructure
- Material Design for the UI components
- Express.js community for the robust server framework

---

## 📞 Support

For issues, questions, or suggestions:
- Open an issue on GitHub
- Check the [SETUP-INSTRUCTIONS.md](./SETUP-INSTRUCTIONS.md) for common problems
- Review the [MIGRATION-GUIDE.md](./MIGRATION-GUIDE.md) for detailed information

---

## 🎯 Roadmap

- [ ] Email notifications
- [ ] Push notifications
- [ ] Real-time chat
- [ ] Video conferencing integration
- [ ] Grade analytics dashboard
- [ ] Attendance tracking
- [ ] Parent portal
- [ ] Mobile app (Ionic)
- [ ] Dark mode
- [ ] Multi-language support

---

**Built with ❤️ using Angular, Express.js, and Firebase**

---

## 📊 Project Stats

- **Components**: 6 main dashboards
- **API Endpoints**: 20+ RESTful routes
- **Database Collections**: 5 Firestore collections
- **Authentication**: Firebase Auth with role-based access
- **File Upload**: Firebase Storage integration
- **Real-time Updates**: Firestore listeners

---

**🎉 Ready to revolutionize your classroom management!**
