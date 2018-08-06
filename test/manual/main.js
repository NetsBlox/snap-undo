/* globals WSMonkey, SnapDriver */
/* eslint-disable no-console, no-unused-vars */

const frames = Array.prototype.slice.call(document.getElementsByTagName('iframe'));
var driver = null,
    monkey = null;

frames.forEach(frame => {
    frame.setAttribute('src', window.origin);
});

function startTests() {
    return frames
        .reduce((promise, frame) => {
            return promise.then(() => {
                driver = new SnapDriver(frame.contentWindow.world);
                driver.setWindow(frame.contentWindow);
                monkey = new WSMonkey(frame.contentWindow.world);
                return driver.login('test');
            });
        }, Promise.resolve())
        .then(() => {
            onIframesReady();
        });
}

function checkLoaded() {
    const allLoaded = frames.reduce((isLoaded, frame) => {
        return isLoaded && !!frame.contentWindow.world;
    }, true);

    if (allLoaded) {
        startTests();
    } else {
        setTimeout(checkLoaded, 10);
    }
}

window.onload = () => {
    fitIframes();
    checkLoaded();
};

// computes the appropriate height for iframes
// handles one iframe for now
function fitIframes() {
    let idealHeight = window.innerHeight - document.getElementById('footer').clientHeight;
    frames[0].style.height = idealHeight;
}

function onIframesReady() {
    console.log('all iframes ready');
    setupVue();
}

function setupVue() {
    const app = new Vue({
        el: '#footer',
        data: {
            status: {
                ws: monkey._status,
            },
        },

        computed: {
            monkeyToggleBtnText() {
                return this.status.wsMonkeyPlaying ? 'stop' : 'start';
            },
            wsMonkeyPlaying() {
                return !monkey._playOver;
            }
        },

        methods: {
            toggleWsMonkey() {
                if (monkey.isPlaying) {
                    monkey.stopPlaying();
                    // this.status.wsMonkeyPlaying = monkey.isPlaying;
                } else {
                    monkey.startPlaying();
                    // this.status.wsMonkeyPlaying = monkey.isPlaying;
                }
            },
        }
    });
}



