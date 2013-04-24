/**
 * Add your Analytics tracking ID here.
 */
var _AnalyticsCode = 'UA-33322493-1';

/**
 * Below is a modified version of the Google Analytics asynchronous tracking
 * code snippet.  It has been modified to pull the HTTPS version of ga.js
 * instead of the default HTTP version.  It is recommended that you use this
 * snippet instead of the standard tracking snippet provided when setting up
 * a Google Analytics account.
 */
var _gaq = _gaq || [];
_gaq.push(['_setAccount', _AnalyticsCode]);
_gaq.push(['_trackPageview']);

(function() {
  var ga   = document.createElement('script');
  ga.type  = 'text/javascript';
  ga.async = true;
  ga.src   = 'https://ssl.google-analytics.com/ga.js';
  var s    = document.getElementsByTagName('script')[0];
  s.parentNode.insertBefore(ga, s);
})();

/**
 * Track a click on a button using the asynchronous tracking API.
 *
 * See http://code.google.com/apis/analytics/docs/tracking/asyncTracking.html
 * for information on how to use the asynchronous tracking API.
 */
function trackButtonClick(e) {
  _gaq.push(['_trackEvent', e.target.id, 'clicked']);
}

/**
 * Now set up your event handlers for the popup's `button` elements once the
 * popup's DOM has loaded.
 */
document.addEventListener('DOMContentLoaded', function () {
  var buttons = document.querySelectorAll('button');
  for (var i = 0; i < buttons.length; i++) {
    buttons[i].addEventListener('click', trackButtonClick);
  }
});

/**
*	End Google Analytics
*/

var supmark = new supmark();
supmark.log("Launched");
supmark.log("Account checking...");

/*
chrome.storage.sync.get( {'campusid': '', 'password': '', 'name': ''} , function(items){
    supmark.log(items);

    if( items.campusid && items.password ){
        supmark.log('Sync : '+items.campusid);
        supmark.log('Sync : '+items.password);
        supmark.log('Sync : '+items.name);
        if( items.campusid !== localStorage.campusid || items.password !== localStorage.password || items.name !== localStorage.name ){
            localStorage.campusid = items.campusid;
            localStorage.password = items.password;
            localStorage.name = items.name;
        }
        supmark.initVars();
        supmark.log("Account found : " + localStorage.name );
    } else {
        if( localStorage.campusid && localStorage.password){
            chrome.storage.sync.set( {campusid: localStorage.campusid});
            chrome.storage.sync.set( {campusid: localStorage.password});
            chrome.storage.sync.set( {name: localStorage.name});
            supmark.log('Local : '+localStorage.campusid);
            supmark.log('Local : '+localStorage.password);
            supmark.log('Local : '+localStorage.name);
            supmark.initVars();
            supmark.log("Account found : " + localStorage.name );
        } else {
        	supmark.log("No account found, goto option page.");
        	chrome.tabs.create({"url":chrome.extension.getURL("html/options.html"), "selected":true});
        }
    }

    function(){

    }
    //chrome.storage.sync.set( {campusid: localStorage.campusid});
    //chrome.storage.sync.set( {password: localStorage.password});
    //chrome.storage.sync.set( {name:     localStorage.name});
});
*/
/*if(!supmark.isRegistered()){ 
	supmark.log("No account found, goto option page.");
	chrome.tabs.create({"url":chrome.extension.getURL("html/options.html"), "selected":true});
} else {
  	supmark.initVars();
    supmark.log("Account found : " + localStorage.name );
}
setInterval(function() {
    supmark.log("Check if we are logged");
    if(supmark.isLogged()){ // On verifie si on est logger
        supmark.log("You are logged ! Getting marks...");
        supmark.getMarks(); // Si oui on récupére les notes
        supmark.getSummary();
        supmark.getClassMates;
        supmark.getCalendar();
    } else { // Si on est pas logger
        supmark.log("You are not logged ! try to logging...");
        supmark.login2(localStorage.campusid, supmark.d(localStorage.password)); // On se log
        setTimeout(function(){
            supmark.log("Now getting marks...");
            supmark.getMarks();
            supmark.getSummary();
            supmark.getClassMates;
            supmark.getCalendar();
        },10000); // on attend 10sec et on récupére les notes
    }
}, 300000);
*/

supmark.init( function(){
  
    setInterval(function() {
       
        supmark.log("Check if we are logged");

        if(supmark.isLogged()){ // On verifie si on est logger
            supmark.log("You are logged ! Getting marks...");
            supmark.checkAll();
        } else { // Si on est pas logger
            supmark.log("You are not logged ! try to logging...");
            supmark.login2(localStorage.campusid, supmark.d(localStorage.password)); // On se log
            setTimeout(function(){
                supmark.log("Now getting marks...");
                supmark.checkAll();
            },10000); // on attend 10sec et on récupére les notes
        }
    //}, 14400000); //4 heures
    }, 7200000); //2 heures
} );