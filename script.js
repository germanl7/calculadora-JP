/* =====================================================
   JP CALCULADORA
   SCRIPT.JS COMPLETO
===================================================== */

/* =====================================================
   CALCULADORA
===================================================== */

let expression = "";
let justCalculated = false;

let memory =
    Number(localStorage.getItem("calculatorMemory")) || 0;

let history =
    JSON.parse(
        localStorage.getItem("calculatorHistory")
    ) || [];

const result = document.getElementById("result");
const operation = document.getElementById("operation");


/* =====================================================
   MOSTRAR PANTALLA
===================================================== */

function updateDisplay() {

    let visible = expression
        .replace(/\*/g, "×")
        .replace(/\//g, "÷")
        .replace(/-/g, "−")
        .replace(/\./g, ",");

    operation.textContent = visible;

    if (!expression) {
        result.textContent = "0";
        return;
    }

    try {

        let calculation = expression;

        calculation = calculation.replace(
            /(\d+(?:\.\d+)?)%/g,
            "($1/100)"
        );

        let answer = Function(
            '"use strict"; return (' + calculation + ')'
        )();

        if (Number.isFinite(answer)) {

            result.textContent =
                Number(answer).toLocaleString(
                    "es-CO",
                    {
                        maximumFractionDigits: 10
                    }
                );
        }

    } catch {
        // Operación incompleta
    }
}


/* =====================================================
   AGREGAR VALORES
===================================================== */

function addValue(value) {

    if (justCalculated) {

        if (!["+", "-", "*", "/", "%"].includes(value)) {
            expression = "";
        }

        justCalculated = false;
    }

    expression += value;

    updateDisplay();

    playButtonSound();
    vibrateButton();
}


/* =====================================================
   BORRAR TODO
===================================================== */

function clearAll() {

    expression = "";
    operation.textContent = "";
    result.textContent = "0";
    justCalculated = false;

    playButtonSound();
    vibrateButton();
}


/* =====================================================
   BORRAR ÚLTIMO
===================================================== */

function deleteLast() {

    expression = expression.slice(0, -1);

    updateDisplay();

    playButtonSound();
    vibrateButton();
}


/* =====================================================
   CALCULAR
===================================================== */

function calculate() {

    if (!expression) return;

    try {

        let original = expression;

        let calculation = expression;

        calculation = calculation.replace(
            /(\d+(?:\.\d+)?)%/g,
            "($1/100)"
        );

        let answer = Function(
            '"use strict"; return (' + calculation + ')'
        )();

        if (!Number.isFinite(answer)) {
            throw new Error();
        }

        answer = Number(answer.toFixed(12));

        result.textContent =
            answer.toLocaleString(
                "es-CO",
                {
                    maximumFractionDigits: 12
                }
            );

        operation.textContent =
            original
                .replace(/\*/g, "×")
                .replace(/\//g, "÷")
                .replace(/-/g, "−");

        saveHistory(original, answer);

        expression = String(answer);

        justCalculated = true;

        playButtonSound();
        vibrateButton();

    } catch {

        result.textContent = "Error";
        justCalculated = true;

        playButtonSound();
        vibrateButton();
    }
}


/* =====================================================
   HISTORIAL
===================================================== */

function saveHistory(exp, answer) {

    history.unshift({
        expression: exp,
        result: answer,
        date: new Date().toLocaleTimeString()
    });

    history = history.slice(0, 50);

    localStorage.setItem(
        "calculatorHistory",
        JSON.stringify(history)
    );

    renderHistory();
}


function renderHistory() {

    const list =
        document.getElementById("historyList");

    if (!list) return;

    list.innerHTML = "";

    if (history.length === 0) {

        list.innerHTML =
            `<p class="empty-history">
                No hay cálculos todavía
            </p>`;

        return;
    }

    history.forEach((item, index) => {

        const div =
            document.createElement("div");

        div.className = "history-item";

        div.innerHTML = `
            <div>
                <small>${item.expression}</small>
                <strong>${item.result}</strong>
            </div>

            <div class="history-actions">

                <button onclick="useHistory(${index})">
                    ↩
                </button>

                <button onclick="copyHistory(${index})">
                    📋
                </button>

            </div>
        `;

        list.appendChild(div);
    });
}


function useHistory(index) {

    expression =
        String(history[index].result);

    justCalculated = false;

    updateDisplay();

    playButtonSound();
    vibrateButton();
}


function copyHistory(index) {

    if (
        navigator.clipboard &&
        navigator.clipboard.writeText
    ) {

        navigator.clipboard.writeText(
            String(history[index].result)
        );
    }
}


function clearHistory() {

    history = [];

    localStorage.removeItem(
        "calculatorHistory"
    );

    renderHistory();
}


function toggleHistory() {

    const panel =
        document.getElementById("historyPanel");

    if (!panel) return;

    panel.classList.toggle("show");
}

/* =====================================================
   FUNCIONES CIENTÍFICAS
===================================================== */

function scientific(type) {

    let value;

    try {

        value = Number(
            Function(
                '"use strict"; return (' +
                expression +
                ')'
            )()
        );

    } catch {

        value =
            Number(
                result.textContent
                    .replace(/\./g, "")
                    .replace(",", ".")
            ) || 0;
    }


    if (type === "pi") {

        expression += Math.PI;

    } else if (type === "e") {

        expression += Math.E;

    } else if (type === "sqrt") {

        expression =
            String(Math.sqrt(value));

    } else if (type === "sin") {

        expression =
            String(
                Math.sin(value * Math.PI / 180)
            );

    } else if (type === "cos") {

        expression =
            String(
                Math.cos(value * Math.PI / 180)
            );

    } else if (type === "tan") {

        expression =
            String(
                Math.tan(value * Math.PI / 180)
            );

    } else if (type === "ln") {

        expression =
            String(Math.log(value));

    } else if (type === "log") {

        expression =
            String(Math.log10(value));

    } else if (type === "pow") {

        expression += "**";

    } else if (type === "factorial") {

        expression =
            String(factorial(value));

    } else if (type === "inv") {

        expression =
            String(1 / value);
    }

    justCalculated = false;

    updateDisplay();

    playButtonSound();
    vibrateButton();
}


/* =====================================================
   FACTORIAL
===================================================== */

function factorial(n) {

    n = Math.floor(n);

    if (n < 0) return NaN;

    let total = 1;

    for (let i = 2; i <= n; i++) {
        total *= i;
    }

    return total;
}


/* =====================================================
   MOSTRAR FUNCIONES CIENTÍFICAS
===================================================== */

function toggleScientific() {

    const panel =
        document.getElementById("scientificPanel");

    if (!panel) return;

    const enabled =
        localStorage.getItem("scientificMode")
        !== "false";

    if (!enabled) return;

    panel.classList.toggle("show");
}


/* =====================================================
   MEMORIA
===================================================== */

function memoryStore() {

    memory = getCurrentNumber();

    localStorage.setItem(
        "calculatorMemory",
        String(memory)
    );

    updateMemoryPanel();

    playButtonSound();
    vibrateButton();
}


function memoryRecall() {

    expression += String(memory);

    justCalculated = false;

    updateDisplay();

    playButtonSound();
    vibrateButton();
}


function memoryAdd() {

    memory += getCurrentNumber();

    localStorage.setItem(
        "calculatorMemory",
        String(memory)
    );

    updateMemoryPanel();

    playButtonSound();
    vibrateButton();
}


function memorySubtract() {

    memory -= getCurrentNumber();

    localStorage.setItem(
        "calculatorMemory",
        String(memory)
    );

    updateMemoryPanel();

    playButtonSound();
    vibrateButton();
}


function memoryClear() {

    memory = 0;

    localStorage.setItem(
        "calculatorMemory",
        "0"
    );

    updateMemoryPanel();

    playButtonSound();
    vibrateButton();
}


function updateMemoryPanel() {

    const value =
        document.getElementById("memoryValue");

    if (value) {
        value.textContent = memory;
    }
}


function getCurrentNumber() {

    try {

        return Number(
            Function(
                '"use strict"; return (' +
                expression +
                ')'
            )()
        );

    } catch {

        return Number(
            result.textContent
                .replace(/\./g, "")
                .replace(",", ".")
        ) || 0;
    }
}


/* =====================================================
   TECLADO DEL COMPUTADOR
===================================================== */

document.addEventListener(
    "keydown",
    function(event) {

        const key = event.key;

        if (
            /^[0-9+\-*/().%]$/.test(key)
        ) {

            addValue(key);
        }

        if (
            key === "Enter" ||
            key === "="
        ) {

            event.preventDefault();

            calculate();
        }

        if (key === "Backspace") {

            deleteLast();
        }

        if (key === "Escape") {

            clearAll();
        }
    }
);

/* =====================================================
   TEMA
===================================================== */

function toggleTheme() {

    document.body.classList.toggle("light");

    const button =
        document.getElementById("themeBtn");

    if (!button) return;

    const light =
        document.body.classList.contains("light");

    button.textContent =
        light ? "🌙" : "☀️";

    button.classList.toggle(
        "active",
        !light
    );

    localStorage.setItem(
        "calculatorTheme",
        light ? "light" : "dark"
    );

    playButtonSound();
    vibrateButton();
}


function loadTheme() {

    const theme =
        localStorage.getItem("calculatorTheme");

    if (theme === "light") {

        document.body.classList.add("light");

        const button =
            document.getElementById("themeBtn");

        if (button) {
            button.textContent = "🌙";
            button.classList.remove("active");
        }
    }
}


/* =====================================================
   MENÚ PRINCIPAL
===================================================== */

function menuButton() {

    const menu =
        document.getElementById("menuPanel");

    if (!menu) return;

    menu.classList.toggle("show");

    playButtonSound();
    vibrateButton();
}


/* =====================================================
   ABRIR HERRAMIENTAS
===================================================== */

function openTool(type) {

    const menu =
        document.getElementById("menuPanel");

    const panel =
        document.getElementById("toolPanel");

    const title =
        document.getElementById("toolTitle");

    const content =
        document.getElementById("toolContent");

    if (!panel || !content || !title) return;

    if (menu) {
        menu.classList.remove("show");
    }

    panel.classList.add("show");


    /* =========================
       ÁREA
    ========================= */

    if (type === "area") {

        title.textContent = "📐 Área";

        content.innerHTML = `
            <p class="tool-info">
                Calcula el área de diferentes figuras.
            </p>

            <select id="areaType" class="tool-select">
                <option value="square">Cuadrado</option>
                <option value="rectangle">Rectángulo</option>
                <option value="circle">Círculo</option>
                <option value="triangle">Triángulo</option>
            </select>

            <input
                type="number"
                id="areaA"
                class="tool-input"
                placeholder="Valor">

            <input
                type="number"
                id="areaB"
                class="tool-input"
                placeholder="Segundo valor">

            <button
                class="tool-calculate"
                onclick="calculateArea()">

                Calcular área

            </button>

            <div
                id="areaResult"
                class="tool-result">

                Resultado

            </div>
        `;
    }


    /* =========================
       TEMPERATURA
    ========================= */

    else if (type === "temperature") {

        title.textContent = "🌡️ Temperatura";

        content.innerHTML = `
            <p class="tool-info">
                Convierte entre Celsius,
                Fahrenheit y Kelvin.
            </p>

            <input
                type="number"
                id="tempValue"
                class="tool-input"
                placeholder="Temperatura">

            <select id="tempFrom" class="tool-select">

                <option value="C">
                    Celsius °C
                </option>

                <option value="F">
                    Fahrenheit °F
                </option>

                <option value="K">
                    Kelvin K
                </option>

            </select>

            <select id="tempTo" class="tool-select">

                <option value="C">
                    Celsius °C
                </option>

                <option value="F">
                    Fahrenheit °F
                </option>

                <option value="K">
                    Kelvin K
                </option>

            </select>

            <button
                class="tool-calculate"
                onclick="calculateTemperature()">

                Convertir

            </button>

            <div
                id="tempResult"
                class="tool-result">

                Resultado

            </div>
        `;
    }


    /* =========================
       FECHA
    ========================= */

    else if (type === "date") {

        title.textContent = "📅 Fecha";

        content.innerHTML = `
            <p class="tool-info">
                Calcula fechas y diferencias de días.
            </p>

            <input
                type="date"
                id="singleDate"
                class="tool-input">

            <input
                type="number"
                id="daysToChange"
                class="tool-input"
                placeholder="Cantidad de días">

            <div class="date-actions">

                <button onclick="changeDate(1)">
                    ➕ Sumar días
                </button>

                <button onclick="changeDate(-1)">
                    ➖ Restar días
                </button>

            </div>

            <div
                id="dateResult"
                class="tool-result">

                Resultado

            </div>
        `;
    }


    /* =========================
       TIEMPO
    ========================= */

    else if (type === "time") {

        title.textContent = "🕒 Tiempo";

        content.innerHTML = `
            <p class="tool-info">
                Convierte horas, minutos y segundos.
            </p>

            <input
                type="number"
                id="timeHours"
                class="tool-input"
                placeholder="Horas">

            <input
                type="number"
                id="timeMinutes"
                class="tool-input"
                placeholder="Minutos">

            <input
                type="number"
                id="timeSeconds"
                class="tool-input"
                placeholder="Segundos">

            <button
                class="tool-calculate"
                onclick="calculateTime()">

                Convertir

            </button>

            <div
                id="timeResult"
                class="tool-result">

                Resultado

            </div>
        `;
    }

    playButtonSound();
    vibrateButton();
}


/* =====================================================
   CERRAR HERRAMIENTA
===================================================== */

function closeTool() {

    const panel =
        document.getElementById("toolPanel");

    if (panel) {
        panel.classList.remove("show");
    }

    playButtonSound();
    vibrateButton();
}

/* =====================================================
   AJUSTES DEL MENÚ
===================================================== */

function openSetting(type) {

    const menu =
        document.getElementById("menuPanel");

    const panel =
        document.getElementById("toolPanel");

    const title =
        document.getElementById("toolTitle");

    const content =
        document.getElementById("toolContent");

    if (!panel || !content || !title) return;

    if (menu) {
        menu.classList.remove("show");
    }

    panel.classList.add("show");


    /* =========================
       TEMA
    ========================= */

    if (type === "theme") {

        title.textContent = "🎨 Temas";

        content.innerHTML = `
            <p class="tool-info">
                Elige el aspecto de tu calculadora.
            </p>

            <button
                class="tool-calculate"
                onclick="toggleTheme()">

                ☀️ Cambiar tema

            </button>
        `;
    }


    /* =========================
       SONIDO
    ========================= */

    else if (type === "sound") {

        title.textContent =
            "🔊 Sonido y vibración";

        const sound =
            localStorage.getItem("calculatorSound")
            !== "false";

        const vibration =
            localStorage.getItem("calculatorVibration")
            !== "false";

        content.innerHTML = `

            <p class="tool-info">
                Controla los efectos al presionar
                los botones.
            </p>

            <div class="setting-row">

                <div>
                    <strong>🔊 Sonido</strong>

                    <small>
                        Sonido al presionar botones
                    </small>
                </div>

                <button
                    id="soundToggle"
                    class="setting-toggle ${sound ? "on" : ""}"
                    onclick="toggleSoundSetting()">

                    ${sound ? "ON" : "OFF"}

                </button>

            </div>

            <div class="setting-row">

                <div>
                    <strong>📳 Vibración</strong>

                    <small>
                        Vibración al presionar botones
                    </small>
                </div>

                <button
                    id="vibrationToggle"
                    class="setting-toggle ${vibration ? "on" : ""}"
                    onclick="toggleVibrationSetting()">

                    ${vibration ? "ON" : "OFF"}

                </button>

            </div>
        `;
    }


    /* =========================
       CIENTÍFICO
    ========================= */

    else if (type === "scientific") {

        title.textContent =
            "🧮 Modo científico";

        const enabled =
            localStorage.getItem("scientificMode")
            !== "false";

        content.innerHTML = `

            <p class="tool-info">
                Activa o desactiva las funciones
                científicas.
            </p>

            <div class="setting-row">

                <div>
                    <strong>
                        🧮 Funciones científicas
                    </strong>

                    <small>
                        √, π, sin, cos, tan, log, ln...
                    </small>
                </div>

                <button
                    id="scientificToggle"
                    class="setting-toggle ${enabled ? "on" : ""}"
                    onclick="toggleScientificSetting()">

                    ${enabled ? "ON" : "OFF"}

                </button>

            </div>
        `;
    }


    /* =========================
       MEMORIA
    ========================= */

    else if (type === "memory") {

        title.textContent = "🧠 Memoria";

        content.innerHTML = `

            <p class="tool-info">
                Administra la memoria de la calculadora.
            </p>

            <div class="memory-display">

                <span>
                    Memoria actual
                </span>

                <strong id="memoryValue">
                    ${memory}
                </strong>

            </div>

            <div class="memory-menu-buttons">

                <button onclick="memoryStore()">
                    MS
                </button>

                <button onclick="memoryRecall()">
                    MR
                </button>

                <button onclick="memoryAdd()">
                    M+
                </button>

                <button onclick="memorySubtract()">
                    M−
                </button>

                <button onclick="memoryClear()">
                    MC
                </button>

            </div>
        `;
    }

    playButtonSound();
    vibrateButton();
}


/* =====================================================
   SONIDO
===================================================== */

let audioContext = null;


function toggleSoundSetting() {

    const current =
        localStorage.getItem("calculatorSound")
        !== "false";

    const newValue = !current;

    localStorage.setItem(
        "calculatorSound",
        String(newValue)
    );

    const button =
        document.getElementById("soundToggle");

    if (button) {

        button.textContent =
            newValue ? "ON" : "OFF";

        button.classList.toggle(
            "on",
            newValue
        );
    }
}


function playButtonSound() {

    const enabled =
        localStorage.getItem("calculatorSound")
        !== "false";

    if (!enabled) return;

    try {

        if (!audioContext) {

            audioContext =
                new (
                    window.AudioContext ||
                    window.webkitAudioContext
                )();
        }

        if (audioContext.state === "suspended") {
            audioContext.resume();
        }

        const oscillator =
            audioContext.createOscillator();

        const gain =
            audioContext.createGain();

        oscillator.type = "sine";

        oscillator.frequency.value = 500;

        gain.gain.setValueAtTime(
            0.06,
            audioContext.currentTime
        );

        gain.gain.exponentialRampToValueAtTime(
            0.001,
            audioContext.currentTime + 0.06
        );

        oscillator.connect(gain);
        gain.connect(audioContext.destination);

        oscillator.start();

        oscillator.stop(
            audioContext.currentTime + 0.06
        );

    } catch (error) {

        console.log(
            "Sonido no disponible:",
            error
        );
    }
}


/* =====================================================
   VIBRACIÓN
===================================================== */

function toggleVibrationSetting() {

    const current =
        localStorage.getItem("calculatorVibration")
        !== "false";

    const newValue = !current;

    localStorage.setItem(
        "calculatorVibration",
        String(newValue)
    );

    const button =
        document.getElementById("vibrationToggle");

    if (button) {

        button.textContent =
            newValue ? "ON" : "OFF";

        button.classList.toggle(
            "on",
            newValue
        );
    }
}


function vibrateButton() {

    const enabled =
        localStorage.getItem("calculatorVibration")
        !== "false";

    if (!enabled) return;

    if ("vibrate" in navigator) {
        navigator.vibrate(20);
    }
}

/* =====================================================
   MODO CIENTÍFICO
===================================================== */

function toggleScientificSetting() {

    const current =
        localStorage.getItem("scientificMode")
        !== "false";

    const newValue = !current;

    localStorage.setItem(
        "scientificMode",
        String(newValue)
    );

    const button =
        document.getElementById("scientificToggle");

    if (button) {

        button.textContent =
            newValue ? "ON" : "OFF";

        button.classList.toggle(
            "on",
            newValue
        );
    }

    const panel =
        document.getElementById("scientificPanel");

    if (panel) {

        panel.classList.toggle(
            "show",
            newValue
        );
    }
}


function loadScientificMode() {

    const enabled =
        localStorage.getItem("scientificMode")
        !== "false";

    const panel =
        document.getElementById("scientificPanel");

    if (!panel) return;

    panel.classList.toggle(
        "show",
        enabled
    );
}


/* =====================================================
   COMENTARIOS
===================================================== */

function openFeedback() {

    const menu =
        document.getElementById("menuPanel");

    const panel =
        document.getElementById("toolPanel");

    const title =
        document.getElementById("toolTitle");

    const content =
        document.getElementById("toolContent");

    if (!panel || !content || !title) return;

    if (menu) {
        menu.classList.remove("show");
    }

    panel.classList.add("show");

    title.textContent =
        "💬 Enviar comentarios";

    content.innerHTML = `

        <p class="tool-info">
            Cuéntanos qué te parece la calculadora
            o qué función te gustaría agregar.
        </p>

        <input
            type="text"
            id="feedbackName"
            class="tool-input"
            placeholder="Tu nombre (opcional)"
        >

        <textarea
            id="feedbackMessage"
            class="tool-input feedback-textarea"
            placeholder="Escribe tu comentario..."
        ></textarea>

        <button
            class="tool-calculate"
            onclick="sendFeedback()">

            📤 Enviar comentario

        </button>

        <div
            id="feedbackResult"
            class="tool-result"
            style="display:none;">
        </div>
    `;
}


function sendFeedback() {

    const nameInput =
        document.getElementById("feedbackName");

    const messageInput =
        document.getElementById("feedbackMessage");

    const result =
        document.getElementById("feedbackResult");

    if (!nameInput || !messageInput || !result) {
        return;
    }

    const name =
        nameInput.value.trim();

    const message =
        messageInput.value.trim();

    if (!message) {

        result.style.display = "block";

        result.textContent =
            "✏️ Escribe un comentario primero.";

        return;
    }

    const feedback =
        JSON.parse(
            localStorage.getItem(
                "calculatorFeedback"
            )
        ) || [];

    feedback.push({

        name:
            name || "Anónimo",

        message:
            message,

        date:
            new Date().toISOString()
    });

    localStorage.setItem(
        "calculatorFeedback",
        JSON.stringify(feedback)
    );

    result.style.display = "block";

    result.textContent =
        "✅ ¡Gracias por tu comentario!";

    nameInput.value = "";
    messageInput.value = "";

    playButtonSound();
    vibrateButton();
}


/* =====================================================
   CALCULADORA DE FECHA
===================================================== */

function changeDate(direction) {

    const dateInput =
        document.getElementById("singleDate");

    const daysInput =
        document.getElementById("daysToChange");

    const result =
        document.getElementById("dateResult");

    if (!dateInput || !daysInput || !result) {
        return;
    }

    if (!dateInput.value) {

        result.textContent =
            "📅 Selecciona una fecha.";

        return;
    }

    const days =
        Number(daysInput.value);

    if (!Number.isInteger(days) || days < 0) {

        result.textContent =
            "✏️ Ingresa una cantidad válida de días.";

        return;
    }

    const date =
        new Date(
            dateInput.value + "T00:00:00"
        );

    date.setDate(
        date.getDate() +
        (days * direction)
    );

    const year =
        date.getFullYear();

    const month =
        String(
            date.getMonth() + 1
        ).padStart(2, "0");

    const day =
        String(
            date.getDate()
        ).padStart(2, "0");

    const newDate =
        `${year}-${month}-${day}`;

    dateInput.value = newDate;

    const formatted =
        date.toLocaleDateString(
            "es-CO",
            {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric"
            }
        );

    result.innerHTML = `
        📅 Nueva fecha:

        <strong>
            ${formatted}
        </strong>
    `;

    playButtonSound();
    vibrateButton();
}


/* =====================================================
   CONVERSOR DE TIEMPO
===================================================== */

function calculateTime() {

    const hours =
        Number(
            document.getElementById("timeHours").value
        ) || 0;

    const minutes =
        Number(
            document.getElementById("timeMinutes").value
        ) || 0;

    const seconds =
        Number(
            document.getElementById("timeSeconds").value
        ) || 0;

    const totalSeconds =
        (hours * 3600) +
        (minutes * 60) +
        seconds;

    const totalMinutes =
        totalSeconds / 60;

    const totalHours =
        totalSeconds / 3600;

    const result =
        document.getElementById("timeResult");

    if (!result) return;

    result.innerHTML = `
        <strong>
            ${totalSeconds}
        </strong>
        segundos

        <br><br>

        ${totalMinutes.toLocaleString(
            "es-CO",
            {
                maximumFractionDigits: 4
            }
        )}
        minutos

        <br><br>

        ${totalHours.toLocaleString(
            "es-CO",
            {
                maximumFractionDigits: 4
            }
        )}
        horas
    `;

    playButtonSound();
    vibrateButton();
}

/* =====================================================
   CALCULAR ÁREA
===================================================== */

function calculateArea() {

    const type =
        document.getElementById("areaType")?.value;

    const a =
        Number(
            document.getElementById("areaA")?.value
        );

    const b =
        Number(
            document.getElementById("areaB")?.value
        );

    const result =
        document.getElementById("areaResult");

    if (!result) return;

    let area = 0;

    if (type === "square") {

        if (!a) {
            result.textContent =
                "✏️ Ingresa el lado.";
            return;
        }

        area = a * a;
    }

    else if (type === "rectangle") {

        if (!a || !b) {
            result.textContent =
                "✏️ Ingresa los dos valores.";
            return;
        }

        area = a * b;
    }

    else if (type === "circle") {

        if (!a) {
            result.textContent =
                "✏️ Ingresa el radio.";
            return;
        }

        area = Math.PI * a * a;
    }

    else if (type === "triangle") {

        if (!a || !b) {
            result.textContent =
                "✏️ Ingresa base y altura.";
            return;
        }

        area = (a * b) / 2;
    }

    result.innerHTML = `
        📐 Área:

        <strong>
            ${area.toLocaleString(
                "es-CO",
                {
                    maximumFractionDigits: 8
                }
            )}
        </strong>
    `;

    playButtonSound();
    vibrateButton();
}


/* =====================================================
   CONVERTIR TEMPERATURA
===================================================== */

function calculateTemperature() {

    const value =
        Number(
            document.getElementById("tempValue")?.value
        );

    const from =
        document.getElementById("tempFrom")?.value;

    const to =
        document.getElementById("tempTo")?.value;

    const result =
        document.getElementById("tempResult");

    if (!result) return;

    if (Number.isNaN(value)) {

        result.textContent =
            "✏️ Ingresa una temperatura.";

        return;
    }

    let celsius;

    /* Convertir primero a Celsius */

    if (from === "C") {

        celsius = value;

    } else if (from === "F") {

        celsius =
            (value - 32) * 5 / 9;

    } else if (from === "K") {

        celsius =
            value - 273.15;
    }


    /* Celsius al destino */

    let converted;

    if (to === "C") {

        converted = celsius;

    } else if (to === "F") {

        converted =
            (celsius * 9 / 5) + 32;

    } else if (to === "K") {

        converted =
            celsius + 273.15;
    }


    result.innerHTML = `
        🌡️ Resultado:

        <strong>
            ${converted.toLocaleString(
                "es-CO",
                {
                    maximumFractionDigits: 6
                }
            )}
            °${to}
        </strong>
    `;

    playButtonSound();
    vibrateButton();
}


/* =====================================================
   INICIALIZACIÓN
===================================================== */

function initializeCalculator() {

    loadTheme();

    loadScientificMode();

    updateMemoryPanel();

    renderHistory();

    updateDisplay();
}


/* =====================================================
   INICIAR CUANDO CARGUE LA PÁGINA
===================================================== */

if (document.readyState === "loading") {

    document.addEventListener(
        "DOMContentLoaded",
        initializeCalculator
    );

} else {

    initializeCalculator();
}


/* =====================================================
   SONIDO + VIBRACIÓN PARA BOTONES HTML
===================================================== */

/*
   Esto hace que los botones que tengan
   onclick o sean botones de la calculadora
   también puedan producir sonido y vibración.
*/

document.addEventListener(
    "click",
    function(event) {

        const button =
            event.target.closest("button");

        if (!button) return;

        /*
           Los botones de configuración
           también pueden usar los efectos.
        */

        playButtonSound();
        vibrateButton();
    }
);

/* =====================================================
   ACERCA DE
===================================================== */

function openAbout() {

    const menu =
        document.getElementById("menuPanel");

    const panel =
        document.getElementById("toolPanel");

    const title =
        document.getElementById("toolTitle");

    const content =
        document.getElementById("toolContent");

    if (!panel || !content || !title) {
        return;
    }

    /* Cerrar menú */

    if (menu) {
        menu.classList.remove("show");
    }

    /* Abrir ventana */

    panel.classList.add("show");

    /* Título */

    title.textContent =
        "ℹ️ Acerca de";

    /* Contenido */

    content.innerHTML = `

        <div class="about-box">

            <div class="about-icon">
                🧮
            </div>

            <h2>
                Calculadora
            </h2>

            <p class="about-description">
                Una calculadora moderna, rápida y fácil
                de usar con funciones básicas,
                científicas y herramientas adicionales.
            </p>

            <div class="about-info">

    <div class="about-item">

        <span>👤</span>

        <div>
            <small>Creado por</small>
            <strong>
                Deiver Julián
            </strong>
        </div>

    </div>

    <div class="about-item">

        <span>📧</span>

        <div>
            <small>Correo</small>
            <strong>
                deivervalois@gmail.com
            </strong>
        </div>

    </div>

    <div class="about-item">

        <span>📅</span>

        <div>
            <small>Año</small>
            <strong>
                2026
            </strong>
        </div>

    </div>

    <div class="about-item">

        <span>⚡</span>

        <div>
            <small>Versión</small>
            <strong>
                1.0
            </strong>
        </div>

    </div>

</div>

            <div class="about-footer">

                Hecho con ❤️ y JavaScript

            </div>

        </div>

    `;
}