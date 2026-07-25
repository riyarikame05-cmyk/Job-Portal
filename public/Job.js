const jobForm = document.getElementById("jobForm");

jobForm.addEventListener("submit", async (e) => {

    e.preventDefault();

    const title = document.getElementById("title").value;
    const company = document.getElementById("company").value;
    const location = document.getElementById("location").value;
    const salary = document.getElementById("salary").value;
    const description = document.getElementById("description").value;

    const res = await fetch("/postjob", {
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

    alert(data.message);
});

async function deleteJob(id){


    const confirmDelete = confirm(
        "Are you sure you want to delete this job?"
    );


    if(!confirmDelete){
        return;
    }


    const res = await fetch(`/deletejob/${id}`,{

        method:"DELETE"

    });


    const data = await res.json();


    alert(data.message);


    if(data.success){

        location.reload();

    }

}