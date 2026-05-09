// Authentication Functions

document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');

    initGitHubConfigForm();

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

    try {
        saveGitHubConfigFromForm();
    } catch (err) {
        showError(errorMessage, err.message);
        return;
    }

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
        showError(errorMessage, `Verbindungsfehler. ${err.message}`);
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Anmelden';
    }
}

async function handleRegister(event) {
    event.preventDefault();

    const errorMessage = document.getElementById('errorMessage');
    const submitBtn = event.target.querySelector('[type="submit"]');

    const firstName = sanitizeInput(document.getElementById('firstName').value.trim());
    const lastName = sanitizeInput(document.getElementById('lastName').value.trim());
    const email = sanitizeEmail(document.getElementById('email').value);
    const phone = sanitizeInput(document.getElementById('phone').value.trim());
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

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

    try {
        saveGitHubConfigFromForm();
    } catch (err) {
        showError(errorMessage, err.message);
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
        showError(errorMessage, `Verbindungsfehler. ${err.message}`);
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Registrieren';
    }
}

function initGitHubConfigForm() {
    const config = db.getGitHubConfig();
    const fields = ['githubOwner', 'githubRepo', 'githubBranch', 'githubToken'];
    if (!config) return;

    fields.forEach(fieldId => {
        const el = document.getElementById(fieldId);
        if (!el) return;
        if (fieldId === 'githubBranch') {
            el.value = config.branch || 'main';
            return;
        }
        el.value = config[fieldId.replace('github', '').toLowerCase()] || '';
    });
}

function saveGitHubConfigFromForm() {
    const ownerEl = document.getElementById('githubOwner');
    const repoEl = document.getElementById('githubRepo');
    const branchEl = document.getElementById('githubBranch');
    const tokenEl = document.getElementById('githubToken');

    if (!ownerEl || !repoEl || !tokenEl) {
        return;
    }

    const owner = ownerEl.value.trim();
    const repo = repoEl.value.trim();
    const branch = branchEl.value.trim() || 'main';
    const token = tokenEl.value.trim();

    if (!owner || !repo || !token) {
        throw new Error('GitHub Owner, Repository und Token sind erforderlich.');
    }

    db.saveGitHubConfig({ owner, repo, branch, token });
}

function showError(element, message) {
    if (element) {
        element.textContent = message;
        element.style.display = 'block';
    }
}

function isValidEmail(email) {
    if (!email || email.length > 254) return false;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function isLoginRateLimited() {
    const attempts = JSON.parse(localStorage.getItem('golf_app_failed_login_attempts') || '{}');
    const now = Date.now();
    const timeWindow = 15 * 60 * 1000;

    for (const email in attempts) {
        attempts[email] = attempts[email].filter(time => now - time < timeWindow);
        if (attempts[email].length > 5) {
            return true;
        }
    }

    return false;
}

function recordFailedLogin(email) {
    const attempts = JSON.parse(localStorage.getItem('golf_app_failed_login_attempts') || '{}');
    const key = email || 'unknown';
    if (!attempts[key]) attempts[key] = [];
    attempts[key].push(Date.now());
    localStorage.setItem('golf_app_failed_login_attempts', JSON.stringify(attempts));
}

function clearFailedLogins(email) {
    const attempts = JSON.parse(localStorage.getItem('golf_app_failed_login_attempts') || '{}');
    const key = email || 'unknown';
    delete attempts[key];
    localStorage.setItem('golf_app_failed_login_attempts', JSON.stringify(attempts));
}
