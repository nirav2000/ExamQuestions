const fallbackQuestions = [];
let questions = [];
let currentIndex = 0;

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
  canvas: document.querySelector('#drawCanvas')
};

const helpfulWords = ['because', 'so', 'this shows', 'this makes', 'this helps', 'evidence'];

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
  els.commandBadge.textContent = (q.commandWord || firstWord(q.question)).toUpperCase();
  els.questionTitle.textContent = q.title || 'Practice question';
  els.sourceText.textContent = q.text || '';
  els.questionText.textContent = q.question || '';
  els.answer.value = localStorage.getItem(answerKey(q)) || '';
  els.feedback.classList.add('hidden');
  updateChecks();
  clearCanvas();
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
  els.weakAnswer.textContent = q.weakAnswer || 'No weak answer supplied.';
  els.weakExplanation.textContent = q.weakExplanation || '';
  els.exceptionalAnswer.textContent = q.exceptionalAnswer || 'No exceptional answer supplied.';
  els.breakdown.innerHTML = '';
  (q.breakdown || []).forEach(part => {
    const item = document.createElement('article');
    item.className = 'break-item';
    item.innerHTML = `
      <strong>${escapeHtml(part.label || 'Step')}</strong>
      <p>“${escapeHtml(part.text || '')}”<small>${escapeHtml(part.note || '')}</small></p>
    `;
    els.breakdown.appendChild(item);
  });
  els.feedback.classList.remove('hidden');
  els.feedback.scrollIntoView({ behavior: 'smooth', block: 'start' });
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
      .map(line => {
        const [label, text, note] = line.split('|').map(x => x?.trim());
        return { label, text, note };
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
loadQuestions();
