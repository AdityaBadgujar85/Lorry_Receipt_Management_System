# Lorry Receipt Management System

This project is a full-stack web application designed to simplify the management of Lorry Receipts (LR) in transport and logistics operations. It provides a centralized system to create, track, and manage shipment records efficiently.

The application is built using a React frontend and a Node.js/Express backend, with MongoDB used for data persistence.

---

## Overview

Managing Lorry Receipts manually can be time-consuming and error-prone. This system digitizes the process by allowing users to store shipment data, access records quickly, and generate print-ready LR documents.

---

## Features

* Create and manage Lorry Receipts
* Store sender, receiver, and transport details
* View all shipment records in one place
* Delete or manage existing entries
* Print-friendly LR format
* API-driven architecture

---

## Tech Stack

### Frontend

* React
* Axios for API communication
* Tailwind CSS for styling

### Backend

* Node.js
* Express.js
* MongoDB with Mongoose
* JWT (for authentication, if implemented)

---

## Folder Structure

```id="s1"
root/
├── client/                  # Frontend (React)
│   ├── src/
│   ├── public/
│   └── package.json
│
├── server/                  # Backend (Node.js + Express)
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   └── index.js / server.js
│
├── .env
└── README.md
```

---

## Setup Instructions

### 1. Clone Repository

```id="s2"
git clone https://github.com/your-username/your-repo-name.git
cd your-repo-name
```

---

### 2. Backend Setup

```id="s3"
cd server
npm install
```

Create a `.env` file inside the `server` folder:

```id="s4"
PORT=5000
MONGO_URI=your_mongodb_connection_string
SECRET=your_secret_key
```

Start the backend server:

```id="s5"
npm run dev
```

Backend runs on:

```
http://localhost:5000
```

---

### 3. Frontend Setup

```id="s6"
cd client
npm install
npm start
```

Frontend runs on:

```
http://localhost:3000
```

---

## API Routes

```id="s7"
LR Routes:
POST    /api/lr          Create new LR
GET     /api/lr          Get all LRs
GET     /api/lr/:id      Get single LR
DELETE  /api/lr/:id      Delete LR

User Routes:
POST    /api/user/login
POST    /api/user/signup
```

---

## How It Works

* The frontend sends requests to the backend using Axios
* The backend processes requests and interacts with MongoDB
* Data is returned and rendered dynamically in the UI
* Users can create and manage LRs through a simple interface

---

## Future Scope

* Role-based authentication (Admin / Staff)
* PDF generation for Lorry Receipts
* Search and filter functionality
* Dashboard with analytics and reports
* Deployment on cloud platforms

---

## Notes

This project is intended for learning and practical implementation purposes. It can be extended further based on business requirements.

---
