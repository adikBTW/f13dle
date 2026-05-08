export function getCharacterImageUrl(name, mode) {
  if (!name) return '';

  if (mode === 'jasons') {
    const formatName = name.toLowerCase().replace(/\s+/g, '').replace(/\./g, '');
    return new URL(`./assets/icons/jasons/${formatName}.webp`, import.meta.url).href;
  } 
  
  if (mode === 'perks') {
    const fileName = name.replace(/\s+/g, '_').replace(/'/g, '').replace(/\./g, '');
    const fullName = `${fileName}_Perk_Friday_the_13th_the_Game.webp`;
    return new URL(`./assets/perks/${fullName}`, import.meta.url).href;
  }

  const fullFormat = name.toLowerCase().replace(/\s+/g, '_').replace(/\./g, '');
  const firstFormat = name.toLowerCase().split(' ')[0].replace(/\./g, '');
  const namesWithFullFile = ['A.J.', 'Chad', 'Vanessa', 'Jenny', 'Tiffany', 'Kenny', 'Deborah'];

  return namesWithFullFile.some(n => name.includes(n))
    ? new URL(`./assets/icons/counselors/${fullFormat}.webp`, import.meta.url).href
    : new URL(`./assets/icons/counselors/${firstFormat}.webp`, import.meta.url).href;
}

export function createPortraitHTML(name, mode) {
  const imgUrl = getCharacterImageUrl(name, mode);
  return `
    <div class="portrait-container">
      <img src="${imgUrl}" alt="${name}" onerror="this.onerror=null; this.src='https://via.placeholder.com/100?text=Error';">
      <div class="portrait-name-overlay">${name}</div>
    </div>
  `;
}

export function renderCounselorRow(guessChar, targetCharacter) {
  const row = document.createElement('div');
  row.className = 'row';
  const props = ['name', 'gender', 'composure', 'luck', 'repair', 'speed', 'stamina', 'stealth', 'strength'];
  
  props.forEach((prop, index) => {
    const box = document.createElement('div');
    box.className = 'box';
    const val = guessChar[prop];
    const targetVal = targetCharacter[prop];

    if (index === 0) {
      box.innerHTML = createPortraitHTML(guessChar.name, 'counselors');
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
  return row;
}

export function renderJasonRow(guess, target) {
  const row = document.createElement('div');
  row.className = 'row';
  const checkArrayMatch = (guessedArr, targetArr) => {
    const matches = guessedArr.filter(item => targetArr.includes(item)).length;
    if (matches === targetArr.length && guessedArr.length === targetArr.length) return 'correct';
    return matches > 0 ? 'partial' : 'wrong';
  };

  const columns = [
    { type: 'img', val: guess.name },
    { type: 'text', val: guess.weapon, correct: guess.weapon === target.weapon },
    { type: 'text', val: guess.canRun ? "RUN" : "WALK", correct: guess.canRun === target.canRun },
    { type: 'text', val: guess.strengths.join(', '), status: checkArrayMatch(guess.strengths, target.strengths) },
    { type: 'text', val: guess.weaknesses.join(', '), status: checkArrayMatch(guess.weaknesses, target.weaknesses) },
    { type: 'text', val: guess.destruction, correct: guess.destruction === target.destruction },
    { type: 'number', val: guess.waterSpeed, targetVal: target.waterSpeed },
    { type: 'number', val: guess.traps, targetVal: target.traps }
  ];

  columns.forEach((col) => {
    const box = document.createElement('div');
    box.className = 'box';
    if (col.type === 'img') {
      box.innerHTML = createPortraitHTML(col.val, 'jasons');
      if (guess.name === target.name) box.classList.add('correct');
    } else if (col.type === 'number') {
      box.innerHTML = `<span>${col.val}</span>`;
      if (col.val === col.targetVal) {
        box.classList.add('correct');
      } else {
        box.classList.add('wrong');
        box.innerHTML += col.val < col.targetVal ? `<span class="arrow">↑</span>` : `<span class="arrow">↓</span>`;
      }
    } else {
      box.innerHTML = `<span>${col.val}</span>`;
      if (col.correct || col.status === 'correct') box.classList.add('correct');
      else if (col.status === 'partial') box.classList.add('partial');
      else box.classList.add('wrong');
    }
    row.appendChild(box);
  });
  return row;
}

export function renderPerkRow(guess, target) {
  const row = document.createElement('div');
  row.className = 'row';
  const columns = [
    { type: 'img', val: guess.name },
    { val: guess.category, target: target.category },
    { val: guess.buffType, target: target.buffType },
    { val: guess.debuffType, target: target.debuffType }
  ];

  columns.forEach((col) => {
    const box = document.createElement('div');
    box.className = 'box';
    if (col.type === 'img') {
      box.innerHTML = createPortraitHTML(col.val, 'perks');
      if (guess.name === target.name) box.classList.add('correct');
    } else {
      box.innerHTML = `<span>${col.val}</span>`;
      box.classList.add(col.val === col.target ? 'correct' : 'wrong');
    }
    row.appendChild(box);
  });
  return row;
}