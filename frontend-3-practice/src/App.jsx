import { useState } from "react";
import "./index.css";

const MONTHS = [
  "Январь", "Февраль", "Март", "Апрель",
  "Май", "Июнь", "Июль", "Август",
  "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"
];

const MONTHS_GENITIVE = [
  "января", "февраля", "марта", "апреля",
  "мая", "июня", "июля", "августа",
  "сентября", "октября", "ноября", "декабря"
];

const WEEKDAYS = ["ПН", "ВТ", "СР", "ЧТ", "ПТ", "СБ", "ВС"];

const WEEKDAYS_FULL = [
  "Воскресенье", "Понедельник", "Вторник",
  "Среда", "Четверг", "Пятница", "Суббота"
];

const TIMES = [
  "09:00", "09:30", "10:00", "10:30",
  "11:00", "11:30", "12:00", "12:30",
  "13:00", "13:30", "14:00", "14:30",
  "15:00", "15:30", "16:00", "16:30",
  "17:00", "17:30", "18:00", "18:30"
];

function buildCalendarGrid(year, month) {
  const firstDay = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const offset = (firstDay.getDay() + 6) % 7;
  const previousMonthDays = new Date(year, month, 0).getDate();

  const cells = [];

  for (let i = offset - 1; i >= 0; i--) {
    cells.push({
      day: previousMonthDays - i,
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

function isPastDate(year, month, day) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const date = new Date(year, month, day);

  return date < today;
}

function CalendarHeader({ year, month, onChangeMonth }) {
  return (
    <div className="month">
      <button
        className="arrow"
        onClick={() => onChangeMonth(-1)}
        type="button"
        aria-label="Предыдущий месяц"
      >
        ‹
      </button>

      <h3>{MONTHS[month]} {year}</h3>

      <button
        className="arrow"
        onClick={() => onChangeMonth(1)}
        type="button"
        aria-label="Следующий месяц"
      >
        ›
      </button>
    </div>
  );
}

function CalendarGrid({
  year,
  month,
  selectedDay,
  onSelectDay
}) {
  const weeks = buildCalendarGrid(year, month);

  return (
    <div className="calendar">
      {WEEKDAYS.map((day) => (
        <span className="weekday" key={day}>
          {day}
        </span>
      ))}

      {weeks.flat().map((cell, index) => {
        if (cell.otherMonth) {
          return (
            <span
              className="day muted"
              key={`other-${index}`}
            >
              {cell.day}
            </span>
          );
        }

        const disabled = isPastDate(year, month, cell.day);
        const selected = cell.day === selectedDay;

        return (
          <button
            key={`${year}-${month}-${cell.day}`}
            type="button"
            className={[
              "day",
              selected ? "selected" : "",
              disabled ? "disabled" : ""
            ].join(" ")}
            disabled={disabled}
            onClick={() => onSelectDay(cell.day)}
          >
            {cell.day}
          </button>
        );
      })}
    </div>
  );
}

function TimeSlots({ slots, selectedTime, onSelectTime }) {
  return (
    <div className="time-grid">
      {slots.map((slot) => (
        <button
          key={slot.time}
          type="button"
          disabled={!slot.available}
          className={[
            "time-slot",
            !slot.available ? "busy" : "",
            selectedTime === slot.time ? "selected-time" : ""
          ].join(" ")}
          onClick={() => onSelectTime(slot.time)}
        >
          {slot.time}
        </button>
      ))}
    </div>
  );
}

export default function App() {
  const today = new Date();

  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [selectedDay, setSelectedDay] = useState(today.getDate());
  const [selectedTime, setSelectedTime] = useState(null);

  const selectedDate = new Date(
    currentYear,
    currentMonth,
    selectedDay
  );

  const slots = TIMES.map((time, index) => {
    const [hours, minutes] = time.split(":").map(Number);

    const slotDate = new Date(
      currentYear,
      currentMonth,
      selectedDay,
      hours,
      minutes
    );

    const isToday =
      selectedDate.toDateString() === today.toDateString();

    const isPastTime = isToday && slotDate <= today;

    return {
      time,
      available: (index % 5 !== 2) && !isPastTime
    };
  });

  function handleChangeMonth(direction) {
    const newDate = new Date(
      currentYear,
      currentMonth + direction,
      1
    );

    let newYear = newDate.getFullYear();
    let newMonth = newDate.getMonth();
    let newDay = Math.min(
      selectedDay,
      new Date(newYear, newMonth + 1, 0).getDate()
    );

    if (isPastDate(newYear, newMonth, newDay)) {
      newYear = today.getFullYear();
      newMonth = today.getMonth();
      newDay = today.getDate();
    }

    setCurrentYear(newYear);
    setCurrentMonth(newMonth);
    setSelectedDay(newDay);
    setSelectedTime(null);
  }

  function handleSelectDay(day) {
    setSelectedDay(day);
    setSelectedTime(null);
  }

  function handleContinue() {
    if (!selectedTime) return;

    alert(
      `Ваша запись:\n${WEEKDAYS_FULL[selectedDate.getDay()]}, ` +
      `${selectedDay} ${MONTHS_GENITIVE[currentMonth]} ${currentYear}\n` +
      `Время: ${selectedTime}`
    );
  }

  const dateLabel =
    `${WEEKDAYS_FULL[selectedDate.getDay()]}, ` +
    `${selectedDay} ${MONTHS_GENITIVE[currentMonth]} ${currentYear}`;

  return (
    <div className="app">
      <header className="header">
        <a href="#" className="logo">
          <span>ATELIER <b>17</b></span>
          <small>BARBERSHOP &amp; HAIR</small>
        </a>

        <nav className="navigation">
          <a href="#services">Услуги</a>
          <a href="#masters">Мастера</a>
          <a href="#reviews">Отзывы</a>
        </nav>

        <a className="phone" href="tel:+74951234567">
          +7 (495) 123-45-67
        </a>
      </header>

      <main className="container">
        <section className="intro">
          <p className="subtitle">ОНЛАЙН-ЗАПИСЬ</p>
          <h1>Выберите дату <em>и время</em></h1>
          <p>
            Остался последний шаг — выберите удобное время для визита.
          </p>
        </section>

        <ol className="steps">
          <li className="completed"><span>✓</span> Мастер</li>
          <li className="completed"><span>✓</span> Услуга</li>
          <li className="active"><span>03</span> Дата и время</li>
          <li><span>04</span> Контакты</li>
        </ol>

        <div className="booking">
          <section className="card calendar-card">
            <div className="section-heading">
              <div>
                <p className="subtitle">ШАГ 03 / 04</p>
                <h2>Когда вам удобно?</h2>
              </div>

              <span className="timezone">МСК · UTC+3</span>
            </div>

            <CalendarHeader
              year={currentYear}
              month={currentMonth}
              onChangeMonth={handleChangeMonth}
            />

            <CalendarGrid
              year={currentYear}
              month={currentMonth}
              selectedDay={selectedDay}
              onSelectDay={handleSelectDay}
            />

            <div className="legend">
              <span><i className="gold-dot" /> Свободное время</span>
              <span><i className="green-dot" /> Выбранная дата</span>
              <span><i className="gray-dot" /> Нет мест</span>
            </div>

            <p className="hint">
              Доступность времени может меняться.
            </p>
          </section>

          <section className="card time-card">
            <div className="section-heading">
              <div>
                <p className="subtitle">ДОСТУПНЫЕ СЛОТЫ</p>
                <h2>
                  {WEEKDAYS_FULL[selectedDate.getDay()]}, {selectedDay}{" "}
                  {MONTHS_GENITIVE[currentMonth]}
                </h2>
              </div>

              <span className="status">● Свободно</span>
            </div>

            <p className="description">
              Выберите время начала визита
            </p>

            <TimeSlots
              slots={slots}
              selectedTime={selectedTime}
              onSelectTime={setSelectedTime}
            />

            <div className="summary">
              <span className="check">✓</span>
              <div>
                <strong>
                  {dateLabel}
                  {selectedTime ? ` • ${selectedTime}` : ""}
                </strong>
                <p>
                  {selectedTime
                    ? "Время визита выбрано"
                    : "Выберите свободное время выше"}
                </p>
              </div>
            </div>

            <button
              className="continue-button"
              type="button"
              disabled={!selectedTime}
              onClick={handleContinue}
            >
              Продолжить <span>→</span>
            </button>

            <p className="note">
              Бесплатная отмена за 24 часа до визита
            </p>
          </section>
        </div>

        <div className="back">
          <a href="#">← Назад к выбору услуги</a>
          <span>
            Нужна помощь? <a href="tel:+74951234567">Свяжитесь с нами</a>
          </span>
        </div>
      </main>

      <footer className="footer">
        <a href="#" className="logo">
          <span>ATELIER <b>17</b></span>
          <small>BARBERSHOP &amp; HAIR</small>
        </a>
        <p>Хороший стиль начинается с деталей.</p>
        <small>© 2026 ATELIER 17</small>
      </footer>
    </div>
  );
}