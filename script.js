// ================= LOGIN =================
function login(event)
{
    event.preventDefault();

    let username = document.getElementById("username").value;
    let password = document.getElementById("password").value;
    let role = document.getElementById("role").value;
    let userEmailInput = document.getElementById("userEmail");
    

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

    // User login check (simple)
    if(role === "user")
    {
        if(!userEmailInput || userEmailInput.value === "")
        {
            alert("Please enter your email to login.");
            return;
        }

        let members = JSON.parse(localStorage.getItem("members")) || [];
        let found = null;
        let i;
        for(i = 0; i < members.length; i++)
        {
            if(members[i].email === userEmailInput.value)
            {
                found = members[i];
                break;
            }
        }

        if(!found)
        {
            alert("No membership found for this email.");
            return;
        }

        localStorage.setItem("currentUserEmail", found.email);
        localStorage.setItem("currentUserMembershipNumber", found.membershipNumber);
    }
    else
    {
        localStorage.removeItem("currentUserEmail");
        localStorage.removeItem("currentUserMembershipNumber");
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
    localStorage.removeItem("loggedIn");
    localStorage.removeItem("role");
    localStorage.removeItem("currentUserEmail");
    localStorage.removeItem("currentUserMembershipNumber");
    window.location.href = "index.html";
}


// ================= PRICING HELPERS =================
function getAmountForDuration(duration)
{
    if(duration === "6 months") return 999;
    if(duration === "1 year") return 1399;
    if(duration === "2 years") return 2499;
    return 0;
}

function getSelectedDuration(radioName)
{
    let radios = document.getElementsByName(radioName);
    let i;
    for(i = 0; i < radios.length; i++)
    {
        if(radios[i].checked)
        {
            return radios[i].value;
        }
    }
    return "";
}

function updateFeeDisplay(duration, feeElementId)
{
    let amount = getAmountForDuration(duration);
    let feeEl = document.getElementById(feeElementId);
    if(feeEl)
    {
        feeEl.textContent = "Membership Fee: ₹" + amount;
    }
    return amount;
}

function setupFeeAutoUpdate(radioName, feeElementId)
{
    let radios = document.getElementsByName(radioName);
    if(!radios || radios.length === 0) return;

    let i;
    for(i = 0; i < radios.length; i++)
    {
        radios[i].addEventListener("change", function(){
            let duration = getSelectedDuration(radioName);
            updateFeeDisplay(duration, feeElementId);
        });
    }

    // Set initial fee on page load
    updateFeeDisplay(getSelectedDuration(radioName), feeElementId);
}

function setDurationRadio(radioName, value)
{
    let radios = document.getElementsByName(radioName);
    let i;
    for(i = 0; i < radios.length; i++)
    {
        radios[i].checked = (radios[i].value === value);
    }
}

document.addEventListener("DOMContentLoaded", function(){
    setupFeeAutoUpdate("duration", "membershipFee");
    setupFeeAutoUpdate("extendDuration", "updateFee");
});


// ================= ADD MEMBERSHIP =================
function addMembership(event)
{
    event.preventDefault();

    let membershipNumber = document.getElementById("membershipNumber").value;
    let name = document.getElementById("name").value;
    let email = document.getElementById("email").value;
    let phone = document.getElementById("phone").value;
    let duration = getSelectedDuration("duration");
    let amount = getAmountForDuration(duration);
    let paymentCompleted = document.getElementById("paymentCompleted");
    let autoRenewBox = document.getElementById("autoRenew");

    if(!membershipNumber || !name || !email || !phone || !duration)
    {
        alert("All fields are mandatory!");
        return;
    }

    if(!paymentCompleted || !paymentCompleted.checked)
    {
        alert("Please complete the payment before registration.");
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

    let member = {
        membershipNumber: membershipNumber,
        name: name,
        email: email,
        phone: phone,
        duration: duration,
        amount: amount,
        paymentStatus: "Paid",
        autoRenew: autoRenewBox ? autoRenewBox.checked : false,
        status: "Active",
        paymentDate: new Date().toLocaleDateString()
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
    setDurationRadio("extendDuration", member.duration);
    updateFeeDisplay(member.duration, "updateFee");
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

    let extendDuration = getSelectedDuration("extendDuration");
    let updatedAmount = getAmountForDuration(extendDuration);
    let paymentCompleted = document.getElementById("updatePaymentCompleted");
    let autoRenewBox = document.getElementById("updateAutoRenew");

    let cancel = document.getElementById("cancelMembership").checked;

    members[currentIndex].name = document.getElementById("updateName").value;
    members[currentIndex].email = document.getElementById("updateEmail").value;
    members[currentIndex].phone = document.getElementById("updatePhone").value;

    if(cancel && paymentCompleted && paymentCompleted.checked)
    {
        alert("Please choose either Cancel Membership or Payment Completed.");
        return;
    }

    if(cancel)
    {
        members[currentIndex].status = "Cancelled";
    } 
    else
    {
        if(!paymentCompleted || !paymentCompleted.checked)
        {
            alert("Please complete the payment before registration.");
            return;
        }
        members[currentIndex].duration = extendDuration;
        members[currentIndex].amount = updatedAmount;
        members[currentIndex].paymentStatus = "Paid";
        members[currentIndex].paymentDate = new Date().toLocaleDateString();
        members[currentIndex].autoRenew = autoRenewBox ? autoRenewBox.checked : false;
        members[currentIndex].status = "Active";
    }

    localStorage.setItem("members", JSON.stringify(members));

    alert("Membership updated successfully.");

    window.location.href = "maintenance.html";
}



// REPORTS
function loadReports()
{
    let members = JSON.parse(localStorage.getItem("members")) || [];
    let role = localStorage.getItem("role");
    let currentUserEmail = localStorage.getItem("currentUserEmail");

    let tableBody = document.querySelector("#reportTable tbody");

    if(!tableBody) return;

    tableBody.innerHTML = "";

    if(role === "user" && currentUserEmail)
    {
        let filtered = [];
        let i;
        for(i = 0; i < members.length; i++)
        {
            if(members[i].email === currentUserEmail)
            {
                filtered.push(members[i]);
            }
        }
        members = filtered;
    }

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
    let role = localStorage.getItem("role");
    let currentUserEmail = localStorage.getItem("currentUserEmail");

    let tableBody = document.querySelector("#transactionTable tbody");

    if(!tableBody) return;

    tableBody.innerHTML = "";

    if(role === "user" && currentUserEmail)
    {
        let filtered = [];
        let i;
        for(i = 0; i < members.length; i++)
        {
            if(members[i].email === currentUserEmail)
            {
                filtered.push(members[i]);
            }
        }
        members = filtered;
    }

    members.forEach(member => {
        let amount = member.amount || 0;
        let paymentStatus = member.paymentStatus || "Paid";
        let paymentDate = member.paymentDate || "";
        let autoRenewText = member.autoRenew ? "Yes" : "No";
        let row = `
        <tr>
            <td>${member.membershipNumber}</td>
            <td>${member.name}</td>
            <td>${amount}</td>
            <td>${paymentStatus}</td>
            <td>${paymentDate}</td>
            <td>${autoRenewText}</td>
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
