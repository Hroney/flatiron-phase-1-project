//This section adds an event listener (click) to the button "createButton"
document.getElementById("createButton").addEventListener("click", createDivs);

//This section adds an event listener (keydown) to the action of pressing the "Enter key"
let userInput = document.getElementById("userInput");
userInput.addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
        createDivs();
    }
});


class Word {
    constructor(name) {
        this.name = name;
        this.definitions = [];
        this.nameArray = [];
    }
    addDefinition(definition, partOfSpeech) {
        this.definitions.push({ definition, partOfSpeech })
    }
    splitTheWord() {
        this.nameArray = this.name.toUpperCase().split('')
    }
}



//This function creates the word object.
async function isAWord(userInput) {
    let word = userInput.toLowerCase()
    const apiUrl = `https://api.dictionaryapi.dev/api/v2/entries/en/${word}`;
    //Checks the word to make sure it's a single string word
    if (isASingleWord(userInput)) {
        try {
            //Makes the API call
            const response = await fetch(apiUrl);
            const data = await response.json();
            if (data.title === "No Definitions Found") {
                // alert("That word is not in the API's dictionary")
                return new Word('');
            } else {
                const theWord = new Word(data[0].word);
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



//This function creates the game pieces and gives them functionality
async function createDivs() {
    const userInput = document.getElementById("userInput").value;
    const characterContainer = document.getElementById("characterContainer");
    const choicesDiv = document.querySelector(".choices");

    const theWord = await isAWord(userInput)

    //This portion resets the onscreen div sections
    characterContainer.innerHTML = '';
    choicesDiv.innerHTML = '';

    theWord.nameArray.forEach((char, i) => {
        const divBox = document.createElement("div");
        divBox.classList.add("character-box");
        divBox.textContent = char;
        divBox.addEventListener("click", async () => {
            choicesDiv.innerHTML = '';
            let arrayThing = possibleWords(theWord, i)
            const promiseArray = arrayThing.map(item => isAWord(item))

            const wordObjects = await Promise.all(promiseArray)
            createDefinitionDivs(wordObjects, choicesDiv)

        });
        characterContainer.appendChild(divBox);
    });
    document.getElementById("userInput").value = "";
}


//This function checks the character array to see if it's a continuous string without spaces/punctuation
function isASingleWord(userInput) {
    //I looked up the regex for this portion, it should grab every punctuation marker and number.
    let charArray = userInput.split('')
    const punctuation = /[!"#$%&'()*+,-./:;<=>?@[\]^_`{|}~]/;
    const numbers = /\d+/g;
    let returnValue = true;

    //This is the Test to make sure the word is a single word and not a sentence.
    if (charArray.some(element => element.includes(' '))) {
        returnValue = false;
    }
    else if (charArray.some(element => punctuation.test(element))) {
        returnValue = false;
    } else if (charArray.some(element => numbers.test(element))) {
        returnValue = false;
    }
    return returnValue
}

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


//this function creates the divs for definitions and the words
function createDefinitionDivs(objectArray, choicesDiv) {
    objectArray.forEach(word => {
        if (word.name === '') {
            //do nothing
        } else {
            //This creates a container for each word
            const wordContainer = document.createElement("div");
            wordContainer.classList.add("word-container");

            //This populates the container
            const nameDiv = document.createElement("div");
            nameDiv.classList.add("word-name");
            nameDiv.textContent = `Word: ${word.name}`;
            wordContainer.appendChild(nameDiv);

            //this creates divs for the definitions and populates them
            word.definitions.forEach((definition, index) => {
                const definitionDiv = document.createElement("div");
                definitionDiv.classList.add("word-definition");
                definitionDiv.textContent = `Definition ${index + 1}: ${definition.definition} (Part of Speech: ${definition.partOfSpeech})`;
                wordContainer.appendChild(definitionDiv);
            });

            // Appends the wordcontainer to the "choices" div
            choicesDiv.appendChild(wordContainer);
        }
    })
}