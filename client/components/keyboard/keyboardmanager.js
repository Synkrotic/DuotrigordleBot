import { isValidKey, keyboardRows } from "./keys"; 

export default class KeyBoardManager {
    guesses;
    setInputs;
    inputs;

    constructor(setInputs) {
        this.setInputs = setInputs;
        this.inputs = [];
        this.guesses = [];
    }

    getInputs() {
        return this.inputs;
    }

    getGuesses() {
        return this.guesses;
    }

    onKeyPress = (key) => {
        switch (key) {
            case "backspace":
                this.onBackspace();
                break;
            case "enter":
                this.onEnter();
                break;
            default:
                if (this.inputs.length >= 5) return;
                this.inputs.push(key);
                break;
        }

        this.setInputs([...this.inputs])
    }
    onKeyPressEvent = (event) => {
        const pressedKey = event.key.toLowerCase();

        if (isValidKey(pressedKey)) {
            this.onKeyPress(pressedKey);
        }
    }

    onBackspace = () => {
        this.inputs.pop();
    }

    onEnter = () => {
        if (this.inputs.length != 5) return; 

        const guess = this.inputs.join("");
        this.guesses.push(guess);
        this.inputs = [];
    }
}