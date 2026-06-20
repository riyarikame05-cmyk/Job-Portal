const user = JSON.parse(localStorage.getItem("user"));

if (!user) {
  window.location.href = "/login.html";
}
// ================= LOGIN PROTECTION =================
const user = localStorage.getItem("user");

if (!user) {
  window.location.href = "/login.html";
}

// ================= INIT =================
document.addEventListener("DOMContentLoaded", () => {

  const user = JSON.parse(localStorage.getItem("user"));

  // if not logged in → redirect
  if (!user) {
    window.location.href = "/login.html";
  }

  // ONLY recruiter sees post job form
  if (user.role !== "Recruiter") {
    const form = document.getElementById("jobFormBox");
    if (form) {
      form.style.display = "none";
    }
  }

  loadJobs();
});

//
// 🔥 LOAD JOBS FROM BACKEND
//
async function loadJobs() {
  try {
    const res = await fetch("/jobs");
    const jobs = await res.json();

    const tbody = document.getElementById("jobTableBody");
    tbody.innerHTML = "";

    jobs.forEach(job => {
      const row = document.createElement("tr");

      row.innerHTML = `
        <td>${job.company}</td>
        <td>${job.title}</td>
        <td>${job.location}</td>
        <td>
          <button onclick="deleteJob('${job._id}')">Delete</button>
        </td>
      `;

      tbody.appendChild(row);
    });

  } catch (error) {
    console.log("Error loading jobs:", error);
  }
}

//
// 🔥 POST NEW JOB
//
async function postJob() {
  const title = document.getElementById("title").value.trim();
  const company = document.getElementById("company").value.trim();
  const location = document.getElementById("location").value.trim();
  const salary = document.getElementById("salary").value.trim();
  const description = document.getElementById("description").value.trim();

  if (!title || !company || !location) {
    alert("Please fill required fields");
    return;
  }

  try {
    const res = await fetch("/jobs", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
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

    if (data.success) {
      alert("Job Posted Successfully 🚀");

      // clear form
      document.getElementById("title").value = "";
      document.getElementById("company").value = "";
      document.getElementById("location").value = "";
      document.getElementById("salary").value = "";
      document.getElementById("description").value = "";

      loadJobs(); // refresh list
    } else {
      alert("Failed to post job");
    }

  } catch (error) {
    console.log("Error posting job:", error);
  }
}

//
// 🔥 DELETE JOB
//
async function deleteJob(id) {
  try {
    const res = await fetch(`/jobs/${id}`, {
      method: "DELETE"
    });

    const data = await res.json();

    if (data.success) {
      alert("Job deleted");
      loadJobs(); // refresh list
    }

  } catch (error) {
    console.log("Delete error:", error);
  }
}

//
// 🔥 LOGOUT
//
function logout() {
  localStorage.removeItem("user");
  window.location.href = "/login.html";
}