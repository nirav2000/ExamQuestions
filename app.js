const APP_VERSION = 'v0.1.2';
const VERSION_HISTORY_URL = '/ExamQuestions/versions.json';
const fallbackQuestions = [];
let questions = [];
let currentIndex = 0;
let activePartIndex = null;
let versionHistory = [];

const els = {
  list: document.querySelector('#questionList'),
  progressLabel: document.querySelector('#progressLabel'),
  progressBar: document.querySelector('#progressBar'),
  commandBadge: document.querySelector('#commandBadge'),
  questionTitle: document.querySelector('#questionTitle'),
  sourceText: document.querySelector('#sourceText'),
  questionText: document.querySelector('#questionText'),
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
  versionSelect: document.querySelector('#versionSelect')
};

const helpfulWords = ['because', 'so', 'this shows', 'this makes', 'this helps', 'evidence'];
const allowedSourceTags = new Set(['STRONG', 'B', 'EM', 'I', 'BR']);

const commandExplainers = {
  why: {
    title: 'Why questions',
    text: 'A why question asks for the reason something happens or the purpose behind a writer’s choice. A strong answer should not stop at what happened: it should explain because, effect and proof.',
    steps: ['Start by turning the question into an answer stem.', 'Give the reason using because or to.', 'Add evidence or effect from the text.', 'Link back to the action, reader, purpose or question.']
  },
  explain: {
    title: 'Explain questions',
    text: 'An explain question asks you to make something clear by giving reasons, evidence and how the parts connect.',
    steps: ['Make your point clearly.', 'Add evidence or an example.', 'Explain how the evidence proves your point.']
  },
  describe: {
    title: 'Describe questions',
    text: 'A describe question asks you to say what something is like using clear details from the text.',
    steps: ['Identify the thing you are describing.', 'Choose precise details.', 'Use evidence from the text where possible.']
  },
  default: {
    title: 'Command word',
    text: 'The command word tells you what the answer must do. Use it as a checklist before you submit.',
    steps: ['Spot the command word.', 'Turn the question into an answer stem.', 'Check that your answer does what the command word asks.']
  }
};

async function initialiseApp() {
  await Promise.all([loadQuestions(), loadVersionHistory()]);
}

async function loadQuestions() {
  try {
    const res = await fetch('./data/questions.json');
    questions = await res.json();
  } catch (error) {
    console.warn('Could not load data/questions.json. Using fallback.', error);
    questions = fallbackQuestions;
  }
  render();
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
  if (!questions.length) return;
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

function renderCommandExplainer(q) {
  const key = (q.commandWord || firstWord(q.question)).toLowerCase();
  const explainer = commandExplainers[key] || commandExplainers.default;
  els.commandExplainerTitle.textContent = explainer.title;
  els.commandExplainerText.textContent = explainer.text;
  els.commandExplainerSteps.innerHTML = explainer.steps.map(step => `<li>${escapeHtml(step)}</li>`).join('');
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

function answerKey(q) {
  return `cwc-answer-${q.id || q.question}`;
}

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
  els.exceptionalAnswer.innerHTML = parts.map((part, index) => {
    const isOpening = /restating|answer stem|opening/i.test(part.label || '');
    return `<span class="answer-part ${isOpening ? 'opening-part' : ''}" data-part-index="${index}">${escapeHtml(part.text || '')}</span>`;
  }).join(' ');
}

function renderBreakdown(q) {
  els.breakdown.innerHTML = '';
  (q.breakdown || []).forEach((part, index) => {
    const item = document.createElement('article');
    item.className = 'break-item coach-break-item';
    item.tabIndex = 0;
    item.dataset.partIndex = String(part.partIndex ?? index);
    item.innerHTML = `
      <strong>${escapeHtml(part.label || 'Step')}</strong>
      <p>“${escapeHtml(part.text || '')}”<small>${escapeHtml(part.note || '')}</small></p>
    `;
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

function clearActivePart() {
  document.querySelectorAll('.answer-part, .break-item').forEach(node => node.classList.remove('is-active'));
}

function updateChecks() {
  const text = els.answer.value.toLowerCase();
  els.miniChecks.innerHTML = helpfulWords.map(word => {
    const on = text.includes(word);
    return `<span class="check ${on ? 'on' : ''}">${on ? '✓' : '○'} ${word}</span>`;
  }).join('');
}

function firstWord(text = '') {
  return (text.trim().split(/\s+/)[0] || '').replace(/[^a-z]/gi, '') || 'command';
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"]/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[char]));
}

function sanitizeSimpleHtml(html) {
  const template = document.createElement('template');
  template.innerHTML = html;
  template.content.querySelectorAll('*').forEach(node => {
    if (!allowedSourceTags.has(node.tagName)) {
      node.replaceWith(document.createTextNode(node.textContent || ''));
      return;
    }
    [...node.attributes].forEach(attr => node.removeAttribute(attr.name));
  });
  return template.innerHTML;
}

function download(filename, text) {
  const blob = new Blob([text], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function setupUpload() {
  els.upload.addEventListener('change', async event => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const data = JSON.parse(await file.text());
      if (!Array.isArray(data)) throw new Error('JSON must be an array of questions.');
      questions = data;
      currentIndex = 0;
      render();
    } catch (error) {
      alert(`Could not load JSON: ${error.message}`);
    }
  });
}

function setupManualEntry() {
  document.querySelector('#openManualBtn').addEventListener('click', () => els.manualDialog.showModal());
  els.manualForm.addEventListener('submit', event => {
    event.preventDefault();
    const form = new FormData(els.manualForm);
    const breakdown = String(form.get('breakdown') || '')
      .split('\n')
      .map(line => line.trim())
      .filter(Boolean)
      .map((line, index) => {
        const [label, text, note] = line.split('|').map(x => x?.trim());
        return { label, text, note, partIndex: index };
      });
    questions.push({
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
    });
    currentIndex = questions.length - 1;
    els.manualForm.reset();
    els.manualDialog.close();
    render();
  });
}

function setupSpeech() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const micBtn = document.querySelector('#micBtn');
  if (!SpeechRecognition) {
    micBtn.disabled = true;
    micBtn.textContent = '🎙️ Voice unavailable';
    return;
  }
  const recognition = new SpeechRecognition();
  recognition.lang = 'en-GB';
  recognition.interimResults = false;
  micBtn.addEventListener('click', () => {
    recognition.start();
    micBtn.textContent = 'Listening...';
  });
  recognition.addEventListener('result', event => {
    const transcript = event.results[0][0].transcript;
    els.answer.value = `${els.answer.value}${els.answer.value ? ' ' : ''}${transcript}`;
    updateChecks();
  });
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
    return {
      x: (point.clientX - rect.left) * (els.canvas.width / rect.width),
      y: (point.clientY - rect.top) * (els.canvas.height / rect.height)
    };
  }
  function start(event) { drawing = true; const p = pos(event); ctx.beginPath(); ctx.moveTo(p.x, p.y); event.preventDefault(); }
  function move(event) { if (!drawing) return; const p = pos(event); ctx.lineTo(p.x, p.y); ctx.stroke(); event.preventDefault(); }
  function end() { drawing = false; }

  ['mousedown', 'touchstart'].forEach(e => els.canvas.addEventListener(e, start));
  ['mousemove', 'touchmove'].forEach(e => els.canvas.addEventListener(e, move));
  ['mouseup', 'mouseleave', 'touchend'].forEach(e => els.canvas.addEventListener(e, end));
}

function setupVersionSwitcher() {
  if (!els.versionSelect) return;
  els.versionSelect.addEventListener('change', event => {
    const option = event.target.selectedOptions[0];
    const path = option?.dataset.path;
    if (path) window.location.href = path;
  });
}

function clearCanvas() {
  const ctx = els.canvas.getContext('2d');
  ctx.clearRect(0, 0, els.canvas.width, els.canvas.height);
}

els.answer.addEventListener('input', updateChecks);
document.querySelector('#submitBtn').addEventListener('click', revealFeedback);
document.querySelector('#tryAgainBtn').addEventListener('click', () => els.feedback.classList.add('hidden'));
document.querySelector('#clearBtn').addEventListener('click', () => { els.answer.value = ''; updateChecks(); saveCurrentAnswer(); });
document.querySelector('#nextBtn').addEventListener('click', () => selectQuestion(currentIndex + 1 >= questions.length ? 0 : currentIndex + 1));
document.querySelector('#prevBtn').addEventListener('click', () => selectQuestion(currentIndex - 1 < 0 ? questions.length - 1 : currentIndex - 1));
document.querySelector('#startBtn').addEventListener('click', () => document.querySelector('#practice').scrollIntoView({ behavior: 'smooth' }));
document.querySelector('#downloadJsonBtn').addEventListener('click', () => download('command-word-coach-questions.json', JSON.stringify(questions, null, 2)));
document.querySelector('#clearCanvasBtn').addEventListener('click', clearCanvas);

setupUpload();
setupManualEntry();
setupSpeech();
setupCanvas();
setupVersionSwitcher();
initialiseApp();
