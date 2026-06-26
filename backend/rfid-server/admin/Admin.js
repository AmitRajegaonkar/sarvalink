const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');

const app = express();
const port = 1254; // You can change this to any available port

app.use(bodyParser.urlencoded({ extended: true })); // Middleware for parsing form data

// MySQL connection setup
const db = mysql.createConnection({
  host: '127.0.0.1', // Your MySQL server address
  user: 'root', // Your MySQL username
  password: 'pass123', // Your MySQL password
  database: 'logdb' // Your MySQL database name
});

// Connect to the database
db.connect((err) => {
  if (err) {
    console.error('Error connecting to the database:', err);
    return;
  }
  console.log('Connected to the MySQL database');
});

// HTML Templates as Strings

const studentDetailsHTML = (student) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Edit Student Details</title>
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      background-color: #f4f7fa;
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100vh;
      margin: 0;
      padding: 0;
    }
    .main {
      background-color: #fff;
      border-radius: 10px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
      padding: 40px;
      width: 100%;
      max-width: 800px;
    }
    table {
      width: 100%;
      border-spacing: 0;
    }
    td {
      padding: 12px 10px;
      font-size: 16px;
      color: #333;
      vertical-align: middle;
    }
    td:first-child {
      font-weight: bold;
      text-align: right;
      width: 30%;
      padding-right: 20px;
      color: #555;
    }
    td:nth-child(2) {
      text-align: left;
      color: #000;
    }
    button {
      padding: 6px 12px;
      background-color: #1a73e8;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
    }
    button:hover {
      background-color: #155ab6;
    }
    input[type="text"], input[type="number"], input[type="date"], textarea {
      padding: 6px;
      font-size: 16px;
      width: 80%;
    }
    .button-container {
      display: flex;
      justify-content: center;
      margin-top: 20px;
    }
    @media (max-width: 600px) {
      .main {
        padding: 20px;
      }
      td:first-child {
        text-align: left;
        padding-right: 10px;
      }
    }
  </style>
</head>
<body>
  <div class="main">
    <h2>Edit Student Details</h2>
    <form id="editForm" action="/admin/update_student" method="POST">
      <input type="hidden" name="id" value="${student.id}">
      <table>
      <tr>
      <td>RFID UID:</td>
      <td><input type="text" name="rfid_uid" value="${student.uid}" required></td>
      </tr>
      <tr>
        <td>Name:</td>
        <td><input type="text" name="name" value="${student.name}" required></td>
      </tr>
        <tr>
          <td>Key UID:</td>
          <td><input type="text" name="key_uid" value="${student.key_uid}" required></td>
        </tr>
        <tr>
          <td>Roll Number:</td>
          <td><input type="text" name="rollno" value="${student.rollno}" required></td>
        </tr>
        <tr>
          <td>Division:</td>
          <td><input type="text" name="division" value="${student.division}" required></td>
        </tr>
        <tr>
          <td>Branch:</td>
          <td><input type="text" name="branch" value="${student.branch}" required></td>
        </tr>
        <tr>
          <td>Mobile Number:</td>
          <td><input type="text" name="mobilno" value="${student.mobilno}" required></td>
        </tr>
        <tr>
          <td>PNR Number:</td>
          <td><input type="text" name="PNRno" value="${student.PNRno}" required></td>
        </tr>
        <tr>
          <td>Date of Birth:</td>
          <td><input type="date" name="DOB" value="${student.DOB}" required></td>
        </tr>
        <tr>
          <td>Address:</td>
          <td><input type="text" name="address" value="${student.address}" required></td>
        </tr>
        <tr>
          <td>Admission Year:</td>
          <td><input type="text" name="admissionyear" value="${student.admissionyear}" required></td>
        </tr>
        <tr>
          <td>Image Path:</td>
          <td><input type="text" name="imgpath" value="${student.imgpath}" required></td>
        </tr>
      </table>
      <div class="button-container">
        <button type="submit">Save All Changes</button>
      </div>
    </form>
    <a href="/admin">Edit Another Student</a>
  </div>
</body>
</html>
`;





const addStudentHTML = (rfid_uid = '', key_uid = '') => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Add New Student</title>
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      background-color: #f4f7fa;
      margin: 0;
      padding: 0;
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100vh;
    }

    h2 {
      color: #1a73e8;
      margin-bottom: 20px;
      font-size: 26px;
      font-weight: bold;
    }

    .main {
      background-color: #fff;
      border-radius: 10px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
      padding: 40px;
      width: 100%;
      max-width: 800px;
    }

    .form-row {
      display: flex;
      justify-content: space-between;
      gap: 20px;
      margin-bottom: 20px;
    }

    .form-group {
      flex: 1;
      display: flex;
      flex-direction: column;
    }

    label {
      font-size: 16px;
      color: #333;
      margin-bottom: 8px;
    }

    input[type="text"], input[type="number"], input[type="date"], textarea {
      width: 100%;
      padding: 12px 15px;
      border: 1px solid #ddd;
      border-radius: 5px;
      font-size: 16px;
      box-sizing: border-box;
      transition: 0.3s;
    }

    input[type="text"]::placeholder, textarea::placeholder {
      color: #999;
      font-style: italic;
    }

    input:focus, textarea:focus {
      border-color: #1a73e8;
      box-shadow: 0 0 8px rgba(26, 115, 232, 0.2);
    }

    textarea {
      height: 100px;
      resize: none;
    }

    button {
      background-color: #1a73e8;
      color: #fff;
      border: none;
      padding: 12px 20px;
      font-size: 16px;
      border-radius: 5px;
      cursor: pointer;
      transition: background-color 0.3s ease;
      width: 100%;
      box-sizing: border-box;
    }

    button:hover {
      background-color: #155ab6;
    }

    @media (max-width: 600px) {
      .form-row {
        flex-direction: column;
      }

      .main {
        padding: 20px;
      }
    }
  </style>
</head>
<body>
  <div class="main">
    <h2>Add New Student</h2>
    <form action="/admin/insert_student" method="POST">
      <div class="form-row">
        <div class="form-group">
          <label for="name">Name:</label>
          <input type="text" id="name" name="name" placeholder="Enter student's name" required>
        </div>
        <div class="form-group">
          <label for="rfid_uid">RFID UID:</label>
          <input type="text" id="rfid_uid" name="rfid_uid" placeholder="Enter RFID UID" value="${rfid_uid}">
        </div>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label for="key_uid">Key UID:</label>
          <input type="text" id="key_uid" name="key_uid" placeholder="Enter Key UID" value="${key_uid}">
        </div>
        <div class="form-group">
          <label for="rollno">Roll Number:</label>
          <input type="number" id="rollno" name="rollno" placeholder="Enter roll number" required>
        </div>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label for="division">Division:</label>
          <input type="text" id="division" name="division" placeholder="Enter division" required>
        </div>
        <div class="form-group">
          <label for="branch">Branch:</label>
          <input type="text" id="branch" name="branch" placeholder="Enter branch" required>
        </div>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label for="mobilno">Mobile Number:</label>
          <input type="text" id="mobilno" name="mobilno" placeholder="Enter mobile number" required>
        </div>
        <div class="form-group">
          <label for="PNRno">PNR Number:</label>
          <input type="text" id="PNRno" name="PNRno" placeholder="Enter PNR number" required>
        </div>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label for="DOB">Date of Birth:</label>
          <input type="date" id="DOB" name="DOB" required>
        </div>
        <div class="form-group">
          <label for="admissionyear">Admission Year:</label>
          <input type="number" id="admissionyear" name="admissionyear" placeholder="Enter admission year" required>
        </div>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label for="address">Address:</label>
          <textarea id="address" name="address" placeholder="Enter address" required></textarea>
        </div>
        <div class="form-group">
          <label for="imgpath">Image Path:</label>
          <input type="text" id="imgpath" name="imgpath" placeholder="Enter image path" required>
        </div>
      </div>

      <button type="submit">Add Student</button>
    </form>
  </div>
</body>
</html>

`;

let uid = "";
let key_uid = "";

// Route to handle updating student information
app.post('/admin/update_student', (req, res) => {
  const { id, name, rfid_uid, key_uid, rollno, division, branch, mobilno, PNRno, DOB, address, admissionyear, imgpath } = req.body;

  const query = `
    UPDATE students 
    SET name = ?, uid = ?, key_uid = ?, rollno = ?, division = ?, branch = ?, mobileno = ?, PNRno = ?, DOB = ?, address = ?, admissionyear = ?, imgpath = ? 
    WHERE id = ?
  `;
  
  db.query(query, [name, rfid_uid, key_uid, rollno, division, branch, mobilno, PNRno, DOB, address, admissionyear, imgpath, id], (err, result) => {
    if (err) {
      console.error('Error updating student:', err);
      return res.status(500).send('Error updating student');
    }

    console.log('Student updated successfully');
    res.send('Student details updated successfully');
  });
});


app.post('/uid', (req, res) => {
  uid = req.body.uid || "";
  key_uid = req.body.key_uid || "";
  event = req.body.event || "";

  console.log(`Received UID: ${uid}, Key UID: ${key_uid}, Event: ${event}`);
  
  res.send(`UID: ${uid}, Key UID: ${key_uid}, Event: ${event}`);
});

// Admin tab to handle RFID/Keypad input and manage students
app.get('/admin', (req, res) => {

  res.send(`<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Admin: Check RFID or Key UID</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background-color: #f4f7fa;
            margin: 0;
            padding: 0;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
        }

        h2 {
            color: #1a73e8;
            margin-bottom: 20px;
            font-size: 26px;
            font-weight: bold;
        }

        .main {
            background-color: #fff;
            border-radius: 10px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
            padding: 40px;
            width: 100%;
            max-width: 400px;
            text-align: center;
        }

        label {
            font-size: 16px;
            color: #333;
            margin-bottom: 8px;
            display: block;
            text-align: left;
        }

        input[type="text"] {
            width: 100%;
            padding: 12px 15px;
            margin: 10px 0;
            border: 1px solid #ddd;
            border-radius: 5px;
            font-size: 16px;
            box-sizing: border-box;
            transition: 0.3s;
        }

        input[type="text"]::placeholder {
            color: #999;
            font-style: italic;
        }

        input[type="text"]:focus {
            border-color: #1a73e8;
            box-shadow: 0 0 8px rgba(26, 115, 232, 0.2);
        }

        input[type="submit"] {
            background-color: #1a73e8;
            color: #fff;
            border: none;
            padding: 12px 20px;
            font-size: 16px;
            border-radius: 5px;
            cursor: pointer;
            transition: background-color 0.3s ease;
            width: 100%;
            box-sizing: border-box;
        }

        input[type="submit"]:hover {
            background-color: #155ab6;
        }

        .form-group {
            margin-bottom: 20px;
        }

        .form-group:last-of-type {
            margin-bottom: 0;
        }

        @media (max-width: 600px) {
            .main {
                padding: 20px;
            }
        }
    </style>
</head>

<body>
    <div class="main">
        <h2>Admin: Check RFID or Key UID</h2>
        <form action="/admin/check_rfid_key" method="POST">
            <div class="form-group">
                <label for="rfid_uid">Enter RFID UID:</label>
                <input type="text" id="rfid_uid" name="rfid_uid" placeholder="Enter RFID UID" value="${uid || ''}">
            </div>
            <div class="form-group">
                <label for="key_uid">Enter Key UID:</label>
                <input type="text" id="key_uid" name="key_uid" placeholder="Enter Key UID" value="${key_uid || ''}">
            </div>
            <input type="submit" value="Submit">
        </form>
    </div>
</body>

</html>

  `);
});

// Route to handle RFID/Keypad input from admin
app.post('/admin/check_rfid_key', (req, res) => {
  const rfid_uid = req.body.rfid_uid;
  const key_uid = req.body.key_uid;

  let query = '';
  let param = '';

  if (rfid_uid) {
    query = 'SELECT * FROM students WHERE uid = ?';
    param = rfid_uid;
  } else if (key_uid) {
    query = 'SELECT * FROM students WHERE key_uid = ?';
    param = key_uid;
  }

  if (query) {
    db.query(query, [param], (err, result) => {
      if (err) {
        console.error('Error checking RFID/Keypad UID:', err);
        return res.status(500).send('Error checking RFID/Keypad UID');
      }

      if (result.length > 0) {
        res.send(studentDetailsHTML(result[0])); // Display the student details in an editable form
      } else {
        res.send(addStudentHTML(rfid_uid, key_uid)); // Show the form to add a new student
      }
    });
  } else {
    res.status(400).send('Either RFID or Keypad UID is required');
  }
});


// Endpoint to handle student insertion into the 'students' table
app.post('/admin/insert_student', (req, res) => {
  const { name, rfid_uid, key_uid, rollno, division, branch, mobilno, PNRno, DOB, address, admissionyear, imgpath } = req.body;

  const query = 'INSERT INTO students (name, uid, key_uid, rollno, division, branch, mobileno, PNRno, DOB, address, admissionyear, imgpath) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
  db.query(query, [name, rfid_uid, key_uid, rollno, division, branch, mobilno, PNRno, DOB, address, admissionyear, imgpath], (err, result) => {
    if (err) {
      console.error('Error inserting student:', err);
      return res.status(500).send('Error inserting student');
    }

    console.log('Student inserted successfully');
    res.send('Student added successfully');
  });
});



// Serve the Frontend
app.get("/library", (req, res) => {
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
              background-color: #f9f9f9;
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
      <script>
          let eventSource;

          function startListeningForRFID() {
              if (eventSource) eventSource.close(); 
              eventSource = new EventSource("/rfid-stream");
              eventSource.onmessage = function(event) {
                  document.getElementById("rfid_uid").value = event.data;
                  fetchStudent(); 
              };
          }

          async function fetchStudent() {
              const rfid_uid = document.getElementById("rfid_uid").value;
              if (!rfid_uid) return;
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
              fetchStudent(); 
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
              fetchStudent(); 
          }

          window.onload = startListeningForRFID;
      </script>
  </head>
  <body>
      <div class="container">
          <h2>Library System</h2>
          <input type="text" id="rfid_uid" placeholder="Scan RFID Card" readonly>
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
         <a href="http://192.168.149.212:1264/add_book"> <button>add Book</button></a>
          <p id="status"></p>
      </div>
  </body>
  </html>
  `);
});



// Server-Sent Events (SSE) to send RFID data dynamically
app.get("/rfid-stream", (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  setInterval(() => {
      res.write(`data: ${uid}\n\n`);
  }, 2000); // Send updated UID every 2 seconds
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

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
});
