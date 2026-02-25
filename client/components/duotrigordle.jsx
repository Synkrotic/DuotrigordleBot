import React from "react";
import Wordle from "./wordle";

export default class Duotrigordle extends React.Component {
    keyboardManager;
    
    constructor(manager) {
        super();
        this.keyboardManager = manager;
    }


    render() {
        return (
            <>
                <section className="duotrigordle">
                    {
                        Array.from({ length: 32 }, (_, i) => (
                            <Wordle
                                key={i}
                                correctWord="pecan"
                                manager={this.keyboardManager}
                            />
                        ))
                    }
                </section>
            </>
        );
    }
}