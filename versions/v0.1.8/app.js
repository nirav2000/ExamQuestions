const APP_VERSION = 'v0.1.9';
const VERSION_HISTORY_URL = '/ExamQuestions/versions.json';
const fallbackQuestions = [];
let allQuestions = [];
let questions = [];
let currentIndex = 0;
let activePartIndex = null;
let versionHistory = [];
let packManifest = [];
let packFiles = new Map();
let currentSource = 'starter';
let currentSelectionMode = 'dropdown';
let commandExplainers = {
  why: {
    title: 'Why questions',
    descriptor: 'A why question asks for the reason something happens or the purpose behind a writer’s choice. A strong answer should not stop at what happened: it should explain because, effect and proof.',
    grooveTitle: 'Why answer groove',
    groove: ['What happened?', 'Why did it happen?', 'What proof do I have?'],
    answerPattern: 'Use the question words → because/to → proof/effect → so/this shows',
    steps: ['Start by turning the question into an answer stem.', 'Give the reason using because or to.', 'Add evidence or effect from the text.', 'Link back to the action, reader, purpose or question.'],
    helpfulWords: ['because', 'so', 'this shows', 'this makes', 'this helps']
  },
  explain: {
    title: 'Explain questions',
    descriptor: 'An explain question asks you to make something clear by giving reasons, evidence and how the parts connect.',
    grooveTitle: 'Explain answer groove',
    groove: ['Point', 'Evidence', 'How it proves the point', 'Link back'],
    answerPattern: 'Point → evidence → this means → link',
    steps: ['Make your point clearly.', 'Add evidence or an example.', 'Say how the evidence proves the point.', 'Link back to the question.'],
    helpfulWords: ['because', 'this means', 'this shows', 'for example', 'therefore']
  },
  describe: {
    title: 'Describe questions',
    descriptor: 'A describe question asks you to say what something is like using clear details from the text.',
    grooveTitle: 'Describe answer groove',
    groove: ['Subject', 'Clear details', 'Text evidence'],
    answerPattern: 'Say what it is like → add precise details → use evidence',
    steps: ['Identify the thing you are describing.', 'Choose precise details.', 'Use evidence from the text where possible.'],
    helpfulWords: ['is', 'has', 'looks', 'sounds', 'feels']
  },
  default: {
    title: 'Command word',
    descriptor: 'The command word tells you what the answer must do.',
    grooveTitle: 'Answer groove',
    groove: ['Answer stem', 'Evidence', 'Link back'],
    answerPattern: 'Use the question words → evidence → link back',
    steps: ['Spot the command word.', 'Turn the question into an answer stem.', 'Check that your answer does what the command word asks.'],
    helpfulWords: ['because', 'this shows', 'for example']
  }
};

const els = {
  list: document.querySelector('#questionList'),
  progressLabel: document.querySelector('#progressLabel'),
  progressBar: document.querySelector('#progressBar'),
  commandBadge: document.querySelector('#commandBadge'),
  questionTitle: document.querySelector('#questionTitle'),
  sourceText: document.querySelector('#sourceText'),
  questionText: document.querySelector('#questionText'),
  questionEnrichment: document.querySelector('#questionEnrichment'),
  answer: document.querySelector('#studentAnswer'),
  miniChecks: document.querySelector('#miniChecks'),
  feedback: document.querySelector('#feedbackCard'),
  weakAnswer: document.querySelector('#weakAnswer'),
  weakExplanation: document.querySelector('#weakExplanation'),
  exceptionalAnswer: document.querySelector('#exceptionalAnswer'),
  breakdown: document.querySelector('#breakdown'),
  upload: document.querySelector('#jsonUpload'),
  manualDialog: document.querySelector('#manualDialog'),
  manualForm: document.querySelector('#manualForm'),
  canvas: document.querySelector('#drawCanvas'),
  commandExplainerTitle: document.querySelector('#commandExplainerTitle'),
  commandExplainerText: document.querySelector('#commandExplainerText'),
  commandExplainerSteps: document.querySelector('#commandExplainerSteps'),
  commandGroovePill: document.querySelector('#commandGroovePill'),
  commandGrooveList: document.querySelector('#commandGrooveList'),
  commandAnswerPattern: document.querySelector('#commandAnswerPattern'),
  versionSelect: document.querySelector('#versionSelect'),
  commandSetSelect: document.querySelector('#commandSetSelect'),
  selectionMode: document.querySelector('#selectionMode'),
  packSourceSelect: document.querySelector('#packSourceSelect'),
  packSearchInput: document.querySelector('#packSearchInput'),
  packFilterChips: document.querySelector('#packFilterChips'),
  commandSetTabs: document.querySelector('#commandSetTabs'),
  commandSetCards: document.querySelector('#commandSetCards'),
  commandSetChecklist: document.querySelector('#commandSetChecklist'),
  applyChecklistBtn: document.querySelector('#applyChecklistBtn'),
  packTitle: document.querySelector('#packTitle'),
  packSummary: document.querySelector('#packSummary'),
  packStatus: document.querySelector('#packStatus')
};

const allowedSourceTags = new Set(['STRONG', 'B', 'EM', 'I', 'BR']);

async function initialiseApp() {
  await Promise.all([loadExternalExplainers(), loadVersionHistory()]);
  await loadQuestions();
  try {
    await loadBundledPack();
    els.packStatus.textContent = 'Loaded bundled ZIP pack from command-set/.';
  } catch (error) {
    console.info('Bundled ZIP pack could not be loaded. Using built-in data.', error);
    await loadExternalManifest();
  }
  renderCommandSetSelect();
}

async function loadQuestions() {
  try {
    const res = await fetch('./data/questions.json');
    allQuestions = await res.json();
  } catch (error) {
    console.warn('Could not load data/questions.json. Using fallback.', error);
    allQuestions = fallbackQuestions;
  }
  questions = allQuestions;
  render();
}

async function loadExternalExplainers() {
  try {
    const res = await fetch('./data/command-explainers.json');
    if (!res.ok) throw new Error('No external explainers');
    commandExplainers = { ...commandExplainers, ...(await res.json()) };
  } catch (error) {
    console.info('Using built-in command explainers.');
  }
}

async function loadExternalManifest() {
  try {
    const res = await fetch('./data/manifest.json');
    if (!res.ok) throw new Error('No manifest');
    packManifest = await res.json();
    els.packStatus.textContent = 'Loaded command-word manifest from data folder.';
  } catch (error) {
    buildManifestFromQuestions();
  }
}

async function loadVersionHistory() {
  try {
    const res = await fetch(VERSION_HISTORY_URL);
    versionHistory = await res.json();
  } catch (error) {
    console.warn('Could not load versions.json.', error);
    versionHistory = [{ version: APP_VERSION, label: APP_VERSION, path: './' }];
  }
  renderVersionSwitcher();
}

function buildManifestFromQuestions() {
  const words = [...new Set(allQuestions.map(q => q.commandWord).filter(Boolean))].sort();
  packManifest = words.map(word => ({
    commandWord: word,
    title: `${titleCase(word)} questions`,
    count: allQuestions.filter(q => q.commandWord === word).length,
    path: '',
    source: currentSource
  }));
  els.packStatus.textContent = `Using ${allQuestions.length} loaded questions.`;
}

function renderCommandSetSelect() {
  if (!els.commandSetSelect) return;
  const visibleManifest = getVisibleManifest();
  els.commandSetSelect.innerHTML = `<optgroup label="All questions"><option value="all">All loaded questions (${allQuestions.length})</option></optgroup><optgroup label="By command word" id="byCommandWord"></optgroup>`;
  const group = els.commandSetSelect.querySelector('#byCommandWord');
  visibleManifest.forEach(item => {
    const option = document.createElement('option');
    option.value = item.commandWord;
    option.dataset.path = item.path || '';
    option.textContent = `${item.title || titleCase(item.commandWord)} (${item.count || '?'})`;
    group.appendChild(option);
  });
  renderSetTabs(visibleManifest);
  renderSetCards(visibleManifest);
  renderChecklist(visibleManifest);
  renderFilterChips(visibleManifest);
  applySelectionMode();
}

function getVisibleManifest() {
  const search = (els.packSearchInput?.value || '').trim().toLowerCase();
  return packManifest.filter(item => {
    const sourceOk = els.packSourceSelect?.value === 'all' || !els.packSourceSelect?.value || item.source === els.packSourceSelect.value;
    const text = `${item.commandWord} ${item.title || ''}`.toLowerCase();
    const searchOk = !search || text.includes(search);
    return sourceOk && searchOk;
  });
}

function renderSetTabs(items) {
  if (!els.commandSetTabs) return;
  els.commandSetTabs.innerHTML = `<button class="chip active" data-value="all">All</button>` + items.map(i => `<button class="chip" data-value="${escapeHtml(i.commandWord)}">${escapeHtml(titleCase(i.commandWord))}</button>`).join('');
}
function renderSetCards(items) {
  if (!els.commandSetCards) return;
  els.commandSetCards.innerHTML = `<button class="card-btn" data-value="all">All loaded questions</button>` + items.map(i => `<button class="card-btn" data-value="${escapeHtml(i.commandWord)}">${escapeHtml(i.title || titleCase(i.commandWord))}<small>${i.count || '?'} questions</small></button>`).join('');
}
function renderChecklist(items) {
  if (!els.commandSetChecklist) return;
  els.commandSetChecklist.innerHTML = items.map(i => `<label><input type="checkbox" value="${escapeHtml(i.commandWord)}" /> ${escapeHtml(titleCase(i.commandWord))} (${i.count || '?'})</label>`).join('');
}
function renderFilterChips(items) {
  if (!els.packFilterChips) return;
  const words = [...new Set(items.map(i => i.commandWord))].slice(0, 8);
  els.packFilterChips.innerHTML = words.map(word => `<button class="chip" data-chip="${escapeHtml(word)}">${escapeHtml(word)}</button>`).join('');
}
function applySelectionMode() {
  const mode = els.selectionMode?.value || 'dropdown';
  currentSelectionMode = mode;
  if (els.commandSetTabs) els.commandSetTabs.hidden = mode !== 'tabs';
  if (els.commandSetCards) els.commandSetCards.hidden = mode !== 'cards';
  if (els.commandSetChecklist) els.commandSetChecklist.hidden = mode !== 'checklist';
  if (els.applyChecklistBtn) els.applyChecklistBtn.hidden = mode !== 'checklist';
  if (els.commandSetSelect?.closest('label')) els.commandSetSelect.closest('label').hidden = mode !== 'dropdown';
}

async function selectCommandSet(value) {
  currentIndex = 0;
  if (value === 'all') {
    questions = allQuestions;
    els.packTitle.textContent = 'All command words';
    els.packSummary.textContent = `${questions.length} questions loaded across ${packManifest.length || 'multiple'} command words.`;
    render();
    return;
  }
  const manifestItem = packManifest.find(item => item.commandWord === value);
  if (manifestItem?.path && packFiles.has(normalisePackPath(manifestItem.path))) {
    questions = packFiles.get(normalisePackPath(manifestItem.path));
  } else if (manifestItem?.path) {
    try {
      const res = await fetch(`./data/${manifestItem.path}`);
      if (!res.ok) throw new Error(`Could not load ${manifestItem.path}`);
      questions = await res.json();
    } catch (error) {
      console.warn(error);
      questions = allQuestions.filter(q => q.commandWord === value);
    }
  } else {
    questions = allQuestions.filter(q => q.commandWord === value);
  }
  els.packTitle.textContent = manifestItem?.grooveTitle || `${titleCase(value)} practice`;
  els.packSummary.textContent = `${questions.length} ${value} questions ready.`;
  render();
}

function renderVersionSwitcher() {
  if (!els.versionSelect) return;
  els.versionSelect.innerHTML = '';
  versionHistory.forEach(item => {
    const option = document.createElement('option');
    option.value = item.version;
    option.textContent = item.label || item.version;
    option.dataset.path = item.path || './';
    option.selected = item.version === APP_VERSION;
    els.versionSelect.appendChild(option);
  });
}

function render() {
  if (!questions.length) {
    els.list.innerHTML = '<p class="mini-copy">No questions loaded yet.</p>';
    return;
  }
  renderList();
  renderQuestion();
}

function renderList() {
  els.list.innerHTML = '';
  questions.forEach((q, i) => {
    const btn = document.createElement('button');
    btn.className = `q-tab ${i === currentIndex ? 'active' : ''}`;
    btn.innerHTML = `${i + 1}. ${escapeHtml(q.title || q.question)}`;
    btn.addEventListener('click', () => selectQuestion(i));
    els.list.appendChild(btn);
  });
  els.progressLabel.textContent = `${currentIndex + 1} of ${questions.length}`;
  els.progressBar.style.width = `${((currentIndex + 1) / questions.length) * 100}%`;
}

function renderQuestion() {
  const q = questions[currentIndex];
  activePartIndex = null;
  els.commandBadge.textContent = (q.commandWord || firstWord(q.question)).toUpperCase();
  els.questionTitle.textContent = q.title || 'Practice question';
  renderSource(q);
  renderCommandExplainer(q);
  renderQuestionEnrichment(q);
  els.questionText.textContent = q.question || '';
  els.answer.value = localStorage.getItem(answerKey(q)) || '';
  els.feedback.classList.add('hidden');
  updateChecks();
  clearCanvas();
}

function renderSource(q) {
  const html = q.textHtml || escapeHtml(q.text || '').replace(/\n/g, '<br>');
  els.sourceText.innerHTML = sanitizeSimpleHtml(html);
}

function renderQuestionEnrichment(q) {
  const items = [
    ['Focus', q.skillFocus],
    ['Pattern', q.answerPattern],
    ['Tip', q.teachingTip]
  ].filter(([, value]) => value);
  els.questionEnrichment.innerHTML = items.map(([label, value]) => `<span><strong>${escapeHtml(label)}:</strong> ${escapeHtml(value)}</span>`).join('');
}

function renderCommandExplainer(q) {
  const key = (q.commandWord || firstWord(q.question)).toLowerCase();
  const explainer = commandExplainers[key] || commandExplainers.default;
  els.commandExplainerTitle.textContent = explainer.title || `${titleCase(key)} questions`;
  els.commandExplainerText.textContent = explainer.descriptor || explainer.text || '';
  if (els.commandGroovePill) els.commandGroovePill.textContent = explainer.grooveTitle || 'Answer groove';
  if (els.commandGrooveList) els.commandGrooveList.innerHTML = (explainer.groove || []).map(step => `<li>${escapeHtml(step)}</li>`).join('');
  els.commandAnswerPattern.textContent = explainer.answerPattern || '';
  if (els.commandExplainerSteps) {
    els.commandExplainerSteps.innerHTML = (explainer.steps || []).map(step => `<li>${escapeHtml(step)}</li>`).join('');
  }
}

function selectQuestion(index) {
  saveCurrentAnswer();
  currentIndex = Math.max(0, Math.min(index, questions.length - 1));
  render();
}

function saveCurrentAnswer() {
  const q = questions[currentIndex];
  if (q) localStorage.setItem(answerKey(q), els.answer.value);
}

function answerKey(q) { return `cwc-answer-${q.id || q.question}`; }

function revealFeedback() {
  saveCurrentAnswer();
  const q = questions[currentIndex];
  activePartIndex = null;
  els.weakAnswer.textContent = q.weakAnswer || 'No weak answer supplied.';
  els.weakExplanation.textContent = q.weakExplanation || '';
  renderExceptionalAnswer(q);
  renderBreakdown(q);
  els.feedback.classList.remove('hidden');
  els.feedback.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function renderExceptionalAnswer(q) {
  const parts = q.answerParts && q.answerParts.length ? q.answerParts : [{ text: q.exceptionalAnswer || 'No exceptional answer supplied.' }];
  els.exceptionalAnswer.innerHTML = parts.map((part, index) => `<span class="answer-part" data-part-index="${index}">${escapeHtml(part.text || '')}</span>`).join(' ');
}

function renderBreakdown(q) {
  els.breakdown.innerHTML = '';
  (q.breakdown || []).forEach((part, index) => {
    const item = document.createElement('article');
    item.className = 'break-item coach-break-item';
    item.tabIndex = 0;
    item.dataset.partIndex = String(part.partIndex ?? index);
    item.innerHTML = `<strong>${escapeHtml(part.label || 'Step')}</strong><p>“${escapeHtml(part.text || '')}”<small>${escapeHtml(part.note || '')}</small></p>`;
    item.addEventListener('mouseenter', () => setActivePart(item.dataset.partIndex));
    item.addEventListener('focus', () => setActivePart(item.dataset.partIndex));
    item.addEventListener('click', () => setActivePart(item.dataset.partIndex));
    item.addEventListener('mouseleave', clearActivePart);
    item.addEventListener('blur', clearActivePart);
    els.breakdown.appendChild(item);
  });
}

function setActivePart(index) {
  activePartIndex = Number(index);
  document.querySelectorAll('.answer-part, .break-item').forEach(node => {
    node.classList.toggle('is-active', Number(node.dataset.partIndex) === activePartIndex);
  });
}
function clearActivePart() { document.querySelectorAll('.answer-part, .break-item').forEach(node => node.classList.remove('is-active')); }

function updateChecks() {
  const q = questions[currentIndex] || {};
  const key = (q.commandWord || firstWord(q.question)).toLowerCase();
  const words = commandExplainers[key]?.helpfulWords || commandExplainers.default.helpfulWords;
  const text = els.answer.value.toLowerCase();
  els.miniChecks.innerHTML = words.map(word => {
    const on = text.includes(word.toLowerCase());
    return `<span class="check ${on ? 'on' : ''}">${on ? '✓' : '○'} ${escapeHtml(word)}</span>`;
  }).join('');
}

async function handleUpload(file) {
  currentSource = 'uploaded';
  if (/\.zip$/i.test(file.name)) return handleZipUpload(file);
  const data = JSON.parse(await file.text());
  if (Array.isArray(data)) {
    allQuestions = data;
    buildManifestFromQuestions();
  } else if (data.manifest && data.questions) {
    packManifest = data.manifest;
    allQuestions = data.questions;
    commandExplainers = { ...commandExplainers, ...(data.commandExplainers || {}) };
  } else {
    throw new Error('JSON must be an array of questions or a pack object with manifest and questions.');
  }
  questions = allQuestions;
  currentIndex = 0;
  renderCommandSetSelect();
  render();
}

async function handleZipUpload(file) {
  if (!window.JSZip) throw new Error('ZIP support did not load. Check your internet connection and try again.');
  const zip = await JSZip.loadAsync(file);
  const entries = Object.values(zip.files).filter(entry => !entry.dir);
  const readJson = async namePart => {
    const entry = entries.find(item => item.name.endsWith(namePart));
    return entry ? JSON.parse(await entry.async('string')) : null;
  };
  const manifest = await readJson('manifest.json');
  const explainers = await readJson('command-explainers.json');
  const all = await readJson('all-command-word-questions.json');
  packFiles.clear();
  for (const entry of entries.filter(item => item.name.includes('/command-sets/') && item.name.endsWith('.json'))) {
    const rel = normalisePackPath(entry.name.split('/command-sets/').pop());
    packFiles.set(`command-sets/${rel}`, JSON.parse(await entry.async('string')));
  }
  if (explainers) commandExplainers = { ...commandExplainers, ...explainers };
  if (manifest) packManifest = manifest.map(item => ({ ...item, source: currentSource }));
  allQuestions = all || [...packFiles.values()].flat();
  questions = allQuestions;
  currentIndex = 0;
  els.packStatus.textContent = `Loaded ${allQuestions.length} questions from ${file.name}.`;
  els.packTitle.textContent = 'Command-word pack loaded';
  els.packSummary.textContent = `${packManifest.length || packFiles.size} command-word sets are ready.`;
  renderCommandSetSelect();
  render();
}

async function loadBundledPack() {
  currentSource = 'bundled';
  const res = await fetch('./command-set/command-word-coach-json-pack.zip');
  if (!res.ok) throw new Error('Bundled ZIP pack was not found in command-set/.');
  const blob = await res.blob();
  const file = new File([blob], 'command-word-coach-json-pack.zip', { type: 'application/zip' });
  await handleZipUpload(file);
}

function setupUpload() {
  els.upload.addEventListener('change', async event => {
    const file = event.target.files?.[0];
    if (!file) return;
    try { await handleUpload(file); }
    catch (error) { alert(`Could not load file: ${error.message}`); }
  });
}

function setupManualEntry() {
  document.querySelector('#openManualBtn').addEventListener('click', () => els.manualDialog.showModal());
  els.manualForm.addEventListener('submit', event => {
    event.preventDefault();
    const form = new FormData(els.manualForm);
    const breakdown = String(form.get('breakdown') || '').split('\n').map(line => line.trim()).filter(Boolean).map((line, index) => {
      const [label, text, note] = line.split('|').map(x => x?.trim());
      return { label, text, note, partIndex: index };
    });
    const item = {
      id: `manual-${Date.now()}`,
      title: form.get('title'),
      commandWord: form.get('commandWord'),
      text: form.get('text'),
      question: form.get('question'),
      weakAnswer: form.get('weakAnswer'),
      weakExplanation: form.get('weakExplanation'),
      exceptionalAnswer: form.get('exceptionalAnswer'),
      answerParts: [{ text: form.get('exceptionalAnswer') }],
      breakdown
    };
    allQuestions.push(item);
    questions = allQuestions;
    currentIndex = questions.length - 1;
    buildManifestFromQuestions();
    renderCommandSetSelect();
    els.manualForm.reset();
    els.manualDialog.close();
    render();
  });
}

function setupSpeech() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const micBtn = document.querySelector('#micBtn');
  if (!SpeechRecognition) { micBtn.disabled = true; micBtn.textContent = '🎙️ Voice unavailable'; return; }
  const recognition = new SpeechRecognition();
  recognition.lang = 'en-GB';
  recognition.interimResults = false;
  micBtn.addEventListener('click', () => { recognition.start(); micBtn.textContent = 'Listening...'; });
  recognition.addEventListener('result', event => { els.answer.value = `${els.answer.value}${els.answer.value ? ' ' : ''}${event.results[0][0].transcript}`; updateChecks(); });
  recognition.addEventListener('end', () => micBtn.textContent = '🎙️ Say');
}

function setupCanvas() {
  const ctx = els.canvas.getContext('2d');
  ctx.lineWidth = 4;
  ctx.lineCap = 'round';
  let drawing = false;
  function pos(event) {
    const rect = els.canvas.getBoundingClientRect();
    const point = event.touches ? event.touches[0] : event;
    return { x: (point.clientX - rect.left) * (els.canvas.width / rect.width), y: (point.clientY - rect.top) * (els.canvas.height / rect.height) };
  }
  function start(event) { drawing = true; const p = pos(event); ctx.beginPath(); ctx.moveTo(p.x, p.y); event.preventDefault(); }
  function move(event) { if (!drawing) return; const p = pos(event); ctx.lineTo(p.x, p.y); ctx.stroke(); event.preventDefault(); }
  function end() { drawing = false; }
  ['mousedown', 'touchstart'].forEach(e => els.canvas.addEventListener(e, start));
  ['mousemove', 'touchmove'].forEach(e => els.canvas.addEventListener(e, move));
  ['mouseup', 'mouseleave', 'touchend'].forEach(e => els.canvas.addEventListener(e, end));
}

function setupVersionSwitcher() { if (els.versionSelect) els.versionSelect.addEventListener('change', event => { const path = event.target.selectedOptions[0]?.dataset.path; if (path) window.location.href = path; }); }
function setupCommandSetSwitcher() {
  if (els.commandSetSelect) els.commandSetSelect.addEventListener('change', event => selectCommandSet(event.target.value));
  if (els.selectionMode) els.selectionMode.addEventListener('change', applySelectionMode);
  if (els.packSourceSelect) els.packSourceSelect.addEventListener('change', () => renderCommandSetSelect());
  if (els.packSearchInput) els.packSearchInput.addEventListener('input', () => renderCommandSetSelect());
  if (els.packFilterChips) els.packFilterChips.addEventListener('click', event => {
    const chip = event.target.closest('[data-chip]'); if (!chip) return;
    els.packSearchInput.value = chip.dataset.chip; renderCommandSetSelect();
  });
  if (els.commandSetTabs) els.commandSetTabs.addEventListener('click', event => {
    const btn = event.target.closest('[data-value]'); if (!btn) return; selectCommandSet(btn.dataset.value);
  });
  if (els.commandSetCards) els.commandSetCards.addEventListener('click', event => {
    const btn = event.target.closest('[data-value]'); if (!btn) return; selectCommandSet(btn.dataset.value);
  });
  if (els.applyChecklistBtn) els.applyChecklistBtn.addEventListener('click', () => {
    const selected = [...els.commandSetChecklist.querySelectorAll('input:checked')].map(i => i.value);
    questions = selected.length ? allQuestions.filter(q => selected.includes((q.commandWord || '').toLowerCase())) : allQuestions;
    currentIndex = 0;
    els.packTitle.textContent = selected.length ? `${selected.map(titleCase).join(', ')} practice` : 'All command words';
    els.packSummary.textContent = `${questions.length} questions ready.`;
    render();
  });
}
function clearCanvas() { const ctx = els.canvas.getContext('2d'); ctx.clearRect(0, 0, els.canvas.width, els.canvas.height); }
function normalisePackPath(path) { return path.replace(/^.*command-sets\//, 'command-sets/').replace(/^\/+/, ''); }
function titleCase(value = '') { return value.replace(/[-_]/g, ' ').replace(/\b\w/g, char => char.toUpperCase()); }
function firstWord(text = '') { return (text.trim().split(/\s+/)[0] || '').replace(/[^a-z]/gi, '') || 'command'; }
function escapeHtml(value) { return String(value).replace(/[&<>"]/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[char])); }
function sanitizeSimpleHtml(html) {
  const template = document.createElement('template');
  template.innerHTML = html;
  template.content.querySelectorAll('*').forEach(node => {
    if (!allowedSourceTags.has(node.tagName)) { node.replaceWith(document.createTextNode(node.textContent || '')); return; }
    [...node.attributes].forEach(attr => node.removeAttribute(attr.name));
  });
  return template.innerHTML;
}
function download(filename, text) { const blob = new Blob([text], { type: 'application/json' }); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = filename; a.click(); URL.revokeObjectURL(url); }

els.answer.addEventListener('input', updateChecks);
document.querySelector('#submitBtn').addEventListener('click', revealFeedback);
document.querySelector('#tryAgainBtn').addEventListener('click', () => els.feedback.classList.add('hidden'));
document.querySelector('#clearBtn').addEventListener('click', () => { els.answer.value = ''; updateChecks(); saveCurrentAnswer(); });
document.querySelector('#nextBtn').addEventListener('click', () => selectQuestion(currentIndex + 1 >= questions.length ? 0 : currentIndex + 1));
document.querySelector('#prevBtn').addEventListener('click', () => selectQuestion(currentIndex - 1 < 0 ? questions.length - 1 : currentIndex - 1));
document.querySelector('#startBtn').addEventListener('click', () => document.querySelector('#practice').scrollIntoView({ behavior: 'smooth' }));
document.querySelector('#downloadJsonBtn').addEventListener('click', () => download('command-word-coach-questions.json', JSON.stringify(questions, null, 2)));
document.querySelector('#clearCanvasBtn').addEventListener('click', clearCanvas);
setupUpload(); setupManualEntry(); setupSpeech(); setupCanvas(); setupVersionSwitcher(); setupCommandSetSwitcher(); initialiseApp();
