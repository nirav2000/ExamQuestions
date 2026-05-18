// v0.1.16: keep command-groove defaults neutral and keep the header version on v0.1.16.
// This patch avoids showing the why-specific "Reason -> Effect -> Link" pattern for every command word.
(function () {
  const VERSION = 'v0.1.16';
  const NEUTRAL_HEADING = 'Match the command word';
  const NEUTRAL_INTRO = 'Look at the command word, then use the answer pattern that fits that type of question.';
  const NEUTRAL_STEPS = [
    'Spot the command word.',
    'Use the matching answer pattern.',
    'Check your answer does what the question asks.'
  ];

  const WHY_HEADING = 'Reason -> Effect -> Link';
  const WHY_INTRO = 'Use words like <strong>because</strong>, <strong>so</strong>, <strong>this shows</strong>, and <strong>this helps</strong>.';

  function safeText(value) {
    return String(value || '').replace(/[&<>"]/g, char => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;'
    }[char]));
  }

  function setVersionLabel() {
    const select = document.querySelector('#versionSelect');
    if (!select) return;

    let currentOption = [...select.options].find(option => option.value === VERSION);
    if (!currentOption) {
      currentOption = document.createElement('option');
      currentOption.value = VERSION;
      currentOption.textContent = VERSION;
      currentOption.dataset.path = '/ExamQuestions/';
      select.prepend(currentOption);
    }

    [...select.options].forEach(option => {
      if (option.value === 'v0.1.15' && option.dataset.path === '/ExamQuestions/') {
        option.dataset.path = '/ExamQuestions/versions/v0.1.15/';
      }
      option.selected = option.value === VERSION;
    });

    select.value = VERSION;
  }

  function watchVersionChanges() {
    const select = document.querySelector('#versionSelect');
    if (!select) return;
    const observer = new MutationObserver(() => setVersionLabel());
    observer.observe(select, { childList: true, subtree: true, attributes: true, attributeFilter: ['selected'] });
  }

  function neutraliseWhyFallbacks() {
    const badge = document.querySelector('#commandBadge');
    const key = (badge?.textContent || '').trim().toLowerCase();
    const pill = document.querySelector('#commandGroovePill');
    const heading = document.querySelector('#commandGrooveHeading');
    const intro = document.querySelector('#commandGrooveIntro');
    const list = document.querySelector('#commandGrooveList');

    const currentHeading = (heading?.textContent || '').trim();
    const currentIntro = (intro?.textContent || '').trim();
    const looksLikeWhyFallback = currentHeading === 'Reason → Effect → Link' || currentHeading === WHY_HEADING;
    const introLooksWhy = currentIntro.includes('because') && currentIntro.includes('this shows');

    if (key === 'why') {
      if (pill && (!pill.textContent || pill.textContent === 'Answer groove' || pill.textContent === 'Command word strategy')) {
        pill.textContent = 'Why answer groove';
      }
      if (heading && !heading.textContent.trim()) heading.textContent = 'Reason → Effect → Link';
      if (intro && !intro.textContent.trim()) intro.innerHTML = WHY_INTRO;
      return;
    }

    if (pill && (pill.textContent === 'Why answer groove' || pill.textContent === 'Answer groove')) {
      pill.textContent = 'Command word strategy';
    }
    if (heading && looksLikeWhyFallback) heading.textContent = NEUTRAL_HEADING;
    if (intro && introLooksWhy) intro.textContent = NEUTRAL_INTRO;
    if (list && looksLikeWhyFallback) {
      list.innerHTML = NEUTRAL_STEPS.map(step => `<li>${safeText(step)}</li>`).join('');
    }
  }

  function watchQuestionChanges() {
    const badge = document.querySelector('#commandBadge');
    if (!badge) return;
    const observer = new MutationObserver(() => setTimeout(neutraliseWhyFallbacks, 0));
    observer.observe(badge, { childList: true, characterData: true, subtree: true });
  }

  window.addEventListener('DOMContentLoaded', () => {
    setVersionLabel();
    watchVersionChanges();
    neutraliseWhyFallbacks();
    watchQuestionChanges();

    // app.js renders version history asynchronously, so repeat briefly after startup.
    [0, 50, 150, 300, 600, 1000, 1500].forEach(delay => {
      setTimeout(() => {
        setVersionLabel();
        neutraliseWhyFallbacks();
      }, delay);
    });

    document.addEventListener('click', () => setTimeout(neutraliseWhyFallbacks, 0), true);
    document.addEventListener('change', () => setTimeout(() => {
      setVersionLabel();
      neutraliseWhyFallbacks();
    }, 0), true);
  });
})();
