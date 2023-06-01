let prefix = "ru";
// if (/(\/ru\/)/ig.test(location.href)) {
//     var questionsALLJSON = await fetchData("./rus.tests.js");
// 	prefix = "ru";
// } else {
//     var questionsALLJSON = await fetchData("./rom.tests.js");
// 	prefix = "rom";
// }

const locale = {
	ru: {
		category: "Категория",
		passedStat: "Пройдено вопросов",
		correctStat: "Правильных ответов",
		wrongStat: "Неверных ответов",
		hard: "Сложные вопросы",
		removeStat: "Удалить статистику",
		correct: "Правильно",
		wrong: "Неверно",
		time: "Время",
        comment: "Комментарий",
        next: "Далее",
        finish: "Завершить"
	},
	rum: {
		category: "Categorie",
		passedStat: "Au trecut întrebări",
		correctStat: "Răspunsuri corecte",
		wrongStat: "Răspunsuri greșite",
		hard: "Întrebări dificile",
		removeStat: "Ștergeți statisticile",
		correct: "Corect",
		wrong: "Gresit",
		time: "Timp",
        comment: "Cometariu",
        next: "Mai departe",
        finish: "A termina"
	}
}
import Timer from "./timer.js";

const content = document.querySelector("#contentMain");
const questionTemplate = document.querySelector("#pddQuestionAsCategory");
const testPagination = document.querySelector("#pddQuestionAsCategory #numQuestion");
const testTheme = document.querySelector("[data-action=openLearningMenu]").dataset.category;
let tests = null;
let isExam = false;
let currentTestProgress = {};
let testDone = false;
let statisticsData = {};
let currentCategoryTests = null;
let currentTest = null;
let categories = [
    "Дорожные знаки США",
    "Примеры тестов CDL",
    "100 популярных вопросов",
    "Права на мотоцикл",
];

async function init() {
    statisticsData = getStatisticsData();
    tests = await fetchData("./rus.tests.js");
    currentCategoryTests = tests[testTheme];
    document.addEventListener("click", handleClick);
    actions.openLearningMenu(testTheme);
}
/**
 * 
 * @param {*} url 
 * @returns возвращает массив данных
 */
function fetchData(url) {
    return fetch(url)
        .then(res => res.json())
        .then(data => data);
}

function handleClick(event) {
    const target = event.target.closest("[data-action]") || event.target,
        actionName = target.dataset.action;
    if (!actionName) {
        return;
    }

    actions[actionName] && actions[actionName](target);
}

const actions = {
    openLearningMenu(category) {
        isExam = false;
        if (typeof category === "object") {
            category = category.dataset.category;
        }
        let testsItemes = createListOfTestsTitles(currentCategoryTests, category);
        let categoriesItemes = createListOfCategories(categories);
        content.innerHTML = `<div class="categories__inner">${testsItemes}${categoriesItemes}</div>`;
    },
    openCategoryItem(target) {
        let category = target?.dataset.category;
        let testsItemes = createListOfTestsTitles(tests[category], category);
        content.innerHTML = `<div class="categories__inner">${testsItemes}</div>`;
    },
    startTest(target) {
        currentTestProgress = {};
        const { title, category } = target.dataset;
        currentTest = tests[category].find((item) => item.title === title);
        currentTest.category = category;
        console.log(currentTest);
        startTest();
    },
    handleAnswer(target) {
        const answerIndex = target.getAttribute('numberanswer');
        const questionIndex = target.getAttribute('curquestion');
        handleAnswer(Number(answerIndex), Number(questionIndex - 1));
    },
    nextQuestion() {
        nextQuestion();
    },
    openQuestion(target) {
        const index = Number(target.getAttribute('question-id'));
        updateNavigation(index);
        showCurrentQuestion(index);
    },
    openExamenMenu() {
        isExam = true;
        content.innerHTML = "Exam";
    },
    openStatisticsMenu() {
        showStatistics();
    },
};

function createListOfTestsTitles(items, category) {
    return items.reduce((markup, test) => {
        const { title } = test;
        markup += `
            <div class="bilet" data-category="${category}" data-title="${title}" data-action="startTest">
                <h3>${title}</h3>
            </div>
        `;
        return markup;
    }, "");
}

function createListOfCategories(items) {
    return items.reduce((markup, title) => {
        markup += `
            <div class="bilet" data-action="openCategoryItem" data-category="${title}">
                <h3>${title}</h3>
            </div>
        `;
        return markup;
    }, "");
}

function startTest() {
    testDone = false;
    testPagination.innerHTML = createPagination();
    content.innerHTML = questionTemplate.innerHTML;
    showCurrentQuestion(1);
    Timer.start();
}

function createPagination() {
    let pagination = "";
    for (let i = 1; i <= currentTest.test.length; i++) {
        pagination += `<div class="btnQuestion ${i == 1 ? "active" : ""}" question-id="${i}" data-action="openQuestion">${i}</div>`;
    }
    return pagination;
}

function showCurrentQuestion(index) {
    const otvety = content.querySelector("#otvety");
    const questionText = content.querySelector(".question");
    const imageElement = content.querySelector(".foto img");
    const leftBlock = content.querySelector("#left");
    let currentQuestion = currentTest.test[index - 1];
    
    otvety.innerHTML = "";
    for (let i = 0; i < currentQuestion.buttons.length; i++) {
        const text = currentQuestion.buttons[i].text;
        otvety.innerHTML += `<button numberAnswer="${i}" CurQuestion="${index}" type="button" class="btn btn-answer btn-default" data-action="handleAnswer">${text}</button>`;
    }

    if (testDone) {
        const buttons = content.querySelectorAll("#otvety button");
        buttons.forEach((button) => button.disabled = true);
    }

    if (currentQuestion.image) {
        leftBlock.style.display = "block";
        imageElement.src = currentQuestion.image;
    } else {
        leftBlock.style.display = "none";
    }
    
    handleNextButton(index);

    questionText.innerHTML = `
        <p>
        <strong id="questionNum">${currentTest.category}, ${currentTest.title} </strong>
        ${currentQuestion.name}
        </p>
    `;

    if (!currentTestProgress[index - 1]) {
        return;
    }

    const {currentAnswer} = currentTestProgress[index - 1];
    handleAnswer(currentAnswer, Number(index - 1));
}

function nextQuestion() {
    const activeNavigationButton = content.querySelector('.btnQuestion.active');
    const navigationButtons = Array.from(content.querySelectorAll('.btnQuestion'));
    let index = [].indexOf.call(navigationButtons, activeNavigationButton) + 1;

    index = Math.max(1, (index + 1) % (currentTest.test.length + 1));
    let nextIndex = Math.max(1, (index + 1) % (currentTest.test.length + 1));
    console.log(index);
    let nextQuestion = navigationButtons[index - 1];
    while (nextQuestion.classList.contains('verno') ||
        nextQuestion.classList.contains('Neverno')) {
        index = Math.max(1, (index + 1) % (currentTest.test.length + 1));
        nextQuestion = navigationButtons[index - 1];
        if (nextQuestion.classList.contains('active')) {
            break;
        }
    }

    setTimeout(() => scrollTo(content), 300);

    if (testDone) {
        showResult();
        return;
    }

    updateNavigation(index);
    showCurrentQuestion(index);
}

function updateNavigation(index) {
    const currentNavigation = content.querySelectorAll('.btnQuestion');
    const currentNavigationButton = content.querySelector(`.btnQuestion[question-id="${index}"]`);
    currentNavigation.forEach((item) => item.classList.remove('active'));
    currentNavigationButton.classList.add('active');
}

function handleNextButton(index) {
    const nextQuestionElement = content.querySelector(".btn-next");
    nextQuestionElement.setAttribute("nextQuestion", index + 1);
    if (testDone) {
        nextQuestionElement.innerHTML = locale[prefix].finish;        
    }
}

function handleAnswer(answerIndex, questionIndex) {
    const currentNavigation = content.querySelectorAll('.btnQuestion');
    const currentQuestion = currentTest.test[questionIndex];
    const buttons = content.querySelectorAll('#otvety button');
    const testType = `${currentTest.category}, ${currentTest.title}`;

    if (!statisticsData[testType]) {
        statisticsData[testType] = {};
    }
    if (!statisticsData[testType][questionIndex]) {
        statisticsData[testType][questionIndex] = {
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
        statisticsData[testType][questionIndex].correct++;
        statisticsData[testType][questionIndex].done = true;
    } else {
        buttons.item(answerIndex).classList.add('Neverno');
        buttons.item(correctAnswerIndex).classList.add('verno');
        currentNavigation.item(questionIndex).classList.add('Neverno');
        statisticsData[testType][questionIndex].incorrect++;
    }

    currentTestProgress[questionIndex] = {
        currentAnswer: answerIndex,
        correctAnswer: correctAnswerIndex,
    };

    if (Object.keys(currentTestProgress).length === currentTest.test.length) {
        testDone = true;
    } else {
        testDone = false;
    }
    console.log(currentTestProgress);

    handleNextButton(questionIndex + 1);

    saveStatistics();
}

function showResult() {
    Timer.stop();

    const results = calculateResult();
    const time = isExam ? Timer.getRemainingTime() : Timer.getTime();

    const template = `
        <table class="table">
            <tr>
                <td>${locale[prefix].category}</td>
                <td>${locale[prefix].correct}</td>
                <td>${locale[prefix].wrong}</td>
                <td>${locale[prefix].time}</td>
            </tr>
            <tr>
                <td>${currentTest.category}, ${currentTest.title}</td>
                <td><span class="verno">${results.correct}</span></td>
                <td><span class="Neverno">${results.incorrect}</span></td>
                <td>${time}</td>
            </tr>
        </table>
    `;
    contentMain.innerHTML = template;
}

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

function getStatisticsData() {
    const data = localStorage.getItem(`${testTheme}__statisticsData`);
    if (!data)
        return {};

    return JSON.parse(data);
}

function saveStatistics() {
    const data = JSON.stringify(statisticsData);
    localStorage.setItem(`${testTheme}__statisticsData`, data);
}

function showStatistics() {
    const data = getStatisticsData();
    console.log(currentTest);
    const keys = Object.keys(currentTest);
    console.log(keys);
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
        F: {
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
        <div class="table-statistics__wrapper">
            <table class="table table-statistics">
                <tr>
                    <td>${locale[prefix].category}</td>
                    <td>AB</td>
                    <td>C</td>
                    <td>D</td>
                    <td>E</td>
                    <td>F</td>
                </tr>
                <tr>
                    <td>${locale[prefix].passedStat}</td>
                    <td>${Math.round(cache.AB.done / (data.total?.AB || 1)  * 100)}%</td>
                    <td>${Math.round(cache.C.done / (data.total?.C || 1) * 100)}%</td>
                    <td>${Math.round(cache.D.done / (data.total?.D || 1) * 100)}%</td>
                    <td>${Math.round(cache.E.done / (data.total?.E || 1) * 100)}%</td>
                    <td>${Math.round(cache.F.done / (data.total?.F || 1) * 100)}%</td>
                </tr>
                <tr>
                    <td>${locale[prefix].correctStat}</td>
                    <td>${cache.AB.correct}</td>
                    <td>${cache.C.correct}</td>
                    <td>${cache.D.correct}</td>
                    <td>${cache.E.correct}</td>
                    <td>${cache.F.correct}</td>
                </tr>
                <tr>
                    <td>${locale[prefix].wrongStat}</td>
                    <td>${cache.AB.incorrect}</td>
                    <td>${cache.C.incorrect}</td>
                    <td>${cache.D.incorrect}</td>
                    <td>${cache.E.incorrect}</td>
                    <td>${cache.F.incorrect}</td>
                </tr>
                <tr>
                    <td>${locale[prefix].hard}</td>
                    <td><button class="btn-statistics" typeQuestoins="AB"></button></td>
                    <td><button class="btn-statistics" typeQuestoins="C"></button></td>
                    <td><button class="btn-statistics" typeQuestoins="D"></button></td>
                    <td><button class="btn-statistics" typeQuestoins="E"></button></td>
                    <td><button class="btn-statistics" typeQuestoins="F"></button></td>
                </tr>
            </table>
        </div>
        <div class="statistics-bottom">
            <button class="btn btn-remove">${locale[prefix].removeStat}</button>
        </div>
    `;
    contentMain.innerHTML = template;
}

function scrollTo(element) {
    const offsetTop = element.offsetTop;
    window.scroll({
        top: offsetTop, 
        left: 0, 
        behavior: 'smooth'
    });
}

init();