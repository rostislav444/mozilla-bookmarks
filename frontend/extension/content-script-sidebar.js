function initSidebar() {
    if (document.getElementById('bookmark-sidebar-frame')) return;

    // Создаем trigger-полоску
    const trigger = document.createElement('div');
    trigger.id = 'bookmark-sidebar-trigger';
    trigger.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 4px;
        height: 100vh;
        background: rgba(75, 85, 99, 0.3);
        z-index: 2147483647;
        cursor: pointer;
        transition: background-color 0.2s;
    `;

    // Создаем iframe
    const iframe = document.createElement('iframe');
    iframe.id = 'bookmark-sidebar-frame';
    iframe.src = browser.runtime.getURL('sidebar.html');
    iframe.style.cssText = `
        position: fixed;
        top: 0;
        left: -400px;
        width: 400px;
        height: 100vh;
        border: none;
        z-index: 2147483646;
        background: transparent;
        transition: left 0.3s ease;
    `;

    // Добавляем элементы на страницу
    document.body.appendChild(trigger);
    document.body.appendChild(iframe);

    // Обработчики событий
    let isOpen = false;
    let timeoutId = null;

    function openSidebar() {
        if (timeoutId) clearTimeout(timeoutId);
        iframe.style.left = '0';
        isOpen = true;
    }

    function closeSidebar() {
        timeoutId = setTimeout(() => {
            iframe.style.left = '-400px';
            isOpen = false;
        }, 300); // Небольшая задержка перед закрытием
    }

    // Показываем сайдбар при наведении на триггер
    trigger.addEventListener('mouseenter', () => {
        openSidebar();
    });

    // Наведение на iframe отменяет закрытие
    iframe.addEventListener('mouseenter', () => {
        if (timeoutId) clearTimeout(timeoutId);
    });

    // Уход мыши с iframe запускает закрытие
    iframe.addEventListener('mouseleave', (e) => {
        // Проверяем, что мышь не перешла на триггер
        if (e.relatedTarget !== trigger) {
            closeSidebar();
        }
    });

    // Уход мыши с триггера запускает закрытие, если мышь не перешла на iframe
    trigger.addEventListener('mouseleave', (e) => {
        if (e.relatedTarget !== iframe) {
            closeSidebar();
        }
    });

    // При клике вне сайдбара закрываем его
    document.addEventListener('click', (e) => {
        if (!iframe.contains(e.target) && !trigger.contains(e.target) && isOpen) {
            closeSidebar();
        }
    });

    // Триггер меняет цвет при наведении
    trigger.addEventListener('mouseenter', () => {
        trigger.style.background = 'rgba(75, 85, 99, 0.5)';
    });

    trigger.addEventListener('mouseleave', () => {
        trigger.style.background = 'rgba(75, 85, 99, 0.3)';
    });
}

// Запускаем инициализацию
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSidebar);
} else {
    initSidebar();
}