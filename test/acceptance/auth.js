var domain = require("domain");
var proxyquire = require('proxyquire');
var chai = require('chai');
var expect = chai.expect;
chai.use(require('sinon-chai'));
require('mocha-sinon');
var vkAuth = require('../../');

describe('vkAuth', function() {
    beforeEach(function() {
        this.auth = vkAuth(process.env.VK_CLIENT_ID, 'audio');
        this.timeout(5000);
    })

    it('should successfully get token', function(done) {
        this.auth.authorize(process.env.VK_USERNAME, process.env.VK_PASSWORD, function(err, token) {
            expect(err).to.be.null;
            expect(token.access_token).to.be.a('string');
            done();
        })
    })

    it('should return error about invalid credentials', function(done) {
        this.auth.authorize('user@example.com', 'password', function(err, token) {
            expect(token).to.be.undefined;
            expect(err.message).to.equal('Incorrect login or password\n');
            done();
        })
    })
})