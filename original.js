import {
  arrQuestVars,
  questionsALLJSON
} from './tests.js';

// // ждем, когда страница загрузится. только потом включается скрипт
// // document.addEventListener('DOMContentLoaded', function(){
// // 1. актив на меню
// //берем 3 верхние меню
let pddMenu = document.querySelectorAll('.elemNavpdd');
// // вставляем первый выбор вопросов 
contentMain.innerHTML = menuQuestions.innerHTML;
// функция при нажатии
function menuActive(paddMenuelem) {
    // перебираем и меняем класс на неактив у всех
    for (i = 0; i < pddMenu.length; i++) {
        pddMenu[i].className = 'elemNavpdd';
    }
    // включаем нужному актив
    paddMenuelem.className = 'elemNavpdd active';
    // получаем атрибут для контента
    let contentName = paddMenuelem.getAttribute('contenthtml');

    // если экзамен, начать экзамен
    if (contentName == "examen") {
        //старт экзамена
        contentMain.innerHTML = 'экзамен';
    } else {
        // текст в переменную
        let contentHtml = eval(contentName);
        // получаем нужный код для вставки
        contentHtml = contentHtml.innerHTML;
        // сама вставка
        contentMain.innerHTML = contentHtml;
    }

}
// 2. Активация по категории вопроса выбор битела
function activeQuestios(typeQuestoins) {
    let biletType = typeQuestoins.getAttribute('typeQuestoins');
    biletNums.innerHTML = '';
    for (let i = 1; i < 36; i++) {
        biletNums.innerHTML += '<div class="bilet" biletType = ' + biletType + ' biletNum = ' + i + '><h3>' + i + '</h3></div>';
    }
    console.log(biletType);
    contentMain.innerHTML = billets.innerHTML;
}

// активация билета
function biletActivation(biletik) {
    // берем тип билета
    let biletType = biletik.getAttribute('biletType');
    // берем номер билета
    let biletNum = biletik.getAttribute('biletNum');
    let biletID = biletType + biletNum;
    let questionsArray;
    for (let i = 0; i < arrQuestVars.length; i++) {
        if (biletID == arrQuestVars[i]) {
            questionsArray = questionsALLJSON[i][biletID];
        }
    }
    console.log(questionsArray);
    localStorage.setItem('questionsArray', JSON.stringify(questionsArray));
    showQuestions(questionsArray);
    //JSON.parse(localStorage.getItem("questionsArray"));
}

// включение вопросов
function showQuestions(questionsArray) {
    numQuestion.innerHTML = '';
    for (let i = 1; i <= questionsArray.length; i++) {
        numQuestion.innerHTML += '<div class="btnQuestion" onclick="showCurQuestion(' + i + ');">' + i + '</div>';
    }
    showCurQuestion(1);
    contentMain.innerHTML = pddQuestionAsCategory.innerHTML;
}

function showCurQuestion(CurQuestion) {
    CurQuestion = CurQuestion - 1;
    let allQuestions = JSON.parse(localStorage.getItem("questionsArray"));
    otvety.innerHTML = '';
    for (let i = 0; i < allQuestions[CurQuestion].buttons.length; i++) {
        otvety.innerHTML += '<button numberAnswer="' + i + '" CurQuestion = "' + CurQuestion + '" type="button" class="btn btn-default">' + allQuestions[CurQuestion].buttons[i].text + '</button>';
    }
    console.log(allQuestions[CurQuestion].buttons);
}

document.addEventListener('click', (event) => {
    if (event.target.classList.contains('pddCategory')) {
        activeQuestios(event.target);
    }
    if (event.target.classList.contains('bilet')) {
        biletActivation(event.target);
    }
    if (event.target.classList.contains('btn')) {
        proverkaAnswer(event.target);
    }
}, false);

// проверка ответа
function proverkaAnswer(newAnswer) {
    let allQuestions = JSON.parse(localStorage.getItem("questionsArray"));
    let numberAnswer = newAnswer.getAttribute('numberAnswer');
    let CurQuestion = newAnswer.getAttribute('CurQuestion');
    let allButtons = document.querySelectorAll('.btn-default');
    if (allQuestions[CurQuestion].answered !== 'true') {
        if (allQuestions[CurQuestion].buttons[numberAnswer].seccess == true) {
            newAnswer.className += ' verno';
            console.log(newAnswer.getAttribute('numberAnswer'));
        } else {
            newAnswer.className += ' Neverno';
        }
    }
    comment.className = 'dblock';
    comment.innerHTML = allQuestions[CurQuestion].comment;
    allQuestions[CurQuestion].answered = true;
    for (i = 0; i < allButtons.length; i++) {
        allButtons[i].disabled = '""';
    }
    localStorage.setItem('questionsArray', JSON.stringify(allQuestions));

}
// 2. актив номер вопроса
let btnQuestion = document.querySelectorAll('.btnQuestion');

function btnQuestionActive(biletik) {
    for (i = 0; i < btnQuestion.length; i++) {
        btnQuestion[i].className = 'btnQuestion';
    }
    btnQuestion.className = 'btnQuestion active';
}
// });