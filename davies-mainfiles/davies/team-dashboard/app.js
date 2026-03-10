/**
 * Jcru Team Dashboard - Core Application Logic
 */

const Store = {
    users: [],
    projects: [],
    tasks: [],
    team: [],
    files: [],
    payments: [],
    
    async init() {
        try {
            // Load all data in parallel
            const [u, p, t, tm, f, py] = await Promise.all([
                this.fetchData('users'),
                this.fetchData('projects'),
                this.fetchData('tasks'),
                this.fetchData('team'),
                this.fetchData('files'),
                this.fetchData('payments')
            ]);
            
            this.users = u;
            this.projects = p;
            this.tasks = t;
            this.team = tm;
            this.files = f;
            this.payments = py;
            
            return true;
        } catch (err) {
            console.error("Data loading failed:", err);
            return false;
        }
    },
    
    async fetchData(name) {
        const res = await fetch(`data/${name}.csv`);
        if (!res.ok) return [];
        const text = await res.text();
        return parseCSV(text);
    }
};

const UI = {
    renderDashboard() {
        const activeProjects = Store.projects.filter(p => p.status !== 'Completed').length;
        const tasksDue = Store.tasks.filter(t => t.status !== 'Completed').length;
        const editing = Store.projects.filter(p => p.status === 'Editing').length;
        
        let adminCards = '';
        if (currentUser.role === 'admin') {
            adminCards = `
                <div class="stat-card admin-only-card" onclick="router.loadPage('manage-users')" style="cursor: pointer;">
                    <span class="label">System Users</span>
                    <div class="value">${Store.users.length}</div>
                    <p style="font-size: 0.8rem; color: var(--primary); margin-top: 10px;">Manage Permissions →</p>
                </div>
                <div class="stat-card admin-only-card" onclick="router.loadPage('manage-tasks')" style="cursor: pointer;">
                    <span class="label">Total Tasks</span>
                    <div class="value">${Store.tasks.length}</div>
                    <p style="font-size: 0.8rem; color: var(--primary); margin-top: 10px;">Assign & Edit Tasks →</p>
                </div>
            `;
        }

        return `
            <div class="stats-grid">
                <div class="stat-card">
                    <span class="label">Active Projects</span>
                    <div class="value">${activeProjects}</div>
                </div>
                <div class="stat-card">
                    <span class="label">Pending Tasks</span>
                    <div class="value">${tasksDue}</div>
                </div>
                <div class="stat-card">
                    <span class="label">In Editing</span>
                    <div class="value">${editing}</div>
                </div>
                ${adminCards}
            </div>
            
            <div class="content-card">
                <h3>Recent Tasks</h3>
                <table>
                    <thead>
                        <tr><th>Task</th><th>Project</th><th>Deadline</th><th>Status</th></tr>
                    </thead>
                    <tbody>
                        ${Store.tasks.slice(0, 5).map(t => `
                            <tr>
                                <td>${t.task_name}</td>
                                <td>${t.project_id}</td>
                                <td>${t.deadline}</td>
                                <td><span class="status-badge status-${t.status.toLowerCase().replace(' ', '')}">${t.status}</span></td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    },

    renderProjects() {
        return `
            <div class="content-card">
                <h3>All Projects</h3>
                <table>
                    <thead>
                        <tr><th>Project Name</th><th>Client</th><th>Deadline</th><th>Status</th><th>Owner</th></tr>
                    </thead>
                    <tbody>
                        ${Store.projects.map(p => `
                            <tr onclick="router.loadProjectDetail('${p.project_id}')" style="cursor: pointer;">
                                <td><strong>${p.project_name}</strong></td>
                                <td>${p.client}</td>
                                <td>${p.deadline}</td>
                                <td><span class="status-badge status-${p.status.toLowerCase().replace(' ', '')}">${p.status}</span></td>
                                <td>${p.owner}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    },

    renderProjectDetail(id) {
        const project = Store.projects.find(p => p.project_id === id);
        const projectTasks = Store.tasks.filter(t => t.project_id === id);
        const projectFiles = Store.files.filter(f => f.project_id === id);
        
        if (!project) return "<p>Project not found.</p>";

        return `
            <div class="stats-grid">
                <div class="stat-card">
                    <span class="label">Budget</span>
                    <div class="value">₹${project.budget}</div>
                </div>
                <div class="stat-card">
                    <span class="label">Status</span>
                    <div class="value" style="font-size: 1.2rem; color: var(--primary)">${project.status}</div>
                </div>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 30px;">
                <div class="content-card">
                    <h3>Tasks</h3>
                    <ul>
                        ${projectTasks.map(t => `<li style="margin-bottom: 10px; list-style: none; display: flex; justify-content: space-between;">
                            <span>${t.task_name}</span>
                            <span class="status-badge status-${t.status.toLowerCase().replace(' ', '')}">${t.status}</span>
                        </li>`).join('')}
                    </ul>
                </div>
                <div class="content-card">
                    <h3>Files</h3>
                    <ul>
                        ${projectFiles.map(f => `<li style="margin-bottom: 10px; list-style: none;">
                            <a href="${f.link}" target="_blank" style="color: var(--text-main); text-decoration: none;">
                                <i data-lucide="external-link" size="14"></i> ${f.file_name} (${f.file_type})
                            </a>
                        </li>`).join('')}
                    </ul>
                </div>
            </div>
        `;
    },

    renderTasks() {
        return `
            <div class="content-card">
                <h3>Task Manager</h3>
                <table>
                    <thead>
                        <tr><th>Task</th><th>Assigned To</th><th>Deadline</th><th>Status</th></tr>
                    </thead>
                    <tbody>
                        ${Store.tasks.map(t => `
                            <tr>
                                <td>${t.task_name}</td>
                                <td>${t.assigned_to}</td>
                                <td>${t.deadline}</td>
                                <td><span class="status-badge status-${t.status.toLowerCase().replace(' ', '')}">${t.status}</span></td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    },

    renderTeam() {
        return `
            <div class="content-card">
                <h3>Team Members</h3>
                <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 20px;">
                    ${Store.team.map(m => `
                        <div class="stat-card">
                            <div style="display: flex; gap: 15px; align-items: center;">
                                <div class="avatar" style="width: 50px; height: 50px;">${m.name[0]}</div>
                                <div>
                                    <h4 style="margin: 0;">${m.name}</h4>
                                    <p style="color: var(--text-dim); font-size: 0.8rem;">${m.role}</p>
                                </div>
                            </div>
                            <p style="margin-top: 15px; font-size: 0.9rem; color: var(--text-dim);">${m.email}</p>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    },

    renderFiles() {
        return `
            <div class="content-card">
                <h3>Project Files</h3>
                <table>
                    <thead>
                        <tr><th>Project</th><th>File Name</th><th>Type</th><th>Uploader</th><th>Link</th></tr>
                    </thead>
                    <tbody>
                        ${Store.files.map(f => `
                            <tr>
                                <td>${f.project_id}</td>
                                <td>${f.file_name}</td>
                                <td>${f.file_type}</td>
                                <td>${f.uploaded_by}</td>
                                <td><a href="${f.link}" target="_blank" style="color: var(--primary);">View</a></td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    },

    renderPayments() {
        return `
            <div class="content-card">
                <h3>Financial Overview</h3>
                <table>
                    <thead>
                        <tr><th>Type</th><th>Person/Client</th><th>Amount</th><th>Status</th></tr>
                    </thead>
                    <tbody>
                        ${Store.payments.map(p => `
                            <tr>
                                <td>${p.type}</td>
                                <td>${p.person}</td>
                                <td>₹${p.amount}</td>
                                <td><span class="status-badge" style="background: ${p.status === 'Paid' ? 'rgba(52,199,89,0.1)' : 'rgba(248,45,77,0.1)'}; color: ${p.status === 'Paid' ? '#34c759' : '#f82d4d'}">${p.status}</span></td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    },

    // Admin Specific Rendering
    renderManageUsers() {
        return `
            <div class="action-bar">
                <h3>User Management</h3>
                <button class="btn-primary" onclick="UI.openUserModal()" style="width: auto; padding: 10px 20px;">+ Add New User</button>
            </div>
            <div class="content-card">
                <table>
                    <thead>
                        <tr><th>Name</th><th>Email</th><th>Role</th><th>Actions</th></tr>
                    </thead>
                    <tbody>
                        ${Store.users.map(u => `
                            <tr>
                                <td><strong>${u.name}</strong></td>
                                <td>${u.email}</td>
                                <td><span class="admin-badge" style="background: ${u.role === 'admin' ? 'rgba(248,45,77,0.2)' : 'rgba(255,255,255,0.1)'}">${u.role}</span></td>
                                <td>
                                    <button class="btn-sm btn-success" onclick="UI.editUser('${u.email}')">Edit</button>
                                    <button class="btn-sm btn-danger" onclick="UI.deleteUser('${u.email}')">Remove</button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
            <div style="text-align: right; margin-top: 10px;">
                <p style="color: var(--text-dim); font-size: 0.8rem;">Note: Changes are local to session. Use "Push Changes" to save to Git.</p>
            </div>
        `;
    },

    renderManageTasks() {
        return `
            <div class="action-bar">
                <h3>Task Manager (Admin)</h3>
                <button class="btn-primary" onclick="UI.openTaskModal()" style="width: auto; padding: 10px 20px;">+ Create Task</button>
            </div>
            <div class="content-card">
                <table>
                    <thead>
                        <tr><th>Task</th><th>Project</th><th>Assigned To</th><th>Deadline</th><th>Status</th><th>Actions</th></tr>
                    </thead>
                    <tbody>
                        ${Store.tasks.map(t => `
                            <tr>
                                <td><strong>${t.task_name}</strong></td>
                                <td>${t.project_id}</td>
                                <td>${t.assigned_to}</td>
                                <td>${t.deadline}</td>
                                <td><span class="status-badge status-${t.status.toLowerCase().replace(' ', '')}">${t.status}</span></td>
                                <td>
                                    <button class="btn-sm btn-success" onclick="UI.editTask('${t.task_id}')">Edit</button>
                                    <button class="btn-sm btn-danger" onclick="UI.deleteTask('${t.task_id}')">Delete</button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    },

    // Modal Logic
    openUserModal(userEmail = null) {
        const modal = document.getElementById("admin-modal");
        const title = document.getElementById("modal-title");
        const fields = document.getElementById("modal-fields");
        const user = userEmail ? Store.users.find(u => u.email === userEmail) : null;

        title.innerText = user ? "Edit User" : "Add New User";
        fields.innerHTML = `
            <div class="form-group">
                <label>Full Name</label>
                <input type="text" id="form-name" class="form-control" value="${user?.name || ''}" placeholder="John Doe">
            </div>
            <div class="form-group">
                <label>Email</label>
                <input type="email" id="form-email" class="form-control" value="${user?.email || ''}" placeholder="john@jcru.in">
            </div>
            <div class="form-group">
                <label>Role</label>
                <select id="form-role" class="form-control">
                    <option value="admin" ${user?.role === 'admin' ? 'selected' : ''}>Admin</option>
                    <option value="editor" ${user?.role === 'editor' ? 'selected' : ''}>Editor</option>
                    <option value="dop" ${user?.role === 'dop' ? 'selected' : ''}>DOP</option>
                    <option value="sound" ${user?.role === 'sound' ? 'selected' : ''}>Sound</option>
                    <option value="motion" ${user?.role === 'motion' ? 'selected' : ''}>Motion</option>
                </select>
            </div>
        `;
        modal.style.display = "flex";
        lucide.createIcons();
    },

    closeModal() {
        document.getElementById("admin-modal").style.display = "none";
    },

    editUser(email) {
        this.openUserModal(email);
    },

    async deleteUser(email) {
        if (confirm(`Are you sure you want to remove ${email}?`)) {
            alert("To persist this change, please ask Antigravity to update the users.csv file with the removal.");
        }
    },

    openTaskModal(taskId = null) {
        const modal = document.getElementById("admin-modal");
        const title = document.getElementById("modal-title");
        const fields = document.getElementById("modal-fields");
        const task = taskId ? Store.tasks.find(t => t.task_id === taskId) : null;

        title.innerText = task ? "Edit Task" : "Create New Task";
        fields.innerHTML = `
            <div class="form-group">
                <label>Task Name</label>
                <input type="text" id="task-name" class="form-control" value="${task?.task_name || ''}">
            </div>
            <div class="form-group">
                <label>Project ID</label>
                <input type="text" id="task-project" class="form-control" value="${task?.project_id || ''}">
            </div>
            <div class="form-group">
                <label>Assigned To</label>
                <input type="text" id="task-assigned" class="form-control" value="${task?.assigned_to || ''}">
            </div>
            <div class="form-group">
                <label>Deadline</label>
                <input type="date" id="task-deadline" class="form-control" value="${task?.deadline || ''}">
            </div>
        `;
        modal.style.display = "flex";
        lucide.createIcons();
    },

    editTask(id) {
        this.openTaskModal(id);
    },

    deleteTask(id) {
        if (confirm(`Delete task ${id}?`)) {
            alert("Change requested. Please ask Antigravity to update tasks.csv.");
        }
    }
};

const router = {
    async loadPage(page) {
        const appView = document.getElementById("app-view");
        const projectDetailView = document.getElementById("project-detail-view");
        const pageTitle = document.getElementById("page-title");
        
        // Update Sidebar UI
        document.querySelectorAll(".nav-link").forEach(link => {
            link.classList.remove("active");
            if (link.dataset.page === page) link.classList.add("active");
        });

        pageTitle.innerText = page.charAt(0).toUpperCase() + page.slice(1);
        appView.style.display = "block";
        projectDetailView.style.display = "none";

        switch(page) {
            case 'dashboard': appView.innerHTML = UI.renderDashboard(); break;
            case 'projects': appView.innerHTML = UI.renderProjects(); break;
            case 'tasks': appView.innerHTML = UI.renderTasks(); break;
            case 'team': appView.innerHTML = UI.renderTeam(); break;
            case 'files': appView.innerHTML = UI.renderFiles(); break;
            case 'payments': appView.innerHTML = UI.renderPayments(); break;
            case 'manage-users': appView.innerHTML = UI.renderManageUsers(); break;
            case 'manage-tasks': appView.innerHTML = UI.renderManageTasks(); break;
        }
        
        lucide.createIcons();
    },

    loadProjectDetail(id) {
        const appView = document.getElementById("app-view");
        const projectDetailView = document.getElementById("project-detail-view");
        const pageTitle = document.getElementById("page-title");
        const detailContent = document.getElementById("project-detail-content");

        const project = Store.projects.find(p => p.project_id === id);
        pageTitle.innerText = project ? project.project_name : "Project Detail";
        
        appView.style.display = "none";
        projectDetailView.style.display = "block";
        detailContent.innerHTML = UI.renderProjectDetail(id);
        
        lucide.createIcons();
    }
};

// Initialize App
document.addEventListener("DOMContentLoaded", async () => {
    const user = currentUser; // From auth.js
    if (!user) return;

    // Show Admin Panel if applicable
    if (user.role === 'admin') {
        document.getElementById("admin-nav").style.display = "block";
    }

    // Update User Profile UI
    document.getElementById("user-name").innerText = user.name;
    document.getElementById("user-role").innerText = user.role;
    document.getElementById("user-avatar").innerText = user.name[0];

    const success = await Store.init();
    if (success) {
        router.loadPage('dashboard');
    } else {
        document.getElementById("app-view").innerHTML = "<p>Failed to load dashboard data. Check CSV files.</p>";
    }

    // Sidebar navigation
    document.querySelectorAll(".nav-link").forEach(link => {
        link.addEventListener("click", (e) => {
            e.preventDefault();
            router.loadPage(link.dataset.page);
        });
    });
});
