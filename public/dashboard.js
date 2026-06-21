// ================= USER & TOKEN =================

const user = JSON.parse(localStorage.getItem("user"));
const token = localStorage.getItem("token");

if (!user) {
  window.location.href = "/login.html";
}

let allJobs = [];

// ================= PAGE LOAD =================

document.addEventListener("DOMContentLoaded", () => {

  const hour = new Date().getHours();

  let greeting = "Hello";

  if (hour < 12) greeting = "Good Morning";
  else if (hour < 18) greeting = "Good Afternoon";
  else greeting = "Good Evening";

  document.getElementById("welcomeUser").innerText =
    `${greeting}, ${user.name} 👋`;

  const roleElement = document.getElementById("userRole");
  if (roleElement) {
    roleElement.innerText = `Role : ${user.role}`;
  }

  // Hide job form for job seekers
  if (user.role !== "Recruiter") {
    const form = document.getElementById("jobFormBox");
    if (form) form.style.display = "none";
  }
});

// ================= LOAD JOBS =================

async function loadJobs() {}

async function loadAnalytics() {

  try {

    const res = await fetch("/analytics");
    const data = await res.json();

    document.getElementById("totalJobs").innerText = data.totalJobs;
    document.getElementById("totalApplications").innerText = data.totalApplicants;

  } catch (err) {
    console.log(err);
  }

}


//update apply//
async function applyJob(id) {

  const res = await fetch(`/apply/${id}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  const data = await res.json();

  alert(data.message);

  loadAnalytics();
}

// ================= RENDER JOBS =================

function renderJobs(jobs) {

  const container = document.getElementById("jobsContainer");

  container.innerHTML = "";

  if (jobs.length === 0) {
    container.innerHTML = "<h3>No Jobs Available</h3>";
    return;
  }

  jobs.forEach(job => {

    // check if user already applied
    const alreadyApplied = job.applicants?.some(
      a.userId === user.id || a.userId === user._id
    );

    container.innerHTML += `
      <div class="job-card">

        <h3>${job.title}</h3>
        <p>🏢 ${job.company}</p>
        <p>📍 ${job.location}</p>
        <p>💰 ${job.salary}</p>
        <p>${job.description}</p>

        <p>📅 ${job.createdAt ? new Date(job.createdAt).toLocaleDateString() : "N/A"}</p>

        ${
          user.role === "Recruiter"
            ? `
              <button onclick="editJob('${job._id}')">✏️ Edit</button>
              <button onclick="deleteJob('${job._id}')">🗑 Delete</button>
            `
            : alreadyApplied
              ? `<button disabled>✅ Applied</button>`
              : `<button onclick="applyJob('${job._id}')">📝 Apply</button>`
        }

      </div>
    `;
  });
}
// ================= POST JOB =================

async function postJob() {

  const title = document.getElementById("title").value.trim();
  const company = document.getElementById("company").value.trim();
  const location = document.getElementById("location").value.trim();
  const salary = document.getElementById("salary").value.trim();
  const description = document.getElementById("description").value.trim();

  if (!title || !company || !location || !salary || !description) {
    alert("Please fill all fields");
    return;
  }

  try {

    const res = await fetch("/jobs", {
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

    const data = await res.json();

    alert(data.message);

    if (data.success) {
      document.getElementById("title").value = "";
      document.getElementById("company").value = "";
      document.getElementById("location").value = "";
      document.getElementById("salary").value = "";
      document.getElementById("description").value = "";

      loadJobs();
    }

  } catch (error) {
    console.log(error);
    alert("Unable to post job");
  }
}

// ================= DELETE JOB =================

async function deleteJob(id) {

  try {

    const res = await fetch(`/jobs/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    const data = await res.json();

    alert(data.message);

    loadJobs();

  } catch (error) {
    console.log(error);
    alert("Unable to delete job");
  }
}

// ================= EDIT JOB =================

async function editJob(id) {

  const job = allJobs.find(j => j._id === id);

  if (!job) {
    alert("Job not found");
    return;
  }

  const title = prompt("Edit Title", job.title);
  const company = prompt("Edit Company", job.company);
  const location = prompt("Edit Location", job.location);
  const salary = prompt("Edit Salary", job.salary);
  const description = prompt("Edit Description", job.description);

  if (!title) return;

  try {

    const res = await fetch(`/jobs/${id}`, {
      method: "PUT",
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

    const data = await res.json();

    alert(data.message);

    loadJobs();

  } catch (error) {
    console.log(error);
    alert("Unable to update job");
  }
}


// ================= SEARCH JOBS =================

function searchJobs() {

  const text = document.getElementById("searchInput").value.toLowerCase();

  const filtered = allJobs.filter(job =>
    job.title.toLowerCase().includes(text) ||
    job.company.toLowerCase().includes(text)
  );

  renderJobs(filtered);
}

// ================= SAVED JOBS UI =================

async function showSavedJobs() {

  document.getElementById("jobsContainer").style.display = "none";
  document.getElementById("savedJobsContainer").style.display = "block";
  document.getElementById("savedTitle").style.display = "block";

  try {

    const res = await fetch("/saved-jobs", {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    const data = await res.json();

    if (data.success) {
      renderSavedJobs(data.jobs);
    }

  } catch (err) {
    console.log(err);
  }

}

// ================= RENDER SAVED JOBS =================

function renderSavedJobs(jobs) {

  const container = document.getElementById("savedJobsContainer");

  container.innerHTML = "";

  if (jobs.length === 0) {
    container.innerHTML = "<h3>No Saved Jobs ⭐</h3>";
    return;
  }

  jobs.forEach(job => {

    container.innerHTML += `
      <div class="job-card">

        <h3>${job.title}</h3>
        <p>🏢 ${job.company}</p>
        <p>📍 ${job.location}</p>
        <p>💰 ${job.salary}</p>

        <button onclick="unsaveJob('${job._id}')">
          ❌ Remove
        </button>

      </div>
    `;
  });
}

// ================= UNSAVE JOB =================

async function unsaveJob(id) {

  try {

    const res = await fetch(`/save/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    const data = await res.json();

    alert(data.message);

    showSavedJobs();

  } catch (err) {
    console.log(err);
  }
}

// ================= LOGOUT =================

function logout() {
  localStorage.clear();
  window.location.href = "/login.html";
}