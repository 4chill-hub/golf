// Authentication Functions
document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');

    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }

    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
    }
});

async function handleLogin(event) {
    event.preventDefault();

    const errorMessage = document.getElementById('errorMessage');
    const submitBtn = event.target.querySelector('[type="submit"]');

    if (isLoginRateLimited()) {
        showError(errorMessage, 'Zu viele Anmeldeversuche. Bitte später versuchen.');
        return;
    }

    const email = sanitizeEmail(document.getElementById('email').value);
    const password = document.getElementById('password').value;

    if (!email || !password) {
        recordFailedLogin(email);
        showError(errorMessage, 'Bitte füllen Sie alle Felder aus');
        return;
    }

    if (!isValidEmail(email)) {
        recordFailedLogin(email);
        showError(errorMessage, 'Ungültige Email-Adresse');
        return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = 'Anmelden...';

    try {
        const user = await db.getUser(email);

        if (!user) {
            recordFailedLogin(email);
            showError(errorMessage, 'Benutzer oder Passwort ungültig');
            return;
        }

        const passwordHash = hashPassword(password);
        if (user.passwordHash !== passwordHash) {
            recordFailedLogin(email);
            showError(errorMessage, 'Benutzer oder Passwort ungültig');
            return;
        }

        clearFailedLogins(email);

        const sessionData = {
            id: user.id,
            email: user.email,
            firstName: sanitizeInput(user.firstName),
            lastName: sanitizeInput(user.lastName),
            nickname: sanitizeInput(user.nickname || ''),
            memberNumber: user.memberNumber,
            phone: sanitizeInput(user.phone || ''),
            joinDate: user.joinDate,
            loginTime: Date.now(),
            sessionTimeout: 30 * 60 * 1000
        };

        db.setCurrentUser(sessionData);
        window.location.href = 'dashboard.html';
    } catch (err) {
        showError(errorMessage, 'Verbindungsfehler. Bitte Server starten.');
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Anmelden';
    }
}

async function handleRegister(event) {
    event.preventDefault();

    const firstName = sanitizeInput(document.getElementById('firstName').value.trim());
    const lastName = sanitizeInput(document.getElementById('lastName').value.trim());
    const email = sanitizeEmail(document.getElementById('email').value);
    const phone = sanitizeInput(document.getElementById('phone').value.trim());
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const errorMessage = document.getElementById('errorMessage');
    const submitBtn = event.target.querySelector('[type="submit"]');

    if (!firstName || !lastName || !email || !password) {
        showError(errorMessage, 'Bitte füllen Sie alle erforderlichen Felder aus');
        return;
    }
    if (firstName.length < 2 || firstName.length > 100) {
        showError(errorMessage, 'Vorname muss zwischen 2 und 100 Zeichen lang sein');
        return;
    }
    if (lastName.length < 2 || lastName.length > 100) {
        showError(errorMessage, 'Nachname muss zwischen 2 und 100 Zeichen lang sein');
        return;
    }
    if (password.length < 8) {
        showError(errorMessage, 'Passwort muss mindestens 8 Zeichen lang sein');
        return;
    }
    if (password.length > 256) {
        showError(errorMessage, 'Passwort ist zu lang');
        return;
    }
    if (password !== confirmPassword) {
        showError(errorMessage, 'Passwörter stimmen nicht überein');
        return;
    }
    if (!isValidEmail(email)) {
        showError(errorMessage, 'Ungültige Email-Adresse');
        return;
    }
    if (phone && phone.length > 20) {
        showError(errorMessage, 'Telefonnummer ist zu lang');
        return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = 'Registrieren...';

    try {
        const existing = await db.getUser(email);
        if (existing) {
            showError(errorMessage, 'Benutzer mit dieser Email existiert bereits');
            return;
        }

        const newUser = {
            id: 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
            email,
            firstName,
            lastName,
            nickname: '',
            phone: phone || '',
            memberNumber: 'MEM-' + Date.now(),
            joinDate: new Date().toISOString().split('T')[0],
            status: 'active',
            passwordHash: hashPassword(password),
            createdAt: new Date().toISOString()
        };

        await db.saveUser(newUser);

        const sessionData = {
            id: newUser.id,
            email: newUser.email,
            firstName: newUser.firstName,
            lastName: newUser.lastName,
            nickname: newUser.nickname,
            memberNumber: newUser.memberNumber,
            phone: newUser.phone,
            joinDate: newUser.joinDate,
            loginTime: Date.now(),
            sessionTimeout: 30 * 60 * 1000
        };

        db.setCurrentUser(sessionData);
        window.location.href = 'dashboard.html';
    } catch (err) {
        showError(errorMessage, 'Verbindungsfehler. Bitte Server starten.');
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Registrieren';
    }
}

function showError(element, message) {
    if (element) {
        element.textContent = message;
        element.style.display = 'block';
    }
}

function isValidEmail(email) {
    if (email.length > 254) return false;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Rate limiting: Max 5 failed attempts per 15 minutes
function isLoginRateLimited() {
    const attempts = JSON.parse(localStorage.getItem('golf_app_failed_login_attempts') || '{}');
    const now = Date.now();
    const timeWindow = 15 * 60 * 1000;
    for (let e in attempts) {
        attempts[e] = attempts[e].filter(t => now - t < timeWindow);
        if (attempts[e].length > 5) return true;
    }
    return false;
}

function recordFailedLogin(email) {
    const attempts = JSON.parse(localStorage.getItem('golf_app_failed_login_attempts') || '{}');
    if (!attempts[email]) attempts[email] = [];
    attempts[email].push(Date.now());
    localStorage.setItem('golf_app_failed_login_attempts', JSON.stringify(attempts));
}

function clearFailedLogins(email) {
    const attempts = JSON.parse(localStorage.getItem('golf_app_failed_login_attempts') || '{}');
    delete attempts[email];
    localStorage.setItem('golf_app_failed_login_attempts', JSON.stringify(attempts));
}

function handleLogin(event) {
    event.preventDefault();

    const errorMessage = document.getElementById('errorMessage');
    
    // Rate limiting check
    if (isLoginRateLimited()) {
        showError(errorMessage, 'Zu viele Anmeldeversuche. Bitte später versuchen.');
        return;
    }

    const email = sanitizeEmail(document.getElementById('email').value);
    const password = document.getElementById('password').value;

    // Validation
    if (!email || !password) {
        recordFailedLogin(email);
        showError(errorMessage, 'Bitte füllen Sie alle Felder aus');
        return;
    }

    // Validate email format
    if (!isValidEmail(email)) {
        recordFailedLogin(email);
        showError(errorMessage, 'Ungültige Email-Adresse');
        return;
    }

    // Check user
    const user = db.getUser(email);

    if (!user) {
        recordFailedLogin(email);
        showError(errorMessage, 'Benutzer oder Passwort ungültig');
        return;
    }

    // Verify password
    const passwordHash = hashPassword(password);
    if (user.passwordHash !== passwordHash) {
        recordFailedLogin(email);
        showError(errorMessage, 'Benutzer oder Passwort ungültig');
        return;
    }

    // Clear failed login attempts
    clearFailedLogins(email);

    // Login successful - create session with timeout
    const sessionData = {
        id: user.id,
        email: user.email,
        firstName: sanitizeInput(user.firstName),
        lastName: sanitizeInput(user.lastName),
        nickname: sanitizeInput(user.nickname || ''),
        memberNumber: user.memberNumber,
        phone: sanitizeInput(user.phone),
        joinDate: user.joinDate,
        loginTime: Date.now(),
        sessionTimeout: 30 * 60 * 1000 // 30 minutes
    };
    
    db.setCurrentUser(sessionData);

    // Redirect to dashboard
    window.location.href = 'dashboard.html';
}

function handleRegister(event) {
    event.preventDefault();

    const firstName = sanitizeInput(document.getElementById('firstName').value.trim());
    const lastName = sanitizeInput(document.getElementById('lastName').value.trim());
    const email = sanitizeEmail(document.getElementById('email').value);
    const phone = sanitizeInput(document.getElementById('phone').value.trim());
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const errorMessage = document.getElementById('errorMessage');

    // Validation
    if (!firstName || !lastName || !email || !password) {
        showError(errorMessage, 'Bitte füllen Sie alle erforderlichen Felder aus');
        return;
    }

    if (firstName.length < 2 || firstName.length > 100) {
        showError(errorMessage, 'Vorname muss zwischen 2 und 100 Zeichen lang sein');
        return;
    }

    if (lastName.length < 2 || lastName.length > 100) {
        showError(errorMessage, 'Nachname muss zwischen 2 und 100 Zeichen lang sein');
        return;
    }

    if (password.length < 8) {
        showError(errorMessage, 'Passwort muss mindestens 8 Zeichen lang sein');
        return;
    }

    if (password.length > 256) {
        showError(errorMessage, 'Passwort ist zu lang');
        return;
    }

    if (password !== confirmPassword) {
        showError(errorMessage, 'Passwörter stimmen nicht überein');
        return;
    }

    if (!isValidEmail(email)) {
        showError(errorMessage, 'Ungültige Email-Adresse');
        return;
    }

    if (phone && phone.length > 20) {
        showError(errorMessage, 'Telefonnummer ist zu lang');
        return;
    }

    // Check if user exists
    if (db.getUser(email)) {
        showError(errorMessage, 'Benutzer mit dieser Email existiert bereits');
        return;
    }

    // Create user
    const newUser = {
        id: 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
        email: email,
        firstName: firstName,
        lastName: lastName,
        nickname: '',
        phone: phone || '',
        memberNumber: 'MEM-' + Date.now(),
        joinDate: new Date().toISOString().split('T')[0],
        status: 'active',
        passwordHash: hashPassword(password),
        createdAt: new Date().toISOString()
    };

    db.saveUser(newUser);

    // Auto login with session timeout
    const sessionData = {
        id: newUser.id,
        email: newUser.email,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        nickname: newUser.nickname,
        memberNumber: newUser.memberNumber,
        phone: newUser.phone,
        joinDate: newUser.joinDate,
        loginTime: Date.now(),
        sessionTimeout: 30 * 60 * 1000 // 30 minutes
    };
    
    db.setCurrentUser(sessionData);

    // Redirect to dashboard
    window.location.href = 'dashboard.html';
}

function showError(element, message) {
    if (element) {
        element.textContent = message;
        element.style.display = 'block';
    }
}

function isValidEmail(email) {
    if (email.length > 254) return false;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Rate limiting: Max 5 failed attempts per 15 minutes per email
function isLoginRateLimited() {
    const attempts = JSON.parse(localStorage.getItem('golf_app_failed_login_attempts') || '{}');
    const now = Date.now();
    const timeWindow = 15 * 60 * 1000; // 15 minutes
    
    for (let email in attempts) {
        attempts[email] = attempts[email].filter(time => now - time < timeWindow);
        if (attempts[email].length > 5) {
            return true;
        }
    }
    
    return false;
}

function recordFailedLogin(email) {
    const attempts = JSON.parse(localStorage.getItem('golf_app_failed_login_attempts') || '{}');
    if (!attempts[email]) attempts[email] = [];
    attempts[email].push(Date.now());
    localStorage.setItem('golf_app_failed_login_attempts', JSON.stringify(attempts));
}

function clearFailedLogins(email) {
    const attempts = JSON.parse(localStorage.getItem('golf_app_failed_login_attempts') || '{}');
    delete attempts[email];
    localStorage.setItem('golf_app_failed_login_attempts', JSON.stringify(attempts));
}
