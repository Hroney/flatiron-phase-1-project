// Adds an event listener (click) to the button "createButton"
document.getElementById("createButton").addEventListener("click", async () => {
    await loadDB();
    await createDivs();
});

// Adds an event listener (keydown) to the action of pressing the "Enter key"
let userInput = document.getElementById("userInput");
userInput.addEventListener("keydown", async function (event) {
    if (event.key === "Enter") {
        await loadDB();
        await createDivs();
    }
});

let db;
// Function to load the db.json file
async function loadDB() {
    try {
        const response = await fetch('http://localhost:3000/words');
        if (!response.ok) {
            throw new Error(`Failed to fetch db.json. Status: ${response.status}`);
        }

        db = await response.json();
    } catch (error) {
        console.error('Error loading db.json:', error);
    }
}


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
    let word = userInput.toLowerCase();

    if (db && db.words && word in db.words) {
        const dbWord = db.words[word];
        theWord = new Word(dbWord.name);
        dbWord.definitions.forEach(({ definition, partOfSpeech }) => {
            theWord.addDefinition(definition, partOfSpeech);
        });
        theWord.splitTheWord();
        return theWord;
    }

    const apiUrl = `https://api.dictionaryapi.dev/api/v2/entries/en/${word}`;
    if (isASingleWord(userInput)) {
        try {
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
                addToDB(theWord);
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

// Function to add a word to the db.json file
function addToDB(word) {
    if (!db) {
        db = { words: {} };
    }

    const wordData = {
        name: word.name,
        definitions: word.definitions.map(({ definition, partOfSpeech }) => ({ definition, partOfSpeech })),
        nameArray: word.nameArray
    };

    console.log("Before adding to db:", db);

    try {
        if (!db.words) {
            db.words = {};
        }

        db.words[word.name.toLowerCase()] = wordData;
        console.log("After adding to db:", db);
        if (db.words[word.name.toLowerCase()] === wordData) {
            saveDBToServer(db);
        } else {
            console.error("Failed to add word to db:", word);
        }
    } catch (error) {
        console.error("Error adding word to db:", error);
    }
}

async function saveDBToServer(db) {
    try {
        const response = await fetch('http://localhost:3000/words', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(db.words),
        });

        if (!response.ok) {
            throw new Error(`Failed to save data to json-server. Status: ${response.status}`);
        }

        console.log('Data saved successfully to json-server!');
    } catch (error) {
        console.error('Error saving data to json-server:', error);
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

// Call the loadDB function when the script starts
loadDB().then(() => {
    // Now you can use the db variable globally
    console.log(db);
});