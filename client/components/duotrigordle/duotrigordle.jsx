import { useEffect, useState } from "react";
import { getTodaysWords } from "./WordManager";
import { useDiscord } from "../../discordContext";
import Wordle from "./wordle";


export default function Duotrigordle({ inputs, guesses, guessesRef, setGuesses, setSolved }) {
    const { self } = useDiscord();
    const [words, setWords] = useState([]);
    const [firstLoad, setFirstLoad] = useState(false);
	const day = new Date().toLocaleDateString('en-CA');
	const userId = self.id;

    useEffect(() => {
        getTodaysWords().then(setWords);
    
        console.log(new Date())
        console.log(day)

		// Get progress
		fetch(`/api/progress/${userId}/${day}`, { method: "GET" })
            .then(res => res.json())
            .then(data => {
                const loaded = data.guesses || [];
                guessesRef.current = loaded;

		    	setGuesses(data.guesses || []);
                setFirstLoad(true);
	    	}
        );
    }, [])

    useEffect(() => {
        if (!firstLoad) return;

        // Update progress
		fetch(`/api/progress`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                userId: userId,
                day: day,
                guesses: guesses 
            })
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