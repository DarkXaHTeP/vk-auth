//getting path to PhantomJS executable
var phantomjs = require('phantomjs-prebuilt').path,
    execFile = require('child_process').execFile,
    util = require("util"),
    EventEmitter = require("events").EventEmitter,
//getting full path to auth script
    authScriptPath = require.resolve('./scrapper');

var Auth = function (appId, permissions) {
    if (arguments.length !== 2) {
        throw new Error('Incorrect arguments passed');
    }

    //app permissions
    var applicationScope;

    //checking received permissions type
    if (permissions instanceof Array) {
        applicationScope = permissions.join(',');
    } else {
        applicationScope = permissions;
    }

    //function for generating command args for executing phantomJS script
    var generateExecArgs = function (login, password) {
        var
            escapedLogin = encodeURIComponent(login),
            escapedPass = encodeURIComponent(password),
            escapedClientId = encodeURIComponent(appId),
            escapedAppScope = encodeURIComponent(applicationScope);
        return [
            '--ssl-protocol=any',
            authScriptPath,
            escapedLogin,
            escapedPass,
            escapedClientId,
            escapedAppScope
        ];
    };

    var Authorizer = function () {
        //inherit Authorizer from EventEmitter
        EventEmitter.call(this);

        //method for authorizing user in VK and getting token
        this.authorize = function (login, password, callback) {
            var args = generateExecArgs(login, password);
            //executing command in shell
            execFile(phantomjs, args, function (err, stdout, stderr) {
                //check for errors
                var error = err,
                    stdErrMessage = stderr.toString();

                if (!err && stdErrMessage.length > 0) {
                    error = new Error(stdErrMessage);
                }

                if (error) {
                    if (callback) {
                        callback(error);

                        //error event is not emited when callback is added and no listeners added
                        if (EventEmitter.listenerCount(this, 'error') == 0) {
                            return;
                        }
                    }

                    this.emit('error', error);
                    return;

                }

                //splitting URL with token and retrieving token parameters
                var splitedURL = stdout.toString().split("#");
                var params = splitedURL[1];
                var paramsArray = params.split("&");
                var tokenParams = {};
                for (var i = 0, length = paramsArray.length; i < length; i++) {
                    var splitedParam = paramsArray[i].split("=");
                    tokenParams[splitedParam[0]] = splitedParam[1];
                }

                if (callback) {
                    callback(null, tokenParams);
                }

                this.emit('auth', tokenParams);
            }.bind(this));
        }
    };
    //inherit Authorizer from EventEmitter
    util.inherits(Authorizer, EventEmitter);

    return new Authorizer();
};

module.exports = Auth;
