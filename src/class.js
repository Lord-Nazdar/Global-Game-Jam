/**
 * Created by Pierre Boyer 2013.
 * https://github.com/theinternetismadeofcats/class.js
 */
function Class(){function _(){return this.initialize.apply(this,arguments)}_.prototype.initialize=function(){};for(var a in arguments){var e=arguments[a].prototype||arguments[a];for(var k in e)_.prototype[k]=e[k]}return _}