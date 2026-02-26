import { useEffect, useState } from "react";
import { getTodaysWords } from "./WordManager";
import { useDiscord } from "../../discordContext";
import Wordle from "./wordle";


export default function Duotrigordle({ inputs, guesses, setGuesses, setSolved }) {
    const { self } = useDiscord();
    const [words, setWords] = useState([]);
	const day = new Date().toISOString().split('T')[0];
	const userId = self.id;

    useEffect(() => {
        getTodaysWords().then(setWords);
    
		// Get progress
		fetch(`/api/progress/${userId}/${day}`, { method: "GET" }).then(res => {
            const r = {"guesses":["chess", "guess", "pecan"]}
			setGuesses(r.guesses)
		});
    }, [])

    useEffect(() => {
        // Update progress
		fetch(`/api/progress`, {
            method: "POST",
            contentType: "application/json",
            body: {
                userId: userId,
                day: day,
                guesses: guesses 
            }
        }).then(res => {
			console.log(res)
		});
    }, [guesses])

    return (
        <>
            <section className="duotrigordle flex-center">
                {
                    words.map((word, i) => (
                        <Wordle
                            key={i}
                            index={i}
                            inputs={inputs}
                            guesses={guesses}
                            correctWord={word}
                            setSolved={setSolved}
                        />
                    ))
                }
            </section>
        </>
    );
}