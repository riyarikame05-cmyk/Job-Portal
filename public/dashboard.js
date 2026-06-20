const user = JSON.parse(
  localStorage.getItem("user")
);

const token = localStorage.getItem("token");

if (!user) {

  window.location.href = "/login.html";

}

document.addEventListener(
  "DOMContentLoaded",

  () => {

    document.getElementById(
      "welcomeUser"
    ).innerText = `Welcome, ${user.name}`;

    if (user.role !== "Recruiter") {

      document.getElementById(
        "jobFormBox"
      ).style.display = "none";

    }

    loadJobs();

  }

);

let allJobs = [];

async function loadJobs() {

  const res = await fetch("/jobs");

  allJobs = await res.json();

  document.getElementById(
    "totalJobs"
  ).innerText = allJobs.length;

  renderJobs(allJobs);

}

function renderJobs(jobs) {

  const container =
    document.getElementById(
      "jobsContainer"
    );

  container.innerHTML = "";

  jobs.forEach(job => {

    container.innerHTML += `

      <div class="job-card">

      <h3>${job.title}</h3>

      <p><b>🏢</b> ${job.company}</p>

      <p><b>📍</b> ${job.location}</p>

      <p><b>💰</b> ${job.salary}</p>

      <p>${job.description}</p>

      ${user.role === "Recruiter"

      ? `<button onclick="deleteJob('${job._id}')">

      Delete

      </button>`

      : ""

      }

      </div>

    `;

  });

}

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

async function postJob() {

  const title =
  document.getElementById(
    "title"
  ).value;

  const company =
  document.getElementById(
    "company"
  ).value;

  const location =
  document.getElementById(
    "location"
  ).value;

  const salary =
  document.getElementById(
    "salary"
  ).value;

  const description =
  document.getElementById(
    "description"
  ).value;

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

  loadJobs();

}

async function deleteJob(id) {

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

function logout() {

  localStorage.clear();

  window.location.href =

  "/login.html";

}