import { useState, useEffect, useRef } from "react";
import { fetchToday, fetchSlots } from "./api.js";

function App() {
  const [today, setToday] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(null);
  const [slots, setSlots] = useState([]);

  const [loadingToday, setLoadingToday] = useState(true);
  const [errorToday, setErrorToday] = useState("");

  const [loadingSlots, setLoadingSlots] = useState(false);
  const [errorSlots, setErrorSlots] = useState("");

  const [selectedTime, setSelectedTime] = useState(null);

  const requestId = useRef(0);

  // Загружаем сегодняшнюю дату с сервера
  useEffect(() => {
    async function loadToday() {
      try {
        setLoadingToday(true);
        setErrorToday("");

        const data = await fetchToday();

        setToday(data);
        setSelectedDate(data);
        setCurrentMonth({
          month: data.month,
          year: data.year,
        });
      } catch (error) {
        setErrorToday(error.message);
      } finally {
        setLoadingToday(false);
      }
    }

    loadToday();
  }, []);

  // Загружаем свободное время для выбранной даты
  useEffect(() => {
    if (!selectedDate) return;

    const currentRequest = ++requestId.current;

    async function loadSlots() {
      try {
        setLoadingSlots(true);
        setErrorSlots("");
        setSlots([]);

        const data = await fetchSlots(selectedDate);

        // Не принимаем ответ от устаревшего запроса
        if (currentRequest !== requestId.current) return;

        const responseDate = data.date;
        const sameDate =
          responseDate.day === selectedDate.day &&
          responseDate.month === selectedDate.month &&
          responseDate.year === selectedDate.year;

        if (!sameDate) return;

        setSlots(data.slots);
      } catch (error) {
        if (currentRequest === requestId.current) {
          setErrorSlots(error.message);
        }
      } finally {
        if (currentRequest === requestId.current) {
          setLoadingSlots(false);
        }
      }
    }

    loadSlots();

    return () => {
      requestId.current++;
    };
  }, [selectedDate]);

  // Повторная загрузка сегодняшней даты
  function retryToday() {
    setToday(null);
    setSelectedDate(null);
    setCurrentMonth(null);
    setLoadingToday(true);
    setErrorToday("");

    fetchToday()
      .then((data) => {
        setToday(data);
        setSelectedDate(data);
        setCurrentMonth({
          month: data.month,
          year: data.year,
        });
      })
      .catch((error) => setErrorToday(error.message))
      .finally(() => setLoadingToday(false));
  }

  // Количество дней в месяце
  function getDaysInMonth(month, year) {
    return new Date(year, month + 1, 0).getDate();
  }

  // Первый день месяца
  function getFirstDay(month, year) {
    return (new Date(year, month, 1).getDay() + 6) % 7;
  }

  function changeMonth(direction) {
    setCurrentMonth((previous) => {
      const date = new Date(
        previous.year,
        previous.month + direction,
        1
      );

      return {
        month: date.getMonth(),
        year: date.getFullYear(),
      };
    });
  }

  function selectDay(day) {
    setSelectedDate({
      day,
      month: currentMonth.month,
      year: currentMonth.year,
    });
    setSelectedTime(null);
  }

  const monthNames = [
    "Январь", "Февраль", "Март", "Апрель",
    "Май", "Июнь", "Июль", "Август",
    "Сентябрь", "Октябрь", "Ноябрь", "Декабрь",
  ];

  const weekdays = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];

  if (loadingToday) {
    return <div className="page">Загружаем дату...</div>;
  }

  if (errorToday) {
    return (
      <div className="page">
        <p>Не удалось загрузить дату: {errorToday}</p>
        <button onClick={retryToday}>Повторить</button>
      </div>
    );
  }

  if (!currentMonth) return null;

  const daysInMonth = getDaysInMonth(

currentMonth.month,
    currentMonth.year
  );

  const firstDay = getFirstDay(
    currentMonth.month,
    currentMonth.year
  );

  return (
    <div className="page">
      <header className="header">
        <h1>ATELIER 17</h1>
        <p>Запись на процедуру</p>
      </header>

      <main className="main">
        <section className="booking">
          <h2>Выберите дату и время</h2>

          <div className="calendar">
            <div className="calendar-header">
              <button onClick={() => changeMonth(-1)}>
                ←
              </button>

              <h3>
                {monthNames[currentMonth.month]} {currentMonth.year}
              </h3>

              <button onClick={() => changeMonth(1)}>
                →
              </button>
            </div>

            <div className="calendar-grid">
              {weekdays.map((day) => (
                <div className="weekday" key={day}>
                  {day}
                </div>
              ))}

              {Array.from({ length: firstDay }).map((_, index) => (
                <div className="empty-day" key={`empty-${index}`} />
              ))}

              {Array.from({ length: daysInMonth }).map((_, index) => {
                const day = index + 1;

                const isSelected =
                  selectedDate?.day === day &&
                  selectedDate?.month === currentMonth.month &&
                  selectedDate?.year === currentMonth.year;

                return (
                  <button
                    className={`calendar-day ${isSelected ? "selected" : ""}`}
                    key={day}
                    onClick={() => selectDay(day)}
                  >
                    {day}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="time-section">
            <h3>Свободное время</h3>

            {loadingSlots && <p>Загружаем свободное время...</p>}

            {errorSlots && (
              <p>
                Не удалось загрузить время: {errorSlots}
              </p>
            )}

            {!loadingSlots && !errorSlots && slots.length === 0 && (
              <p>На эту дату нет доступного времени.</p>
            )}

            <div className="time-grid">
              {slots.map((slot) => (
                <button
                  key={slot.time}
                  disabled={!slot.available || loadingSlots}
                  className={`time-slot ${
                    selectedTime === slot.time ? "selected" : ""
                  }`}
                  onClick={() => setSelectedTime(slot.time)}
                >
                  {slot.time}
                </button>
              ))}
            </div>
          </div>

          {selectedTime && (
            <div className="selection-result">
              <p>
                Вы выбрали: {selectedDate.day}.
                {selectedDate.month + 1}.
                {selectedDate.year} в {selectedTime}
              </p>
              <button onClick={() => alert("Время выбрано!")}>
                Продолжить
              </button>
            </div>
          )}
        </section>
      </main>

      <footer className="footer">
        <p>ATELIER 17 · Красота в деталях</p>
      </footer>
    </div>
  );
}

export default App;




