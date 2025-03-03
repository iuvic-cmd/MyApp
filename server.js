const express = require("express");
const path = require("path");

const app = express();
const PORT = 3000;

// Раздаём все статические файлы (HTML, CSS, JS, изображения)
app.use(express.static(__dirname));

// Обрабатываем ма
app.use("/manifest.json", express.static(__dirname + "/manifest.json"));

// Раздаём стили (если не загружаются)
app.use("/styles", express.static(path.join(__dirname, "styles")));

// Раздаём скрипты
app.use("/scripts", express.static(path.join(__dirname, "scripts")));

// Раздаём папку icons (для логотипов и фавиконов)
app.use("/icons", express.static(path.join(__dirname, "icons")));

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
});

app.listen(PORT, () => {
    console.log(`Сервер запущен на http://localhost:${PORT}`);
});
