// DOM Elements
const taskInput = document.getElementById('taskInput');
const dueDate = document.getElementById('dueDate');
const prioritySelect = document.getElementById('priority');
const addBtn = document.getElementById('addBtn');
const taskOutput = document.getElementById('taskOutput');
const taskCount = document.getElementById('taskCount');

// Filter Buttons
const sortByPriority = document.getElementById('sortByPriority');
const sortByDate = document.getElementById('sortByDate');
const filterPending = document.getElementById('filterPending');
const filterCompleted = document.getElementById('filterCompleted');

// State Management
let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
let currentSort = 'priority';
let currentFilter = 'all';

// Priority order for sorting
const priorityOrder = { high: 3, medium: 2, low: 1 };

// Event Listeners
addBtn.addEventListener('click', addTask);
taskInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') addTask();
});

sortByPriority.addEventListener('click', () => {
    currentSort = 'priority';
    updateFilterButtons();
    renderTasks();
});

sortByDate.addEventListener('click', () => {
    currentSort = 'date';
    updateFilterButtons();
    renderTasks();
});

filterPending.addEventListener('click', () => {
    currentFilter = currentFilter === 'pending' ? 'all' : 'pending';
    updateFilterButtons();
    renderTasks();
});

filterCompleted.addEventListener('click', () => {
    currentFilter = currentFilter === 'completed' ? 'all' : 'completed';
    updateFilterButtons();
    renderTasks();
});

// Initialize
renderTasks();

// Add Task Function
function addTask() {
    const description = taskInput.value.trim();
    const date = dueDate.value;
    const priority = prioritySelect.value;

    if (description === '' || date === '') {
        alert('⚠️ Please enter both a task description and a due date.');
        return;
    }

    const task = {
        id: Date.now(),
        description,
        date,
        priority,
        completed: false,
        createdAt: new Date().toISOString()
    };

    tasks.unshift(task);
    saveTasks();
    clearInputs();
    renderTasks();
}

// Clear Input Fields
function clearInputs() {
    taskInput.value = '';
    dueDate.value = '';
    prioritySelect.value = 'medium';
    taskInput.focus();
}

// Save Tasks to LocalStorage
function saveTasks() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

// Delete Task Function
function deleteTask(id) {
    if (confirm('🗑️ Are you sure you want to delete this task?')) {
        tasks = tasks.filter(task => task.id !== id);
        saveTasks();
        renderTasks();
    }
}

// Toggle Task Completion
function toggleTaskCompletion(id) {
    const task = tasks.find(task => task.id === id);
    if (task) {
        task.completed = !task.completed;
        saveTasks();
        renderTasks();
    }
}

// Sort Tasks
function sortTasks(tasksToSort) {
    let sorted = [...tasksToSort];

    // Separate completed and pending tasks
    const pending = sorted.filter(t => !t.completed);
    const completed = sorted.filter(t => t.completed);

    // Sort pending tasks
    if (currentSort === 'priority') {
        pending.sort((a, b) => priorityOrder[b.priority] - priorityOrder[a.priority]);
    } else if (currentSort === 'date') {
        pending.sort((a, b) => new Date(a.date) - new Date(b.date));
    }

    // Sort completed tasks by completion (most recent first)
    completed.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return [...pending, ...completed];
}

// Filter Tasks
function filterTasks(tasksToFilter) {
    if (currentFilter === 'pending') {
        return tasksToFilter.filter(task => !task.completed);
    } else if (currentFilter === 'completed') {
        return tasksToFilter.filter(task => task.completed);
    }
    return tasksToFilter;
}

// Format Date
function formatDate(dateString) {
    const options = { month: 'short', day: 'numeric', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
}

// Check if Date is Overdue
function isOverdue(dateString, completed) {
    if (completed) return false;
    return new Date(dateString) < new Date() && new Date(dateString).toDateString() !== new Date().toDateString();
}

// Render Tasks
function renderTasks() {
    const filteredTasks = filterTasks(tasks);
    const sortedTasks = sortTasks(filteredTasks);

    // Update task count
    taskCount.textContent = `${filteredTasks.length} ${filteredTasks.length === 1 ? 'task' : 'tasks'}`;

    if (sortedTasks.length === 0) {
        taskOutput.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-inbox"></i>
                <p>${currentFilter === 'all' ? 'No tasks yet. Add one to get started!' : `No ${currentFilter} tasks`}</p>
            </div>
        `;
        return;
    }

    taskOutput.innerHTML = sortedTasks.map(task => {
        const overdue = isOverdue(task.date, task.completed);
        const isCompleted = task.completed;

        return `
            <div class="task-card ${task.priority}-priority ${isCompleted ? 'completed' : ''}">
                <div class="task-content">
                    <div class="task-text">${escapeHtml(task.description)}</div>
                    <div class="task-meta">
                        <div class="task-date">
                            <i class="fas fa-calendar-alt"></i>
                            <span>${formatDate(task.date)}${overdue ? ' <span style="color: var(--danger-color); font-weight: bold;">(OVERDUE)</span>' : ''}</span>
                        </div>
                        <span class="task-priority ${task.priority}">${task.priority.toUpperCase()}</span>
                        <span class="task-status-icon ${isCompleted ? 'completed' : 'pending'}">
                            <i class="fas ${isCompleted ? 'fa-check-circle' : 'fa-hourglass-start'}"></i>
                        </span>
                    </div>
                </div>
                <div class="task-actions">
                    <button class="btn btn-complete ${isCompleted ? 'completed' : ''}" onclick="toggleTaskCompletion(${task.id})" title="${isCompleted ? 'Mark as pending' : 'Mark as completed'}">
                        <i class="fas ${isCompleted ? 'fa-undo' : 'fa-check'}"></i>
                    </button>
                    <button class="btn btn-delete" onclick="deleteTask(${task.id})" title="Delete task">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

// Update Filter Button States
function updateFilterButtons() {
    sortByPriority.classList.toggle('active', currentSort === 'priority');
    sortByDate.classList.toggle('active', currentSort === 'date');
    filterPending.classList.toggle('active', currentFilter === 'pending');
    filterCompleted.classList.toggle('active', currentFilter === 'completed');
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}
