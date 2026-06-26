const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');

const app = express();
const port = 1264; // You can change this to any available port

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

// Middleware to parse incoming requests
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Function to fetch student name by UID or key_uid
const getStudentName = (uid, key_uid, callback) => {
  let query = '';
  let param = '';

  if (uid) {
    query = 'SELECT name FROM students WHERE uid = ?';
    param = uid;
  } else if (key_uid) {
    query = 'SELECT name FROM students WHERE key_uid = ?';
    param = key_uid;
  }

  if (query) {
    db.query(query, [param], (err, result) => {
      if (err) return callback(err);
      if (result.length > 0) {
        callback(null, result[0].name);
      } else {
        callback(null, null); // No student found
      }
    });
  } else {
    callback(null, null); // No UID or key_uid provided
  }
};

// Endpoint to handle RFID or keypad data and store it in attendance_logs
app.post('/store_attendance', (req, res) => {
  const uid = req.body.uid;
  const key_uid = req.body.key_uid;
  const timestamp = new Date();
  const event = req.body.event;

  if (!uid && !key_uid) {
    return res.status(400).send('Either UID or key_uid is required');
  }

  // Fetch student name based on UID or key_uid
  getStudentName(uid, key_uid, (err, name) => {
    if (err) {
      console.error('Error fetching student name:', err);
      return res.status(500).send('Error fetching student name');
    }

    // If name is not found, set it to "Unknown"
    name = name || 'Unknown';

    // Insert data into attendance_logs
    const query = 'INSERT INTO attendance_logs (rfid_uid, key_uid, name, timestamp, event) VALUES (?, ?, ?, ?, ?)';
    db.query(query, [uid, key_uid, name, timestamp, event], (err, result) => {
      if (err) {
        console.error('Error inserting data:', err);
        return res.status(500).send('Error inserting data into the database');
      }

      console.log('Attendance data inserted successfully:', result);
      res.send('Attendance logged successfully');
    });
  });
});

// Endpoint to display attendance data
// Modularized to separate HTML generation from logic
app.get('/display_attendance', (req, res) => {
  const query = `
        SELECT  
        id, 
        rfid_uid, 
        key_uid, 
        name, 
        event,
        DATE_FORMAT(timestamp, '%H:%i:%s %a %d/%m/%Y') AS formatted_time
        FROM attendance_logs
        ORDER BY timestamp ;`;

  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching data from the database:', err.message);
      return res.status(500).send('An error occurred while retrieving attendance logs.');
    }

    const html = generateAttendanceHTML(results);
    res.send(html);
  });
});

// Helper function to generate the HTML
function generateAttendanceHTML(results) {
  let html = `
    <html>
    <head>
      <title>Attendance Logs</title>
      <style>
        body { font-family: Arial, sans-serif; background-color: #f4f4f9; margin: 0; padding: 0; }
        h2 { text-align: center; color: #333; padding: 10px 0; }
        table { border-collapse: collapse; width: 80%; margin: 20px auto; }
        table, th, td { border: 1px solid #ddd; padding: 12px 20px; text-align: left; }
        th { background-color: #4CAF50; color: white; }
        tr:nth-child(even) { background-color: #f9f9f9; }
        tr:hover { background-color: #f1f1f1; }
        button { padding: 5px 10px; background-color: #4CAF50; color: white; border: none; cursor: pointer; }
        button:hover { background-color: #45a049; }
        input[type="text"] { width: 90%; padding: 6px; margin: 4px 0; }
        @media screen and (max-width: 768px) {
          table { width: 100%; }
          th, td { padding: 10px; }
        }
      </style>
    </head>
    <body>
      <h2>Attendance Logs</h2>
      <form action="/update_attendance" method="POST">
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>RFID UID</th>
            <th>Key UID</th>
            <th>Name</th>
            <th>Timestamp</th>
            <th>Event</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>`;

  let rowNumber = 1;

  // Loop through the results and generate rows
  results.forEach(row => {
    html += `
      <tr>
        <td>${rowNumber++}</td>
        <td><input type="text" name="rfid_uid_${row.id}" value="${escapeHTML(row.rfid_uid || '')}"></td>
        <td><input type="text" name="key_uid_${row.id}" value="${escapeHTML(row.key_uid || '')}"></td>
        <td><input type="text" name="name_${row.id}" value="${escapeHTML(row.name)}"></td>
        <td>${row.formatted_time}</td>
        <td><input type="text" name="event_${row.id}" value="${escapeHTML(row.event || '')}"></td>
        <td><button type="submit" name="save" value="${row.id}">Save</button></td>
      </tr>`;
  });

  html += `
        </tbody>
      </table>
      </form>
    </body>
    </html>`;

  return html;
}

// Helper function to escape HTML and prevent XSS
function escapeHTML(unsafeString) {
  return unsafeString
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}



app.post('/update_attendance', (req, res) => {
  const updatedRows = Object.keys(req.body).reduce((acc, key) => {
    const [field, id] = key.split('_');
    if (!acc[id]) acc[id] = {};
    acc[id][field] = req.body[key];
    return acc;
  }, {});

  // Loop over each row and selectively update the fields that have changed
  Object.keys(updatedRows).forEach(id => {
    const { rfid_uid, key_uid, name, event } = updatedRows[id];

    // Fetch the current row data from the database for comparison
    const selectQuery = 'SELECT rfid_uid, key_uid, name, event FROM attendance_logs WHERE id = ?';
    
    db.query(selectQuery, [id], (err, currentData) => {
      if (err) {
        console.error('Error fetching current data:', err);
        return res.status(500).send('Error fetching current data from the database');
      }

      // Check if we got any results
      if (currentData.length === 0) {
        console.warn(`No data found for id: ${id}`);
        return; // Skip this row if no data is found
      }

      const row = currentData[0];

      // Construct the update query dynamically based on changed fields
      let updateFields = [];
      let updateValues = [];

      // Only update fields if they have been modified, otherwise keep the old values
      if (rfid_uid && rfid_uid !== row.rfid_uid) {
        updateFields.push('rfid_uid = ?');
        updateValues.push(rfid_uid);
      } else {
        updateFields.push('rfid_uid = ?');
        updateValues.push(row.rfid_uid); // Keep the old value if unchanged
      }

      if (key_uid && key_uid !== row.key_uid) {
        updateFields.push('key_uid = ?');
        updateValues.push(key_uid);
      } else {
        updateFields.push('key_uid = ?');
        updateValues.push(row.key_uid); // Keep the old value if unchanged
      }

      if (name && name !== row.name) {
        updateFields.push('name = ?');
        updateValues.push(name);
      }

      if (event && event !== row.event) {
        updateFields.push('event = ?');
        updateValues.push(event);
      }

      // Only perform the update if there are changes
      if (updateFields.length > 0) {
        const updateQuery = `
          UPDATE attendance_logs 
          SET ${updateFields.join(', ')} 
          WHERE id = ?`;

        updateValues.push(id);

        db.query(updateQuery, updateValues, (updateErr) => {
          if (updateErr) {
            console.error('Error updating data:', updateErr);
            return res.status(500).send('Error updating data in the database');
          }
        });
      }
    });
  });

  // Redirect back to the display page after updating
  res.redirect('/display_attendance');
});





app.get('/attendance_report', (req, res) => {
  // SQL query to fetch cumulative attendance for each lecture with updated timings
  const query = `
    SELECT 
      s.name,
      SUM(CASE WHEN HOUR(a.timestamp) = 9 THEN 1 ELSE 0 END) AS lecture_1,
      SUM(CASE WHEN HOUR(a.timestamp) = 10 THEN 1 ELSE 0 END) AS lecture_2,
      SUM(CASE WHEN HOUR(a.timestamp) = 11 THEN 1 ELSE 0 END) AS lecture_3,
      SUM(CASE WHEN HOUR(a.timestamp) = 12 THEN 1 ELSE 0 END) AS lecture_4,
      SUM(CASE WHEN HOUR(a.timestamp) = 13 AND MINUTE(a.timestamp) < 30 THEN 1 ELSE 0 END) AS lecture_5,
      SUM(CASE WHEN (HOUR(a.timestamp) = 13 AND MINUTE(a.timestamp) >= 30) OR (HOUR(a.timestamp) = 14 AND MINUTE(a.timestamp) < 25) THEN 1 ELSE 0 END) AS lecture_6,
      SUM(CASE WHEN (HOUR(a.timestamp) = 14 AND MINUTE(a.timestamp) >= 25) OR (HOUR(a.timestamp) = 15 AND MINUTE(a.timestamp) < 30) THEN 1 ELSE 0 END) AS lecture_7,
      SUM(CASE WHEN (HOUR(a.timestamp) = 15 AND MINUTE(a.timestamp) >= 30) OR (HOUR(a.timestamp) = 16) THEN 1 ELSE 0 END) AS lecture_8
    FROM students s
    LEFT JOIN attendance_logs a ON s.uid = a.rfid_uid
    GROUP BY s.name
    ORDER BY s.name;
  `;

  db.query(query, (err, results) => {
      if (err) {
          console.error('Error fetching attendance report:', err);
          return res.status(500).send('Error fetching attendance report');
      }

      // Construct the HTML table
      let html = `
      <html>
      <head>
        <title>Attendance Report</title>
        <style>
          body { font-family: Arial, sans-serif; background-color: #f8f9fa; }
          table { border-collapse: collapse; width: 80%; margin: 20px auto; background: #fff; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); border-radius: 8px; }
          th, td { border: 1px solid #ddd; padding: 12px; text-align: center; }
          th { background-color: #007bff; color: white; font-weight: bold; }
          tbody tr:nth-child(even) { background-color: #f2f2f2; }
        </style>
      </head>
      <body>
        <h2 style="text-align:center">Cumulative Lecture-wise Attendance Report</h2>
        <table>
          <thead>
            <tr>
              <th>Student Name</th>
              <th>Lecture 1 (9-10 AM)</th>
              <th>Lecture 2 (10-11 AM)</th>
              <th>Lecture 3 (11-12 PM)</th>
              <th>Lecture 4 (12-1 PM)</th>
              <th>Lecture 5 (1:30-2:25 PM)</th>
              <th>Lecture 6 (2:25-3:30 PM)</th>
              <th>Lecture 7 (3:30-4:30 PM)</th>
            </tr>
          </thead>
          <tbody>`;

      // Loop through the results and create a row for each student
      results.forEach(row => {
          html += `
            <tr>
              <td>${row.name}</td>
              <td>${row.lecture_1}</td>
              <td>${row.lecture_2}</td>
              <td>${row.lecture_3}</td>
              <td>${row.lecture_4}</td>
              <td>${row.lecture_5}</td>
              <td>${row.lecture_6}</td>
              <td>${row.lecture_7}</td>
            </tr>`;
      });

      html += `
          </tbody>
        </table>
      </body>
      </html>`;

      // Send the HTML content
      res.send(html);
  });
});

  



  app.get('/event_attendance', async (req, res) => {
    const queryEvents = 'SELECT * FROM events';

    try {
        // Fetch the events from the database
        const [events] = await db.promise().query(queryEvents);

        // Generate HTML with improved styling and structure
        let html = `
        <html>
        <head>
            <title>Select Event</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    background-color: #f9f9f9;
                    margin: 0;
                    padding: 0;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    min-height: 100vh;
                }
                .container {
                    width: 80%;
                    margin: auto;
                    background-color: #fff;
                    padding: 20px;
                    border-radius: 8px;
                    box-shadow: 0 0 15px rgba(0, 0, 0, 0.1);
                }
                h2 {
                    text-align: center;
                    color: #333;
                }
                select, button {
                    padding: 10px;
                    margin-top: 20px;
                    font-size: 16px;
                    width: 100%;
                    max-width: 400px;
                    display: block;
                    margin-left: auto;
                    margin-right: auto;
                }
                button {
                    background-color: #28a745;
                    color: white;
                    border: none;
                    cursor: pointer;
                    transition: background-color 0.3s ease;
                }
                button:hover {
                    background-color: #218838;
                }
                iframe {
                    width: 100%;
                    height: 600px;
                    margin-top: 30px;
                    border: 1px solid #ddd;
                    border-radius: 8px;
                }
            </style>
            <script>
                function loadReport() {
                    const eventNumber = document.getElementById('eventSelect').value;
                    const iframe = document.getElementById('attendanceIframe');
                    iframe.src = '/event_report?event_number=' + eventNumber;
                    return false; // Prevent form submission
                }
            </script>
        </head>
        <body>
            <div class="container">
                <h2>Select Event to View Attendance</h2>
                <form onsubmit="return loadReport()">
                    <select id="eventSelect" name="event_number">
        `;

        // Dynamically add the event options
        events.forEach(event => {
            html += `<option value="${event.event_number}">${event.event_name}</option>`;
        });

        html += `
                    </select>
                    <button type="submit">Load Report</button>
                </form>

                <!-- Iframe to display the report -->
                <iframe id="attendanceIframe"></iframe>
            </div>
        </body>
        </html>`;

        // Send the response
        res.send(html);
    } catch (err) {
        console.error('Error fetching events:', err);
        res.status(500).send('Error fetching events from the database');
    }
});

  


app.get('/event_report', (req, res) => {
  const event_number = req.query.event_number;

  if (!event_number) {
    return res.status(400).send('Event number is required');
  }

  // Query to get the event name
  const queryEventName = 'SELECT event_name FROM events WHERE event_number = ?';

  db.query(queryEventName, [event_number], (err, eventResult) => {
    if (err || eventResult.length === 0) {
      console.error('Error fetching event name:', err);
      return res.status(500).send('Error fetching event details');
    }

    const eventName = eventResult[0].event_name;

    // Query to fetch attendance for the selected event
    const queryAttendance = `SELECT 
        s.name, 
        CASE WHEN a.event IS NOT NULL THEN 1 ELSE 0 END AS present,
         DATE_FORMAT(a.timestamp, '%H:%i:%s %a %d/%m/%Y') AS formatted_time
      FROM students s
      LEFT JOIN attendance_logs a ON (s.uid = a.rfid_uid OR s.key_uid = a.key_uid) AND a.event = ?
      ORDER BY a.timestamp ASC`;

    db.query(queryAttendance, [event_number], (err, results) => {
      if (err) {
        console.error('Error fetching attendance report:', err);
        return res.status(500).send('Error fetching attendance report');
      }

      // Construct the HTML table
      let html = `
        <html>
        <head>
          <title>Event Attendance Report of ${eventName}</title>
          <style>
            table { border-collapse: collapse; width: 50%; margin: 20px auto; }
            table, th, td { border: 1px solid black; padding: 10px; text-align: left; }
            th { background-color: #f2f2f2; }
            td { text-align: center; }
          </style>
        </head>
        <body>
          <h2 style="text-align:center">Event Attendance Report of ${eventName}</h2>
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Attendance</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>`;

      // Loop through the results to create a row for each student
      results.forEach(row => {
        html += `
          <tr>
            <td>${row.name}</td>
            <td>${row.present === 1 ? 'Present' : 'Absent'}</td>
            <td>${row.formatted_time}</td>
          </tr>`;
      });

      html += `
            </tbody>
          </table>
        </body>
        </html>`;

      // Send the HTML content
      res.send(html);
    });
  });
});

// Endpoint to serve the event insertion form
app.get('/add_event', (req, res) => {
  const formHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Insert Event</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          background-color: #f4f7f6;
          margin: 0;
          padding: 0;
          display: flex;
          justify-content: center;
          align-items: center;
          height: 100vh;
        }

        .container {
          background-color: #fff;
          padding: 20px;
          border-radius: 8px;
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
          max-width: 400px;
          width: 100%;
        }

        h2 {
          text-align: center;
          color: #333;
        }

        label {
          font-size: 14px;
          color: #333;
          display: block;
          margin-bottom: 5px;
        }

        input[type="number"],
        input[type="text"] {
          width: 100%;
          padding: 10px;
          margin-bottom: 20px;
          border: 1px solid #ddd;
          border-radius: 5px;
          font-size: 16px;
          box-sizing: border-box;
        }

        button {
          width: 100%;
          padding: 10px;
          background-color: #5cb85c;
          color: #fff;
          border: none;
          border-radius: 5px;
          font-size: 16px;
          cursor: pointer;
          transition: background-color 0.3s ease;
        }

        button:hover {
          background-color: #4cae4c;
        }

        @media (max-width: 600px) {
          .container {
            padding: 15px;
          }

          input[type="number"],
          input[type="text"],
          button {
            font-size: 14px;
            padding: 8px;
          }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h2>Insert Event</h2>
        <form action="/insert_event" method="POST">
          <label for="event_number">Event Number:</label>
          <input type="number" id="event_number" name="event_number" required>

          <label for="event_name">Event Name:</label>
          <input type="text" id="event_name" name="event_name" required>

          <button type="submit">Insert Event</button>
        </form>
      </div>
    </body>
    </html>
  `;
  res.send(formHtml);
});

// Endpoint to handle event insertion into the 'events' table
app.post('/insert_event', (req, res) => {
  const eventNumber = req.body.event_number;
  const eventName = req.body.event_name;

  const query = 'INSERT INTO events (event_number, event_name) VALUES (?, ?)';
  db.query(query, [eventNumber, eventName], (err, result) => {
    if (err) {
      console.error('Error inserting event:', err);
      return res.status(500).send('Error inserting event');
    }

    console.log('Event inserted successfully:', result);
    res.send('Event inserted successfully');
  });
});




// Endpoint to serve the book insertion form
app.get('/add_book', (req, res) => {
  const formHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Insert book</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          background-color: #f4f7f6;
          margin: 0;
          padding: 0;
          display: flex;
          justify-content: center;
          align-items: center;
          height: 100vh;
        }

        .container {
          background-color: #fff;
          padding: 20px;
          border-radius: 8px;
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
          max-width: 400px;
          width: 100%;
        }

        h2 {
          text-align: center;
          color: #333;
        }

        label {
          font-size: 14px;
          color: #333;
          display: block;
          margin-bottom: 5px;
        }

        input[type="number"],
        input[type="text"] {
          width: 100%;
          padding: 10px;
          margin-bottom: 20px;
          border: 1px solid #ddd;
          border-radius: 5px;
          font-size: 16px;
          box-sizing: border-box;
        }

        button {
          width: 100%;
          padding: 10px;
          background-color: #5cb85c;
          color: #fff;
          border: none;
          border-radius: 5px;
          font-size: 16px;
          cursor: pointer;
          transition: background-color 0.3s ease;
        }

        button:hover {
          background-color: #4cae4c;
        }

        @media (max-width: 600px) {
          .container {
            padding: 15px;
          }

          input[type="number"],
          input[type="text"],
          button {
            font-size: 14px;
            padding: 8px;
          }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h2>Insert book</h2>
        <form action="/insert_book" method="POST">
          <label for="book_number">book Number:</label>
          <input type="number" id="book_number" name="book_number" required>

          <label for="book_name">book Name:</label>
          <input type="text" id="book_name" name="book_name" required>

          <button type="submit">Insert book</button>
        </form>
      </div>
    </body>
    </html>
  `;
  res.send(formHtml);
});

// Endpoint to handle book insertion into the 'books' table
app.post('/insert_book', (req, res) => {
  const bookNumber = req.body.book_number;
  const bookName = req.body.book_name;

  const query = 'INSERT INTO books (book_number, book_name) VALUES (?, ?)';
  db.query(query, [bookNumber, bookName], (err, result) => {
    if (err) {
      console.error('Error inserting book:', err);
      return res.status(500).send('Error inserting book');
    }

    console.log('book inserted successfully:', result);
    res.send('book inserted successfully');
  });
});

// Endpoint to serve the 'Add New Student' form
app.get('/add_student', (req, res) => {
  const formHtml = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Add New Student</title>
      <style>
        form {
          max-width: 400px;
          margin: 50px auto;
          padding: 20px;
          border: 1px solid #ccc;
          border-radius: 10px;
        }
        label, input {
          display: block;
          width: 100%;
          margin-bottom: 10px;
        }
        button {
          padding: 10px;
          background-color: #4CAF50;
          color: white;
          border: none;
          cursor: pointer;
        }
        button:hover {
          background-color: #45a049;
        }
      </style>
    </head>
    <body>
      <h2 style="text-align:center">Add New Student</h2>
      <form action="/insert_student" method="POST">
        <label for="name">Student Name:</label>
        <input type="text" id="name" name="name" required>

        <label for="rfid_uid">RFID UID:</label>
        <input type="text" id="rfid_uid" name="rfid_uid" required>

        <label for="key_uid">Keypad UID:</label>
        <input type="text" id="key_uid" name="key_uid" required>

        <button type="submit">Add Student</button>
      </form>
    </body>
    </html>
  `;
  res.send(formHtml);
});

// Endpoint to handle student insertion into the 'students' table
app.post('/insert_student', (req, res) => {
  const { name, rfid_uid, key_uid } = req.body;

  // SQL query to insert the student into the students table
  const query = 'INSERT INTO students (name, uid, key_uid) VALUES (?, ?, ?)';
  db.query(query, [name, rfid_uid, key_uid], (err, result) => {
    if (err) {
      console.error('Error inserting student:', err);
      return res.status(500).send('Error inserting student');
    }

    console.log('Student added successfully:', result);
    
    // Redirect back to the 'Add New Student' form after successful insertion
    res.redirect('/add_student');
  });
});





// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
