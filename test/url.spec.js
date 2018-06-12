/* globals driver */
describe('url anchors', function () {
    this.timeout(10000);
    // opening examples
    describe('examples', function() {
        it('should load example using url', function () {
            const loc = {
                href: location.origin + '?action=example&ProjectName=Dice',
                hash: ''
            };
            return driver.reset()
                .then(() => driver.ide().interpretUrlAnchors(loc))
                .then(() => {
                    return driver.expect(
                        () => {
                            const blockCount = driver.ide().currentSprite.scripts.children.length;
                            return blockCount > 0;
                        },
                        'No blocks showed up for Battleship'
                    );
                });
        });
    });
});
