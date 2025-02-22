const states = {
    WORK: { duration: 25*60, color: '#FF6B6B' },
    SHORT_BREAK: { duration: 5*60, color: '#4ECDC4' },
    LONG_BREAK: { duration: 15*60, color: '#A29BFE' }
};

let currentState = 'WORK';
let timeLeft = states[currentState].duration;
let isRunning = false;
let interval;
let sessionsCompleted = 0;
let isSoundEnabled = true;
let isDarkMode = true;

const timerDisplay = document.getElementById('timer');
const startButton = document.getElementById('start');
const resetButton = document.getElementById('reset');
const modeButtons = document.querySelectorAll('.mode-tabs button');
const notification = document.getElementById('notification');
const themeToggle = document.getElementById('theme-toggle');
const soundToggle = document.getElementById('sound-toggle');
const sessionCount = document.getElementById('count');
const completionBar = document.querySelector('.completion-bar');

// Initialize
document.documentElement.setAttribute('data-theme', 'dark');
updateProgress(1);
updateCompletionBar();

// Event Listeners
startButton.addEventListener('click', toggleTimer);
resetButton.addEventListener('click', resetTimer);
modeButtons.forEach(btn => btn.addEventListener('click', changeMode));
themeToggle.addEventListener('click', toggleTheme);
soundToggle.addEventListener('click', toggleSound);
document.addEventListener('keyup', handleKeyboard);

function toggleTimer() {
    isRunning = !isRunning;
    startButton.textContent = isRunning ? '⏸ Pause' : '▶ Start';
    
    if(isRunning) {
        interval = setInterval(updateTime, 1000);
    } else {
        clearInterval(interval);
    }
}

function updateTime() {
    timeLeft--;
    
    if(timeLeft <= 0) {
        handleTimerComplete();
        return;
    }
    
    updateDisplay();
    updateProgress(1 - (timeLeft / states[currentState].duration));
    
    // Progressive sound effect
    if(timeLeft <= 10 && isSoundEnabled) {
        playBeep(1 - (timeLeft / 10));
    }
}

function handleTimerComplete() {
    clearInterval(interval);
    isRunning = false;
    startButton.textContent = '▶ Start';
    
    if(currentState === 'WORK') {
        sessionsCompleted++;
        sessionCount.textContent = sessionsCompleted;
        updateCompletionBar();
        
        if(sessionsCompleted % 4 === 0) {
            showNotification("🎉 Time for a long break!");
            currentState = 'LONG_BREAK';
        } else {
            showNotification("Time's up! Take a short break 🎉");
            currentState = 'SHORT_BREAK';
        }
    } else {
        showNotification("Break's over! Back to work 💪");
        currentState = 'WORK';
    }
    
    timeLeft = states[currentState].duration;
    updateModeTabs();
    updateDisplay();
    updateProgress(1);
    if(isSoundEnabled) playCompleteSound();
}

function updateDisplay() {
    const minutes = Math.floor(timeLeft / 60).toString().padStart(2, '0');
    const seconds = (timeLeft % 60).toString().padStart(2, '0');
    timerDisplay.textContent = `${minutes}:${seconds}`;
}

function updateProgress(percent) {
    const circle = document.querySelector('.progress-circle');
    const circumference = 2 * Math.PI * 140;
    circle.style.strokeDasharray = circumference;
    circle.style.strokeDashoffset = circumference * (1 - percent);
    circle.style.stroke = states[currentState].color;
}

function resetTimer() {
    clearInterval(interval);
    isRunning = false;
    timeLeft = states[currentState].duration;
    startButton.textContent = '▶ Start';
    updateDisplay();
    updateProgress(1);
}

function changeMode(e) {
    currentState = e.target.dataset.mode.toUpperCase().replace('-', '_');
    timeLeft = states[currentState].duration;
    updateModeTabs();
    resetTimer();
}

function updateModeTabs() {
    modeButtons.forEach(btn => {
        btn.classList.remove('active');
        if(btn.dataset.mode === currentState.toLowerCase().replace('_', '-')) {
            btn.classList.add('active');
        }
    });
}

function toggleTheme() {
    isDarkMode = !isDarkMode;
    themeToggle.textContent = isDarkMode ? '🌙' : '☀️';
    document.documentElement.setAttribute('data-theme', isDarkMode ? 'dark' : 'light');
}

function toggleSound() {
    isSoundEnabled = !isSoundEnabled;
    soundToggle.textContent = isSoundEnabled ? '🔊' : '🔇';
}

function showNotification(text) {
    notification.textContent = text;
    notification.style.bottom = '20px';
    setTimeout(() => notification.style.bottom = '-50px', 3000);
}

function updateCompletionBar() {
    const percent = (sessionsCompleted % 4) / 4;
    completionBar.style.setProperty('--width', `${percent * 100}%`);
}

function handleKeyboard(e) {
    if(e.code === 'Space') toggleTimer();
    if(e.code === 'KeyR') resetTimer();
}

function playCompleteSound() {
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(440, ctx.currentTime);
    osc.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.5);
}

function playBeep(volume) {
    const ctx = new AudioContext();
    const gainNode = ctx.createGain();
    const osc = ctx.createOscillator();
    
    osc.type = 'square';
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    gainNode.gain.setValueAtTime(volume, ctx.currentTime);
    
    osc.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    osc.start();
    osc.stop(ctx.currentTime + 0.1);
}