import {
    arrQuestVars,
    questionsALLJSON
} from './tests.js';
import Timer from './timer.js';

const contentMain = document.querySelector('#contentMain');
const categories = document.querySelector('#menuQuestions');
const questionTemplate = document.querySelector('#pddQuestionAsCategory');
const numQuestions = questionTemplate.querySelector('#numQuestion');
let currentTest = null;
let currentTestId = null;
let currentTestProgress = {};
let statisticsData = {};
let testDone = false;

/**
 * @description инициализирует работу скрипта
 */
function init() {
    const fisrtTab = document.querySelector('.elemNavpdd');
    statisticsData = getStatisticsData();
    console.log(statisticsData)

    setTab(fisrtTab);
    setCategoriesTestCount();
    document.addEventListener('click', handleClick);
}
/**
 * @description Устанавливает количество вопросов каждой категории
 */
function setCategoriesTestCount() {
    const pddCategories = document.querySelectorAll('.pddCategory');
    const cache = {};
    questionsALLJSON.map((category) => {
        let key = Object.keys(category).at(0);
        let count = category[key].length;
        key = key.match(/[a-z]+/i).at(0);
        if (!cache[key]) cache[key] = 0;

        cache[key] += count;
    });
    
    pddCategories.forEach((item) => {
        const type = item.getAttribute('typequestoins');
        const h3 = item.querySelector('h3');
        const count = cache[type];

        if (!statisticsData['total']) {
            statisticsData['total'] = {};
        }

        if (!statisticsData['total'][type]) {
            statisticsData['total'][type] = count;
        }

        if (!count) {
            item.style.display = 'none';
        } else {
            h3.innerHTML = `0 / ${count}`;
        }
    });
}
/**
 * 
 * @param {*} element тип контента
 * @description Вставляем на странице определенный контент
 */
function setContent(element) {
    const type = element.getAttribute('contenthtml');
    switch (type) {
        case 'menuQuestions':
            contentMain.innerHTML = categories.innerHTML;
            break;
        case 'examen':
            contentMain.innerHTML = 'Экзамен';
            break;
        case 'statistica':
            // contentMain.innerHTML = 'Статистика';
            showStatistics();
            break;
        case 'pddCategory':
            setCategoryContent(element)
            break;
        default:
            contentMain.innerHTML = categories.innerHTML;
            break
    }
}
/**
 * 
 * @param {*} tab вкладка на которую нажали
 * @description Делаем нажатую вкладку активной
 */
function setTab(tab) {
    let tabs = document.querySelectorAll('.elemNavpdd');

    tabs.forEach((element) => {
        element.classList.remove('active');
    });
        
    tab.classList.add('active');

    setContent(tab);
}
/**
 * 
 * @param {*} button кнопка на которую нажали
 * @description Создаем кнопки и вставляем их в основной контент
 */
function setCategoryContent(button) {
    const categoryType = button.getAttribute('typeQuestoins');
    const wrapper = document.createElement('div');
    let count = questionsALLJSON.filter((category) => {
        let key = Object.keys(category).at(0);
        key = key.match(/[a-z]+/i).at(0);
        return key === categoryType;
    }).length;

    wrapper.setAttribute('id', 'biletNums');

    contentMain.innerHTML = '';

    for (let i = 1; i < count + 1; i++) {
        let item = document.createElement('div');
        item.innerHTML = `<div class="bilet" biletType=${categoryType} biletNum=${i}><h3>${i}</h3></div>`;
        wrapper.append(item.firstChild);
    }
    contentMain.append(wrapper);
}
/**
 * 
 * @param {*} button кнопка на которую нажали
 * @description Запускаем тест
 */
function setTest(button) {
    const testType = button.getAttribute('bilettype');
    const testNumber = button.getAttribute('biletnum');
    currentTestId = testType + testNumber;
    let questionsArray = [];
    currentTestProgress = {};
    questionsArray = questionsALLJSON.filter((test) => currentTestId in test).at(0);
    currentTest = questionsArray[currentTestId];
    testDone = false;
    setTestNavigationButtons();
    contentMain.innerHTML = questionTemplate.innerHTML;
    showCurrentQuestion(1);
    Timer.start();
}
/**
 * 
 * @param {*} index номер вопроса
 * @param {*} testId номер билета
 * @description Заполняет данными текущий вопрос на странице
 */
function showCurrentQuestion(index) {
    const otvety = contentMain.querySelector('#otvety');
    const questionText = contentMain.querySelector('.question');
    const imageElement = contentMain.querySelector('.foto img');
    const commentElement = contentMain.querySelector('#comment');
    const showCommentElement = contentMain.querySelector('.btn-comment');
    const currentQuestion = currentTest[index - 1];
    
    otvety.innerHTML = '';
    for (let i = 0; i < currentQuestion.buttons.length; i++) {
        const text = currentQuestion.buttons[i].text;
        otvety.innerHTML += `<button numberAnswer="${i}" CurQuestion="${index}" type="button" class="btn btn-answer btn-default">${text}</button>`;
    }
    
    imageElement.src = currentQuestion.image;
    commentElement.classList.add('dnone');

    if (currentQuestion.comment) {
        showCommentElement.classList.remove('dnone');
        commentElement.innerHTML = `<p>${currentQuestion.comment}</p>`;
    } else {
        showCommentElement.classList.add('dnone');
    }
    
    handleNextButton(index);

    questionText.innerHTML = `
        <p>
        <strong id="questionNum">${currentTestId} </strong>
        ${currentQuestion.name}
        </p>
    `;

    if (!currentTestProgress[index - 1]) {
        return;
    }

    const {currentAnswer} = currentTestProgress[index - 1];
    handleAnswer(currentAnswer, Number(index - 1));
    // contentMain.innerHTML = questionTemplate.innerHTML;
}
/**
 * 
 * @param {*} index номер следующего вопроса
 * @description Заменяет текст кнопку далее 
 */
function handleNextButton(index) {
    const nextQuestionElement = contentMain.querySelector('.btn-next');
    nextQuestionElement.setAttribute('nextQuestion', index + 1);
    if (testDone) {
        nextQuestionElement.innerHTML = 'Завершить';        
    }
}
/**
 * 
 * @param {*} index номер текущего вопроса
 * @description подсвечивает текущий вопрос в навигации
 */
function updateNavigation(index) {
    const currentNavigation = contentMain.querySelectorAll('.btnQuestion');
    const currentNavigationButton = contentMain.querySelector(`.btnQuestion[question-id="${index}"]`);
    currentNavigation.forEach((item) => item.classList.remove('active'));
    currentNavigationButton.classList.add('active');
}
/**
 * 
 * @param {*} testId Идентификатор
 */
function setTestNavigationButtons() {
    numQuestions.innerHTML = '';
    for (let i = 1; i <= currentTest.length; i++) {
        numQuestions.innerHTML += `<div class="btnQuestion ${i == 1 ? 'active' : ''}" test-id="${currentTestId}" question-id="${i}">${i}</div>`;
    }
}
/**
 * 
 * @param {*} answerIndex номер варианта ответа
 * @param {*} questionIndex номер вопроса
 */
function handleAnswer(answerIndex, questionIndex) {
    const currentNavigation = contentMain.querySelectorAll('.btnQuestion');
    const commentElement = contentMain.querySelector('#comment');
    const currentQuestion = currentTest[questionIndex];
    const showCommentElement = contentMain.querySelector('.btn-comment');
    const buttons = contentMain.querySelectorAll('#otvety button');

    if (!statisticsData[currentTestId]) {
        statisticsData[currentTestId] = {};
    }
    if (!statisticsData[currentTestId][questionIndex]) {
        statisticsData[currentTestId][questionIndex] = {
            correct: 0,
            incorrect: 0,
            done: false,
        }
    }

    const correctAnswerIndex = currentQuestion.buttons.findIndex((button) => {
        return button.seccess;
    });

    buttons.forEach((button) => button.disabled = true);
    
    if (answerIndex === correctAnswerIndex) {
        buttons.item(correctAnswerIndex).classList.add('verno');
        currentNavigation.item(questionIndex).classList.add('verno');
        statisticsData[currentTestId][questionIndex].correct++;
        statisticsData[currentTestId][questionIndex].done = true;
    } else {
        buttons.item(answerIndex).classList.add('Neverno');
        buttons.item(correctAnswerIndex).classList.add('verno');
        currentNavigation.item(questionIndex).classList.add('Neverno');
        statisticsData[currentTestId][questionIndex].incorrect++;
    }

    currentTestProgress[questionIndex] = {
        currentAnswer: answerIndex,
        correctAnswer: correctAnswerIndex,
    };

    if (Object.keys(currentTestProgress).length === currentTest.length) {
        testDone = true;
    } else {
        testDone = false;
    }

    handleNextButton(questionIndex + 1);

    commentElement.classList.remove('dnone');
    showCommentElement.classList.add('dnone');

    saveStatistics();
}
/**
 * @description сохраняем данные в хранилище
 */
function saveStatistics() {
    const data = JSON.stringify(statisticsData);
    localStorage.setItem('statisticsData', data);
}
/**
 * 
 * @returns получаем данные их хранилища
 */
function getStatisticsData() {
    const data = localStorage.getItem('statisticsData');
    if (!data)
        return {};

    return JSON.parse(data);
}
/**
 * 
 * @param {*} target кнопка, на которую нажали
 * @description Обработка нажатий кнопок управления
 */
function handleControls(target) {
    const type = target.classList.contains('btn-comment') ? 'comment' : 'next';

    switch(type) {
        case 'comment':
            const commentElement = contentMain.querySelector('#comment');
            commentElement.classList.remove('dnone');
        break;
        case 'next':
            let index = Number(target.getAttribute('nextQuestion'));
            // const testId = contentMain.querySelector('.btnQuestion.active').getAttribute('test-id');
            if (index > currentTest.length) {
                index = 1;
            }

            if (testDone) {
                console.log(currentTestProgress)
                showResult();
                return;
            }

            updateNavigation(index);
            showCurrentQuestion(index);
        break;
    }
}
/**
 * @description Показать результаты теста
 */
function showResult() {
    Timer.stop();

    const results = calculateResult();
    const time = Timer.getTime();

    const template = `
        <table class="table">
            <tr>
                <td>Категория</td>
                <td>Правильно</td>
                <td>Неверно</td>
                <td>Время</td>
            </tr>
            <tr>
                <td>${currentTestId}</td>
                <td><span class="verno">${results.correct}</span></td>
                <td><span class="Neverno">${results.incorrect}</span></td>
                <td>${time}</td>
            </tr>
        </table>
    `;
    contentMain.innerHTML = template;
}
/**
 * @description Показать статистику
 */
function showStatistics() {
    const data = getStatisticsData();
    const counts = {
        AB: {
            correct: 0,
            incorrect: 0,
            done: 0,
        },
        C: {
            correct: 0,
            incorrect: 0,
            done: 0,
        },
        D: {
            correct: 0,
            incorrect: 0,
            done: 0,
        },
        E: {
            correct: 0,
            incorrect: 0,
            done: 0,
        },
    };
    for (let i in data) {
        let parsedKey = i.match(/[a-z]+/i).at(0);
        if (parsedKey === 'total') {
            continue;
        }
        for (let j in data[i]) {
            counts[parsedKey].correct += data[i][j].correct;
            counts[parsedKey].incorrect += data[i][j].incorrect;
            counts[parsedKey].done += data[i][j].done ? 1 : 0; 
        }
    }
    console.log(counts)
    const template = `
        <table class="table table-statistics">
            <tr>
                <td>Категория</td>
                <td>AB</td>
                <td>C</td>
                <td>D</td>
                <td>E</td>
            </tr>
            <tr>
                <td>Пройдено вопросов</td>
                <td>${Math.round(counts.AB.done / data.total.AB * 100)}%</td>
                <td>${Math.round(counts.C.done / data.total.E * 100)}%</td>
                <td>${Math.round(counts.D.done / data.total.D * 100)}%</td>
                <td>${Math.round(counts.E.done / data.total.E * 100)}%</td>
            </tr>
            <tr>
                <td>Правильных ответов</td>
                <td>${counts.AB.correct}</td>
                <td>${counts.C.correct}</td>
                <td>${counts.D.correct}</td>
                <td>${counts.E.correct}</td>
            </tr>
            <tr>
                <td>Неверных ответов</td>
                <td>${counts.AB.incorrect}</td>
                <td>${counts.C.incorrect}</td>
                <td>${counts.D.incorrect}</td>
                <td>${counts.E.incorrect}</td>
            </tr>
            <tr>
                <td>Сложные вопросы</td>
                <td><button class="btn-statistics typequestoins="AB"></button></td>
                <td><button class="btn-statistics typequestoins="C"></button></td>
                <td><button class="btn-statistics typequestoins="D"></button></td>
                <td><button class="btn-statistics typequestoins="E"></button></td>
            </tr>
        </table>
    `;
    contentMain.innerHTML = template;
}
/**
 * 
 * @returns Подсчитываем кол-во правильных и неправильных ответов
 */
function calculateResult() {
    let correct = 0;
    let incorrect = 0;
    for (let key in currentTestProgress) {
        const item = currentTestProgress[key];
        if (item.currentAnswer === item.correctAnswer) {
            correct++
        } else {
            incorrect++;
        }
    }

    return {
        correct: correct,
        incorrect: incorrect,
    };
}
/**
 * 
 * @param {*} event это значение передается при нажатии клика на элемент
 */
function handleClick(event) {
    const target = event.target;
    if (checkClass(target, 'elemNavpdd')) {
        setTab(
            getElementWithClass(target, 'elemNavpdd')
        );
    }
    if (checkClass(target, 'pddCategory')) {
        setContent(
            getElementWithClass(target, 'pddCategory')
        );
    }
    if (checkClass(target, 'bilet')) {
        setTest(
            getElementWithClass(target, 'bilet')
        );
    }
    if (checkClass(target, 'btnQuestion')) {
        const index = Number(target.getAttribute('question-id'));
        updateNavigation(index);
        showCurrentQuestion(index);
    }
    if (checkClass(target, 'btn-answer')) {
        const answerIndex = target.getAttribute('numberanswer');
        const questionIndex = target.getAttribute('curquestion');
        handleAnswer(Number(answerIndex), Number(questionIndex - 1));
    }
    if (checkClass(target, 'btn-controls')) {
        handleControls(target);
    }
}
/**
 * 
 * @param {*} target элемент, на который нажали
 * @param {*} className имя класса, наличие которого хотим проверить
 * @returns Возвращает true, если текущий элемент или родительский содержит указанный класс
 */
function checkClass(target, className) {
    return target.classList.contains(className) ||
        target.closest(`.${className}`);
}
/**
 * 
 * @param {*} target элемент, на который нажали
 * @param {*} className имя класса, наличие которого хотим проверить
 * @returns Возвращает ближайший элемент, который содержит указанный класс
 */
function getElementWithClass(target, className) {
    if (target.classList.contains(className))
        return target;
    
    return target.closest(`.${className}`);
}

init();