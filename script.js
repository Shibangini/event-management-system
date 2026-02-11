// ================= LOGIN =================
function login(event)
{
    event.preventDefault();

    let username = document.getElementById("username").value;
    let password = document.getElementById("password").value;
    let role = document.getElementById("role").value;

    if(username === "" || password === "")
    {
        alert("Please enter all fields");
        return;
    }

    // Protect admin access
    if(role === "admin" && ( username !== "admin" || password !== "admin123")){
        alert("Invalid admin credentials!");
        return;
    }

    localStorage.setItem("role", role);
    localStorage.setItem("loggedIn", "true");

    if(role === "admin"){
        window.location.href = "admin.html";
    } 
    else{
        window.location.href = "user.html";
    }
}

// ================= LOGOUT =================
function logout()
{
    localStorage.clear();
    window.location.href = "index.html";
}


// ================= ADD MEMBERSHIP =================
function addMembership(event)
{
    event.preventDefault();

    let membershipNumber = document.getElementById("membershipNumber").value;
    let name = document.getElementById("name").value;
    let email = document.getElementById("email").value;
    let phone = document.getElementById("phone").value;

    let duration = document.querySelector('input[name="duration"]:checked').value;

    if(!membershipNumber || !name || !email || !phone)
    {
        alert("All fields are mandatory!");
        return;
    }

    let members = JSON.parse(localStorage.getItem("members")) || [];

    // Duplicate prevention
    let exists = members.some(m => m.membershipNumber === membershipNumber);

    if(exists)
    {
        alert("Membership number already exists!");
        return;
    }

    let member = 
    {
        membershipNumber,
        name,
        email,
        phone,
        duration,
        status: "Active"
    };

    members.push(member);

    localStorage.setItem("members", JSON.stringify(members));

    alert("Member added successfully.");

    window.location.href = "maintenance.html";
}


// ================= LOAD MEMBER =================
let currentIndex = null;

function loadMember()
{

    let membershipNumber = document.getElementById("searchMembershipNumber").value;

    let members = JSON.parse(localStorage.getItem("members")) || [];

    currentIndex = members.findIndex(m => m.membershipNumber === membershipNumber);

    if(currentIndex === -1)
    {
        alert("Membership not found!");
        return;
    }

    let member = members[currentIndex];

    document.getElementById("updateName").value = member.name;
    document.getElementById("updateEmail").value = member.email;
    document.getElementById("updatePhone").value = member.phone;
}



// ================= UPDATE MEMBERSHIP =================
function updateMembership(event)
{
    event.preventDefault();

    let members = JSON.parse(localStorage.getItem("members")) || [];

    if(currentIndex === null)
    {
        alert("Please load a member first.");
        return;
    }

    let extendDuration = document.querySelector('input[name="extendDuration"]:checked').value;

    let cancel = document.getElementById("cancelMembership").checked;

    members[currentIndex].name = document.getElementById("updateName").value;
    members[currentIndex].email = document.getElementById("updateEmail").value;
    members[currentIndex].phone = document.getElementById("updatePhone").value;

    if(cancel)
    {
        members[currentIndex].status = "Cancelled";
    } 
    else
    {
        members[currentIndex].duration = extendDuration;
        members[currentIndex].status = "Active";
    }

    localStorage.setItem("members", JSON.stringify(members));

    alert("Membership updated successfully.");

    window.location.href = "maintenance.html";
}



// ================= REPORTS =================
function loadReports()
{
    let members = JSON.parse(localStorage.getItem("members")) || [];

    let tableBody = document.querySelector("#reportTable tbody");

    if(!tableBody) return;

    tableBody.innerHTML = "";

    members.forEach(member => {

        let row = `
            <tr>
                <td>${member.membershipNumber}</td>
                <td>${member.name}</td>
                <td>${member.email}</td>
                <td>${member.phone}</td>
                <td>${member.duration}</td>
                <td>${member.status}</td>
            </tr>
        `;

        tableBody.innerHTML += row;
    });

}


// ================= TRANSACTIONS =================
function loadTransactions()
{

    let members = JSON.parse(localStorage.getItem("members")) || [];

    let tableBody = document.querySelector("#transactionTable tbody");

    if(!tableBody) return;

    tableBody.innerHTML = "";

    members.forEach(member => {
        let row = `
            <tr>
                <td>${member.membershipNumber}</td>
                <td>${member.name}</td>
                <td>${member.status}</td>
                <td>${member.duration}</td>
            </tr>
        `;

        tableBody.innerHTML += row;
    });

}



// ================= BACK BUTTON =================
function goBack()
{

    let role = localStorage.getItem("role");

    if(role === "admin")
    {
        window.location.href = "admin.html";
    }
    else
    {
        window.location.href = "user.html";
    }
}
