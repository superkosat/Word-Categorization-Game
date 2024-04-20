let categories = {
    "easy": ["citrus fruits", ["lemon", "orange", "grapefruit", "lime"]],
    "medium": ["U.S.-based technology companies", ["apple", "amazon", "meta", "cisco"]],
    "harder": ["anagrams", ["parse", "spear", "pears", "spare"]],
    "difficult": ["____ soup", ["alphabet", "onion", "beef", "pea"]]
};


function randomSelection(array) {
    return array[Math.floor(Math.random() * array.length)];
}

const squareContainer = document.querySelector('.square-container');
let activeCount = 0; // number of selected squares
let guesses = 4; // number of remaining guesses
let nextRow = 1; // next row for solved group
let guessInProgress = false; // flag whether guess in progress
let gameRecord = []; // records guesses made
let wordList = []; // list of words to populate squares

// Create list of word and difficulty
for (const difficulty in categories) {
    const group = categories[difficulty][1];
    for (const posOfWord in group) {
        console.log(group[posOfWord]);
        wordList.push([difficulty, group[posOfWord]]);
    }
    //wordList = wordList.concat(group);
}
console.log(wordList);



// Create 16 buttons for words
for (let i = 1; i <= 16; i++) {
    const randomWord = randomSelection(wordList);
    const square = document.createElement('button');
    square.className = 'square';
    
    if (randomWord[1].length >= 12) {
        square.style.fontSize = '90%';
    } else if (randomWord[1].length >= 10) {
        square.style.fontSize = '100%';
    } else if (randomWord[1].length > 8) {
        square.style.fontSize = '110%';
    }
    square.setAttribute('group', randomWord[0]);
    square.setAttribute('position', i); // may be redundant, check default index
    square.textContent = randomWord[1];
    indexToRemove = wordList.indexOf(randomWord);
    wordList.splice(indexToRemove, 1);
    squareContainer.appendChild(square);
}


let activeButtons = [];
// Animations for button clicks, set buttons to active
const buttons = document.querySelectorAll('.square');
buttons.forEach(button => {
    button.addEventListener('click', function() {
        if (!guessInProgress && (activeCount < 4 || button.classList.contains('active'))) {
            button.classList.toggle('active');
            activeCount += button.classList.contains('active') ? 1 : -1;
            button.classList.toggle('shrink');
            setTimeout(() => button.classList.toggle('shrink'), 150);
        }
    });
});


// Unselect all active squares
function deselectAll() {
    buttons.forEach(button => {
        if (button.classList.contains('active')) {
            button.classList.toggle('active');
        }
    });
    activeCount = 0;
};

// Make guess with 4 toggled squares
function makeGuess() {
    if (activeCount == 4 && !guessInProgress && guesses > 0) {

        guessInProgress = true;

        (async () => {

            await hopActiveButtons();
            const activeButtons = document.querySelectorAll('.square.active');
            const firstGroup = activeButtons[0].getAttribute('group');
            let correct = true;

            let guessGroups = "";
            for (let i = 0; i < activeButtons.length; i++) {
                switch (activeButtons[i].getAttribute('group')) {
                    case ("easy"):
                        guessGroups += ("🟨");
                        break;
                    case ("medium"):
                        guessGroups += ("🟩");
                        break;
                    case ("harder"):
                        guessGroups += ("🟦");
                        break;
                    case ("difficult"):
                        guessGroups += ("🟪");
                        break;
                }
                if (activeButtons[i].getAttribute('group') !== firstGroup) {
                    correct = false;
                }
            }
            gameRecord.push(guessGroups);
            console.log(gameRecord);

            if (correct) {
                console.log('correct');
                moveSolvedToNextRow(activeButtons, firstGroup, true);
            } else { // On incorrect guess
                shakeActiveButtons();
                guesses--;
                updateGuesses();
                if (guesses == 0) {
                    console.log('guesses used up');
                    //solvePuzzle();
                }
            }

            guessInProgress = false;

        })();
        
    }
}

// Updates guess counter for UI
function updateGuesses() {
    const circles = document.querySelectorAll('.circle');
    circles.forEach((circle, index) => {
        if (index < guesses) {
            circle.classList.remove('hidden');
        } else {
            circle.classList.add('hidden');
        }
    });
}


// Move solved squares to next available row
function moveSolvedToNextRow(activeButtons, difficulty, user) {
    ordering = categories[difficulty][1]; //ordering of category
    startRowIndex = (nextRow - 1) * 4 + 1;

    buttonsInRow = document.querySelectorAll(`
     .square[position="${startRowIndex}"],
     .square[position="${startRowIndex + 1}"], 
     .square[position="${startRowIndex + 2}"], 
     .square[position="${startRowIndex + 3}"]
    `);

    for (let i = 0; i < 4; i++) {
        swapButtons(activeButtons[i], buttonsInRow[i]);
        buttonsInRow[i].classList.add(`solved-${difficulty}`);
        buttonsInRow[i].disabled = true;
    }

    levelSolved(difficulty);

    nextRow++;
    if (nextRow == 5 && user) {
        openModal(1);
    } else if (!user) {
        openModal(0);
    }
    deselectAll();
}


// TODO implement swapAttribute function
function swapButtons(button1, button2) {
    // Get button positions
    const rect1 = button1.getBoundingClientRect();
    const rect2 = button2.getBoundingClientRect();

    // Calculate the distance to swap
    const deltaX = rect2.left - rect1.left;
    const deltaY = rect2.top - rect1.top;

    // Apply transform to animate the swap
    button1.style.transform = `translate(${deltaX}px, ${deltaY}px)`;
    button2.style.transform = `translate(-${deltaX}px, -${deltaY}px)`;

    //const tempPos = button1.getAttribute('position');
    const tempGroup = button1.getAttribute('group');
    const tempText = button1.textContent;
    const tempFontSize = button1.style.fontSize;

    // Add animate-swap class to trigger the transition
    button1.classList.add('animate-swap');
    button2.classList.add('animate-swap');

    // Swap attributes after animation
    setTimeout(() => {
        //Swap position attributes (1-indexed)
        //button1.setAttribute('position', button2.getAttribute('position'));
        //button2.setAttribute('position', tempPos);

        // Swap group attributes
        button1.setAttribute('group', button2.getAttribute('group'));
        button2.setAttribute('group', tempGroup);

        // Swap text content
        button1.textContent = button2.textContent;
        button2.textContent = tempText;

        // Swap font size attributes
        button1.style.fontSize = button2.style.fontSize;
        button2.style.fontSize = tempFontSize;

        // Reset transforms
        button1.style.transform = '';
        button2.style.transform = '';

        // Remove the animate-swap class
        button1.classList.remove('animate-swap');
        button2.classList.remove('animate-swap');
    }, 100);
}





// Shake squares animation (on incorrect guess)
function shakeActiveButtons() {
    const activeButtons = document.querySelectorAll('.square.active');
    let completed = 0;
    activeButtons.forEach(button => {
        button.classList.add('shake');
        button.addEventListener('animationend', function removeShakeClass() {
            button.classList.remove('shake');
            button.removeEventListener('animationend', removeShakeClass);
            if (++completed === activeButtons.length) {
                deselectAll();
            }
        });
    });
    
}

// Hopping buttons animation (async: must finish before evaluating guess)
async function hopActiveButtons() {
    const activeButtons = document.querySelectorAll('.square.active');
    
    activeButtons.forEach((button, index) => {

        setTimeout(() => {
            button.classList.add('hop');
        }, index * 200);

        button.addEventListener('transitionend', function removeHopClass() {
            button.classList.remove('hop');
            button.removeEventListener('transitionend', removeHopClass);
        });
    });
    const totalDelay = activeButtons.length * 300 + 300;
    await delay(totalDelay);
}

// Returns promise for duration of totalDelay
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}


function solvePuzzle() {
    //use nextRow to find next row to solve and continue to solve until row 4



    openModal(0); //here because of async
}

// Opens notification modal
function openModal(result) {
    const modal = document.getElementById('modal');
    const modalContent = document.getElementById('modal-content');

    modal.style.display = 'flex';

    let title = "";
    switch (gameRecord.length) {
        case 4:
            title = "Excellent!";
            break;
        case 5:
            title = "Great!";
            break;
        case 6:
            title = "Good!";
            break;
        case 7:
            title = "Whew!"
            break;
    }
    
    if (result == 1) { //win
        modalContent.innerHTML = `<h3>${title}</h3>
                                  <p>${gameRecord.map(row => row).join('<br>')}</p>
                                  <button class="modal-button" onclick="closeModal()">Close</button>`;

    } else { //loss
        modalContent.innerHTML = `<h3>Next time...</h3>
                                  <p>${gameRecord.map(row => row).join('<br>')}</p>
                                  <button class="modal-button" onclick="closeModal()">Close</button>`;                              
    }
}


function levelSolved(overlayLevel) {
    const buttons = document.querySelectorAll('.square');

    const button =  buttons[(nextRow - 1) * 4];//document.querySelector('.square');
    //const buttonRect = button.getBoundingClientRect();

    const updateOverlayPosition = () => {
        const buttonRect = button.getBoundingClientRect();
        overlay.style.top = `${buttonRect.top}px`;
        overlay.style.left = `${buttonRect.left}px`;
    }

    const overlay = document.createElement('div');
    overlay.className = 'overlay';
    overlay.id = `${overlayLevel}-overlay`;

    overlay.innerHTML = `<h3>${categories[overlayLevel][0].toUpperCase()}</h3>
                        <p>${categories[overlayLevel][1].map(word => word).join(', ').toUpperCase()}</p>`;
    overlay.style.textAlign = 'center';

    overlay.style.position = 'absolute';
    updateOverlayPosition();
    /*overlay.style.top = `${buttonRect.top}px`;
    overlay.style.left = `${buttonRect.left}px`;*/

    document.body.appendChild(overlay);
    overlay.style.display = 'block';
    window.addEventListener('resize', updateOverlayPosition);
}

// Closes notification modal
function closeModal() {
    const modal = document.getElementById('modal');
    modal.style.display = 'none';
}

updateGuesses();