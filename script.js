// 常數定義
const MAX_QUESTIONS = 20;
const OPERATORS = ['+', '-', '×'];
const SCORE_PER_QUESTION = 5;

// 遊戲狀態
const gameState = {
    currentAnswer: 0,
    correctCount: 0,
    incorrectCount: 0,
    problemHistory: [],
    currentProblemIndex: -1,
    isAnswered: false,
    totalQuestions: 0
};

// 工具函數
const utils = {
    getRandomPastelColor() {
        const hue = Math.floor(Math.random() * 360);
        const saturation = Math.floor(Math.random() * 30) + 60;
        const lightness = Math.floor(Math.random() * 10) + 85;
        return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
    },

    updateBackgroundColor() {
        document.querySelector('.game-container').style.backgroundColor = this.getRandomPastelColor();
    },

    showAlert(message) {
        document.getElementById('alertMessage').textContent = message;
        document.getElementById('alertModal').style.display = 'block';
    },

    closeAlert() {
        document.getElementById('alertModal').style.display = 'none';
    },

    closeModal() {
        document.getElementById('answerModal').style.display = 'none';
    },

    updateScoreDisplay() {
        document.getElementById('score').textContent = 
            `答對：${gameState.correctCount} 題，答錯：${gameState.incorrectCount} 題`;
    }
};

// 問題生成器
const problemGenerator = {
    generateProblem() {
        const operator = OPERATORS[Math.floor(Math.random() * OPERATORS.length)];
        const { num1, num2, result } = this.generateNumbers(operator);
        const hiddenPosition = Math.floor(Math.random() * 3);
        
        return {
            num1,
            num2,
            result,
            operator,
            hiddenPosition,
            currentAnswer: [num1, num2, result][hiddenPosition]
        };
    },

    generateNumbers(operator) {
        switch(operator) {
            case '+':
                return this.generateAddition();
            case '-':
                return this.generateSubtraction();
            case '×':
                return this.generateMultiplication();
            default:
                throw new Error('Invalid operator');
        }
    },

    generateAddition() {
        const num1 = Math.floor(Math.random() * 90) + 10;
        const num2 = Math.floor(Math.random() * (100 - num1 - 10)) + 10;
        return { num1, num2, result: num1 + num2 };
    },

    generateSubtraction() {
        const num1 = Math.floor(Math.random() * 90) + 10;
        const num2 = Math.floor(Math.random() * (num1 - 10)) + 10;
        return { num1, num2, result: num1 - num2 };
    },

    generateMultiplication() {
        const num1 = Math.floor(Math.random() * 9) + 1;
        const num2 = Math.floor(Math.random() * (200 / num1)) + 1;
        return { num1, num2, result: num1 * num2 };
    }
};

// UI 控制器
const uiController = {
    displayProblem(problem) {
        const elements = {
            number1: document.querySelector('.number1'),
            operator: document.querySelector('.operator'),
            number2: document.querySelector('.number2'),
            result: document.querySelector('.result')
        };
        
        elements.operator.textContent = problem.operator;
        
        const numbers = [problem.num1, problem.num2, problem.result];
        const elementsList = [elements.number1, elements.number2, elements.result];
        
        elementsList.forEach((element, index) => {
            if (index === problem.hiddenPosition) {
                element.textContent = '';
                element.contentEditable = true;
            } else {
                element.textContent = numbers[index].toString().padStart(3, ' ');
                element.contentEditable = false;
            }
        });
        
        gameState.currentAnswer = numbers[problem.hiddenPosition];
    },

    resetNumberBoxes() {
        document.querySelectorAll('.number1, .number2, .result').forEach(box => {
            box.classList.remove('correct', 'incorrect', 'answered');
        });
    },

    showAnswer() {
        const problem = gameState.problemHistory[gameState.currentProblemIndex];
        const modalContent = document.getElementById('modalContent');
        const answers = ['第一個數字', '第二個數字', '計算結果'];
        const values = [problem.num1, problem.num2, problem.result];
        
        modalContent.innerHTML = `
            <p>${answers[problem.hiddenPosition]}是 ${values[problem.hiddenPosition]}</p>
            ${this.getCalculationDescription(problem)}
        `;
        
        document.getElementById('answerModal').style.display = 'block';
    },

    getCalculationDescription(problem) {
        const descriptions = {
            '+': this.getAdditionDescription,
            '-': this.getSubtractionDescription,
            '×': this.getMultiplicationDescription
        };
        return descriptions[problem.operator](problem);
    },

    getAdditionDescription(problem) {
        const num1Tens = Math.floor(problem.num1 / 10);
        const num1Ones = problem.num1 % 10;
        const num2Tens = Math.floor(problem.num2 / 10);
        const num2Ones = problem.num2 % 10;
        const resultTens = Math.floor(problem.result / 10);
        const resultOnes = problem.result % 10;
        const onesSum = num1Ones + num2Ones;

        return `
            <p>計算步驟：</p>
            <p>1. 第一個數的個位數是${num1Ones}，十位數是${num1Tens}</p>
            <p>2. 第二個數的個位數是${num2Ones}，十位數是${num2Tens}</p>
            <p>3. 相加時：</p>
            ${onesSum >= 10 ? `
                <p>   - 個位數相加：${num1Ones} + ${num2Ones} = ${onesSum}，超過十，需要進位</p>
                <p>   - 個位數寫下 ${resultOnes}，進位一到十位數</p>
                <p>   - 十位數相加：${num1Tens} + ${num2Tens} + 1 = ${resultTens}</p>
            ` : `
                <p>   - 個位數相加：${num1Ones} + ${num2Ones} = ${resultOnes}</p>
                <p>   - 十位數相加：${num1Tens} + ${num2Tens} = ${resultTens}</p>
            `}
            <p>4. 最終結果：${problem.result}</p>
        `;
    },

    getSubtractionDescription(problem) {
        const num1Tens = Math.floor(problem.num1 / 10);
        const num1Ones = problem.num1 % 10;
        const num2Tens = Math.floor(problem.num2 / 10);
        const num2Ones = problem.num2 % 10;
        const resultTens = Math.floor(problem.result / 10);
        const resultOnes = problem.result % 10;

        return `
            <p>計算步驟：</p>
            <p>1. 第一個數的個位數是${num1Ones}，十位數是${num1Tens}</p>
            <p>2. 第二個數的個位數是${num2Ones}，十位數是${num2Tens}</p>
            <p>3. 相減時：</p>
            ${num1Ones < num2Ones ? `
                <p>   - 個位數相減：${num1Ones} 不夠減 ${num2Ones}，需要向十位數借一</p>
                <p>   - 向十位數借一（等於十），${num1Ones} + 10 = ${num1Ones + 10}</p>
                <p>   - 個位數相減：${num1Ones + 10} - ${num2Ones} = ${resultOnes}</p>
                <p>   - 十位數減少一變成 ${num1Tens - 1}，再減去 ${num2Tens}，得到 ${resultTens}</p>
            ` : `
                <p>   - 個位數相減：${num1Ones} - ${num2Ones} = ${resultOnes}（不需要借位）</p>
                <p>   - 十位數相減：${num1Tens} - ${num2Tens} = ${resultTens}</p>
            `}
            <p>4. 最終結果：${problem.result}</p>
        `;
    },

    getMultiplicationDescription(problem) {
        const num2Tens = Math.floor(problem.num2 / 10);
        const num2Ones = problem.num2 % 10;
        
        return `
            <p>計算步驟：</p>
            <p>1. 第一個數是 ${problem.num1}</p>
            <p>2. 第二個數的個位數是${num2Ones}，十位數是${num2Tens}</p>
            <p>3. 乘法計算：</p>
            ${num2Tens > 0 ? `
                <p>   - ${problem.num1} × ${num2Tens}0 = ${problem.num1 * num2Tens * 10}</p>
                <p>   - ${problem.num1} × ${num2Ones} = ${problem.num1 * num2Ones}</p>
                <p>   - 將兩個結果相加：${problem.num1 * num2Tens * 10} + ${problem.num1 * num2Ones} = ${problem.result}</p>
            ` : `<p>   - ${problem.num1} × ${num2Ones} = ${problem.result}</p>`}
            <p>4. 最終結果：${problem.result}</p>
        `;
    }
};

// 遊戲邏輯控制器
const gameController = {
    handleNumberInput(event, element) {
        if (element.classList.contains('answered')) return;
        
        if (event.key !== 'Backspace' && event.key !== 'Delete' && !/^\d$/.test(event.key)) {
            event.preventDefault();
        }
    },

    checkCurrentAnswer() {
        if (gameState.isAnswered) return;
        
        const editableElement = document.querySelector('.number1[contenteditable="true"], .number2[contenteditable="true"], .result[contenteditable="true"]');
        if (!editableElement) return;
        
        const value = editableElement.textContent.trim();
        if (!value) {
            utils.showAlert('請輸入數字');
            return;
        }
        
        this.checkAnswer(parseInt(value), editableElement);
    },

    checkAnswer(userAnswer, element) {
        if (gameState.isAnswered) return;
        
        if (userAnswer === gameState.currentAnswer) {
            gameState.correctCount++;
            element.classList.add('correct', 'answered');
            alert('答對了！');
            document.querySelector('.show-answer-btn').style.display = 'none';
            setTimeout(() => this.generateNewProblem(), 100);
        } else {
            gameState.incorrectCount++;
            element.classList.add('incorrect', 'answered');
            alert('答錯了，請看答案！');
            document.querySelector('.show-answer-btn').style.display = 'inline-block';
        }
        
        gameState.isAnswered = true;
        utils.updateScoreDisplay();
        gameState.totalQuestions++;
        
        if (gameState.totalQuestions >= MAX_QUESTIONS) {
            this.showResult();
        }
    },

    generateNewProblem() {
        const problem = problemGenerator.generateProblem();
        gameState.problemHistory.push(problem);
        gameState.currentProblemIndex = gameState.problemHistory.length - 1;
        uiController.displayProblem(problem);
        utils.updateBackgroundColor();
        uiController.resetNumberBoxes();
        gameState.isAnswered = false;
        utils.closeModal();
        document.querySelector('.show-answer-btn').style.display = 'none';
    },

    showPreviousProblem() {
        if (gameState.currentProblemIndex > 0) {
            gameState.currentProblemIndex--;
            uiController.displayProblem(gameState.problemHistory[gameState.currentProblemIndex]);
            gameState.isAnswered = true;
            utils.closeModal();
        }
    },

    showResult() {
        const score = gameState.correctCount * SCORE_PER_QUESTION;
        const resultFace = document.getElementById('resultFace');
        
        resultFace.src = score <= 40 ? 'https://raw.githubusercontent.com/twitter/twemoji/master/assets/svg/1f62d.svg' :
                        score <= 60 ? 'https://raw.githubusercontent.com/twitter/twemoji/master/assets/svg/1f622.svg' :
                        score <= 80 ? 'https://raw.githubusercontent.com/twitter/twemoji/master/assets/svg/1f610.svg' :
                        'https://raw.githubusercontent.com/twitter/twemoji/master/assets/svg/1f600.svg';
        
        document.getElementById('finalCorrect').textContent = gameState.correctCount;
        document.getElementById('finalIncorrect').textContent = gameState.incorrectCount;
        document.getElementById('finalScore').textContent = score;
        
        document.getElementById('resultScreen').style.display = 'flex';
    },

    restartGame() {
        Object.assign(gameState, {
            currentAnswer: 0,
            correctCount: 0,
            incorrectCount: 0,
            problemHistory: [],
            currentProblemIndex: -1,
            isAnswered: false,
            totalQuestions: 0
        });
        
        document.getElementById('resultScreen').style.display = 'none';
        this.generateNewProblem();
    },

    showSubmitConfirm() {
        document.getElementById('answeredCount').textContent = gameState.totalQuestions;
        document.getElementById('remainingCount').textContent = MAX_QUESTIONS - gameState.totalQuestions;
        document.getElementById('submitModal').style.display = 'block';
    },

    closeSubmitModal() {
        document.getElementById('submitModal').style.display = 'none';
    },

    submitExam() {
        const remainingQuestions = MAX_QUESTIONS - gameState.totalQuestions;
        gameState.incorrectCount += remainingQuestions;
        gameState.totalQuestions = MAX_QUESTIONS;
        this.closeSubmitModal();
        this.showResult();
    }
};

// 初始化遊戲
utils.updateBackgroundColor();
gameController.generateNewProblem(); 