import { jasons } from './jasons.js';
import { counselors } from './characters.js';
import { perks } from './perks.js';
import { 
  renderCounselorRow, 
  renderJasonRow, 
  renderPerkRow, 
  getCharacterImageUrl
} from './gameLogic.js';
import './style.css';

const btnClassic = document.getElementById('btn-classic');
const jasonBtn = document.getElementById('btn-jason');
const perkBtn = document.getElementById('btn-ability');
const modeSelection = document.getElementById('mode-selection');
const jasonModeSelection = document.getElementById('jason-mode-selection');
const perkModeSelection = document.getElementById('perk-mode-selection');
const btnDaily = document.getElementById('btn-daily');
const btnEndless = document.getElementById('btn-endless');
const btnJasonDaily = document.getElementById('btn-jason-daily');
const btnJasonEndless = document.getElementById('btn-jason-endless');
const btnPerkDaily = document.getElementById('btn-perk-daily');
const btnPerkEndless = document.getElementById('btn-perk-endless');
const btnBack = document.getElementById('btn-back');
const menuContainer = document.querySelector('.menu-container');
const gameArea = document.getElementById('game-area');
const guessInput = document.getElementById('guessInput');
const autoList = document.getElementById('autocomplete-list');
const grid = document.getElementById('grid');
const headerContainer = document.getElementById('table-headers');
const modalHelp = document.getElementById('modal-help');
const modalStats = document.getElementById('modal-stats');
const btnHelpOpen = document.getElementById('btn-open-help');
const btnStatsOpen = document.getElementById('btn-open-stats');

let currentMode = 'counselors';
let isDaily = false;
let targetCharacter = null;
let guessedNames = [];
let tries = 0;
let countdownInterval = null;

function getDailyCharacter(dataPool) {
  const today = new Date();
  const seed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
  return dataPool[seed % dataPool.length];
}

function getSecondsUntilMidnight() {
  const now = new Date();
  const midnight = new Date(now);
  midnight.setHours(24, 0, 0, 0);
  return Math.floor((midnight - now) / 1000);
}

function formatCountdown(seconds) {
  const h = String(Math.floor(seconds / 3600)).padStart(2, '0');
  const m = String(Math.floor((seconds % 3600) / 60)).padStart(2, '0');
  const s = String(seconds % 60).padStart(2, '0');
  return `${h}:${m}:${s}`;
}

function startNewGame() {
  guessedNames = [];
  tries = 0;
  grid.innerHTML = "";
  guessInput.value = "";
  guessInput.disabled = false;
  menuContainer.style.display = 'none';
  modeSelection.style.display = 'none';
  jasonModeSelection.style.display = 'none';
  if (perkModeSelection) perkModeSelection.style.display = 'none';
  gameArea.style.display = 'block';
  document.getElementById('win-card').style.display = 'none';
  if (countdownInterval) {
    clearInterval(countdownInterval);
    countdownInterval = null;
  }
  let dataPool = currentMode === 'jasons' ? jasons : currentMode === 'perks' ? perks : counselors;
  if (isDaily) {
    targetCharacter = getDailyCharacter(dataPool);
    document.getElementById('btn-restart').style.display = 'none';
  } else {
    targetCharacter = dataPool[Math.floor(Math.random() * dataPool.length)];
    document.getElementById('btn-restart').style.display = 'block';
  }
  updateHeaders();
}

function updateHeaders() {
  if (currentMode === 'jasons') {
    headerContainer.innerHTML = `<div class="header-box">Jason</div><div class="header-box">Weapon</div><div class="header-box">Run?</div><div class="header-box">Pros</div><div class="header-box">Cons</div><div class="header-box">Dest.</div><div class="header-box">Water</div><div class="header-box">Traps</div>`;
    guessInput.placeholder = "Enter Jason name...";
  } else if (currentMode === 'perks') {
    headerContainer.innerHTML = `<div class="header-box">Perk</div><div class="header-box">Category</div><div class="header-box">Buff</div><div class="header-box">Debuff</div>`;
    guessInput.placeholder = "Enter perk name...";
  } else {
    headerContainer.innerHTML = `<div class="header-box">Name</div><div class="header-box">Sex</div><div class="header-box">Comp.</div><div class="header-box">Luck</div><div class="header-box">Repair</div><div class="header-box">Speed</div><div class="header-box">Stam.</div><div class="header-box">Stealth</div><div class="header-box">Str.</div>`;
    guessInput.placeholder = "Enter counselor name...";
  }
}

function makeGuess(match) {
  tries++;
  guessedNames.push(match.name);
  let row = currentMode === 'jasons' ? renderJasonRow(match, targetCharacter) : currentMode === 'perks' ? renderPerkRow(match, targetCharacter) : renderCounselorRow(match, targetCharacter);
  grid.prepend(row);
  if (match.name === targetCharacter.name) setTimeout(showWinCard, 400);
}

function updateStatsUI() {
  const stats = JSON.parse(localStorage.getItem('f13dle_stats')) || { played: 0, wins: 0, streak: 0 };
  document.getElementById('stats-played').textContent = stats.played;
  document.getElementById('stats-wins').textContent = stats.wins;
  document.getElementById('stats-streak').textContent = stats.streak;
}

function saveWin() {
  let stats = JSON.parse(localStorage.getItem('f13dle_stats')) || { played: 0, wins: 0, streak: 0 };
  stats.played++;
  stats.wins++;
  stats.streak++;
  localStorage.setItem('f13dle_stats', JSON.stringify(stats));
}

function showWinCard() {
  saveWin();
  guessInput.disabled = true;

  const imgUrl = getCharacterImageUrl(targetCharacter.name, currentMode);
  document.getElementById('modal-portrait').innerHTML = `
    <img src="${imgUrl}" alt="${targetCharacter.name}" onerror="this.onerror=null; this.src='https://via.placeholder.com/300x400?text=?';">
    <div class="win-portrait-name">${targetCharacter.name}</div>
  `;

  document.getElementById('correct-name').textContent = targetCharacter.name;
  document.getElementById('tries-count').textContent = tries;

  const countdownContainer = document.getElementById('countdown-container');
  const timerEl = document.getElementById('countdown-timer');

  if (isDaily) {
    countdownContainer.style.display = 'block';
    document.getElementById('btn-restart').style.display = 'none';
    if (countdownInterval) clearInterval(countdownInterval);
    let secs = getSecondsUntilMidnight();
    timerEl.textContent = formatCountdown(secs);
    countdownInterval = setInterval(() => {
      secs--;
      if (secs <= 0) { clearInterval(countdownInterval); secs = 0; }
      timerEl.textContent = formatCountdown(secs);
    }, 1000);
  } else {
    countdownContainer.style.display = 'none';
    document.getElementById('btn-restart').style.display = 'block';
  }

  const winCard = document.getElementById('win-card');
  winCard.style.display = 'block';
  winCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

btnClassic.addEventListener('click', () => {
  jasonModeSelection.style.display = 'none';
  if (perkModeSelection) perkModeSelection.style.display = 'none';
  modeSelection.style.display = (modeSelection.style.display === 'none' || modeSelection.style.display === '') ? 'flex' : 'none';
});

jasonBtn.addEventListener('click', () => {
  modeSelection.style.display = 'none';
  if (perkModeSelection) perkModeSelection.style.display = 'none';
  jasonModeSelection.style.display = (jasonModeSelection.style.display === 'none' || jasonModeSelection.style.display === '') ? 'flex' : 'none';
});

if (perkBtn) {
  perkBtn.addEventListener('click', () => {
    modeSelection.style.display = 'none';
    jasonModeSelection.style.display = 'none';
    if (perkModeSelection) perkModeSelection.style.display = (perkModeSelection.style.display === 'none' || perkModeSelection.style.display === '') ? 'flex' : 'none';
  });
}

btnDaily.addEventListener('click', () => { currentMode = 'counselors'; isDaily = true; startNewGame(); });
btnEndless.addEventListener('click', () => { currentMode = 'counselors'; isDaily = false; startNewGame(); });
btnJasonDaily.addEventListener('click', () => { currentMode = 'jasons'; isDaily = true; startNewGame(); });
btnJasonEndless.addEventListener('click', () => { currentMode = 'jasons'; isDaily = false; startNewGame(); });
if (btnPerkDaily) btnPerkDaily.addEventListener('click', () => { currentMode = 'perks'; isDaily = true; startNewGame(); });
if (btnPerkEndless) btnPerkEndless.addEventListener('click', () => { currentMode = 'perks'; isDaily = false; startNewGame(); });

guessInput.addEventListener('input', function() {
  const val = this.value.toLowerCase();
  autoList.innerHTML = "";
  if (!val) return;
  const dataPool = currentMode === 'jasons' ? jasons : currentMode === 'perks' ? perks : counselors;
  const matches = dataPool.filter(c => c.name.toLowerCase().includes(val) && !guessedNames.includes(c.name));
  matches.forEach(match => {
    const div = document.createElement("div");
    div.className = "autocomplete-item";
    const imgUrl = getCharacterImageUrl(match.name, currentMode);
    div.innerHTML = `<img src="${imgUrl}" class="autocomplete-img" onerror="this.onerror=null; this.src='https://via.placeholder.com/40';"><span>${match.name}</span>`;
    div.onclick = () => {
      guessInput.value = "";
      autoList.innerHTML = "";
      makeGuess(match);
    };
    autoList.appendChild(div);
  });
});

btnBack.addEventListener('click', () => {
  menuContainer.style.display = 'flex';
  gameArea.style.display = 'none';
  document.getElementById('win-card').style.display = 'none';
  if (countdownInterval) {
    clearInterval(countdownInterval);
    countdownInterval = null;
  }
});

btnHelpOpen.onclick = () => modalHelp.style.display = 'flex';
btnStatsOpen.onclick = () => { updateStatsUI(); modalStats.style.display = 'flex'; };
document.getElementById('close-help').onclick = () => modalHelp.style.display = 'none';
document.getElementById('close-stats').onclick = () => modalStats.style.display = 'none';
window.onclick = (e) => { if (e.target == modalHelp) modalHelp.style.display = 'none'; if (e.target == modalStats) modalStats.style.display = 'none'; };
document.getElementById('btn-restart').addEventListener('click', startNewGame);