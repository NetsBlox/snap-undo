/* globals driver */
describe('url anchors', function () {
    this.timeout(10000);
    // opening examples
    describe('examples', function() {
        before(() => {
            const loc = {
                href: location.origin + '?action=example&ProjectName=Dice',
                hash: ''
            };
            return driver.reset()
                .then(() => driver.ide().interpretUrlAnchors(loc));
        });

        it('should load example code', function () {
            return driver.expect(
                () => {
                    const blockCount = driver.ide().currentSprite.scripts.children.length;
                    return blockCount > 0;
                },
                'No blocks showed up for Battleship'
            );
        });

        it('should load two roles (p1, p2)', function () {
            return driver.expect(
                () => {
                    return driver.ide().room.getRoleCount() === 2;
                },
                `Found ${driver.ide().room.getRoleCount()} role(s) (expected 2)`
            );
        });
    });
});
