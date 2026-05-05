import { counselors } from './characters.js';
import './style.css';

const btnClassic = document.getElementById('btn-classic');
const btnDaily = document.getElementById('btn-daily');
const btnEndless = document.getElementById('btn-endless');
const btnBack = document.getElementById('btn-back');
const modeSelection = document.getElementById('mode-selection');
const menuContainer = document.querySelector('.menu-container');
const gameArea = document.getElementById('game-area');
const guessInput = document.getElementById('guessInput');
const autoList = document.getElementById('autocomplete-list');
const btnRestart = document.getElementById('btn-restart');
const jasonBtn = document.getElementById('btn-jason');
const abilityBtn = document.getElementById('btn-ability');

let targetCharacter = null;
let guessedNames = [];
let tries = 0;
let isEndless = false;

function getCharacterImageUrl(name) {
  const fullFormat = name.toLowerCase().replace(/\s+/g, '_').replace(/\./g, '');
  const firstFormat = name.toLowerCase().split(' ')[0].replace(/\./g, '');
  const fullPath = new URL(`./assets/icons/counselors/${fullFormat}.webp`, import.meta.url).href;
  const firstPath = new URL(`./assets/icons/counselors/${firstFormat}.webp`, import.meta.url).href;
  const namesWithFullFile = ['A.J.', 'Chad', 'Vanessa', 'Jenny', 'Tiffany', 'Kenny', 'Deborah'];
  if (namesWithFullFile.some(n => name.includes(n))) {
      return fullPath;
  }
  return firstPath;
}

function createPortraitHTML(name) {
  return `
    <div class="portrait-container">
      <img src="${getCharacterImageUrl(name)}" alt="${name}">
      <div class="portrait-name-overlay">${name}</div>
    </div>
  `;
}

function getDailySeed() {
  const now = new Date();
  const adjustedDate = new Date(now.getTime() - (6 * 60 * 60 * 1000));
  return adjustedDate.getFullYear() * 10000 + (adjustedDate.getMonth() + 1) * 100 + adjustedDate.getDate();
}

function updateCountdown() {
  const now = new Date();
  const nextUpdate = new Date();
  nextUpdate.setHours(6, 0, 0, 0);
  if (now >= nextUpdate) {
    nextUpdate.setDate(nextUpdate.getDate() + 1);
  }
  const diff = nextUpdate - now;
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);
  const countdownElem = document.getElementById('countdown');
  if (countdownElem) {
    countdownElem.textContent = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }
}

setInterval(updateCountdown, 1000);

function resetGameState() {
  guessedNames = [];
  tries = 0;
  document.getElementById('grid').innerHTML = "";
  guessInput.value = "";
  autoList.innerHTML = "";
  document.getElementById('win-modal').style.display = 'none';
  const portraitContainer = document.getElementById('modal-portrait');
  if (portraitContainer) portraitContainer.innerHTML = '👤';
}

function startNewGame(mode) {
  resetGameState();
  if (mode === 'daily') {
    isEndless = false;
    const seed = getDailySeed();
    targetCharacter = counselors[seed % counselors.length];
    const savedDaily = localStorage.getItem('f13dle_daily_data');
    if (savedDaily) {
      const data = JSON.parse(savedDaily);
      if (data.seed === seed) {
        tries = data.tries;
        guessedNames = data.guesses;
        guessedNames.forEach(name => {
          const char = counselors.find(c => c.name === name);
          renderRow(char);
        });
        if (data.won) {
          showWinModal();
          gameArea.style.display = 'block';
          menuContainer.style.display = 'none';
          guessInput.disabled = true;
          guessInput.placeholder = "You survived today. Come back tomorrow!";
          return;
        }
      } else {
        localStorage.removeItem('f13dle_daily_data');
      }
    }
    guessInput.disabled = false;
    guessInput.placeholder = "Enter counselor name...";
  } else {
    isEndless = true;
    targetCharacter = counselors[Math.floor(Math.random() * counselors.length)];
    guessInput.disabled = false;
    guessInput.placeholder = "Enter counselor name...";
  }
  menuContainer.style.display = 'none';
  modeSelection.style.display = 'none';
  gameArea.style.display = 'block';
}

btnClassic.addEventListener('click', () => {
  const isHidden = modeSelection.style.display === 'none';
  modeSelection.style.display = isHidden ? 'flex' : 'none';
  jasonBtn.style.display = isHidden ? 'none' : 'flex';
  abilityBtn.style.display = isHidden ? 'none' : 'flex';
});

btnDaily.addEventListener('click', () => startNewGame('daily'));
btnEndless.addEventListener('click', () => startNewGame('endless'));

btnBack.addEventListener('click', () => {
  menuContainer.style.display = 'flex';
  gameArea.style.display = 'none';
  jasonBtn.style.display = 'flex';
  abilityBtn.style.display = 'flex';
  resetGameState();
});

btnRestart.addEventListener('click', () => {
  if (isEndless) {
    startNewGame('endless');
  } else {
    location.reload(); 
  }
});

guessInput.addEventListener('input', function() {
  const val = this.value;
  autoList.innerHTML = "";
  if (!val) return;
  const matches = counselors.filter(c => 
    c.name.toLowerCase().includes(val.toLowerCase()) && 
    !guessedNames.includes(c.name)
  );
  matches.forEach(match => {
    const div = document.createElement("div");
    div.className = "autocomplete-item";
    div.innerHTML = `
      <img src="${getCharacterImageUrl(match.name)}" class="autocomplete-img" alt="">
      <span class="autocomplete-name">${match.name}</span>
    `;
    div.addEventListener("click", () => {
      guessInput.value = "";
      autoList.innerHTML = "";
      makeGuess(match);
    });
    autoList.appendChild(div);
  });
});

function makeGuess(match) {
  tries++;
  guessedNames.push(match.name);
  renderRow(match);
  if (!isEndless) {
    const dailyData = {
      seed: getDailySeed(),
      tries: tries,
      guesses: guessedNames,
      won: match.name === targetCharacter.name
    };
    localStorage.setItem('f13dle_daily_data', JSON.stringify(dailyData));
  }
  if (match.name === targetCharacter.name) {
    setTimeout(showWinModal, 400);
  }
}

function renderRow(guessChar) {
  const row = document.createElement('div');
  row.className = 'row';
  const props = ['name', 'gender', 'composure', 'luck', 'repair', 'speed', 'stamina', 'stealth', 'strength'];
  props.forEach((prop, index) => {
    const box = document.createElement('div');
    box.className = 'box';
    const val = guessChar[prop];
    const targetVal = targetCharacter[prop];
    if (index === 0) {
      box.innerHTML = createPortraitHTML(guessChar.name);
    } else {
      box.innerHTML = `<span>${val}</span>`;
    }
    if (val === targetVal) {
      box.classList.add('correct');
    } else {
      if (index !== 0) box.classList.add('wrong');
      if (typeof val === 'number') {
        box.innerHTML += val < targetVal ? `<span class="arrow">↑</span>` : `<span class="arrow">↓</span>`;
      }
    }
    row.appendChild(box);
  });
  document.getElementById('grid').prepend(row);
}

function showWinModal() {
  const winModal = document.getElementById('win-modal');
  const portraitContainer = document.getElementById('modal-portrait');
  document.getElementById('correct-name').textContent = targetCharacter.name;
  document.getElementById('tries-count').textContent = tries;
  if (portraitContainer) {
    portraitContainer.innerHTML = createPortraitHTML(targetCharacter.name);
  }
  winModal.style.display = 'flex';
  const nextGameInfo = document.querySelector('.next-game-info');
  if (isEndless) {
    btnRestart.style.display = 'block';
    btnRestart.textContent = "NEXT SURVIVOR";
    nextGameInfo.style.display = 'none';
  } else {
    btnRestart.style.display = 'none'; 
    nextGameInfo.style.display = 'block';
    updateCountdown();
    guessInput.disabled = true;
    guessInput.placeholder = "You survived today. Come back tomorrow!";
  }
  setTimeout(() => {
    winModal.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, 500);
}