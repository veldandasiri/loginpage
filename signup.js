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
// Confirm Password Show / Hide
// ===============================

const toggleConfirm = document.getElementById("toggleConfirmPassword");
const confirmPassword = document.getElementById("confirmPassword");

toggleConfirm.addEventListener("click", () => {

    if (confirmPassword.type === "password") {

        confirmPassword.type = "text";
        toggleConfirm.classList.replace("fa-eye", "fa-eye-slash");

    } else {

        confirmPassword.type = "password";
        toggleConfirm.classList.replace("fa-eye-slash", "fa-eye");

    }

});

// ===============================
// Full Name Validation
// ===============================

const fullnameInput = document.getElementById("fullname");

fullnameInput.addEventListener("input", function () {

    // Allow only letters and spaces
    this.value = this.value.replace(/[^A-Za-z ]/g, "");

    // Remove multiple spaces
    this.value = this.value.replace(/\s{2,}/g, " ");

});

// ===============================
// Email Validation
// ===============================

const emailInput = document.getElementById("email");

emailInput.addEventListener("input", function () {

    // Remove spaces
    this.value = this.value.replace(/\s/g, "");

    let value = this.value;

    // First character must be a letter
    if (value.length === 1 && !/^[A-Za-z]$/.test(value)) {

        this.value = "";

        showPopup(
            "Invalid Email",
            "Email must start with a letter.",
            false
        );

        return;
    }

    // Allow only valid characters before @
    const parts = value.split("@");

    if (parts.length > 0) {

        parts[0] = parts[0].replace(/[^A-Za-z0-9._]/g, "");

        this.value = parts.join("@");

    }

});

// ===============================
// Phone Validation
// ===============================

const phoneInput = document.getElementById("phone");

phoneInput.addEventListener("input", function () {

    // Numbers only
    this.value = this.value.replace(/\D/g, "");

    // Maximum 10 digits
    this.value = this.value.slice(0, 10);

});

// ===============================
// Popup
// ===============================

function showPopup(title, message, success = true) {

    document.getElementById("popup").style.display = "flex";

    document.getElementById("popupTitle").innerText = title;

    document.getElementById("popupMessage").innerText = message;

    const icon = document.querySelector(".popup-icon");

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
// Signup Validation
// ===============================

document.getElementById("signupForm").addEventListener("submit", function (e) {

    e.preventDefault();

    const fullname = fullnameInput.value.trim();
    const email = emailInput.value.trim();
    const phone = phoneInput.value.trim();
    const password = document.getElementById("password").value;
    const confirm = document.getElementById("confirmPassword").value;
    const terms = document.querySelector(".remember input").checked;

    // Full Name

    if (fullname === "") {

        showPopup("Required", "Please enter your full name.", false);
        return;

    }

    if (!/^[A-Za-z ]+$/.test(fullname)) {

        showPopup("Invalid Name", "Name should contain only letters.", false);
        return;

    }

    // Email

    if (email === "") {

        showPopup("Required", "Please enter your Gmail address.", false);
        return;

    }

    const emailPattern = /^[A-Za-z][A-Za-z0-9._]*@gmail\.com$/;

    if (!emailPattern.test(email)) {

        showPopup(
            "Invalid Email",
            "Enter a valid Gmail address.\nExample: siri@gmail.com",
            false
        );

        return;

    }

    // Phone

    if (phone === "") {

        showPopup("Required", "Please enter your phone number.", false);
        return;

    }

    if (!/^[6-9][0-9]{9}$/.test(phone)) {

        showPopup(
            "Invalid Phone Number",
            "Enter a valid 10-digit mobile number.",
            false
        );

        return;

    }

    // Password

    if (password === "") {

        showPopup("Required", "Please enter your password.", false);
        return;

    }

    if (password.length < 8) {

        showPopup(
            "Weak Password",
            "Password must contain at least 8 characters.",
            false
        );

        return;

    }

    // Confirm Password

    if (confirm === "") {

        showPopup("Required", "Please confirm your password.", false);
        return;

    }

    if (password !== confirm) {

        showPopup("Password Error", "Passwords do not match.", false);
        return;

    }

    // Terms

    if (!terms) {

        showPopup(
            "Terms & Conditions",
            "Please accept the Terms & Conditions.",
            false
        );

        return;

    }

    // Save User

    const user = {

        fullname,
        email,
        phone,
        password

    };

    localStorage.setItem("user", JSON.stringify(user));

    showPopup(
        "Success",
        "Account Created Successfully!",
        true
    );

    setTimeout(() => {

        window.location.href = "loginpage.html";

    }, 1500);

});

// ===============================
// Enter Key
// ===============================

document.addEventListener("keypress", function (e) {

    if (e.key === "Enter") {

        document.getElementById("signupForm").requestSubmit();

    }

});