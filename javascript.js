                                                                
                                                                /* ОБЩИЕ ФУНКЦИИ ДЛЯ ВСЕХ СТРАНИЦ */

// ФУНКЦИЯ: ПОДСВЕТКА АКТИВНОЙ СТРАНИЦЫ В МЕНЮ
function highlightActivePage() {
    // Получаем текущий путь страницы:
    // window.location.pathname - Возвращает путь к текущей странице
    // .pop() - Берёт последний элемент массива
    const currentPage = window.location.pathname.split('/').pop() || 'about.html'; 
    
    // Находим все ссылки меню (находит все элементы с классом .menu-link (ссылки в меню) и сохраняет их в переменную menuLinks)
    const menuLinks = document.querySelectorAll('.menu-link');
    
    // Запускает цикл forEach, который выполнит код внутри для каждой ссылки в меню
    menuLinks.forEach(link => {
        // Получаем href ссылки (Извлекает значение атрибута href из текущей ссылки (например, "news.html"))
        const linkPage = link.getAttribute('href');
        
        // Если страница совпадает - добавляем класс active
        if (linkPage === currentPage) {
            link.classList.add('active');
        }
    });
}

// ФУКЦИЯ: КНОПКА "НАВЕРХ"
function initBackToTop() {
    const btn = document.getElementById('backToTop'); // Находит кнопку с id="backToTop"
    if (!btn) return;                                 // Если кнопки нет на странице - выходим
    
    // Показываем/скрываем кнопку при прокрутке
    window.addEventListener('scroll', () => {
        if (window.scrollY > 300) {                   //обработчик события scroll на окно браузера (Пользователь прокрутил больше 300 пикселей вниз)
            btn.style.opacity = '1';                  // Делаем кнопку видимой
            btn.style.pointerEvents = 'all';          // Разрешаем клики по кнопке
        } else {
            btn.style.opacity = '0';
            btn.style.pointerEvents = 'none';
        }
    });
    
    // Плавная прокрутка наверх при клике
    btn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth' // Плавно прокручивает страницу в начало (top: 0)
        });
    });
}

// Запуск функций после загрузки DOM (событие, которое срабатывает, когда весь HTML-код загружен и распарсен)
document.addEventListener('DOMContentLoaded', () => {
    highlightActivePage();                              // подсветить активный пункт меню
    initBackToTop();                                    // инициализировать кнопку «Наверх»
});




                                                                    /* NEWS (Функционал страницы новостей) */

// ФУНКЦИЯ: РАСКРЫТИЕ/СКРЫТИЕ ПОЛНОГО ТЕКСТА НОВОСТИ
function toggleNews(newsId) {                                           // Объявляет функцию toggleNews, которая принимает newsId (номер новости)
    // Находим элемент с полным текстом по ID
    const fullText = document.getElementById(`news-${newsId}-full`);
    const preview = document.getElementById(`news-${newsId}-preview`);
    const btn = document.getElementById(`news-${newsId}-btn`);
    
    // Проверяем, скрыт ли полный текст
    // === 'none' — явно скрыт через стиль, !fullText.style.display — стиль не задан (по умолчанию элемент видим)
    if (fullText.style.display === 'none' || !fullText.style.display) { 
        fullText.style.display = 'block';                                   // Показать полный текст
        preview.style.display = 'none';                                     // Скрыть превью
        btn.textContent = 'Скрыть';                                         // Поменять текст кнопки
        btn.classList.add('active');                                        // Добавить класс для стилей
    } else {
        fullText.style.display = 'none';                                    // Скрыть полный текст
        preview.style.display = 'block';                                    // Показать превью
        btn.textContent = 'Показать';                                       // Вернуть текст кнопки
        btn.classList.remove('active');                                     // Убрать класс
    }
}

// ФУНКЦИЯ: ИНИЦИАЛИЗАЦИЯ КАРТОЧЕК НОВОСТЕЙ (Гарантирует, что при загрузке страницы все новости показывают только превью)
function initNewsCards() {
    // Скрываем все полные тексты при загрузке
    document.querySelectorAll('[id$="-full"]').forEach(el => { // Находит все элементы с id, оканчивающимся на -full (полные тексты новостей)
        el.style.display = 'none';                             // Скрывает их через display: none
    });
}

// Запуск после загрузки DOM (Запускает initNewsCards() после загрузки HTML, чтобы скрыть полные тексты до первого клика пользователя)
document.addEventListener('DOMContentLoaded', initNewsCards);









                                                            /* CURRENCY - Калькулятор валют и график курса (Египетский фунт) */

// ГЛОБАЛЬНЫЕ ПЕРЕМЕННЫЕ
let currentRate = 1.95; // Хранит текущий курс валюты. Начальное значение 1.95 — резервное, если API ЦБ недоступен (let - можно менять)
const CURRENCY = 'EGP'; // Код валюты (Египетский фунт = EGP), не меняется в ходе работы

// ФУНКЦИЯ: ЗАГРУЗКА ТЕКУЩЕГО КУРСА
// async означает, что внутри функции будут операции, требующие ожидания (запрос к серверу)
// Начинает блок try — код, который может вызвать ошибку (например, нет интернета). Если ошибка произойдёт, выполнение перейдёт в catch
async function fetchCurrentRate() {
    try {
        const res = await fetch('https://www.cbr-xml-daily.ru/daily_json.js');  // await - приостанавливает выполнение функции, пока не придёт ответ от сервера 
        if (!res.ok) throw new Error('Сеть');                                   // Проверяет статус ответа
        const data = await res.json();                                          // Парсит ответ сервера из формата JSON в обычный JavaScript-объект
        
        // Проверяет, есть ли нужная валюта в ответе (data.Valute - объект со всеми валютами от ЦБ, 
        // ?.[CURRENCY] — «опциональная цепочка»: безопасно обращается к ключу 'EGP')
        if (data.Valute?.[CURRENCY]) { 
            currentRate = data.Valute[CURRENCY].Value / data.Valute[CURRENCY].Nominal;    // Рассчитывает курс за 1 единицу валюты
            document.getElementById('current-rate').textContent = currentRate.toFixed(4); // Находит <span id="current-rate"> и вставляет курс, округлённый до 4 знаков 
            document.getElementById('rate-date').textContent = new Date(data.Date).toLocaleDateString('ru-RU'); // Находит <span id="rate-date"> и вставляет дату  
            return true; // сигнализирует, что данные успешно загружены
        }
    // Блок catch перехватывает любую ошибку из try
    } catch (e) {
        console.log('⚠️ Используем резервный курс');
    }
    // Если загрузка не удалась (Показывает резервный курс с пометкой «(рез.)»)
    document.getElementById('current-rate').textContent = currentRate.toFixed(4) + ' (рез.)';
    return false;
}


// ФУНКЦИЯ: КОНВЕРТАЦИЯ
function convertCurrency(direction) { // Объявляет функцию convertCurrency, которая принимает параметр direction — направление конвертации
    
    // Находит поле ввода суммы, Безопасно получает значение (?.value), Преобразует строку в число с плавающей точкой (parseFloat
    const amount = parseFloat(document.getElementById('amount-input')?.value || 0);
    
    const result = document.getElementById('result-output'); // Находит элемент, куда будет выведен результат расчёта
    if (!amount || amount < 0) {
        result.textContent = 'Введите число';
        return;
    }
    // Тернарный оператор — короткая запись if/else: 
    // Если направление rub-to-egp: делим рубли на курс → получаем фунты
    // Иначе: умножаем фунты на курс → получаем рубли
    const value = direction === 'rub-to-egp' ? amount / currentRate : amount * currentRate;
    result.textContent = `${value.toFixed(2)} ${direction === 'rub-to-egp' ? CURRENCY : 'RUB'}`;
}


// ФУНКЦИЯ: ГЕНЕРАЦИЯ ДАННЫХ ДЛЯ ГРАФИКА
function generateChartData(days = 35) {
    const data = [];            //  пустой массив для хранения точек графика
    const today = new Date();   // текущая дата
    const base = currentRate;   // базовый курс, от которого будут отклонения
    
    // Цикл от 34 до 0 (всего 35 итераций)
    for (let i = days - 1; i >= 0; i--) {
        const date = new Date(today);                                // создаёт копию даты, чтобы не менять оригинал
        date.setDate(date.getDate() - i);                            // отнимает i дней от текущей даты (получаем даты в прошлом)
        
        // Небольшое случайное отклонение ±3% от базового курса
        const rate = base * (1 + (Math.random() - 0.5) * 0.06);
        
        // Добавляет в массив объект с данными за день
        data.push({
            date: date.toISOString().split('T')[0],
            display: date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' }),
            rate: parseFloat(rate.toFixed(4))
        });
    }
    return data; // возвращает заполненный массив
}

// ФУНКЦИЯ: ОТРИСОВКА ГРАФИКА
function renderChart(data) {
    const chart = document.getElementById('currency-chart');    // Находит контейнер для графика
    const info = document.getElementById('chart-info');         // Находит блок для вывода информации при клике
    
    if (!chart) {
        console.error('❌ Не найден элемент #currency-chart');
        return;
    }
    
    chart.innerHTML = ''; // innerHTML = '' — очищает контейнер (на случай повторной отрисовки)
    if (!data || data.length === 0) {
        chart.innerHTML = '<p style="text-align:center; width:100%; color:#666;">Нет данных</p>'; // Если данных нет — показывает сообщение «Нет данных» и выходит
        return;
    }
    
    // Находим мин/макс для масштабирования
    const rates = data.map(d => d.rate);        // Создаёт массив только из значений курса
    const min = Math.min(...rates) * 0.95;      // Находит минимальное значение (оператор ... «распаковывает» массив в аргументы)
    const max = Math.max(...rates) * 1.05;
    const range = max - min || 1;               // Диапазон значений
    
    // Создаём столбцы
    // Для каждого дня:
    data.forEach((item, i) => {
        const bar = document.createElement('div'); // создаёт новый HTML-элемент <div>
        bar.className = 'chart-bar'; // присваивает класс для применения стилей из CSS (цвет, скругление, анимация)
        
        // Высота пропорциональна значению
        const h = ((item.rate - min) / range) * 100;
        bar.style.height = `${Math.max(h, 3)}%`;        // гарантирует, что даже самый маленький столбец будет виден
        bar.style.minHeight = '4px';
        
        // Сохраняем данные
        bar.dataset.date = item.display;
        bar.dataset.rate = item.rate.toFixed(4);
        bar.dataset.fullDate = item.date;
        
        // Устанавливает всплывающую подсказку браузера (атрибут title), которая появляется при наведении мыши.
        bar.title = `${item.display}: ${item.rate.toFixed(4)} RUB`;
        
        // Клик = выделение + показ информации
        bar.onclick = function() {
            document.querySelectorAll('.chart-bar').forEach(b => b.classList.remove('active')); // Находит все столбцы и убирает у них класс active (снимает выделение)
            this.classList.add('active'); // Добавляет active текущему столбцу (this) — в CSS этот класс меняет цвет на красный
            if (info) {
                info.innerHTML = `<strong>📅 ${this.dataset.fullDate}</strong><br>💱 ${this.dataset.rate} RUB за 1 ${CURRENCY}`;
            }
        };
        
        chart.appendChild(bar); // добавляет созданный столбец в контейнер графика
    });
}

// ФУНКЦИЯ: ЗАПУСК ПРИ ЗАГРУЗКЕ СТРАНИЦЫ
document.addEventListener('DOMContentLoaded', async () => {
    // Загружаем курс
    await fetchCurrentRate();
    
    // Генерируем данные и рисуем график (всегда!)
    const chartData = generateChartData(35);
    renderChart(chartData);
    
    // Кнопки калькулятора
    const btn1 = document.getElementById('btn-rub-to-egp');
    const btn2 = document.getElementById('btn-egp-to-rub');
    if (btn1) btn1.onclick = () => convertCurrency('rub-to-egp');
    if (btn2) btn2.onclick = () => convertCurrency('egp-to-rub');

    // Подсветка активного меню
    const page = window.location.pathname.split('/').pop() || 'currency.html';
    document.querySelectorAll('.menu-link, .menu-item').forEach(link => {
        if (link.href?.includes(page)) link.classList.add('active');
    });

});
