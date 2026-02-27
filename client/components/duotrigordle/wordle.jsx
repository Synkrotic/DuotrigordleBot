import { useEffect, useState } from "react";

function LetterGuess({ children, color, className }) {
    return (
        <div className={
            `letter-guess-container
            ${color ? ` ${color}` : ""}
            ${className ? ` ${className}` : ""}`
        }>
            <p>{children}</p>
        </div>
    );
}

export default function Wordle({ inputs, guesses, correctWord, index, setSolved }) {
    const [guessLock, setGuessLock] = useState(Infinity)

    useEffect(() => {
        if (guessLock === Infinity) {
            if (guesses.includes(correctWord)) {
                setSolved(index);
            }
        }
    }, [guesses])

    return (
        <div className="wordle">
            <h3>Wordle {index + 1}</h3>
            {guesses.slice(0, guessLock).map((guess, i) => (
                <div key={i} className="wordle-row">
                    {
                        guess.split("").map((letter, j) => {
                            let color = "gray2";
                            if (correctWord[j] === letter) color = "green";
                            else if (correctWord.includes(letter)) color = "yellow"
                            else if (!correctWord.includes(letter)) color = "gray4"

                            return <LetterGuess color={color} key={j}>{letter}</LetterGuess>
                        })
                    }
                </div>
            ))}
            {guessLock === Infinity && (
                <div className="wordle-row">
                    {
                        Array.from({ length: 5 }, (_, i) => {
                            let correctGuess = null;
                            for (const guess of guesses) {
                                if (guess[i] === correctWord[i]) {
                                    correctGuess = guess[i];
                                    break;
                                }
                            }

                            return <LetterGuess
                                        className={(!inputs[i] && correctGuess) ? "preview" : ""}
                                        key={i}
                                   >
                                       {inputs[i] || correctGuess}
                                   </LetterGuess>;
                        })
                    }
                </div>
            )}
        </div>
    );
}