
document.addEventListener('DOMContentLoaded', init);

// ========================================
// 1. ДАННЫЕ
// ========================================

const MONTHS_NOMINATIVE = [
    'январь', 'февраль', 'март', 'апрель',
    'май', 'июнь', 'июль', 'август',
    'сентябрь', 'октябрь', 'ноябрь', 'декабрь'
];

const MONTHS_GENITIVE = [
    'января', 'февраля', 'марта', 'апреля',
    'мая', 'июня', 'июля', 'августа',
    'сентября', 'октября', 'ноября', 'декабря'
];

const DAYS_OF_WEEK = [
    'Воскресенье', 'Понедельник', 'Вторник',
    'Среда', 'Четверг', 'Пятница', 'Суббота'
];

const WEEKDAYS = ['ПН', 'ВТ', 'СР', 'ЧТ', 'ПТ', 'СБ', 'ВС'];

const ALL_TIMES = [
    '09:00', '09:30', '10:00', '10:30',
    '11:00', '11:30', '12:00', '12:30',
    '13:00', '13:30', '14:00', '14:30',
    '15:00', '15:30', '16:00', '16:30',
    '17:00', '17:30', '18:00', '18:30',
    '19:00', '19:30'
];

// Получаем сегодняшнюю дату без учёта времени.
const now = new Date();

const TODAY = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate()
);

// ========================================
// 2. СОСТОЯНИЕ
// ========================================

const state = {
    currentMonth: TODAY.getMonth(),
    currentYear: TODAY.getFullYear(),
    selectedDay: TODAY.getDate(),
    selectedTime: null,
    slots: []
};

// ========================================
// 3. ЧИСТЫЕ ФУНКЦИИ
// ========================================

// Сравниваем две даты без учёта времени.
function compareDates(date1, date2) {
    const first = new Date(
        date1.getFullYear(),
        date1.getMonth(),
        date1.getDate()
    );

    const second = new Date(
        date2.getFullYear(),
        date2.getMonth(),
        date2.getDate()
    );

    if (first.getTime() < second.getTime()) return -1;
    if (first.getTime() > second.getTime()) return 1;

    return 0;
}

// Проверяем, можно ли выбрать день.
function isDateSelectable(day, month, year, today) {
    const date = new Date(year, month, day);

    return compareDates(date, today) >= 0;
}

// Строим календарную сетку.
function buildCalendarGrid(year, month) {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    const daysInMonth = lastDay.getDate();
    const startDay = firstDay.getDay();

    // В России неделя начинается с понедельника.
    const offset = startDay === 0 ? 6 : startDay - 1;

    const prevMonthLastDay = new Date(year, month, 0).getDate();
    const cells = [];

    for (let i = offset - 1; i >= 0; i--) {
        cells.push({
            day: prevMonthLastDay - i,
            otherMonth: true
        });
    }

    for (let day = 1; day <= daysInMonth; day++) {
        cells.push({
            day,
            otherMonth: false
        });
    }

    let nextDay = 1;

    while (cells.length % 7 !== 0) {
        cells.push({
            day: nextDay++,
            otherMonth: true
        });
    }

    const weeks = [];

    for (let i = 0; i < cells.length; i += 7) {
        weeks.push(cells.slice(i, i + 7));
    }

    return weeks;
}

// Форматируем дату для атрибута data-date.
function getDateKey(year, month, day) {
    const mm = String(month + 1).padStart(2, '0');
    const dd = String(day).padStart(2, '0');

    return `${year}-${mm}-${dd}`;
}

// Формируем дату для нижней панели.
function formatSelectedDate() {
    const date = new Date(
        state.currentYear,
        state.currentMonth,
        state.selectedDay
    );

    const weekday = DAYS_OF_WEEK[date.getDay()];
    const month = MONTHS_GENITIVE[state.currentMonth];

    return `${weekday}, ${state.selectedDay} ${month} ${state.currentYear}`;
}

// ========================================
// 4. РАБОТА СО СЛОТАМИ
// ========================================

// Генерируем демонстрационные слоты.
// Часть времени занята, часть доступна.
function getSlotsForDate(day, month, year) {
    const date = new Date(year, month, day);

    // В воскресеньесалон закрыт.
    if (date.getDay() === 0) {
        return [];
    }

    const seed = day + month * 3 + year;

    return ALL_TIMES.map((time, index) => {
        const hour = Number(time.split(':')[0]);

        let available = (seed + index * 7) % 5 !== 0;

        // Прошедшее время сегодня недоступно.
        if (compareDates(date, TODAY) === 0) {
            const currentTime = now.getHours() * 60 + now.getMinutes();
            const slotTime = hour * 60 + Number(time.split(':')[1]);

            if (slotTime <= currentTime) {
                available = false;
            }
        }

        return {
            time,
            available
        };
    });
}

// ========================================
// 5. ПОИСК ЭЛЕМЕНТОВ
// ========================================

const calendarElement = document.querySelector('.calendar');
const monthElement = document.querySelector('.month h3');
const monthArrows = document.querySelectorAll('.month .arrow');

const timeGroups = document.querySelectorAll('.time-group');
const summaryElement = document.querySelector('.summary');
const continueButton = document.querySelector('.continue-button');

// ========================================
// 6. ОТРИСОВКА КАЛЕНДАРЯ
// ========================================

function renderCalendar() {
    if (!calendarElement) return;

    monthElement.textContent =
        `${MONTHS_NOMINATIVE[state.currentMonth]} ${state.currentYear}`;

    const weeks = buildCalendarGrid(
        state.currentYear,
        state.currentMonth
    );

    let html = WEEKDAYS.map(day =>
        `<span class="weekday">${day}</span>`
    ).join('');

    weeks.forEach(week => {
        week.forEach(cell => {
            const day = cell.day;

            if (cell.otherMonth) {
                html += `<span class="day muted">${day}</span>`;
                return;
            }

            const selectable = isDateSelectable(
                day,
                state.currentMonth,
                state.currentYear,
                TODAY
            );

            const isSelected = day === state.selectedDay;
            const dateKey = getDateKey(
                state.currentYear,
                state.currentMonth,
                day
            );

            const classes = ['day'];

            if (!selectable) classes.push('muted', 'disabled');
            if (isSelected) classes.push('selected');

            html += `
                <button
                    type="button"
                    class="${classes.join(' ')}"
                    data-date="${dateKey}"
                    ${selectable ? '' : 'disabled'}
                    aria-pressed="${isSelected}"
                    aria-label="${day} ${MONTHS_GENITIVE[state.currentMonth]}"
                >
                    ${day}
                </button>
            `;
        });
    });

    calendarElement.innerHTML = html;

    // После перерисовки подключаем обработчики к новым кнопкам.
    calendarElement.querySelectorAll('.day[data-date]').forEach(button => {
        button.addEventListener('click', onDayClick);
    });
}

// ========================================
// 7. ОТРИСОВКА ВРЕМЕНИ
// ========================================

function renderTimeSlots() {
    state.slots = getSlotsForDate(
        state.selectedDay,
        state.currentMonth,
        state.currentYear
    );

    const groups = [
        state.slots.filter(slot => Number(slot.time.slice(0, 2)) < 12),
        state.slots.filter(slot => {
            const hour = Number(slot.time.slice(0, 2));
            return hour >= 12 && hour < 17;
        }),
        state.slots.filter(slot => Number(slot.time.slice(0, 2)) >= 17)
    ];

    timeGroups.forEach((group, groupIndex) => {
        const grid = group.querySelector('.time-grid');

        if (!grid) return;

        const slots = groups[groupIndex];

        if (slots.length === 0) {
            grid.innerHTML = '<p class="empty-slots">Нет доступного времени</p>'

;
            return;
        }

        grid.innerHTML = slots.map(slot => {
            const selected = state.selectedTime === slot.time;

            return `
                <button
                    type="button"
                    class="time-slot ${slot.available ? '' : 'busy'} ${selected ? 'selected-time' : ''}"
                    data-time="${slot.time}"
                    ${slot.available ? '' : 'disabled'}
                    aria-pressed="${selected}"
                >
                    ${slot.time}
                </button>
            `;
        }).join('');

        grid.querySelectorAll('.time-slot:not(:disabled)').forEach(button => {
            button.addEventListener('click', onTimeSlotClick);
        });
    });
}

// ========================================
// 8. ОБНОВЛЕНИЕ НИЖНЕЙ ПАНЕЛИ
// ========================================

function updateBottomBar() {
    if (!summaryElement) return;

    const strong = summaryElement.querySelector('strong');
    const paragraph = summaryElement.querySelector('p');

    if (strong) {
        strong.textContent = state.selectedTime
            ? `${formatSelectedDate()} • ${state.selectedTime}`
            : formatSelectedDate();
    }

    if (paragraph) {
        paragraph.textContent = state.selectedTime
            ? 'Время визита выбрано'
            : 'Теперь выберите свободное время выше';
    }

    if (continueButton) {
        continueButton.disabled = !state.selectedTime;
    }
}

// ========================================
// 9. ОБРАБОТЧИКИ
// ========================================

function onDayClick(event) {
    const button = event.currentTarget;

    if (button.disabled) return;

    const [year, month, day] = button.dataset.date
        .split('-')
        .map(Number);

    state.currentYear = year;
    state.currentMonth = month - 1;
    state.selectedDay = day;

    // При смене дня сбрасываем выбранное время.
    state.selectedTime = null;

    renderCalendar();
    renderTimeSlots();
    updateBottomBar();
}

function onTimeSlotClick(event) {
    const button = event.currentTarget;

    state.selectedTime = button.dataset.time;

    renderTimeSlots();
    updateBottomBar();
}

// Переключение месяца.
function changeMonth(direction) {
    const newDate = new Date(
        state.currentYear,
        state.currentMonth + direction,
        1
    );

    state.currentYear = newDate.getFullYear();
    state.currentMonth = newDate.getMonth();

    const daysInMonth = new Date(
        state.currentYear,
        state.currentMonth + 1,
        0
    ).getDate();

    // Стараемся сохранить число, если оно есть в новом месяце.
    state.selectedDay = Math.min(state.selectedDay, daysInMonth);

    const selectedDate = new Date(
        state.currentYear,
        state.currentMonth,
        state.selectedDay
    );

    // Не оставляем выбранной дату из прошлого.
    if (compareDates(selectedDate, TODAY) < 0) {
        state.selectedDay = TODAY.getDate();
        state.currentMonth = TODAY.getMonth();
        state.currentYear = TODAY.getFullYear();
    }

    state.selectedTime = null;

    renderCalendar();
    renderTimeSlots();
    updateBottomBar();
}

// ========================================
// 10. ИНИЦИАЛИЗАЦИЯ
// ========================================

function init() {
    if (!calendarElement || !monthElement) {
        console.error('Не найдены элементы календаря.');
        return;
    }

    // Находим первый день, который можно выбрать.
    if (!isDateSelectable(
        state.selectedDay,
        state.currentMonth,
        state.currentYear,
        TODAY
    )) {
        state.selectedDay = TODAY.getDate();
        state.currentMonth = TODAY.getMonth();
        state.currentYear = TODAY.getFullYear();
    }

    // Стрелки переключения месяцев.
    if (monthArrows.length >= 2) {
        monthArrows[0].addEventListener('click', () => changeMonth(-1));
        monthArrows[1].addEventListener('click', () => changeMonth(1));

monthArrows.forEach(arrow => {
            arrow.setAttribute('role', 'button');
            arrow.setAttribute('tabindex', '0');

            arrow.addEventListener('keydown', event => {
                if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    arrow.click();
                }
            });
        });
    }

    // Кнопка продолжения.
    if (continueButton) {
        continueButton.addEventListener('click', () => {
            if (!state.selectedTime) {
                alert('Пожалуйста, выберите дату и время.');
                return;
            }

            alert(
                `Вы выбрали запись:\n${formatSelectedDate()}\nВремя: ${state.selectedTime}`
            );
        });
    }

    // Первый рендер.
    renderCalendar();
    renderTimeSlots();
    updateBottomBar();
}
