let ad = document.getElementById("add");
let out = document.getElementById("output");
let t = document.getElementById("text");
let d = document.getElementById("date");
let arr = JSON.parse(localStorage.getItem("tasks")) || [];

showTasks();

ad.addEventListener("click", add);

function add() {
    let y = t.value;
    let x = d.value;

    if (y === "" || x === "") { 
        alert("Please enter both a task and a date.");
        return;
    }
    arr.push({ item: y, dd: x });
    localStorage.setItem("tasks", JSON.stringify(arr));
    t.value = "";
    d.value = "";
    alert("Item added successfully")
    showTasks();
}


function showTasks() {
    out.innerHTML = "";
    arr.forEach((task, index) => {
        out.innerHTML += `<p>Task: ${task.item}, Due: ${task.dd} <button onclick="deleteTask(${index})">Delete</button></p>`;
    });
}

function deleteTask(index) {
    arr.splice(index, 1);
    localStorage.setItem("tasks", JSON.stringify(arr));
    alert("Item deleted successfully")
    showTasks();
}