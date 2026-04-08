// === STATE ===
let currentPassageIndex = 0;
let words = [];
let wordElements = [];
let currentWordIndex = 0;
let recognition = null;
let isListening = false;
let timerInterval = null;
let startTime = null;
let elapsedSeconds = 0;
let wordsCorrectInFirstMinute = 0;
let firstMinuteLocked = false;
let correctCount = 0;
let incorrectCount = 0;
let completedPassages = [];
// Track wrong attempts per word (auto-skip after 2)
let wrongAttempts = 0;
let lastMismatchTime = 0;

// === DOM REFS ===
const $ = id => document.getElementById(id);

// === INIT ===
document.addEventListener('DOMContentLoaded', () => {
  loadPassage(currentPassageIndex);
  $('btn-begin').addEventListener('click', startReading);
  $('btn-retry').addEventListener('click', retryPassage);
  $('btn-next').addEventListener('click', nextPassage);
});

// === SCREEN MANAGEMENT ===
function showStartUI() {
  $('subtitle').textContent = 'Read aloud and make the words sparkle!';
  $('start-controls').classList.remove('hidden');
  $('reading-controls').classList.add('hidden');
  $('timer-bar').classList.add('hidden');
  $('stats-panel').classList.add('hidden');
  $('passage-card').classList.remove('hidden');
  $('passage-number').classList.remove('hidden');
}

function showReadingUI() {
  $('subtitle').textContent = 'Read the words out loud! 🦄';
  $('start-controls').classList.add('hidden');
  $('reading-controls').classList.remove('hidden');
  $('timer-bar').classList.remove('hidden');
  $('stats-panel').classList.add('hidden');
  $('passage-number').classList.add('hidden');
  $('attempts-hint').textContent = '';
}

function showStatsUI() {
  $('subtitle').textContent = '';
  $('start-controls').classList.add('hidden');
  $('reading-controls').classList.add('hidden');
  $('timer-bar').classList.add('hidden');
  $('stats-panel').classList.remove('hidden');
  // Keep passage card visible so monster can grab words from it
}

// === PASSAGE LOADING ===
function loadPassage(index) {
  const p = PASSAGES[index];
  document.body.className = p.bg;

  // Set decorations
  $('decorations').innerHTML = p.emojis.map(e =>
    '<div class="deco-item">' + e + '</div>'
  ).join('');

  // Set title and progress
  $('passage-title').textContent = p.title;
  $('passage-number').textContent = 'Passage ' + (index + 1) + ' of ' + PASSAGES.length;

  // Render progress dots
  $('progress-dots').innerHTML = PASSAGES.map(function(_, i) {
    var cls = 'dot';
    if (completedPassages.indexOf(i) !== -1) cls += ' done';
    else if (i === index) cls += ' current';
    return '<div class="' + cls + '"></div>';
  }).join('');

  // Parse and display words
  words = p.text.split(/\s+/);
  var container = $('words-container');
  container.innerHTML = '';
  wordElements = [];
  words.forEach(function(word, i) {
    var span = document.createElement('span');
    span.className = 'word-span';
    span.textContent = word;
    span.dataset.index = i;
    container.appendChild(span);
    container.appendChild(document.createTextNode(' '));
    wordElements.push(span);
  });

  // Reset state
  currentWordIndex = 0;
  correctCount = 0;
  incorrectCount = 0;
  wordsCorrectInFirstMinute = 0;
  firstMinuteLocked = false;
  elapsedSeconds = 0;
  wrongAttempts = 0;
  lastMismatchTime = 0;
  updateTimerDisplay();
  showStartUI();
}

// === READING SESSION ===
function startReading() {
  showReadingUI();
  highlightCurrentWord();
  startTimer();
  startSpeechRecognition();
}

function highlightCurrentWord() {
  wordElements.forEach(function(el) { el.classList.remove('current'); });
  if (currentWordIndex < wordElements.length) {
    wordElements[currentWordIndex].classList.add('current');
    wordElements[currentWordIndex].scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
}

// === TIMER ===
function startTimer() {
  startTime = Date.now();
  timerInterval = setInterval(function() {
    elapsedSeconds = Math.floor((Date.now() - startTime) / 1000);
    updateTimerDisplay();
    if (elapsedSeconds >= 60 && !firstMinuteLocked) {
      firstMinuteLocked = true;
      wordsCorrectInFirstMinute = correctCount;
    }
  }, 200);
}

function stopTimer() {
  clearInterval(timerInterval);
  elapsedSeconds = Math.floor((Date.now() - startTime) / 1000);
  if (!firstMinuteLocked) {
    wordsCorrectInFirstMinute = correctCount;
  }
}

function updateTimerDisplay() {
  var mins = Math.floor(elapsedSeconds / 60);
  var secs = elapsedSeconds % 60;
  $('timer-value').textContent = mins + ':' + (secs < 10 ? '0' : '') + secs;
}

// === SPEECH RECOGNITION ===
function startSpeechRecognition() {
  var SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    alert('Speech recognition is not supported in this browser. Please use Safari on iPhone or Chrome on desktop.');
    return;
  }

  recognition = new SpeechRecognition();
  recognition.continuous = true;
  recognition.interimResults = true;
  recognition.lang = 'en-US';
  recognition.maxAlternatives = 5;

  recognition.onresult = handleSpeechResult;

  recognition.onerror = function(e) {
    console.log('Speech error:', e.error);
    if (isListening && currentWordIndex < words.length) {
      restartRecognition();
    }
  };

  recognition.onend = function() {
    if (isListening && currentWordIndex < words.length) {
      restartRecognition();
    }
  };

  isListening = true;
  try { recognition.start(); } catch(err) { console.log('Start error:', err); }
}

function restartRecognition() {
  setTimeout(function() {
    if (isListening && currentWordIndex < words.length && recognition) {
      try { recognition.start(); } catch(err) {}
    }
  }, 100);
}

function stopSpeechRecognition() {
  isListening = false;
  if (recognition) {
    try { recognition.stop(); } catch(err) {}
    recognition = null;
  }
}

function normalizeWord(w) {
  return w.toLowerCase().replace(/[^a-z']/g, '').replace(/^'+|'+$/g, '');
}

function handleSpeechResult(event) {
  if (currentWordIndex >= words.length) return;

  for (var i = event.resultIndex; i < event.results.length; i++) {
    var result = event.results[i];
    var matched = false;

    // For each alternative transcription
    for (var alt = 0; alt < result.length; alt++) {
      var transcript = result[alt].transcript.toLowerCase().trim();
      var spokenWords = transcript.split(/\s+/).filter(function(w) { return w.length > 0; });

      for (var j = 0; j < spokenWords.length; j++) {
        if (currentWordIndex >= words.length) return;

        var spoken = normalizeWord(spokenWords[j]);
        var target = normalizeWord(words[currentWordIndex]);

        if (spoken && wordsMatch(spoken, target)) {
          matched = true;
          wrongAttempts = 0;
          markWord(currentWordIndex, true);
          currentWordIndex++;
          if (currentWordIndex < words.length) {
            highlightCurrentWord();
          } else {
            finishReading();
            return;
          }
        }
      }
      // If we found matches in the best alternative, don't check worse ones
      if (alt === 0 && result[0].confidence > 0.5) break;
    }

    // Only count as a wrong attempt if the child actually said a word that didn't match
    // (ignore silence, empty results, and pauses)
    if (!matched && result.isFinal && currentWordIndex < words.length) {
      var transcript = result[0].transcript.trim();
      var spokenWords = transcript.split(/\s+/).filter(function(w) {
        return normalizeWord(w).length > 0;
      });

      // Only penalize if there were real spoken words in this result
      if (spokenWords.length > 0) {
        var now = Date.now();
        if (now - lastMismatchTime > 500) {
          wrongAttempts++;
          lastMismatchTime = now;

          if (wrongAttempts >= 2) {
            markWord(currentWordIndex, false);
            wrongAttempts = 0;
            currentWordIndex++;
            if (currentWordIndex < words.length) {
              highlightCurrentWord();
            } else {
              finishReading();
              return;
            }
          } else {
            wordElements[currentWordIndex].classList.add('warn');
            $('attempts-hint').textContent = 'Try again! One more try for this word.';
            setTimeout(function() {
              if (currentWordIndex < wordElements.length) {
                wordElements[currentWordIndex].classList.remove('warn');
              }
              $('attempts-hint').textContent = '';
            }, 1500);
          }
        }
      }
    }
  }
}

function wordsMatch(spoken, target) {
  if (!spoken || !target) return false;
  if (spoken === target) return true;

  // Common speech recognition substitutions for small words
  var subs = {
    'i': ['eye', 'aye'],
    'a': ['uh', 'ah'],
    'the': ['duh', 'da'],
    'to': ['two', 'too'],
    'see': ['sea'],
    'sea': ['see'],
    'for': ['four'],
    'no': ['know'],
    'know': ['no'],
    'red': ['read'],
    'read': ['red'],
    'sun': ['son'],
    'son': ['sun'],
    'one': ['won'],
    'won': ['one'],
    'be': ['bee'],
    'bee': ['be'],
    'hear': ['here'],
    'here': ['hear'],
    'their': ['there', 'theyre'],
    'there': ['their', 'theyre']
  };

  if (subs[target] && subs[target].indexOf(spoken) !== -1) return true;

  // Fuzzy match: allow 1 char difference for words > 3 chars
  if (target.length > 3 && spoken.length > 2) {
    var maxLen = Math.max(spoken.length, target.length);
    var minLen = Math.min(spoken.length, target.length);
    if (maxLen - minLen > 1) return false;
    var diff = 0;
    for (var k = 0; k < minLen; k++) {
      if (spoken[k] !== target[k]) diff++;
    }
    diff += maxLen - minLen;
    if (diff <= 1) return true;
  }

  return false;
}

function markWord(index, correct) {
  var el = wordElements[index];
  el.classList.remove('current');
  if (correct) {
    el.classList.add('correct');
    correctCount++;
  } else {
    el.classList.add('incorrect');
    incorrectCount++;
  }
}

// === FINISH ===
function finishReading() {
  stopTimer();
  stopSpeechRecognition();

  var totalTime = elapsedSeconds;
  var mins = Math.floor(totalTime / 60);
  var secs = totalTime % 60;
  var wcpm = wordsCorrectInFirstMinute;
  var accuracy = words.length > 0 ? Math.round((correctCount / words.length) * 100) : 0;

  $('stat-wcpm').textContent = wcpm;
  $('stat-time').textContent = mins + ':' + (secs < 10 ? '0' : '') + secs;
  $('stat-correct').textContent = correctCount + ' / ' + words.length;
  $('stat-accuracy').textContent = accuracy + '%';

  setTimeout(function() {
    showStatsUI();
    setTimeout(startMonsterAnimation, 1200);
  }, 400);
}

// === MONSTER ANIMATION ===
function startMonsterAnimation() {
  var overlay = $('monster-overlay');
  var monster = $('monster');
  var mouth = $('monster-mouth');

  overlay.classList.add('active');

  setTimeout(function() {
    monster.classList.add('visible');
  }, 100);

  setTimeout(function() {
    mouth.classList.add('eating');
    var greenWords = document.querySelectorAll('.word-span.correct');
    var monsterRect = monster.getBoundingClientRect();
    var monsterMouthX = monsterRect.left + monsterRect.width / 2;
    var monsterMouthY = monsterRect.top + 100;

    var delay = 0;
    greenWords.forEach(function(el) {
      setTimeout(function() {
        var rect = el.getBoundingClientRect();
        var flyingWord = document.createElement('div');
        flyingWord.className = 'flying-word';
        flyingWord.textContent = el.textContent;
        flyingWord.style.left = rect.left + 'px';
        flyingWord.style.top = rect.top + 'px';
        document.body.appendChild(flyingWord);

        el.style.opacity = '0';

        requestAnimationFrame(function() {
          requestAnimationFrame(function() {
            flyingWord.style.left = monsterMouthX + 'px';
            flyingWord.style.top = monsterMouthY + 'px';
            flyingWord.classList.add('eaten');
          });
        });

        setTimeout(function() { flyingWord.remove(); }, 900);
      }, delay);
      delay += 120;
    });

    var totalAnimTime = delay + 1200;
    setTimeout(function() {
      mouth.classList.remove('eating');
      monster.classList.remove('visible');
      setTimeout(function() {
        overlay.classList.remove('active');
      }, 900);
    }, totalAnimTime);
  }, 800);
}

// === RETRY / NEXT ===
function retryPassage() {
  cleanupFlyingWords();
  loadPassage(currentPassageIndex);
}

function nextPassage() {
  cleanupFlyingWords();
  completedPassages.push(currentPassageIndex);
  currentPassageIndex = (currentPassageIndex + 1) % PASSAGES.length;
  loadPassage(currentPassageIndex);
}

function cleanupFlyingWords() {
  document.querySelectorAll('.flying-word').forEach(function(el) { el.remove(); });
  $('monster-overlay').classList.remove('active');
  $('monster').classList.remove('visible');
}
