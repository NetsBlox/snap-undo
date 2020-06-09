/* globals driver, expect */
describe('undo', function() {
    let SnapUndo, SnapActions, Point;
    before(() => {
        SnapUndo = driver.globals().SnapUndo;
        Point = driver.globals().Point;
        SnapActions = driver.globals().SnapActions;
    });

    beforeEach(() => driver.reset());

    describe('reset position', function() {
        let block, initialPosition;

        beforeEach(async () => {
            block = await driver.addBlock('forward');
            initialPosition = block.position().copy();
        });

        it('should restore pos after moveBlock (top)', async function() {
            const bottomBlock = await driver.addBlock('doSayFor', new Point(300, 300));
            const [target] = bottomBlock.attachTargets();
            await SnapActions.moveBlock(block, target);
            const undoId = driver.ide().currentSprite.scripts.undoOwnerId();
            await SnapUndo.undo(undoId);
            await driver.expect(
                () => initialPosition.eq(block.position()),
                `Block not restored to ${initialPosition} (${block.position()})`
            );
        });

        it('should restore pos after moveBlock (block)', async function() {
            const bottomBlock = await driver.addBlock('doSayFor', new Point(300, 300));
            const [, , target] = bottomBlock.attachTargets();
            await SnapActions.moveBlock(block, target);
            const undoId = driver.ide().currentSprite.scripts.undoOwnerId();
            await SnapUndo.undo(undoId);
            await driver.expect(
                () => initialPosition.eq(block.position()),
                `Block not restored to ${initialPosition} (${block.position()})`
            );
        });

        it('should restore pos after setBlockPosition', async function() {
            await driver.dragAndDrop(block, new Point(300, 300));
            await driver.actionsSettled();
            const undoId = driver.ide().currentSprite.scripts.undoOwnerId();

            await SnapUndo.undo(undoId);
            await driver.waitUntil(() => SnapUndo.undoCount[undoId] === 1);
            const msg = `Block not restored to ${initialPosition} (${block.position()})`;
            expect(initialPosition.eq(block.position())).toBe(true, msg);
        });

        it('should restore pos after moveBlock, setBlockPosition', async function() {
            const bottomBlock = await driver.addBlock('doSayFor', new Point(300, 300));
            const [target] = bottomBlock.attachTargets();
            await SnapActions.moveBlock(block, target);
        });

        it('should restore pos after connecting to another block', async function() {
            const bottomBlock = await driver.addBlock('doSayFor', new Point(300, 300));
            const [topTarget] = bottomBlock.attachTargets();
            await SnapActions.moveBlock(block, topTarget);
            await SnapActions.setBlockPosition(block, new Point(400, 400));
            const undoId = driver.ide().currentSprite.scripts.undoOwnerId();
            await SnapUndo.undo(undoId);
            await driver.expect(
                () => initialPosition.eq(block.position()),
                `Block not restored to ${initialPosition} (${block.position()})`
            );
        });
    });

    describe('replace inputs', function() {
        let command, firstInput;

        beforeEach(async () => {
            command = await driver.addBlock('forward');
            firstInput = await driver.addBlock('xPosition', new Point(400, 400));
            await driver.dragAndDrop(firstInput, command.inputs()[0]);
            await driver.actionsSettled();
        });

        it('should revert (existing) input on undo', async function() {
            const input = await driver.addBlock('yPosition', new Point(400, 400));
            await driver.dragAndDrop(input, command.inputs()[0]);
            await driver.actionsSettled();
            const undoId = driver.ide().currentSprite.scripts.undoOwnerId();
            await SnapUndo.undo(undoId);
            await driver.waitUntil(() => SnapUndo.undoCount[undoId] === 1);
            const msg = `Input should be reverted to x position block`;
            expect(command.inputs()[0]).toBe(firstInput, msg);
        });
    });

    describe('call RPC blocks', function() {
    });
});
