import React from 'react';
import { createRoot } from 'react-dom/client';
import '../css/app.css';
import './bootstrap';
import MiyaSushiApp from './MiyaSushiApp';

const container = document.getElementById('app');

if (container) {
    createRoot(container).render(
        <React.StrictMode>
            <MiyaSushiApp />
        </React.StrictMode>,
    );
}
