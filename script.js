const apiURL = "https://mock-api.driven.com.br/api/v4/buzzquizz/quizzes/";
let quizzes;
let questions = [];
let hits = 0;

//Atualmente pega apenas um quiz, o que está na URL
//Mas será modificado pra pegar todos os quizzes no futuro
//Depois faremos outra função para pegar quiz individual.
function getQuizzes(){
    const request = axios.get(apiURL);
    request.then(getQuizzSuccess);
}

function getQuizzSuccess(data){
    quizzes = data.data;
    /*displayQuiz(quizzes[0]); */
    listQuizzes();
}
function listQuizzes(){
    const holder = document.querySelector(".quiz-display-list");
    holder.innerHTML='';
    for(let i = 0; i<quizzes.length;i++){
        holder.innerHTML+=`
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
    document.querySelector(".quiz-list-holder").classList.add("hidden");
    const quizDiv = document.querySelector(".quiz");
    const questionHolder = quizDiv.querySelector(".question-holder");
    quizDiv.classList.remove("hidden");
    questionHolder.innerHTML = '';
    quizDiv.querySelector(".quiz-header").style.backgroundImage = `url("${quizData.image}")`;
    quizDiv.querySelector(".quiz-title").innerHTML = quizData.title;
    for(let i = 0; i<quizData.questions.length;i++){
        displayQuestion(quizData.questions[i], questionHolder, i);
    }
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
    let answers = shuffle(data);
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

//Peguei do StackOverflow
function shuffle(originalArray) {
    //Slice 0 serve pra tirar uma cópia do array e não alterar o array original
    let array = originalArray.slice(0);
    let currentIndex = array.length,  randomIndex;
    // While there remain elements to shuffle.
    while (currentIndex != 0) {
      // Pick a remaining element.
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;
      // And swap it with the current element.
      [array[currentIndex], array[randomIndex]] = [
        array[randomIndex], array[currentIndex]];
    }
    return array;
  }

window.onload = getQuizzes;

function selectAnswer(answer){
    let question = answer.parentNode;
    let questionNumber = question.parentNode.id;
    let answerText = question.querySelectorAll('.answer-text');
    for (let i = 0; i < question.children.length; i++){
        if(question.children[i]!==answer){
            question.children[i].classList.add('unselectedAnswer');
            question.children[i].onclick = null;
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
    console.log(hits);
    let nextQuestionNumber = Number(questionNumber) + 1;
    let nextQuestion = document.getElementById(`${nextQuestionNumber}`);
    if(nextQuestion !== null){
        setTimeout(scrollNext, 2000, nextQuestion);
    }

}

function scrollNext(element){
    element.scrollIntoView();
}