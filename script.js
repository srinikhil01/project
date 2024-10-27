let linkedSubmodules = [];

// Submodules for different prefixes
const submoduleData = {
    "COM": ["PROCESSOR", "BASE PCB", "INTERFACE PCB", "MXM MODULE", "POWER SUPPLY MODULE", "mSATA", "SATA-1", "SATA-2"],
    "PSP": ["PROCESSOR", "BASE PCB", "INTERFACE PCB", "sFPDP", "MXM MODULE", "POWER SUPPLY MODULE", "mSATA", "SATA-1", "SATA-2"] // 9 submodules for PSP
};

function login() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    // Admin credentials
    if (username === "admin" && password === "admin123") {
        document.querySelector('.login').style.display = 'none';
        document.getElementById('button-container').style.display = 'flex';
        document.getElementById('linkButton').style.display = 'inline-block'; // Show the Link button for admin
    
        document.body.style.backgroundImage="url('Welcome_Background.jpg')";
        document.body.style.backgroundSize="cover";
        document.body.style.backgroundPosition="center";
    }
    // User credentials
    else if (username === "user" && password === "user123") {
        document.querySelector('.login').style.display = 'none';
        document.getElementById('button-container').style.display = 'flex';
        document.getElementById('linkButton').style.display = 'none'; // Hide the Link button for normal users
    
        document.body.style.backgroundImage="url('Welcome_Background_User.jpg')";
        document.body.style.backgroundSize="cover";
        document.body.style.backgroundPosition="center";
    } else {
        alert('Invalid username or password');
    }
}

function showLinkPage() {
    document.body.style.backgroundImage="url('Link_Background.jpg')";
    document.body.style.backgroundSize="cover";
    document.body.style.backgroundPosition="center";
    document.getElementById('button-container').style.display = 'none';
    document.getElementById('link-page').style.display = 'flex';
}
function showUploadForm() {
    document.body.style.backgroundImage="url('Upload_Background.png')";
    document.body.style.backgroundSize="cover";
    document.body.style.backgroundPosition="center";
    document.getElementById('button-container').style.display = 'none';
    document.getElementById('upload-form').style.display = 'flex';
}
function showRetrieveForm() {
    document.body.style.backgroundImage="url('Retreival_Background.jpg')";
    document.body.style.backgroundSize="cover";
    document.body.style.backgroundPosition="center";
    document.getElementById('button-container').style.display = 'none';
    document.getElementById('retrieve-form').style.display = 'flex';
}
function goBack() {
    document.body.style.backgroundImage="url('Welcome_Background.jpg')";
    document.body.style.backgroundSize="cover";
    document.body.style.backgroundPosition="center";
    const uploadForm = document.getElementById('upload-form');
    const retrieveForm = document.getElementById('retrieve-form');
	 document.getElementById('retrieved-data-display').style.display = 'none';
	 document.getElementById('retrieve-form').style.display = 'block';
    const buttonContainer = document.getElementById('button-container');

    // Hide both upload and retrieval forms
    uploadForm.style.display = 'none';
    retrieveForm.style.display = 'none';

    // Show the button container when going back from any form
    buttonContainer.style.display = 'flex';
}

function showModulePage() {
    const mainQrCode = document.getElementById('mainQrCode').value;
    const prefix = mainQrCode.substring(0, 3);
    linkedSubmodules = []; // Clear old data
    if (submoduleData[prefix]) {
        // Pass the entered Main QR Code to the Subsystem Modules Page
        document.getElementById('displayMainQrCode').value = mainQrCode;

        document.getElementById('link-page').style.display = 'none';
        document.getElementById('subsystem-page').style.display = 'flex';

        generateTable(prefix); // Pass the prefix to generateTable
    } else {
        alert('Invalid QR Code prefix. Expected "COM" or "PSP".');
    }
}

function generateTable(prefix) {
    document.body.style.backgroundImage="url('Link_Background.jpg')";
        document.body.style.backgroundSize="cover";
        document.body.style.backgroundPosition="center";
    let tableBody = document.getElementById('subsystemTableBody');
    tableBody.innerHTML = '';  // Clear previous rows

    const submodules = submoduleData[prefix];

    for (let i = 0; i < submodules.length; i++) {
        let row = `
        <tr>
            <td>${submodules[i]}</td>
            <td><input type="text" id="subQrCode${i}" placeholder="Enter Subsystem QR Code"></td>
            <td>
                <input type="file" id="fileUpload${i}"> <!-- File Upload -->
            </td>
            <td><input type="text" id="remarks${i}" placeholder="Remarks"></td>
            <td>
                <button onclick="linkSubsystem(${i})">Link</button>
                <span id="linkMsg${i}" style="color:green;"></span>
            </td>
        </tr>`;
        tableBody.innerHTML += row;
    }
}
function linkSubsystem(row) {
    const mainQrCode = document.getElementById('displayMainQrCode').value;
    const subQrCode = document.getElementById(`subQrCode${row}`).value;
    const remarks = document.getElementById(`remarks${row}`).value;
    const submoduleName = document.querySelector(`#subsystemTableBody tr:nth-child(${row + 1}) td:first-child`).innerText;

    const fileInput = document.getElementById(`fileUpload${row}`);
    const files = fileInput.files; // Get the selected files

    if (subQrCode && files.length > 0) {
        const formData = new FormData();
        formData.append('mainQrCode', mainQrCode);
        formData.append('submoduleName', submoduleName);
        formData.append('subQrCode', subQrCode);
        formData.append('remarks', remarks);
        formData.append('status', 'Linked');

        // Loop through all selected files and append each to FormData
        for (let i = 0; i < files.length; i++) {
            formData.append('files[]', files[i]); // Append each file with a name like files[]
        }

        // Fetch request to the PHP script to handle the insertion
        fetch('latestphp.php', {
            method: 'POST',
            body: formData // Send FormData, not JSON
        })
        .then(response => response.json())
        .then(result => {
            if (result.status === 'success') {
                document.getElementById(`linkMsg${row}`).textContent = "Linked";
                linkedSubmodules.push({ submoduleName, qrCode: subQrCode, remarks, status: "Linked", files: result.filePaths });
            } else {
                alert('Error saving data: ' + result.message);
            }
        })
        .catch(error => {
            console.error('Error:', error);
        });
    } else {
        alert('Please enter Subsystem QR Code and upload at least one file.');
    }
}


// New function to handle saving the data to the server
function saveLinkedDataToServer(mainQrCode, linkedSubmodules) {
    const data = {
        mainQrCode: mainQrCode,
        linkedSubmodules: linkedSubmodules
    };

    fetch('latestphp.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(result => {
        if (result.status === 'success') {
            alert('Data saved successfully');
        } else {
            alert('Error saving data: ' + result.message);
        }
    })
    .catch(error => {
        console.error('Error:', error);
    });
}

function goBackToWelcome() {
    document.body.style.backgroundImage="url('Welcome_Background.jpg')";
    document.body.style.backgroundSize="cover";
    document.body.style.backgroundPosition="center";
    document.getElementById('link-page').style.display = 'none';
    document.getElementById('button-container').style.display = 'flex';
}

function goBackToLink() {
    document.getElementById('subsystem-page').style.display = 'none';
    document.getElementById('subsystem-display-page').style.display = 'none';
    document.getElementById('link-page').style.display = 'flex';
}

function showLoginPage() {
    document.body.style.backgroundImage="url('Login_Background.png')";
    document.body.style.backgroundSize="cover";
    document.body.style.backgroundPosition="center";
    document.getElementById('button-container').style.display = 'none';
    document.querySelector('.login').style.display = 'flex';
}

// Function to show the input field and display stored data
function showQrCodeInput() {
    document.getElementById('link-page').style.display = 'none'; // Hide the buttons
    document.getElementById('qrCodeInputContainer').style.display = 'block'; // Show the input field
}

// Function to hide QR code input field
function hideQrCodeInput() {
    document.getElementById('qrCodeInputContainer').style.display = 'none'; // Hide the input field
    document.getElementById('button-container').style.display = 'flex'; // Show the buttons again
}

// Function to display linked submodules from the database
function displayLinkedSubmodules() {
    const mainQrCode = document.getElementById('mainQrCodeInput').value;

    if (!mainQrCode) {
        alert("Please enter the Main System QR Code.");
        return; // Exit if no QR Code is provided
    }

    // Send a request to the server to fetch submodules for this main QR code
    fetch('latestphp.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded' // Use URL encoded for form POST data
        },
        body: `mainQrCode=${encodeURIComponent(mainQrCode)}` // Send the Main QR Code
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'success') {
            document.getElementById('qrCodeInputContainer').style.display = 'none'; // Hide the input field
            document.getElementById('subsystem-display-page').style.display = 'flex'; // Show the results page

            let displayTableBody = document.getElementById('subsystemDisplayTableBody');
            displayTableBody.innerHTML = '';  // Clear previous rows

            // Display the fetched submodules, including the file path and other details
            data.submodules.forEach((module, index) => {
                let fileLink = module.file_path ? `<a href="${module.file_path}" target="_blank">View File</a>` : 'No file';
                let row = `
                <tr>
                    <td>${module.submodule_name}</td>
                    <td><input type="text" value="${module.sub_qr_code}" disabled></td>
                    <td>${fileLink}</td> <!-- Display file link -->
                    <td><input type="text" value="${module.remarks}" disabled></td>
                    <td><input type="text" value="${module.status}" disabled></td>
                    <td><input type="text" value="${module.saved_at}" disabled></td>
                </tr>`;
                displayTableBody.innerHTML += row;
            });
        } else {
            alert(data.message);
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('An error occurred while fetching submodules.');
    });
}


function displayRetrievedData() {
    const retrieveQrCode = document.getElementById('retrieve-qrcode').value;

    if (!retrieveQrCode) {
        alert("Please enter a valid QR Code.");
        return; // Exit if no QR Code is provided
    }

    // Send a request to the server to fetch data for this QR code
    fetch('retrieve.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded' // Use URL encoded for form POST data
        },
        body: `retrieveQrCode=${encodeURIComponent(retrieveQrCode)}` // Send the QR Code to server
    })
    .then(response => {
        // Log the raw response to see if it's a JSON issue
        console.log('Raw response:', response);
        return response.json(); // Attempt to parse it as JSON
    })
    .then(data => {
        console.log('Parsed data:', data);  // Log the parsed data
        if (data.status === 'success') {
            document.getElementById('retrieve-form').style.display = 'none'; // Hide the input form
            document.getElementById('retrieved-data-display').style.display = 'flex'; // Show the results page

            let displayTableBody = document.getElementById('retrievedDataTableBody');
            displayTableBody.innerHTML = '';  // Clear previous rows

            // Display the fetched data, including the file path and other details
            let row = `
            <tr>
                <td>${data.test_stage}</td>
                <td>${data.problem_faced}</td>
                <td>${data.solution}</td>
                <td>${data.remarks}</td>
                <td>${data.file_link}</td> <!-- Use the file_link from the response -->
                <td>${data.timestamp}</td>
            </tr>`;
            displayTableBody.innerHTML += row;

        } else {
            alert(data.message);
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('An error occurred while retrieving data.');
    });
}

