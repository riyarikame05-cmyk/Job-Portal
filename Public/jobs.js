const user = JSON.parse(localStorage.getItem("user"));

alert("jobs.js loaded");


async function loadJobs() {

    const res = await fetch("/jobs");

    const jobs = await res.json();

    console.log(jobs);


    const container = document.getElementById("jobsContainer");


    jobs.forEach(job => {


        let deleteButton = "";
        let editButton = "";


        // Only Recruiter can edit/delete
        if(user && user.role === "Recruiter"){


            editButton = `
                <button onclick="editJob('${job._id}')">
                    Edit Job
                </button>
            `;


            deleteButton = `
                <button onclick="deleteJob('${job._id}')">
                    Delete Job
                </button>
            `;

        }



        container.innerHTML += `

            <div>

                <h3>${job.title}</h3>

                <p>Company: ${job.company}</p>

                <p>Location: ${job.location}</p>

                <p>Salary: ${job.salary}</p>

                <p>${job.description}</p>


                ${editButton}

                ${deleteButton}


                <hr>

            </div>

        `;


    });


}



// DELETE JOB

async function deleteJob(id){


    const confirmDelete = confirm(
        "Are you sure you want to delete this job?"
    );


    if(!confirmDelete){
        return;
    }



    const res = await fetch(`/deletejob/${id}`, {

        method:"DELETE"

    });



    const data = await res.json();



    alert(data.message);



    if(data.success){

        location.reload();

    }


}




function editJob(id){

    window.location.href = `editJobs.html?id=${id}`;

}



// Start loading jobs

loadJobs();