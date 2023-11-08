document.getElementById("createButton").addEventListener("click", createDivs);

const userInput = document.getElementById("userInput");

userInput.addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
        createDivs();
    }
});

function createDivs() {
    const userInput = document.getElementById("userInput").value.toUpperCase();
    const characterContainer = document.getElementById("characterContainer");
    let characters = userInput.split('');

    //I looked up the regex for this portion, it should grab every punctuation marker.
    const punctuation = /[!"#$%&'()*+,-./:;<=>?@[\]^_`{|}~]/;

    //This is the Test to make sure the word is a single word and not a sentence.
    if (characters.some(element => element.includes(' '))) {
        alert(`The word/phrase ${userInput} is invalid; it has a space in it.`)
        characters.length = 0
    }
    else if (characters.some(element => punctuation.test(element))) {
        alert(`The word/phrase ${userInput} is invalid; it has punctuation in it.`)
        characters.length = 0
    }

    //This portion resets the onscreen div sections
    characterContainer.innerHTML = '';

    characters.forEach(char => {
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
