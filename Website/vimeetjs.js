/* Dropdown */

function handleDepartmentChange() {
    const department = document.getElementById('department').value;
    const year = document.getElementById('year');
    const division = document.getElementById('division');

    if (department === 'FE') {
        year.disabled = true;
        division.disabled = true;
    } else {
        year.disabled = false;
        division.disabled = false;
    }
}

function loadContent() {
    const department = document.getElementById('department').value;
    const year = document.getElementById('year').value;
    const division = document.getElementById('division').value;
    
    // Define a base URL if needed
    const baseUrl = 'https://www.s2345rvalink.com/';  // Replace with your actual base URL
    
    let targetUrl;

    // Check if "FE" is selected
    if (department === 'FE') {
        /* targetUrl = `${baseUrl}FE.html`; */
        targetUrl = `Attendance/A1.html`;
    } else {
        // Create the URL based on the selections
        targetUrl = `${baseUrl}${department}/${year}/${division}.html`;
    }

    // Set the src attribute of the iframe to the target URL
    document.getElementById('contentFrame').src = targetUrl;
}

// Initialize the state based on the default selection
handleDepartmentChange();
/* end */