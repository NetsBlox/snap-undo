/*globals driver, expect, SnapCloud*/
describe.only('save', function() {
    this.timeout(10000);

    function showingSaveMsg() {
        const menu = driver.dialog();
        const message = menu && menu.title && menu.title.toLowerCase();
        if (message) {
            return message.includes('saved') && message.includes('cloud');
        }
        return false;
    }

    function saveProject() {
        // Get the save button
        const controlBar = driver.ide().controlBar;
        driver.click(controlBar.projectButton);
        let menu = driver.dialog();
        const saveBtn = menu.children.find(child => child.action === 'save');

        driver.click(saveBtn);

        // Wait for the save message
        return driver.expect(
            showingSaveMsg,
            `Did not see save message after "Save"`
        );
    }

    function getProjectList(projectDialog) {
        return projectDialog.listField.listContents.children
            .map(item => item.labelString);
    }

    function openProjectsBrowser() {
        const controlBar = driver.ide().controlBar;

        driver.click(controlBar.projectButton);
        let menu = driver.dialog();
        const openBtn = menu.children.find(child => child.action === 'openProjectsBrowser');

        driver.click(openBtn);

        // Open the saved project
        const projectDialog = driver.dialog();
        return driver.expect(
            () => getProjectList(projectDialog)[0] !== '(empty)',
            'Open project dialog did not populate with projects'
        )
        .then(() => projectDialog);
    }

    function openSavedProject(projectName) {
        // Open the project dialog
        let projectDialog;
        return openProjectsBrowser()
            .then(dialog => {
                projectDialog = dialog;
                return driver.expect(
                    () => getProjectList(projectDialog).includes(projectName),
                    `Could not find ${projectName} in project list`
                );
            })
            .then(() => {
                const projectList = projectDialog.listField.listContents.children;
                const listItem = projectList.find(item => item.labelString === projectName);
                driver.click(listItem);
                projectDialog.accept();

                // Check for the if-else block
                return driver.expect(
                    () => {
                        const blockCount = driver.ide().currentSprite.scripts.children.length;
                        return blockCount > 0;
                    },
                    `Did not see blocks after loading saved project`
                );
            });

    }

    describe.skip('w/o ws conn', function() {
        before(function() {
        });

        after(function() {
        });

        it('should be able to save and reload the project (no ws conn)', function() {
            // Should be able to save without a ws connection
            // TODO
        });

    });

    describe('basic tests', function() {
        beforeEach(() => {
            return driver.reset()
                .then(() => driver.addBlock('doIfElse'))
                .then(() => driver.selectCategory('control'));
        });

        it('should be able to save and reload the project', function() {
            // Get the project name
            const projectName = `can-reload-${Date.now()}`;

            return driver.setProjectName(projectName)
                .then(() => saveProject())
                .then(() => driver.reset())
                .then(() => openSavedProject(projectName));
        });

        it('should overwrite on rename', function() {
            const projectName = `rename-test-${Date.now()}`
            const newName = `RENAMED-${projectName}`;

            return driver.setProjectName(projectName)
                .then(() => saveProject())
                .then(() => driver.setProjectName(newName))
                .then(() => openProjectsBrowser())
                .then(projectDialog => {
                    let projectList = projectDialog.listField.listContents
                        .children.map(child => child.labelString);
                    return driver
                        .expect(
                            () => {
                                projectList = projectDialog.listField.listContents
                                    .children.map(child => child.labelString);
                                return projectList.includes(newName);
                            },
                            `Could not find ${newName} in project list`
                        )
                        .then(() => expect(projectList.includes(projectName)).toBe(false));
                });
        });
    });

    // Should not save a copy if not already saved
    // TODO
    describe('save as', function() {
        let projectName;
        let saveAsName;

        before(function() {
            projectName = `save-as-${Date.now()}`;

            return driver.setProjectName(projectName)
                .then(() => driver.addBlock('doIfElse'))
                .then(() => saveProject())
                .then(() => driver.reset())
                .then(() => openSavedProject(projectName))
                .then(() => {
                    // save as
                    const controlBar = driver.ide().controlBar;
                    driver.click(controlBar.projectButton);

                    const menu = driver.dialog();
                    const saveBtnIndex = menu.children
                        .findIndex(child => child.action === 'save');
                    const saveAsBtn = menu.children[saveBtnIndex+1];
                    driver.click(saveAsBtn);

                    // Enter the new project name
                    saveAsName = `new${projectName}-saveAs`;
                    driver.keys(saveAsName);
                    driver.dialog().accept();

                    return driver.expect(
                        showingSaveMsg,
                        `Did not see save message after "Save As"`
                    );
                });
        });

        it('should change name of current project', function() {
            return driver.expect(
                () => driver.ide().room.name === saveAsName,
                `Project name not updated (expected ${saveAsName})`
            );
        });

        it('should make a copy on save as', function() {
            return openProjectsBrowser()
                .then(projectDialog => {
                    // Check that both projects show up in the project list
                    return driver.waitUntil(() => {
                        // Click the cloud icon
                        const cloudSrc = projectDialog.srcBar.children[0];
                        driver.click(cloudSrc);

                        const projectList = projectDialog.listField.listContents
                            .children.map(child => child.labelString);
                        const hasOriginal = projectList.includes(projectName);
                        const hasSaveAsVersion = projectList.includes(saveAsName);

                        return hasOriginal && hasSaveAsVersion;
                    });
                });
        });
    });

    describe('saveACopy', function() {
        let username;

        beforeEach(() => username = SnapCloud.username);
        afterEach(() => SnapCloud.username = username);

        it('should create "Copy of <project>" on saveACopy', function() {
            const projectName = driver.ide().room.name;
            const ide = driver.ide();
            // make the user a collaborator
            SnapCloud.username = 'test';

            ide.room.collaborators.push(SnapCloud.username);
            ide.room.ownerId = 'otherUser';

            // Click the project menu
            driver.click(ide.controlBar.projectButton);
            const dialog = driver.dialog();
            const saveACopyBtn = dialog.children.find(item => item.action === 'saveACopy');
            driver.click(saveACopyBtn);
            return driver.expect(showingSaveMsg, `Did not see save message after "Save Copy"`)
                .then(() => openProjectsBrowser())
                .then(projectDialog => {
                    const copyName = `Copy of ${projectName}`;
                    return driver.expect(
                        () => getProjectList(projectDialog).includes(copyName),
                        `Could not find copied project (${copyName})`
                    );
                });
        });
    });
});
