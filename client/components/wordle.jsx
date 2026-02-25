import { useImperativeHandle } from "react";

function LetterGuess({ children }) {
    return (
        <div className="letter-guess-container">
            <p>{children}</p>
        </div>
    );
}

export default function Wordle({ correctWord, manager }) {
    useImperativeHandle(ReferenceError, () => ({
        guess(word) {
            
        }
    }));

    return (
        <div className="wordle">
            <div className="wordle-row">
                {
                    Array.from({ length: 5 }, (_, i) => (
                        <LetterGuess key={i}>A</LetterGuess>
                    ))
                }
            </div>
        </div>
    );
}