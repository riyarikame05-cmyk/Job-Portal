alert("editJobs.js loaded");


const params = new URLSearchParams(window.location.search);

const id = params.get("id");

console.log("JOB ID:", id);



const title = document.getElementById("title");

const company = document.getElementById("company");

const jobLocation = document.getElementById("location");

const salary = document.getElementById("salary");

const description = document.getElementById("description");




// LOAD OLD JOB DATA

fetch("/jobs/" + id)

.then(res => res.json())

.then(job => {

    console.log("JOB DATA:", job);


    title.value = job.title;

    company.value = job.company;

    jobLocation.value = job.location;

    salary.value = job.salary;

    description.value = job.description;


})

.catch(err => {

    console.log(err);

    alert("Job loading failed");

});







// UPDATE JOB


document.getElementById("updateBtn").addEventListener("click",()=>{


    alert("Button clicked");



    fetch("/jobs/" + id,{

        method:"PUT",

        headers:{

            "Content-Type":"application/json"

        },


        body:JSON.stringify({

            title:title.value,

            company:company.value,

            location:jobLocation.value,

            salary:salary.value,

            description:description.value

        })

    })



    .then(res=>res.json())


    .then(data=>{


        console.log("UPDATED:",data);


        alert("Job Updated Successfully");


        window.location.href="jobs.html";


    })


    .catch(err=>{


        console.log(err);


        alert("Update Failed");


    });



});