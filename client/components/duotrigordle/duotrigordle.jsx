import React, { useEffect, useState } from "react";
import Wordle from "./wordle";
import { getTodaysWords } from "./WordManager";

export default function Duotrigordle({ inputs, guesses }) {
    const [words, setWords] = useState([]);

    useEffect(() => {
        getTodaysWords().then(setWords);
    }, [])

    return (
        <>
            <section className="duotrigordle">
                {
                    words.map((word, i) => (
                        <Wordle
                            key={i}
                            index={i}
                            inputs={inputs}
                            guesses={guesses}
                            correctWord={word}
                        />
                    ))
                }
            </section>
        </>
    );
}