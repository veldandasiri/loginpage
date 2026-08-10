function togglePassword(inputId, iconId){

const input=document.getElementById(inputId);

const icon=document.getElementById(iconId);

icon.onclick=function(){

if(input.type==="password"){

input.type="text";

icon.classList.replace("fa-eye","fa-eye-slash");

}
else{

input.type="password";

icon.classList.replace("fa-eye-slash","fa-eye");

}

}

}

togglePassword("newPassword","togglePassword1");
togglePassword("confirmPassword","togglePassword2");

document.getElementById("resetForm").addEventListener("submit",function(e){

e.preventDefault();

const pass=document.getElementById("newPassword").value;
const confirm=document.getElementById("confirmPassword").value;

const msg=document.getElementById("msg");

if(pass==="" || confirm===""){

msg.style.color="red";
msg.innerHTML="Please fill all fields.";

return;

}

if(pass!==confirm){

msg.style.color="red";
msg.innerHTML="Passwords do not match.";

return;

}

let user=JSON.parse(localStorage.getItem("user"));

if(user){

user.password=pass;

localStorage.setItem("user",JSON.stringify(user));

}

msg.style.color="green";
msg.innerHTML="Password Reset Successfully.";

setTimeout(function(){

window.location.href="loginpage.html";

},1500);

});