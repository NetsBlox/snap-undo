/*globals expect, SnapCloud, driver */
describe('cloud', function() {
    it('should set clientId immediately', function() {
        expect(SnapCloud.clientId).toBeTruthy();
    });

    it('should use clientId for socket uuid', function() {
        const ws = driver.ide().sockets;
        expect(ws.uuid).toBe(SnapCloud.clientId);
    });

    describe('newProject', function () {
        it('should set projectId on fail', function(done) {
            const oldProjectId = SnapCloud.projectId;
            SnapCloud.callService = (name, cb, err) => err('ERROR');
            SnapCloud.setClientState(
                'SomeProjectName',
                'myRole',
                SnapCloud.clientId,
                SnapActions.lastSeen,
                () => {
                    if (oldProjectId === SnapCloud.projectId) {
                        return done('Did not update id');
                    }
                    done();
                }
            );
        });
    });
});
