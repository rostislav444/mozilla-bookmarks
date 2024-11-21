let sidebarElement = null;

function createSidebar() {
    // Создаем элемент сайдбара
    sidebarElement = document.createElement('div');
    sidebarElement.id = 'bookmark-sidebar-trigger';

    // Стили для сайдбара
    sidebarElement.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 3px;
        height: 100vh;
        background: rgba(255, 255, 255, 0.1);
        z-index: 999999;
        transition: all 0.3s ease;
    `;

    // Создаем реальный сайдбар, который будет появляться при наведении
    const sidebarContent = document.createElement('div');
    sidebarContent.id = 'bookmark-sidebar-content';
    sidebarContent.style.cssText = `
        position: fixed;
        top: 0;
        left: -300px;
        width: 300px;
        height: 100vh;
        background: rgba(17, 24, 39, 0.95);
        backdrop-filter: blur(8px);
        z-index: 999998;
        transition: all 0.3s ease;
        border-right: 1px solid rgba(255, 255, 255, 0.1);
    `;

    // Добавляем обработчики наведения
    function showSidebar() {
        sidebarElement.style.width = '300px';
        sidebarElement.style.background = 'rgba(17, 24, 39, 0.95)';
        sidebarContent.style.left = '0';
    }

    function hideSidebar(e) {
        // Проверяем, не находится ли курсор все еще над сайдбаром
        const rect = sidebarElement.getBoundingClientRect();
        if (e.clientX > rect.right ||
            e.clientX < rect.left ||
            e.clientY > rect.bottom ||
            e.clientY < rect.top) {
            sidebarElement.style.width = '3px';
            sidebarElement.style.background = 'rgba(255, 255, 255, 0.1)';
            sidebarContent.style.left = '-300px';
        }
    }

    sidebarElement.addEventListener('mouseenter', showSidebar);
    sidebarElement.addEventListener('mouseleave', hideSidebar);
    sidebarContent.addEventListener('mouseleave', hideSidebar);

    // Добавляем элементы на страницу
    document.body.appendChild(sidebarElement);
    document.body.appendChild(sidebarContent);

    // Получаем закладки и отображаем их в сайдбаре
    browser.runtime.sendMessage({ type: 'GET_BOOKMARKS' })
        .then(response => {
            if (response.bookmarks) {
                renderBookmarks(response.bookmarks, sidebarContent);
            }
        });
}

function renderBookmarks(bookmarks, container) {
    // Здесь будет код рендеринга закладок
    // Можно использовать упрощенную версию вашего существующего компонента
    container.innerHTML = `
        <div style="padding: 20px; color: white;">
            <h2 style="margin-bottom: 20px; font-size: 18px;">Закладки</h2>
            <div id="bookmarks-container"></div>
        </div>
    `;
}

// Создаем сайдбар при загрузке страницы
createSidebar();