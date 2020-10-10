/* globals NetsBloxExtensions, snapEquals, fontHeight, Point, DialogBoxMorph,
 ScrollFrameMorph, nop, HandleMorph, List, SpriteMorph, ToggleMorph, BlockMorph*/
// This is an example extension for autograding in NetsBlox
(function() {
    class Autograder {
        constructor(ide) {  // TODO: Use an API wrapper instead?
            this.name = 'CS1000';
            this.ide = ide;
            this.currentAssignment = null;
            this.resultsDialog = null;
            this.assignments = [
                new CustomBlockAssignment(
                    this.ide,
                    'Assignment 2: Between',
                    'assignment-two/between.xml',
                    `is %'number' between %'lower' and %'upper'`,
                    [
                        new TestCase([2, 1, 3], true),
                        new TestCase([1, 1, 3], true),
                        new TestCase([3, 1, 3], true),
                        new TestCase([-2, -3, -1], true),
                        new TestCase([-1, -3, -1], true),
                        new TestCase([-3, -3, -1], true),
                        new TestCase([0, -1, -3], false),
                        new TestCase([-4, -1, -3], false),
                        new TestCase([0, 1, 3], false),
                        new TestCase([4, 1, 3], false),
                    ]
                ),
                new CustomBlockAssignment(
                    this.ide,
                    'Assignment 3: Contains',
                    'assignment-three/contains.xml',
                    `is there a %'letter' in %'word'`,
                    [
                        new TestCase(['c', 'cat'], true),
                        new TestCase(['a', 'cat'], true),
                        new TestCase(['t', 'cat'], true),
                        new TestCase(['a', 'dog'], false),
                        new TestCase(['d', 'snack'], false),
                        new TestCase(['C', 'snack'], true),
                    ]
                ),
                new CustomBlockAssignment(
                    this.ide,
                    'Assignment 4: Reverse List',
                    'assignment-four/reverse-list.xml',
                    `reverse %'original list'`,
                    [
                        new TestCase([[]], []),
                        new TestCase([[1, 2]], [2, 1]),
                        new TestCase([[2, 1, 3]], [3, 1, 2]),
                        new TestCase([[2, 1, []]], [[], 1, 2]),
                    ]
                ),
                new CustomBlockAssignment(
                    this.ide,
                    'Assignment 5: To Lowercase',
                    'assignment-five/to-lower-case.xml',
                    `to lowercase %'original string'`,
                    [
                        new TestCase(['abc'], 'abc'),
                        new TestCase(['aBc'], 'aBc'),
                        new TestCase(['123'], '123'),
                        new TestCase(['HeLlO?'], 'hello?'),
                    ]
                ),
            ];
        }

        getMenu() {
            const dict = {};
            if (this.currentAssignment) {
                dict[`Grade assignment`] = () => this.grade(this.currentAssignment);
                dict['~'] = '~';
                const submenu = {};
                this.assignments.forEach(assignment => {
                    submenu[assignment.name] = () => this.loadAssignment(assignment);
                });
                dict['Switch to...'] = submenu;
            } else {
                this.assignments.forEach(assignment => {
                    dict[`Start ${assignment.name}`] = () => this.loadAssignment(assignment);
                });
            }

            return dict;
        }

        async showResults(testResults) {
            if (!this.resultsDialog) {
                const world = this.ide.world();
                const dialog = new DialogBoxMorph().withKey('GradeAssignment');
                const frame = new ScrollFrameMorph();
                frame.acceptsDrops = false;
                frame.contents.acceptsDrops = false;
                frame.color = dialog.color;
                frame.fixLayout = nop;

                dialog.labelString = `${this.currentAssignment.name} Results`;
                dialog.createLabel();
                dialog.addBody(frame);
                dialog.addButton('ok', 'Rerun');
                dialog.addButton('cancel', 'Close');
                dialog.ok = () => this.grade(this.currentAssignment);
                dialog.cancel = () => {
                    this.resultsDialog = null;
                    DialogBoxMorph.prototype.cancel.call(dialog);
                };

                dialog.fixLayout = function () {
                    var th = fontHeight(this.titleFontSize) + this.titlePadding * 2,
                        x = 0,
                        y = 0,
                        fp;
                    this.buttons.fixLayout();
                    this.body.setPosition(this.position().add(new Point(
                        this.padding,
                        th + this.padding
                    )));
                    this.body.setExtent(new Point(
                        this.width() - this.padding * 2,
                        this.height() - this.padding * 3 - th - this.buttons.height()
                    ));
                    fp = this.body.position();
                    frame.contents.children.forEach(function (icon) {
                        icon.setPosition(fp.add(new Point(x, y)));
                        y += icon.height();
                    });
                    frame.contents.adjustBounds();
                    this.label.setCenter(this.center());
                    this.label.setTop(this.top() + (th - this.label.height()) / 2);
                    this.buttons.setCenter(this.center());
                    this.buttons.setBottom(this.bottom() - this.padding);

                    // refresh shadow
                    this.removeShadow();
                    this.addShadow();
                };

                dialog.popUp(world);
                dialog.setExtent(new Point(400, 300));
                dialog.setCenter(world.center());

                new HandleMorph(
                    dialog,
                    300,
                    280,
                    dialog.corner,
                    dialog.corner
                );
                this.resultsDialog = dialog;
            }

            const frame = this.resultsDialog.body;

            frame.contents.children = testResults.map(result => {
                // TODO: Create a test result line with either a green tick or a red x
                //const icon = new SymbolMorph('tick', 12);
                const {testCase} = result;
                let message = this.currentAssignment.getTestName(testCase);
                if (!result.status && result.getFailureReason()) {
                    message += ` (${result.getFailureReason()})`;
                }
                const icon = new ToggleMorph(
                    'checkbox',
                    null,
                    nop,
                    message,
                    () => result.status
                );
                const RED = SpriteMorph.prototype.blockColor.lists;
                const GREEN = SpriteMorph.prototype.blockColor.operators;
                icon.color = result.status ? GREEN : RED;
                icon.trigger = nop;
                icon.mouseClickLeft = nop;
                icon.mouseDownLeft = nop;
                icon.mouseEnter = nop;
                icon.mouseLeave = nop;
                icon.isDraggable = false;
                icon.userMenu = nop;
                return icon;
            });
            frame.contents.adjustBounds();
            this.resultsDialog.fixLayout();
        }

        async loadAssignment(assignment) {
            let message = `Would you like to start ${assignment.name}?`;

            if (this.currentAssignment) {
                const isReload = this.currentAssignment === assignment;
                message = isReload ?
                    `Would you like to reload ${assignment.name}?` :
                    `Would you like to stop working on ${this.currentAssignment.name}\n\nand switch to ${assignment.name}?`;
                
            }

            const title = `Start ${assignment.name}`;
            const confirmed = await this.ide.confirm(message, title);
            if (confirmed) {
                const xml = await assignment.fetch();
                this.ide.droppedText(xml);
                this.currentAssignment = assignment;
                if (this.resultsDialog) {
                    this.resultsDialog.destroy();
                    this.resultsDialog = null;
                }
            }
        }

        async grade(assignment) {
            const testResults = await assignment.grade();
            this.showResults(testResults);
        }
    }

    class Assignment {
        constructor(name, filepath) {
            this.name = name;
            this.filepath = filepath;
        }

        async fetch() {
            const url = `https://raw.githubusercontent.com/CliffordAnderson/CS1000/master/${this.filepath}`;
            const response = await fetch(url);
            return await response.text();
        }

        async grade() {
            throw new Error(`Cannot grade ${this.name}`);
        }
    }

    class CustomBlockAssignment extends Assignment {
        constructor(ide, name, filepath, spec, testCases) {
            super(name, filepath);
            this.ide = ide;
            this.blockSpec = spec;
            this.testCases = testCases;
        }

        async grade() {
            const block = this.getCustomBlockDefinition(this.blockSpec);
            const evalBlock = this.evalBlock.bind(this, block);
            return await Promise.all(
                this.testCases.map(testCase => testCase.run(evalBlock))
            );
        }

        async evalBlock(definition) {
            const block = definition.blockInstance();
            const inputs = Array.prototype.slice.call(arguments, 1);
            const {threads} = this.ide.stage;
            zip(block.inputs(), inputs).forEach(pair => {
                const [input, value] = pair;
                if (value instanceof List) {
                    const valueAsBlock = value.blockify();
                    block.replaceInput(input, valueAsBlock);
                } else {
                    input.setContents(value);
                }
            });

            return new Promise((resolve, reject) => {
                const process = threads.startProcess(
                    block,
                    this.ide.stage,
                    true,
                    false,
                    resolve,
                );
                const handleError = process.handleError;
                process.handleError = function(error) {
                    reject(error);
                    return handleError.call(this, ...arguments);
                };
            });
        }

        getCustomBlockDefinition(spec) {
            return this.ide.stage.globalBlocks.find(
                block => block.spec === spec
            );
        }

        getTestName(testCase) {
            const {inputs, output} = testCase;
            const spec = this.blockSpec;
            let index = 0;
            const testCaseName = BlockMorph.prototype.parseSpec(spec)
                .map(spec => {
                    const isInput = !BlockMorph.prototype.labelPart(spec);
                    if (isInput) {
                        return inputs[index++];
                    }
                    return spec;
                })
                .join(' ');
            return `"${testCaseName}" should report ${output}`;
        }
    }

    class TestCase {
        constructor(inputs, output) {
            this.inputs = inputs;
            this.output = output;
        }

        async run(fn) {
            try {
                const result = await fn(...this.inputs.map(toSnap));
                if (snapEquals(result, toSnap(this.output))) {
                    return new TestResult(this, true);
                } else {
                    return new FailingTest(this, result, this.output);
                }
            } catch (err) {
                return new ErroredTest(this, err);
            }
        }
    }

    class TestResult {
        constructor(testCase, status) {
            this.testCase = testCase;
            this.status = status;
        }

        getFailureReason() {
            return '';
        }
    }

    class FailingTest extends TestResult {
        constructor(testCase, actual, expected) {
            super(testCase, false);
            this.actual = actual;
            this.expected = expected;
        }

        getFailureReason() {
            if (this.actual !== null) {
                return `reported "${toJS(this.actual)}"`;
            } else {
                return 'did not report';
            }
        }
    }

    class ErroredTest extends TestResult {
        constructor(testCase, error) {
            super(testCase, false);
            this.error = error;
        }

        getFailureReason() {
            return 'error!';
        }
    }

    function zip() {
        const lists = new Array(...arguments);
        const len = Math.min(...lists.map(l => l.length));
        const result = [];

        for (let i = 0; i < len; i++) {
            result.push(lists.map(l => l[i]));
        }

        return result;
    }

    function toSnap(data) {
        if (Array.isArray(data)) {
            const contents = data.map(toSnap);
            return new List(contents);
        } else if (typeof data === 'object') {
            return toSnap(Object.entries(data));
        }
        return data;
    }

    function toJS(data) {
        if (data instanceof List) {
            return data.asArray().map(toJS);
        } else {
            return data;
        }
    }

    NetsBloxExtensions.register(Autograder);
})();
