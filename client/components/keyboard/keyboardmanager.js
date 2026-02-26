import { isValidWord } from "../duotrigordle/WordManager";
import { isValidKey, keyboardRows } from "./keys"; 

export default class KeyBoardManager {
    setGuesses;
    setInputs;

    guesses;
    inputs;

    constructor(setInputs, setGuesses) {
        this.setInputs = setInputs;
        this.setGuesses = setGuesses;

        this.guesses = [];
        this.inputs = [];
    }

    onKeyPress = async (key) => {
        switch (key) {
            case "backspace":
                this.onBackspace();
                break;
            case "enter":
                await this.onEnter();
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

    onEnter = async () => {
        if (this.inputs.length !== 5) {
            return;
        }

        const guess = this.inputs.join("");
        
        const valid = await isValidWord(guess);
        if (!valid) return;

        this.guesses.push(guess);
        this.setGuesses([...this.guesses]);
        this.inputs = [];
    }
}