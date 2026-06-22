// ================= USER & TOKEN =================

const user = JSON.parse(localStorage.getItem("user") || "null");
const token = localStorage.getItem("token");

if (!user || !token) {
  window.location.href = "/login.html";
}

let allJobs = [];
console.log("Jobs function called");

document.addEventListener("DOMContentLoaded", () => {

  const hour = new Date().getHours();

  let greeting = "Hello";

  if (hour < 12) {

    greeting = "Good Morning";

  }

  else if (hour < 18) {

    greeting = "Good Afternoon";

  }

  else {

    greeting = "Good Evening";

  }

document.getElementById("welcomeUser").innerText = 

  // Employee ke liye Post Job hide

  if (user.role !== "Recruiter") {

    const form = document.getElementById("jobFormBox");

    if (form) {

      form.style.display = "none";

    }

  }

  loadJobs();

  loadAnalytics();

});


// ================= ANALYTICS =================

async function loadAnalytics() {

  try {

    const res = await fetch("/analytics");

    const data = await res.json();

    document.getElementById("totalJobs").innerText =
      data.totalJobs || 0;

    document.getElementById("totalApplications").innerText =
      data.totalApplicants || 0;

  }

  catch (err) {

    console.log(err);

  }

}


// ================= LOAD JOBS =================

async function loadJobs() {

  try {

    const res = await fetch("/jobs");

    allJobs = await res.json();

    renderJobs(allJobs);

  }

  catch (err) {

    console.log(err);

  }

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

    const alreadyApplied = job.applicants?.some(

      a => a.userId === user.id

    );

    container.innerHTML += `

      <div class="job-card">

        <h3>${job.title}</h3>

        <p>🏢 ${job.company}</p>

        <p>📍 ${job.location}</p>

        <p>💰 ${job.salary}</p>

        <p>${job.description}</p>

        <p>📅 ${new Date(job.createdAt).toLocaleDateString()}</p>

        ${

          user.role === "Recruiter"

          ?

          `

          <button onclick="editJob('${job._id}')">

            ✏️ Edit

          </button>

          <button onclick="deleteJob('${job._id}')">

            🗑 Delete

          </button>

          `

          :

          alreadyApplied

          ?

          `

          <button disabled>

            ✅ Applied

          </button>

          `

          :

          `

          <button onclick="applyJob('${job._id}')">

            📝 Apply

          </button>

          `

        }

      </div>

    `;

  });

}


// ================= APPLY JOB =================

async function applyJob(id) {

  try {

    const res = await fetch(`/apply/${id}`, {

      method: "POST",

      headers: {

        Authorization: `Bearer ${token}`

      }

    });

    const data = await res.json();

    alert(data.message);

    loadJobs();

    loadAnalytics();

  }

  catch (err) {

    console.log(err);

  }

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

      loadAnalytics();

    }

  }

  catch (err) {

    console.log(err);

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

    loadAnalytics();

  }

  catch (err) {

    console.log(err);

  }

}


// ================= EDIT JOB =================

async function editJob(id) {

  const job = allJobs.find(

    j => j._id === id

  );

  if (!job) {

    return;

  }

  const title = prompt("Title", job.title);

  const company = prompt("Company", job.company);

  const location = prompt("Location", job.location);

  const salary = prompt("Salary", job.salary);

  const description = prompt("Description", job.description);

  if (!title) {

    return;

  }

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

  }

  catch (err) {

    console.log(err);

  }

}


// ================= SEARCH =================

function searchJobs() {

  const text = document

    .getElementById("searchInput")

    .value

    .toLowerCase();

  const filtered = allJobs.filter(

    job =>

      job.title.toLowerCase().includes(text)

      ||

      job.company.toLowerCase().includes(text)

  );

  renderJobs(filtered);

}


// ================= LOGOUT =================

function logout() {

  localStorage.clear();

  window.location.href = "/login.html";

}