const config = {
    totalChapters: 15,
    questionsPerChapter: 10,
    chapterNames: {
        1: "1. Matter in Our Surroundings",
        2: "2. Is Matter Around Us Pure",
        3: "3. Atoms and Molecules",
        4: "4. Structure of the Atom",
        5: "5. The Fundamental Unit of Life",
        6: "6. Tissues",
        7: "7. Diversity in Living Organisms",
        8: "8. Motion",
        9: "9. Force and Laws of Motion",
        10: "10. Gravitation",
        11: "11. Work and Energy",
        12: "12  Sound",
        13: "13. Why Do We Fall Ill",
        14: "14. Natural Resources",
        15: "15. Improvement in Food Resources"
    }
};

let state = {
    currentChapter: null,
    currentQuestion: 0,
    score: 0,
    quizData: [],
    selectedOption: null
};

const elements = {
    question: document.getElementById('question'),
    questionNumber: document.getElementById('question-number'),
    options: document.getElementById('options'),
    nextBtn: document.getElementById('next-btn'),
    prevBtn: document.getElementById('prev-btn'),
    progressFill: document.querySelector('.progress-fill'),
    progressText: document.querySelector('.progress-text'),
    quizContainer: document.querySelector('.quiz-container'),
    chapterTitle: document.getElementById('chapter-title'),
    mainTitle: document.querySelector('.main-title')
};

async function initQuiz(chapter) {
    try {
        state.currentChapter = chapter;
        state.currentQuestion = 0;
        state.score = 0;
        state.selectedOption = null;
        
        const response = await fetch(`chapter${chapter}.json`);
        state.quizData = await response.json();
        
        document.title = `${config.chapterNames[chapter]} | NCERT Quiz`;
        elements.chapterTitle.textContent = config.chapterNames[chapter];
        elements.mainTitle.style.display = 'none';
        elements.chapterTitle.style.display = 'block';
        
        updateProgress();
        showQuestion();
    } catch (error) {
        console.error('Error loading quiz:', error);
        showErrorScreen();
    }
}

function showChapterSelection() {
    document.title = "NCERT Class 9 Science Quiz";
    elements.mainTitle.style.display = 'block';
    elements.chapterTitle.style.display = 'none';
    
    elements.quizContainer.innerHTML = `
        <div class="chapter-selection">
            <h2 class="chapter-header"><i class="fas fa-book-open"></i> Select Chapter</h2>
            <div class="chapter-grid">
                ${Array.from({length: config.totalChapters}, (_, i) => i + 1)
                    .map(chapter => `
                    <button class="chapter-btn" onclick="initQuiz(${chapter})">
                        <i class="fas fa-atom"></i>
                        Chapter ${chapter}
                    </button>`
                    ).join('')}
            </div>
        </div>
    `;
}

function showQuestion() {
    const question = state.quizData[state.currentQuestion];
    
    elements.quizContainer.innerHTML = `
        <div class="quiz-active">
            <div id="question-container">
                <div id="question-number">Question ${state.currentQuestion + 1}/${state.quizData.length}</div>
                <div id="question">${question.question}</div>
            </div>
            
            <div id="options" class="options">
                ${question.options.map((option, index) => `
                    <button onclick="selectOption(${index})" class="${state.selectedOption === index ? 'selected' : ''}">
                        <span class="option-letter">${String.fromCharCode(65 + index)}</span>. ${option}
                    </button>`
                ).join('')}
            </div>
            
            <div class="quiz-footer">
                <button id="back-to-chapters" class="nav-btn secondary-btn" onclick="showChapterSelection()">
                    <i class="fas fa-book"></i> Chapters
                </button>
                <button id="prev-btn" class="nav-btn secondary-btn" onclick="prevQuestion()" ${state.currentQuestion === 0 ? 'disabled' : ''}>
                    <i class="fas fa-arrow-left"></i> Previous
                </button>
                <button id="next-btn" class="nav-btn primary-btn" onclick="nextQuestion()" ${state.selectedOption === null ? 'disabled' : ''}>
                    ${state.currentQuestion === state.quizData.length - 1 ? 'Submit' : 'Next'} <i class="fas fa-arrow-right"></i>
                </button>
            </div>
        </div>
    `;
}

function selectOption(index) {
    const options = document.querySelectorAll('#options button');
    if (state.selectedOption !== null) {
        options[state.selectedOption].classList.remove('selected');
    }
    state.selectedOption = index;
    options[index].classList.add('selected');
    document.getElementById('next-btn').disabled = false;
}

function nextQuestion() {
    if (state.selectedOption === null) return;
    
    const correctIndex = state.quizData[state.currentQuestion].answer;
    const options = document.querySelectorAll('#options button');
    
    if (state.selectedOption === correctIndex) {
        state.score++;
        options[state.selectedOption].classList.add('correct');
    } else {
        options[state.selectedOption].classList.add('wrong');
        options[correctIndex].classList.add('correct');
    }
    
    options.forEach(option => {
        option.classList.add('disabled');
        option.onclick = null;
    });
    
    state.currentQuestion++;
    state.selectedOption = null;
    
    if (state.currentQuestion < state.quizData.length) {
        setTimeout(() => {
            updateProgress();
            showQuestion();
        }, 1000);
    } else {
        setTimeout(showResults, 1000);
    }
}

function prevQuestion() {
    if (state.currentQuestion > 0) {
        state.currentQuestion--;
        state.selectedOption = null;
        updateProgress();
        showQuestion();
    }
}

function updateProgress() {
    const progress = ((state.currentQuestion) / state.quizData.length) * 100;
    elements.progressFill.style.width = `${progress}%`;
    elements.progressText.textContent = `${Math.round(progress)}%`;
}

function showResults() {
    const percentage = Math.round((state.score / state.quizData.length) * 100);
    let message = percentage >= 90 ? "Brilliant! 🌟" :
        percentage >= 75 ? "Excellent! 🎯" :
        percentage >= 60 ? "Good Job! 👍" :
        percentage >= 40 ? "Keep Practicing! 💪" : "Try Again! 📚";
    
    elements.quizContainer.innerHTML = `
        <div class="result-screen">
            <h2 class="result-title">${message}</h2>
            <div class="result-score">Score: ${state.score}/${state.quizData.length}</div>
            
            <div class="progress-circle">
                <svg viewBox="0 0 36 36" class="circular-chart">
                    <path class="circle-bg" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"/>
                    <path class="circle" stroke-dasharray="${percentage}, 100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"/>
                </svg>
                <div class="percentage">${percentage}%</div>
            </div>
            
            <div class="result-message">${getPerformanceMessage(percentage)}</div>
            
            <div class="result-buttons">
                ${state.currentChapter > 1 ? `
                <button onclick="initQuiz(${state.currentChapter - 1})" class="result-btn btn-secondary">
                    <i class="fas fa-arrow-left"></i> Previous Chapter
                </button>` : ''}
                
                <button onclick="initQuiz(${state.currentChapter})" class="result-btn btn-primary">
                    <i class="fas fa-redo"></i> Try Again
                </button>
                
                ${state.currentChapter < config.totalChapters ? `
                <button onclick="initQuiz(${state.currentChapter + 1})" class="result-btn btn-secondary">
                    Next Chapter <i class="fas fa-arrow-right"></i>
                </button>` : ''}
            </div>
        </div>
    `;
}

function getPerformanceMessage(percentage) {
    return percentage >= 90 ? "You've mastered this chapter! Ready for the next challenge?" :
        percentage >= 75 ? "Great understanding! A little more practice for perfection." :
        percentage >= 60 ? "Good effort! Review the questions you missed." :
        "Review the chapter and try again to improve your score.";
}

function showErrorScreen() {
    elements.quizContainer.innerHTML = `
        <div class="error-screen">
            <h2><i class="fas fa-exclamation-triangle"></i> Quiz Loading Error</h2>
            <p>Failed to load quiz data. Please try again later.</p>
            <button onclick="showChapterSelection()" class="result-btn btn-primary">
                <i class="fas fa-book"></i> Back to Chapters
            </button>
        </div>
    `;
}

// Initialize the app
showChapterSelection();