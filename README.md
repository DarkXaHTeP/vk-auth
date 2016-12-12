# vk-auth

Authorization in [Vkontakte](http://vk.com/) social network as [standalone/mobile](http://vk.com/dev/standalone) application. Allows you to get vk token with the help of PhantomJS headless browser.
#### npm
[![NPM Version][npm-image]][npm-url]
[![NPM Downloads][downloads-image]][downloads-url]
#### Issues
[![Tasks in Ready](https://badge.waffle.io/DarkXaHTeP/vk-auth.png?label=ready&title=Ready)](https://waffle.io/DarkXaHTeP/vk-auth)
[![Tasks in Progress](https://badge.waffle.io/DarkXaHTeP/vk-auth.png?label=In%20Progress&title=In%20Progress)](https://waffle.io/DarkXaHTeP/vk-auth)
#### Build information
[![Build Status](https://travis-ci.org/DarkXaHTeP/vk-auth.svg?branch=master)](https://travis-ci.org/DarkXaHTeP/vk-auth)
[![Coverage Status](https://coveralls.io/repos/DarkXaHTeP/vk-auth/badge.svg?branch=master&service=github)](https://coveralls.io/github/DarkXaHTeP/vk-auth?branch=master)

## Example
Using vk-auth is easy enough; it accepts two parameters in it's constructor (applicationId and required permissions) and provides single method for authorization:

``` js
var vkAuth = require('vk-auth')(123456, 'audio');

vkAuth.authorize('johndoe@example.com', 'password', function(err, tokenParams) {
    //do something with access token
});
```

## Changelog
v1.0.6
* Issue with markup change on permissions page fixed
* Dependencies are updated

v1.0.5
* PhantomJS was updated to version 2

v1.0.4
* Issue with form submit fixed

v1.0.3
* Updates in VK URLs (thanks to [Dmitriy](https://github.com/IamNotUrKitty))
* Error messages do not contain new line symbol

v1.0.1-1.0.2
* Fixes in readme

v1.0.0
* First release
* Small code improvements
* Tests for node.js part of module
* Daily build to check that module is still working

v0.0.6

* 'error' event is not emited when no listeners attached and callback is present

v0.0.5

* Should work again after VK urls updates
* Error for wrong credentials is now displayed again

v0.0.4

* PhantomJS is now started by 'execFile' command instead of 'exec'

v0.0.3

* Events added

v0.0.2

* Result format changed to look the same way as vk response
* All errors including VK and wrong credentials errors are now passed through 'err' callback parameters

v0.0.1

* Initial module version

## Constructor parameters
#### require('vk-auth')(applicationId, permissions);
To get applicationId you need to create vk app [here](https://vk.com/editapp?act=create).

You can pass app permissions as a string or array e.g.
```js
var permissions = 'friends,video,offline';
var anotherPermissons = [
    'wall',
    'friends'
];
```
To get more information about available permissions visit [Application Access Permissions](http://vk.com/dev/permissions) page

## Method parameters
#### vkAuth.authorize(login, password, callback)
*Login* - user's email or phone number

*Password* - user's password

*Callback(err, tokenParams)* - accepts two parameters - error and token parameters

## Events
You can subscribe to events emitted by authorization module instead of passing callback.
There are two events available:

*"auth"* - Authorization succeed

*"error"* - Error happened during authorization

Example:
```js
var vkAuth = require('vk-auth')(123456, 'audio');

vkAuth.authorize('johndoe@example.com', 'password');

vkAuth.on('error', function(err) {
    console.log(err);
});

vkAuth.on('auth', function(tokenParams) {
    //do something with token parameters
})
```
## Token
Here is an example of received token parameters:
```js
{
    access_token: 801edadc2f0d1898676e2804ec50b9990801dcd3fd5e9bc197898c19b9d796596d79c03278489f3e88
    expires_in: 86400
    user_id: 49923862
}
```
To read more about this parameters go to [Client Application Authorization](http://vk.com/dev/auth_mobile) page.

## Сontribution
Feel free to ask questions and post ideas, as well as send pull requests.
If you want to support me, leave tip at Gratipay: [![Gratipay][gratipay-image]][gratipay-url]

#### License: [MIT](LICENSE)

[npm-image]: https://img.shields.io/npm/v/vk-auth.svg
[npm-url]: https://npmjs.org/package/vk-auth
[downloads-image]: https://img.shields.io/npm/dm/vk-auth.svg
[downloads-url]: https://npmjs.org/package/vk-auth
[gratipay-image]: https://img.shields.io/gratipay/DarkXaHTeP.svg
[gratipay-url]: https://gratipay.com/DarkXaHTeP/
