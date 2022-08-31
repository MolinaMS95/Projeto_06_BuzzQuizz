const apiURL = "https://mock-api.driven.com.br/api/v4/buzzquizz/quizzes/10047";
let quizzes;

//Atualmente pega apenas um quiz, o que está na URL
//Mas será modificado pra pegar todos os quizzes no futuro
//Depois faremos outra função para pegar quiz individual.
function getQuizzes(){
    const request = axios.get(apiURL);
    request.then(getQuizzSuccess);
}

function getQuizzSuccess(data){
    quizzes = data.data;
    displayQuizz(quizzes);
}

//Mostra um quizz apenas
function displayQuizz(quizData){
    const quizDiv = document.querySelector(".quiz");
    const questionHolder = quizDiv.querySelector(".question-holder");
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
    for(let i = 0; i<answers.length;i++){
        answerHolder.innerHTML += `
            <li class="answer" id="${i}">
                <img class="answer-image" src="${answers[i].image}" alt="answer illustration">
                <p class="answer-text">${answers[i].text}</p>
            </li>
        `
    }
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