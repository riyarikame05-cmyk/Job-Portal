// ======================================================
// JOB PORTAL DASHBOARD
// PART 1
// ======================================================

console.log("Dashboard Loaded ✅");

// ================= USER =================

const token = localStorage.getItem("token");

const user = JSON.parse(
    localStorage.getItem("user") || "null"
);

let allJobs = [];

// ================= AUTH CHECK =================

if (!token || !user) {

    window.location.href = "/login.html";

}

// ================= PAGE LOAD =================

document.addEventListener("DOMContentLoaded", () => {

    initializeDashboard();

});

// ================= INITIALIZE =================

async function initializeDashboard() {

    showGreeting();

    showUserInfo();

    await loadAnalytics();

    await loadJobs();

}

// ================= GREETING =================

function showGreeting() {

    const welcome =
        document.getElementById("welcomeUser");

    if (!welcome) return;

    const hour =
        new Date().getHours();

    let greeting =
        "Good Evening";

    if (hour < 12) {

        greeting = "Good Morning";

    }

    else if (hour < 18) {

        greeting = "Good Afternoon";

    }

    welcome.innerHTML =
        `${greeting}, ${user.name} 👋`;

}

// ================= USER INFO =================

function showUserInfo() {

    const role =
        document.getElementById("userRole");

    if (role) {

        role.innerHTML = `
            <i class="fa-solid fa-user"></i>
            ${user.role}
        `;

    }

    const form =
        document.getElementById("jobFormBox");

    if (form) {

        if (user.role === "Recruiter") {

            form.style.display = "block";

        }

        else {

            form.style.display = "none";

        }

    }

}

// ================= ANALYTICS =================

async function loadAnalytics() {

    try {

        const response =
            await fetch("/analytics", {

                headers: {

                    Authorization:
                        `Bearer ${token}`

                }

            });

        if (!response.ok) {

            return;

        }

        const data =
            await response.json();

        const totalJobs =
            document.getElementById("totalJobs");

        if (totalJobs) {

            totalJobs.innerText =
                data.totalJobs || 0;

        }

        const totalApplications =
            document.getElementById("totalApplications");

        if (totalApplications) {

            totalApplications.innerText =
                data.totalApplicants || 0;

        }

        const saved =
            document.getElementById("savedCount");

        if (saved) {

            saved.innerText = 0;

        }

    }

    catch (error) {

        console.log(
            "Analytics Error",
            error
        );

    }

}

// ======================================================
// LOAD JOBS (PREMIUM VERSION)
// ======================================================

async function loadJobs() {

    const container = document.getElementById("jobsContainer");

    try {

        // ================= LOADING =================

        if (container) {

            container.innerHTML = `

                <div class="loading-card"></div>
                <div class="loading-card"></div>
                <div class="loading-card"></div>

            `;

        }

        // ================= FETCH =================

        const response = await fetch("/jobs");

        if (!response.ok) {

            throw new Error("Unable to fetch jobs");

        }

        const data = await response.json();

        console.log("Jobs API:", data);

        allJobs = data.jobs || [];

        // ================= TOTAL JOBS =================

        const totalJobs = document.getElementById("totalJobs");

        if (totalJobs) {

            totalJobs.innerText = allJobs.length;

        }

        // ================= EMPTY =================

        if (allJobs.length === 0) {

            if (container) {

                container.innerHTML = `

                    <div class="empty-state">

                        <i class="fa-solid fa-briefcase"></i>

                        <h2>No Jobs Available</h2>

                        <p>Recruiters haven't posted any jobs yet.</p>

                    </div>

                `;

            }

            return;

        }

        // ================= RENDER =================

        renderJobs(allJobs);

    }

    catch (error) {

        console.error("Load Jobs Error:", error);

        if (container) {

            container.innerHTML = `

                <div class="empty-state">

                    <i class="fa-solid fa-circle-exclamation"></i>

                    <h2>Unable to Load Jobs</h2>

                    <p>Please refresh the page and try again.</p>

                </div>

            `;

        }

        // Premium Toast (optional)
        if (typeof showToast === "function") {

            showToast("Unable to load jobs.", "error");

        }

    }

}
// ======================================================
// PREMIUM RENDER JOBS
// ======================================================

function renderJobs(jobs) {

    const container = document.getElementById("jobsContainer");

    if (!container) return;

    container.innerHTML = "";

    if (!jobs || jobs.length === 0) {

        container.innerHTML = `

        <div class="empty-state">

            <i class="fa-solid fa-briefcase"></i>

            <h2>No Jobs Available</h2>

            <p>There are no jobs matching your search.</p>

        </div>

        `;

        return;

    }

    jobs.forEach(job => {

        const applicants =
            Array.isArray(job.applicants)
            ? job.applicants
            : [];

        const applied =
            applicants.some(app => {

                if (!app.userId) return false;

                return app.userId.toString() === user._id;

            });

const companyLetter =
(job.company || "J")
.charAt(0)
.toUpperCase();

let companyColor="#2563eb";

switch((job.company || "").toLowerCase()){

case "google":
companyColor="#EA4335";
break;

case "microsoft":
companyColor="#00A4EF";
break;

case "amazon":
companyColor="#FF9900";
break;

case "apple":
companyColor="#111111";
break;

case "meta":
companyColor="#0866FF";
break;

case "infosys":
companyColor="#007CC3";
break;

case "accenture":
companyColor="#A100FF";
break;

case "tcs":
companyColor="#1976d2";
break;

default:
companyColor="#2563eb";

}

        const postedDate =
            job.createdAt
            ? new Date(job.createdAt).toLocaleDateString()
            : "Today";

        container.innerHTML += `

<div class="job-card">

<div class="job-header">

<div class="company-logo">

${companyLetter}

</div>

<div class="job-title">

<h3>${job.title}</h3>

<p>${job.company}</p>

</div>

<div class="salary-badge">

${job.salary}

</div>

</div>


<div class="job-meta">

<span>

<i class="fa-solid fa-location-dot"></i>

${job.location}

</span>

<span>

<i class="fa-solid fa-calendar"></i>

${postedDate}

</span>

<span>

<i class="fa-solid fa-user-group"></i>

${applicants.length} Applicants

</span>

</div>


<p class="job-description">

${job.description}

</p>


<div class="job-tags">

<span>HTML</span>

<span>CSS</span>

<span>JavaScript</span>

<span>Remote</span>

</div>


<div class="job-footer">

${
user.role === "Recruiter"

?

`

<button
class="edit-btn"
onclick="editJob('${job._id}')">

<i class="fa-solid fa-pen"></i>

Edit

</button>

<button
class="delete-btn"
onclick="deleteJob('${job._id}')">

<i class="fa-solid fa-trash"></i>

Delete

</button>

`

:

applied

?

`

<button
class="applied-btn"
disabled>

<i class="fa-solid fa-circle-check"></i>

Applied

</button>

`

:

`

<button
class="apply-btn"
onclick="applyJob('${job._id}')">

<i class="fa-solid fa-paper-plane"></i>

Apply Now

</button>

<button
class="save-btn"
onclick="saveJob('${job._id}')">

<i class="fa-regular fa-bookmark"></i>

</button>

`

}

</div>

</div>

`;

    });

}

// ======================================================
// SEARCH JOBS
// ======================================================

function searchJobs(){

    const keyword =
        document
        .getElementById("searchInput")
        .value
        .trim()
        .toLowerCase();

    if(!keyword){

        renderJobs(allJobs);

        return;

    }

    const filtered =
    allJobs.filter(job=>{

        return (

            job.title?.toLowerCase().includes(keyword)

            ||

            job.company?.toLowerCase().includes(keyword)

            ||

            job.location?.toLowerCase().includes(keyword)

            ||

            job.salary?.toLowerCase().includes(keyword)

            ||

            job.description?.toLowerCase().includes(keyword)

        );

    });

    renderJobs(filtered);

}

// ======================================================
// REFRESH
// ======================================================

async function refreshDashboard() {

    await loadAnalytics();

    await loadJobs();

}

// ======================================================
// APPLY JOB
// ======================================================

async function applyJob(id) {

    try {

        const response =
            await fetch(`/apply/${id}`, {

                method: "POST",

                headers: {

                    Authorization:
                    `Bearer ${token}`

                }

            });

        const data =
            await response.json();

        showToast(data.message);

        if (data.success) {

            await refreshDashboard();

        }

    }

    catch(error){

        console.log(error);

        showToast("Unable to apply.","error");

    }

}

// ======================================================
// SAVE JOB
// ======================================================

let savedJobs =
JSON.parse(localStorage.getItem("savedJobs")) || [];

function saveJob(jobId){

    if(savedJobs.includes(jobId)){

        savedJobs =
        savedJobs.filter(id => id !== jobId);

        showToast("Job removed from Saved");

    }

    else{

        savedJobs.push(jobId);

        showToast("Job Saved Successfully");

    }

    localStorage.setItem(
        "savedJobs",
        JSON.stringify(savedJobs)
    );

    document.getElementById("savedCount").innerText =
    savedJobs.length;

    renderJobs(allJobs);

}
// ======================================================
// POST JOB
// ======================================================

async function postJob() {

if (user.role !== "Recruiter") {

    showToast("Only Recruiters can post jobs.", "error");

    return;

}

    const title =
        document.getElementById("title").value.trim();

    const company =
        document.getElementById("company").value.trim();

    const location =
        document.getElementById("location").value.trim();

    const salary =
        document.getElementById("salary").value.trim();

    const description =
        document.getElementById("description").value.trim();

    if (
        !title ||
        !company ||
        !location ||
        !salary ||
        !description
    ) {

        showToast("Please fill all fields.", "error");

        return;

    }

    try {

        const response =
        await fetch("/jobs",{

            method:"POST",

            headers:{

                "Content-Type":"application/json",

                Authorization:`Bearer ${token}`

            },

            body:JSON.stringify({

                title,
                company,
                location,
                salary,
                description

            })

        });

        const data =
        await response.json();

        showToast(data.message);

        if(data.success){

            document.getElementById("title").value="";
            document.getElementById("company").value="";
            document.getElementById("location").value="";
            document.getElementById("salary").value="";
            document.getElementById("description").value="";

            await refreshDashboard();

        }

    }

    catch(error){

        console.log(error);

        showToast("Unable to post job.", "error");

    }

}

// ======================================================
// EDIT JOB
// ======================================================

async function editJob(id){

    const job =
    allJobs.find(j=>j._id===id);

    if(!job) return;

    const title =
    prompt("Title",job.title);

    if(title===null) return;

    const company =
    prompt("Company",job.company);

    const location =
    prompt("Location",job.location);

    const salary =
    prompt("Salary",job.salary);

    const description =
    prompt("Description",job.description);

    try{

        const response =
        await fetch(`/jobs/${id}`,{

            method:"PUT",

            headers:{

                "Content-Type":"application/json",

                Authorization:`Bearer ${token}`

            },

            body:JSON.stringify({

                title,
                company,
                location,
                salary,
                description

            })

        });

        const data =
        await response.json();

        showToast(data.message);

        await refreshDashboard();

    }

    catch(error){

        console.log(error);

        showToast("Unable to update job.", "error");

    }

}

// ======================================================
// DELETE JOB
// ======================================================

async function deleteJob(id){

    const confirmDelete =
    confirm("Delete this job?");

    if(!confirmDelete) return;

    try{

        const response =
        await fetch(`/jobs/${id}`,{

            method:"DELETE",

            headers:{

                Authorization:`Bearer ${token}`

            }

        });

        const data =
        await response.json();

        showToast(data.message);

        await refreshDashboard();

    }

    catch(error){

        console.log(error);

        showToast("Unable to delete job.", "error");

    }

}

// ======================================================
// LOGOUT
// ======================================================

function logout(){

    localStorage.removeItem("token");

    localStorage.removeItem("user");

    window.location.href="/login.html";

}
// ======================================================
// PREMIUM FILTERS
// ======================================================

document.querySelectorAll(".chip").forEach(chip => {

    chip.addEventListener("click", () => {

        document
            .querySelectorAll(".chip")
            .forEach(c => c.classList.remove("active"));

        chip.classList.add("active");

        const keyword =
            chip.innerText.trim().toLowerCase();

        if (keyword === "all") {

            renderJobs(allJobs);

            return;

        }

        const filtered = allJobs.filter(job => {

            const text = `
                ${job.title}
                ${job.company}
                ${job.location}
                ${job.description}
            `.toLowerCase();

            return text.includes(keyword);

        });

        renderJobs(filtered);

    });

});

// ======================================================
// VIEW ALL
// ======================================================

const viewAll =
    document.querySelector(".view-all");

if (viewAll) {

    viewAll.addEventListener("click", () => {

        renderJobs(allJobs);

    });

}

// ======================================================
// GLOBAL FUNCTIONS
// ======================================================

window.postJob = postJob;
window.editJob = editJob;
window.deleteJob = deleteJob;
window.applyJob = applyJob;
window.saveJob = saveJob;
window.searchJobs = searchJobs;
window.logout = logout;

// ======================================================
// FINAL
// ======================================================

console.log("Dashboard Ready ✅");
// ======================================================
// PREMIUM TOAST
// ======================================================

function showToast(message, type = "success") {

    let toast = document.getElementById("toast");

    if (!toast) {

        toast = document.createElement("div");

        toast.id = "toast";

        document.body.appendChild(toast);

    }

    toast.className = `toast ${type}`;

    toast.innerHTML = `
        <i class="fa-solid ${
            type === "success"
            ? "fa-circle-check"
            : "fa-circle-exclamation"
        }"></i>
        ${message}
    `;

    toast.classList.add("show");

    setTimeout(() => {

        toast.classList.remove("show");

    }, 3000);

}
// ======================================================
// DARK MODE
// ======================================================

const darkButton =
document.querySelector(".fa-moon");

if(darkButton){

darkButton.parentElement.onclick=()=>{

document.body.classList.toggle("dark");

localStorage.setItem(

"darkMode",

document.body.classList.contains("dark")

);

};

}

if(localStorage.getItem("darkMode")==="true"){

document.body.classList.add("dark");

}
// ======================================================
// NOTIFICATION BADGE
// ======================================================

function updateNotificationBadge(){

const bell=document.querySelector(".icon-btn");

if(!bell) return;

let badge=
document.querySelector(".notification-badge");

if(!badge){

badge=document.createElement("span");

badge.className="notification-badge";

bell.style.position="relative";

bell.appendChild(badge);

}

badge.innerText=allJobs.length;

}

updateNotificationBadge();
// ======================================================
// PROFILE CLICK
// ======================================================

const profile =
document.querySelector(".profile-box");

if(profile){

profile.style.cursor="pointer";

profile.onclick=()=>{

showToast(

`${user.name}
(${user.role})`

);

};

}
// ======================================================
// WELCOME
// ======================================================

window.addEventListener("load",()=>{

document.querySelectorAll(

".dashboard-card,.job-card,.company-card"

).forEach((card,index)=>{

card.style.opacity="0";

card.style.transform="translateY(25px)";

setTimeout(()=>{

card.style.transition=".5s";

card.style.opacity="1";

card.style.transform="translateY(0)";

},index*80);

});

});
// ======================================================
// AUTO REFRESH
// ======================================================

setInterval(()=>{

loadJobs();

},60000);