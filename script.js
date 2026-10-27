// Local Storage Simulation for Linked List / Array Database Structure
let students = JSON.parse(localStorage.getItem('students')) || [
    { id: "101", name: "Alice Johnson", score: 85, attendanceCount: 5 },
    { id: "102", name: "Bob Smith", score: 92, attendanceCount: 6 },
    { id: "103", name: "Charlie Brown", score: 78, attendanceCount: 4 }
];

// Navigation handler between sidebar menus
const menuItems = document.querySelectorAll('.sidebar-menu li');
const sections = document.querySelectorAll('.content-section');

menuItems.forEach(item => {
    item.addEventListener('click', () => {
        menuItems.forEach(i => i.classList.remove('active'));
        sections.forEach(s => s.classList.remove('active'));

        item.classList.add('active');
        const target = item.getAttribute('data-target');
        document.getElementById(target).classList.add('active');

        if (target === 'ranking-section') {
            renderRankings();
        } else if (target === 'dashboard-section') {
            updateDashboard();
        }
    });
});

// Set default attendance date to today
document.getElementById('attendance-date').valueAsDate = new Date();

// Initialize UI
function init() {
    renderStudentsTable();
    renderAttendanceTable();
    updateDashboard();
}

// Update Dashboard Statistics
function updateDashboard() {
    document.getElementById('total-students-count').innerText = students.length;
    const totalPresent = students.reduce((acc, curr) => acc + (curr.attendanceCount > 0 ? 1 : 0), 0);
    document.getElementById('present-count').innerText = `${totalPresent} Active / Recorded`;
}

// Render Students List Table
function renderStudentsTable(filterText = '') {
    const tbody = document.querySelector('#students-table tbody');
    tbody.innerHTML = '';

    const filteredStudents = students.filter(s => 
        s.name.toLowerCase().includes(filterText.toLowerCase()) || s.id.includes(filterText)
    );

    filteredStudents.forEach(student => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${student.id}</td>
            <td>${student.name}</td>
            <td>${student.score}</td>
            <td>${student.attendanceCount}</td>
            <td><button class="btn danger-btn" onclick="deleteStudent('${student.id}')"><i class="fa-solid fa-trash"></i> Delete</button></td>
        `;
        tbody.appendChild(tr);
    });
}

// Register / Add Student Form submission
document.getElementById('add-student-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const id = document.getElementById('student-id').value.trim();
    const name = document.getElementById('student-name').value.trim();
    const score = parseInt(document.getElementById('student-score').value);

    if (students.some(s => s.id === id)) {
        alert('Student ID already exists!');
        return;
    }

    students.push({ id, name, score, attendanceCount: 0 });
    saveAndRefresh();
    e.target.reset();
    alert('Student registered successfully!');
});

// Delete student record
function deleteStudent(id) {
    students = students.filter(s => s.id !== id);
    saveAndRefresh();
}

// Search functionality in list students
document.getElementById('search-student-input').addEventListener('input', (e) => {
    renderStudentsTable(e.target.value);
});

// Render Attendance Table UI
function renderAttendanceTable() {
    const tbody = document.querySelector('#attendance-table tbody');
    tbody.innerHTML = '';

    students.forEach(student => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${student.id}</td>
            <td>${student.name}</td>
            <td>
                <select class="attendance-status" data-id="${student.id}">
                    <option value="Present">Present</option>
                    <option value="Absent">Absent</option>
                    <option value="Excuse">Excuse</option>
                </select>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// Save Attendance Event
document.getElementById('save-attendance-btn').addEventListener('click', () => {
    const dropdowns = document.querySelectorAll('.attendance-status');
    dropdowns.forEach(dropdown => {
        const studentId = dropdown.getAttribute('data-id');
        const status = dropdown.value;
        if (status === 'Present') {
            const student = students.find(s => s.id === studentId);
            if (student) student.attendanceCount += 1;
        }
    });
    saveAndRefresh();
    alert('Attendance recorded successfully!');
});

// Sorting and Ranking Algorithm (DSA Concept Implementation)
function renderRankings() {
    const tbody = document.querySelector('#ranking-table tbody');
    tbody.innerHTML = '';

    // Sort students: Primary sort by Score (descending), Secondary by Attendance Count (descending)
    let sortedStudents = [...students].sort((a, b) => {
        if (b.score === a.score) {
            return b.attendanceCount - a.attendanceCount;
        }
        return b.score - a.score;
    });

    sortedStudents.forEach((student, index) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><strong>#${index + 1}</strong></td>
            <td>${student.id}</td>
            <td>${student.name}</td>
            <td>${student.score}</td>
            <td>${student.attendanceCount}</td>
        `;
        tbody.appendChild(tr);
    });
}

// Persist to LocalStorage and update views
function saveAndRefresh() {
    localStorage.setItem('students', JSON.stringify(students));
    renderStudentsTable();
    renderAttendanceTable();
    updateDashboard();
}

// Run app init on load
init();