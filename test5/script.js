var tasks = JSON.parse(localStorage.getItem("tasks")) || []


function showTasks(state){
    const tasksDiv = document.querySelector(".tasks");
    tasksDiv.innerHTML = ""; 
    if(tasks == null)return;
    console.log(tasks)
    tasks.forEach((task,index) => {
        if(state === 'all' 
            || (state === 'completed' && task.checked) 
            || (state === 'pending' && !task.checked)){
        
            
            const newDiv = document.createElement("div");
            newDiv.className = "task";

            newDiv.innerHTML =  `
                <input type="checkbox" id="check" ${task.checked ? "checked" : ""} data-index="${index}">
                <div class="title">${task.title} : ${task.date}</div>
            `;

            tasksDiv.appendChild(newDiv);
        }

    })
}

showTasks('all');

const addButton = document.querySelector(".addbutton");
const input = document.getElementById("addTask");
const dateInput = document.querySelector("#date");

addButton.addEventListener("click",()=>{
    const value = input.value;
    const dateDate = dateInput.value;
    if(!date || !value)return;
    const newTask = {
        title : value,
        date:dateDate,
        checked:false
    }
    if(tasks == null)tasks = [newTask];
    else tasks.push(newTask);
    showTasks('all');
    localStorage.setItem("tasks",JSON.stringify(tasks));
})

var state = "all";
const stateButtons = document.querySelectorAll(".btn");

stateButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    state = btn.dataset.state;
    stateButtons.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    console.log("Current state:", state);
    showTasks(state); 
  });
});


document.querySelector(".tasks").addEventListener("change", (e) => {
  if (e.target.type === "checkbox") {
    const index = e.target.dataset.index;

    tasks[index].checked = e.target.checked;

    localStorage.setItem("tasks", JSON.stringify(tasks));
    console.log(tasks);
  }
});
