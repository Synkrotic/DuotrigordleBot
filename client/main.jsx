import { createRoot } from 'react-dom/client';
import App from './pages/app.jsx';
import { StrictMode } from 'react';
import { DiscordProvider } from './discordContext.jsx';

createRoot(document.getElementById('app')).render(
    <StrictMode>
        <DiscordProvider>
            <App />
        </DiscordProvider>
    </StrictMode>
);