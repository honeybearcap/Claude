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
// Track the last result index that yielded a correct match, so we don't
// re-penalize the same result when it transitions from interim to final
let lastMatchedResultIndex = -1;

// === DOM REFS ===
const $ = id => document.getElementById(id);

// === INIT ===
document.addEventListener('DOMContentLoaded', () => {
  loadPassage(currentPassageIndex);
  $('btn-begin').addEventListener('click', startReading);
  $('btn-retry').addEventListener('click', retryPassage);
  $('btn-next').addEventListener('click', nextPassage);
  $('btn-stop').addEventListener('click', stopAndShowStats);
  $('btn-skip-passage').addEventListener('click', skipToNextPassage);
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

  // Render clickable progress dots
  var dotsContainer = $('progress-dots');
  dotsContainer.innerHTML = '';
  PASSAGES.forEach(function(passage, i) {
    var dot = document.createElement('div');
    dot.className = 'dot';
    if (completedPassages.indexOf(i) !== -1) dot.classList.add('done');
    if (i === index) dot.classList.add('current');
    dot.title = passage.title;
    dot.addEventListener('click', function() {
      jumpToPassage(i);
    });
    dotsContainer.appendChild(dot);
  });

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
  lastMatchedResultIndex = -1;
  updateTimerDisplay();
  showStartUI();
}

// === READING SESSION ===
function startReading() {
  // Initialize AudioContext on user gesture (required by iOS Safari)
  getAudioCtx();
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
  timerInterval = null;
  if (startTime) {
    elapsedSeconds = Math.floor((Date.now() - startTime) / 1000);
  }
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
          lastMatchedResultIndex = i;
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

    // Only count as a wrong attempt if:
    // 1. No word matched in this result
    // 2. It's a final (not interim) result
    // 3. This result index didn't already yield a match (interim->final replay)
    // 4. The child actually said a real word (not silence/pause)
    if (!matched && result.isFinal && i > lastMatchedResultIndex && currentWordIndex < words.length) {
      var finalTranscript = result[0].transcript.trim();
      var finalWords = finalTranscript.split(/\s+/).filter(function(w) {
        return normalizeWord(w).length > 0;
      });

      if (finalWords.length > 0) {
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

// === AUDIO CONTEXT & SOUND EFFECTS ===
var audioCtx = null;

function getAudioCtx() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  return audioCtx;
}

function playChompSound() {
  var ctx = getAudioCtx();
  var now = ctx.currentTime;

  // Short percussive "chomp" — noise burst + low thud
  var bufferLen = ctx.sampleRate * 0.08;
  var buffer = ctx.createBuffer(1, bufferLen, ctx.sampleRate);
  var data = buffer.getChannelData(0);
  for (var i = 0; i < bufferLen; i++) {
    // Decaying noise
    data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufferLen, 3);
  }
  var noise = ctx.createBufferSource();
  noise.buffer = buffer;

  // Bandpass to make it sound mouth-like
  var filter = ctx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.value = 800;
  filter.Q.value = 1.5;

  var noiseGain = ctx.createGain();
  noiseGain.gain.value = 0.4;

  noise.connect(filter);
  filter.connect(noiseGain);
  noiseGain.connect(ctx.destination);
  noise.start(now);

  // Low "thud" oscillator
  var osc = ctx.createOscillator();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(180, now);
  osc.frequency.exponentialRampToValueAtTime(60, now + 0.08);
  var oscGain = ctx.createGain();
  oscGain.gain.setValueAtTime(0.35, now);
  oscGain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
  osc.connect(oscGain);
  oscGain.connect(ctx.destination);
  osc.start(now);
  osc.stop(now + 0.1);
}

function playCelebrationSong() {
  var ctx = getAudioCtx();
  var now = ctx.currentTime;

  // Princess-style celebration melody using a bright, sparkly tone
  // Notes: C5 E5 G5 C6 | G5 A5 B5 C6 | E5 G5 C6 E6 | C6 (hold)
  var melody = [
    { freq: 523, start: 0.0,  dur: 0.2  },  // C5
    { freq: 659, start: 0.2,  dur: 0.2  },  // E5
    { freq: 784, start: 0.4,  dur: 0.2  },  // G5
    { freq: 1047, start: 0.6, dur: 0.3  },  // C6
    { freq: 784, start: 1.0,  dur: 0.15 },  // G5
    { freq: 880, start: 1.15, dur: 0.15 },  // A5
    { freq: 988, start: 1.3,  dur: 0.15 },  // B5
    { freq: 1047, start: 1.45, dur: 0.35 }, // C6
    { freq: 659, start: 1.9,  dur: 0.15 },  // E5
    { freq: 784, start: 2.05, dur: 0.15 },  // G5
    { freq: 1047, start: 2.2, dur: 0.2  },  // C6
    { freq: 1319, start: 2.4, dur: 0.4  },  // E6
    { freq: 1047, start: 2.9, dur: 0.6  },  // C6 (hold)
  ];

  // Sparkle arpeggios in background
  var sparkles = [
    { freq: 2093, start: 0.1,  dur: 0.08 },
    { freq: 2637, start: 0.5,  dur: 0.08 },
    { freq: 3136, start: 0.9,  dur: 0.08 },
    { freq: 2093, start: 1.3,  dur: 0.08 },
    { freq: 2637, start: 1.7,  dur: 0.08 },
    { freq: 3136, start: 2.1,  dur: 0.08 },
    { freq: 3520, start: 2.5,  dur: 0.08 },
    { freq: 4186, start: 2.9,  dur: 0.12 },
  ];

  // Play melody notes with a bright triangle-ish tone
  melody.forEach(function(note) {
    var osc = ctx.createOscillator();
    osc.type = 'triangle';
    osc.frequency.value = note.freq;

    // Add slight vibrato for a magical feel
    var vibrato = ctx.createOscillator();
    vibrato.frequency.value = 5;
    var vibratoGain = ctx.createGain();
    vibratoGain.gain.value = 3;
    vibrato.connect(vibratoGain);
    vibratoGain.connect(osc.frequency);
    vibrato.start(now + note.start);
    vibrato.stop(now + note.start + note.dur + 0.1);

    var gain = ctx.createGain();
    gain.gain.setValueAtTime(0, now + note.start);
    gain.gain.linearRampToValueAtTime(0.18, now + note.start + 0.03);
    gain.gain.setValueAtTime(0.18, now + note.start + note.dur * 0.7);
    gain.gain.linearRampToValueAtTime(0, now + note.start + note.dur + 0.08);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now + note.start);
    osc.stop(now + note.start + note.dur + 0.1);
  });

  // Play sparkle notes — very short, high, quiet
  sparkles.forEach(function(note) {
    var osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.value = note.freq;

    var gain = ctx.createGain();
    gain.gain.setValueAtTime(0, now + note.start);
    gain.gain.linearRampToValueAtTime(0.06, now + note.start + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, now + note.start + note.dur);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now + note.start);
    osc.stop(now + note.start + note.dur + 0.05);
  });

  // Chime at the very end
  setTimeout(function() {
    var chimeNow = ctx.currentTime;
    [1047, 1319, 1568, 2093].forEach(function(freq, idx) {
      var osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = freq;
      var gain = ctx.createGain();
      gain.gain.setValueAtTime(0.08, chimeNow);
      gain.gain.exponentialRampToValueAtTime(0.001, chimeNow + 0.8);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(chimeNow + idx * 0.06);
      osc.stop(chimeNow + 1.0);
    });
  }, 3500);
}

function playPoopSound() {
  var ctx = getAudioCtx();
  var now = ctx.currentTime;

  // Descending "blurp" — a comedic low rumble
  var osc = ctx.createOscillator();
  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(200, now);
  osc.frequency.exponentialRampToValueAtTime(50, now + 0.4);

  var filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = 300;
  filter.Q.value = 5;

  var gain = ctx.createGain();
  gain.gain.setValueAtTime(0.15, now);
  gain.gain.linearRampToValueAtTime(0.2, now + 0.1);
  gain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);

  osc.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);
  osc.start(now);
  osc.stop(now + 0.5);
}

function playPoopLetSound() {
  var ctx = getAudioCtx();
  var now = ctx.currentTime;

  // Short little "plop" for each word
  var osc = ctx.createOscillator();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(300, now);
  osc.frequency.exponentialRampToValueAtTime(80, now + 0.1);

  var gain = ctx.createGain();
  gain.gain.setValueAtTime(0.2, now);
  gain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);

  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(now);
  osc.stop(now + 0.15);
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
    playCelebrationSong();
    setTimeout(startMonsterAnimation, 1200);
  }, 400);
}

// === MONSTER ANIMATION ===
function startMonsterAnimation() {
  var overlay = $('monster-overlay');
  var monster = $('monster');
  var mouth = $('monster-mouth');
  var greenWords = document.querySelectorAll('.word-span.correct');
  var redWords = document.querySelectorAll('.word-span.incorrect');
  var hasRed = redWords.length > 0;

  overlay.classList.add('active');

  // Slide unicorn up to center of screen
  setTimeout(function() {
    monster.classList.add('visible');
  }, 100);

  // Wait for unicorn to arrive, then start eating
  setTimeout(function() {
    mouth.classList.add('eating');

    // Helper: get current mouth position
    function getMouth() {
      var r = monster.getBoundingClientRect();
      return { x: r.left + r.width / 2, y: r.top + r.height * 0.65 };
    }

    var delay = 0;

    // === Phase 1: Eat the pink (correct) words ===
    greenWords.forEach(function(el) {
      setTimeout(function() {
        var rect = el.getBoundingClientRect();
        var m = getMouth();
        var fw = document.createElement('div');
        fw.className = 'flying-word';
        fw.textContent = el.textContent;
        fw.style.left = rect.left + 'px';
        fw.style.top = rect.top + 'px';
        document.body.appendChild(fw);
        el.style.opacity = '0';

        requestAnimationFrame(function() {
          requestAnimationFrame(function() {
            fw.style.left = m.x + 'px';
            fw.style.top = m.y + 'px';
            fw.classList.add('eaten');
          });
        });
        setTimeout(function() { playChompSound(); }, 550);
        setTimeout(function() { fw.remove(); }, 900);
      }, delay);
      delay += 120;
    });

    // === Phase 2: Transform purple words into poop in-place, then eat ===
    var redTransformTime = delay + 600;
    var redEatStart = delay + 1400;

    if (hasRed) {
      // Transform purple words into poop shapes in-place
      setTimeout(function() {
        $('monster-label').textContent = 'Eww, yucky words! 🤢';
        redWords.forEach(function(el) {
          el.style.transition = 'all 0.5s ease';
          el.style.background = 'linear-gradient(145deg, #8d6e63, #6d4c41)';
          el.style.color = '#fff';
          el.style.borderRadius = '40% 40% 45% 45%';
          el.style.padding = '2px 8px';
          el.style.boxShadow = '0 2px 4px rgba(0,0,0,0.2)';
        });
      }, redTransformTime);

      // Eat the poop-shaped words one by one
      var eatTime = redEatStart;
      redWords.forEach(function(el) {
        setTimeout(function() {
          var rect = el.getBoundingClientRect();
          var m = getMouth();
          var fw = document.createElement('div');
          fw.className = 'flying-word flying-word-poop';
          fw.textContent = el.textContent;
          fw.style.left = rect.left + 'px';
          fw.style.top = rect.top + 'px';
          document.body.appendChild(fw);
          el.style.opacity = '0';

          requestAnimationFrame(function() {
            requestAnimationFrame(function() {
              fw.style.left = m.x + 'px';
              fw.style.top = m.y + 'px';
              fw.classList.add('eaten');
            });
          });
          setTimeout(function() { playChompSound(); }, 550);
          setTimeout(function() { fw.remove(); }, 900);
        }, eatTime);
        eatTime += 350;
      });

      // === Phase 3: Poop them out — fall to the bottom and stay ===
      var poopStart = eatTime + 1200;
      setTimeout(function() {
        $('monster-label').textContent = 'Those words taste bad! 💩';
        playPoopSound();

        var m = getMouth();
        var poopX = m.x;
        var poopY = m.y + 60;
        var screenH = window.innerHeight;

        var pDelay = 400;
        redWords.forEach(function(el) {
          setTimeout(function() {
            var pw = document.createElement('div');
            pw.className = 'poop-word';
            pw.textContent = el.textContent;
            pw.style.setProperty('--rot', (Math.random() * 30 - 15) + 'deg');
            pw.style.left = poopX + 'px';
            pw.style.top = poopY + 'px';
            document.body.appendChild(pw);

            playPoopLetSound();

            // Fall to the bottom of the screen and stay
            var landX = poopX + (Math.random() - 0.5) * 220;
            var landY = screenH - 20 - Math.random() * 40;
            requestAnimationFrame(function() {
              requestAnimationFrame(function() {
                pw.style.left = landX + 'px';
                pw.style.top = landY + 'px';
                pw.classList.add('plopped');
              });
            });
          }, pDelay);
          pDelay += 400;
        });

        // Reset label after pooping
        setTimeout(function() {
          $('monster-label').textContent = 'Yummy sparkle words! ✨🦄';
        }, pDelay + 1000);
      }, poopStart);

      // Unicorn exits after poop phase
      var exitTime = poopStart + (redWords.length * 400) + 3000;
      setTimeout(function() {
        mouth.classList.remove('eating');
        monster.classList.remove('visible');
        setTimeout(function() {
          overlay.classList.remove('active');
          $('monster-label').textContent = 'Yummy sparkle words! ✨🦄';
        }, 900);
      }, exitTime);

    } else {
      // No red words — unicorn exits after eating green
      setTimeout(function() {
        mouth.classList.remove('eating');
        monster.classList.remove('visible');
        setTimeout(function() {
          overlay.classList.remove('active');
        }, 900);
      }, delay + 1500);
    }
  }, 1000);
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
  document.querySelectorAll('.poop-word').forEach(function(el) { el.remove(); });
  $('monster-overlay').classList.remove('active');
  $('monster').classList.remove('visible');
  $('monster-mouth').classList.remove('eating');
  $('monster-label').textContent = 'Yummy sparkle words! ✨🦄';
}

// Stop reading mid-passage and show stats for what was read so far
function stopAndShowStats() {
  if (!startTime) return;
  finishReading();
}

// Skip current passage entirely and go to next
function skipToNextPassage() {
  stopTimer();
  stopSpeechRecognition();
  cleanupFlyingWords();
  currentPassageIndex = (currentPassageIndex + 1) % PASSAGES.length;
  loadPassage(currentPassageIndex);
}

// Jump to any passage by index (from clicking a dot)
function jumpToPassage(index) {
  stopTimer();
  stopSpeechRecognition();
  cleanupFlyingWords();
  currentPassageIndex = index;
  loadPassage(currentPassageIndex);
}
