

const form = document.getElementById("task-form");
const input = document.getElementById("task-input");
const taskList = document.getElementById("task-list");
const taskCount = document.getElementById("task-count");

let tasks = [];

async function loadTasks() {
  try {
    const response = await fetch("/api/tasks");
    if (!response.ok) throw new Error("Could not load tasks");

    tasks = await response.json();
    renderTasks();
  } catch (error) {
    taskCount.textContent = "Could not load tasks. Refresh the page.";
  }
}

function renderTasks() {
  taskList.innerHTML = "";

  tasks.forEach((task) => {
    const li = document.createElement("li");
    li.className = task.completed ? "task completed" : "task";

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = task.completed;

    checkbox.addEventListener("change", async () => {
      try {
        const response = await fetch(`/api/tasks/${task._id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ completed: checkbox.checked })
        });

        if (!response.ok) throw new Error("Update failed");
        await loadTasks();
      } catch {
        alert("Could not update task. Please try again.");
        await loadTasks();
      }
    });

    const span = document.createElement("span");
    span.textContent = task.title;

    const deleteButton = document.createElement("button");
    deleteButton.textContent = "Delete";
    deleteButton.className = "delete-btn";

    deleteButton.addEventListener("click", async () => {
      try {
       const response = await fetch(`/api/tasks/${task._id}`, {
          method: "DELETE"
        });

        if (!response.ok) throw new Error("Delete failed");
        await loadTasks();
      } catch (error) {
  console.error("Delete task error:", error);
  alert("Delete task failed: " + error.message);
}
    });

    li.append(checkbox, span, deleteButton);
    taskList.appendChild(li);
  });

  taskCount.textContent = `${tasks.length} task(s)`;
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const title = input.value.trim();
  if (!title) return;

  try {
    const response = await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title })
    });

    if (!response.ok) throw new Error("Could not add task");

    input.value = "";
    await loadTasks();
  } catch (error) {
  console.error("Add task error:", error);
  alert("Add task failed: " + error.message);
}
});

loadTasks();
