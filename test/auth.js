var domain = require("domain");
var proxyquire = require('proxyquire');
var chai = require('chai');
var expect = chai.expect;
chai.use(require('sinon-chai'));
require('mocha-sinon');

var dependenciesStub = {
    'phantomjs-prebuilt': {path: 'path'},
    child_process: { }
}

var user = 'user',
    pass = 'pass',
    scope = 'test',
    clientId = 123;

describe('Auth', function () {
    it('should throw exception if more args are passed to factory function', function() {
        var authModule = require('../lib/auth');
        expect(function() { authModule(clientId, scope, 'thirdParam') }).to.throw(Error, 'Incorrect arguments passed');
    });

    it('should throw exception if less than two args are passed to factory function', function() {
        var authModule = require('../lib/auth');
        expect(function() { authModule(clientId) }).to.throw(Error, 'Incorrect arguments passed');
    });

    it('should concat scopes array correctly', function() {
         dependenciesStub.child_process.execFile = function(phantom, args) {
            var scope = decodeURIComponent(args[5]);
            expect(scope).to.equal('scope1,scope2');
        };
        var authModule = proxyquire('../lib/auth', dependenciesStub)(clientId, ['scope1', 'scope2']);
        authModule.authorize(user, pass);
    });

    describe('on successful auth', function () {
        beforeEach(function () {
            dependenciesStub.child_process.execFile = this.sinon.stub()
                .callsArgWithAsync(2, null, 'https://oauth.vk.com/blank.html#access_token=145a4703a2&expires_in=86400&user_id=1234567', '');
            this.authModule = proxyquire('../lib/auth', dependenciesStub)(clientId, scope);
        });

        it('should call callback with token params', function (done) {
            this.authModule.authorize(user, pass, function (err, tokenParams) {
                expect(err).to.be.null;
                expect(tokenParams).to.not.be.null;
                expect(tokenParams.access_token).to.equal('145a4703a2');
                done();
            })
        });

        it('should emit "auth" event with token params', function (done) {
            this.authModule.authorize(user, pass);
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
            this.authModule = proxyquire('../lib/auth', dependenciesStub)(clientId, scope);
        });

        testErrorHandling('system error');
    })

    describe('on scrabbler error', function() {
        beforeEach(function () {
            dependenciesStub.child_process.execFile = this.sinon.stub()
                .callsArgWithAsync(2, null, '', 'Incorrect name');
            this.authModule = proxyquire('../lib/auth', dependenciesStub)(clientId, scope);
        });

        testErrorHandling('Incorrect name');
    })
});

function testErrorHandling(errorMessage) {
    it('should call callback with error', function (done) {
        this.authModule.authorize(user, pass, function (err) {
            expect(err).to.be.an.instanceof(Error);
            expect(err.message).to.equal(errorMessage);
            done();
        })
    })

    it('should emit "error" event with error', function (done) {
        this.authModule.authorize(user, pass);
        this.authModule.on('error', function (err) {
            expect(err).to.be.an.instanceof(Error);
            expect(err.message).to.equal(errorMessage);
            done();
        });
    })

    it('should call callback and emit error if both are present', function() {
        var otherFinished = false;

        this.authModule.authorize(user, pass, function (err) {
            expect(err).to.be.an.instanceof(Error);
            expect(err.message).to.equal(errorMessage);

            if(otherFinished) {
                done();
            } else {
                otherFinished = true;
            }
        });

        this.authModule.on('error', function (err) {
            expect(err).to.be.an.instanceof(Error);
            expect(err.message).to.equal(errorMessage);

            if(otherFinished) {
                done();
            } else {
                otherFinished = true;
            }
        });
    });

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
            this.authModule.authorize(user, pass);
        }.bind(this));
    })
}
