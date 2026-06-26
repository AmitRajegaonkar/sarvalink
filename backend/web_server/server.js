const express = require('express');
const mysql = require('mysql');
const cors = require('cors');
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MySQL connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root', // Your MySQL username
    password: '1234', // Your MySQL password
    database: 'studentinfo' // Your MySQL database name
});

db.connect((err) => {
    if (err) {
        console.error('Database connection error:', err);
    } else {
        console.log('Connected to MySQL database');
    }
});

// API to fetch all student data
app.get('/students', (req, res) => {
    const sqlQuery = 'SELECT * FROM students';
    db.query(sqlQuery, (err, result) => {
        if (err) {
            res.status(500).json({ error: err });
        } else {
            res.json(result);
        }
    });
});

// API to update student data (based on ID)
app.put('/students/:id', (req, res) => {
    const { id } = req.params;
    const updateData = req.body;

    const sqlQuery = `UPDATE students SET ? WHERE id = ?`;
    db.query(sqlQuery, [updateData, id], (err, result) => {
        if (err) {
            res.status(500).json({ error: err });
        } else {
            res.json({ message: 'Student data updated successfully' });
        }
    });
});

// Start the server
const port = 3000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

