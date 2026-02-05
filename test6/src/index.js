var storedTasks = localStorage.getItem("tasks");
var state = "all";
showTasks(state);
var tasks = storedTasks
    ? JSON.parse(storedTasks)
    : [];
function showTasks(state) {
    var tasksDiv = document.querySelector(".tasks");
    if (!tasksDiv)
        return;
    tasksDiv.innerHTML = "";
    tasks.forEach(function (task, index) {
        if (state === "all" ||
            (state === "completed" && task.checked) ||
            (state === "pending" && !task.checked)) {
            var newDiv = document.createElement("div");
            newDiv.className = "task";
            newDiv.innerHTML = "\n        <input \n          type=\"checkbox\"\n          ".concat(task.checked ? "checked" : "", "\n          data-index=\"").concat(index, "\"\n        >\n        <div class=\"title\">\n          ").concat(task.title, " : ").concat(new Date(task.date).toLocaleDateString(), "\n        </div>\n      ");
            tasksDiv.appendChild(newDiv);
        }
    });
}
showTasks("all");
var addButton = document.querySelector(".addbutton");
var input = document.getElementById("addTask");
var dateInput = document.querySelector("#date");
addButton === null || addButton === void 0 ? void 0 : addButton.addEventListener("click", function () {
    if (!input || !dateInput)
        return;
    var value = input.value.trim();
    var dateValue = dateInput.value;
    if (!value || !dateValue)
        return;
    var newTask = {
        title: value,
        date: dateValue,
        checked: false
    };
    tasks.push(newTask);
    localStorage.setItem("tasks", JSON.stringify(tasks));
    showTasks(state);
    input.value = "";
    dateInput.value = "";
});
