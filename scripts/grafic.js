document.addEventListener("DOMContentLoaded", function () {
    const workScheduleForm = document.getElementById("workScheduleForm");
    const workScheduleList = document.getElementById("workScheduleList");
    const clearScheduleBtn = document.getElementById("clearSchedule");
    const exportScheduleBtn = document.getElementById("exportSchedule");

    let schedule = JSON.parse(localStorage.getItem("schedule")) || [];

    // Загрузка графика
    function loadSchedule() {
        workScheduleList.innerHTML = "";
        schedule.forEach((day, index) => {
            const row = document.createElement("tr");

            const dayCell = document.createElement("td");
            dayCell.textContent = new Date(day.date).toLocaleDateString("ru-RU", { weekday: 'long' });

            const dateCell = document.createElement("td");
            dateCell.textContent = day.date;

            const shiftCell = document.createElement("td");
            shiftCell.textContent = day.shiftType;

            const timeCell = document.createElement("td");
            timeCell.textContent = getShiftTime(day.shiftType);

            const editCell = document.createElement("td");
            const editBtn = document.createElement("button");
            editBtn.textContent = "✏️";
            editBtn.addEventListener("click", () => editDay(index));
            editCell.appendChild(editBtn);

            const deleteCell = document.createElement("td");
            const deleteBtn = document.createElement("button");
            deleteBtn.textContent = "❌";
            deleteBtn.addEventListener("click", () => deleteDay(index));
            deleteCell.appendChild(deleteBtn);

            row.appendChild(dayCell);
            row.appendChild(dateCell);
            row.appendChild(shiftCell);
            row.appendChild(timeCell);
            row.appendChild(editCell);
            row.appendChild(deleteCell);

            workScheduleList.appendChild(row);
        });
    }

    // Получение времени смены
    function getShiftTime(shiftType) {
        switch (shiftType) {
            case "full":
                return "08:00 - 23:00";
            case "part_morning":
                return "08:00 - 15:00";
            case "part_evening":
                return "08:00 - 18:00";
            case "support":
                return "11:00 - 15:00";
            case "weekend":
                return "Выходной";
            default:
                return "Нет данных";
        }
    }

    // Добавление рабочего дня
    workScheduleForm.addEventListener("submit", function (event) {
        event.preventDefault();

        const date = document.getElementById("workDays").value;
        const shiftType = document.getElementById("shiftType").value;

        if (!date) {
            alert("Выберите дату!");
            return;
        }

        schedule.push({ date, shiftType });
        localStorage.setItem("schedule", JSON.stringify(schedule));
        loadSchedule();

        workScheduleForm.reset();
    });

    // Удаление рабочего дня
    function deleteDay(index) {
        schedule.splice(index, 1);
        localStorage.setItem("schedule", JSON.stringify(schedule));
        loadSchedule();
    }

    // Очистка графика
    clearScheduleBtn.addEventListener("click", function () {
        if (confirm("Вы уверены, что хотите очистить график?")) {
            schedule = [];
            localStorage.removeItem("schedule");
            loadSchedule();
        }
    });

    // Функция для создания стиля с цветом фона
    function createStyle(color) {
        return {
            fill: {
                fgColor: { rgb: color }
            },
            font: {
                color: { rgb: "000000" } // Черный текст
            }
        };
    }

    // Цвета для типов смен
    const shiftColors = {
        full: createStyle("00FF00"), // Зеленый
        part_morning: createStyle("FFFF00"), // Желтый
        part_evening: createStyle("FFA500"), // Оранжевый
        support: createStyle("00FFFF"), // Голубой
        weekend: createStyle("FF0000") // Красный
    };

    // Экспорт графика в Excel
    exportScheduleBtn.addEventListener("click", function () {
        if (schedule.length === 0) {
            alert("Нет данных для экспорта!");
            return;
        }

        // Создаем массив данных для Excel
        const data = [
            ["Дата", "Тип смены", "Время"]
        ];

        // Создаем массив стилей для ячеек
        const styles = [
            [], // Заголовки (без стиля)
        ];

        schedule.forEach(day => {
            const row = [
                day.date,
                day.shiftType,
                getShiftTime(day.shiftType)
            ];
            data.push(row);

            // Определяем стиль для строки
            const date = new Date(day.date);
            const dayOfWeek = date.getDay(); // 0 - воскресенье, 6 - суббота

            // Стиль для даты (красный, если это суббота или воскресенье)
            const dateStyle = (dayOfWeek === 0 || dayOfWeek === 6) ? shiftColors.weekend : null;

            // Стиль для типа смены
            const shiftStyle = shiftColors[day.shiftType] || null;

            // Добавляем стили для строки
            styles.push([dateStyle, shiftStyle, null]);
        });

        // Создаем книгу Excel
        const workbook = XLSX.utils.book_new();
        const worksheet = XLSX.utils.aoa_to_sheet(data);

        // Применяем стили к ячейкам
        styles.forEach((rowStyles, rowIndex) => {
            rowStyles.forEach((style, colIndex) => {
                if (style) {
                    const cellAddress = XLSX.utils.encode_cell({ r: rowIndex, c: colIndex });
                    if (!worksheet[cellAddress]) worksheet[cellAddress] = {};
                    worksheet[cellAddress].s = style;
                }
            });
        });

        // Добавляем лист в книгу
        XLSX.utils.book_append_sheet(workbook, worksheet, "График работы");

        // Формируем имя файла с текущей датой и временем
        const now = new Date();
        const formattedDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}_${String(now.getHours()).padStart(2, '0')}-${String(now.getMinutes()).padStart(2, '0')}-${String(now.getSeconds()).padStart(2, '0')}`;
        const fileName = `График_работы_${formattedDate}.xlsx`;

        // Сохраняем файл
        XLSX.writeFile(workbook, fileName);
    });

    // Загрузка графика при запуске
    loadSchedule();
});
