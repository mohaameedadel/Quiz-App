const form = document.getElementById("quizOptions");
const categoryMenu = document.getElementById("categoryMenu");
const difficultyOptions = document.getElementById("difficultyOptions");
const questionsNumber = document.getElementById("questionsNumber");
const startQuizBtn = document.getElementById("startQuiz");
const questionsContainer = document.getElementById("questionsContainer");

let newQuiz;
let questions;

startQuizBtn.addEventListener("click", async function () {
  try {
    const category = categoryMenu.value;
    const difficulty = difficultyOptions.value;
    const questionNums = questionsNumber.value;
    let score = 0;

    newQuiz = new Quiz(category, difficulty, questionNums);
    questions = await newQuiz.getAllQuestions();

    form.classList.replace("d-flex", "d-none");

    const question = new Questions(0, newQuiz.questionNums);
    question.display();
  } catch (error) {
    Swal.fire("Please Enter Number");
    setTimeout(() => {
      location.reload();
    }, 1500);
  }
});

class Quiz {
  constructor(category, difficulty, questionNums) {
    this.category = category;
    this.difficulty = difficulty;
    this.questionNums = questionNums;
    this.score = 0;
  }
  getApi() {
    return `https://opentdb.com/api.php?amount=${this.questionNums}&category=${this.category}&difficulty=${this.difficulty}`;
  }
  async getAllQuestions() {
    const api = await fetch(this.getApi());
    const response = await api.json();
    return response.results;
  }
  showResult() {
    return `
      <div
        class="question shadow-lg col-lg-12  p-4 rounded-3 d-flex flex-column justify-content-center align-items-center gap-3"
      >
        <h2 class="mb-0">
        ${
          this.score == this.questionNums
            ? `Congratulations 🎉`
            : `Your score is ${this.score} of ${this.questionNums}`
        }      
        </h2>
        <button class="again btn btn-primary rounded-pill"><i class="bi bi-arrow-repeat"></i> Try Again</button>
      </div>
    `;
  }
}

// !! -------------------------------------------------------------------------------------

class Questions {
  constructor(index, questionNums) {
    this.index = index;
    this.questionNums = questionNums;
    this.question = questions[index].question;
    this.difficulty = questions[index].difficulty;
    this.category = questions[index].category;
    this.correct_answer = questions[index].correct_answer;
    this.incorrect_answers = questions[index].incorrect_answers;
    this.allAnswers = this.getAllAnswers();
    this.answered = false;
  }
  getAllAnswers() {
    let allAnswer = [...this.incorrect_answers, this.correct_answer];
    allAnswer.sort();
    return allAnswer;
  }
  display() {
    const questionMarkUp = `
      <div
        class="question shadow-lg col-lg-6 offset-lg-3  p-4 rounded-3 d-flex flex-column justify-content-center align-items-center gap-3 animate__animated animate__bounceIn"
      >
        <div class="w-100 d-flex justify-content-between">
          <span class="btn btn-category">${this.category}</span>
          <span class="fs-6 btn btn-questions">${this.index + 1} of ${
      this.questionNums
    }  </span>
        </div>
        <h2 class="text-capitalize h4 text-center">${this.question}</h2>  
        <ul class="choices w-100 list-unstyled m-0 d-flex flex-wrap text-center">
        ${this.allAnswers.map((answer) => `<li>${answer}</li>`).join("")}
        </ul>
        <h2 class="text-capitalize text-center score-color h3 fw-bold"><i class="bi bi-emoji-laughing"></i> Score: ${
          newQuiz.score
        }</h2>        
      </div>
    `;

    questionsContainer.innerHTML = questionMarkUp;

    const choices = document.querySelectorAll(".choices li");
    choices.forEach((li) => {
      li.addEventListener("click", () => {
        this.checkAnswer(li);
        this.nextQuestion();
      });
    });
  }

  checkAnswer(choice) {
    if (!this.answered) {
      this.answered = true;
      if (choice.innerHTML == this.correct_answer) {
        choice.classList.add("correct", "animate__animated", "animate__pulse");
        newQuiz.score++;
      } else {
        choice.classList.add("wrong", "animate__animated", "animate__shakeX");
      }
    }
  }

  nextQuestion() {
    this.index++;
    setTimeout(() => {
      if (this.index < newQuiz.questionNums) {
        let myNewQuestion = new Questions(this.index, newQuiz.questionNums);
        myNewQuestion.display();
      } else {
        questionsContainer.innerHTML = newQuiz.showResult();
        document.querySelector(".again").addEventListener("click", function () {
          location.reload();
        });
      }
    }, 1000);
  }
}
