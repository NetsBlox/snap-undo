/* globals SnapDriver, InteractionGenerator */
/* eslint-disable no-console, no-unused-vars */

const frame = document.getElementsByTagName('iframe')[0];
const url = window.location.href.replace(window.location.pathname, '');
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
    driver.setWindow(frame.contentWindow);
    const seed = getRandomSeed();
    const tester = new InteractionGenerator(driver, null, seed);
    const {SnapActions, SnapUndo, UndoManager} = driver.globals();
    let undoCount = 0;

    while (true) {
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

function getRandomSeed() {
    const querystring = window.location.href.replace(/^.*\?/, '')
        .replace('#' + window.location.hash, '');

    const seed = querystring.split('&')
        .map(chunk => chunk.split('='))
        .find(pair => pair[0] === 'seed');

    return seed ? seed.pop() : null;
}

