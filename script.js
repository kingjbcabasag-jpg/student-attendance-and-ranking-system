// Local Storage Data Structures
let users = JSON.parse(localStorage.getItem('sys_users')) || [
    { username: "abubakar", password: "123", name: "MR. ABUBAKAR" }
];

let currentUser = JSON.parse(localStorage.getItem('current_user')) || null;

let students = JSON.parse(localStorage.getItem('students')) || [
    { id: "101", name: "Alice Johnson", score: 85, attendanceCount: 5 },
    { id: "102", name: "Bob Smith", score: 92, attendanceCount: 6 },
    { id: "103", name: "Charlie Brown", score: 78, attendanceCount: 4 }
];

// DOM Elements
const loginOverlay = document.getElementById('login-overlay');
const loginForm = document.getElementById('login-form');
const signupForm = document.getElementById('signup-form');
const showSignupBtn = document.getElementById('show-signup');
const showLoginBtn = document.getElementById('show-login');
const logoutBtn = document.getElementById('logout-btn');

const teacherDisplayName = document.getElementById('teacher-display-name');
const topUserGreeting = document.getElementById('top-user-greeting');

const menuItems = document.querySelectorAll('.sidebar-menu li');
const sections = document.querySelectorAll('.content-section');

// Auth Form Switching
showSignupBtn.addEventListener('click', (e) => {
    e.preventDefault();
    loginForm.classList.remove('active-form');
    signupForm.classList.add('active-form');
});

showLoginBtn.addEventListener('click', (e) => {
    e.preventDefault();
    signupForm.classList.remove('active-form');
    loginForm.classList.add('active-form');
});

// Login Handler
loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const userVal = document.getElementById('login-username').value.trim();
    const passVal = document.getElementById('login-password').value.trim();

    const foundUser = users.find(u => u.username.toLowerCase() === userVal.toLowerCase() && u.password === passVal);

    if (foundUser) {
        currentUser = foundUser;
        localStorage.setItem('current_user', JSON.stringify(currentUser));
        loginForm.reset();
        checkAuthStatus();
    } else {
        alert('Invalid Username or Password!');
    }
});

// Signup Handler
signupForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const nameVal = document.getElementById('signup-fullname').value.trim();
    const userVal = document.getElementById('signup-username').value.trim();
    const passVal = document.getElementById('signup-password').value.trim();

    if (users.some(u => u.username.toLowerCase() === userVal.toLowerCase())) {
        alert('Username is already taken!');
        return;
    }

    const newUser = { username: userVal, password: passVal, name: nameVal };
    users.push(newUser);
    localStorage.setItem('sys_users', JSON.stringify(users));

    currentUser = newUser;
    localStorage.setItem('current_user', JSON.stringify(currentUser));
    signupForm.reset();
    checkAuthStatus();
});

// Logout Handler
logoutBtn.addEventListener('click', () => {
    currentUser = null;
    localStorage.removeItem('current_user');
    checkAuthStatus();
});

// Check Authentication Status
function checkAuthStatus() {
    if (currentUser) {
        loginOverlay.classList.add('hidden');
        teacherDisplayName.innerText = currentUser.name.toUpperCase();
        topUserGreeting.innerText = `Welcome, ${currentUser.name}`;
        initApp();
    } else {
        loginOverlay.classList.remove('hidden');
    }
}

// Navigation Handler with Page Transitions
menuItems.forEach(item => {
    item.addEventListener('click', () => {
        const targetSectionId = item.getAttribute('data-target');
        const activeSection = document.querySelector('.content-section.active');
        const targetSection = document.getElementById(targetSectionId);

        if (activeSection === targetSection) return;

        menuItems.forEach(i => i.classList.remove('active'));
        item.classList.add('active');

        // Smooth transition out and in
        if (activeSection) {
            activeSection.style.opacity = '0';
            activeSection.style.transform = 'translateY(15px)';

            setTimeout(() => {
                activeSection.classList.remove('active');
                targetSection.classList.add('active');

                setTimeout(() => {
                    targetSection.style.opacity = '1';
                    targetSection.style.transform = 'translateY(0)';
                }, 50);

                if (targetSectionId === 'ranking-section') {
                    renderRankings();
                } else if (targetSectionId === 'dashboard-section') {
                    updateDashboard();
                }
            }, 300);
        } else {
            targetSection.classList.add('active');
            targetSection.style.opacity = '1';
            targetSection.style.transform = 'translateY(0)';
        }
    });
});

// Set default attendance date
document.getElementById('attendance-date').valueAsDate = new Date();

// Initialize App Data
function initApp() {
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

// Sorting and Ranking Algorithm
function renderRankings() {
    const tbody = document.querySelector('#ranking-table tbody');
    tbody.innerHTML = '';

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

// Run auth check on page load
checkAuthStatus();
