// ================= USER & TOKEN =================

const user = JSON.parse(localStorage.getItem("user"));

const token = localStorage.getItem("token");

// If user is not logged in
if (!user) {
  window.location.href = "/login.html";
}

// Store all jobs
let allJobs = [];

// ================= PAGE LOAD =================

document.addEventListener("DOMContentLoaded", () => {

  // Welcome message
  document.getElementById(
    "welcomeUser"
  ).innerText = `Welcome, ${user.name} 👋`;

  // Show user role (if element exists)
  const roleElement = document.getElementById("userRole");

  if (roleElement) {
    roleElement.innerText = `Role : ${user.role}`;
  }

  // Hide Post Job form for JobSeekers
  if (user.role !== "Recruiter") {

    const form = document.getElementById("jobFormBox");

    if (form) {
      form.style.display = "none";
    }
  }

  loadJobs();

});

// ================= LOAD JOBS =================

async function loadJobs() {

  try {

    const res = await fetch("/jobs");

    allJobs = await res.json();

    // Total Jobs Card
    document.getElementById(
      "totalJobs"
    ).innerText = allJobs.length;

    renderJobs(allJobs);

  }

  catch (error) {

    console.log(error);

    alert("Unable to load jobs");

  }

}

// ================= RENDER JOBS =================

function renderJobs(jobs) {

  const container =
    document.getElementById(
      "jobsContainer"
    );

  container.innerHTML = "";

  if (jobs.length === 0) {

    container.innerHTML = `

      <h3>

      No Jobs Available

      </h3>

    `;

    return;
  }

  jobs.forEach(job => {

    container.innerHTML += `

      <div class="job-card">

      <h3>${job.title}</h3>

      <p>🏢 ${job.company}</p>

      <p>📍 ${job.location}</p>

      <p>💰 ${job.salary}</p>

      <p>${job.description}</p>

      ${
        user.role === "Recruiter"

        ?

        `<button onclick="deleteJob('${job._id}')">

        🗑 Delete

        </button>`

        :

        `<button>

        📝 Apply

        </button>`

      }

      </div>

    `;

  });

}

// ================= SEARCH JOBS =================

function searchJobs() {

  const text = document

  .getElementById(
    "searchInput"
  )

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

// ================= POST JOB =================

async function postJob() {

  const title =
  document.getElementById(
    "title"
  ).value.trim();

  const company =
  document.getElementById(
    "company"
  ).value.trim();

  const location =
  document.getElementById(
    "location"
  ).value.trim();

  const salary =
  document.getElementById(
    "salary"
  ).value.trim();

  const description =
  document.getElementById(
    "description"
  ).value.trim();

  if (

    !title ||

    !company ||

    !location ||

    !salary ||

    !description

  ) {

    alert("Please fill all fields");

    return;

  }

  try {

    const res = await fetch(

      "/jobs",

      {

        method: "POST",

        headers: {

          "Content-Type":

          "application/json",

          Authorization:

          `Bearer ${token}`

        },

        body: JSON.stringify({

          title,

          company,

          location,

          salary,

          description

        })

      }

    );

    const data = await res.json();

    alert(data.message);

    if (data.success) {

      // Clear fields

      document.getElementById(
        "title"
      ).value = "";

      document.getElementById(
        "company"
      ).value = "";

      document.getElementById(
        "location"
      ).value = "";

      document.getElementById(
        "salary"
      ).value = "";

      document.getElementById(
        "description"
      ).value = "";

      loadJobs();

    }

  }

  catch (error) {

    console.log(error);

    alert("Unable to post job");

  }

}

// ================= DELETE JOB =================

async function deleteJob(id) {

  try {

    const res = await fetch(

      `/jobs/${id}`,

      {

        method: "DELETE",

        headers: {

          Authorization:

          `Bearer ${token}`

        }

      }

    );

    const data = await res.json();

    alert(data.message);

    loadJobs();

  }

  catch (error) {

    console.log(error);

    alert("Unable to delete job");

  }

}

// ================= LOGOUT =================

function logout() {

  localStorage.clear();

  window.location.href =

  "/login.html";

}