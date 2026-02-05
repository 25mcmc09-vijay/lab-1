interface t{
    title:string,
    date:string,
    checked:boolean
}

const storedTasks = localStorage.getItem("tasks");
let state: "all" | "completed" | "pending" = "all";

showTasks(state);


const tasks: t[] = storedTasks
  ? Array.isArray(JSON.parse(storedTasks))
    ? JSON.parse(storedTasks)
    : []
  : [];

  function showTasks(state: "all" | "completed" | "pending") {
  const tasksDiv = document.querySelector<HTMLElement>(".tasks");
  if (!tasksDiv) return;

  tasksDiv.innerHTML = "";

  tasks.forEach((task, index) => {
    if (
      state === "all" ||
      (state === "completed" && task.checked) ||
      (state === "pending" && !task.checked)
    ) {
      const newDiv = document.createElement("div");
      newDiv.className = "task";

      newDiv.innerHTML = `
        <input 
          type="checkbox"
          ${task.checked ? "checked" : ""}
          data-index="${index}"
        >
        <div class="title">
          ${task.title} : ${new Date(task.date).toLocaleDateString()}
        </div>
      `;

      tasksDiv.appendChild(newDiv);
    }
  });
}
showTasks("all");

const addButton = document.querySelector<HTMLButtonElement>(".addbutton");
const input = document.getElementById("addTask") as HTMLInputElement | null;
const dateInput = document.querySelector<HTMLInputElement>("#date");

addButton?.addEventListener("click", () => {
  if (!input || !dateInput) return;

  const value = input.value.trim();
  const dateValue = dateInput.value;

  if (!value || !dateValue) return;

  const newTask: t = {
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