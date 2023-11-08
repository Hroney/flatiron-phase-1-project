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


    characterContainer.innerHTML = '';
    const characters = userInput.split('');

    //I looked up the regex for this portion
    const punctuation = /[!"#$%&'()*+,-./:;<=>?@[\]^_`{|}~]/;
    //This is the Test to make sure the word is a single word and not a sentence.
    if (characters.some(element => element.includes(' '))) {
        alert(`The word ${userInput} has a space in it`)
        characters = '';
    }
    else if (characters.some(element => punctuation.test(element))) {
        alert(`The word ${userInput} has punctuation in it`)
        characters = '';
    }

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
