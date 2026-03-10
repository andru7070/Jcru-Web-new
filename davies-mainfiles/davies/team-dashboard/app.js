/**
 * Jcru Team Dashboard - Supabase Integrated App Logic
 */

const Store = {
    users: [],
    projects: [],
    tasks: [],
    team: [], // Merged with users in Supabase 
    files: [],
    payments: [],
    
    async init() {
        try {
            const [u, p, t, f, py] = await Promise.all([
                this.fetchTable('users'),
                this.fetchTable('projects'),
                this.fetchTable('tasks'),
                this.fetchTable('files'), // To be created in Supabase
                this.fetchTable('payments')
            ]);
            
            this.users = u.data || [];
            this.projects = p.data || [];
            this.tasks = t.data || [];
            this.files = f.data || [];
            this.payments = py.data || [];
            
            return true;
        } catch (err) {
            console.error("Supabase load failed:", err);
            return false;
        }
    },
    
    async fetchTable(name) {
        return await supabase.from(name).select('*');
    }
};

const UI = {
    // ... (Existing render functions remain mostly the same, just updated for Supabase objects)
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
                <div class="stat-card"><span class="label">Active Projects</span><div class="value">${activeProjects}</div></div>
                <div class="stat-card"><span class="label">Pending Tasks</span><div class="value">${tasksDue}</div></div>
                <div class="stat-card"><span class="label">In Editing</span><div class="value">${editing}</div></div>
                ${adminCards}
            </div>
            
            <div class="content-card">
                <h3>Recent Tasks</h3>
                <table>
                    <thead><tr><th>Task</th><th>Project</th><th>Deadline</th><th>Status</th></tr></thead>
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

    // New Management Actions (Actual Database Persistence)
    async saveUser(e) {
        e.preventDefault();
        const name = document.getElementById("form-name").value;
        const email = document.getElementById("form-email").value;
        const role = document.getElementById("form-role").value;

        const { error } = await supabase.from('users').upsert({ name, email, role }, { onConflict: 'email' });
        
        if (error) alert("Error saving user: " + error.message);
        else {
            this.closeModal();
            location.reload(); 
        }
    },

    async deleteUser(email) {
        if (confirm(`Remove ${email} from the system? This is permanent.`)) {
            const { error } = await supabase.from('users').delete().eq('email', email);
            if (error) alert("Error: " + error.message);
            else location.reload();
        }
    },

    async saveTask(e) {
        e.preventDefault();
        const task_name = document.getElementById("task-name").value;
        const project_id = document.getElementById("task-project").value;
        const assigned_to = document.getElementById("task-assigned").value;
        const deadline = document.getElementById("task-deadline").value;
        const status = "Pending";

        const { error } = await supabase.from('tasks').insert({ task_name, project_id, assigned_to, deadline, status });
        
        if (error) alert("Error saving task: " + error.message);
        else {
            this.closeModal();
            location.reload();
        }
    },

    async deleteTask(id) {
        if (confirm(`Delete task ${id}?`)) {
            const { error } = await supabase.from('tasks').delete().eq('id', id);
            if (error) alert("Error: " + error.message);
            else location.reload();
        }
    },

    // UI Helpers
    closeModal() { document.getElementById("admin-modal").style.display = "none"; },
    editUser(email) { this.openUserModal(email); },
    editTask(id) { this.openTaskModal(id); },

    openUserModal(email = null) {
        const modal = document.getElementById("admin-modal");
        const title = document.getElementById("modal-title");
        const fields = document.getElementById("modal-fields");
        const form = document.getElementById("admin-form");
        const user = email ? Store.users.find(u => u.email === email) : null;

        title.innerText = user ? "Edit User" : "Add New User";
        form.onsubmit = (e) => this.saveUser(e);
        
        fields.innerHTML = `
            <div class="form-group"><label>Name</label><input type="text" id="form-name" class="form-control" value="${user?.name || ''}"></div>
            <div class="form-group"><label>Email</label><input type="email" id="form-email" class="form-control" value="${user?.email || ''}" ${user ? 'disabled' : ''}></div>
            <div class="form-group">
                <label>Role</label>
                <select id="form-role" class="form-control">
                    <option value="admin" ${user?.role === 'admin' ? 'selected' : ''}>Admin</option>
                    <option value="editor" ${user?.role === 'editor' ? 'selected' : ''}>Editor</option>
                    <option value="dop" ${user?.role === 'dop' ? 'selected' : ''}>DOP</option>
                </select>
            </div>
        `;
        modal.style.display = "flex";
    },

    openTaskModal(id = null) {
        const modal = document.getElementById("admin-modal");
        const title = document.getElementById("modal-title");
        const fields = document.getElementById("modal-fields");
        const form = document.getElementById("admin-form");
        const task = id ? Store.tasks.find(t => t.id === id) : null;

        title.innerText = task ? "Edit Task" : "Create Task";
        form.onsubmit = (e) => this.saveTask(e);

        fields.innerHTML = `
            <div class="form-group"><label>Task Name</label><input type="text" id="task-name" class="form-control" value="${task?.task_name || ''}"></div>
            <div class="form-group"><label>Project ID</label><input type="text" id="task-project" class="form-control" value="${task?.project_id || ''}"></div>
            <div class="form-group"><label>Assigned To</label><input type="text" id="task-assigned" class="form-control" value="${task?.assigned_to || ''}"></div>
            <div class="form-group"><label>Deadline</label><input type="date" id="task-deadline" class="form-control" value="${task?.deadline || ''}"></div>
        `;
        modal.style.display = "flex";
    }
};

const router = {
    async loadPage(page) {
        const appView = document.getElementById("app-view");
        const projectDetailView = document.getElementById("project-detail-view");
        
        document.querySelectorAll(".nav-link").forEach(link => {
            link.classList.remove("active");
            if (link.dataset.page === page) link.classList.add("active");
        });

        document.getElementById("page-title").innerText = page.replace('-', ' ').toUpperCase();
        appView.style.display = "block";
        projectDetailView.style.display = "none";

        switch(page) {
            case 'dashboard': appView.innerHTML = UI.renderDashboard(); break;
            case 'manage-users': appView.innerHTML = this.renderTable('Users', Store.users, ['name', 'email', 'role']); break;
            case 'manage-tasks': appView.innerHTML = this.renderTable('Tasks', Store.tasks, ['task_name', 'project_id', 'status']); break;
            case 'projects': appView.innerHTML = this.renderTable('Projects', Store.projects, ['project_name', 'client', 'status']); break;
            case 'payments': appView.innerHTML = this.renderTable('Payments', Store.payments, ['type', 'amount', 'status']); break;
        }
        lucide.createIcons();
    },

    renderTable(title, data, fields) {
        const isManageUsers = title === 'Users';
        const isManageTasks = title === 'Tasks';

        return `
            <div class="action-bar">
                <h3>${title}</h3>
                ${(isManageUsers || isManageTasks) ? `<button class="btn-primary" onclick="UI.open${title}Modal()" style="width: auto; padding: 10px 20px;">+ Add ${title}</button>` : ''}
            </div>
            <div class="content-card">
                <table>
                    <thead><tr>${fields.map(f => `<th>${f.replace('_', ' ')}</th>`).join('')}${isManageUsers || isManageTasks ? '<th>Actions</th>' : ''}</tr></thead>
                    <tbody>
                        ${data.map(item => `
                            <tr>
                                ${fields.map(f => `<td>${item[f]}</td>`).join('')}
                                ${isManageUsers ? `<td><button class="btn-sm btn-success" onclick="UI.editUser('${item.email}')">Edit</button> <button class="btn-sm btn-danger" onclick="UI.deleteUser('${item.email}')">Del</button></td>` : ''}
                                ${isManageTasks ? `<td><button class="btn-sm btn-success" onclick="UI.editTask(${item.id})">Edit</button> <button class="btn-sm btn-danger" onclick="UI.deleteTask(${item.id})">Del</button></td>` : ''}
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    }
};

// Start
document.addEventListener("DOMContentLoaded", async () => {
    const user = currentUser;
    if (!user) return;

    if (user.role === 'admin') document.getElementById("admin-nav").style.display = "block";
    document.getElementById("user-name").innerText = user.name;
    document.getElementById("user-role").innerText = user.role;
    document.getElementById("user-avatar").innerText = user.name[0];

    if (await Store.init()) router.loadPage('dashboard');

    document.querySelectorAll(".nav-link").forEach(link => {
        link.addEventListener("click", (e) => {
            e.preventDefault();
            router.loadPage(link.dataset.page);
        });
    });
});
