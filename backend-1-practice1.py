from datetime import datetime
from types import SimpleNamespace

# Класс записи
class Appoinment:
    def __init__(self, appointment_id, client_name, master_id, service_id, time):
        self.id = appointment_id
        self.client_name = client_name
        self.master_id = master_id
        self.service_id = service_id
        self.time = time

# Список мастеров
masters = [
    {"master_id": 1, "name": "Анна"},
    {"master_id": 2, "name": "Мария"}
]

# Список услуг
services = [
    {"service_id": 1, "name": "Стрижка"},
    {"service_id": 2, "name": "Маникюр"}
]

# Список записей
appointments = []

# Поиск мастера по ID
def get_master(master_id):
    for master in masters:
        if master["master_id"] == master_id:
            return SimpleNamespace(**master)
    return None

# Поиск услуги по ID
def get_service(service_id):
    for service in services:
        if service["service_id"] == service_id:
            return SimpleNamespace(**service)
    return None

# Создание записи
def create_appointment(
    client_name: str,
    master_id: int,
    service_id: int,
    time: str,
) -> Appoinment | None:

    if not client_name or not client_name.strip():
        return None

    if master_id is None or service_id is None or not time:
        return None

    master = get_master(master_id)
    service = get_service(service_id)

    if master is None or service is None:
        return None

    try:
        appointment_time = datetime.strptime(time, "%H:%M")
    except ValueError:
        return None

    if appointment_time.strftime("%H:%M") != time:
        return None

    minutes = appointment_time.hour * 60 + appointment_time.minute

    if not (8 * 60 <= minutes <= 20 * 60):
        return None

    appointment = Appoinment(
        appointment_id=len(appointments) + 1,
        client_name=client_name,
        master_id=master.master_id,
        service_id=service.service_id,
        time=time,
    )

    appointments.append(appointment)

    return appointment

# Проверка работы программы
first_appointment = create_appointment("Иванова А.А.", 1, 1, "10:00")
second_appointment = create_appointment("Петрова А.А.", 1, 1, "11:00")

print("Список записей:")

for appointment in appointments:
    print(appointment.client_name, appointment.time)

print("\nПроверка пустого имени:")

no_correct_appointment = create_appointment("", 1, 1, "12:00")
print(no_correct_appointment)

print("\nПроверка неправильного времени:")

no_correct_appointment = create_appointment("Сидорова А.А.", 1, 1, "00:00")
print(no_correct_appointment)