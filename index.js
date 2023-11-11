// Adds an event listener (click) to the button "createButton"
document.getElementById("createButton").addEventListener("click", createDivs);

// Adds an event listener (keydown) to the action of pressing the "Enter key"
let userInput = document.getElementById("userInput");
userInput.addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
        createDivs();
    }
});

// Global map to store pulled words
const mapOfPulledWords = new Map();

// Word class definition
class Word {
    constructor(name) {
        this.name = name;
        this.definitions = [];
        this.nameArray = [];
    }

    // Adds a definition to the word
    addDefinition(definition, partOfSpeech) {
        this.definitions.push({ definition, partOfSpeech })
    }

    // Splits the word into an array of characters
    splitTheWord() {
        this.nameArray = this.name.toUpperCase().split('');
    }
}

// Global variable to store the current word
let theWord = new Word('');

// Function to create the word object
async function isAWord(userInput) {
    let word = userInput.toLowerCase()
    const apiUrl = `https://api.dictionaryapi.dev/api/v2/entries/en/${word}`;

    // Checks if the input is a single string word
    if (isASingleWord(userInput)) {
        try {
            // Makes the API call
            const response = await fetch(apiUrl);

            if (!response.ok) {
                throw new Error(`HTTP Error! Status is: ${response.status}`);
            }

            const data = await response.json();

            if (data.title === "No Definitions Found") {
                return new Word('');
            } else {
                theWord = new Word(data[0].word);
                data[0].meanings.forEach(object => {
                    object.definitions.forEach(definitionArray => {
                        theWord.addDefinition(definitionArray.definition, object.partOfSpeech);
                    });
                });
                theWord.splitTheWord();
                return theWord;
            }
        } catch (error) {
            console.error('Error fetching word data:', error);
            return new Word('');
        }
    } else {
        return new Word('');
    }
}

// Function to create game pieces and give them functionality
async function workingWord() {
    const characterContainer = document.getElementById("characterContainer");
    const choicesDiv = document.querySelector(".choices");

    // Resets on-screen div sections
    characterContainer.innerHTML = '';
    choicesDiv.innerHTML = '';

    // Copies theWord to avoid affecting successive searches
    let aWord = theWord;

    // Creates character boxes
    aWord.nameArray.forEach((char, i) => {
        const divBox = document.createElement("div");
        divBox.classList.add("character-box");
        divBox.textContent = char;
        divBox.addEventListener("click", async () => {
            choicesDiv.innerHTML = '';
            let arrayThing = possibleWords(aWord, i);
            const promiseArray = arrayThing.map(item => isAWord(item));
            const wordObjects = await Promise.all(promiseArray);
            createDefinitionDivs(wordObjects, choicesDiv);
        });
        characterContainer.appendChild(divBox);
    });
}

// Function to create divs for definitions and words
async function createDivs() {
    const userInput = document.getElementById("userInput").value;

    // Checks the initial word input
    theWord = await isAWord(userInput);

    // Appends the word to the page
    await workingWord();
    document.getElementById("userInput").value = "";
}

// Function to check if the character array represents a single word
function isASingleWord(userInput) {
    let charArray = userInput.split('');
    const punctuation = /[!"#$%&'()*+,-./:;<=>?@[\]^_`{|}~]/;
    const numbers = /\d+/g;
    let returnValue = true;

    // Tests if the word is a single word and not a sentence
    if (charArray.some(element => element.includes(' '))) {
        returnValue = false;
    }
    // Tests if the word has punctuation
    else if (charArray.some(element => punctuation.test(element))) {
        returnValue = false;
    }
    // Test is the word has a number
    else if (charArray.some(element => numbers.test(element))) {
        returnValue = false;
    }
    return returnValue;
}

// Function to generate possible words by modifying a chosen letter
function possibleWords(wordName, indexOfChosenLetter) {
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const modifiedObjects = [];

    for (let i = 0; i < alphabet.length; i++) {
        const letter = alphabet[i];
        const newName = wordName.nameArray.slice();
        newName[indexOfChosenLetter] = letter;
        modifiedObjects.push(newName.join(''));
    }

    return modifiedObjects;
}

// Function to create divs for definitions and words
function createDefinitionDivs(objectArray, choicesDiv) {
    objectArray.forEach(word => {
        if (word.name === '') {
            // Do nothing
        } else {
            // Creates a container for each word
            const wordContainer = document.createElement("div");
            wordContainer.classList.add("word-container");

            // Populates the container
            const nameDiv = document.createElement("div");
            nameDiv.classList.add("word-name");
            nameDiv.textContent = `${word.name.toUpperCase()}`;
            wordContainer.appendChild(nameDiv);

            // Creates divs for the definitions and populates them
            word.definitions.forEach((definition, index) => {
                const definitionDiv = document.createElement("div");
                definitionDiv.classList.add("word-definition");
                definitionDiv.textContent = `Definition ${index + 1}: ${definition.definition} (Part of Speech: ${definition.partOfSpeech})`;
                wordContainer.appendChild(definitionDiv);

                // Add mouseover event to focus on the definition
                wordContainer.addEventListener("mouseenter", function () {
                    wordContainer.focus();
                    handleMouseOver(wordContainer);
                });

                // Add blur event to unfocus when the mouse leaves
                wordContainer.addEventListener("mouseleave", function () {
                    wordContainer.blur();
                    handleMouseOut();
                });

                // Add click event to replace the word when the definition is clicked
                wordContainer.addEventListener("click", function () {
                    replaceWord(word);
                });
            });

            // Appends the word container to the "choices" div
            choicesDiv.appendChild(wordContainer);
        }
    });
}

// Function to replace the working word
function replaceWord(newWord) {
    theWord = newWord;
    workingWord();
}

// Function to handle mouseover event
function handleMouseOver(container) {
    // Reset blur on all word containers
    document.querySelectorAll('.word-container').forEach(c => {
        c.style.filter = 'blur(1px)';
    });

    // Remove blur effect from the hovered container
    container.style.filter = 'blur(0)';
}

// Function to handle mouseout event
function handleMouseOut() {
    // Reset blur on all word containers
    document.querySelectorAll('.word-container').forEach(container => {
        container.style.filter = 'blur(0)';
    });
}