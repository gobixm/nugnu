#!/usr/bin/env node

import {
    run
} from '../dist/nugnu.js';


(async () => {
    try {
        await run();
    } catch (e) {
        console.error('unhandled exception', e);
    }
})();