// Dashboard Page Functions
document.addEventListener('DOMContentLoaded', async function() {
    if (!requireAuth()) return;

    const currentUser = db.getCurrentUser();
    if (!currentUser) return;

    displayUserProfile(currentUser);

    const editBtn = document.getElementById('editProfileBtn');
    if (editBtn) editBtn.addEventListener('click', () => editProfileMode(currentUser));

    const editForm = document.getElementById('editProfileForm');
    if (editForm) editForm.addEventListener('submit', saveProfile);

    try {
        const bookings = await db.getBookings(currentUser.id);
        document.getElementById('bookingCount').textContent = bookings.length;
        document.getElementById('totalBookings').textContent = bookings.length;

        const currentMonth = new Date().toISOString().slice(0, 7);
        const thisMonth = bookings.filter(b => b.date.startsWith(currentMonth)).length;
        document.getElementById('thisMonthBookings').textContent = thisMonth;
    } catch (e) {
        console.warn('Buchungen konnten nicht geladen werden:', e.message);
    }
});

function displayUserProfile(user) {
    document.getElementById('userNickname').textContent = user.nickname || '-';
    document.getElementById('userName').textContent = `${user.firstName} ${user.lastName}`;
    document.getElementById('userEmail').textContent = user.email;
    document.getElementById('userPhone').textContent = user.phone || '-';
    document.getElementById('memberNumber').textContent = user.memberNumber;
    document.getElementById('joinDate').textContent = new Date(user.joinDate).toLocaleDateString('de-CH');
}

function editProfileMode(user) {
    document.getElementById('editNickname').value = user.nickname || '';
    document.getElementById('editFirstName').value = user.firstName;
    document.getElementById('editLastName').value = user.lastName;
    document.getElementById('editPhone').value = user.phone || '';
    document.getElementById('profileDisplay').style.display = 'none';
    document.getElementById('profileEdit').style.display = 'block';
}

function cancelEditProfile() {
    document.getElementById('profileDisplay').style.display = 'block';
    document.getElementById('profileEdit').style.display = 'none';
    const editError = document.getElementById('editError');
    editError.style.display = 'none';
}

async function saveProfile(event) {
    event.preventDefault();

    const currentUser = db.getCurrentUser();
    const editError = document.getElementById('editError');
    if (!currentUser) { window.location.href = 'login.html'; return; }

    const nickname = document.getElementById('editNickname').value.trim();
    const firstName = document.getElementById('editFirstName').value.trim();
    const lastName = document.getElementById('editLastName').value.trim();
    const phone = document.getElementById('editPhone').value.trim();

    if (!firstName || !lastName) {
        editError.textContent = 'Vorname und Nachname sind erforderlich';
        editError.className = 'error-message';
        editError.style.display = 'block';
        return;
    }

    const updatedUser = { ...currentUser, firstName, lastName, nickname, phone };

    try {
        await db.saveUser(updatedUser);
        db.setCurrentUser(updatedUser);

        editError.textContent = 'Profil erfolgreich aktualisiert!';
        editError.className = 'success-message';
        editError.style.display = 'block';

        setTimeout(() => {
            cancelEditProfile();
            displayUserProfile(updatedUser);
        }, 1500);
    } catch (e) {
        editError.textContent = 'Fehler beim Speichern. Bitte Server prüfen.';
        editError.className = 'error-message';
        editError.style.display = 'block';
    }
}
