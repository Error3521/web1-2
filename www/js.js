document.addEventListener('DOMContentLoaded', function() {
  migrateOldData();
  
  const typeSelect = document.getElementById('type');
  const iconField = document.getElementById('icon');

  typeSelect.addEventListener('change', function() {
    iconField.required = this.value === 'payment';
  });
  iconField.required = typeSelect.value === 'payment';

  document.getElementById('addMethodForm').addEventListener('submit', function(e) {
    e.preventDefault();

    // Генерация уникального ID с гарантией уникальности
    const method = {
      id: uuidv4(), // Используем кроссбраузерную функцию для генерации UUID
      type: typeSelect.value,
      title: document.getElementById('title').value,
      text: document.getElementById('text').value,
      icon: iconField.value
    };

    if (method.type === 'payment' && !method.icon) {
      alert('Для способа оплаты необходимо указать иконку');
      return;
    }

    saveMethod(method);
    renderMethod(method);
    this.reset();
  });

  // Обработчик для удаления
  document.body.addEventListener('click', function(e) {
    if (e.target.classList.contains('delete-btn')) {
      const card = e.target.closest('.card, .tariff');
      const id = card.dataset.id; // Не нужно преобразовывать в число для UUID
      const type = card.classList.contains('card') ? 'payment' : 'delivery';

      console.log('Deleting:', { type, id });
      
      if (deleteMethod(type, id)) {
        card.remove();
      } else {
        console.error('Не удалось найти метод для удаления');
      }
    }
  });

  loadAndRenderMethods();
});

// Функции хранения данных
function saveMethod(method) {
  const key = `${method.type}Methods`;
  const methods = JSON.parse(localStorage.getItem(key)) || [];
  methods.push(method);
  localStorage.setItem(key, JSON.stringify(methods));
  console.log('Saved methods:', methods); // Добавляем лог
}

function deleteMethod(type, id) {
  const key = `${type}Methods`;
  let methods = JSON.parse(localStorage.getItem(key)) || [];
  const initialLength = methods.length;
  
  methods = methods.filter(m => m.id !== id);
  
  if (methods.length < initialLength) {
    localStorage.setItem(key, JSON.stringify(methods));
    console.log('Updated methods:', methods);
    return true;
  }
  return false;
}

// Визуализация
function renderMethod(method) {
  const container = document.querySelector(method.type === 'payment' 
    ? '.cards' 
    : '.tariffs'
  );

  const card = document.createElement('div');
  card.className = method.type === 'payment' ? 'card' : 'tariff';
  card.dataset.id = method.id;

  let html = `
    <button class="delete-btn" title="Удалить">×</button>
    <div class="text">
      <h3>${method.title}</h3>
      <p>${method.text}</p>
    </div>
  `;

  if (method.type === 'payment' && method.icon) {
    html += `<div class="icon"><img src="${method.icon}" alt="${method.title}"></div>`;
  }

  card.innerHTML = html;
  container.appendChild(card);
}

function loadAndRenderMethods() {
  ['payment', 'delivery'].forEach(type => {
    const key = `${type}Methods`;
    const methods = JSON.parse(localStorage.getItem(key)) || [];
    console.log(`Loading ${key}:`, methods); // Лог загрузки
    methods.forEach(method => renderMethod(method));
  });
}

function migrateOldData() {
  ['payment', 'delivery'].forEach(type => {
    const key = `${type}Methods`;
    const methods = JSON.parse(localStorage.getItem(key)) || [];
    
    if (methods.length && typeof methods[0].id !== 'string') {
      const migrated = methods.map(m => ({
        ...m,
        id: m.id ? String(m.id) : uuidv4()
      }));
      
      localStorage.setItem(key, JSON.stringify(migrated));
      console.log(`Migrated ${key}:`, migrated);
    }
  });
}

// Кроссбраузерная генерация UUID
function uuidv4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}