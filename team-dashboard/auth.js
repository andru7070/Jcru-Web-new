/**
 * Jcru Team Dashboard - Auth & Session Logic
 */

// CSV Parser Helper
function parseCSV(text) {
    const lines = text.split('\n').filter(line => line.trim() !== '');
    const headers = lines[0].split(',');
    return lines.slice(1).map(line => {
        const values = line.split(',');
        const obj = {};
        headers.forEach((header, i) => {
            obj[header.trim()] = values[i] ? values[i].trim() : '';
        });
        return obj;
    });
}

// Check Session on Protected Pages
function checkSession() {
    const user = sessionStorage.getItem("user");
    const isLoginPage = window.location.pathname.includes("login.html");

    if (!user && !isLoginPage) {
        window.location.href = "login.html";
        return null;
    }
    
    if (user && isLoginPage) {
        window.location.href = "dashboard.html";
        return user;
    }

    return user ? JSON.parse(user) : null;
}

// Login Function
async function login() {
    const emailInput = document.getElementById("email");
    const errorDiv = document.getElementById("error");
    const email = emailInput.value.trim().toLowerCase();
    const btn = document.querySelector('.btn-primary');

    if (!email) {
        errorDiv.innerText = "Please enter your email";
        return;
    }

    try {
        btn.innerText = "Authenticating...";
        btn.disabled = true;

        const response = await fetch("data/users.csv");
        if (!response.ok) throw new Error("Could not find users database");
        
        const text = await response.text();
        const users = parseCSV(text);
        
        const user = users.find(u => u.email.toLowerCase() === email);

        if (user) {
            sessionStorage.setItem("user", JSON.stringify(user));
            window.location.href = "dashboard.html";
        } else {
            errorDiv.innerText = "Access Denied: Email not registered";
            btn.innerText = "Login";
            btn.disabled = false;
        }
    } catch (error) {
        console.error("Login Error:", error);
        errorDiv.innerText = "Server Error: Unable to access data";
        btn.innerText = "Login";
        btn.disabled = false;
    }
}

// Logout Function
function logout() {
    sessionStorage.removeItem("user");
    window.location.href = "login.html";
}

// Initialize session check
const currentUser = checkSession();
