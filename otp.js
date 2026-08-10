// ================= Popup =================

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

// ================= OTP Verification =================

document.getElementById("otpForm").addEventListener("submit", function (e) {

    e.preventDefault();

    const enteredOTP = document.getElementById("otp").value.trim();

    const savedOTP = localStorage.getItem("otp");

    if (enteredOTP === "") {

        showPopup("Required", "Please enter OTP.", false);

        return;

    }

    if (enteredOTP.length !== 6) {

        showPopup("Invalid OTP", "OTP must contain 6 digits.", false);

        return;

    }

    if (enteredOTP === savedOTP) {

        showPopup("Success", "OTP Verified Successfully.", true);

        setTimeout(() => {

            window.location.href = "resetpassword.html";

        }, 1500);

    } else {

        showPopup("Invalid OTP", "Incorrect OTP. Please try again.", false);

    }

});