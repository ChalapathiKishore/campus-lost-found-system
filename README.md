# 🎒 Campus Lost & Found System

A web-based platform that helps students report lost items and claim found items on campus.  
The system includes **student and admin dashboards** to manage lost and found items efficiently.

---

## 🚀 Live Demo
https://effulgent-donut-d56ae0.netlify.app/

---

## 📌 Features

### 👨‍🎓 Student Features
- Register with **college email**
- Login securely
- Report **lost items**
- Report **found items**
- Upload item images
- Search available items
- Submit claim requests

### 🛠 Admin Features
- View all **claim requests**
- Approve or reject claims
- Mark lost items as **found**
- Search items or users
- Manage campus lost & found system

---

## 🧰 Technologies Used

| Technology | Purpose |
|------------|--------|
HTML | Page structure |
Tailwind CSS | UI styling |
JavaScript | Frontend logic |
Supabase | Backend & database |
Netlify | Hosting & deployment |
GitHub | Version control |



## 📂 Project Structure
campus-lost-found
│

├── index.html

├── register.html

├── dashboard.html

├── admin.html

├── found-items.html

├── report-lost.html

│

├── css

│ └── style.css

│

├── js

│ ├── app.js

│ └── env.js

│

└── README.md



## ⚙️ Setup Instructions

### 1️⃣ Clone Repository
git clone https://github.com/ChalapathiKishore/campus-lost-found-system.git

### 2️⃣ Open Project

Open the project folder in **VS Code**.

### 3️⃣ Configure Supabase

Create file:
js/env.js

Add your Supabase keys:

javascript
window.env = {
SUPABASE_URL: "https://your-project.supabase.co",
SUPABASE_ANON_KEY: "your_anon_key"
}


4️⃣ Run Locally

Use Live Server extension in VS Code.

### 🔐 Security Notes

Only Supabase public anon key is used

Service role keys are not exposed

Registration limited to college email domain

### 👨‍💻 Author

Chalapathi Kishore

ECE Student

G. Pulla Reddy Engineering College
