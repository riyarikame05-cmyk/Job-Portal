const user = JSON.parse(localStorage.getItem("user"));
const token = localStorage.getItem("token");

// ================= LOGIN PROTECTION =================
if (!user || !token) {
  window.location.href = "/login.html";
}

// ================= INIT =================
document.addEventListener("DOMContentLoaded", () => {
  setupRoleUI();
  loadJobs();
});

//
// 🔥 ROLE BASED UI
//
function setupRoleUI() {
  if (user.role !== "Recruiter") {
    const form = document.getElementById("jobFormBox");
    if (form) form.style.display = "none";
  }
}

//
// 🔥 LOAD JOBS
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
          ${
            user.role === "Recruiter"
              ? `<button onclick="deleteJob('${job._id}')">Delete</button>`
              : "-"
          }
        </td>
      `;

      tbody.appendChild(row);
    });

  } catch (error) {
    console.log("Error loading jobs:", error);
  }
}

//
// 🔥 POST JOB (ONLY RECRUITER)
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
        "Content-Type": "application/json",
        "Authorization": "Bearer " + token   // 🔥 IMPORTANT FIX
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

      document.getElementById("title").value = "";
      document.getElementById("company").value = "";
      document.getElementById("location").value = "";
      document.getElementById("salary").value = "";
      document.getElementById("description").value = "";

      loadJobs();
    } else {
      alert(data.message || "Failed to post job");
    }

  } catch (error) {
    console.log("Error posting job:", error);
  }
}

//
// 🔥 DELETE JOB (RECRUITER ONLY)
//
async function deleteJob(id) {
  try {
    const res = await fetch(`/jobs/${id}`, {
      method: "DELETE",
      headers: {
        "Authorization": "Bearer " + token   // 🔥 IMPORTANT FIX
      }
    });

    const data = await res.json();

    if (data.success) {
      alert("Job deleted");
      loadJobs();
    } else {
      alert(data.message || "Not allowed");
    }

  } catch (error) {
    console.log("Delete error:", error);
  }
}

//
// 🔥 LOGOUT
//
function logout() {
  localStorage.clear();
  window.location.href = "/login.html";
}