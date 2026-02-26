export default class KeyBoardManager {
    constructor(inputsRef, guessesRef, setInputs, setGuesses) {
        this.inputs = inputsRef;
        this.guesses = guessesRef;
        this.setInputs = setInputs;
        this.setGuesses = setGuesses;
    }

    onKeyPress = async (key) => {
        switch (key) {
            case "backspace":
                this.inputs.current.pop();
                break;
            case "enter":
                await this.onEnter();
                break;
            default:
                if (this.inputs.current.length >= 5) return;
                this.inputs.current.push(key);
                break;
        }
        this.setInputs([...this.inputs.current]);
    }

    onEnter = async () => {
        if (this.inputs.current.length !== 5) return;
        const guess = this.inputs.current.join("");
        const valid = await isValidWord(guess);
        if (!valid) return;
        this.guesses.current.push(guess);
        this.setGuesses([...this.guesses.current]);
        this.inputs.current = [];
        this.setInputs([]);
    }

    onKeyPressEvent = (event) => {
        const pressedKey = event.key.toLowerCase();
        if (isValidKey(pressedKey)) this.onKeyPress(pressedKey);
    }
}