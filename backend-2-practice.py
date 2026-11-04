
from fastapi import FastAPI
from fastapi.responses import JSONResponse

app = FastAPI()

# Список категорий услуг
categories = [
    {
        "id": 1,
        "name": "Стрижки и укладки",
        "servicesCount": 5
    },
    {
        "id": 2,
        "name": "Маникюр и педикюр",
        "servicesCount": 5
    },
    {
        "id": 3,
        "name": "Брови и ресницы",
        "servicesCount": 4
    },
    {
        "id": 4,
        "name": "Спа-процедуры",
        "servicesCount": 4
    }
]

# Задание 1. Получить все категории
@app.get("/categories")
def get_categories():
    return categories

# Задание 2. Получить категорию по ID
@app.get("/categories/{category_id}")
def get_category(category_id: int):
    for category in categories:
        if category["id"] == category_id:
            return category

    return JSONResponse(
        status_code=404,
        content={"message": "Category not found"}
    )


