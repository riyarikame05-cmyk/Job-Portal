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

// ================= LOAD JOBS =================

async function loadJobs() {

    try {

        const response =
            await fetch("/jobs");

        if (!response.ok) {

            throw new Error(
                "Unable to fetch jobs"
            );

        }

        const data =
            await response.json();

        console.log(
            "Jobs API:",
            data
        );

        allJobs =
            data.jobs || [];

        const totalJobs =
            document.getElementById("totalJobs");

        if (totalJobs) {

            totalJobs.innerText =
                allJobs.length;

        }

        renderJobs(allJobs);

    }

    catch (error) {

        console.error(
            "Load Jobs Error:",
            error
        );

        const container =
            document.getElementById("jobsContainer");

        if (container) {

            container.innerHTML = `

            <div class="empty-state">

                <i class="fa-solid fa-circle-exclamation"></i>

                <h2>Unable to Load Jobs</h2>

                <p>Please refresh the page.</p>

            </div>

            `;

        }

    }

}
// ======================================================
// RENDER JOBS
// ======================================================

function renderJobs(jobs) {

    const container =
        document.getElementById("jobsContainer");

    if (!container) return;

    container.innerHTML = "";

    if (!jobs || jobs.length === 0) {

        container.innerHTML = `

        <div class="empty-state">

            <i class="fa-solid fa-briefcase fa-3x"></i>

            <h2>No Jobs Found</h2>

            <p>No jobs are available right now.</p>

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

                return app.userId.toString() === user.id;

            });

        const date =
            job.createdAt
                ? new Date(job.createdAt).toLocaleDateString()
                : "Today";

        container.innerHTML += `

        <div class="job-card">

            <div class="job-header">

                <div>

                    <h3>${job.title}</h3>

                    <h4>${job.company}</h4>

                </div>

                <span class="job-icon">
                    💼
                </span>

            </div>

            <div class="job-info">

                <p>
                    📍 <strong>Location :</strong>
                    ${job.location}
                </p>

                <p>
                    💰 <strong>Salary :</strong>
                    ${job.salary}
                </p>

                <p>
                    📅 <strong>Posted :</strong>
                    ${date}
                </p>

            </div>

            <p class="job-description">

                ${job.description}

            </p>

            <div class="job-actions">

                ${
                    user.role === "Recruiter"

                    ?

                    `

                    <button
                        class="edit-btn"
                        onclick="editJob('${job._id}')">

                        ✏ Edit

                    </button>

                    <button
                        class="delete-btn"
                        onclick="deleteJob('${job._id}')">

                        🗑 Delete

                    </button>

                    `

                    :

                    applied

                    ?

                    `

                    <button disabled>

                        ✅ Applied

                    </button>

                    `

                    :

                    `

                    <button
                        class="apply-btn"
                        onclick="applyJob('${job._id}')">

                        📝 Apply

                    </button>

                    <button
                        class="save-btn"
                        onclick="saveJob('${job._id}')">

                        ❤️ Save

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

function searchJobs() {

    const keyword = document
        .getElementById("searchInput")
        .value
        .toLowerCase()
        .trim();

    if (!keyword) {

        renderJobs(allJobs);

        return;

    }

    const filtered = allJobs.filter(job =>

        (job.title || "")
            .toLowerCase()
            .includes(keyword)

        ||

        (job.company || "")
            .toLowerCase()
            .includes(keyword)

        ||

        (job.location || "")
            .toLowerCase()
            .includes(keyword)

        ||

        (job.salary || "")
            .toLowerCase()
            .includes(keyword)

        ||

        (job.description || "")
            .toLowerCase()
            .includes(keyword)

    );

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

        alert(data.message);

        if (data.success) {

            await refreshDashboard();

        }

    }

    catch(error){

        console.log(error);

        alert("Unable to apply.");

    }

}

// ======================================================
// SAVE JOB
// ======================================================

async function saveJob(id){

    try{

        const response =
        await fetch(`/save/${id}`,{

            method:"POST",

            headers:{

                Authorization:
                `Bearer ${token}`

            }

        });

        const data =
        await response.json();

        alert(data.message);

    }

    catch(error){

        console.log(error);

    }

}
// ======================================================
// POST JOB
// ======================================================

async function postJob() {

    if (user.role !== "Recruiter") {

        alert("Only Recruiters can post jobs.");

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

        alert("Please fill all fields.");

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

        alert(data.message);

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

        alert("Unable to post job.");

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

        alert(data.message);

        await refreshDashboard();

    }

    catch(error){

        console.log(error);

        alert("Unable to update job.");

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

        alert(data.message);

        await refreshDashboard();

    }

    catch(error){

        console.log(error);

        alert("Unable to delete.");

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
// FILTER BUTTONS
// ======================================================

document.addEventListener("DOMContentLoaded", () => {

    const buttons =
        document.querySelectorAll(".filter-buttons button");

    buttons.forEach(button => {

        button.addEventListener("click", () => {

            const keyword =
                button.innerText.toLowerCase();

            const filtered =
                allJobs.filter(job =>

                    (job.title || "")
                    .toLowerCase()
                    .includes(keyword)

                    ||

                    (job.company || "")
                    .toLowerCase()
                    .includes(keyword)

                    ||

                    (job.location || "")
                    .toLowerCase()
                    .includes(keyword)

                    ||

                    (job.description || "")
                    .toLowerCase()
                    .includes(keyword)

                );

            renderJobs(filtered);

        });

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