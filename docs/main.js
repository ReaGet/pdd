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
        
        if (!cache[key]) cache[key] = {};
        if (!cache[key]['total']) cache[key]['total'] = 0;
        if (!cache[key]['done']) cache[key]['done'] = 0;

        cache[key].total += count;
    });
    
    for (let i in statisticsData) {
        let type = i.match(/[a-z]+/i).at(0);
        if (type === 'total') {
            continue;
        }
        for (let j in statisticsData[i]) {
            cache[type].done += statisticsData[i][j].done ? 1 : 0; 
        }
    }
    
    pddCategories.forEach((item) => {
        const type = item.getAttribute('typequestoins');
        const h3 = item.querySelector('h3');
        let total = 0;

        if (cache[type]) {
            total = cache[type]['total'];
        }

        if (!statisticsData['total']) {
            statisticsData['total'] = {};
        }

        if (!statisticsData['total'][type]) {
            statisticsData['total'][type] = total;
        }

        if (!total) {
            item.style.display = 'none';
        } else {
            h3.innerHTML = `${cache[type].done} / ${total}`;
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
            setCategoriesTestCount();
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
 * @description Запускаем тест
 */
function setTest() {
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
    console.log('asd', currentQuestion)
    
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
    const cache = {
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
        let type = i.match(/[a-z]+/i).at(0);
        if (type === 'total') {
            continue;
        }
        for (let j in data[i]) {
            cache[type].correct += data[i][j].correct;
            cache[type].incorrect += data[i][j].incorrect;
            cache[type].done += data[i][j].done ? 1 : 0; 
        }
    }
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
                <td>${Math.round(cache.AB.done / (data.total?.AB || 1)  * 100)}%</td>
                <td>${Math.round(cache.C.done / (data.total?.C || 1) * 100)}%</td>
                <td>${Math.round(cache.D.done / (data.total?.D || 1) * 100)}%</td>
                <td>${Math.round(cache.E.done / (data.total?.E || 1) * 100)}%</td>
            </tr>
            <tr>
                <td>Правильных ответов</td>
                <td>${cache.AB.correct}</td>
                <td>${cache.C.correct}</td>
                <td>${cache.D.correct}</td>
                <td>${cache.E.correct}</td>
            </tr>
            <tr>
                <td>Неверных ответов</td>
                <td>${cache.AB.incorrect}</td>
                <td>${cache.C.incorrect}</td>
                <td>${cache.D.incorrect}</td>
                <td>${cache.E.incorrect}</td>
            </tr>
            <tr>
                <td>Сложные вопросы</td>
                <td><button class="btn-statistics" typeQuestoins="AB"></button></td>
                <td><button class="btn-statistics" typeQuestoins="C"></button></td>
                <td><button class="btn-statistics" typeQuestoins="D"></button></td>
                <td><button class="btn-statistics" typeQuestoins="E"></button></td>
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
    let target = event.target;
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
        target = getElementWithClass(target, 'bilet');
        const testType = target.getAttribute('bilettype');
        const testNumber = target.getAttribute('biletnum');
        currentTestId = testType + testNumber;
        let questionsArray = [];
        currentTestProgress = {};
        questionsArray = questionsALLJSON.filter((test) => currentTestId in test).at(0);
        currentTest = questionsArray[currentTestId];
        setTest();
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
    if (checkClass(target, 'btn-statistics')) {
        let type = target.getAttribute('typeQuestoins');
        let questionsArray = [];
        currentTestProgress = {};
        for (let key in statisticsData) {
            let parsedKey = key.match(/[a-z]+/i).at(0);
            if (key === 'total' || type != parsedKey) {
                continue;
            }
            
            for (let i in statisticsData[key]) {
                let arr = questionsALLJSON.filter((test) => key in test).at(0);
                console.log(arr, i)
                questionsArray.push(arr[key].at(i));
            }
        }

        if (questionsArray.length === 0) {
            return;
        }
        
        currentTest = questionsArray;
        console.log(currentTest)
        setTest();
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