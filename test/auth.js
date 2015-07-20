var domain = require("domain");
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

    describe('on phantom/system error', function() {
        beforeEach(function () {
            dependenciesStub.child_process.execFile = this.sinon.stub()
                .callsArgWithAsync(2, new Error('system error'), '', '');
            this.authModule = proxyquire('../lib/auth', dependenciesStub)(123, 'test');
        });

        testErrorHandling('system error');
    })

    describe('on scrabbler error', function() {
        beforeEach(function () {
            dependenciesStub.child_process.execFile = this.sinon.stub()
                .callsArgWithAsync(2, null, '', 'Incorrect name');
            this.authModule = proxyquire('../lib/auth', dependenciesStub)(123, 'test');
        });

        testErrorHandling('Incorrect name');
    })
});

function testErrorHandling(errorMessage) {
    it('should call callback with error', function (done) {
        this.authModule.authorize('user', 'pass', function (err) {
            expect(err).to.be.an.instanceof(Error);
            expect(err.message).to.equal(errorMessage);
            done();
        })
    })

    it('should emit "error" event with error', function (done) {
        this.authModule.authorize('user', 'pass');
        this.authModule.on('error', function (err) {
            expect(err).to.be.an.instanceof(Error);
            expect(err.message).to.equal(errorMessage);
            done();
        });
    })

    it('should emit "error" event when callback and "error" event listeners are not added', function (done) {
        //use domain to catch unhandled error that is emited when no error event listener is added on EventEmmiter
        var d = domain.create();
        d.on('error', function (err) {
            d.exit();
            process.nextTick(function () {
                expect(err).to.be.an.instanceof(Error);
                expect(err.message).to.equal(errorMessage);
                done();
            });
        });


        d.run(function () {
            this.authModule.authorize('user', 'pass');
        }.bind(this));
    })
}
