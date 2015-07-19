var proxyquire = require('proxyquire');
var chai = require('chai');
var expect = chai.expect;
chai.use(require('sinon-chai'));
require('mocha-sinon');

var dependenciesStub = {
    phantomjs: {path: 'path'},
    child_process: { }
}

describe('Auth', function () {
    describe('on successful auth', function () {
        beforeEach(function () {
            dependenciesStub.child_process.execFile = this.sinon.stub()
                .callsArgWithAsync(2, null, 'https://oauth.vk.com/blank.html#access_token=145a4703a2&expires_in=86400&user_id=1234567', '');
            this.authModule = proxyquire('../lib/auth', dependenciesStub)(123, 'test');
        });

        it('should call callback with token params', function (done) {
            this.authModule.authorize('user', 'pass', function (err, tokenParams) {
                expect(err).to.be.null;
                expect(tokenParams).to.not.be.null;
                expect(tokenParams.access_token).to.equal('145a4703a2');
                done();
            })
        });

        it('should emit "auth" event with token params', function (done) {
            this.authModule.authorize('user', 'pass');
            this.authModule.on('auth', function (tokenParams) {
                expect(tokenParams).to.not.be.null;
                expect(tokenParams.access_token).to.equal('145a4703a2');
                done();
            });
        })
    });
});