//script that is executed by phantomjs to get VK access token
//uses system stdout and stderr for returning of execution result

var
    system = require('system'),
    args = system.args,
    stderr = system.stderr,
    page = require('webpage').create(),

//reading variables passed as parameters for phantomjs
    login = decodeURIComponent(args[1]),
    password = decodeURIComponent(args[2]),
    clientId = decodeURIComponent(args[3]),
    scope = decodeURIComponent(args[4]);

//overriding console.error to write into stderr instead of stdout
console.error = function () {
    stderr.write(Array.prototype.join.call(arguments, ' ') + '\n');
};

var exitWithError = function (errorMessage) {
    if (!errorMessage) {
        errorMessage = 'Request timeout error';
    }

    //writing error message to stderr
    console.error(errorMessage);

    //end callback execution and close phantomjs
    setTimeout(phantom.exit, 1);
};


//that enters user's credentials on VK login page
var submitLoginForm = function (login, pass) {
    try {
        document.getElementsByName("email")[0].value = login;
        document.getElementsByName("pass")[0].value = pass;
        document.getElementById("login_submit").submit.click();
    } catch (e) {
    }
};

//presses "allow access" button on VK permissions page
var confirmPermissions = function () {
    try {
        var allowButton = document.getElementById("install_allow");
        allowButton.click();
    } catch (e) {
    }
};

//check url with regexp of permissions page url
var isPermissionsPage = function (url) {
    var permissionsPageExp = /^https:\/\/oauth.vk.com\/authorize.*__q_hash=/;
    return permissionsPageExp.test(url);
};

//check url with regexp of access token page
var isAccessTokenPage = function(url) {
    var tokenPageExp = /https:\/\/oauth.vk.com\/blank.html#access_token/;
    return tokenPageExp.test(url);
};

//check url with regexp of page with incorrectly entered user credentials
var isIncorrectCredPage = function(url) {
    var incorrectCredExp = /^https:\/\/oauth.vk.com\/authorize.*&email=/;
    return incorrectCredExp.test(url);
};

//url of VK authorization page
var authUrl = 'https://oauth.vk.com/oauth/authorize?client_id=' + clientId + '&scope=' + scope + '&redirect_uri=https://oauth.vk.com/blank.html&response_type=token';

page.open(authUrl, function (status) {
    if (status !== 'success') {
        exitWithError('Unable to open authorization page');
    } else {

        //variable for storing page response timeout. Timeout is cleared when page url changed
        var pageResponseTimeout;

        //subscribing on url changing for tracking of current page address
        page.onUrlChanged = function (currentUrl) {

            //page changed it's url. Clearing timeout
            clearTimeout(pageResponseTimeout);

            if (isPermissionsPage(currentUrl)) {

                //waiting for page to load it's resources
                setTimeout(function () {
                    page.evaluate(confirmPermissions);

                    //close PhantomJS if page doesn't respond in 3 seconds after pressing "Allow" button
                    pageResponseTimeout = setTimeout(exitWithError, 3000);
                }, 1500);
            } else {
                if (isAccessTokenPage(currentUrl)) {

                    //writing url with access token to stdout and finishing script execution
                    console.log(currentUrl);
                    setTimeout(phantom.exit, 1);
                } else {
                    if (isIncorrectCredPage(currentUrl)) {
                        exitWithError('Incorrect login or password');
                    } else {
                        exitWithError('Unexpected authorization error');
                    }
                }
            }
        };

        //executing login function on loaded page
        page.evaluate(submitLoginForm, login, password);

        //close PhantomJS if page doesn't respond in 3 seconds after trying to enter user credentials
        pageResponseTimeout = setTimeout(exitWithError, 3000);
    }
});
