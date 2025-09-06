// ---------- 1. Базовые игры (встроено в JS) ----------
const GAMES_BASE = [
  {
    id: "wildgate",
    name: "Wildgate",
    steamId: "3504780",
    image: "wildgate.jpg",
    description: "Онлайн-симулятор дикой природы с выживанием и кооперативом.",
    tags: ["MMO", "Выживание", "Кооператив"],
    votes: 0
  },
  {
    id: "snowrunner",
    name: "SnowRunner",
    steamId: "1465360",
    image: "snowrunner.jpg",
    description: "Реалистичный симулятор вождения по бездорожью и снегу.",
    tags: ["Симулятор", "Авто", "Физика"],
    votes: 0
  },
  {
    id: "peak",
    name: "Peak",
    steamId: "3527290",
    image: "peak.jpg",
    description: "Приключенческая головоломка в горах с погодными катастрофами.",
    tags: ["Головоломка", "Приключение", "Погода"],
    votes: 0
  },
  {
    id: "panicore",
    name: "Panicore",
    steamId: "2695940",
    image: "panicore.jpg",
    description: "Кооперативный хоррор с элементами стелса и разумными монстрами.",
    tags: ["Хоррор", "Кооператив", "Стелс"],
    votes: 0
  }
];

// ---------- 2. Хранение в localStorage ----------
let games = [];
let votesLeft = 3;

function loadData() {
  const saved = JSON.parse(localStorage.getItem('games')) || GAMES_BASE;
  games = saved.map(base => ({
    ...base,
    votes: base.votes || 0
  }));
  votesLeft = parseInt(localStorage.getItem('votesLeft') || 3);
}

function saveData() {
  localStorage.setItem('games', JSON.stringify(games));
  localStorage.setItem('votesLeft', votesLeft);
}

// ---------- 3. Рендер ----------
function renderAll() {
  const grid = document.getElementById('gamesGrid');
  grid.innerHTML = '';

  games.forEach(game => {
    let imgSrc;
    if (['wildgate', 'snowrunner', 'peak', 'panicore'].includes(game.id)) {
      imgSrc = game.image;
    } else {
      imgSrc = `https://cdn.cloudflare.steamstatic.com/steam/apps/${game.steamId}/header.jpg`;
    }

    const card = document.createElement('div');
    card.className = 'game-card';
    card.innerHTML = `
      <img src="${imgSrc}" alt="${game.name}" onerror="this.src='fallback.jpg'">
      <div class="content">
        <h3>${game.name}</h3>
        <p>${game.description}</p>
        <div class="tags">${game.tags.map(t => `<span>#${t}</span>`).join('')}</div>
        <div class="votes-count">${game.votes} голос(а)</div>
      </div>
    `;
    card.onclick = () => vote(game.id);
    grid.appendChild(card);
  });

  const list = document.getElementById('resultsList');
  list.innerHTML = '';
  games.filter(g => g.votes > 0)
       .sort((a, b) => b.votes - a.votes)
       .forEach(({ name, votes }) => {
         list.innerHTML += `<li><span>${name}</span><span>${votes}</span></li>`;
       });

  updateCounter();
}

// ---------- 4. Голосование ----------
function vote(id) {
  if (votesLeft <= 0) return;
  const game = games.find(g => g.id === id);
  game.votes++;
  votesLeft--;
  saveData();
  renderAll();
}

// ---------- 5. Отправка на Beeceptor ----------
function submitVotes() {
  const votedGames = games.filter(g => g.votes > 0);
  const result = [];
  for (let i = 0; i < 3; i++) {
    const game = votedGames[i];
    result.push({
      place: i + 1,
      name: game ? game.name : 'пусто',
      votes: game ? game.votes : 0
    });
  }

  const payload = {
    timestamp: new Date().toISOString(),
    votes: result
  };

  fetch('https://gosloto.free.beeceptor.com', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })
  .then(res => {
    if (!res.ok) throw new Error('Ошибка отправки');
    return res.text();
  })
  .then(() => alert('✅ Голоса отправлены!'))
  .catch(err => alert('❌ Ошибка: ' + err.message));
}

// ---------- 6. Сброс ----------
function resetVotes() {
  games.forEach(g => g.votes = 0);
  votesLeft = 3;
  saveData();
  renderAll();
}

// ---------- 7. Добавление игры ----------
function addSteamGame() {
  if (votesLeft <= 0) return;
  const name = document.getElementById('steamName').value.trim();
  const url = document.getElementById('steamUrl').value.trim();
  if (!name || !url) return;

  const match = url.match(/\/app\/(\d+)/);
  if (!match) {
    alert('Неверная ссылка Steam.');
    return;
  }

  const appid = match[1];
  const id = name.toLowerCase().replace(/\s+/g, '-');

  if (games.some(g => g.steamId === appid)) {
    alert('Эта игра уже добавлена.');
    return;
  }

  games.push({
    id,
    name,
    steamId: appid,
    description: 'Добавлено через Steam',
    tags: ['Steam'],
    votes: 0
  });
  saveData();
  renderAll();
  document.getElementById('steamName').value = '';
  document.getElementById('steamUrl').value = '';
}

// ---------- 8. Старт ----------
function updateCounter() {
  document.getElementById('counter').textContent = `Осталось голосов: ${votesLeft}`;
}

loadData();
renderAll();