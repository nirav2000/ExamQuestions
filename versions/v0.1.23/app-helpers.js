(() => {
  const allowedSourceTags = new Set(['STRONG', 'B', 'EM', 'I', 'BR']);
  const neutralGroove = window.AppConfig?.NEUTRAL_GROOVE || {
    title: 'Command word strategy',
    heading: 'Match the command word',
    intro: 'Look at the command word, then use the answer pattern that fits that type of question.',
    steps: [
      'Spot the command word.',
      'Use the matching answer pattern.',
      'Check your answer does what the question asks.'
    ]
  };

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

  function normalizeExplainer(explainer = {}, key = 'command', defaultHelpfulWords = ['because', 'this shows', 'for example']) {
    return {
      title: explainer.title || `${titleCase(key)} questions`,
      descriptor: explainer.descriptor || explainer.text || explainer.childFriendlyMeaning || explainer.whatTheQuestionIsReallyAsking || '',
      grooveTitle: explainer.grooveTitle || explainer.answerGrooveTitle || `${titleCase(key)} answer groove`,
      grooveHeading: explainer.grooveHeading || neutralGroove.heading,
      grooveIntro: explainer.grooveIntro || neutralGroove.intro,
      groove: explainer.groove || explainer.answerGrooveSteps || neutralGroove.steps,
      answerPattern: explainer.answerPattern || '',
      steps: explainer.steps || explainer.miniChecklist || [],
      helpfulWords: explainer.helpfulWords || explainer.usefulSentenceStarters || defaultHelpfulWords
    };
  }

  function mergeExternalExplainers(base, external = {}) {
    const merged = { ...base };
    for (const [key, explainer] of Object.entries(external || {})) {
      const defaultHelpfulWords = base.default?.helpfulWords || ['because', 'this shows', 'for example'];
      merged[key] = normalizeExplainer(explainer, key, defaultHelpfulWords);
    }
    return merged;
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

  window.AppHelpers = {
    normalisePackPath,
    titleCase,
    firstWord,
    escapeHtml,
    sanitizeSimpleHtml,
    normalizeExplainer,
    mergeExternalExplainers,
    download
  };
})();