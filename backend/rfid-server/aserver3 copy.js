const express = require("express");
const mysql = require("mysql2");
const bodyParser = require("body-parser");

const app = express();
app.use(bodyParser.json());

const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "pass123", // Replace with your DB password
    database: "logdb",  // Change to your actual database name
});

// Connect to MySQL
db.connect((err) => {
    if (err) {
        console.error("Database connection failed:", err);
    } else {
        console.log("Connected to MySQL Database");
    }
});

// Serve the Frontend
app.get("/", (req, res) => {
    res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Library Management</title>
        <style>
            body {
                font-family: 'Arial', sans-serif;
                background-color: #f0f2f5;
                text-align: center;
                padding: 40px;
                margin: 0;
            }
            .container {
                background: white;
                padding: 30px;
                border-radius: 12px;
                width: 450px;
                margin: 50px auto;
                box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);
            }
            h2 {
                margin-bottom: 20px;
                color: #333;
            }
            input {
                width: calc(100% - 20px);
                padding: 12px;
                margin: 10px 0;
                border: 2px solid #ccc;
                border-radius: 8px;
                font-size: 16px;
            }
            button {
                width: 100%;
                padding: 14px;
                margin: 10px 0;
                border: none;
                border-radius: 8px;
                font-size: 18px;
                font-weight: bold;
                background-color: #007BFF;
                color: white;
                cursor: pointer;
                transition: 0.3s;
            }
            button:hover {
                background-color: #0056b3;
                transform: scale(1.02);
            }
            p {
                font-size: 16px;
                color: #444;
                margin: 10px 0;
                font-weight: 500;
            }
            table {
                width: 100%;
                margin-top: 15px;
                border-collapse: collapse;
            }
            th, td {
                border: 1px solid #ddd;
                padding: 10px;
                text-align: center;
            }
            th {
                background-color: #007BFF;
                color: white;
            }
            .table-container {
                margin-top: 15px;
                overflow-x: auto;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <h2>Library System</h2>
            <input type="text" id="rfid_uid" placeholder="Enter RFID UID">
            <button onclick="fetchStudent()">Get Student</button>
            <p id="studentInfo"></p>

            <div class="table-container">
                <table id="borrowedBooksTable" style="display: none;">
                    <thead>
                        <tr>
                            <th>Book Name</th>
                            <th>Book Number</th>
                            <th>Due Date</th>
                        </tr>
                    </thead>
                    <tbody id="borrowedBooksBody"></tbody>
                </table>
            </div>

            <input type="text" id="book_number" placeholder="Enter Book Number">
            <button onclick="fetchBook()">Get Book</button>
            <p id="bookInfo"></p>

            <button onclick="borrowBook()">Borrow Book</button>
            <button onclick="returnBook()">Return Book</button>
            <p id="status"></p>
        </div>

        <script>
            async function fetchStudent() {
                const rfid_uid = document.getElementById("rfid_uid").value;
                const response = await fetch("/get-student", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ rfid_uid })
                });
                const data = await response.json();
                
                if (data.name) {
                    document.getElementById("studentInfo").innerText = \`Name: \${data.name}, Roll No: \${data.rollno}, Branch: \${data.branch}\`;
                } else {
                    document.getElementById("studentInfo").innerText = "Student not found";
                    document.getElementById("borrowedBooksTable").style.display = "none";
                    return;
                }

                if (data.borrowed_books && Array.isArray(data.borrowed_books) && data.borrowed_books.length > 0) {
                    const tableBody = document.getElementById("borrowedBooksBody");
                    tableBody.innerHTML = ""; 
                    
                    data.borrowed_books.forEach(book => {
                        const row = \`
                            <tr>
                                <td>\${book.book_name}</td>
                                <td>\${book.book_number}</td>
                                <td>\${new Date(book.due_date).toDateString()}</td>
                            </tr>
                        \`;
                        tableBody.innerHTML += row;
                    });

                    document.getElementById("borrowedBooksTable").style.display = "table";
                } else {
                    document.getElementById("borrowedBooksTable").style.display = "none";
                }
            }

            async function fetchBook() {
                const book_number = document.getElementById("book_number").value;
                const response = await fetch("/get-book", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ book_number })
                });
                const data = await response.json();
                document.getElementById("bookInfo").innerText = data.book_name ? 
                    "Book: " + data.book_name : "Book not found";
            }

            async function borrowBook() {
                const rfid_uid = document.getElementById("rfid_uid").value;
                const book_number = document.getElementById("book_number").value;
                const response = await fetch("/borrow-book", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ rfid_uid, book_number })
                });
                const data = await response.json();
                document.getElementById("status").innerText = data.message || data.error;
                fetchStudent(); // Refresh borrowed books
            }

            async function returnBook() {
                const rfid_uid = document.getElementById("rfid_uid").value;
                const book_number = document.getElementById("book_number").value;
                const response = await fetch("/return-book", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ rfid_uid, book_number })
                });
                const data = await response.json();
                document.getElementById("status").innerText = data.message || data.error;
                fetchStudent(); // Refresh borrowed books
            }
        </script>
    </body>
    </html>
    `);
});


// Fetch Student Details and Borrowed Books
app.post("/get-student", (req, res) => {
    const { rfid_uid } = req.body;
    const studentQuery = "SELECT name, rollno, branch FROM students WHERE uid = ?";
    const booksQuery = "SELECT book_number, book_name, due_date FROM library WHERE rfid_uid = ?";

    db.query(studentQuery, [rfid_uid], (err, studentResult) => {
        if (err) return res.status(500).json({ error: "Database error" });

        if (studentResult.length === 0) return res.json({ error: "Student not found" });

        db.query(booksQuery, [rfid_uid], (err, booksResult) => {
            if (err) return res.status(500).json({ error: "Database error" });

            res.json({
                ...studentResult[0],
                borrowed_books: booksResult.length > 0 ? booksResult : "No books borrowed"
            });
        });
    });
});

// Fetch Book Details
app.post("/get-book", (req, res) => {
    const { book_number } = req.body;
    db.query("SELECT book_name FROM books WHERE book_number = ?", [book_number], (err, result) => {
        if (err) res.status(500).json({ error: "Database error" });
        else res.json(result.length > 0 ? result[0] : { error: "Book not found" });
    });
});

// Borrow Book
app.post("/borrow-book", (req, res) => {
    const { rfid_uid, book_number } = req.body;
    db.query("SELECT book_name FROM books WHERE book_number = ?", [book_number], (err, result) => {
        if (err) return res.status(500).json({ error: "Database error" });
        if (result.length === 0) return res.status(404).json({ error: "Book not found" });

        const book_name = result[0].book_name;
        const due_date = new Date();
        due_date.setDate(due_date.getDate() + 14); // 14-day loan period

        db.query("INSERT INTO library (rfid_uid, book_number, book_name, due_date) VALUES (?, ?, ?, ?)",
            [rfid_uid, book_number, book_name, due_date],
            (err) => {
                if (err) return res.status(500).json({ error: "Failed to borrow book" });
                res.json({ message: "Book borrowed successfully", due_date });
            });
    });
});

// Return Book
app.post("/return-book", (req, res) => {
    const { rfid_uid, book_number } = req.body;
    db.query("DELETE FROM library WHERE rfid_uid = ? AND book_number = ?", [rfid_uid, book_number], (err, result) => {
        if (err) res.status(500).json({ error: "Database error" });
        else res.json(result.affectedRows > 0 ? { message: "Book returned successfully" } : { error: "No such borrowed book found" });
    });
});

// Start Server
app.listen(3000, () => {
    console.log("Server running on http://localhost:3000");
});
