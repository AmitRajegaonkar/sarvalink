const express = require('express');
const app = express();
const PORT = 3005;

// Simulated data that would normally come from a database
const feeData = [
    {
        year: '1st',
        tuition_current: '₹62000',
        tuition_paid: '₹62000',
        hostel_current: '₹64000',
        hostel_paid: '₹64000',
        transport_current: '-',
        transport_paid: '-',
        vap_current: '-',
        vap_paid: '-'
    },
    {
        year: '2nd',
        tuition_current: '₹60000',
        tuition_paid: '₹30000',
        hostel_current: '₹74000',
        hostel_paid: '₹37000',
        transport_current: '-',
        transport_paid: '-',
        vap_current: '-',
        vap_paid: '-'
    }
];

// Function to generate the HTML table dynamically
function generateFeeTable(data) {
    let tableHTML = `
    <table border="1" style="border-collapse: collapse; width: 100%;">
        <thead>
            <tr>
                <th>Year</th>
                <th colspan="2">Tuition Fee</th>
                <th colspan="2">Hostel Fee</th>
                <th colspan="2">Transport Fee</th>
                <th colspan="2">VAP Fee</th>
            </tr>
            <tr>
                <th></th>
                <th>Current</th>
                <th>Paid</th>
                <th>Current</th>
                <th>Paid</th>
                <th>Current</th>
                <th>Paid</th>
                <th>Current</th>
                <th>Paid</th>
            </tr>
        </thead>
        <tbody>`;

    // Loop through the data and generate rows dynamically
    data.forEach(fee => {
        tableHTML += `
        <tr>
            <td>${fee.year}</td>
            <td>${fee.tuition_current}</td>
            <td>${fee.tuition_paid}</td>
            <td>${fee.hostel_current}</td>
            <td>${fee.hostel_paid}</td>
            <td>${fee.transport_current}</td>
            <td>${fee.transport_paid}</td>
            <td>${fee.vap_current}</td>
            <td>${fee.vap_paid}</td>
        </tr>`;
    });

    tableHTML += `
        </tbody>
    </table>`;

    return tableHTML;
}

// Handle the root route to serve HTML with the dynamically generated table
app.get('/', (req, res) => {
    // HTML structure
    const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Fee Structure</title>
        <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            table { width: 100%; border: 1px solid #000; }
            th, td { padding: 8px 12px; text-align: center; border: 1px solid #000; }
            thead { background-color: #007bff; color: white; }
        </style>
    </head>
    <body>
        <h1>Student Fee Structure</h1>
        ${generateFeeTable(feeData)}
    </body>
    </html>`;

    // Send the HTML response
    res.send(html);
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});




