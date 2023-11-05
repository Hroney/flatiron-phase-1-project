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
