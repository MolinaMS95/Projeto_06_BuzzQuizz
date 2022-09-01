const apiURL = "https://mock-api.driven.com.br/api/v4/buzzquizz/quizzes/";
let quizzes;
let currentQuiz;
let questions = [];
let hits = 0;
let clicks = 0;

const resultBox = document.querySelector('.results');
const buttonsBox = document.querySelector('.buttons');
const quizDisplayList = document.querySelector(".quiz-display-list");
const quizListHolder = document.querySelector(".quiz-list-holder");
const quizDiv = document.querySelector(".quiz");
const questionHolder = quizDiv.querySelector(".question-holder");
const quizHeader = document.querySelector('.quiz-header');

//Atualmente pega apenas um quiz, o que está na URL
//Mas será modificado pra pegar todos os quizzes no futuro
//Depois faremos outra função para pegar quiz individual.
function getQuizzes(){
    const request = axios.get(apiURL);
    request.then(getQuizzSuccess);
}

function getQuizzSuccess(data){
    quizzes = data.data;
    listQuizzes();
}
function listQuizzes(){
    quizDisplayList.innerHTML='';
    for(let i = 0; i<quizzes.length;i++){
        quizDisplayList.innerHTML+=`
            <li
                onclick="getSingleQuiz(this)"
                class="quiz-display" 
                style="background-image: linear-gradient(to bottom, rgba(255, 255, 255, 0) 0%, rgba(255,255,255,0) 50%, rgba(0, 0, 0, 0.904) 100%), url('${quizzes[i].image}')" 
                id="${quizzes[i].id}"
            >
                <p class="quiz-display-title">${quizzes[i].title}</p>
            </li>
        `
    }
}

function getSingleQuiz(element){
    const url = apiURL+element.id;
    const request = axios.get(url);
    request.then(singleQuizRequestSuccess)
}

function singleQuizRequestSuccess(data){
    displayQuiz(data.data);
}

//Mostra um quiz apenas
function displayQuiz(quizData){
    currentQuiz = quizData;
    console.log(quizData);
    quizListHolder.classList.add("hidden");
    quizDiv.classList.remove("hidden");
    questionHolder.innerHTML = '';
    quizHeader.style.backgroundImage = `url("${quizData.image}")`;
    quizHeader.querySelector(".quiz-title").innerHTML = quizData.title;
    for(let i = 0; i<quizData.questions.length;i++){
        displayQuestion(quizData.questions[i], questionHolder, i);
    }
    quizHeader.scrollIntoView();
}

function displayQuestion(data, holder, id){
    let template = `
        <div class="question" id="${id}" >
            <h3 class="question-title" style="background-color:${data.color};">
                ${data.title}
            </h3>
            <ul class="answer-holder">
                
            </ul>
        </div>
    `
    holder.innerHTML+=template;
    displayAnswers(data.answers, id)
}

function displayAnswers(data, id){
    const holder = document.querySelectorAll(".question")[id];
    const answerHolder = holder.querySelector(".answer-holder");
    let answers = data.sort(() => Math.random() - 0.5);
    let feedback = [];
    for(let i = 0; i<answers.length;i++){
        answerHolder.innerHTML += `
            <li class="answer" onclick="selectAnswer(this)">
                <img class="answer-image" src="${answers[i].image}" alt="answer illustration">
                <p class="answer-text">${answers[i].text}</p>
            </li>
        `
        feedback.push(answers[i].isCorrectAnswer);
    }
    questions.push(feedback);
}

function selectAnswer(answer){
    let question = answer.parentNode;
    let clickDisabled = question.classList.contains('answered');
    if(!clickDisabled){
        clicks++;
        let questionNumber = question.parentNode.id;
        let answerText = question.querySelectorAll('.answer-text');
        for (let i = 0; i < question.children.length; i++){
            if(question.children[i]!==answer){
                question.children[i].classList.add('unselectedAnswer');
            }
            if(questions[questionNumber][i] === true){
                answerText[i].classList.add('correct');
            }
            else {
                answerText[i].classList.add('wrong');
            }
        }

        let isCorrectAnswer = answer.querySelector('.answer-text');
        if(isCorrectAnswer.classList.contains('correct')){
            hits++;
        }

        let nextQuestionNumber = Number(questionNumber) + 1;
        let nextQuestion = document.getElementById(`${nextQuestionNumber}`);
        if(nextQuestion !== null){
            setTimeout(scrollNext, 2000, nextQuestion);
        }
        let questionsAmount = document.querySelectorAll('.question').length;
        if (clicks === questionsAmount){
            finishQuizz();
        }
        question.classList.add('answered');
    }
    console.log(clicks);
    console.log(hits);
}

function scrollNext(element){
    element.scrollIntoView();
}

function finishQuizz(){
    const hitPercent = Math.round((hits/clicks)*100);
    buttonsBox.classList.remove('hidden');
    resultBox.classList.remove('hidden');
    let sortedLevels = currentQuiz.levels;
    sortedLevels.sort(function(a, b){return b - a});
    console.log(sortedLevels)
    for(let i = sortedLevels.length; i > 0; i--){
        if(hitPercent >= sortedLevels[i-1].minValue){
            resultBox.innerHTML =
            `<div class="level">
              <p>${hitPercent}% de acerto: ${sortedLevels[i-1].title}</p>
            </div>
            <div class="levelImg">
              <img src="${sortedLevels[i-1].image}" alt="level illustration"/>
            </div>
            <div class="levelText">
              <p>${sortedLevels[i-1].text}</p>
            </div>`;
            break;
        }
    }
    setTimeout(scrollNext, 2000, resultBox);
}

function restart(){
    buttonsBox.classList.add('hidden');
    resultBox.classList.add('hidden');
    clicks = 0;
    hits = 0;
    const answers = document.querySelectorAll('.answer');
    for (let i = 0; i < answers.length; i++){
        answers[i].classList.remove('unselectedAnswer');
        answers[i].parentNode.classList.remove('answered');
        answers[i].lastElementChild.classList.remove('correct');
        answers[i].lastElementChild.classList.remove('wrong');
    }
    quizHeader.scrollIntoView();
}

function goHome(){
    buttonsBox.classList.add('hidden');
    resultBox.classList.add('hidden');
    quizListHolder.classList.remove("hidden");
    quizDiv.classList.add("hidden");
    getQuizzes();
}

window.onload = getQuizzes;