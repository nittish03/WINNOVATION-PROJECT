# Comprehensive Project Report: WINNOVATION - Student Learning Management System

## Executive Summary

**WINNOVATION** is a comprehensive Student Learning Management System (SLMS) that goes beyond traditional educational platforms. While it provides core LMS features like course management, assignments, and student tracking, its **primary Unique Selling Proposition (USP)** is an integrated suite of utility tools designed to solve real-world problems faced by students in college environments.

### Main USP: Integrated Utility Suite

The platform's standout feature is its **all-in-one utility station** that eliminates the need for students to switch between multiple websites and applications. The utilities are built around a core innovation: **password-protected file access without personal account login**, solving critical problems in shared computing environments like college labs, library computers, and public devices.

---

## 1. Introduction

### 1.1 Overview

WINNOVATION is a full-stack web application built as a comprehensive learning management system with an integrated utility suite. The platform serves as both an educational management system and a productivity hub, addressing the unique needs of students in modern academic environments.

**Key Innovation:** The platform decouples file access from personal identity, allowing students to securely access files on any device without logging into personal accounts. This solves critical privacy and security concerns in shared computing environments.

### 1.2 Core Problem Statement & Solution

#### The Real-World Problem

The project was motivated by a real student problem in college labs and shared systems:

**Scenario:** Students often need files on college lab PCs, library computers, or friends' devices. However, logging into personal Gmail, WhatsApp, or cloud drives on public/shared systems is:
- **Inconvenient:** Requires remembering credentials and going through authentication flows
- **Risky for Privacy/Security:** Personal accounts remain logged in, risking unauthorized access
- **Easy to Forget:** Students often forget to log out, leaving accounts vulnerable

#### The Solution: Vault + Password System

Instead of identity-based login, the platform uses a **vault + password system**:
- Files are stored securely in Google Drive (server-side)
- Access is controlled by passwords, not personal accounts
- Files can be retrieved on any device safely
- No personal account exposure on public machines

**Core Insight:** Decouple file access from personal identity. This makes it especially relevant for:
- College labs
- Shared computers
- Quick cross-device transfers
- Privacy-conscious users

### 1.3 Aim

The primary aim of this project is to create a **single-station platform** where students can:
1. Manage their learning (courses, assignments, skills)
2. Access files securely without personal account login
3. Generate QR codes for quick sharing
4. Save and manage text snippets with organizational tools
5. Use text manipulation utilities (uppercase, lowercase, etc.)

All without leaving the platform or exposing personal credentials on shared devices.

### 1.4 Proposed System

The proposed system is a feature-rich platform that includes:

#### Core LMS Features:
- **User Authentication:** Secure registration and login with credentials (email/password) and Google OAuth
- **Role-Based Access Control:** Distinct roles for students, administrators, and instructors
- **Course Management:** Full CRUD operations for courses with publishing controls
- **Enrollment System:** Students can enroll in courses and track progress
- **Assignment & Grading:** Create assignments, submit work, and grade submissions
- **Skill Tracking:** Track skills associated with courses and users
- **Discussion Forums:** Course-specific discussion threads and replies
- **Certificates:** Generate and track completion certificates

#### Utility Suite (Main USP):
- **Google Drive Integration:** Password-protected file storage and access without personal login
- **Text Management:** Save, organize, and manage text snippets with folder support
- **QR Code Generator:** Generate QR codes for URLs, text, or any data
- **Text Utilities:** Comprehensive text manipulation tools (case conversion, formatting, etc.)

---

## 2. Technologies Used

The project is built on a modern web development stack:

### Core Technologies:
- **Framework:** Next.js 15.0.7 (React framework with App Router)
- **Database:** MongoDB with Prisma as the Object-Relational Mapper (ORM)
- **Authentication:** NextAuth.js with Prisma adapter for session management
- **Styling:** Tailwind CSS for utility-first CSS framework
- **API:** Next.js API routes for the backend

### Key Libraries:
- **`axios`:** HTTP client for making requests from the client-side
- **`bcryptjs`:** Password hashing for secure file protection
- **`react-qr-code`:** QR code generation library
- **`react-hot-toast`:** Toast notifications for user feedback
- **`framer-motion`:** Animation library for enhanced UX
- **`googleapis`:** Google Drive API integration
- **`nodemailer`:** Email sending for verification
- **UI Components:** `lucide-react`, `react-icons` for icons

### Caching System:
- **Custom Cache Module (`lib/cache.ts`):** Implements both client-side and server-side caching
  - Client-side: `fetchCached` function with TTL support
  - Server-side: `cache.wrap` and `cache.invalidatePrefix` for API route caching

---

## 3. Database Schema

The database schema is defined in `prisma/schema.prisma` using MongoDB. The main models are:

### Core LMS Models:
- **`User`:** Stores user information (name, email, password, role: student/admin/instructor)
- **`Course`:** Represents courses with title, description, creator, and skill associations
- **`Skill`:** Defines skills that can be associated with courses and users
- **`Enrollment`:** Tracks user enrollment in courses with progress tracking
- **`Assignment`:** Represents assignments within courses (due date, max points)
- **`Submission`:** Stores user submissions for assignments
- **`Grade`:** Records grades for submissions
- **`Certificate`:** Stores certificate information for course completions
- **`UserSkill`:** Maps skills to users

### Utility Models (New):
- **`pdfDetails`:** Stores file information for Google Drive integration
  - Fields: `id`, `title`, `pdf` (file URL), `type`, `dateUploaded`, `folderId`, `password` (hashed), `driveFileId`
  - Supports password protection via bcrypt hashing
- **`DriveFolder`:** Organizes files into folders
  - Fields: `id`, `name`, `createdAt`, `driveFolderId` (Google Drive folder ID)
- **`Text`:** Stores text snippets with organization
  - Fields: `id`, `title`, `text`, `dateUploaded`, `folderId`
- **`TextFolder`:** Organizes text snippets into folders
  - Fields: `id`, `name`, `createdAt`

### Authentication Models:
- **`Account`:** OAuth account information (NextAuth.js)
- **`Session`:** User session data (NextAuth.js)
- **`VerificationToken`:** Email verification tokens (NextAuth.js)
- **`NonVerifiedUser`:** Temporary storage during email verification

### Discussion Models:
- **`DiscussionThread`:** Course-specific discussion threads
- **`DiscussionReply`:** Replies to discussion threads

---

## 4. Utility Features (Main USP) - Detailed Documentation

### 4.1 Google Drive Integration

#### 4.1.1 Problem Solved
Students need to access files on shared computers (college labs, library PCs) without logging into personal Google accounts, which poses security and privacy risks.

#### 4.1.2 Solution Architecture
- **Server-Side Storage:** Files are uploaded to Google Drive using a service account
- **Password Protection:** Files can be protected with passwords (hashed using bcrypt)
- **No Personal Login Required:** Access is granted via password, not user authentication
- **Folder Organization:** Files can be organized into folders for better management

#### 4.1.3 Technical Implementation

**Frontend (`app/googleDrive/page.jsx`):**
- File upload with drag-and-drop support
- Chunked upload for large files (1MB chunks) with resume capability
- Upload queue management with progress tracking
- Grid and list view modes
- Folder navigation sidebar
- Password-protected file access modal
- Bulk file selection and deletion (admin only)
- Real-time upload progress with speed and time remaining

**Backend API (`app/api/googleDrive/route.js`):**
- **GET `/api/googleDrive`:** Fetch files (optionally filtered by folderId)
  - Returns: `{ success: true, data: [...] }`
  - Files include: `id`, `title`, `pdf` (URL), `type`, `dateUploaded`, `folderId`, `isProtected`
  - Passwords are never returned; only `isProtected` flag
  - Cached for 60 seconds using server-side cache

- **POST `/api/googleDrive`:** Upload files
  - Supports chunked uploads for large files
  - Creates file record in `pdfDetails` table
  - Uploads to Google Drive using service account
  - Stores Google Drive file ID for future reference
  - Optional password protection (hashed with bcrypt)
  - Invalidates cache on successful upload

- **PUT `/api/googleDrive`:** 
  - Update file title
  - Verify password and return file URL for protected files
  - Password verification uses bcrypt comparison

- **DELETE `/api/googleDrive`:** Delete files
  - Removes from database and Google Drive
  - Invalidates cache

**Folder Management (`app/api/googleDrive/folders/route.js`):**
- **GET `/api/googleDrive/folders`:** Fetch all folders with file counts
- **POST `/api/googleDrive/folders`:** Create new folder
  - Creates folder in Google Drive
  - Stores folder record in `DriveFolder` table
- **PUT `/api/googleDrive/folders/[id]`:** Update folder name
- **DELETE `/api/googleDrive/folders/[id]`:** Delete folder and all files within

**Key Features:**
- Chunked upload with pause/resume functionality
- Upload queue with status tracking (pending, uploading, paused, completed, failed)
- Real-time progress indicators (percentage, speed, time remaining)
- Password-protected file access without personal login
- Folder-based organization
- Admin controls for bulk operations

#### 4.1.4 Security Model
- **Password Hashing:** All file passwords are hashed using bcrypt before storage
- **No Password Exposure:** Passwords are never returned in API responses
- **Protected File Flag:** Only `isProtected` boolean is exposed to clients
- **Secure Access:** Password verification happens server-side only
- **Service Account:** Google Drive access uses service account credentials (no user OAuth required)

### 4.2 Text Management System

#### 4.2.1 Purpose
Allows students to save, organize, and manage text snippets (notes, code snippets, quick references) with folder support, similar to file management but for text content.

#### 4.2.2 Technical Implementation

**Frontend (`app/text/page.jsx`):**
- Text input with character counter
- Optional title and folder assignment
- Saved texts list with expand/collapse for long content
- Edit and delete functionality (admin only)
- Copy to clipboard feature
- Folder organization sidebar
- Search and filter capabilities

**Backend API (`app/api/text/route.js`):**
- **GET `/api/text`:** Fetch text snippets (optionally filtered by folderId)
  - Returns: `{ success: true, data: [...] }`
  - Cached for 60 seconds

- **POST `/api/text`:** Create new text snippet
  - Required: `text`
  - Optional: `title`, `folderId`
  - Invalidates cache on creation

- **PUT `/api/text`:** Update text snippet
  - Updates `title`, `text`, or `folderId`
  - Invalidates cache

- **DELETE `/api/text`:** Delete text snippet
  - Invalidates cache

**Folder Management (`app/api/text/folders/route.js`):**
- **GET `/api/text/folders`:** Fetch all text folders
- **POST `/api/text/folders`:** Create new folder
- **PUT `/api/text/folders/[id]`:** Update folder name
- **DELETE `/api/text/folders/[id]`:** Delete folder

**Key Features:**
- Character counter for text input
- Folder-based organization
- Expandable text view for long content
- Copy to clipboard functionality
- Edit and delete (admin only)
- Date tracking for each text snippet

### 4.3 QR Code Generator

#### 4.3.1 Purpose
Quick QR code generation for URLs, text, or any data. Useful for sharing links, contact information, or any text-based data that can be scanned.

#### 4.3.2 Technical Implementation

**Frontend (`app/qr/page.jsx`):**
- Real-time QR code generation as user types
- Animated UI with gradient backgrounds
- Responsive design with motion effects
- Copy/share functionality

**Technology:**
- Uses `react-qr-code` library for QR code generation
- Client-side only (no backend required)
- Instant generation on input change

**Key Features:**
- Real-time QR code preview
- Supports any text or URL input
- Beautiful animated interface
- Responsive design
- No data storage (privacy-focused)

### 4.4 Text Utilities

#### 4.4.1 Purpose
Comprehensive text manipulation tools that eliminate the need to visit external websites for common text operations.

#### 4.4.2 Technical Implementation

**Frontend (`app/textUtils/page.jsx`):**
- Text editor with live preview
- Multiple text transformation tools
- Real-time statistics
- Toast notifications for user feedback

**Available Tools:**
1. **Uppercase:** Convert entire text to uppercase
2. **Lowercase:** Convert entire text to lowercase
3. **Title Case:** Capitalize first letter of each word
4. **Reverse:** Reverse the entire text string
5. **Remove Extra Spaces:** Remove multiple spaces and trim
6. **Copy:** Copy text to clipboard

**Statistics Display:**
- Word count
- Character count (with and without spaces)
- Sentence count
- Paragraph count
- Estimated reading time

**Key Features:**
- Live preview of transformed text
- Real-time statistics calculation
- All operations are client-side (no backend)
- Toast notifications for user feedback
- Responsive grid layout

---

## 5. Data Flow & Architecture

### 5.1 Overall Architecture

The application follows a client-server architecture with Next.js handling both frontend and backend:

```
Client (Browser)
    ↓
Next.js Frontend (React Components)
    ↓
Next.js API Routes (Backend)
    ↓
Prisma ORM
    ↓
MongoDB Database
```

### 5.2 Caching Strategy

The platform implements a dual-layer caching system:

**Client-Side Caching (`lib/cache.ts`):**
- `fetchCached(url, options)`: Wraps fetch requests with caching
- TTL (Time To Live) support
- Version-based cache invalidation
- In-memory cache storage

**Server-Side Caching:**
- `cache.wrap(key, ttl, fn)`: Wraps database queries with caching
- `cache.invalidatePrefix(prefix)`: Invalidates related cache entries
- Used in API routes to reduce database load

**Example Usage:**
```javascript
// Client-side
const data = await fetchCached("/api/googleDrive", { ttlMs: 30000, version: cacheVersion });

// Server-side
const files = await cache.wrap("gdrive:list:all", 60000, async () => {
  return await prismaDB.pdfDetails.findMany();
});
```

### 5.3 Example Data Flows

#### 5.3.1 Google Drive File Upload Flow

1. **User Action:** User drags file or clicks upload button
2. **Frontend:** File is added to upload queue with metadata
3. **Chunking:** Large files are split into 1MB chunks
4. **Upload:** Each chunk is sent via POST to `/api/googleDrive`
5. **Backend Processing:**
   - Validates file and chunk data
   - Uploads chunk to Google Drive using service account
   - Updates database with file metadata
   - Hashes password if provided
6. **Response:** Returns upload status and progress
7. **Cache Invalidation:** Cache is invalidated to reflect new file
8. **UI Update:** Frontend updates progress bar and file list

#### 5.3.2 Password-Protected File Access Flow

1. **User Action:** User clicks on protected file
2. **Frontend:** Opens password modal
3. **User Input:** User enters password
4. **API Call:** PUT request to `/api/googleDrive` with file ID and password
5. **Backend Processing:**
   - Retrieves file from database
   - Compares provided password with hashed password using bcrypt
   - If match: Returns file URL
   - If no match: Returns 401 error
6. **Frontend:** Opens file in new tab if password correct

#### 5.3.3 Text Snippet Creation Flow

1. **User Action:** User types text and clicks save
2. **Frontend:** Validates input and sends POST to `/api/text`
3. **Backend Processing:**
   - Creates record in `Text` table
   - Associates with folder if specified
   - Invalidates text cache
4. **Response:** Returns created text snippet
5. **UI Update:** Text appears in saved texts list

---

## 6. Core LMS Features

### 6.1 User Authentication

**Implementation:**
- **Login Page (`app/login/page.tsx`):** Email/password or Google OAuth
- **NextAuth.js Configuration (`lib/authOptions.js`):**
  - Credentials Provider: Validates email/password with bcrypt
  - Google Provider: OAuth 2.0 flow
- **Session Management:** JWT-based sessions with role information

### 6.2 Student Dashboard

**Frontend (`app/dashboard/page.jsx`):**
- Personalized overview of learning journey
- Course progress tracking
- Skills and certificates display

**Backend (`app/api/student/dashboard/route.js`):**
- Fetches enrollments, skills, certificates
- Calculates statistics (enrolled courses, completed courses)

### 6.3 Admin Dashboard

**Frontend (`app/dashboard/page.jsx`):**
- Platform-wide analytics
- User and course statistics
- Recent activity feed

**Backend (`app/api/admin/dashboard/route.js`):**
- Aggregates platform data
- User counts, course statistics
- Recent enrollments and submissions

### 6.4 Course Management

**Features:**
- Create, read, update, delete courses
- Publish/unpublish controls
- Skill associations
- Creator tracking

**API Endpoints:**
- `GET /api/admin/courses`: List all courses
- `POST /api/admin/courses`: Create course
- `PUT /api/admin/courses/[id]`: Update course
- `PATCH /api/admin/courses/[id]`: Toggle publish status
- `DELETE /api/admin/courses/[id]`: Delete course

### 6.5 Enrollment System

**Features:**
- Students can enroll in courses
- Progress tracking
- Enrollment history

**API Endpoints:**
- `GET /api/enrollments`: Get user's enrollments
- `POST /api/enrollments`: Enroll in course

### 6.6 Assignment & Grading

**Features:**
- Create assignments with due dates
- Submit solutions
- Grade submissions
- Feedback system

**API Endpoints:**
- `POST /api/admin/assignments`: Create assignment
- `POST /api/assignments/[id]/submission`: Submit solution
- `PUT /api/admin/grades`: Grade submission

---

## 7. API Routes Summary

### Core LMS APIs:
- `/api/admin/*`: Administrative endpoints (users, courses, skills, analytics)
- `/api/assignments`: Assignment management
- `/api/auth`: Authentication endpoints
- `/api/courses`: Course browsing and enrollment
- `/api/discussions`: Discussion threads and replies
- `/api/enrollments`: Course enrollment
- `/api/profile`: User profile management
- `/api/skills`: Skill management
- `/api/student/*`: Student-specific endpoints
- `/api/user-skills`: User skill associations

### Utility APIs (New):
- `/api/googleDrive`: File upload, access, and management
  - `GET`: Fetch files
  - `POST`: Upload files (chunked)
  - `PUT`: Update title or verify password
  - `DELETE`: Delete files
- `/api/googleDrive/folders`: Folder management
  - `GET`: Fetch folders
  - `POST`: Create folder
  - `PUT`: Update folder
  - `DELETE`: Delete folder
- `/api/text`: Text snippet management
  - `GET`: Fetch text snippets
  - `POST`: Create text snippet
  - `PUT`: Update text snippet
  - `DELETE`: Delete text snippet
- `/api/text/folders`: Text folder management
  - `GET`: Fetch folders
  - `POST`: Create folder
  - `PUT`: Update folder
  - `DELETE`: Delete folder

**Note:** QR Code Generator and Text Utilities are client-side only and don't require API endpoints.

---

## 8. Frontend Structure

### 8.1 Page Organization

**Core LMS Pages:**
- `/app/dashboard`: Role-based dashboard (student/admin/instructor)
- `/app/courses`: Course browsing and enrollment
- `/app/my-courses`: User's enrolled courses
- `/app/assignments`: Assignment list and submission
- `/app/skills`: Browse available skills
- `/app/user-skills`: User's acquired skills
- `/app/discussions`: Discussion forums
- `/app/admin/*`: Admin management pages

**Utility Pages (New):**
- `/app/googleDrive`: Google Drive file management interface
- `/app/text`: Text snippet management interface
- `/app/qr`: QR code generator
- `/app/textUtils`: Text manipulation utilities

### 8.2 Component Structure

**Reusable Components:**
- `/components/Navbar.jsx`: Main navigation with Utils dropdown
- `/components/drive/PageHeader.jsx`: Header component for Drive page
- `/components/drive/SectionCard.jsx`: Card wrapper for sections

**Utility Libraries:**
- `/lib/cache.ts`: Caching utilities (client and server)
- `/lib/prismaDB.ts`: Prisma database client
- `/lib/authOptions.js`: NextAuth.js configuration

### 8.3 Navigation Integration

The utilities are integrated into the main navigation:
- **Desktop:** "Utils" dropdown menu with sub-links
- **Mobile:** "Utils" section with expandable sub-menu
- **Active State:** Utils link highlights when on any utility page

---

## 9. Security & Privacy Features

### 9.1 File Access Security
- **Password Hashing:** All file passwords hashed with bcrypt
- **No Password Exposure:** Passwords never returned in API responses
- **Server-Side Verification:** Password checks happen only on server
- **Protected File Flag:** Only boolean flag exposed to clients

### 9.2 User Authentication
- **Password Hashing:** User passwords hashed with bcrypt
- **JWT Sessions:** Secure session management
- **Role-Based Access:** Admin-only features protected

### 9.3 Data Privacy
- **No Personal Account Login:** File access doesn't require personal Google account
- **Service Account:** Google Drive uses service account (no user OAuth)
- **Secure Storage:** All sensitive data encrypted in database

---

## 10. Problem Statement (Updated)

### 10.1 Primary Problem

Traditional file sharing and access methods in educational environments pose significant challenges:

1. **Personal Account Exposure:** Students must log into personal Google/Gmail accounts on shared computers
2. **Security Risks:** Forgetting to log out leaves accounts vulnerable
3. **Inconvenience:** Multiple authentication steps slow down workflow
4. **Privacy Concerns:** Personal account activity visible on shared devices
5. **Tool Fragmentation:** Students need multiple websites for different tasks (file storage, QR codes, text tools)

### 10.2 Solution Approach

WINNOVATION addresses these problems by:

1. **Decoupling Identity from Access:** Files accessible via password, not personal login
2. **Single-Station Platform:** All utilities integrated into one platform
3. **Privacy-First Design:** No personal account login required for file access
4. **Security by Default:** Password-protected files with server-side verification
5. **Convenience:** Quick access to files, QR codes, and text tools without leaving platform

### 10.3 Target Use Cases

- **College Lab Computers:** Access files without logging into personal accounts
- **Library Computers:** Quick file retrieval on public machines
- **Cross-Device Transfers:** Share files between devices securely
- **Quick Utilities:** Generate QR codes, manipulate text without external tools
- **Note Management:** Save and organize text snippets with folder support

---

## 11. Future Scope

### 11.1 Enhanced Utility Features
- **File Sharing Links:** Generate shareable links for files
- **File Versioning:** Track file versions and changes
- **Advanced Text Tools:** More text manipulation options
- **Batch Operations:** Bulk file/text operations

### 11.2 Enhanced AI Integration
- AI-powered file organization
- Intelligent text suggestions
- Automated content categorization

### 11.3 Mobile Application
- Native mobile app for better mobile experience
- Offline file access
- Push notifications

### 11.4 Payment Gateway Integration
- Support for paid courses
- Subscription models for premium features

### 11.5 Collaboration Features
- Shared folders for group projects
- Real-time collaboration on text documents
- Team-based file management

---

## 12. Conclusion

WINNOVATION represents a significant innovation in educational technology by combining traditional LMS features with a comprehensive utility suite. The platform's main USP—password-protected file access without personal login—solves real problems faced by students in shared computing environments.

The integrated utility suite (Google Drive, Text Management, QR Code Generator, Text Utilities) creates a "single-station" experience where students can accomplish all their tasks without switching between multiple websites or exposing personal credentials.

The platform is built on modern, scalable technologies and follows best practices for security, privacy, and user experience. It addresses both educational management needs and practical productivity challenges, making it a comprehensive solution for modern academic environments.

---

## Appendix A: Key Files Reference

### Utility Implementation Files:
- `app/googleDrive/page.jsx`: Google Drive interface (1,337 lines)
- `app/api/googleDrive/route.js`: Drive API endpoints
- `app/api/googleDrive/folders/route.js`: Folder management API
- `app/text/page.jsx`: Text management interface
- `app/api/text/route.js`: Text API endpoints
- `app/api/text/folders/route.js`: Text folder API
- `app/qr/page.jsx`: QR code generator
- `app/textUtils/page.jsx`: Text utilities interface
- `lib/cache.ts`: Caching utilities
- `components/drive/PageHeader.jsx`: Drive page header
- `components/drive/SectionCard.jsx`: Section card component

### Core LMS Files:
- `app/dashboard/page.jsx`: Role-based dashboards
- `app/courses/page.jsx`: Course browsing
- `app/api/admin/*`: Admin API endpoints
- `lib/authOptions.js`: Authentication configuration
- `prisma/schema.prisma`: Database schema

---

## Appendix B: Technology Stack Details

### Frontend:
- Next.js 15.0.7 (App Router)
- React 18+
- Tailwind CSS
- Framer Motion (animations)
- React Hot Toast (notifications)
- React QR Code (QR generation)
- Lucide React (icons)

### Backend:
- Next.js API Routes
- Prisma ORM
- MongoDB
- NextAuth.js
- Google APIs (Drive)
- Bcrypt.js (hashing)

### Development Tools:
- TypeScript/JavaScript
- ESLint
- Git version control

---

## Bibliography

- Next.js Documentation: https://nextjs.org/docs
- Prisma Documentation: https://www.prisma.io/docs/
- NextAuth.js Documentation: https://next-auth.js.org/
- Tailwind CSS Documentation: https://tailwindcss.com/docs/
- Google Drive API: https://developers.google.com/drive/api
- React QR Code: https://www.npmjs.com/package/react-qr-code

---

**Document Version:** 2.0  
**Last Updated:** 2024  
**Project:** WINNOVATION - Student Learning Management System  
**Main USP:** Integrated Utility Suite with Password-Protected File Access
