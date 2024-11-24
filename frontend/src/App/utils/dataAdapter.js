// BookmarksAdapter.js

// Абстрактный класс, определяющий интерфейс
class BookmarksAdapterBase {
  async getTree() {
    throw new Error('Method not implemented');
  }

  async getSubTree(id) {
    throw new Error('Method not implemented');
  }

  async get(id) {
    throw new Error('Method not implemented');
  }

  async create(bookmark) {
    throw new Error('Method not implemented');
  }

  async update(id, changes) {
    throw new Error('Method not implemented');
  }

  async remove(id) {
    throw new Error('Method not implemented');
  }

  async move(id, destination) {
    throw new Error('Method not implemented');
  }

  subscribeToChanges(callback) {
    throw new Error('Method not implemented');
  }

  unsubscribeFromChanges(callback) {
    throw new Error('Method not implemented');
  }
}

// Адаптер для работы с браузерным API
class BrowserBookmarksAdapter extends BookmarksAdapterBase {
  constructor() {
    super();
    this.changeListeners = new Set();
  }

  async getTree() {
    const tree = await browser.bookmarks.getTree();
    return tree;
  }

  async getSubTree(id) {
    return await browser.bookmarks.getSubTree(id);
  }

  async get(id) {
    return await browser.bookmarks.get(id);
  }

  async create(bookmark) {
    return await browser.bookmarks.create(bookmark);
  }

  async update(id, changes) {
    return await browser.bookmarks.update(id, changes);
  }

  async remove(id) {
    return await browser.bookmarks.remove(id);
  }

  async move(id, destination) {
    return await browser.bookmarks.move(id, destination);
  }

  subscribeToChanges(callback) {
    this.changeListeners.add(callback);

    if (this.changeListeners.size === 1) {
      // Устанавливаем слушатели только при первой подписке
      this.setupBrowserListeners();
    }
  }

  unsubscribeFromChanges(callback) {
    this.changeListeners.delete(callback);

    if (this.changeListeners.size === 0) {
      // Удаляем слушатели, если больше нет подписчиков
      this.removeBrowserListeners();
    }
  }

  setupBrowserListeners() {
    const events = ['onCreated', 'onRemoved', 'onChanged', 'onMoved'];
    this.handlers = events.map(event => {
      const handler = () => {
        this.changeListeners.forEach(callback => callback());
      };
      browser.bookmarks[event].addListener(handler);
      return { event, handler };
    });
  }

  removeBrowserListeners() {
    this.handlers.forEach(({ event, handler }) => {
      browser.bookmarks[event].removeListener(handler);
    });
    this.handlers = [];
  }
}

// Адаптер для работы с веб API
class WebBookmarksAdapter extends BookmarksAdapterBase {
  constructor(apiBaseUrl) {
    super();
    this.apiBaseUrl = apiBaseUrl;
    this.changeListeners = new Set();
    this.setupWebSocket();
  }

  async fetchWithAuth(endpoint, options = {}) {
    const response = await fetch(`${this.apiBaseUrl}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  }

  async getTree() {
    return await this.fetchWithAuth('/bookmarks/tree');
  }

  async getSubTree(id) {
    return await this.fetchWithAuth(`/bookmarks/subtree/${id}`);
  }

  async get(id) {
    return await this.fetchWithAuth(`/bookmarks/${id}`);
  }

  async create(bookmark) {
    return await this.fetchWithAuth('/bookmarks', {
      method: 'POST',
      body: JSON.stringify(bookmark),
    });
  }

  async update(id, changes) {
    return await this.fetchWithAuth(`/bookmarks/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(changes),
    });
  }

  async remove(id) {
    return await this.fetchWithAuth(`/bookmarks/${id}`, {
      method: 'DELETE',
    });
  }

  async move(id, destination) {
    return await this.fetchWithAuth(`/bookmarks/${id}/move`, {
      method: 'POST',
      body: JSON.stringify(destination),
    });
  }

  setupWebSocket() {
    this.ws = new WebSocket(`${this.apiBaseUrl.replace('http', 'ws')}/ws/bookmarks`);

    this.ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'bookmarks_updated') {
        this.changeListeners.forEach(callback => callback());
      }
    };

    this.ws.onclose = () => {
      // Переподключение через 5 секунд
      setTimeout(() => this.setupWebSocket(), 5000);
    };
  }

  subscribeToChanges(callback) {
    this.changeListeners.add(callback);
  }

  unsubscribeFromChanges(callback) {
    this.changeListeners.delete(callback);
  }
}

// Фабрика для создания нужного адаптера
class BookmarksAdapterFactory {
  static create(mode, config = {}) {
    switch (mode) {
      case 'extension':
        return new BrowserBookmarksAdapter();
      case 'web':
        if (!config.apiBaseUrl) {
          throw new Error('apiBaseUrl is required for web mode');
        }
        return new WebBookmarksAdapter(config.apiBaseUrl);
      default:
        throw new Error(`Unknown mode: ${mode}`);
    }
  }
}

export { BookmarksAdapterFactory };