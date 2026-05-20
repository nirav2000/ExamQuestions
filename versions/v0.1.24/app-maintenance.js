// App maintenance/runtime glue.
// Owns version display and neutral command-groove fallback behaviour.
(() => {
  const config = window.AppConfig || {};
  const VERSION = config.APP_VERSION || 'v0.1.23';
  const neutralGroove = config.NEUTRAL_GROOVE || {
    title: 'Command word strategy',
    heading: 'Match the command word',
    intro: 'Look at the command word, then use the answer pattern that fits that type of question.',
    steps: [
      'Spot the command word.',
      'Use the matching answer pattern.',
      'Check your answer does what the question asks.'
    ]
  };

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
      if (option.dataset.path === '/ExamQuestions/' && option.value !== VERSION) {
        option.dataset.path = `/ExamQuestions/versions/${option.value}/`;
      }
      option.selected = option.value === VERSION;
    });

    select.value = VERSION;
  }

  function normaliseCommandGroove() {
    const badge = document.querySelector('#commandBadge');
    const key = (badge?.textContent || '').trim().toLowerCase();
    const pill = document.querySelector('#commandGroovePill');
    const heading = document.querySelector('#commandGrooveHeading');
    const intro = document.querySelector('#commandGrooveIntro');
    const list = document.querySelector('#commandGrooveList');

    const currentHeading = (heading?.textContent || '').trim();
    const currentIntro = (intro?.textContent || '').trim();
    const oldWhyHeading = currentHeading === 'Reason → Effect → Link' || currentHeading === 'Reason -> Effect -> Link';
    const oldWhyIntro = currentIntro.includes('because') && currentIntro.includes('this shows');

    if (key === 'why') {
      if (pill && (!pill.textContent || pill.textContent === neutralGroove.title || pill.textContent === 'Answer groove')) {
        pill.textContent = 'Why answer groove';
      }
      if (heading && !heading.textContent.trim()) heading.textContent = 'Reason → Effect → Link';
      if (intro && !intro.textContent.trim()) intro.innerHTML = WHY_INTRO;
      return;
    }

    if (pill && (pill.textContent === 'Why answer groove' || pill.textContent === 'Answer groove')) {
      pill.textContent = neutralGroove.title;
    }
    if (heading && oldWhyHeading) heading.textContent = neutralGroove.heading;
    if (intro && oldWhyIntro) intro.textContent = neutralGroove.intro;
    if (list && oldWhyHeading) {
      list.innerHTML = neutralGroove.steps.map(step => `<li>${safeText(step)}</li>`).join('');
    }
  }

  function watchRuntimeChanges() {
    const select = document.querySelector('#versionSelect');
    if (select) {
      new MutationObserver(setVersionLabel).observe(select, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['selected']
      });
    }

    const badge = document.querySelector('#commandBadge');
    if (badge) {
      new MutationObserver(() => setTimeout(normaliseCommandGroove, 0)).observe(badge, {
        childList: true,
        characterData: true,
        subtree: true
      });
    }
  }

  window.addEventListener('DOMContentLoaded', () => {
    setVersionLabel();
    normaliseCommandGroove();
    watchRuntimeChanges();

    [0, 50, 150, 300, 600, 1000, 1500].forEach(delay => {
      setTimeout(() => {
        setVersionLabel();
        normaliseCommandGroove();
      }, delay);
    });

    document.addEventListener('click', () => setTimeout(normaliseCommandGroove, 0), true);
    document.addEventListener('change', () => setTimeout(() => {
      setVersionLabel();
      normaliseCommandGroove();
    }, 0), true);
  });
})();
