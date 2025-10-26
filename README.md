# Kithab — Academic Notes Management Platform

**Kithab** is a full-stack (MERN) web platform that streamlines how **students access**, **faculties upload**, and **admins manage** academic notes.  
It provides a clean hierarchical filtering structure — _Regulation → Branch → Semester → Subject_ — ensuring organized storage, quick search, and efficient administration.

---

## Overview

Kithab connects **Students**, **Faculty**, and **Admins** under one structured platform for digital note sharing.  
It focuses on three core workflows:

1. **Students** can search and download notes based on filters.
2. **Faculties** can upload and manage their own notes.
3. **Admins** can control regulations, branches, subjects, faculties, and oversee all uploaded content.

JWT-based authentication ensures secure access, with automatic logout upon token expiry.

---

## Main Pages & Features

### Student Notes Page (Main Front Page)

> The central part of Kithab — used by students.

- **Dynamic Hierarchical Filtering:**  
  Students filter notes step-by-step:
  - Select _Regulation → Branch → Semester → Subject_
  - The next dropdown dynamically loads based on previous selection.
- **Instant Results:**  
  Once filters are selected, all matching notes are displayed in a responsive table or card view.
- **View / Download Notes:**  
  Students can preview note details (title, faculty name, uploaded date) and download the file directly.
- **On-Demand Fetching:**  
  The actual file is fetched only when downloaded (not during list rendering), ensuring fast loading.
- **Clear Filters Button:**  
  Resets all dropdowns to default to start a fresh search.

---

### Faculty Dashboard

> Accessible after faculty login.

- **Upload Notes:**  
  Faculty select _Regulation, Branch, Semester, Subject_, add a title, and upload their note file.
- **My Notes List:**  
  Displays all notes uploaded by that faculty with options to:
  - **Download** (fetches file on-demand)
  - **Delete**
- **Filtered Listing:**  
  Faculty can filter their uploads by subject/semester.
- **JWT Authentication:**  
  Faculty session expires automatically after token validity ends — ensuring secure access.

---

### Admin Dashboard

> Accessible only to Admin role; divided into three major sections.

#### Meta Manager (Regulations / Branches / Subjects)

- **Manage Hierarchy:**  
  Admin can create, edit, or delete:
  - Regulations
  - Branches (linked to Regulations)
  - Subjects (linked to Branch + Semester)
- **Cascading Deletions (Transaction-based):**
  - Deleting a _Regulation_ removes all its _Branches, Subjects,_ and _Notes_.
  - Deleting a _Branch_ removes its _Subjects_ and _Notes_.
  - Deletion is handled inside a MongoDB transaction — ensuring atomic consistency (either all delete or none if an error occurs).
- **UI Features:**  
  Each section has:
  - Add/Edit modals
  - Confirmation before delete
  - Timestamps for tracking creation/updates

#### Notes Manager (Admin View)

- **View All Notes:**  
  Displays every note uploaded by all faculties.
- **Filter Controls:**  
  Admin must select all filters (_Regulation → Branch → Semester → Subject_) before the **Get Notes** button is enabled.
- **Clear Filters Button:**  
  Instantly resets all filter selections.
- **Download / Delete:**  
  Admin can download or permanently delete any uploaded note.
- **Faculty Info Popups:**  
  Clicking “Uploaded by” shows details about the faculty who uploaded that note.

#### Faculty Manager

- **Monitor & Manage Faculty Accounts:**  
  Admin can view all registered faculty accounts in a table view with details like name, email, branch, and subjects handled.
- **Add Faculty:**  
  Provides a form to create a new faculty account with credentials and role assignment.
- **Edit Faculty Info:**  
  Allows admin to update faculty details such as name, email, or associated branch.
- **Delete Faculty:**  
  Removes faculty accounts that are inactive or no longer associated.
- **Search & Filter Options:**  
  Admin can quickly search faculties by name, branch, or email for efficient management.

---

## Authentication System

- **JWT-Based Authentication:**
  - Both Faculty and Admin logins return JWT tokens.
  - Tokens are stored securely in frontend context (not in localStorage for safety).
  - Tokens auto-expire, and the user is automatically logged out upon expiry.
- **Role-Based Routing:**
  - Admins and Faculties see separate dashboards after login.
  - Students don’t need authentication for searching and downloading public notes.

---

## Tech Stack

**Frontend:** React, React Router, Context API, Axios  
**Backend:** Node.js, Express.js, Mongoose (MongoDB)  
**Database:** MongoDB  
**Authentication:** JWT (JSON Web Tokens)  
**File Handling:** Binary file upload using MongoDB Buffer storage

---

## Data Model Overview

**Core Collections:**

- Regulation
- Branch (linked to Regulation)
- Subject (linked to Branch + Semester)
- Note (linked to Regulation, Branch, Subject, Faculty)
- Faculty (for authentication)

Relationships are designed to ensure structured access and safe cascading deletions.

---

## Smart Backend Logic

- **Transactional Deletions:**  
  When Admin deletes a regulation/branch, all linked data is deleted atomically using MongoDB transactions.
- **Optimized File Fetch:**  
  Notes’ actual binary data is excluded from initial queries and only fetched when the user clicks download.
- **Error Handling:**  
  All backend routes use structured try/catch blocks with meaningful responses.

---

## Repositories

- **Frontend:** [Kithab (Client)](https://github.com/ArunAllanki/Kithab)
- **Backend:** [Kithab Backend (Server)](https://github.com/ArunAllanki/KithabBackend)

---

## Summary

Kithab is a modern, scalable solution for managing and sharing academic notes — blending structured hierarchy, secure authentication, and user-friendly filtering.  
It allows seamless collaboration between faculty, students, and administrators — ensuring that learning materials are always accessible, organized, and well-maintained.
