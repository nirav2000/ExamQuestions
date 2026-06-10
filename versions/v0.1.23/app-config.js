(() => {
  window.AppConfig = {
    APP_VERSION: 'v0.1.23',
    VERSION_HISTORY_URL: '/ExamQuestions/versions.json',
    STARTER_QUESTIONS_URL: './data/questions.json',
    EXPLAINERS_URL: './data/command-explainers.json',
    MANIFEST_URL: './data/manifest.json',
    BUNDLED_ZIP_URL: './command-set/ks2_command_word_json_files.zip',
    NEUTRAL_GROOVE: {
      title: 'Command word strategy',
      heading: 'Match the command word',
      intro: 'Look at the command word, then use the answer pattern that fits that type of question.',
      steps: [
        'Spot the command word.',
        'Use the matching answer pattern.',
        'Check your answer does what the question asks.'
      ]
    }
  };
})();
