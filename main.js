import {
    arrQuestVars,
    questionsALLJSON
} from './tests.js';

const contentMain = document.querySelector('#contentMain');
const categories = document.querySelector('#menuQuestions');
const questionTemplate = document.querySelector('#pddQuestionAsCategory');
const numQuestions = questionTemplate.querySelector('#numQuestion');
let currentTest = null;
let currentTestProgress = {};
let testDone = false;

/**
 * @description инициализирует работу скрипта
 */
function init() {
    const fisrtTab = document.querySelector('.elemNavpdd');
    setTab(fisrtTab);
    document.addEventListener('click', handleClick);
    setCategoriesTestCount();
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
            contentMain.innerHTML = 'Статистика';
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
    const testId = testType + testNumber;
    currentTestProgress = {};
    let questionsArray = [];
    questionsArray = questionsALLJSON.filter((test) => testId in test).at(0);
    currentTest = questionsArray[testId];
    testDone = false;
    setTestNavigationButtons(testId);
    contentMain.innerHTML = questionTemplate.innerHTML;
    showCurrentQuestion(1, testId);
}
/**
 * 
 * @param {*} index номер вопроса
 * @param {*} testId номер билета
 * @description Заполняет данными текущий вопрос на странице
 */
function showCurrentQuestion(index, testId) {
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
        <strong id="questionNum">${testId} </strong>
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
    console.log(testDone)
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
function setTestNavigationButtons(testId) {
    numQuestions.innerHTML = '';
    for (let i = 1; i <= currentTest.length; i++) {
        numQuestions.innerHTML += `<div class="btnQuestion ${i == 1 ? 'active' : ''}" test-id="${testId}" question-id="${i}">${i}</div>`;
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
    const buttons = contentMain.querySelectorAll('#otvety button');

    const correctAnswerIndex = currentQuestion.buttons.findIndex((button) => {
        return button.seccess;
    });

    buttons.forEach((button) => button.disabled = true);
    
    if (answerIndex === correctAnswerIndex) {
        buttons.item(correctAnswerIndex).classList.add('verno');
        currentNavigation.item(questionIndex).classList.add('verno');
    } else {
        buttons.item(answerIndex).classList.add('Neverno');
        buttons.item(correctAnswerIndex).classList.add('verno');
        currentNavigation.item(questionIndex).classList.add('Neverno');
    }

    currentTestProgress[questionIndex] = {
        currentAnswer: answerIndex,
    };

    if (Object.keys(currentTestProgress).length === currentTest.length) {
        testDone = true;
    } else {
        testDone = false;
    }

    handleNextButton(questionIndex + 1);

    commentElement.classList.remove('dnone');
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
            const testId = contentMain.querySelector('.btnQuestion.active').getAttribute('test-id');
            if (index > currentTest.length) {
                index = 1;
            }

            if (testDone) {
                return;
            }

            updateNavigation(index);
            showCurrentQuestion(index, testId);
        break;
    }
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
        const testId = target.getAttribute('test-id');
        updateNavigation(index);
        showCurrentQuestion(index, testId);
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