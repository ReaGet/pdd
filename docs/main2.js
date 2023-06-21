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
    finish: "Завершить",
    exam: "Экзамен",
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
    finish: "A termina",
    exam: "Examen",
  },
};
import Timer from "./timer.js";

const content = document.querySelector("#contentMain");
const questionTemplate = document.querySelector("#pddQuestionAsCategory");
const testPagination = document.querySelector(
  "#pddQuestionAsCategory #numQuestion"
);
const examTimerWrapper = questionTemplate.querySelector(".examTimerWrapper");
const testTheme = document.querySelector("[data-action=openLearningMenu]")
  .dataset.category;
let tests = null;
let isExam = false;
let currentTestProgress = {};
let testDone = false;
let statisticsData = {};
let currentCategoryTests = null;
let currentTest = null;
let currentTestTotalCorrect = 0;
let currentTestType = "";
let categories = [
  "Дорожные знаки США",
  // "Примеры тестов CDL",
  "100 популярных вопросов",
  // "Права на мотоцикл",
];

async function init() {
  tests = await fetchData(
    "https://russiandmvtests.com/wp-content/themes/dwt-listing/assets/pdd/rus.tests2.js"
  );
  setCurrentCategoryTests(testTheme);
  statisticsData = getStatisticsData()?.results || {};
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
    .then((res) => res.json())
    .then((data) => data);
}

function setCurrentCategoryTests(name, subCategory) {
  currentCategoryTests = tests[name];
  currentCategoryTests.map((test) => {
    test.test.map((question, index) => {
      question.category = testTheme;
      (question.subCategory = subCategory || ""), (question.title = test.title);
      question.index = index;
      return question;
    });
  });
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
    examTimerWrapper.classList.add("dnone");
    isExam = false;
    if (typeof category === "object") {
      setClickedTabActive(category);
      category = category.dataset.category;
    }
    setCurrentCategoryTests(category);

    let testsItemes = createListOfTestsTitles(currentCategoryTests, category);
    let categoriesItemes = createListOfCategories(categories);
    content.innerHTML = `<div class="categories__inner">${testsItemes}${categoriesItemes}</div>`;
  },
  openCategoryItem(target) {
    let category = target?.dataset.category;
    let testsItemes = createListOfTestsTitles(
      tests[category],
      category,
      category
    );
    setCurrentCategoryTests(category, category);
    content.innerHTML = `<div class="categories__inner">${testsItemes}</div>`;
  },
  startTest(target) {
    currentTestProgress = {};
    const { title, category, subcategory } = target.dataset;
    currentTest = tests[category].find((item) => item.title === title);
    currentTest.category = category;
    if (subcategory) {
      currentTest.subCategory = subcategory;
    }
    currentTestType = "test";
    startTest();
  },
  handleAnswer(target) {
    const answerIndex = target.getAttribute("numberanswer");
    const questionIndex = target.getAttribute("curquestion");
    _handleAnswer(Number(answerIndex), Number(questionIndex - 1));
  },
  nextQuestion() {
    nextQuestion();
  },
  openQuestion(target) {
    const index = Number(target.getAttribute("question-id"));
    updateNavigation(index);
    showCurrentQuestion(index);
  },
  openExamenMenu(target) {
    examTimerWrapper.classList.add("dnone");
    isExam = true;
    setClickedTabActive(target);
    content.innerHTML =
      "<div class='btn btn-start' data-action='startExam'>Начать экзамен</div>";
  },
  startExam() {
    _startExam();
    currentTestType = "exam";
  },
  openStatisticsMenu(target) {
    examTimerWrapper.classList.add("dnone");
    setClickedTabActive(target);
    showStatistics();
  },
  solveMistakes() {
    console.log("mistakes");
    currentTest = getHardTestQuestions();
    if (currentTest.test.length === 0) {
      return;
    }
    currentTestType = "mistakes";
    // console.log(currentTest)
    startTest();
  },
  clearStats() {
    // localStorage.clear();
    localStorage.removeItem(`${testTheme}__statisticsData`);
    statisticsData = {};
    showStatistics();
  },
};

function setClickedTabActive(tab) {
  let tabs = document.querySelectorAll(".elemNavpdd");

  tabs.forEach((element) => {
    element.classList.remove("active");
  });

  tab.classList.add("active");
}

function createListOfTestsTitles(items, category, subCategory) {
  // console.log(statisticsData)
  return items.reduce((markup, test) => {
    const currentQuestion = test.test[0];
    // console.log(currentQuestion);
    const testType = [
      currentQuestion.category,
      currentQuestion.title,
      currentQuestion.subCategory,
    ]
      .filter((item) => item)
      .join(",");
    // console.log(test, statisticsData[testType], testType);
    const testCache = statisticsData[testType];
    let passedClassname = "";
    if (testCache) {
      if (testCache.totalCorrect >= test.threshold) {
        passedClassname = "verno";
      } else {
        passedClassname = "Neverno";
      }
    }
    const { title } = test;
    markup += `
            <div class="bilet ${passedClassname}" data-category="${category}" data-title="${title}" data-subcategory="${subCategory}" data-action="startTest">
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
  currentTestTotalCorrect = 0;
  showCurrentQuestion(1);
  Timer.start();
}

function createPagination() {
  let pagination = "";
  for (let i = 1; i <= currentTest.test.length; i++) {
    pagination += `<div class="btnQuestion ${
      i == 1 ? "active" : ""
    }" question-id="${i}" data-action="openQuestion">${i}</div>`;
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
    buttons.forEach((button) => (button.disabled = true));
  }

  setTimeout(() => {
    imageElement.src =
      currentQuestion.image ||
      "https://russiandmvtests.com/wp-content/themes/dwt-listing/assets/pdd/noimage.png";
  }, 0);

  // if (currentQuestion.image) {
  //     leftBlock.style.display = "block";
  //     imageElement.src = currentQuestion.image || "/src/img/noimage.jpg";
  // } else {
  //     leftBlock.style.display = "none";
  // }

  handleNextButton(index);
  const title = [
    currentQuestion.category,
    currentQuestion.title,
    currentQuestion?.subCategory,
  ].filter((item) => item);

  if (title) {
    // questionText.innerHTML = `
    //     <p>
    //     <strong id="questionNum">${title.join(", ")}</strong>
    //     ${currentQuestion.name}
    //     </p>
    // `;
    questionText.innerHTML = `
            <p>
            ${currentQuestion.name}
            </p>
        `;
  }

  if (!currentTestProgress[index - 1]) {
    return;
  }

  const { currentAnswer } = currentTestProgress[index - 1];
  _handleAnswer(currentAnswer, Number(index - 1));
}

function nextQuestion() {
  const activeNavigationButton = content.querySelector(".btnQuestion.active");
  const navigationButtons = Array.from(
    content.querySelectorAll(".btnQuestion")
  );
  let index = [].indexOf.call(navigationButtons, activeNavigationButton) + 1;

  index = Math.max(1, (index + 1) % (currentTest.test.length + 1));
  let nextIndex = Math.max(1, (index + 1) % (currentTest.test.length + 1));
  let nextQuestion = navigationButtons[index - 1];
  while (
    nextQuestion.classList.contains("verno") ||
    nextQuestion.classList.contains("Neverno")
  ) {
    index = Math.max(1, (index + 1) % (currentTest.test.length + 1));
    nextQuestion = navigationButtons[index - 1];
    if (nextQuestion.classList.contains("active")) {
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
  const currentNavigation = content.querySelectorAll(".btnQuestion");
  const currentNavigationButton = content.querySelector(
    `.btnQuestion[question-id="${index}"]`
  );
  currentNavigation.forEach((item) => item.classList.remove("active"));
  currentNavigationButton.classList.add("active");
}

function handleNextButton(index) {
  const nextQuestionElement = content.querySelector(".btn-next");
  nextQuestionElement.setAttribute("nextQuestion", index + 1);
  if (testDone) {
    nextQuestionElement.innerHTML = locale[prefix].finish;
  }
}

function _handleAnswer(answerIndex, questionIndex) {
  const currentNavigation = content.querySelectorAll(".btnQuestion");
  const currentQuestion = currentTest.test[questionIndex];
  const buttons = content.querySelectorAll("#otvety button");
  // const testType = `${currentQuestion.category}, ${currentQuestion.title}`;
  const testType = [
    currentQuestion.category,
    currentQuestion.title,
    currentQuestion.subCategory,
  ]
    .filter((item) => item)
    .join(",");
  // console.log(currentTest, currentQuestion, testType)

  if (!statisticsData[testType]) {
    statisticsData[testType] = {};
  }
  if (!statisticsData[testType][currentQuestion.index]) {
    statisticsData[testType][currentQuestion.index] = {
      correct: 0,
      incorrect: 0,
      done: false,
    };
  }

  const correctAnswerIndex = currentQuestion.buttons.findIndex((button) => {
    return button.seccess;
  });

  buttons.forEach((button) => (button.disabled = true));

  if (answerIndex === correctAnswerIndex) {
    buttons.item(correctAnswerIndex).classList.add("verno");
    currentNavigation.item(questionIndex).classList.add("verno");
    statisticsData[testType][currentQuestion.index].correct++;
    statisticsData[testType][currentQuestion.index].done = true;
    currentTestTotalCorrect++;
  } else {
    buttons.item(answerIndex).classList.add("Neverno");
    buttons.item(correctAnswerIndex).classList.add("verno");
    currentNavigation.item(questionIndex).classList.add("Neverno");
    statisticsData[testType][currentQuestion.index].incorrect++;
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

  statisticsData[testType].totalCorrect = currentTestTotalCorrect;

  handleNextButton(questionIndex + 1);

  saveStatistics();
}

function showResult() {
  const currentQuestion = currentTest.test[0];
  const testType = [
    currentQuestion.category,
    currentQuestion.title,
    currentQuestion.subCategory,
  ]
    .filter((item) => item)
    .join(",");

  Timer.stop();

  const results = calculateResult();
  let testPassed = false;
  if (results.correct >= currentTest.threshold) {
    testPassed = true;
  }
  const time = isExam ? Timer.getRemainingTime() : Timer.getTime();
  const title = [currentTest.category].filter((item) => item !== "undefined");

  // statisticsData[testType].totalCorrect = results.correct;
  // saveStatistics();
  let hiddenClass = "";
  if (currentTestType === "mistakes") {
    hiddenClass = "hidden";
  }

  const template = `
        <table class="table">
            <tr>
                <td>${locale[prefix].category}</td>
                <td>${locale[prefix].correct}</td>
                <td>${locale[prefix].wrong}</td>
                <td>${locale[prefix].time}</td>
            </tr>
            <tr>
                <td>${title.join(", ")}</td>
                <td><span class="verno">${results.correct}</span></td>
                <td><span class="Neverno">${results.incorrect}</span></td>
                <td>${time}</td>
            </tr>
        </table>
        <div class="${hiddenClass}" style="width: 100%; padding: 20px 0; text-align: center; font-weight: bold;">
            ${testPassed ? "Вы прошли тест" : "Вы не прошли тест"}
        </div>
    `;
  contentMain.innerHTML = template;
}

function calculateResult() {
  let correct = 0;
  let incorrect = 0;
  for (let key in currentTestProgress) {
    const item = currentTestProgress[key];
    if (item.currentAnswer === item.correctAnswer) {
      correct++;
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
  // console.log(2, data);
  if (!data) return {};

  return {
    results: JSON.parse(data),
    total: currentCategoryTests.reduce((c, item) => (c += item.test.length), 0),
  };
}

function saveStatistics() {
  const data = JSON.stringify(statisticsData);
  localStorage.setItem(`${testTheme}__statisticsData`, data);
}

function showStatistics() {
  const stats = getStatisticsData(),
    data = stats?.results || {},
    total = stats?.total || 1;
  // console.log(data, total);
  // console.log(data, total);
  const cache = {
    correct: 0,
    incorrect: 0,
    done: 0,
  };
  // console.log(stats);
  for (let i in data) {
    for (let j in data[i]) {
      console.log(data[i][j].correct);
      cache.correct += data[i][j].correct > 0 ? data[i][j].correct : 0;
      cache.incorrect += data[i][j].incorrect > 0 ? data[i][j].incorrect : 0;
      cache.done += data[i][j].done ? 1 : 0;
    }
  }

  // console.log(cache);

  const template = `
        <div class="table-statistics__wrapper">
            <table class="table table-statistics">
                <tr>
                    <td>${locale[prefix].category}</td>
                    <td style="width: 50%">${testTheme}</td>
                </tr>
                <tr>
                    <td>${locale[prefix].passedStat}</td>
                    <td style="width: 50%">${Math.round(
                      (cache.done / (total || 1)) * 100
                    )}%</td>
                </tr>
                <tr>
                    <td>${locale[prefix].correctStat}</td>
                    <td style="width: 50%">${cache.correct}</td>
                </tr>
                <tr>
                    <td>${locale[prefix].wrongStat}</td>
                    <td style="width: 50%">${cache.incorrect}</td>
                </tr>
                <tr>
                    <td>${locale[prefix].hard}</td>
                    <td style="width: 50%"><button class="btn-statistics" data-action="solveMistakes"></button></td>
                </tr>
            </table>
        </div>
        <div class="statistics-bottom">
            <button class="btn btn-remove" data-action="clearStats">${
              locale[prefix].removeStat
            }</button>
        </div>
    `;
  contentMain.innerHTML = template;
}

function getHardTestQuestions() {
  let questionsArray = [];
  currentTestProgress = {};
  let _category = "";

  for (let key in statisticsData) {
    const [category, testName, subCategory] = key.split(",");
    _category = category;
    // console.log(category, testName);
    for (let index in statisticsData[key]) {
      if (isNaN(Number(index))) {
        continue;
      }
      // console.log(statisticsData[key][index], statisticsData[key][index].done);
      if (!statisticsData[key][index].done) {
        // console.log(statisticsData[key][index])
        // console.log(tests, currentCategoryTests)
        let test = tests[category].find((item) => item.title === testName);
        // console.log(category,2, subCategory, test);
        if (!test) {
          test = tests[subCategory].find((item) => item.title === testName);
        }
        const question = test.test[index];
        question.index = index;
        question.category = category;
        if (subCategory) {
          question.subCategory = subCategory;
        }
        questionsArray.push(question);
        // console.log(222222, key, index, question);
      }
    }
  }

  return {
    test: questionsArray,
    category: _category,
    threshold: Math.round(questionsArray.length * 0.8),
    title: "",
  };
}

function _startExam() {
  const examLong = 50;
  const questionsCount = 40;

  currentTestProgress = {};
  currentTest = [];
  const examTest = {
    category: locale[prefix].exam,
    test: [],
    title: "",
  };

  // console.log(currentCategoryTests);

  // questionsArray = currentCategoryTests.filter((test, i) => {
  //     let key = Object.keys(test).at(0);
  //     return key.match(/[a-z]+/i).at(0) == type;
  // });

  for (let i = 0; i < questionsCount; i++) {
    const cats = [...categories, testTheme];
    const catIndex = random(cats.length);
    const _test = tests[cats[catIndex]];
    const typeIndex = random(_test.length);
    // console.log(_test, 123123);
    const test = _test[typeIndex];
    // console.log(test);
    const questions = test.test;
    const questionIndex = random(questions.length);
    let question = questions[questionIndex];
    // console.log(question);

    question.index = questionIndex;
    question.category = testTheme;
    if (cats[catIndex] !== testTheme) {
      question.subCategory = cats[catIndex];
    }
    examTest.test.push(question);
  }

  currentTest = examTest;
  examTimerWrapper.classList.remove("dnone");
  startTest();
  Timer.startCountdown(
    0,
    examLong,
    0,
    contentMain.querySelector(".examTimerWrapper .timer")
  );
  Timer.bindToTimeout(function () {
    contentMain
      .querySelector(".examTimerWrapper .timer")
      .classList.add("Neverno");
    const buttons = contentMain.querySelectorAll("#otvety button");
    buttons.forEach((button) => (button.disabled = true));
    testDone = true;
    handleNextButton(0);
  });
}

function scrollTo(element) {
  const offsetTop = element.offsetTop;
  window.scroll({
    top: offsetTop,
    left: 0,
    behavior: "smooth",
  });
}

function random(number) {
  return Math.floor(Math.random() * number);
}

init();
