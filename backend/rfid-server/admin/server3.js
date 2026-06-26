const express = require('express');
const mysql = require('mysql');
const app = express();

// Create connection to MySQL
const db = mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: 'pass123',
    database: 'logdb'
});

// Connect to MySQL
db.connect(err => {
    if (err) throw err;
    console.log('Connected to database');
});

// Function to format date
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toISOString().split('T')[0]; // Returns YYYY-MM-DD
}

// Route to display books
app.get('/books', (req, res) => {
    let sql = 'SELECT * FROM LibraryBooks';
    db.query(sql, (err, results) => {
        if (err) throw err;

        // Generate HTML to display the book data
        let html = `
            <html>
            <head>
                <title>Library Books</title>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        background-color: #f4f4f4;
                        color: #333;
                        margin: 0;
                        padding: 20px;
                    }
                    h1 {
                        text-align: center;
                        color: #2c3e50;
                    }
                    table {
                        width: 80%;
                        margin: 20px auto;
                        border-collapse: collapse;
                        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
                    }
                    th, td {
                        border: 1px solid #ddd;
                        padding: 12px;
                        text-align: center;
                    }
                    th {
                        background-color: #3498db;
                        color: white;
                    }
                    tr:nth-child(even) {
                        background-color: #f2f2f2;
                    }
                    tr:hover {
                        background-color: #d1e7ff; /* Light blue on hover */
                    }
                </style>
            </head>
            <body>
                <h1>Library Books</h1>
                <table>
                    <tr>
                        <th>Book Name</th>
                        <th>Issued Date</th>
                        <th>Due Date</th>
                    </tr>`;
        
        results.forEach(book => {
            html += `
                    <tr>
                        <td>${book.BookName}</td>
                        <td>${formatDate(book.IssuedDate)}</td>
                        <td>${formatDate(book.DueDate)}</td>
                    </tr>`;
        });

        html += `
                </table>
            </body>
            </html>`;
        
        res.send(html); // Send the generated HTML back to the client
    });
}); 

// Start the server
app.listen(3009, () => {
    console.log('Server running on port 3009');
});