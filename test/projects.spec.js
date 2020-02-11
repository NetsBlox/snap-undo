/* globals driver */
async function loadProjectTests() {
    driver._window.mocha = mocha;
    driver._window.it = it;
    describe('project tests', function() {

        const projectNames = [
            //'chart-tests',
            //'earthquakes',

            'rpc-list-tests',
            'serialize-fn-rpcs',
            'trivia-tests',
            'kvstore-tests',
            //'execute-tests',
            'hangman-tests',
            'air-quality-tests',
            'google-maps-tests',
            'send-fn-tests',
        ];

        for (let i = projectNames.length; i--;) {
            const name = projectNames[i];
            describe(`${name} project`, function() {
                let error = null;
                let handleError = null;

                before(async function() {
                    this.timeout(10000);
                    await loadProject(name);

                    const {Process} = driver.globals();
                    handleError = Process.prototype.handleError;
                    Process.prototype.handleError = function(e) {
                        error = e;
                        return handleError.apply(this, arguments);
                    };
                });

                beforeEach(() => error = null);

                after(function() {
                    const {Process} = driver.globals();
                    Process.prototype.handleError = handleError;
                });

                it('should run tests without error', async function() {
                    this.timeout(5000);
                    driver.ide().runScripts();
                    await driver.expect(
                        () => {
                            const procs = driver.ide().stage.threads.processes;
                            const runningProcs = procs.filter(proc => !proc.readyToTerminate);
                            return runningProcs.length === 0;
                        },
                        'Script execution did not terminate'
                    );

                    if (error) {
                        throw error;
                    }
                });
            });
        }
    });
}

async function loadProject(name) {
    const url = `/test/projects/${name}.xml`;
    const response = await fetch(url);
    const xml = (await response.text())
        .replace(/^.*<project/, '<project')
        .replace(/<\/project>.*/, '');

    const {SnapActions} = driver.globals();
    return SnapActions.openProject(xml);
}
