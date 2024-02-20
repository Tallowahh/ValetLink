document.addEventListener('DOMContentLoaded', loadRowsFromLocalStorage);
document.getElementById('addRowButton').addEventListener('click', addRowAndSave);
document.getElementById('delInformation').addEventListener('click', confirmReset);
window.addEventListener('load', resetTableView);


document.getElementById('search-button').addEventListener('click', function() {
    var searchInput = document.getElementById('search-input').value.trim();
    if (searchInput.length > 0) {
        searchTable(searchInput);
    } else {
        alert("Please enter a RY Number to search."); // Optional: Display an alert if input is empty
        document.getElementById('search-result').innerHTML = ''; // Clear previous search results if any
    }
});

function addRowAndSave() {
    document.getElementById("formContainer").style.display = "block";
    document.getElementById("RYNumber").focus(); // Focus on the first field    
}

function submitForm() {
    var ryContent = document.getElementById("RYNumber").value.trim(); // Focus on the first field    

    if (ryContent == '') {
        alert("Enter an RY number");
    } else {
    var table = document.querySelector('.table tbody');
    var newRow = createRow();

    // Add the new row to the table
    table.appendChild(newRow);

    // Save the updated table to local storage
    saveTableToLocalStorage();
    }
}

function convertTime(time) {
    // Get the user-entered time in 24-hour format from the input field
    // Split the input into hours and minutes
    var parts = time.split(":");
    var hours = parseInt(parts[0], 10);
    var minutes = parseInt(parts[1], 10);

    // Create a new Date object with the time in 24-hour format
    var dateObj = new Date();
    dateObj.setHours(hours);
    dateObj.setMinutes(minutes);

    // Format the time in 12-hour format (hh:mm AM/PM)
    var formattedTime = dateObj.toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true });
    return formattedTime;
}

function createRow() {
    var currentTime = new Date(); // Get the current time
    var RyNumber = document.getElementById("RYNumber").value;
    var time = document.getElementById("Time").value;    

    if (time == '') {
        timeToUse = new Date(currentTime).toLocaleString('en-US', {hour: 'numeric', minute: 'numeric', hour12: true});
    } else {
        var timeParts = time.split(":");
        var hours = parseInt(timeParts[0], 10);
        var minutes = parseInt(timeParts[1], 10);
        currentTime.setHours(hours);
        currentTime.setMinutes(minutes);

        timeToUse = currentTime.toLocaleString('en-US', {hour: 'numeric', minute: 'numeric', hour12: true});
    }

    var initialCharge = calculateCharge(0); // Assuming initial elapsed time is 0
    var newRow = document.createElement('tr');
    var rows = document.querySelectorAll('.table tbody tr');

    if (rows.length % 2 == 0) {
        newRow.className = 'folio-due even';
    } else {
        newRow.className = 'folio-due odd';
    }
    newRow.innerHTML = `
        <td data-id class="rynum">${RyNumber}</td>
        <td data-time-in>${timeToUse}</td>
        <td data-start-time="${currentTime.getTime()}">0</td>
        <td data-charge>$${initialCharge}</td>
        <td><button class="btn btn-secondary deleteRowBtn">Delete</button></td>
    `;
    return newRow;
}

function calculateCharge(elapsedTime) {
    if (elapsedTime > 0 && elapsedTime <= 3600) {
        return 14;
    } else if (elapsedTime > 3600 && elapsedTime < 7200) {
        return 28;
    } else if (elapsedTime > 7200) {
        return 42;
    }
    return 14;
}

function updateCharges() {
    var rows = document.querySelectorAll('.table tbody tr');

    rows.forEach(row => {
        var startTimeElement = row.querySelector('td[data-start-time]');
        var chargeElement = row.querySelector('td[data-charge]');
        
        if (startTimeElement && chargeElement) {
            var startTime = parseInt(startTimeElement.dataset.startTime, 10);
            var currentTime = new Date().getTime();
            var elapsedSeconds = calculateElapsedTime(new Date(startTime), new Date(currentTime));
            var charge = calculateCharge(elapsedSeconds);
            chargeElement.textContent = "$" + charge; // Update the charge in the <td>
        }
    });
}

//Functions for Time Calculation
function updateElapsedTimes() {
    var rows = document.querySelectorAll('.table tbody tr');
    rows.forEach(row => {
        var startTimeElement = row.querySelector('td[data-start-time]');
        if (startTimeElement) {
            var startTime = parseInt(startTimeElement.dataset.startTime, 10);
            var currentTime = new Date().getTime();
            var elapsed = calculateElapsedTimeFormat(new Date(startTime), new Date(currentTime));
            startTimeElement.textContent = elapsed;
        }
    });
}


function calculateElapsedTimeSinceInputTime(inputTime) {
    var currentTime = new Date().getTime();
    var elapsed = calculateElapsedTimeFormat(new Date(inputTime), new Date(currentTime));
    return elapsed;
}

//Function for Time Calculation
function calculateElapsedTime(startTime, currentTime) {
    var elapsed = currentTime.getTime() - startTime.getTime(); // This will be in milliseconds
    var totalSeconds = Math.floor(elapsed / 1000); // Convert milliseconds to seconds
    return totalSeconds; // Returns elapsed time as an integer representing seconds
}

function calculateElapsedTimeFormat(startTime, currentTime) {
    var elapsed = currentTime.getTime() - startTime.getTime(); // This will be in milliseconds

    var hours = Math.floor(elapsed / 3600000); // Convert milliseconds to hours
    elapsed -= hours * 3600000;

    var minutes = Math.floor(elapsed / 60000); // Convert milliseconds to minutes
    elapsed -= minutes * 60000;

    var seconds = Math.floor(elapsed / 1000); // Convert milliseconds to seconds

    // Format the time components as two-digit strings
    var formattedHours = String(Math.abs(hours)).padStart(2, '0');
    var formattedMinutes = String(Math.abs(minutes)).padStart(2, '0');
    var formattedSeconds = String(Math.abs(seconds)).padStart(2, '0');

    return formattedHours + ':' + formattedMinutes + ':' + formattedSeconds;
}


function calculateElapsedTimeFormatted(startTime, currentTime) {
    // Assuming startTime is a Date object
    var elapsed = currentTime - startTime; // this will be in milliseconds

    // Convert milliseconds to a more readable format (e.g., hours, minutes, seconds)
    var seconds = Math.floor((elapsed / 1000) % 60);
    var minutes = Math.floor((elapsed / (1000 * 60)) % 60);
    var hours = Math.floor((elapsed / (1000 * 60 * 60)) % 24);

    hours = (hours < 10) ? "0" + hours : hours;
    minutes = (minutes < 10) ? "0" + minutes : minutes;
    seconds = (seconds < 10) ? "0" + seconds : seconds;

    return hours + ":" + minutes + ":" + seconds;
}

function saveTableToLocalStorage() {
    var table = document.querySelector('.table tbody');
    localStorage.setItem('tableData', table.innerHTML);
}

function loadRowsFromLocalStorage() {
    var savedRows = localStorage.getItem('tableData');
    if (savedRows) {
        document.querySelector('.table tbody').innerHTML = savedRows;
        updateElapsedTimes(); // Update elapsed times after loading rows
    }
}

function calculateDurationInSeconds(startTime, currentTime) {
    var duration = currentTime - startTime; // Difference in milliseconds
    return Math.floor(duration / 1000); // Convert milliseconds to seconds and return as an integer
}

document.querySelector('.table').addEventListener('click', function(event) {
    
    if (event.target.classList.contains('deleteRowBtn')) {
        var rowToDelete = event.target.parentElement.parentElement;
        rowToDelete.remove();
            var rows = document.querySelectorAll('.table tbody tr');
            rows.forEach((row, index) => {
            row.className = 'folio-due ' + (index % 2 == 0 ? 'even' : 'odd');
            })
        saveTableToLocalStorage(); // Update the local storage
    }
});

document.getElementById("myForm").addEventListener("submit", function(event) {
    event.preventDefault(); // Prevents form submission to a server
    document.getElementById("formContainer").style.display = "none";
});

function resetTable() {
    localStorage.removeItem('tableData');
    document.querySelector('.table tbody').innerHTML = ''; // Set to default state
}

setInterval(function() {
    updateElapsedTimes();
    updateCharges();
}, 1000); // Update every 60,000 milliseconds (1 minute)

function isRYNumberMatching(inputString, specificNumber) {
    // Define a regular expression pattern to match the format "RY#" where '#' is one or more digits.
    var pattern = /^RY(\d+)$/;

    // Use the regular expression to match the input string.
    var match = inputString.match(pattern);

    // If there is a match and the matched integer is equal to the specificNumber, return true.
    if (match && parseInt(match[1]) === specificNumber) {
        return true;
    }

    // If no match or the integer doesn't match, return false.
    return false;
}

function searchTable(searchInput) {
    var lowerCaseSearchInput = searchInput.toLowerCase(); // Convert search input to lower case
    var table = document.querySelector('.table tbody');
    var rows = table.getElementsByTagName('tr');
    var found = false;

    // Hide all rows initially
    for (var i = 0; i < rows.length; i++) {
        rows[i].style.display = 'none';
    }

    document.getElementById('search-result').innerHTML = ''; // Clear previous search results

    for (var i = 0; i < rows.length; i++) {
        var rynumCell = rows[i].getElementsByClassName('rynum')[0];
        if (rynumCell) {
            var rynumValue = rynumCell.textContent || rynumCell.innerText;

            // Extract the numeric part of the rynumValue
            var numericRynumValue = parseInt(rynumValue.replace(/[^\d]/g, ''));

            // Extract the numeric part of the searchValue
            var numericSearchValue = parseInt(searchInput.replace(/[^\d]/g, ''));

            if (numericRynumValue === numericSearchValue) {
                found = true;
                rows[i].style.display = ''; // Show the matching row
                displaySearchResult(rows[i], rynumValue);
                break; // Stop the loop after finding the match
            }
        }
    }

    if (!found) {
        document.getElementById('search-result').innerHTML = 'RY Number: ' + searchInput + ' not found';
    }
}

function displaySearchResult(row, rynumValue) {
    var resultDiv = document.getElementById('search-result');
    var resultRow = row.cloneNode(true); // Clone the row
    var deleteBtnCell = resultRow.querySelector('.deleteRowBtn').parentNode; // Find the delete button's cell
    deleteBtnCell.remove(); // Remove the delete button's cell

    var resultContent = document.createElement('div');

    var charge = row.querySelector('[data-charge]').innerText;
    resultContent.innerHTML = '<strong class="bold-text">' + rynumValue + '</strong>' + ` Current Charge: <strong class="search-text">${charge}</strong> `;
    resultDiv.appendChild(resultContent);

}

// Function to display the confirmation modal
function confirmReset() {
    var modal = document.getElementById('confirmationModal');
    modal.style.display = 'block';
    disableButtons();
}

// Function to close the confirmation modal and cancel the action
function cancelReset() {
    var modal = document.getElementById('confirmationModal');
    modal.style.display = 'none';
    enableButtons();
}

// Function to confirm and perform the reset action
function confirmResetAction() {
    // Close the modal
    var modal = document.getElementById('confirmationModal');
    modal.style.display = 'none';
    resetTable();
    enableButtons();
    // Perform the reset action
}

function disableButtons() {
    // Disable the resetButton
    document.getElementById('addRowButton').disabled = true;
    // Disable the cancelButton
    document.getElementById('delInformation').disabled = true;
    // Disable the search-button
    document.getElementById('search-button').disabled = true;
    // Disable the Submit-form-button
    document.getElementById('submit-form-button').disabled = true;
    // Disable the cancel-form-button
    document.getElementById('cancel-form-button').disabled = true;
}

// Function to enable buttons
function enableButtons() {
    // Enable the resetButton
    document.getElementById('addRowButton').disabled = false;
    // Enable the cancelButton
    document.getElementById('delInformation').disabled = false;
    // Enable the submit-form-button
    document.getElementById('submit-form-button').disabled = false;
    // Enable the cancel-form-button
    document.getElementById('cancel-form-button').disabled = false;
    // Disable the search-button
    document.getElementById('search-button').disabled = false;
}


function resetTableView() {
    var table = document.querySelector('.table tbody');
    var rows = table.getElementsByTagName('tr');

    for (var i = 0; i < rows.length; i++) {
        rows[i].style.display = '';
    }
}

function login() {
    // You can add your authentication logic here
    var username = document.getElementById("username").value;
    var password = document.getElementById("password").value;
    window.location.href = "index.html";

    // Example: Check if username and password match (you should replace this with your actual authentication logic)
    if (username === "Frystaff" && password === "Fry123!") {
        // Redirect to index.html upon successful login
    } else {
        // Display an error message or handle unsuccessful login
        alert("Invalid username or password. Please try again.");
    }
}