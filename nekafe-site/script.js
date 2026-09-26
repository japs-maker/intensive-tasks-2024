// Настройки заведения — меняйте здесь, если изменятся цены или график
const PRICE_PER_MINUTE = 2;
const FREE_AFTER_MINUTES = 240; // после 4 часов время не тарифицируется
// Часы работы по дням недели (0 = воскресенье); close > 24 значит «после полуночи»
const SCHEDULE = {
    0: [12, 24], 1: [12, 24], 2: [12, 24], 3: [12, 24], 4: [12, 24],
    5: [12, 26], 6: [12, 26],
};

// Мобильное меню
const toggle = document.querySelector(".nav__toggle");
const menu = document.getElementById("menu");
toggle.addEventListener("click", () => {
    const open = menu.classList.toggle("is-open");
    toggle.setAttribute("aria-expanded", open);
});
menu.addEventListener("click", (e) => {
    if (e.target.tagName === "A") {
        menu.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
    }
});

// Калькулятор стоимости
const hoursInput = document.getElementById("hours");
const hoursOut = document.getElementById("hoursOut");
const peopleInput = document.getElementById("people");
const totalEl = document.getElementById("total");
const perPersonEl = document.getElementById("perPerson");
const rub = (n) => n.toLocaleString("ru-RU") + " ₽";

function recalc() {
    const minutes = Number(hoursInput.value);
    const people = Math.min(30, Math.max(1, Number(peopleInput.value) || 1));
    const perPerson = Math.min(minutes, FREE_AFTER_MINUTES) * PRICE_PER_MINUTE;
    const h = Math.floor(minutes / 60);
    const m = String(minutes % 60).padStart(2, "0");
    hoursOut.textContent = `${h} ч ${m} мин`;
    totalEl.textContent = rub(perPerson * people);
    perPersonEl.textContent = minutes > FREE_AFTER_MINUTES
        ? `${rub(perPerson)} с человека — дальше бесплатно 🎉`
        : `${rub(perPerson)} с человека`;
}
hoursInput.addEventListener("input", recalc);
peopleInput.addEventListener("input", recalc);
document.querySelectorAll("[data-step]").forEach((btn) => {
    btn.addEventListener("click", () => {
        const next = (Number(peopleInput.value) || 1) + Number(btn.dataset.step);
        peopleInput.value = Math.min(30, Math.max(1, next));
        recalc();
    });
});
recalc();

// Статус «открыто / закрыто» по времени Оренбурга (UTC+5)
function orenburgNow() {
    const now = new Date();
    return new Date(now.getTime() + now.getTimezoneOffset() * 60000 + 5 * 3600000);
}

function updateStatus() {
    const now = orenburgNow();
    const day = now.getDay();
    const hour = now.getHours() + now.getMinutes() / 60;
    const status = document.getElementById("status");
    const fmt = (h) => String(h % 24).padStart(2, "0") + ":00";

    // Проверяем «хвост» вчерашнего дня (работа после полуночи)
    const [, prevClose] = SCHEDULE[(day + 6) % 7];
    const [open, close] = SCHEDULE[day];
    let isOpen = false;
    let closesAt = null;
    if (prevClose > 24 && hour < prevClose - 24) {
        isOpen = true;
        closesAt = prevClose;
    } else if (hour >= open && hour < close) {
        isOpen = true;
        closesAt = close;
    }

    status.classList.toggle("is-open", isOpen);
    status.classList.toggle("is-closed", !isOpen);
    status.textContent = isOpen
        ? `Сейчас открыто · до ${fmt(closesAt)}`
        : `Сейчас закрыто · откроемся в ${fmt(hour < open ? open : SCHEDULE[(day + 1) % 7][0])}`;

    // Подсвечиваем сегодняшнюю строку в таблице часов
    document.querySelectorAll("#hoursTable tr").forEach((row) => {
        row.classList.toggle("is-today", row.dataset.days.split(",").includes(String(day)));
    });
}
updateStatus();
setInterval(updateStatus, 60000);
