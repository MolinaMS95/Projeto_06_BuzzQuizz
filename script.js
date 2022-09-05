const apiURL = "https://mock-api.driven.com.br/api/v4/buzzquizz/quizzes/";
let quizzes;
let currentQuiz;
let questions = [];
let hits = 0;
let clicks = 0;
let levels = 0;
let userQuizz = {title: undefined, image: undefined, questions: undefined, levels:undefined};
let personalQuizzesID = [];
let personalQuizzesKey = [];
let personalQuizzesData = [];
let position;
let quizToEdit = {};
let editOrErase = false;
let edit = false;

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
    document.querySelector('.loading-page').classList.remove('hidden');
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
    const secretKeys = localStorage.getItem("myKeys");
    if(JSON.parse(secretKeys)!=null){
        personalQuizzesKey = JSON.parse(secretKeys);
    }
    if(JSON.parse(listaSerializada)!=null){
        personalQuizzesID = JSON.parse(listaSerializada);
    }
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
}

function listQuizzes(){
    document.querySelector('.loading-page').classList.add('hidden');
    document.querySelector('.home').classList.remove('hidden');
    createQuizDiv.classList.remove("hidden");
    quizDisplayList.innerHTML='';
    for(let i = 0; i<quizzes.length;i++){
        quizDisplayList.innerHTML+=`
            <li
                onclick="getSingleQuiz(this)"
                class="quiz-display" 
                style="background-image: linear-gradient(to bottom, rgba(255, 255, 255, 0) 0%, rgba(255,255,255,0) 50%, rgba(0, 0, 0, 0.904) 100%), url('${quizzes[i].image}')" 
                id="${quizzes[i].id}"
                data-identifier="quizz-card"
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
                    data-identifier="quizz-card"
                >
                    <p class="quiz-display-title">${personalQuizzesData[i].title}</p>
                    <div class="icons">
                        <ion-icon onclick="editQuiz(this)" name="create-outline"></ion-icon>
                        <ion-icon onclick="deleteQuiz(this)" name="trash-outline"></ion-icon>
                    </div>
                </li>
            `
        }
    }
}

function getSingleQuiz(element){
    if(editOrErase){
        return;
    }
    else{
        homeDiv.classList.add("hidden");
        document.querySelector('.loading-page').classList.remove('hidden');
        const url = apiURL+element.id;
        const request = axios.get(url);
        request.then(singleQuizRequestSuccess);
        document.querySelector(".quizz-creation").classList.add('hidden');
        document.querySelector(".quizz-created").classList.add('hidden');
    }
}

function singleQuizRequestSuccess(data){
    displayQuiz(data.data);
}

function displayQuiz(quizData){
    currentQuiz = quizData;
    questionHolder.innerHTML = '';
    quizHeader.style.backgroundImage = `url("${quizData.image}")`;
    quizHeader.querySelector(".quiz-title").innerHTML = quizData.title;
    for(let i = 0; i<quizData.questions.length;i++){
        displayQuestion(quizData.questions[i], questionHolder, i);
    }
    document.querySelector('.loading-page').classList.add('hidden');
    quizDiv.classList.remove("hidden");
    window.scrollTo(0,0);
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
    window.scrollTo(0,0);
}
 
function goHome(){
    buttonsBox.classList.add('hidden');
    resultBox.classList.add('hidden');
    quizDiv.classList.add("hidden");
    questions = [];
    clicks = 0;
    hits = 0;
    window.scrollTo(0,0);
    getQuizzes();
}
function goHome2(){
    document.querySelector(".quizz-created").classList.add("hidden");
    quizzCreation.classList.add("hidden");
    window.scrollTo(0,0);
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
        document.querySelector(".create-title").nextElementSibling.innerHTML = "Título deve ter entre 20 e 65 caracteres";
        document.querySelector(".create-title").style = "background: #FFE9E9";
    }
    else {
        document.querySelector(".create-title").nextElementSibling.innerHTML = "";
        document.querySelector(".create-title").style = "background: #FFFFFF";
    }
    const url = document.querySelector(".img-URL").value;
    const urlVerification = isValidUrl(url);
    if(!urlVerification){
        document.querySelector(".img-URL").nextElementSibling.innerHTML ="Sua URL de imagem deve ter um formato válido";
        document.querySelector(".img-URL").style = "background: #FFE9E9";
    }
    else {
        document.querySelector(".img-URL").nextElementSibling.innerHTML = "";
        document.querySelector(".img-URL").style = "background: #FFFFFF";
    }
    const questions = document.querySelector(".questions-amount").value;
    const questionsVerification = 2 < questions;
    if(!questionsVerification){
        document.querySelector(".questions-amount").nextElementSibling.innerHTML ="Deve ter pelo menos 3 perguntas";
        document.querySelector(".questions-amount").style = "background: #FFE9E9";
    }
    else {
        document.querySelector(".questions-amount").nextElementSibling.innerHTML = "";
        document.querySelector(".questions-amount").style = "background: #FFFFFF";
    }
    levels = document.querySelector(".levels-amount").value;
    const levelsVerification = 1 < levels;
    if(!levelsVerification){
        document.querySelector(".levels-amount").nextElementSibling.innerHTML ="Deve ter pelo menos 2 níveis";
        document.querySelector(".levels-amount").style = "background: #FFE9E9";
    }
    else {
        document.querySelector(".levels-amount").nextElementSibling.innerHTML = "";
        document.querySelector(".levels-amount").style = "background: #FFFFFF";
    }
    if(titleVerification && urlVerification && questionsVerification && levelsVerification){
        userQuizz.title = title;
        userQuizz.image = url;
        document.querySelector(".create-title").value = "";
        document.querySelector(".img-URL").value = "";
        document.querySelector(".questions-amount").value = "";
        document.querySelector(".levels-amount").value = "";
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
                        <input class="create-text" placeholder="Texto da pergunta"/> <p class="error"></p>
                        <input type="color" class="create-color" placeholder="Cor de fundo da pergunta"/>
                    </div>
                    <p>Resposta correta</p>
                    <div class="correct-answer">
                        <input class="create-answer" placeholder="Reposta correta"/> <p class="error"></p>
                        <input type="url" class="create-answer-URL" placeholder="URL da imagem"/> <p class="error"></p>
                    </div>
                    <div class="wrong-answers">
                        <p>Respostas incorretas</p>
                        <div class="option">
                            <input class="create-answer" placeholder="Reposta incorreta 1"/> <p class="error"></p>
                            <input type="url" class="create-answer-URL" placeholder="URL da imagem 1"/> <p class="error"></p>
                        </div>

                        <div class="option">
                            <input class="create-answer" placeholder="Reposta incorreta 2"/> <p class="error"></p>
                            <input type="url" class="create-answer-URL" placeholder="URL da imagem 2"/> <p class="error"></p>
                        </div>

                        <div class="option">
                            <input class="create-answer" placeholder="Reposta incorreta 3"/> <p class="error"></p>
                            <input type="url" class="create-answer-URL" placeholder="URL da imagem 3"/> <p class="error"></p>
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
                        <input class="create-text" placeholder="Texto da pergunta"/> <p class="error"></p>
                        <input type="color" class="create-color" placeholder="Cor de fundo da pergunta"/>
                    </div>
                    <p>Resposta correta</p>
                    <div class="correct-answer">
                        <input class="create-answer" placeholder="Reposta correta"/> <p class="error"></p>
                        <input type="url" class="create-answer-URL" placeholder="URL da imagem"/> <p class="error"></p>
                    </div>
                    <div class="wrong-answers">
                        <p>Respostas incorretas</p>
                        <div class="option">
                            <input class="create-answer" placeholder="Reposta incorreta 1"/> <p class="error"></p>
                            <input type="url" class="create-answer-URL" placeholder="URL da imagem 1"/> <p class="error"></p>
                        </div>
    
                        <div class="option">
                            <input class="create-answer" placeholder="Reposta incorreta 2"/> <p class="error"></p>
                            <input type="url" class="create-answer-URL" placeholder="URL da imagem 2"/> <p class="error"></p>
                        </div>
    
                        <div class="option">
                            <input class="create-answer" placeholder="Reposta incorreta 3"/> <p class="error"></p>
                            <input type="url" class="create-answer-URL" placeholder="URL da imagem 3"/> <p class="error"></p>
                        </div>
                    </div>
                </div>
            </div>`
        }
    }
    if(edit){
        fillQuestions();
        fillAnswers();
    }
}

function createLevels(){
    document.querySelector('.quizz-questions').classList.add('hidden');
    document.querySelector(".quizz-levels").classList.remove("hidden");
    const levelHolder = document.querySelector(".level-holder");
    levelHolder.innerHTML = ""
    for(let i = 0;i<levels;i++){
        if(i===0){
            levelHolder.innerHTML +=`
            <div class="create-level">
                <p>Nível ${i+1} </p>
                <ion-icon onclick="expand(this)" name="create-outline"></ion-icon>
                <div class="container hidden">
                    <input class="create-level-input" placeholder="Título do nível"/><p class='error'></p>
                    <input class="create-level-input" value="0" type="number" class="create-treshold" disabled/>
                    <input class="create-level-input" type="url" class="create-level-URL" placeholder="URL da imagem do nível"/><p class='error'></p>
                    <textarea class="create-level-input" placeholder="Descrição do nível"></textarea><p class='error'></p>
                </div>
            </div>
        `
        }else{
            levelHolder.innerHTML +=`
                <div class="create-level">
                    <p>Nível ${i+1} </p>
                    <ion-icon onclick="expand(this)" name="create-outline"></ion-icon>
                    <div class="container hidden">
                        <input class="create-level-input" placeholder="Título do nível"/><p class='error'></p>
                        <input class="create-level-input" type="number" class="create-treshold" placeholder="% de acerto mínima"/>
                        <input class="create-level-input" type="url" class="create-level-URL" placeholder="URL da imagem do nível"/><p class='error'></p>
                        <textarea class="create-level-input" placeholder="Descrição do nível"></textarea><p class='error'></p>
                    </div>
                </div>
            `
        }  
    }
    if(edit){
        fillLevels();
    }
}
function levelValidation(){
    const inputs = document.querySelectorAll(".create-level");
    let failed = false;
    const array = [];
    for(let i = 0;i<inputs.length;i++){
        const template = {};
        const fields = inputs[i].querySelectorAll(".container .create-level-input");
        if(fields[0].value.length<10){
            failed = true;
            fields[0].nextElementSibling.innerHTML = 'O Título deve ter no mínimo 10 caracteres';
            fields[0].style = "background: #FFE9E9";
        }
        else{
            fields[0].nextElementSibling.innerHTML = '';
            fields[0].style = "background: #FFFFFF";
        }
        if(!isValidUrl(fields[2].value)){
            failed = true;
            fields[2].nextElementSibling.innerHTML = 'A URL deve ter um formato válido';
            fields[2].style = "background: #FFE9E9";
        }
        else{
            fields[2].nextElementSibling.innerHTML = '';
            fields[2].style = "background: #FFFFFF";
        }
        if(fields[3].value.length<30){
            failed = true;
            fields[3].nextElementSibling.innerHTML = 'A descrição deve ter pelo menos 30 caracteres';
            fields[3].style = "background: #FFE9E9";
        }
        else{
            fields[3].nextElementSibling.innerHTML = '';
            fields[3].style = "background: #FFFFFF";
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
        return;
    }else{
        if(edit){
            userQuizz.levels = array;
            sendQuiz();
        }
        else{
            userQuizz.levels = array;
            saveQuizz();
        }
        document.querySelector(".quizz-levels").classList.add("hidden");
        document.querySelector(".quizz-created").classList.remove("hidden");
        quizzSample();
    }
}

function quizzSample(){
    const sample = document.querySelector('.new-quizz');
    sample.innerHTML = 
        `<div class="quiz-display" 
            style="background-image: linear-gradient(to bottom, rgba(255, 255, 255, 0) 0%, rgba(255,255,255,0) 50%, rgba(0, 0, 0, 0.904) 100%), url('${userQuizz.image}')">
            <p class="quiz-display-title">${userQuizz.title}</p>
        </div>`
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
            questionsTexts[i].nextElementSibling.innerHTML = "";
            questionsTexts[i].style = "background: #FFFFFF";
        }
        else{
            questionsTexts[i].nextElementSibling.innerHTML = "A pergunta deve ter mais que 19 caracteres!";
            questionsTexts[i].style = "background: #FFE9E9";
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
                allImgs[n].nextElementSibling.innerHTML = 'Sua URL de imagem deve ter um formato válido';
                allImgs[n].style = "background: #FFE9E9";
                return;
            }
            else if(answerTextVerification && answerImgVerification){
                if(allAnswers[n].parentNode.classList.contains("correct-answer")){
                   userQuizz.questions[i].answers[n] = {text: answerText, image: answerImg, isCorrectAnswer: true};
                    containRightAnswer = true;
                    allImgs[n].nextElementSibling.innerHTML = '';
                    allImgs[n].style = "background: #FFFFFF";
                }
                else{
                    userQuizz.questions[i].answers[n] = {text: answerText, image: answerImg, isCorrectAnswer: false};
                    allImgs[n].nextElementSibling.innerHTML = '';
                    allImgs[n].style = "background: #FFFFFF";
                }
            }
        }
        if (quizToEdit.questions[i].answers.length < 2 || (!containRightAnswer)){
            if(!containRightAnswer){
                allAnswers[0].nextElementSibling.innerHTML="Você deve inserir a resposta certa e pelo menos uma errada!";
                allAnswers[0].style = "background: #FFE9E9";
                return;
            }
            else {
                allAnswers[1].nextElementSibling.innerHTML="Você deve inserir a resposta certa e pelo menos uma errada!";
                allAnswers[1].style = "background: #FFE9E9";
            }
        }
        containRightAnswer = false;
    }
    createLevels();
}

function saveQuizz(){
    const promise = axios.post('https://mock-api.driven.com.br/api/v4/buzzquizz/quizzes', userQuizz);
    promise.then(quizzSavedSuccesfully);
}

function quizzSavedSuccesfully(data){
    const quizz = data.data;
    const quizzID = quizz.id;
    const quizzKey = quizz.key;
    personalQuizzesID.push(quizzID);
    personalQuizzesKey.push(quizzKey);
    const serializedQuizzes = JSON.stringify(personalQuizzesID);
    const serializedKeys = JSON.stringify(personalQuizzesKey);
    localStorage.setItem("myQuizzes", serializedQuizzes);
    localStorage.setItem("myKeys", serializedKeys);
    document.querySelector(".quizz-levels").classList.add("hidden");
    const created = document.querySelector(".quizz-created");
    created.classList.remove("hidden");
    created.querySelector(".access-quiz").id = quizz.id;
}

function deleteQuiz(item){
    editOrErase = true;
    const confirmation = confirm("Deseja deletar esse quiz?");
    if(confirmation){
        const url = apiURL+item.parentNode.parentNode.id;
        position = personalQuizzesID.indexOf(Number(item.parentNode.parentNode.id));
        const headers = {"Secret-Key": `${personalQuizzesKey[position]}`};
        const promise = axios.delete(url, {headers});
        promise.then(successDelete);
    }
    else{
        editOrErase = false;
        return;
    }
}

function successDelete(){
    personalQuizzesData.splice(position);
    personalQuizzesID.splice(position);
    personalQuizzesKey.splice(position);
    const serializedQuizzes = JSON.stringify(personalQuizzesID);
    const serializedKeys = JSON.stringify(personalQuizzesKey);
    localStorage.setItem("myQuizzes", serializedQuizzes);
    localStorage.setItem("myKeys", serializedKeys);
    location.reload();
}

function editQuiz(item){
    editOrErase = true;
    edit = true;
    position = personalQuizzesID.indexOf(Number(item.parentNode.parentNode.id));
    const url = apiURL+item.parentNode.parentNode.id;
    const promise = axios.get(url);
    promise.then(beginEditing);
}

function beginEditing(object){
    quizToEdit = object.data;
    createQuizStart();
    fillInfo();
}

function fillInfo(){
    document.querySelector(".create-title").value = quizToEdit.title;
    document.querySelector(".img-URL").value = quizToEdit.image;
    document.querySelector(".questions-amount").value = quizToEdit.questions.length;
    document.querySelector(".levels-amount").value = quizToEdit.levels.length;
}

function fillQuestions(){
    const questionsTexts = document.querySelectorAll(".create-text");
    const questionsColors = document.querySelectorAll(".create-color");
    const questions = [];
    for (let i = 0; i < questionsTexts.length; i++){
        questionsTexts[i].value = quizToEdit.questions[i].title;
        questionsColors[i].value = quizToEdit.questions[i].color;
    }
}

function fillAnswers(){
    const questionContainer = document.querySelectorAll(".create-question");
    for (let i = 0; i < questionContainer.length; i++){
        const allAnswers = questionContainer[i].querySelectorAll(".create-answer");
        const allImgs = questionContainer[i].querySelectorAll(".create-answer-URL");
        for (let n = 0; n < quizToEdit.questions[i].answers.length; n++){
           allAnswers[n].value = quizToEdit.questions[i].answers[n].text;
           allImgs[n].value = quizToEdit.questions[i].answers[n].image;
        }
    }
}

function fillLevels(){
    const inputs = document.querySelectorAll(".create-level");
    for(let i = 0;i<inputs.length;i++){
        const fields = inputs[i].querySelectorAll(".container .create-level-input");
        fields[0].value = quizToEdit.levels[i].title;
        fields[1].value = quizToEdit.levels[i].minValue;
        fields[2].value = quizToEdit.levels[i].image;
        fields[3].value = quizToEdit.levels[i].text;
    }
}
function sendQuiz(){
    const headers = {"Secret-Key": `${personalQuizzesKey[position]}`};
    const url = apiURL+quizToEdit.id;
    axios.put(url, userQuizz, {headers});
    editOrErase = false;
    edit = false;
}
window.onload = getQuizzes;