// Global App Functions
function updateNavigation() {
    const currentUser = db.getCurrentUser();
    const loginLink = document.getElementById('loginLink');
    const dashboardLink = document.getElementById('dashboardLink');
    const logoutLink = document.getElementById('logoutLink');

    if (currentUser && loginLink) {
        loginLink.style.display = 'none';
    }
    if (currentUser && dashboardLink) {
        dashboardLink.style.display = 'inline-block';
    }
    if (!currentUser && dashboardLink) {
        dashboardLink.style.display = 'none';
    }
    if (logoutLink && !currentUser) {
        logoutLink.style.display = 'none';
    }
}

function logout(event) {
    event.preventDefault();
    db.setCurrentUser(null);
    window.location.href = 'index.html';
}

function requireAuth() {
    const currentUser = db.getCurrentUser();
    if (!currentUser) {
        window.location.href = 'login.html';
        return false;
    }
    return true;
}

function hashPassword(password) {
    // PBKDF2-inspired hashing with salt and iterations
    // Note: For production, use backend-based hashing (bcrypt/Argon2)
    const salt = 'golf_app_security_' + password.length; // Static salt for consistency
    let hash = salt;
    
    // Multiple iterations to slow down brute force
    for (let iteration = 0; iteration < 10000; iteration++) {
        hash = simpleHash(hash + password);
    }
    
    return hash;
}

function simpleHash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    return Math.abs(hash).toString(16);
}

// XSS Protection: Sanitize user input
function sanitizeInput(input) {
    const div = document.createElement('div');
    div.textContent = input;
    return div.innerHTML;
}

// Validate and sanitize email
function sanitizeEmail(email) {
    return email.trim().toLowerCase();
}

// Mobile Menu Toggle
document.addEventListener('DOMContentLoaded', function() {
    const hamburger = document.getElementById('hamburger');
    const navLinks = document.getElementById('navLinks');

    if (hamburger) {
        hamburger.addEventListener('click', function() {
            navLinks?.classList.toggle('active');
        });

        // Close menu when link clicked
        const links = navLinks?.querySelectorAll('.nav-link');
        links?.forEach(link => {
            link.addEventListener('click', function() {
                navLinks.classList.remove('active');
            });
        });
    }

    // Handle logout link
    const logoutLink = document.getElementById('logoutLink');
    if (logoutLink) {
        logoutLink.addEventListener('click', logout);
    }

    // Update navigation on page load
    updateNavigation();

    // Register Service Worker
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('service-worker.js').catch(error => {
            console.log('Service Worker registration failed:', error);
        });
    }
});
