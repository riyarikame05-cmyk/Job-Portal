/* ==========================================================
   JOBPRO DASHBOARD
   PART 1
   AUTH + USER + INITIALIZATION
========================================================== */

console.log("Dashboard Loaded ✅");

/* ==========================================================
   CONFIG
========================================================== */

const API_URL = "http://localhost:3000";

const token = localStorage.getItem("token");

const user = JSON.parse(
    localStorage.getItem("user") || "null"
);

/* ==========================================================
   GLOBAL VARIABLES
========================================================== */

let allJobs = [];
let filteredJobs = [];
let savedJobs = JSON.parse(
    localStorage.getItem("savedJobs") || "[]"
);

/* ==========================================================
   AUTH CHECK
========================================================== */

if (!token) {

    window.location.href = "login.html";

}

/* ==========================================================
   DOM ELEMENTS
========================================================== */

const welcomeUser =
    document.getElementById("welcomeUser");

const userName =
    document.getElementById("userName");

const userRole =
    document.getElementById("userRole");

const totalJobs =
    document.getElementById("totalJobs");

const totalJobsHero =
    document.getElementById("totalJobsHero");

const totalApplications =
    document.getElementById("totalApplications");

const savedCount =
    document.getElementById("savedCount");

const companyTotal =
    document.getElementById("companyTotal");

const companyCount =
    document.getElementById("companyCount");

const applicationCount =
    document.getElementById("applicationCount");

const jobsContainer =
    document.getElementById("jobsContainer");

const loadingJobs =
    document.getElementById("loadingJobs");

const emptyState =
    document.getElementById("emptyState");

const jobFormBox =
    document.getElementById("jobFormBox");

/* ==========================================================
   LOAD USER
========================================================== */

function loadUser() {

    if (!user) return;

    welcomeUser.textContent =
        `Welcome, ${user.name} 👋`;

    userName.textContent =
        user.name;

    userRole.textContent =
        user.role;

    /* Recruiter */

    if (user.role === "Recruiter") {

        jobFormBox.style.display = "block";

    }

    /* Candidate */

    else {

        jobFormBox.style.display = "none";

    }

}

/* ==========================================================
   UPDATE DASHBOARD STATS
========================================================== */

function updateDashboardStats() {

    totalJobs.textContent =
        allJobs.length;

    totalJobsHero.textContent =
        allJobs.length;

    savedCount.textContent =
        savedJobs.length;

    companyTotal.textContent =
        new Set(
            allJobs.map(job => job.company)
        ).size;

    companyCount.textContent =
        new Set(
            allJobs.map(job => job.company)
        ).size;

    applicationCount.textContent =
        Number(
            localStorage.getItem("applications") || 0
        );

    totalApplications.textContent =
        Number(
            localStorage.getItem("applications") || 0
        );

}

/* ==========================================================
   LOADING
========================================================== */

function showLoading() {

    loadingJobs.style.display = "flex";

    emptyState.style.display = "none";

    jobsContainer.innerHTML = "";

}

function hideLoading() {

    loadingJobs.style.display = "none";

}

/* ==========================================================
   INITIALIZE
========================================================== */

document.addEventListener("DOMContentLoaded", () => {

    loadUser();

    showLoading();

    loadJobs();

});
/* ==========================================================
   PART 2
   FETCH JOBS + RENDER JOBS
========================================================== */

/* ==========================================================
   LOAD JOBS
========================================================== */

async function loadJobs() {

    try {

        showLoading();

        const response = await fetch(`${API_URL}/jobs`, {

            headers: {
                Authorization: `Bearer ${token}`
            }

        });

        const data = await response.json();

        if (!response.ok) {

            throw new Error(data.message || "Unable to fetch jobs.");

        }

        allJobs = data.jobs || [];

        filteredJobs = [...allJobs];

        renderJobs(filteredJobs);

        updateDashboardStats();

    }

    catch (error) {

        console.error(error);

        jobsContainer.innerHTML = "";

        emptyState.style.display = "block";

    }

    finally {

        hideLoading();

    }

}


/* ==========================================================
   RENDER JOBS
========================================================== */

function renderJobs(jobs) {

    jobsContainer.innerHTML = "";

    if (!jobs.length) {

        emptyState.style.display = "block";

        return;

    }

    emptyState.style.display = "none";

    jobs.forEach(job => {

        const isSaved = savedJobs.includes(job._id);

        const card = document.createElement("div");

        card.className = "job-card";

        card.innerHTML = `

            <div class="job-header">

                <div class="company-logo">

                    <i class="fa-solid fa-building"></i>

                </div>

                <span class="salary-badge">

                    ${job.salary || "Salary Not Mentioned"}

                </span>

            </div>

            <h3 class="job-title">

                ${job.title}

            </h3>

            <p class="company-name">

                ${job.company}

            </p>

            <div class="job-meta">

                <span>

                    <i class="fa-solid fa-location-dot"></i>

                    ${job.location}

                </span>

            </div>

            <p class="job-description">

                ${job.description}

            </p>

            <div class="job-tags">

                <span>Full Time</span>

                <span>On Site</span>

            </div>

            <div class="job-footer">

                <div class="job-actions">

                    ${
                        user.role === "Recruiter"
                        ?

                        `

                        <button
                            class="edit-btn"
                            onclick="editJob('${job._id}')">

                            Edit

                        </button>

                        <button
                            class="delete-btn"
                            onclick="deleteJob('${job._id}')">

                            Delete

                        </button>

                        `

                        :

                        `

                        <button
                            class="apply-btn"
                            onclick="applyJob('${job._id}')">

                            Apply

                        </button>

                        <button
                            class="save-btn ${isSaved ? "active" : ""}"
                            onclick="saveJob('${job._id}')">

                            <i class="fa-solid fa-bookmark"></i>

                        </button>

                        `

                    }

                </div>

            </div>

        `;

        jobsContainer.appendChild(card);

    });

}
/* ==========================================================
   PART 3
   SEARCH + FILTER + REFRESH
========================================================== */

/* ==========================================================
   SEARCH JOBS
========================================================== */

function searchJobs() {

    const keyword = document
        .getElementById("searchInput")
        .value
        .toLowerCase()
        .trim();

    const searchedJobs = filteredJobs.filter(job => {

        return (

            job.title.toLowerCase().includes(keyword) ||

            job.company.toLowerCase().includes(keyword) ||

            job.location.toLowerCase().includes(keyword) ||

            job.description.toLowerCase().includes(keyword)

        );

    });

    renderJobs(searchedJobs);

}


/* ==========================================================
   CATEGORY FILTER
========================================================== */

const chips = document.querySelectorAll(".chip");

chips.forEach(chip => {

    chip.addEventListener("click", () => {

        chips.forEach(btn =>
            btn.classList.remove("active")
        );

        chip.classList.add("active");

        const category =
            chip.dataset.category.toLowerCase();

        if (category === "all") {

            filteredJobs = [...allJobs];

        }

        else {

            filteredJobs = allJobs.filter(job => {

                return (

                    job.title.toLowerCase().includes(category) ||

                    job.description.toLowerCase().includes(category)

                );

            });

        }

        renderJobs(filteredJobs);

    });

});


/* ==========================================================
   REFRESH DASHBOARD
========================================================== */

async function refreshDashboard() {

    const refreshBtn =
        document.querySelector(".refresh-btn");

    refreshBtn.disabled = true;

    refreshBtn.innerHTML = `

        <i class="fa-solid fa-spinner fa-spin"></i>

        Refreshing...

    `;

    await loadJobs();

    refreshBtn.disabled = false;

    refreshBtn.innerHTML = `

        <i class="fa-solid fa-rotate"></i>

        Refresh

    `;

}


/* ==========================================================
   AUTO REFRESH
========================================================== */

setInterval(() => {

    loadJobs();

}, 60000);


/* ==========================================================
   SEARCH ON ENTER
========================================================== */

document
    .getElementById("searchInput")
    .addEventListener("keyup", searchJobs);
    /* ==========================================================
   PART 4
   APPLY + SAVE + POST + EDIT + DELETE
========================================================== */

/* ==========================================================
   APPLY JOB
========================================================== */

async function applyJob(jobId) {

    try {

        const response = await fetch(`${API_URL}/jobs/${jobId}/apply`, {

            method: "POST",

            headers: {

                "Content-Type": "application/json",

                Authorization: `Bearer ${token}`

            }

        });

        const data = await response.json();

        if (!response.ok) {

            throw new Error(data.message);

        }

        let applied =
            Number(localStorage.getItem("applications") || 0);

        applied++;

        localStorage.setItem("applications", applied);

        updateDashboardStats();

        showToast("Application Submitted Successfully ✅");

        loadJobs();

    }

    catch (error) {

        showToast(error.message || "Unable to Apply");

    }

}


/* ==========================================================
   SAVE JOB
========================================================== */

function saveJob(jobId) {

    if (savedJobs.includes(jobId)) {

        savedJobs = savedJobs.filter(id => id !== jobId);

        showToast("Removed from Saved Jobs");

    }

    else {

        savedJobs.push(jobId);

        showToast("Job Saved Successfully");

    }

    localStorage.setItem(

        "savedJobs",

        JSON.stringify(savedJobs)

    );

    updateDashboardStats();

    renderJobs(filteredJobs);

}


/* ==========================================================
   POST JOB
========================================================== */

async function postJob() {

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

        showToast("Please fill all fields");

        return;

    }

    try {

        const response = await fetch(`${API_URL}/jobs`, {

            method: "POST",

            headers: {

                "Content-Type": "application/json",

                Authorization: `Bearer ${token}`

            },

            body: JSON.stringify({

                title,

                company,

                location,

                salary,

                description

            })

        });

        const data = await response.json();

        if (!response.ok) {

            throw new Error(data.message);

        }

        showToast("Job Posted Successfully 🚀");

        document.getElementById("title").value = "";

        document.getElementById("company").value = "";

        document.getElementById("location").value = "";

        document.getElementById("salary").value = "";

        document.getElementById("description").value = "";

        loadJobs();

    }

    catch (error) {

        showToast(error.message);

    }

}


/* ==========================================================
   EDIT JOB
========================================================== */

function editJob(jobId) {

    const job = allJobs.find(j => j._id === jobId);

    if (!job) return;

    document.getElementById("title").value =
        job.title;

    document.getElementById("company").value =
        job.company;

    document.getElementById("location").value =
        job.location;

    document.getElementById("salary").value =
        job.salary;

    document.getElementById("description").value =
        job.description;

    showToast("Edit the details and Publish Again");

}


/* ==========================================================
   DELETE JOB
========================================================== */

async function deleteJob(jobId) {

    const confirmDelete = confirm(

        "Delete this Job?"

    );

    if (!confirmDelete) return;

    try {

        const response = await fetch(`${API_URL}/jobs/${jobId}`, {

            method: "DELETE",

            headers: {

                Authorization: `Bearer ${token}`

            }

        });

        const data = await response.json();

        if (!response.ok) {

            throw new Error(data.message);

        }

        showToast("Job Deleted Successfully");

        loadJobs();

    }

    catch (error) {

        showToast(error.message);

    }

}
/* ==========================================================
   PART 5
   TOAST + DARK MODE + LOGOUT + UTILITIES
========================================================== */

/* ==========================================================
   TOAST
========================================================== */

function showToast(message, type = "success") {

    const oldToast = document.querySelector(".toast");

    if (oldToast) {

        oldToast.remove();

    }

    const toast = document.createElement("div");

    toast.className = "toast";

    toast.innerHTML = `

        <i class="fa-solid ${
            type === "success"
                ? "fa-circle-check"
                : "fa-circle-xmark"
        }"></i>

        <span>${message}</span>

    `;

    document.body.appendChild(toast);

    setTimeout(() => {

        toast.style.opacity = "0";

        toast.style.transform = "translateX(80px)";

        setTimeout(() => {

            toast.remove();

        }, 300);

    }, 2500);

}


/* ==========================================================
   DARK MODE
========================================================== */

const darkBtn = document.querySelector(".fa-moon");

if (darkBtn) {

    const savedTheme = localStorage.getItem("theme");

    if (savedTheme === "dark") {

        document.body.classList.add("dark");

        darkBtn.classList.remove("fa-moon");

        darkBtn.classList.add("fa-sun");

    }

    darkBtn.parentElement.addEventListener("click", () => {

        document.body.classList.toggle("dark");

        if (document.body.classList.contains("dark")) {

            localStorage.setItem("theme", "dark");

            darkBtn.classList.remove("fa-moon");

            darkBtn.classList.add("fa-sun");

        }

        else {

            localStorage.setItem("theme", "light");

            darkBtn.classList.remove("fa-sun");

            darkBtn.classList.add("fa-moon");

        }

    });

}


/* ==========================================================
   LOGOUT
========================================================== */

function logout() {

    const confirmLogout = confirm(

        "Are you sure you want to logout?"

    );

    if (!confirmLogout) return;

    localStorage.removeItem("token");

    localStorage.removeItem("user");

    showToast("Logged Out Successfully");

    setTimeout(() => {

        window.location.href = "login.html";

    }, 800);

}


/* ==========================================================
   UTILITIES
========================================================== */

function formatSalary(value) {

    if (!value) return "Not Disclosed";

    return value;

}

function capitalize(text) {

    if (!text) return "";

    return text.charAt(0).toUpperCase() +

        text.slice(1);

}


/* ==========================================================
   SCROLL TO TOP
========================================================== */

window.addEventListener("scroll", () => {

    const topBtn = document.getElementById("scrollTop");

    if (!topBtn) return;

    if (window.scrollY > 300) {

        topBtn.classList.add("show");

    }

    else {

        topBtn.classList.remove("show");

    }

});

function scrollToTop() {

    window.scrollTo({

        top: 0,

        behavior: "smooth"

    });

}


/* ==========================================================
   WINDOW ONLINE / OFFLINE
========================================================== */

window.addEventListener("online", () => {

    showToast("Internet Connected");

});

window.addEventListener("offline", () => {

    showToast("No Internet Connection", "error");

});


/* ==========================================================
   FINAL INIT
========================================================== */

console.log("JobPro Dashboard Ready 🚀");