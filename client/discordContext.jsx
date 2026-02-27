import { DiscordSDK, patchUrlMappings } from "@discord/embedded-app-sdk";
import { createContext, useContext, useEffect, useMemo, useState } from "react";

const DiscordContext = createContext(null);

export function DiscordProvider({ children }) {
    const [participants, setParticipants] = useState([]);
    const [self, setSelf] = useState(null);
    const [ready, setReady] = useState(false);

    const sdk = useMemo(() => {
        return new DiscordSDK(import.meta.env.VITE_DISCORD_CLIENT_ID);
    }, []);

    useEffect(() => {
        patchUrlMappings([{ prefix: "/api", target: import.meta.env.VITE_API_IP}])

        async function setup() {
            try {
                await sdk.ready();

                const { code } = await sdk.commands.authorize({
                    client_id: import.meta.env.VITE_DISCORD_CLIENT_ID,
                    response_type: "code",
                    state: "",
                    prompt: "none",
                    scope: ["identify"],
                });

                const { access_token } = await fetch("/api/token", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ code }),
                }).then(r => r.json());

                const { user } = await sdk.commands.authenticate({ access_token });
                setSelf(user);

                const { participants } = await sdk.commands.getInstanceConnectedParticipants();
                setParticipants(participants);
                setReady(true);

                // Subscriptions
                sdk.subscribe('ACTIVITY_INSTANCE_PARTICIPANTS_UPDATE', ({ participants }) => {
                    setParticipants(participants);
                });
            } catch (error) {
                console.error("Discord SDK setup failed!", error);
            }
        }

        setup();

        return () => {
            sdk.unsubscribe('ACTIVITY_INSTANCE_PARTICIPANTS_UPDATE');
        };
    }, [sdk]);

    return (
        <DiscordContext.Provider value={{ sdk, self, participants, ready }}>
            {children}
        </DiscordContext.Provider>
    );
}

export function useDiscord() {
    return useContext(DiscordContext);
}