//Creates global DOM elements
const createButton = document.getElementById("createButton");
const userInput = document.getElementById("userInput");
const characterContainer = document.getElementById("characterContainer");
const choicesDiv = document.querySelector(".choices");

//Creates functionality of Button
createButton.addEventListener("click", async () => {
    await loadDB();
    await createDivs();
});

//Creates functionality for pressing Enter rather than the submit button
userInput.addEventListener("keydown", async (event) => {
    if (event.key === "Enter") {
        await loadDB();
        await createDivs();
    }
});

//The basic object and constructor of a given word
class Word {
    constructor(name) {
        this.name = name;
        this.definitions = [];
        this.nameArray = [];
    }

    addDefinition(definition, partOfSpeech) {
        this.definitions.push({ definition, partOfSpeech });
    }

    splitTheWord() {
        this.nameArray = this.name.toUpperCase().split('');
    }
}

//Global variables. db = the database, theWord = the global object of a given word
let db;
let theWord = new Word('');


//Function attempts to load the localhost server, if it's not running, it throws an error
async function loadDB() {
    try {
        const response = await fetch('http://localhost:3000/words');
        if (!response.ok) {
            throw new Error(`Failed to fetch db.json. Status: ${response.status}`);
        }
        //this sets the global database to be the local server
        db = await response.json();
    } catch (error) {
        console.error('Error loading db.json:', error);
    }
}


//Function to check if userinput is a valid word and then populates the object
async function isAWord(userInput) {
    let word = userInput.toLowerCase();

    //checks if there is a database, if there is a set of words in the database, and then checks if the userinput is in that db list
    if (db && db.words && word in db.words) {
        //if this passes, the word is within the database. This statement will populate the global word with the stored information
        const dbWord = db.words[word];
        theWord = new Word(dbWord.name);
        dbWord.definitions.forEach(({ definition, partOfSpeech }) => {
            theWord.addDefinition(definition, partOfSpeech);
        });
        theWord.splitTheWord();
        return theWord;
    }

    //sets the api URL
    const apiUrl = `https://api.dictionaryapi.dev/api/v2/entries/en/${word}`;
    //checks to see if the word is a single non-puctuated, non-numbered, word and not a sentence
    if (isASingleWord(userInput)) {
        try {
            const response = await fetch(apiUrl);
            if (!response.ok) {
                throw new Error(`HTTP Error! Status is: ${response.status}`);
            }
            const data = await response.json();
            //checks if the word doesn't exist
            if (data.title === "No Definitions Found") {
                return new Word('');
            }
            //populates the global word with the information from the api
            else {
                theWord = new Word(data[0].word);
                data[0].meanings.forEach(object => {
                    object.definitions.forEach(definitionArray => {
                        theWord.addDefinition(definitionArray.definition, object.partOfSpeech);
                    });
                });
                theWord.splitTheWord();
                //adds the word object to the database to reduce total API calls in successive uses.
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

//function adds words to the database
function addToDB(word) {
    //if there is no database already set and initialized, this sets it
    if (!db) {
        db = { words: {} };
    }
    //creates a copy of the specific word being passed into the function
    const wordData = {
        name: word.name,
        definitions: word.definitions.map(({ definition, partOfSpeech }) => ({ definition, partOfSpeech })),
        nameArray: word.nameArray
    };
    //This is a check to make sure the database is being updated for my logs
    console.log("Before adding to db:", db);

    //I was having trouble saving to the server due to async functions. This block helps with that. 
    try {
        //checks if there is any data in the database word section
        if (!db.words) {
            db.words = {};
        }
        //populates a place in the database with the key of (word.name) lowercased to keep it consistent 
        db.words[word.name.toLowerCase()] = wordData;
        console.log("After adding to db:", db);
        //If it's now set and the key exists, calls the saveDBtoServer function to save it
        if (db.words[word.name.toLowerCase()] === wordData) {
            saveDBToServer(db);
        } else {
            console.error("Failed to add word to db:", word);
        }
    } catch (error) {
        console.error("Error adding word to db:", error);
    }
}

//Function to save the database object to json-server
async function saveDBToServer(db) {
    try {
        // Uses fetch to make a POST request to the specified URL
        const response = await fetch('http://localhost:3000/words', {
            // Specify the HTTP method as POST
            method: 'POST',
            // Sets the content type of the request body to JSON
            headers: {
                'Content-Type': 'application/json',
            },
            // Convert the 'db.words' object to a JSON string and sets it as the request body
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
    //resets onscreen div elements
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
    } else if (charArray.some(element => punctuation.test(element))) {
        returnValue = false;
    } else if (charArray.some(element => numbers.test(element))) {
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
