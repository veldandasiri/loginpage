// ===============================
// Custom Popup
// ===============================

function showPopup(title, message, success = true) {

    const popup = document.getElementById("popup");
    const popupTitle = document.getElementById("popupTitle");
    const popupMessage = document.getElementById("popupMessage");
    const icon = document.querySelector(".popup-icon");

    popup.style.display = "flex";
    popupTitle.innerText = title;
    popupMessage.innerText = message;

    if (success) {
        icon.innerHTML = "✔";
        icon.style.background = "#28a745";
    } else {
        icon.innerHTML = "✖";
        icon.style.background = "#dc3545";
    }
}

function closePopup() {
    document.getElementById("popup").style.display = "none";
}

// ===============================
// Password Show / Hide
// ===============================

const togglePassword = document.getElementById("togglePassword");
const password = document.getElementById("password");

togglePassword.addEventListener("click", () => {

    if (password.type === "password") {

        password.type = "text";
        togglePassword.classList.replace("fa-eye", "fa-eye-slash");

    } else {

        password.type = "password";
        togglePassword.classList.replace("fa-eye-slash", "fa-eye");

    }

});

// ===============================
// Email Validation While Typing
// ===============================

const emailInput = document.getElementById("email");

emailInput.addEventListener("input", function () {

    this.value = this.value.replace(/\s/g, "");

    if (this.value.length === 1 && !/^[A-Za-z]$/.test(this.value)) {

        showPopup("Invalid Email", "Email must start with a letter.", false);

        this.value = "";
    }

});

// ===============================
// Login Validation
// ===============================

const loginForm = document.getElementById("loginForm");

loginForm.addEventListener("submit", function (e) {

    e.preventDefault();

    const email = document.getElementById("email").value.trim();
    const pass = document.getElementById("password").value.trim();

    if (email === "") {
        showPopup("Required", "Please enter your Gmail address.", false);
        return;
    }

    if (!email.endsWith("@gmail.com")) {
        showPopup("Invalid Email", "Only Gmail addresses (@gmail.com) are allowed.", false);
        return;
    }

    const username = email.replace("@gmail.com", "");

    if (!/^[A-Za-z]/.test(username)) {
        showPopup("Invalid Email", "Email must start with a letter.", false);
        return;
    }

    if (!/^[A-Za-z][A-Za-z0-9._%+-]*$/.test(username)) {
        showPopup("Invalid Email", "Invalid Gmail address.", false);
        return;
    }

    if (pass === "") {
        showPopup("Required", "Please enter your password.", false);
        return;
    }

    // Login Success
    showPopup("Success", "Login Successful!", true);

    setTimeout(() => {

        window.location.href = "dashboard.html";

    }, 1500);

});

// ===============================
// Enter Key Login
// ===============================

document.addEventListener("keypress", function (e) {

    if (e.key === "Enter") {

        loginForm.requestSubmit();

    }

});

// ===============================
// Input Focus Animation
// ===============================

const inputs = document.querySelectorAll(".input-box input");

inputs.forEach(input => {

    input.addEventListener("focus", () => {

        input.parentElement.style.transform = "translateY(-3px)";

    });

    input.addEventListener("blur", () => {

        input.parentElement.style.transform = "translateY(0px)";

    });

});

// ===============================
// Social Button Hover Animation
// ===============================

const socialButtons = document.querySelectorAll(".social button");

socialButtons.forEach(btn => {

    btn.addEventListener("mouseenter", () => {

        btn.style.transform = "translateY(-8px) scale(1.08)";

    });

    btn.addEventListener("mouseleave", () => {

        btn.style.transform = "translateY(0px) scale(1)";

    });

});