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
                <div class="stat-card">
                    <span class="label">Team Online</span>
                    <div class="value">${Store.users.length}</div>
                </div>
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
