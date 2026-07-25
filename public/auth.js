// ================= REGISTER =================

async function register() {

  const name = document.getElementById("name").value.trim();

  const email = document.getElementById("email").value.trim();

  const password = document.getElementById("password").value.trim();

  const role = document.getElementById("role").value;

  if (!name || !email || !password || !role) {

    alert("Please fill all fields");

    return;
  }

  try {

    const res = await fetch("/register", {

      method: "POST",

      headers: {

        "Content-Type": "application/json"

      },

      body: JSON.stringify({

        name,

        email,

        password,

        role

      })

    });

    const data = await res.json();

    alert(data.message);

    if (data.success) {

      window.location.href = "/login.html";

    }

  }

  catch (error) {

    console.log(error);

    alert("Registration failed");

  }

}



// ================= LOGIN =================

async function login() {

  const email = document.getElementById("email").value.trim();

  const password = document.getElementById("password").value.trim();

  if (!email || !password) {

    alert("Please fill all fields");

    return;
  }

  try {

    const res = await fetch("/login", {

      method: "POST",

      headers: {

        "Content-Type": "application/json"

      },

      body: JSON.stringify({

        email,

        password

      })

    });

    const data = await res.json();

    if (data.success) {

      localStorage.setItem(

        "token",

        data.token

      );

      localStorage.setItem(

        "user",

        JSON.stringify(data.user)

      );

      window.location.href = "/dashboard.html";

    }

    else {

      alert(data.message);

    }

  }

  catch (error) {

    console.log(error);

    alert("Login failed");

  }

}