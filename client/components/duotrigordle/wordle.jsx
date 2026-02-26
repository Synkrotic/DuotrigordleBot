import { useEffect, useState } from "react";

function LetterGuess({ children, color }) {
    return (
        <div className={`letter-guess-container${color ? ` ${color}` : ""}`}>
            <p>{children}</p>
        </div>
    );
}

export default function Wordle({ inputs, guesses, correctWord, index }) {
    const [guessLock, setGuessLock] = useState(Infinity)

    useEffect(() => {
        if (guesses.at(-1) === correctWord) {
            setGuessLock(guesses.length)
        }
    }, [guesses])

    return (
        <div className="wordle">
            <h3>Wordle {index}</h3>
            {guesses.slice(0, guessLock).map((guess, i) => (
                <div className="wordle-row">
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
                        Array.from({ length: 5 }, (_, i) => (
                            <LetterGuess key={i}>{inputs[i]}</LetterGuess>
                        ))
                    }
                </div>
            )}
        </div>
    );
}