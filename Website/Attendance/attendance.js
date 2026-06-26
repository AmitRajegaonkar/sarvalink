/* Search */
function searchFunction() {
    var input = document.getElementById('searchInput').value.toLowerCase();
    var table = document.querySelector("table");
    var rows = table.querySelectorAll("tbody tr");

    rows.forEach(row => {
        var nameCell = row.querySelector("td:nth-child(2)");
        if (nameCell) {
            var name = nameCell.textContent.toLowerCase();
            row.style.display = name.includes(input) ? "" : "none";
        }
    });
}
/* end */