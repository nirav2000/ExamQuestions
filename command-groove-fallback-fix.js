// v0.1.16: keep command-groove defaults neutral.
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
    [...select.options].forEach(option => {
      if (option.value === 'v0.1.15') {
        option.value = VERSION;
        option.textContent = option.textContent.replace('v0.1.15', VERSION);
      }
    });
    if (![...select.options].some(option => option.value === VERSION)) {
      const option = document.createElement('option');
      option.value = VERSION;
      option.textContent = VERSION;
      option.selected = true;
      select.prepend(option);
    }
    select.value = VERSION;
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
    neutraliseWhyFallbacks();
    watchQuestionChanges();
    document.addEventListener('click', () => setTimeout(neutraliseWhyFallbacks, 0), true);
    document.addEventListener('change', () => setTimeout(() => {
      setVersionLabel();
      neutraliseWhyFallbacks();
    }, 0), true);
  });
})();
