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
        this.nameArray.push(this.name.split(''))
    }
}




function isAWord(userInput) {
    let word = userInput.toLowerCase()
    const apiUrl = `https://api.dictionaryapi.dev/api/v2/entries/en/${word}`;
    if (isASingleWord(userInput)) {
        fetch(apiUrl)
            .then(data => data.json())
            .then(data => {
                //This grabs each of the definition objects
                console.log(data)
                if (data.title === "No Definitions Found") {
                    //This should create an empty object saying it isn't a word
                    console.log("FAIL")
                } else {
                    const theWord = new Word(data[0].word)
                    data[0].meanings.forEach(object => {
                        object.definitions.forEach(definitionArray => {
                            theWord.addDefinition(definitionArray.definition, object.partOfSpeech)
                        })
                        //This should populate an object with all of the data from that word.

                        // console.log(object)
                    })
                    console.log(theWord)
                }
            })
    }
    else {
        const theWord = new Word('')
        return theWord
    }
}



//This function creates the game pieces and gives them functionality
function createDivs() {
    const userInput = document.getElementById("userInput").value.toUpperCase();
    const characterContainer = document.getElementById("characterContainer");
    // let characters = userInput.split('');
    const theWord = isAWord(userInput)
    theWord.splitTheWord();
    //isASingleWord(characters, userInput)

    //This portion resets the onscreen div sections
    characterContainer.innerHTML = '';

    theWord.nameArray.forEach(char => {
        const divBox = document.createElement("div");
        divBox.classList.add("character-box");
        divBox.textContent = char;
        divBox.addEventListener("click", () => {
            alert(`You clicked on character: ${char}`);
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
        //alert(`The word/phrase ${userInput} is invalid; it has a space in it.`)
        returnValue = false;
    }
    else if (charArray.some(element => punctuation.test(element))) {
        // alert(`The word/phrase ${userInput} is invalid; it has punctuation in it.`)
        returnValue = false;
    } else if (charArray.some(element => numbers.test(element))) {
        //alert(`The word/phrase ${userInput} is invalid; it has a number in it.`)
        returnValue = false;
    }
    return returnValue
}