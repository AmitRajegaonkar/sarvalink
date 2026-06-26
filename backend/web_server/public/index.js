let studentsData = []; // To hold student data

document.addEventListener('DOMContentLoaded', function () {
    loadStudentData();
});

// Fetch student data from the server
function loadStudentData() {
    fetch('http://localhost:3000/students')
        .then(response => response.json())
        .then(data => {
            studentsData = data;
            renderTable(studentsData);
        })
        .catch(error => console.error('Error fetching student data:', error));
}

// Render the table with data
function renderTable(data) {
    let tableBody = document.querySelector('tbody');
    tableBody.innerHTML = ''; // Clear existing table rows

    data.forEach(student => {
        let row = `<tr data-id="${student.id}" id="row-${student.id}">
            <td>${student.sr_no}</td>
            <td>${student.name}</td>
            <td><span id="em3_th-${student.id}">${student.em3_th}</span></td>
            <td><span id="em3_pr-${student.id}">${student.em3_pr}</span></td>
            <td><span id="dsgt_th-${student.id}">${student.dsgt_th}</span></td>
            <td><span id="dsgt_pr-${student.id}">${student.dsgt_pr}</span></td>
            <td><span id="ds_th-${student.id}">${student.ds_th}</span></td>
            <td><span id="ds_pr-${student.id}">${student.ds_pr}</span></td>
            <td><span id="dlcoa_th-${student.id}">${student.dlcoa_th}</span></td>
            <td><span id="dlcoa_pr-${student.id}">${student.dlcoa_pr}</span></td>
            <td><span id="cg_th-${student.id}">${student.cg_th}</span></td>
            <td><span id="cg_pr-${student.id}">${student.cg_pr}</span></td>
            <td>${student.total_th}</td>
            <td>${student.total_pr}</td>
            <td>${student.grand_total}</td>
            <td>${student.percentage}</td>
            <td>
                <button onclick="enableEditMode(${student.id})">Edit</button>
                <button onclick="saveData(${student.id})" id="save-btn-${student.id}" style="display:none;">Save</button>
            </td>
        </tr>`;
        tableBody.innerHTML += row;
    });
}

// Enable Edit Mode
function enableEditMode(studentId) {
    const fields = ['em3_th', 'em3_pr', 'dsgt_th', 'dsgt_pr', 'ds_th', 'ds_pr', 'dlcoa_th', 'dlcoa_pr', 'cg_th', 'cg_pr'];
    fields.forEach(field => {
        let fieldElement = document.getElementById(`${field}-${studentId}`);
        let currentValue = fieldElement.textContent;
        fieldElement.innerHTML = `<input type="text" value="${currentValue}" id="input-${field}-${studentId}">`;
    });

    // Show the Save button and hide the Edit button
    document.querySelector(`button[onclick="enableEditMode(${studentId})"]`).style.display = 'none';
    document.getElementById(`save-btn-${studentId}`).style.display = 'inline';
}

// Save data back to the database
function saveData(studentId) {
    const fields = ['em3_th', 'em3_pr', 'dsgt_th', 'dsgt_pr', 'ds_th', 'ds_pr', 'dlcoa_th', 'dlcoa_pr', 'cg_th', 'cg_pr'];
    let updatedData = {};

    // Collect updated data from the inputs
    fields.forEach(field => {
        let inputElement = document.getElementById(`input-${field}-${studentId}`);
        updatedData[field] = inputElement.value;

        // Update the cell with the new value
        document.getElementById(`${field}-${studentId}`).innerHTML = inputElement.value;
    });

    // Send updated data to the backend
    fetch(`http://localhost:3000/students/${studentId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedData),
    })
    .then(response => response.json())
    .then(data => {
        console.log('Data updated successfully:', data);

        // Switch back to View Mode
        document.getElementById(`save-btn-${studentId}`).style.display = 'none';
        document.querySelector(`button[onclick="enableEditMode(${studentId})"]`).style.display = 'inline';
    })
    .catch(error => console.error('Error updating student data:', error));
}

// Search function
function searchFunction() {
  let input = document.getElementById('searchInput').value.toLowerCase();
  let rows = document.querySelectorAll('tbody tr');
  
  rows.forEach(row => {
      let name = row.querySelector('td:nth-child(2)').textContent.toLowerCase();
      if (name.includes(input)) {
          row.style.display = '';
      } else {
          row.style.display = 'none';
      }
  });
}



