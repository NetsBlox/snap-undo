/* globals SnapDriver, InteractionGenerator */
/* eslint-disable no-console, no-unused-vars */

const frame = document.getElementsByTagName('iframe')[0];
const url = window.location.href
    .replace(window.location.pathname, '')
    .replace(window.location.hash, '');
frame.setAttribute('src', url);

function checkLoaded() {
    const loaded = frame.contentWindow.world;

    if (loaded) {
        onIframeReady();
    } else {
        setTimeout(checkLoaded, 10);
    }
}

window.onload = () => {
    checkLoaded();
};

async function onIframeReady() {
    document.body.style.visibility = 'visible';
    const driver = new SnapDriver(frame.contentWindow.world);
    const options = getOptions();
    driver.setWindow(frame.contentWindow);
    frame.style.setProperty('width', `${options.width}px`);
    frame.style.setProperty('height', `${options.height}px`);

    while (true) {
        setOptions(options);
        await runTest(driver, options);

        options.seed = Date.now();
    }
}

async function runTest(driver, options) {
    const {SnapActions, SnapUndo, UndoManager} = driver.globals();
    let remainingActions = options.count;
    let undoCount = 0;

    while (remainingActions--) {
        const tester = new InteractionGenerator(driver, null, options.seed);
        await tester.act();
        // Test that the last action can be undone (and redone)
        if (undoCount < SnapUndo.allEvents.length) {
            const lastEvent = SnapUndo.allEvents[SnapUndo.allEvents.length - 1];
            if (lastEvent && !lastEvent.replayType && !lastEvent.isUserAction) {
                const event = SnapUndo.getInverseEvent(lastEvent);
                event.replayType = UndoManager.UNDO;
                event.owner = lastEvent.owner;
                event.isReplay = true;
                await SnapActions.applyEvent(event);
                await SnapActions.applyEvent(lastEvent);
            }
            undoCount = SnapUndo.allEvents.length;
        }
        await driver.sleep(250);
    }
}

function getOptions() {
    const opts = {};

    window.location.hash.substring(1).split('&')
        .map(chunk => chunk.split('='))
        .forEach(chunk => {
            const [key, value] = chunk;
            opts[key] = value;
        });

    // Set defaults
    opts.seed = opts.seed || Date.now();
    opts.width = opts.width || document.body.getBoundingClientRect().width;
    opts.height = opts.height || document.body.getBoundingClientRect().height;
    opts.count = opts.count || -1;

    return opts;
}

function setOptions(opts) {
    opts.width = opts.width || frame.getBoundingClientRect().width;
    opts.height = opts.height || frame.getBoundingClientRect().height;

    window.location.hash = Object.entries(opts)
        .map(pair => pair.join('=')).join('&');
}
