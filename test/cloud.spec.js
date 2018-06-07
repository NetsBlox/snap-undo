/*globals expect, SnapCloud */
describe('cloud', function() {
    it('should set clientId immediately', function() {
        expect(SnapCloud.clientId).toBeTruthy();
    });
});
