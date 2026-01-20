

const nameInput = document.getElementById("name");
const nameError = document.getElementById("nameError");

nameInput.addEventListener("input",()=>{
    const value = nameInput.value;
    const isValid = /^[A-Za-z\s]*$/.test(value);
    if(!isValid){
        nameError.innerHTML = "no special characters";
   
        
    }else{
        nameError.innerHTML = ""
    }
})

const emailInput = document.getElementById("email");
const emailError = document.getElementById("emailError");

emailInput.addEventListener("input", () => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  emailError.textContent = emailRegex.test(emailInput.value)
    ? ""
    : "Invalid email format";
});

const passwordInput = document.getElementById("pass");
const passwordError = document.getElementById("passError");
const passwordStrength = document.getElementById("passStrength");

passwordInput.addEventListener("input", () => {
  const value = passwordInput.value;
  let strength = 0;

  if (value.length >= 8) strength++;
  if (/[A-Z]/.test(value)) strength++;
  if (/[a-z]/.test(value)) strength++;
  if (/\d/.test(value)) strength++;
  if (/[^A-Za-z0-9]/.test(value)) strength++;


  const percent = Math.min(Math.floor((strength / 5) * 100), 100);

  if (strength < 4) {
    passwordError.textContent =
      "Must contain uppercase, lowercase, number & special char";
  } else {
    passwordError.textContent = "";
  }

  passwordStrength.textContent =
    percent < 6
      ? "Weak"
      : percent < 8
      ? "Medium"
      : "Strong";
});


const dobInput = document.getElementById("dob");
const dobError = document.getElementById("dobError");

dobInput.addEventListener("change", () => {
  const dob = new Date(dobInput.value);
  const today = new Date();
  const age = today.getFullYear() - dob.getFullYear();

  if (age < 18) {
    dobError.textContent = "You must be at least 18 years old";
  } else {
    dobError.textContent = "";
  }
});


const phoneInput = document.getElementById("phone");
const phoneError = document.getElementById("phoneError");

phoneInput.addEventListener("input", () => {
  phoneInput.value = phoneInput.value.replace(/\D/g, "");
  phoneError.textContent =
    phoneInput.value.length === 10
      ? ""
      : "Phone number must be exactly 10 digits";
});
 

document.querySelector("form").addEventListener("submit", (e) => {
  if (
    nameError.textContent ||
    emailError.textContent ||
    passwordError.textContent ||
    dobError.textContent ||
    phoneError.textContent
  ) {
    e.preventDefault();
    alert("Please fix errors before submitting");
  }
});