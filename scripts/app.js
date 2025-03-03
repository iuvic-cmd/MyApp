document.addEventListener("DOMContentLoaded", function () {
    const dateInput = document.getElementById("date");
    const openShiftBtn = document.getElementById("openShift");
    const closeShiftBtn = document.getElementById("closeShift");
    const addOrdersBtn = document.getElementById("addOrders");
    const resetDataBtn = document.getElementById("resetData");
    const exportDataBtn = document.getElementById("exportData");
    const districtOrdersInput = document.getElementById("districtOrders");
    const nightOrdersInput = document.getElementById("nightOrders");
    const shiftHistoryList = document.getElementById("shiftHistory");
    const totalEarningsDisplay = document.getElementById("totalEarnings");
    const totalDistrictOrdersDisplay = document.getElementById("totalDistrictOrders");
    const totalNightOrdersDisplay = document.getElementById("totalNightOrders");
    const totalOrdersDisplay = document.getElementById("totalOrders");

    // Загрузка истории смен
    function loadShiftHistory() {
        shiftHistoryList.innerHTML = "";
        const shifts = JSON.parse(localStorage.getItem("shifts")) || [];
        let totalEarnings = 0;
        let totalDistrictOrders = 0;
        let totalNightOrders = 0;

        shifts.forEach((shift, index) => {
            const li = document.createElement("li");
            const earnings = (shift.districtOrders * 50) + (shift.nightOrders * 65);
            totalEarnings += earnings;
            totalDistrictOrders += shift.districtOrders;
            totalNightOrders += shift.nightOrders;

            const shiftInfo = document.createElement("div");
            shiftInfo.textContent = `Дата: ${shift.date}, Открытие: ${shift.openTime || "Не открыто"}, Закрытие: ${shift.closeTime || "Не закрыто"}, Районные: ${shift.districtOrders}, Ночные: ${shift.nightOrders}, Заработано: ${earnings} лей`;

            const deleteBtn = document.createElement("button");
            deleteBtn.textContent = "Удалить";
            deleteBtn.classList.add("delete-btn");
            deleteBtn.addEventListener("click", () => deleteShift(index));

            li.appendChild(shiftInfo);
            li.appendChild(deleteBtn);
            shiftHistoryList.appendChild(li);
        });

        // Обновление статистики
        totalEarningsDisplay.textContent = `${totalEarnings} лей`;
        totalDistrictOrdersDisplay.textContent = totalDistrictOrders;
        totalNightOrdersDisplay.textContent = totalNightOrders;
        totalOrdersDisplay.textContent = totalDistrictOrders + totalNightOrders;
    }

    // Удаление смены
    function deleteShift(index) {
        let shifts = JSON.parse(localStorage.getItem("shifts")) || [];
        shifts.splice(index, 1);
        localStorage.setItem("shifts", JSON.stringify(shifts));
        loadShiftHistory();
    }

    // Открытие смены
    openShiftBtn.addEventListener("click", function () {
        const selectedDate = dateInput.value;
        if (!selectedDate) {
            alert("Выберите дату!");
            return;
        }

        let shifts = JSON.parse(localStorage.getItem("shifts")) || [];
        let existingShift = shifts.find(shift => shift.date === selectedDate);

        if (!existingShift) {
            shifts.push({
                date: selectedDate,
                openTime: new Date().toLocaleTimeString(),
                closeTime: null,
                districtOrders: 0,
                nightOrders: 0
            });
        } else {
            existingShift.openTime = new Date().toLocaleTimeString();
            existingShift.closeTime = null;
        }

        localStorage.setItem("shifts", JSON.stringify(shifts));
        loadShiftHistory();
    });

    // Закрытие смены
    closeShiftBtn.addEventListener("click", function () {
        const selectedDate = dateInput.value;
        if (!selectedDate) {
            alert("Выберите дату!");
            return;
        }

        let shifts = JSON.parse(localStorage.getItem("shifts")) || [];
        let existingShift = shifts.find(shift => shift.date === selectedDate);

        if (existingShift) {
            existingShift.closeTime = new Date().toLocaleTimeString();
            localStorage.setItem("shifts", JSON.stringify(shifts));
            loadShiftHistory();
            alert("Смена закрыта!");
        } else {
            alert("Смена не была открыта!");
        }
    });

    // Добавление заказов
    addOrdersBtn.addEventListener("click", function () {
        const selectedDate = dateInput.value;
        if (!selectedDate) {
            alert("Выберите дату!");
            return;
        }

        let shifts = JSON.parse(localStorage.getItem("shifts")) || [];
        let existingShift = shifts.find(shift => shift.date === selectedDate);

        if (existingShift) {
            const districtOrders = parseInt(districtOrdersInput.value) || 0;
            const nightOrders = parseInt(nightOrdersInput.value) || 0;

            existingShift.districtOrders += districtOrders;
            existingShift.nightOrders += nightOrders;
            localStorage.setItem("shifts", JSON.stringify(shifts));
            loadShiftHistory();

            // Очистка полей ввода
            districtOrdersInput.value = "";
            nightOrdersInput.value = "";
        } else {
            alert("Сначала откройте смену!");
        }
    });

    // Сброс данных
    resetDataBtn.addEventListener("click", function () {
        if (confirm("Вы уверены, что хотите сбросить все данные?")) {
            localStorage.removeItem("shifts");
            loadShiftHistory();
            alert("Все данные сброшены!");
        }
    });

    // Экспорт данных в Excel
    exportDataBtn.addEventListener("click", function () {
        const shifts = JSON.parse(localStorage.getItem("shifts")) || [];
        if (shifts.length === 0) {
            alert("Нет данных для экспорта!");
            return;
        }

        // Создаем массив данных для Excel
        const data = [
            ["Дата", "Открытие", "Закрытие", "Районные заказы", "Ночные заказы", "Заработано (лей)"]
        ];

        shifts.forEach(shift => {
            const earnings = (shift.districtOrders * 50) + (shift.nightOrders * 65);
            data.push([
                shift.date,
                shift.openTime || "Не открыто",
                shift.closeTime || "Не закрыто",
                shift.districtOrders,
                shift.nightOrders,
                earnings
            ]);
        });

        // Создаем книгу Excel
        const workbook = XLSX.utils.book_new();
        const worksheet = XLSX.utils.aoa_to_sheet(data);
        XLSX.utils.book_append_sheet(workbook, worksheet, "История смен");

        // Формируем имя файла с текущей датой и временем
        const now = new Date();
        const formattedDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}_${String(now.getHours()).padStart(2, '0')}-${String(now.getMinutes()).padStart(2, '0')}-${String(now.getSeconds()).padStart(2, '0')}`;
        const fileName = `История_смен_${formattedDate}.xlsx`;

        // Сохраняем файл
        XLSX.writeFile(workbook, fileName);
    });

    // Загрузка истории при запуске
    loadShiftHistory();
});
