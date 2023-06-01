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
let currentQuestionId = null;
let testDone = false;
let currentCategoryTests = null;
let currentTest = null;
let categories = [
    "Дорожные знаки США",
    "Примеры тестов CDL",
    "100 популярных вопросов",
    "Права на мотоцикл",
];

async function init() {
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
        content.innerHTML = "Statistics";
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
    currentQuestionId = currentQuestion.type;
    
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
    console.log(answerIndex, questionIndex);
    const currentNavigation = content.querySelectorAll('.btnQuestion');
    const currentQuestion = currentTest.test[questionIndex];
    const buttons = content.querySelectorAll('#otvety button');
    const testType = currentQuestion.type;

    // if (!statisticsData[testType]) {
    //     statisticsData[testType] = {};
    // }
    // if (!statisticsData[testType][currentQuestion.index]) {
    //     statisticsData[testType][currentQuestion.index] = {
    //         correct: 0,
    //         incorrect: 0,
    //         done: false,
    //     }
    // }

    const correctAnswerIndex = currentQuestion.buttons.findIndex((button) => {
        return button.seccess;
    });

    buttons.forEach((button) => button.disabled = true);
    
    if (answerIndex === correctAnswerIndex) {
        buttons.item(correctAnswerIndex).classList.add('verno');
        currentNavigation.item(questionIndex).classList.add('verno');
        // statisticsData[testType][currentQuestion.index].correct++;
        // statisticsData[testType][currentQuestion.index].done = true;
    } else {
        buttons.item(answerIndex).classList.add('Neverno');
        buttons.item(correctAnswerIndex).classList.add('verno');
        currentNavigation.item(questionIndex).classList.add('Neverno');
        // statisticsData[testType][currentQuestion.index].incorrect++;
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

    // saveStatistics();
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
                <td>${currentQuestionId}</td>
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

function scrollTo(element) {
    const offsetTop = element.offsetTop;
    window.scroll({
        top: offsetTop, 
        left: 0, 
        behavior: 'smooth'
    });
}

init();