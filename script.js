const apiURL = "https://mock-api.driven.com.br/api/v4/buzzquizz/quizzes/";
let quizzes;
let currentQuiz;
let questions = [];
let hits = 0;
let clicks = 0;
let levels = 0;
let userQuizz = {title: undefined, image: undefined, questions: undefined, levels:undefined};
let personalQuizzesID = [];
let personalQuizzesData = [];

const resultBox = document.querySelector('.results');
const buttonsBox = document.querySelector('.buttons');
const quizDisplayList = document.querySelector(".quiz-display-list");
const homeDiv = document.querySelector(".home");
const quizDiv = document.querySelector(".quiz");
const questionHolder = quizDiv.querySelector(".question-holder");
const quizHeader = document.querySelector('.quiz-header');
const quizzCreation = document.querySelector(".quizz-creation");
const personalQuizDiv =  document.querySelector(".personal-quiz");
const createQuizDiv =  document.querySelector(".create-quiz");

const isValidUrl = urlString=> {
    try { 
        return Boolean(new URL(urlString)); 
    }
    catch(e){ 
        return false; 
    }
}

function getQuizzes(){
    const request = axios.get(apiURL);
    request.then(getQuizzSuccess);
}
function getQuizzSuccess(data){
    quizzes = data.data;
    getPersonalQuizData();
}
function getPersonalQuizData(){
    personalQuizzesData.length = 0;
    const listaSerializada = localStorage.getItem("myQuizzes"); 
    personalQuizzesID = JSON.parse(listaSerializada);
    if(personalQuizzesID.length>0){
        for(let i = 0;i<personalQuizzesID.length;i++){
            const request = axios.get(apiURL+personalQuizzesID[i]);
            request.then(pushPersonalQuiz);
        }
    }else{
        listQuizzes();
    }
}
function pushPersonalQuiz(data){
    personalQuizzesData.push(data.data);
    if(personalQuizzesData.length === personalQuizzesID.length){
        listQuizzes();
    }
    console.log(personalQuizzesData);
}

function listQuizzes(){
    createQuizDiv.classList.remove("hidden");
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
    if(personalQuizzesData.length>0){
        createQuizDiv.classList.add("hidden");
        personalQuizDiv.classList.remove("hidden");
        const list = personalQuizDiv.querySelector(".personal-quiz-list");
        list.innerHTML = '';
        for(let i = 0; i<personalQuizzesData.length;i++){
            list.innerHTML+=`
                <li
                    onclick="getSingleQuiz(this)"
                    class="quiz-display" 
                    style="background-image: linear-gradient(to bottom, rgba(255, 255, 255, 0) 0%, rgba(255,255,255,0) 50%, rgba(0, 0, 0, 0.904) 100%), url('${personalQuizzesData[i].image}')" 
                    id="${personalQuizzesData[i].id}"
                >
                    <p class="quiz-display-title">${personalQuizzesData[i].title}</p>
                </li>
            `
        }
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
    homeDiv.classList.add("hidden");
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
                question.children[i].classList.add('unselected-answer');
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
            <div class="level-img">
              <img src="${sortedLevels[i-1].image}" alt="level illustration"/>
            </div>
            <div class="level-text">
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
        answers[i].classList.remove('unselected-answer');
        answers[i].parentNode.classList.remove('answered');
        answers[i].lastElementChild.classList.remove('correct');
        answers[i].lastElementChild.classList.remove('wrong');
    }
    quizHeader.scrollIntoView();
}
 
function goHome(){
    buttonsBox.classList.add('hidden');
    resultBox.classList.add('hidden');
    homeDiv.classList.remove("hidden");
    quizDiv.classList.add("hidden");
    getQuizzes();
}
function goHome2(){
    document.querySelector(".quizz-created").classList.add("hidden");
    quizzCreation.classList.add("hidden");
    document.querySelector(".home").classList.remove("hidden");
    getQuizzes();

}

function expand(item){
    const question = item.parentNode;
    question.querySelector('.container').classList.toggle('hidden');
    const att = item.getAttribute('name');
    switch(att){
        case 'create-outline':
            item.setAttribute('name', 'remove');
            break;
        default:
            item.setAttribute('name', 'create-outline');
            break;

    }
}
function createQuizStart(){
    homeDiv.classList.add("hidden");
    quizzCreation.querySelector(".quizz-questions").classList.add("hidden");
    quizzCreation.querySelector(".quizz-levels").classList.add("hidden");
    quizzCreation.querySelector(".quizz-created").classList.add("hidden");
    quizzCreation.classList.remove("hidden");
    quizzCreation.querySelector(".basic-info").classList.remove("hidden");
}

function infoValidation(){
    const title = document.querySelector(".create-title").value;
    const titleVerification = 19 < title.length && title.length < 66;
    if(!titleVerification){
        alert("Título deve ter entre 20 e 65 caracteres");
    }
    const url = document.querySelector(".img-URL").value;
    const urlVerification = isValidUrl(url);
    if(!urlVerification){
        alert("Sua URL de imagem deve ter um formato válido");
    }
    const questions = document.querySelector(".questions-amount").value;
    const questionsVerification = 2 < questions;
    if(!questionsVerification){
        alert("Deve ter pelo menos 3 perguntas");
    }
    levels = document.querySelector(".levels-amount").value;
    const levelsVerification = 1 < levels;
    if(!levelsVerification){
        alert("Deve ter pelo menos 2 níveis");
    }
    if(titleVerification && urlVerification && questionsVerification && levelsVerification){
        userQuizz.title = title;
        userQuizz.image = url;
        createQuestions(questions);
    }
}

function createQuestions(questions){
    let questionsNumber = questions;
    document.querySelector('.basic-info').classList.add('hidden');
    const questionCreator = document.querySelector('.quizz-questions');
    questionCreator.classList.remove('hidden');
    questionCreator.innerHTML = 
    `<div class="top-text">
        <p>Crie suas perguntas</p>
    </div>`;
    for(let i = 0; i < questionsNumber; i++){
        if((i+1)==questionsNumber){
            questionCreator.innerHTML +=
            `<div class="create-question n${i+1}">
                <p>Pergunta ${i+1}</p>
                <ion-icon onclick="expand(this)" name="create-outline"></ion-icon>
                <div class="container hidden">
                    <div class="question-info">
                        <input class="create-text" placeholder="Texto da pergunta"/>
                        <input type="color" class="create-color" placeholder="Cor de fundo da pergunta"/>
                    </div>
                    <p>Resposta correta</p>
                    <div class="correct-answer">
                        <input class="create-answer" placeholder="Reposta correta"/>
                        <input type="url" class="create-answer-URL" placeholder="URL da imagem"/>
                    </div>
                    <div class="wrong-answers">
                        <p>Respostas incorretas</p>
                        <div class="option1">
                            <input class="create-answer" placeholder="Reposta incorreta 1"/>
                            <input type="url" class="create-answer-URL" placeholder="URL da imagem 1"/>
                        </div>

                        <div class="option2">
                            <input class="create-answer" placeholder="Reposta incorreta 2"/>
                            <input type="url" class="create-answer-URL" placeholder="URL da imagem 2"/>
                        </div>

                        <div class="option3">
                            <input class="create-answer" placeholder="Reposta incorreta 3"/>
                            <input type="url" class="create-answer-URL" placeholder="URL da imagem 3"/>
                        </div>
                    </div>
                </div>
            </div>
            <div class="button-area">
                <button class="next-step" onclick="questionValidation()">Prosseguir pra criar níveis</button>
            </div>`
        }
        else{
            questionCreator.innerHTML +=
            `<div class="create-question n${i+1}">
                <p>Pergunta ${i+1}</p>
                <ion-icon onclick="expand(this)" name="create-outline"></ion-icon>
                <div class="container hidden">
                    <div class="question-info">
                        <input class="create-text" placeholder="Texto da pergunta"/>
                        <input type="color" class="create-color" placeholder="Cor de fundo da pergunta"/>
                    </div>
                    <p>Resposta correta</p>
                    <div class="correct-answer">
                        <input class="create-answer" placeholder="Reposta correta"/>
                        <input type="url" class="create-answer-URL" placeholder="URL da imagem"/>
                    </div>
                    <div class="wrong-answers">
                        <p>Respostas incorretas</p>
                        <div class="option1">
                            <input class="create-answer" placeholder="Reposta incorreta 1"/>
                            <input type="url" class="create-answer-URL" placeholder="URL da imagem 1"/>
                        </div>
    
                        <div class="option2">
                            <input class="create-answer" placeholder="Reposta incorreta 2"/>
                            <input type="url" class="create-answer-URL" placeholder="URL da imagem 2"/>
                        </div>
    
                        <div class="option3">
                            <input class="create-answer" placeholder="Reposta incorreta 3"/>
                            <input type="url" class="create-answer-URL" placeholder="URL da imagem 3"/>
                        </div>
                    </div>
                </div>
            </div>`
        }
    }
}
function collapseToggle(element){
    element.parentElement.querySelector(".level-info").toggle("hidden");
}
function createLevels(){
    document.querySelector('.quizz-questions').classList.add('hidden');
    document.querySelector(".quizz-levels").classList.remove("hidden");
    const levelHolder = document.querySelector(".level-holder");
    for(let i = 0;i<levels;i++){
        if(i===0){
            levelHolder.innerHTML +=`
            <div class="create-level">
                <p>Nível ${i+1} </p>
                <ion-icon onclick="expand(this)" name="create-outline"></ion-icon>
                <div class="container hidden">
                    <input class="create-level-title" placeholder="Título do nível"/>
                    <input value="0" type="number" class="create-treshold" disabled/>
                    <input type="url" class="create-level-URL" placeholder="URL da imagem do nível"/>
                    <textarea class="create-level-description" placeholder="Descrição do nível"></textarea>
                </div>
            </div>
        `
        }else{
            levelHolder.innerHTML +=`
                <div class="create-level">
                    <p>Nível ${i+1} </p>
                    <ion-icon onclick="expand(this)" name="create-outline"></ion-icon>
                    <div class="container hidden">
                        <input class="create-level-title" placeholder="Título do nível"/>
                        <input type="number" class="create-treshold" placeholder="% de acerto mínima"/>
                        <input type="url" class="create-level-URL" placeholder="URL da imagem do nível"/>
                        <textarea class="create-level-description" placeholder="Descrição do nível"></textarea>
                    </div>
                </div>
            `
        }
       
        
    }
}
function levelValidation(){
    const inputs = document.querySelectorAll(".create-level");
    let failed = false;
    const array = [];
    for(let i = 0;i<inputs.length;i++){
        const template = {};
        const fields = inputs[i].querySelector(".container").children;
        console.log(inputs[i].querySelector(".container"));
        if(fields[0].value.length<8){
            failed = true;
        }
        if(!isValidUrl(fields[2].value)){
            failed = true;
        }
        if(fields[3].value.length<28){
            failed = true;  
        }
        if(!failed){
            template.title = fields[0].value;
            template.minValue = fields[1].value;
            template.text = fields[3].value;
            template.image = new URL(fields[2].value);
            array.push(template);
        }
    }
    if(failed){
        alert("deu ruim aí maluco");
    }else{
        userQuizz.levels = array;
        console.log(userQuizz.levels);
        saveQuizz();
    }
}

function questionValidation(){
    const questionsTexts = document.querySelectorAll(".create-text");
    const questionsColors = document.querySelectorAll(".create-color");
    const questions = [];
    for (let i = 0; i < questionsTexts.length; i++){
        let textSizes = questionsTexts[i].value;
        let colors = questionsColors[i].value;
        if(!(textSizes.length < 20)){
            questions[i] = {title: textSizes, color: colors, answers: []};
        }
        else{
            alert("A pergunta deve ter mais que 19 caracteres!");
            return;
        }
    }
    userQuizz.questions = questions;
    answersValidation();
}

function answersValidation(){
    const questionContainer = document.querySelectorAll(".create-question");
    let containRightAnswer = false;
    for (let i = 0; i < questionContainer.length; i++){
        const allAnswers = questionContainer[i].querySelectorAll(".create-answer");
        const allImgs = questionContainer[i].querySelectorAll(".create-answer-URL");
        for (let n = 0; n < allAnswers.length; n++){
            let answerText = allAnswers[n].value;
            let answerTextVerification = (answerText != "");
            let answerImg = allImgs[n].value;
            let answerImgVerification = isValidUrl(answerImg);
            if(answerTextVerification && (!answerImgVerification)){
                alert('Sua URL de imagem deve ter um formato válido');
                return;
            }
            else if(answerTextVerification && answerImgVerification){
                if(allAnswers[n].parentNode.classList.contains("correct-answer")){
                    userQuizz.questions[i].answers[n] = {text: answerText, image: answerImg, isCorrectAnswer: true};
                    containRightAnswer = true;
                }
                else{
                    userQuizz.questions[i].answers[n] = {text: answerText, image: answerImg, isCorrectAnswer: false};
                }
            }
        }
        if (userQuizz.questions[i].answers.length < 2 || (!containRightAnswer)){
            alert("Você deve inserir a resposta certa e pelo menos uma errada!");
            return;
        }
        containRightAnswer = false;
    }
    createLevels();
}

function saveQuizz(){
    const promise = axios.post('https://mock-api.driven.com.br/api/v4/buzzquizz/quizzes', userQuizz);
    promise.then(quizzSavedSuccesfully);
    promise.catch(errorSaving);
}

function quizzSavedSuccesfully(data){
    const quizz = data.data;
    const quizzID = quizz.id;
    personalQuizzesID.push(quizzID);
    const serializedQuizzes = JSON.stringify(personalQuizzesID);
    localStorage.setItem("myQuizzes", serializedQuizzes);
    document.querySelector(".quizz-levels").classList.add("hidden");
    const created = document.querySelector(".quizz-created");
    created.classList.remove("hidden");
    created.querySelector(".access-quiz").id = quizz.id;
}


window.onload = getQuizzes;