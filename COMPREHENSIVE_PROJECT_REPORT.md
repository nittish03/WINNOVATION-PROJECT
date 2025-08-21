# Comprehensive Project Report

## 1. Introduction

This document provides a comprehensive analysis of the WINNOVATION-PROJECT, a web-based learning management system. The analysis covers the project's architecture, technologies used, database schema, and data flow.

## 2. Technologies Used

The project is built on a modern web development stack:

- **Framework:** Next.js (a React framework)
- **Database:** MongoDB with Prisma as the Object-Relational Mapper (ORM).
- **Authentication:** NextAuth.js with a Prisma adapter for session management and user authentication.
- **Styling:** Tailwind CSS for a utility-first CSS framework.
- **API:** The application uses Next.js API routes for the backend.
- **Other notable libraries:**
    - `axios` for making HTTP requests from the client-side.
    - `bcryptjs` for hashing user passwords.
    - `nodemailer` for sending emails (e.g., for verification).
    - Various UI component libraries like `@radix-ui/react-dialog` and `lucide-react`.

## 3. Database Schema

The database schema is defined in the `prisma/schema.prisma` file. It uses MongoDB as the database provider. The main models are:

- **`User`**: Stores user information, including name, email, password, role (student, admin, instructor), and relationships to other models.
- **`Course`**: Represents a course with a title, description, and a creator. It has relationships with `Skill`, `Enrollment`, `Assignment`, etc.
- **`Skill`**: Defines skills that can be associated with courses and users.
- **`Enrollment`**: Tracks a user's enrollment in a course, including their progress.
- **`Assignment`**: Represents an assignment within a course, with a due date and maximum points.
- **`Submission`**: Stores a user's submission for an assignment.
- **`Grade`**: Records the grade for a user's submission.
- **Authentication Models**: `Account`, `Session`, and `VerificationToken` are used by NextAuth.js for authentication.
- **Discussion Models**: `DiscussionThread` and `DiscussionReply` for course-specific discussions.

## 4. Data Flow

The application follows a typical client-server architecture, with the Next.js framework handling both the frontend and backend.

### Example: Course Data Flow

1.  **Backend API (`app/api/courses/route.js`):**
    -   A `GET` request to `/api/courses` fetches all published courses from the MongoDB database using Prisma. It also retrieves related data, such as the course creator's name and the associated skill.
    -   A `POST` request to `/api/courses` allows authenticated admins and instructors to create a new course. The request is handled by the server, which validates the user's role and then creates a new course in the database.

2.  **Frontend (`app/courses/page.jsx`):**
    -   The `CoursesPage` component is a client-side React component.
    -   When the component mounts, it uses the `useEffect` hook to send a `GET` request to `/api/courses` using `axios`.
    -   The fetched course data is stored in the component's state and rendered as a list of courses.
    -   For students, there is an "Enroll" button for each course. Clicking this button triggers a `POST` request to `/api/enrollments` to enroll the student in the course.
    -   For admins and instructors, there is a "Create Course" button that opens a form. Submitting the form sends a `POST` request to `/api/courses` to create a new course.


The application's authentication is handled by `NextAuth.js`, providing a secure and flexible system for managing user sessions.

1.  **Login Page (`app/login/page.tsx`):** Users are presented with a form to sign in using their email and password, or with a button to sign in with Google.
2.  **NextAuth.js Configuration (`lib/authOptions.js`):** This file configures the authentication providers:
    *   **Credentials Provider:** When a user signs in with their email and password, the `authorize` function is called. It retrieves the user from the database, compares the provided password with the hashed password using `bcrypt`, and returns the user object if the credentials are valid.
    *   **Google Provider:** For Google sign-in, NextAuth.js handles the OAuth 2.0 flow, exchanging an authorization code for an access token and user profile information.
3.  **Session Management:** The application uses JSON Web Tokens (JWTs) for session management. The `session` callback in `authOptions.js` is used to include additional user information (like the user's role) in the session object.

### 3.2 Student Dashboard

The student dashboard provides a personalized overview of the student's learning journey.

1.  **Frontend (`app/dashboard/page.jsx`):** When a student logs in, they are redirected to the dashboard. The page checks the user's role from the session object and renders the student view. It then makes a GET request to `/api/student/dashboard` to fetch the dashboard data.
2.  **Backend (`app/api/student/dashboard/route.js`):** This API endpoint retrieves the logged-in user's ID from the session, queries the database for their enrollments, skills, and certificates, and calculates statistics like the number of enrolled and completed courses. It then returns this data to the frontend.

### 3.3 Admin Dashboard

The admin dashboard provides a comprehensive overview of the platform's activity and provides access to management tools.

1.  **Frontend (`app/dashboard/page.jsx`):** If the logged-in user has the "admin" role, the dashboard page renders the admin view and makes a GET request to `/api/admin/dashboard`.
2.  **Backend (`app/api/admin/dashboard/route.js`):** This endpoint aggregates data from the entire platform, including total user counts, course statistics, and recent activity. It returns a detailed set of statistics and recent data to the admin dashboard.

### 3.4 Course Browsing and Enrollment

Students can browse a list of available courses and enroll in them with a single click.

1.  **Courses Page (`app/courses/page.jsx`):** This page fetches and displays a list of all courses from the `/api/courses` endpoint. For students, it also fetches their current enrollments from `/api/enrollments` to determine which courses they are already enrolled in.
2.  **Enrollment Action:** When a student clicks the "Enroll" button for a course, the page sends a POST request to `/api/enrollments` with the `courseId`.
3.  **Backend (`app/api/enrollments/route.js`):** The `POST` handler in this route creates a new `Enrollment` record in the database, linking the logged-in user to the selected course.

### 3.5 User Management (Admin)

Administrators have full CRUD (Create, Read, Update, Delete) functionality for managing users.

1.  **User Management Page (`app/admin/users/page.jsx`):** This page provides a table of all users, with options to search, filter, edit, and delete. It also includes a form for creating new users.
2.  **Backend API (`app/api/admin/users`):**
    *   **`GET /api/admin/users`:** Retrieves a list of all users.
    *   **`POST /api/admin/users`:** Creates a new user.
    *   **`PUT /api/admin/users/[id]`:** Updates an existing user's information.
    *   **`DELETE /api/admin/users/[id]`:** Deletes a user from the database.

### 3.6 Course Management (Admin)

Administrators have comprehensive control over the platform's courses.

1.  **Course Management Page (`app/admin/courses/page.jsx`):** This page provides a detailed view of all courses, with tools for searching, filtering, and sorting. Administrators can create new courses, edit existing ones, and delete courses. They can also publish or unpublish courses, controlling their visibility to students.
2.  **Backend API (`app/api/admin/courses`):**
    *   **`GET /api/admin/courses`:** Retrieves a list of all courses.
    *   **`POST /api/admin/courses`:** Creates a new course.
    *   **`PUT /api/admin/courses/[id]`:** Updates a course's details.
    *   **`PATCH /api/admin/courses/[id]`:** Toggles the published status of a course.
    *   **`DELETE /api/admin/courses/[id]`:** Deletes a course.

## Chapter 4: Future Scope

*   **Enhanced AI Integration:** The existing integration with Google's Generative AI and Document AI can be expanded to provide features like AI-powered grading, personalized learning paths, and intelligent content recommendations.
*   **Mobile Application:** A dedicated mobile application could be developed to provide a more accessible learning experience.
*   **Payment Gateway Integration:** To support paid courses, a payment gateway like Stripe or PayPal could be integrated.

# AI-Optimized Documentation: Online Learning Platform

## Project Summary

- **Project Name:** Online Learning Platform
- **Description:** A full-stack web application for online education, featuring course management, user authentication, and role-based access control.
- **Technology Stack:** Next.js, Prisma, MongoDB, NextAuth.js, Tailwind CSS.

## Core Features

### User Authentication
- **Providers:** Credentials (email/password), Google OAuth.
- **Session Management:** JWT-based sessions.
- **Database Adapter:** Prisma adapter for MongoDB.
- **Key Files:**
  - `app/login/page.tsx`: Frontend login component.
  - `lib/authOptions.js`: NextAuth.js configuration.
  - `prisma/schema.prisma`: User, Account, and Session models.

### Course Management
- **Functionality:** Create, read, update, and delete courses.
- **Roles:** Restricted to "admin" users.
- **API Endpoints:**
  - `POST /api/admin/courses`: Create a new course.
  - `GET /api/admin/courses`: Retrieve all courses.
  - `GET /api/admin/courses/[id]`: Retrieve a single course.
  - `PUT /api/admin/courses/[id]`: Update a course.
  - `DELETE /api/admin/courses/[id]`: Delete a course.

### Enrollment
- **Functionality:** Students can enroll in courses.
- **API Endpoints:**
  - `POST /api/courses/[id]/enrollment`: Enroll in a course.
  - `GET /api/enrollments`: Get all enrollments for the current user.

### Assignments and Submissions
- **Functionality:** Admins can create assignments; students can submit their work.
- **API Endpoints:**
  - `POST /api/admin/assignments`: Create a new assignment.
  - `POST /api/assignments/[id]/submission`: Submit a solution.

## Database Schema (`prisma/schema.prisma`)

- **User:** Stores user data, including `role` ("student" or "admin").
- **Course:** Defines the structure of a course.
- **Enrollment:** Links users to courses.
- **Assignment:** Contains details about assignments.
- **Submission:** Stores student submissions.
- **Grade:** Holds grading information for submissions.
- **Skill:** Represents skills that can be learned.
- **UserSkill:** Maps skills to users.

## Getting Started

1.  **Install Dependencies:** `npm install`
2.  **Set up Environment Variables:** Create a `.env` file and provide the necessary database and auth credentials.
3.  **Run Migrations:** `npx prisma db push`
4.  **Start the Development Server:** `npm run dev`

# Web Application Documentation

This document provides a detailed explanation of the web application's architecture, features, and functionality.

## 1. Project Overview

This is a full-stack web application built with Next.js. Based on the file structure and dependencies, it appears to be an online learning platform with features for students and administrators. Key functionalities include user authentication, course enrollment, assignment submission, grading, and discussion forums. The application also integrates with Google's Generative AI and Document AI, suggesting advanced features like automated document processing or AI-powered assistance.

## 2. Technologies Used

*   **Framework:** Next.js
*   **Database ORM:** Prisma
*   **Database:** MongoDB
*   **Authentication:** NextAuth.js
*   **Styling:** Tailwind CSS
*   **UI Components:** Radix UI, lucide-react
*   **File Handling:** Cloudinary, Vercel Blob, Multer
*   **API & Backend:** Next.js API routes, next-connect
*   **Email:** Nodemailer
*   **AI:** Google Generative AI, Google Document AI

## 3. Database Schema

The database schema is defined in `prisma/schema.prisma` and includes the following models:

*   **User:** Stores user information, including roles (student, admin).
*   **Course:** Represents a course with a title, description, and associated skill.
*   **Enrollment:** Manages user enrollment in courses.
*   **Assignment:** Defines assignments for courses.
*   **Submission:** Stores user submissions for assignments.
*   **Grade:** Records grades for submissions.
*   **Skill:** Represents skills that can be associated with courses and users.
*   **UserSkill:** Tracks the skills acquired by users.
*   **Certificate:** Stores information about certificates issued to users.
*   **DiscussionThread & DiscussionReply:** Power the discussion forums.
*   **Account, Session, VerificationToken:** Used by NextAuth.js for authentication.
*   **NonVerifiedUser:** Temporarily stores user information during the email verification process.

## 4. API Routes

The application's API is built with Next.js API routes and is organized into the following directories:

*   `/api/admin`: Endpoints for administrative tasks, such as managing users, courses, and skills.
*   `/api/assignments`: Endpoints for managing assignments and submissions.
*   `/api/auth`: Handles user authentication, including registration, login, and OTP verification.
*   `/api/courses`: Endpoints for managing courses, enrollments, and discussions.
*   `/api/discussions`: Manages discussion threads and replies.
*   `/api/enrollments`: Handles course enrollments.
*   `/api/profile`: Manages user profiles.
*   `/api/skills`: Endpoints for managing skills.
*   `/api/student`: Endpoints for student-specific data, such as the dashboard.
*   `/api/user-skills`: Manages the skills associated with users.

## 5. Frontend Structure

The frontend is built with React and Next.js and is organized as follows:

*   `/app`: Contains the main application pages, following the Next.js App Router structure.
*   `/components`: Reusable UI components used throughout the application.
*   `/context`: React context providers for state management.
*   `/lib`: Utility functions and libraries.
*   `/styles`: Global styles and Tailwind CSS configuration.

The application has a clear separation of concerns, with distinct pages for different features and a well-organized component library.

# Summer Training Report

## On

# An Online Learning Platform

### submitted in partial fulfilment of the requirement for the award of the Degree of

## Bachelor of Technology

### in

## Information Technology

**Submitted By:**
(Your Name)

**Under the Supervision of:**
(Your Supervisor's Name)

(Your Enrollment No.)

---

# DECLARATION

This is to certify that the Report entitled “An Online Learning Platform” submitted in partial fulfillment of the requirement for the award of the degree Bachelor of Technology in Information Technology comprises only my original work and due acknowledgement has been made in the text to all other material used.

**Date:** (Current Date)

**Name:** (Your Name)
**Enrollment No.:** (Your Enrollment No.)
**Signature:** \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

---

# ACKNOWLEDGEMENT

I take this opportunity to express my sincere gratitude to all those who have guided and supported me in the successful completion of this project. This project has been a valuable learning experience, enabling me to gain practical knowledge of full-stack web development and its application in creating a professional online learning platform.

The primary aim of this platform is to create an interactive and user-friendly environment that bridges the gap between students and administrators, providing a seamless and efficient educational experience.

---

# (CERTIFICATE SECTIONS - PLACEHOLDERS)

---

# TABLE OF CONTENTS

*   **Chapter 1: Introduction**
    *   1.1 Overview
    *   1.2 Aim
    *   1.3 Proposed System
    *   1.4 Feasibility System
*   **Chapter 2: Problem Statement**
    *   2.1 Problem Statement
    *   2.2 Objectives
*   **Chapter 3: System Analysis and Design**
    *   3.1 Requirement Specifications
    *   3.2 Software Development Lifecycle Model
    *   3.3 Flowchart Diagram
*   **Chapter 4: Skills Acquired**
    *   4.1 Skills Gained
*   **Chapter 5: Project Undertaken (Working of the Application)**
    *   5.1 Title and Aim of the Project
    *   5.2 Tools Applied
    *   5.3 Techniques Applied
    *   5.4 Results and Analysis (Detailed Functional Walkthrough)
*   **Chapter 6: Challenges Faced During Development**
*   **Chapter 7: Solution Adopted**
*   **Chapter 8: Future Scope of the Job Portal**
*   **Chapter 9: Observation and Learning Outcomes**
*   **Chapter 10: Summary, Conclusion and Suggestions**
*   **BIBLIOGRAPHY**

---

# ABSTRACT

This project is a full-stack web application designed as a comprehensive online learning platform. In an era where digital education is paramount, this platform provides a centralized, efficient, and user-friendly solution for students and administrators. The application is built using a modern technology stack, including Next.js for the frontend and backend, Prisma for the ORM, and MongoDB as the database.

The platform supports essential features such as role-based access control (students and administrators), secure user authentication, course creation and enrollment, assignment management, and skill tracking. The system is designed to be scalable, secure, and intuitive, addressing the common challenges of online education by providing a structured and engaging learning environment.

---

# CHAPTER 1: INTRODUCTION

### 1.1 Overview

This project is an online learning platform designed to connect students and administrators in a seamless digital educational environment. Developed using Next.js, Prisma, and MongoDB, it provides a robust set of features for managing the entire learning lifecycle, from course creation to student enrollment and progress tracking.

### 1.2 Aim

The primary aim of this project is to develop a user-friendly and scalable online learning platform that efficiently serves the needs of both students and administrators. The project focuses on creating an interactive and secure application that simplifies the management of educational content and user data.

### 1.3 Proposed System

The proposed system is a feature-rich online learning platform that includes:
*   **User Authentication:** Secure user registration and login with support for both credentials (email/password) and Google OAuth.
*   **Role-Based Access Control:** Distinct roles for students and administrators, with corresponding permissions and dashboards.
*   **Course Management:** Functionality for administrators to create, update, and manage courses.
*   **Enrollment System:** Students can enroll in courses and track their progress.
*   **Assignment & Grading:** Instructors can create assignments, and students can submit their work for grading.
*   **Skill Tracking:** The platform allows for the tracking of skills associated with courses and users.
*   **Discussion Forums:** A dedicated space for students to engage in discussions and collaborate.

### 1.4 Feasibility System

The system is technically feasible as it is built on a modern, well-supported technology stack (Next.js, Prisma, MongoDB). It is operationally feasible due to its intuitive user interface, which requires minimal training for both students and administrators.

---

# CHAPTER 2: PROBLEM STATEMENT

### 2.1 Problem Statement

Traditional educational models often lack the flexibility and accessibility required in the modern world. There is a growing need for a centralized online platform where educational institutions can manage their courses, and students can access learning materials and track their progress in a structured manner. This project addresses the need for an integrated system that combines content management, user management, and learning analytics in a single, easy-to-use application.

### 2.2 Objectives

*   To create a secure and scalable platform for online learning.
*   To provide distinct, role-based interfaces for students and administrators.
*   To implement a comprehensive set of features for managing courses, enrollments, assignments, and skills.
*   To design an intuitive and responsive user interface that works across all devices.

---

# CHAPTER 3: SYSTEM ANALYSIS AND DESIGN

### 3.1 Requirement Specifications

*   **Hardware Requirements:** A standard web server for hosting the Next.js application and a database server for MongoDB.
*   **Software Requirements:** Node.js, npm/yarn, a modern web browser, and a code editor like VS Code.

### 3.2 Software Development Lifecycle Model

The project follows an Agile development methodology, allowing for iterative development and continuous feedback. This approach is well-suited for a web application of this nature, as it allows for flexibility in adapting to new requirements and features.

### 3.3 Flowchart Diagram

The application's workflow is as follows:
1.  **User Authentication:** A user visits the site and is prompted to log in or sign up. They can use their email/password or Google account.
2.  **Role-Based Redirection:** Upon successful login, the user is redirected to their respective dashboard based on their role (student or admin).
3.  **Student Flow:** Students can browse courses, enroll, view their enrolled courses and assignments, and participate in discussions.
4.  **Admin Flow:** Administrators can manage users, create and manage courses, create assignments, and view platform-wide analytics.

---

# CHAPTER 5: PROJECT UNDERTAKEN (WORKING OF THE APPLICATION)

### 5.1 Title and Aim of the Project

*   **Title:** An Online Learning Platform
*   **Aim:** To create a comprehensive and user-friendly platform for online education.

### 5.2 Tools Applied

*   **Frontend:** Next.js, React, Tailwind CSS
*   **Backend:** Next.js API Routes
*   **Database:** MongoDB
*   **ORM:** Prisma
*   **Authentication:** NextAuth.js

### 5.3 Techniques Applied

*   **Full-Stack Development:** The application is built as a monolithic full-stack application using Next.js.
*   **RESTful API Design:** The backend exposes a set of RESTful API endpoints for the frontend to consume.
*   **Component-Based Architecture:** The frontend is built using a component-based architecture with React.
*   **Responsive Design:** The UI is fully responsive and works on all screen sizes, thanks to Tailwind CSS.

### 5.4 Results and Analysis (Detailed Functional Walkthrough)

#### 5.4.1 User Authentication

The application's authentication is handled by `NextAuth.js`, providing a secure and flexible system for managing user sessions.
1.  **Login Page (`app/login/page.tsx`):** Users can sign in with their email and password or with Google.
2.  **NextAuth.js Configuration (`lib/authOptions.js`):** This file configures the authentication providers and callbacks. The `Credentials Provider` validates email/password logins against the database, while the `Google Provider` handles the OAuth flow.
3.  **Session Management:** The application uses JWTs for sessions, and the `session` callback enriches the session object with user data like their role.

#### 5.4.2 Student Dashboard

The student dashboard provides a personalized overview of the student's learning journey.
1.  **Frontend (`app/dashboard/page.jsx`):** When a student logs in, this page renders the student view and makes a GET request to `/api/student/dashboard`.
2.  **Backend (`app/api/student/dashboard/route.js`):** This API endpoint retrieves the logged-in user's enrollments, skills, and certificates, calculates statistics, and returns the data to the frontend.

#### 5.4.3 Admin Dashboard

The admin dashboard provides a comprehensive overview of the platform's activity.
1.  **Frontend (`app/dashboard/page.jsx`):** If the user is an admin, this page renders the admin view and makes a GET request to `/api/admin/dashboard`.
2.  **Backend (`app/api/admin/dashboard/route.js`):** This endpoint aggregates platform-wide data, including user counts, course statistics, and recent activity.

#### 5.4.4 Course Browsing and Enrollment

Students can browse and enroll in courses.
1.  **Courses Page (`app/courses/page.jsx`):** This page displays all available courses. For students, it also indicates which courses they are already enrolled in.
2.  **Enrollment Action:** When a student clicks "Enroll," a POST request is sent to `/api/enrollments` with the `courseId`.
3.  **Backend (`app/api/enrollments/route.js`):** The `POST` handler creates a new `Enrollment` record, linking the user to the course.

#### 5.4.5 User Management (Admin)

Administrators have full CRUD functionality for managing users.
1.  **User Management Page (`app/admin/users/page.jsx`):** This page provides a table of all users, with options to search, filter, edit, and delete.
2.  **Backend API (`app/api/admin/users`):** The API provides endpoints for `GET` (all users), `POST` (create user), `PUT` (update user), and `DELETE` (delete user).

#### 5.4.6 Course Management (Admin)

Administrators have comprehensive control over the platform's courses.
1.  **Course Management Page (`app/admin/courses/page.jsx`):** This page allows admins to create, edit, delete, and publish/unpublish courses.
2.  **Backend API (`app/api/admin/courses`):** The API provides endpoints for `GET` (all courses), `POST` (create course), `PUT` (update course), `PATCH` (toggle publish status), and `DELETE` (delete course).

---

# CHAPTER 8: FUTURE SCOPE

*   **Enhanced AI Integration:** Expand the use of AI for features like automated grading and personalized learning paths.
*   **Mobile Application:** Develop a dedicated mobile app for a better mobile user experience.
*   **Payment Gateway Integration:** Integrate a payment gateway to support paid courses.

---

# BIBLIOGRAPHY

*   Next.js Documentation: https://nextjs.org/docs
*   Prisma Documentation: https://www.prisma.io/docs/
*   NextAuth.js Documentation: https://next-auth.js.org/
*   Tailwind CSS Documentation: https://tailwindcss.com/docs/

# Project Report: Online Learning Platform

## Chapter 1: Introduction

### 1.1 Overview

This document provides a comprehensive analysis of a full-stack web application designed as an online learning platform. The platform connects students and administrators, offering a rich feature set for managing courses, assignments, and user skills. The application is built with a modern technology stack, including Next.js for the frontend and backend, Prisma as the ORM, and MongoDB for the database.

### 1.2 Aim

The primary aim of this project is to create a robust, scalable, and user-friendly online learning environment. The platform is designed to facilitate a seamless educational experience by providing intuitive tools for both content delivery and administration.

### 1.3 Proposed System

The proposed system is a feature-rich online learning platform that includes:

*   **User Authentication:** Secure user registration and login with support for both credentials (email/password) and Google OAuth.
*   **Role-Based Access Control:** Distinct roles for students and administrators, with corresponding permissions and dashboards.
*   **Course Management:** Functionality for administrators to create, update, and manage courses.
*   **Enrollment System:** Students can enroll in courses and track their progress.
*   **Assignment & Grading:** Instructors can create assignments, and students can submit their work for grading.
*   **Skill Tracking:** The platform allows for the tracking of skills associated with courses and users.
*   **Discussion Forums:** A dedicated space for students to engage in discussions and collaborate.

## Chapter 2: System Analysis and Design

### 2.1 Requirement Specifications

#### 2.1.1 Functional Requirements

*   **User Registration and Login:** Users can create an account using their email and password or by linking their Google account.
*   **User Roles:** The system supports two main roles: "student" and "admin".
*   **Admin Dashboard:** Administrators have access to a dashboard for managing users, courses, skills, and enrollments.
*   **Course Creation:** Admins can create new courses, specifying the title, description, and associated skill.
*   **Course Enrollment:** Students can browse and enroll in available courses.
*   **Assignment Management:** Admins can create and manage assignments for each course.
*   **Submission System:** Students can submit their solutions for assignments.
*   **Grading:** Admins can grade submissions and provide feedback.

#### 2.1.2 Non-Functional Requirements

*   **Security:** The application uses `bcrypt` for password hashing and `NextAuth.js` for secure session management.
*   **Scalability:** The use of Next.js and a modular architecture allows for future expansion.
*   **Usability:** The user interface is designed to be intuitive and easy to navigate, with a responsive layout for various devices.

### 2.2 System Design

The application follows a client-server architecture, with a Next.js frontend interacting with a Next.js API backend. The database is managed by Prisma, which provides a type-safe API for database operations.

## Chapter 3: Implementation

### 3.1 Technology Stack

*   **Frontend:** Next.js, React, Tailwind CSS
*   **Backend:** Next.js API Routes
*   **Database:** MongoDB
*   **ORM:** Prisma
*   **Authentication:** NextAuth.js
*   **File Uploads:** Cloudinary, Vercel Blob, Multer

### 3.2 Key Features and Implementation

#### 3.2.1 User Authentication

The authentication system is built using `NextAuth.js`. It supports two providers:

1.  **Credentials Provider:** For email and password authentication. Passwords are encrypted using `bcryptjs`.
2.  **Google Provider:** For OAuth 2.0 authentication with Google.

The user session is managed using JSON Web Tokens (JWTs), and the session data is enriched with user details from the database on each request.

#### 3.2.2 Course and Enrollment Management

The backend provides a set of RESTful API endpoints for managing courses and enrollments. These endpoints are protected, and only users with the "admin" role can create or modify courses. Students can enroll in courses through a dedicated endpoint, which creates an `Enrollment` record in the database.

## Chapter 4: Future Scope

*   **Enhanced AI Integration:** The existing integration with Google's Generative AI and Document AI can be expanded to provide features like AI-powered grading, personalized learning paths, and intelligent content recommendations.
*   **Mobile Application:** A dedicated mobile application could be developed to provide a more accessible learning experience.
*   **Payment Gateway Integration:** To support paid courses, a payment gateway like Stripe or PayPal could be integrated.

