function showPopup(title,message,success=true){

    document.getElementById("popup").style.display="flex";

    document.getElementById("popupTitle").innerText=title;

    document.getElementById("popupMessage").innerText=message;

    const icon=document.querySelector(".popup-icon");

    if(success){

        icon.innerHTML="✔";
        icon.style.background="#28a745";

    }else{

        icon.innerHTML="✖";
        icon.style.background="#dc3545";

    }
}

function closePopup(){

    document.getElementById("popup").style.display="none";

}

document.getElementById("forgotForm").addEventListener("submit",function(e){

    e.preventDefault();

    const email=document.getElementById("email").value.trim();
    const phone=document.getElementById("phone").value.trim();

    // Both empty

    if(email==="" && phone===""){

        showPopup("Required","Please enter Email or Mobile Number.",false);

        return;

    }

    // Both entered

    if(email!=="" && phone!==""){

        showPopup("Error","Enter either Email OR Mobile Number.",false);

        return;

    }

    // Email

    if(email!==""){

        const emailPattern=/^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if(!emailPattern.test(email)){

            showPopup("Invalid Email","Please enter a valid Email.",false);

            return;

        }

        localStorage.setItem("resetMethod","email");
        localStorage.setItem("resetValue",email);

        const otp=Math.floor(100000+Math.random()*900000);

        localStorage.setItem("otp",otp);

        console.log("OTP:",otp);

        showPopup("Success","OTP has been sent to your Email.",true);

    }

    // Mobile

    if(phone!==""){

        if(!/^[0-9]{10}$/.test(phone)){

            showPopup("Invalid Mobile","Please enter a valid Mobile Number.",false);

            return;

        }

        localStorage.setItem("resetMethod","mobile");
        localStorage.setItem("resetValue",phone);

        const otp=Math.floor(100000+Math.random()*900000);

        localStorage.setItem("otp",otp);

        console.log("OTP:",otp);

        showPopup("Success","OTP has been sent to your Mobile Number.",true);

    }

    setTimeout(function(){

        window.location.href="otp.html";

    },1500);

});