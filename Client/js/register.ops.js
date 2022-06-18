var doctorDeptsList = document.getElementById("doctorMagerslist");
doctorDeptsList.style.display = "none";

document.querySelector('#postionlist').addEventListener("change", function() {

if (this.value == "Patient") {
    doctorDeptsList.style.display = "none";
//doctorMagerslist
console.log('Patient selected');
}
if (this.value == "Doctor") {
doctorDeptsList.style.display = "block";

console.log('Doctor selected');
}

});


function dateTime() {
console.log(new Date($.now()))
return new Date($.now());

}
