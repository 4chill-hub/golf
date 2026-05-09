// Calendar Page Functions
let currentDate = new Date();

document.addEventListener('DOMContentLoaded', async function() {
    if (!requireAuth()) return;

    const bookingForm = document.getElementById('bookingForm');
    const prevMonthBtn = document.getElementById('prevMonth');
    const nextMonthBtn = document.getElementById('nextMonth');

    if (bookingForm) bookingForm.addEventListener('submit', handleBookingSubmit);
    if (prevMonthBtn) prevMonthBtn.addEventListener('click', previousMonth);
    if (nextMonthBtn) nextMonthBtn.addEventListener('click', nextMonth);

    const today = new Date().toISOString().split('T')[0];
    const bookingDateInput = document.getElementById('bookingDate');
    bookingDateInput.min = today;
    bookingDateInput.value = today;

    bookingDateInput.addEventListener('change', function() {
        setDefaultTimes(this.value);
    });

    initializeTimeDropdowns();
    await setDefaultTimes(today);
    await renderCalendar();
    await renderBookings();
});

function initializeTimeDropdowns() {
    const hours = ['00','01','02','03','04','05','06','07','08','09',
                   '10','11','12','13','14','15','16','17','18','19',
                   '20','21','22','23'];
    const minutes = ['00','15','30','45'];
    const startSel = document.getElementById('startTime');
    const endSel = document.getElementById('endTime');

    hours.forEach(hour => {
        minutes.forEach(minute => {
            const val = `${hour}:${minute}`;
            const o1 = document.createElement('option');
            o1.value = o1.textContent = val;
            startSel.appendChild(o1);
            const o2 = document.createElement('option');
            o2.value = o2.textContent = val;
            endSel.appendChild(o2);
        });
    });
}

async function setDefaultTimes(date) {
    const startSel = document.getElementById('startTime');
    const endSel = document.getElementById('endTime');
    try {
        const allBookings = await db.getBookings();
        const dayBookings = allBookings.filter(b => b.date === date);

        const defaultStart = '18:00';
        const defaultEnd = '19:00';
        const conflict = dayBookings.find(b => defaultStart < b.endTime && defaultEnd > b.startTime);

        if (!conflict) {
            startSel.value = defaultStart;
            endSel.value = defaultEnd;
            return;
        }

        let startHour = 19;
        while (startHour <= 22) {
            const cs = `${String(startHour).padStart(2,'0')}:00`;
            const ce = `${String(startHour + 1).padStart(2,'0')}:00`;
            if (!dayBookings.find(b => cs < b.endTime && ce > b.startTime)) {
                startSel.value = cs;
                endSel.value = ce;
                return;
            }
            startHour++;
        }
        startSel.value = defaultStart;
        endSel.value = defaultEnd;
    } catch (e) {
        startSel.value = '18:00';
        endSel.value = '19:00';
    }
}

function previousMonth() {
    currentDate.setMonth(currentDate.getMonth() - 1);
    renderCalendar();
}

function nextMonth() {
    currentDate.setMonth(currentDate.getMonth() + 1);
    renderCalendar();
}

async function renderCalendar() {
    const monthNames = ['Januar','Februar','März','April','Mai','Juni',
        'Juli','August','September','Oktober','November','Dezember'];
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    document.getElementById('monthYear').textContent = `${monthNames[month]} ${year}`;

    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const container = document.getElementById('calendarDays');
    container.innerHTML = '';

    const currentUser = db.getCurrentUser();
    const userBookings = await db.getBookings(currentUser.id);

    const adjustedFirstDay = firstDay === 0 ? 6 : firstDay - 1;
    for (let i = 0; i < adjustedFirstDay; i++) {
        const el = document.createElement('div');
        el.className = 'calendar-day empty';
        container.appendChild(el);
    }

    for (let day = 1; day <= daysInMonth; day++) {
        const dateStr = `${year}-${String(month + 1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
        const hasBooking = userBookings.some(b => b.date === dateStr);

        const el = document.createElement('div');
        el.className = 'calendar-day' + (hasBooking ? ' has-booking' : '');
        el.textContent = day;
        el.addEventListener('click', () => selectDate(dateStr));
        container.appendChild(el);
    }
}

async function selectDate(dateStr) {
    document.querySelectorAll('.calendar-day.selected').forEach(d => d.classList.remove('selected'));
    document.querySelectorAll('.calendar-day').forEach(d => {
        if (d.textContent === dateStr.split('-')[2] && !d.classList.contains('empty')) {
            d.classList.add('selected');
        }
    });
    document.getElementById('bookingDate').value = dateStr;
    await setDefaultTimes(dateStr);
}

async function handleBookingSubmit(event) {
    event.preventDefault();

    const currentUser = db.getCurrentUser();
    if (!currentUser) { window.location.href = 'login.html'; return; }

    const date = document.getElementById('bookingDate').value;
    const startTime = document.getElementById('startTime').value;
    const endTime = document.getElementById('endTime').value;
    const notes = document.getElementById('notes').value;
    const errorEl = document.getElementById('bookingError');
    const submitBtn = event.target.querySelector('[type="submit"]');

    if (!date || !startTime || !endTime) {
        showBookingError(errorEl, 'Bitte füllen Sie alle erforderlichen Felder aus');
        return;
    }
    if (startTime >= endTime) {
        showBookingError(errorEl, 'Endzeit muss nach Startzeit liegen');
        return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = 'Wird gespeichert...';

    try {
        const allBookings = await db.getBookings();
        const conflict = allBookings.find(b =>
            b.date === date && startTime < b.endTime && endTime > b.startTime
        );
        if (conflict) {
            showBookingError(errorEl, `Um diese Zeit gibt es bereits eine Buchung (${conflict.startTime} - ${conflict.endTime})`);
            return;
        }

        const [sh, sm] = startTime.split(':').map(Number);
        const [eh, em] = endTime.split(':').map(Number);
        const duration = (eh * 60 + em) - (sh * 60 + sm);

        await db.saveBooking({ memberId: currentUser.id, date, startTime, endTime, duration, notes });

        document.getElementById('notes').value = '';
        errorEl.textContent = 'Buchung erfolgreich gespeichert!';
        errorEl.className = 'success-message';
        errorEl.style.display = 'block';
        setTimeout(() => { errorEl.style.display = 'none'; errorEl.className = 'error-message'; }, 3000);

        document.getElementById('bookingDate').value = date;
        await setDefaultTimes(date);
        await renderCalendar();
        await renderBookings();
    } catch (err) {
        showBookingError(errorEl, 'Fehler beim Speichern. Bitte Server prüfen.');
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Buchen';
    }
}

async function renderBookings() {
    const currentUser = db.getCurrentUser();
    if (!currentUser) return;

    const bookings = await db.getBookings(currentUser.id);
    const list = document.getElementById('bookingsList');

    while (list.firstChild) list.removeChild(list.firstChild);

    if (bookings.length === 0) {
        const msg = document.createElement('p');
        msg.className = 'text-muted';
        msg.textContent = 'Noch keine Buchungen';
        list.appendChild(msg);
        return;
    }

    bookings.forEach(booking => {
        const item = document.createElement('div');
        item.className = 'booking-item';

        const details = document.createElement('div');
        details.className = 'booking-details';

        const dateP = document.createElement('p');
        dateP.className = 'booking-date';
        dateP.textContent = new Date(booking.date + 'T12:00:00').toLocaleDateString('de-CH');
        details.appendChild(dateP);

        const timeP = document.createElement('p');
        timeP.className = 'booking-time';
        timeP.textContent = `${booking.startTime} - ${booking.endTime} (${booking.duration} Min)`;
        details.appendChild(timeP);

        if (booking.notes) {
            const notesP = document.createElement('p');
            notesP.className = 'booking-notes';
            notesP.textContent = booking.notes;
            details.appendChild(notesP);
        }

        item.appendChild(details);

        const delBtn = document.createElement('button');
        delBtn.className = 'booking-delete';
        delBtn.textContent = 'Löschen';
        delBtn.addEventListener('click', () => deleteBooking(booking.id));
        item.appendChild(delBtn);

        list.appendChild(item);
    });
}

async function deleteBooking(bookingId) {
    if (!confirm('Möchten Sie diese Buchung wirklich löschen?')) return;
    await db.deleteBooking(bookingId);
    await renderCalendar();
    await renderBookings();
}

function showBookingError(element, message) {
    if (element) {
        element.textContent = message;
        element.className = 'error-message';
        element.style.display = 'block';
    }
}
