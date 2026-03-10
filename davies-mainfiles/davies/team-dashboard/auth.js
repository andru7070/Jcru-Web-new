/**
 * Jcru Team Dashboard - Supabase Auth & Session Logic
 */

// Replace these with your actual Supabase credentials
const SUPABASE_URL = "https://your-project-url.supabase.co"; 
const SUPABASE_KEY = "your-anon-key";

const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// Check Session
function checkSession() {
    const user = sessionStorage.getItem("user");
    const isLoginPage = window.location.pathname.includes("login.html");

    if (!user && !isLoginPage) {
        window.location.href = "login.html";
        return null;
    }
    
    if (user && isLoginPage) {
        window.location.href = "dashboard.html";
        return JSON.parse(user);
    }

    return user ? JSON.parse(user) : null;
}

// Login Function using Supabase
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

        const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('email', email)
            .single();

        if (error || !data) {
            errorDiv.innerText = "Access Denied: Email not registered";
            btn.innerText = "Login";
            btn.disabled = false;
        } else {
            sessionStorage.setItem("user", JSON.stringify(data));
            window.location.href = "dashboard.html";
        }
    } catch (err) {
        console.error("Login Error:", err);
        errorDiv.innerText = "Database Error: Connection failed";
        btn.innerText = "Login";
        btn.disabled = false;
    }
}

function logout() {
    sessionStorage.removeItem("user");
    window.location.href = "login.html";
}

const currentUser = checkSession();

