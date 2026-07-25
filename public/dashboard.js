// ===========================================
// JOB PORTAL DASHBOARD
// Created by Riya Rikame
// ===========================================

console.log("Dashboard Loaded");

// ===========================================
// USER DATA
// ===========================================

const token = localStorage.getItem("token");

const user = JSON.parse(
    localStorage.getItem("user") || "null"
);

let allJobs = [];

// ===========================================
// AUTH CHECK
// ===========================================

if (!token || !user){

    window.location.href="/login.html";

}

// ===========================================
// PAGE LOAD
// ===========================================

document.addEventListener("DOMContentLoaded",()=>{

    initializeDashboard();

});

// ===========================================
// INITIALIZE DASHBOARD
// ===========================================

async function initializeDashboard(){

    showGreeting();

    showUserInfo();

    await loadAnalytics();

    await loadJobs();

}

// ===========================================
// GREETING
// ===========================================

function showGreeting(){

    const hour=new Date().getHours();

    let greeting="Good Evening";

    if(hour<12){

        greeting="Good Morning";

    }

    else if(hour<18){

        greeting="Good Afternoon";

    }

    const welcome=document.getElementById("welcomeUser");

    if(welcome){

        welcome.innerHTML=`

            ${greeting}, ${user.name} 👋

        `;

    }

}

// ===========================================
// USER INFO
// ===========================================

function showUserInfo(){

    const role=document.getElementById("userRole");

    if(role){

        role.innerHTML=`

            <i class="fa-solid fa-user"></i>

            ${user.role}

        `;

    }

    if(user.role!=="Recruiter"){

        const form=document.getElementById("jobFormBox");

        if(form){

            form.style.display="none";

        }

    }

}

// ===========================================
// ANALYTICS
// ===========================================

async function loadAnalytics(){

    try{

        const response=await fetch("/analytics");

        const data=await response.json();
        console.log("ANALYTICS DATA:",data);

        document.getElementById("totalJobs").innerText=

            data.totalJobs || 0;

        document.getElementById("totalApplications").innerText=

            data.totalApplicants || 0;

        const saved=document.getElementById("savedCount");

        if(saved){

            saved.innerText=0;

        }

    }

    catch(error){

        console.log(error);

    }

}

// ===========================================
// LOAD JOBS
// ===========================================

async function loadJobs(){

    const container=document.getElementById("jobsContainer");

    if(container){

        container.innerHTML=`

        <div class="loading">

            <i class="fa-solid fa-spinner fa-spin"></i>

            <p>Loading Jobs...</p>

        </div>

        `;

    }

    try{

        const response=await fetch("/jobs");

        allJobs=await response.json();

        renderJobs(allJobs);

    }

    catch(error){

        console.log(error);

        if(container){

            container.innerHTML=`

            <div class="empty">

                <h2>⚠ Unable to Load Jobs</h2>

                <p>Please refresh the page.</p>

            </div>

            `;

        }

    }

}

// ===========================================
// RENDER JOBS
// ===========================================

function renderJobs(jobs){

    const container=document.getElementById("jobsContainer");

    if(!container) return;

    container.innerHTML="";

    if(jobs.length===0){

        container.innerHTML=`

        <div class="empty-state">

            <i class="fa-solid fa-briefcase fa-4x"></i>

            <h2>No Jobs Found</h2>

            <p>Try searching with another keyword.</p>

        </div>

        `;

        return;

    }

    jobs.forEach(job=>{

        const alreadyApplied=job.applicants?.some(

            applicant=>applicant.userId===user.id

        );

        const postedDate=new Date(job.createdAt).toLocaleDateString();

        const recruiterButtons=`

            <button onclick="editJob('${job._id}')">

                ✏ Edit

            </button>

            <button onclick="deleteJob('${job._id}')">

                🗑 Delete

            </button>

        `;

        const employeeButtons=alreadyApplied

        ?

        `

        <button disabled>

            ✅ Applied

        </button>

        `

        :

        `

        <button onclick="applyJob('${job._id}')">

            📝 Apply Now

        </button>

        `;

        container.innerHTML+=`

        <div class="job-card">

            <div style="display:flex;justify-content:space-between;align-items:center;">

                <div>

                    <h3>${job.title}</h3>

                    <p><strong>🏢 ${job.company}</strong></p>

                </div>

                <div style="font-size:40px;">

                    💼

                </div>

            </div>

            <hr>

            <p>

                📍 <strong>Location:</strong>

                ${job.location}

            </p>

            <p>

                💰 <strong>Salary:</strong>

                ${job.salary}

            </p>

            <p>

                📝

                ${job.description}

            </p>

            <p>

                📅 Posted :

                ${postedDate}

            </p>

            <div style="margin-top:20px;display:flex;gap:10px;flex-wrap:wrap;">

                ${

                    user.role==="Recruiter"

                    ?

                    recruiterButtons

                    :

                    employeeButtons

                }

            </div>

        </div>

        `;

    });

}

// ===========================================
// SEARCH JOBS
// ===========================================

function searchJobs(){

    const keyword=document

    .getElementById("searchInput")

    .value

    .toLowerCase()

    .trim();

    if(keyword===""){

        renderJobs(allJobs);

        return;

    }

    const filteredJobs=allJobs.filter(job=>

        job.title.toLowerCase().includes(keyword)

        ||

        job.company.toLowerCase().includes(keyword)

        ||

        job.location.toLowerCase().includes(keyword)

        ||

        job.salary.toLowerCase().includes(keyword)

        ||

        job.description.toLowerCase().includes(keyword)

    );

    renderJobs(filteredJobs);

}

// ===========================================
// REFRESH DASHBOARD
// ===========================================

async function refreshDashboard(){

    await loadAnalytics();

    await loadJobs();

}

// ===========================================
// APPLY JOB
// ===========================================

async function applyJob(id){

    try{

        const response=await fetch(`/apply/${id}`,{

            method:"POST",

            headers:{

                Authorization:`Bearer ${token}`

            }

        });

        const data=await response.json();

        if(data.success){

            alert("✅ Job Applied Successfully");

        }else{

            alert(data.message);

        }

        refreshDashboard();

    }

    catch(error){

        console.log(error);

        alert("Unable to apply for this job.");

    }

}

// ===========================================
// POST JOB
// ===========================================

async function postJob(){

    const title=document.getElementById("title").value.trim();

    const company=document.getElementById("company").value.trim();

    const location=document.getElementById("location").value.trim();

    const salary=document.getElementById("salary").value.trim();

    const description=document.getElementById("description").value.trim();

    if(!title || !company || !location || !salary || !description){

        alert("Please fill all fields.");

        return;

    }

    try{

        const response=await fetch("/jobs",{

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

        const data=await response.json();

        if(data.success){

            alert("🎉 Job Posted Successfully");

        }

        else{

            alert(data.message);

        }

        document.getElementById("title").value="";

        document.getElementById("company").value="";

        document.getElementById("location").value="";

        document.getElementById("salary").value="";

        document.getElementById("description").value="";

        refreshDashboard();

    }

    catch(error){

        console.log(error);

        alert("Unable to post job.");

    }

}

// ===========================================
// EDIT JOB
// ===========================================

async function editJob(id){

    const job=allJobs.find(j=>j._id===id);

    if(!job) return;

    const title=prompt("Job Title",job.title);

    if(title===null) return;

    const company=prompt("Company",job.company);

    const location=prompt("Location",job.location);

    const salary=prompt("Salary",job.salary);

    const description=prompt("Description",job.description);

    try{

        const response=await fetch(`/jobs/${id}`,{

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

        const data=await response.json();

        alert(data.message);

        refreshDashboard();

    }

    catch(error){

        console.log(error);

        alert("Unable to update job.");

    }

}

// ===========================================
// DELETE JOB
// ===========================================

async function deleteJob(id){

    const confirmDelete=confirm(

        "Are you sure you want to delete this job?"

    );

    if(!confirmDelete) return;

    try{

        const response=await fetch(`/jobs/${id}`,{

            method:"DELETE",

            headers:{

                Authorization:`Bearer ${token}`

            }

        });

        const data=await response.json();

        alert(data.message);

        refreshDashboard();

    }

    catch(error){

        console.log(error);

        alert("Unable to delete job.");

    }

}

// ===========================================
// LOGOUT
// ===========================================

function logout(){

    const answer=confirm(

        "Do you really want to logout?"

    );

    if(!answer) return;

    localStorage.removeItem("token");

    localStorage.removeItem("user");

    window.location.href="/login.html";

}

// ===========================================
// GLOBAL FUNCTIONS
// ===========================================

window.postJob=postJob;

window.applyJob=applyJob;

window.editJob=editJob;

window.deleteJob=deleteJob;

window.searchJobs=searchJobs;

window.logout=logout;