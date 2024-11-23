console.log('Bookmark Extension: Content script loaded');

function createSidebarUI() {
    const container = document.createElement('div');
    container.id = 'bookmark-ext-container';
    container.innerHTML = `
        <div id="bookmark-ext-trigger">
            <div class="trigger-line"></div>
        </div>
        <div id="bookmark-ext-content">
            <div class="sidebar-header">
                <h3>Закладки</h3>
            </div>
            <div class="bookmarks-list">
                <!-- Здесь будут закладки -->
            </div>
        </div>
    `;
    document.body.appendChild(container);

    // Получаем закладки через background script
    browser.runtime.sendMessage({ type: 'GET_BOOKMARKS' })
        .then(response => {
            if (response && response.bookmarks) {
                renderBookmarks(response.bookmarks);
            }
        })
        .catch(error => console.error('Error fetching bookmarks:', error));
}

function renderBookmarks(bookmarks) {
    const bookmarksList = document.querySelector('.bookmarks-list');
    if (!bookmarksList) return;

    function processBookmarkNode(node) {
        if (node.url) {
            return `
                <div class="bookmark-item">
                    <img src="${node.favIconUrl || 'icons/default-favicon.svg'}" alt="" class="favicon">
                    <a href="${node.url}" class="bookmark-link">${node.title}</a>
                </div>
            `;
        } else if (node.children) {
            const childrenHtml = node.children.map(processBookmarkNode).join('');
            if (childrenHtml) {
                return `
                    <div class="bookmark-folder">
                        <div class="folder-header">${node.title}</div>
                        <div class="folder-content">${childrenHtml}</div>
                    </div>
                `;
            }
        }
        return '';
    }

    bookmarksList.innerHTML = bookmarks.map(processBookmarkNode).join('');
}

// Инициализация сайдбара
function initSidebar() {
    if (document.getElementById('bookmark-ext-container')) return;

    createSidebarUI();

    let isOpen = false;
    const trigger = document.getElementById('bookmark-ext-trigger');
    const content = document.getElementById('bookmark-ext-content');
    const container = document.getElementById('bookmark-ext-container');

    if (trigger && content && container) {
        trigger.addEventListener('mouseenter', () => {
            if (!isOpen) {
                container.classList.add('sidebar-open');
                isOpen = true;
            }
        });

        container.addEventListener('mouseleave', (e) => {
            const rect = container.getBoundingClientRect();
            if (e.clientX > rect.right || e.clientX < rect.left) {
                container.classList.remove('sidebar-open');
                isOpen = false;
            }
        });
    }
}

// Запускаем инициализацию
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSidebar);
} else {
    initSidebar();
}