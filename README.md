# 🎓 SarvaLink — Your All-in-One Campus Solution

> A unified, RFID-powered campus management platform that brings attendance tracking, academic records, library management, fee management, events, video conferencing, and an AI assistant under one roof.

<p align="center">
  <em>Smart India Hackathon 2024 Project</em>
</p>

---

## 📖 Overview

**SarvaLink** ("Sarva" = *all* in Sanskrit + "Link") is an end-to-end campus digitization platform designed for colleges and organizations. It connects custom **ESP32 + RFID hardware** installed in classrooms to a set of **Node.js backend services** and a **web portal**, giving students, faculty, and administrators a single connected ecosystem.

A student simply **taps an RFID card** (or types a Key UID on the keypad) and the system automatically:
- Marks **lecture-wise attendance** based on the current time,
- Logs **event attendance** in a dedicated event mode,
- Lets the library desk **issue/return books** against the same card,
- Surfaces the student's **academic, fee, and profile** data in the student panel.

---

## ✨ Key Features

| Module | What it does |
| --- | --- |
| 🪪 **RFID Attendance** | Tap-card or keypad-based attendance captured by ESP32 hardware and pushed to the server in real time. |
| 🕘 **Lecture-wise Reports** | Automatic mapping of taps to lecture slots (9 AM–4:30 PM) with cumulative per-student reports. |
| 🎟️ **Event Mode** | Toggle the device into event mode (`* #`) to record attendance against a specific event number. |
| 📚 **Library Management** | Issue and return books against a student's RFID card with a 14-day loan period and due-date tracking. |
| 💰 **Fee Records** | Year-wise tuition / hostel / transport / VAP fee structure and payment status. |
| 📝 **Academic Records** | Subject-wise theory & practical marks, totals, and percentage. |
| 🧑‍🎓 **Student Panel** | Personal dashboard for fees, library, academics, test portal, events, profile, and AI chat. |
| 🛠️ **Admin Panel** | Add / edit students, register books and events, and view & edit attendance logs. |
| 📹 **ViMeet** | Built-in video conferencing page for online classes / meetings. |
| 🤖 **AI Assistant** | "Chat with AI" entry point in the student panel for help and queries. |

---

## 🏗️ Architecture

```
        ┌──────────────────────────┐
        │   ESP32 + RFID Hardware  │   (hardware_fireware.txt)
        │  RC522 · 4x3 Keypad ·    │
        │  I2C LCD · LEDs · Buzzer │
        └────────────┬─────────────┘
                     │  HTTP POST (uid / key_uid / event)
                     ▼
   ┌─────────────────────────────────────────────┐
   │              Backend (Node.js)               │
   │                                              │
   │  • Attendance server   (port 1264)           │
   │  • Admin server        (port 1254)           │
   │  • Library / RFID SSE  server                │
   │  • Web/student-info API (port 3000)          │
   │  • Fee demo server      (port 3005)          │
   │                                              │
   │            ▼ MySQL (logdb / studentinfo)     │
   └─────────────────────────────────────────────┘
                     │
                     ▼
   ┌─────────────────────────────────────────────┐
   │            Frontend (Website/)               │
   │  Landing page · Login · Student Panel ·      │
   │  Attendance view · ViMeet video conferencing │
   └─────────────────────────────────────────────┘
```

---

## 🧰 Tech Stack

**Hardware / Firmware**
- ESP32 (Arduino / C++), FreeRTOS multitasking
- MFRC522 RFID reader, 4×3 matrix keypad, 16×2 I2C LCD, RGB LEDs, buzzer
- Wi-Fi + NTP time sync (IST, UTC+5:30)

**Backend**
- Node.js + Express
- MySQL (`mysql` / `mysql2` drivers)
- Server-Sent Events (SSE) for live RFID streaming
- `body-parser`, `cors`, `socket.io`, `ejs`

**Frontend**
- HTML5, CSS3, JavaScript
- Bootstrap 5 + Bootstrap Icons, Font Awesome
- AOS (animations), Swiper, GLightbox, PureCounter
- Based on the *Logis* Bootstrap template (BootstrapMade)

---

## 📂 Project Structure

```
sarvalink/
├── hardware_fireware.txt          # ESP32 firmware (RFID + keypad + LCD + WiFi)
├── Website/                       # Frontend web portal
│   ├── index.html                 # Landing / marketing page
│   ├── get-a-quote.html           # Contact / quote form
│   ├── Login/                     # Role-based login (Student / Admin)
│   ├── Student Panel/             # Dashboard, fees, library, academics, profile, AI chat
│   ├── Attendance/                # Attendance table view & search
│   ├── vimeet.html                # Video conferencing (ViMeet)
│   ├── forms/                     # PHP contact / quote handlers
│   └── assets/                    # CSS, JS, images, vendor libraries
└── backend/
    ├── rfid-server/               # Attendance & library services
    │   ├── server1.js             # Attendance logging + reports + events + books (port 1264)
    │   ├── aserver3.js            # Library system with live RFID stream (SSE)
    │   └── admin/
    │       ├── Admin.js           # Admin CRUD for students (port 1254)
    │       └── server2.js         # Fee structure demo (port 3005)
    └── web_server/
        ├── server.js              # Student info REST API (port 3000)
        ├── ATTENDANCE_DB.sql      # Sample schema & seed data
        └── public/                # Static assets
```

---

## 🗄️ Data Model (MySQL)

The backend uses a `logdb` database with these core tables:

- **`students`** — `id, uid (RFID), key_uid, name, rollno, division, branch, mobileno, PNRno, DOB, address, admissionyear, imgpath`
- **`attendance_logs`** — `id, rfid_uid, key_uid, name, timestamp, event`
- **`books`** — `book_number, book_name`
- **`library`** — `rfid_uid, book_number, book_name, due_date` (active loans)
- **`events`** — `event_number, event_name`

A separate `studentinfo` database (see `ATTENDANCE_DB.sql`) holds subject-wise academic marks.

---

## 🔌 Hardware Firmware Highlights

The ESP32 firmware (`hardware_fireware.txt`) runs three concurrent **FreeRTOS tasks**:

1. **RFID Task** — reads card UIDs, debounces duplicate taps (2s window), and posts to both the attendance and admin servers.
2. **Keypad Task** — supports manual UID entry, backspace (`*`), confirm (`#`), and an **event mode** toggle (`* #`) for event attendance.
3. **Wi-Fi Task** — keeps the connection alive, syncs time over NTP, and drives status LEDs (red = connecting, green = connected).

The LCD shows the **current time + scheduled subject** (derived from the hour) and prompts the user to *TAP CARD*.

> ⚠️ **Note:** The firmware contains hard-coded Wi-Fi credentials and server IPs (e.g. `172.25.21.190`). Update these to match your network before flashing.

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v16+)
- [MySQL](https://www.mysql.com/) server
- Arduino IDE (for flashing the ESP32 firmware)

### 1. Set up the database
```sql
CREATE DATABASE logdb;
-- create the students, attendance_logs, books, library, events tables
-- (see Data Model above; ATTENDANCE_DB.sql provides a sample schema)
```

### 2. Run the backend servers
```bash
# Attendance + reports + events + books
cd backend/rfid-server
npm install
node server1.js          # http://localhost:1264

# Admin panel (student CRUD)
cd admin
node Admin.js            # http://localhost:1254/admin

# Library system (live RFID stream)
node aserver3.js         # http://localhost:3000

# Student info API
cd ../../web_server
npm install
node server.js           # http://localhost:3000/students
```

> Update the MySQL `host / user / password / database` values at the top of each server file to match your environment.

### 3. Open the frontend
Open `Website/index.html` in a browser (or serve the `Website/` folder with any static server such as Live Server / `npx serve`).

### 4. Flash the hardware (optional)
Open `hardware_fireware.txt` in the Arduino IDE, install the required libraries (`MFRC522`, `Keypad`, `LiquidCrystal_I2C`, `WiFi`, `HTTPClient`), set your Wi-Fi credentials and server IP, then upload to the ESP32.

---

## 🌐 Key Endpoints

| Server | Endpoint | Purpose |
| --- | --- | --- |
| `server1.js` (1264) | `POST /store_attendance` | Log a tap/keypad attendance entry |
| | `GET /display_attendance` | View & edit attendance logs |
| | `GET /attendance_report` | Cumulative lecture-wise report |
| | `GET /event_attendance` | Per-event attendance report |
| | `GET /add_event`, `/add_book`, `/add_student` | Registration forms |
| `Admin.js` (1254) | `GET /admin` | Look up a student by RFID / Key UID |
| | `POST /admin/insert_student` | Add a new student |
| | `POST /admin/update_student` | Edit student details |
| `aserver3.js` (3000) | `GET /rfid-stream` | Live RFID UID stream (SSE) |
| | `POST /borrow-book`, `/return-book` | Library issue / return |
| `server.js` (3000) | `GET /students`, `PUT /students/:id` | Student academic info API |

---

## 🎯 Use Cases

- **Colleges & universities** — automate daily lecture attendance and reduce proxy attendance.
- **Events & seminars** — quick check-in with event mode.
- **Libraries** — paperless book issue/return tied to student identity.
- **Administration** — a single dashboard for student records, fees, and academics.

---

## 🛣️ Roadmap Ideas

- Unified authentication and session management across panels
- Consolidate the multiple servers behind a single API gateway
- Parameterize hard-coded credentials/IPs via environment variables
- Mobile app for students and faculty
- Analytics dashboards for attendance trends

---

## ⚠️ Security Notice

This is a **hackathon / prototype** codebase. Before any production use:
- Move all DB credentials, Wi-Fi passwords, and server IPs to environment variables / config.
- Add authentication & authorization to admin and API endpoints.
- Use parameterized queries everywhere (most are; verify all) and sanitize all rendered output.

---

## 👥 Credits

- Built for **Smart India Hackathon 2024**.
- Landing page based on the *Logis* template by [BootstrapMade](https://bootstrapmade.com/).

---

<p align="center"><strong>SarvaLink</strong> — One card. One platform. Your entire campus, connected.</p>
```

