var supmark    = chrome.extension.getBackgroundPage().supmark;
var timer      = null;
var reqtime    = null;

function clearInfos(time){
	clearTimeout(timer);
	if(!time){
		time = 5000; //5s
	}
	timer = setTimeout(function(){$("#infos").fadeOut(1000, function(){$("#infos").attr("class", "").html("");});}, time);
}

function showInfos(callback){
	$("#infos").fadeIn(1000, function(){callback;});
}

$("#facebook").click(function(){
	chrome.tabs.create({"url":"http://www.facebook.com/supmarkplugin", "selected":true});
});

$("#campusId").keyup(function(e){
	if(e.keyCode == 13) {
        $("#save").click();
    }
});

$("#password").keyup(function(e){
	if(e.keyCode == 13) {
        $("#save").click();
    }
});

$("#defaultPage").change(function(){
	localStorage.defaultPage = $("#defaultPage option:selected").attr('value');
	clearInfos(0);
	showInfos($("#infos").attr("class","alert alert-success").html("Setting saved !"));
});

$("#reset").click(function(){
	clearInfos(0);
	supmark.resetAccount();
	$("#username").val("");
	$("#campusId").val("");
	$("#password").val("");
	$("#save").removeAttr("disabled");
	$("#test").removeAttr("disabled");
	$("#campusId").removeAttr("disabled");
	$("#password").removeAttr("disabled");
	showInfos($("#infos").attr("class","alert alert-success").html("Account reseted !"));
	clearInfos();
	clearMark($("#sandbox"));
});


$("#save").click(function(){
	$("#save").text("Saving...").attr("disabled", "disabled");
	$("#test").attr("disabled", "disabled"); // On desactive le bouton de test pendant la sauvegarde.
	$("#reset").attr("disabled", "disabled");
	$("#campusId").attr("disabled","disabled");
	$("#password").attr("disabled","disabled");	
	supmark.clearCookies(); // On ferme la connexion actuelle si elle existe.	
	supmark.login2($("#campusId").val(),$("#password").val()); // On envoi la connexion login2 pour se logger à CB
	reqtime = setTimeout(function(){  // On attend 5 seconde avant d'éxecuter la suite pour laisser le temp à login2 de s'éxecuter entiérement.
			if(supmark.isLogged() === true) // Maintenant, on vérifie que l'on est bien logger à CB.
			{
				clearInfos(0);
				showInfos($("#infos").attr("class","alert alert-success").html("Account saved !"));
				supmark.writeStorage();
				$("#username").val(localStorage.name); // On affiche le nom
				$("#save").text("Save").removeAttr("disabled");			
				$("#campusId").attr("disabled","disabled");
				$("#password").attr("disabled","disabled");
				$("#save").attr("disabled", "disabled");
				$("#test").attr("disabled", "disabled");
				$("#reset").removeAttr("disabled");
				// showMark($("#sandbox"));
			} else {
				clearInfos(0);
				showInfos($("#infos").attr("class","alert alert-error").html("Save failed ! Unable to login to Campus-booster, check your login/password or your internet connection."));				
				$(".control-group").effect("shake", { times:2 }, 100);
				$("#save").text("Save").removeAttr("disabled");
				$("#test").removeAttr("disabled");
				$("#reset").removeAttr("disabled");
				$("#campusId").removeAttr("disabled");
				$("#password").removeAttr("disabled");
			}
		},10000);
	clearInfos();
});


function addClickTest(){
	$("#test").unbind('click');
	$("#test").one('click', function(){
		$("#test").text("Testing...").attr("disabled", "disabled");
		$("#save").attr("disabled", "disabled"); // On desactive le bouton de test pendant la sauvegarde.
		$("#reset").attr("disabled", "disabled");
		$("#campusId").attr("disabled","disabled");
		$("#password").attr("disabled","disabled");
		clearInfos(0);
		supmark.clearCookies();
		supmark.login2($("#campusId").val(),$("#password").val()); // On envoi la connexion login2 pour se logger à CB
		reqtime = setTimeout(function(){  // On attend 5 seconde avant d'éxecuter la suite pour laisser le temp à login2 de s'éxecuter entiérement.
				if(supmark.isLogged() === true) // Maintenant, on vérifie que l'on est bien logger à CB.
				{
					clearInfos(0);
					showInfos($("#infos").attr("class","alert alert-success").html("Connexion to Campus-booster successful, you can now save your account !"));				
					$("#username").val(supmark.getName());
					$("#test").text("Test").removeAttr("disabled");
					$("#save").removeAttr("disabled");
					$("#reset").removeAttr("disabled");
					$("#campusId").removeAttr("disabled");
					$("#password").removeAttr("disabled");
					$("#save").attr("class","btn btn-success btn-large").show().effect("pulsate", { times:3 }, 1000);
				} else {
					clearInfos(0);
					showInfos($("#infos").attr("class","alert alert-error").html("Test failed ! Unable to login to Campus-booster, check your login/password or your internet connection."));
					$(".control-group").effect("shake", { times:2 }, 100);
					$("#test").text("Test").removeAttr("disabled");
					$("#save").removeAttr("disabled");
					$("#reset").removeAttr("disabled");
					$("#campusId").removeAttr("disabled");
					$("#password").removeAttr("disabled");
				}
			},10000);
		addClickTest();
		clearInfos();
	});
}

$("#resetCookies").click(function(){
	supmark.clearCookies();
});

function clearMark(divObject){
	divObject.html("");
}

$("#getInfos").click(function(){
	var infos = supmark.getInfos();
	var html = "<br/>";
	html += ""+infos.civil+" "+infos.lastname+" "+infos.name+"<br/>";
	html += "Born : "+infos.birthdate+" in "+infos.birthplace+"<br/>";
	html += "Nationality : "+infos.nationality+"<br/>";
	$("#sandbox").html(html);
});

$("#isLogged").click(function(){
	clearInfos(0);
	$("#isLogged").text("Wait...").attr("disabled", "disabled");
	if(supmark.isLogged() === true){
		$("#isLogged").text("Check Logged").removeAttr("disabled");
		showInfos($("#infos").attr("class","alert alert-success").text("Logged in!"));
	} else {
		$("#isLogged").text("Check Logged").removeAttr("disabled");
	 	var errorMsg   = "An error has occurred : ";
	 	var errorArray = supmark.getErrorArray();
	 	for(var i = 0; i < errorArray.length; i++){
	 		errorMsg += "<li>" + errorArray[i] + "</li>";
	 	}
	 	showInfos($("#infos").attr("class","alert alert-error").html( errorMsg ));
	}
});

$(window).load(function () {
	var details = chrome.app.getDetails();
	$("#version").html(details.version);
	if(localStorage.name != null){$("#username").val(localStorage.name);}
	if(localStorage.campusid != null){$("#campusId").val(localStorage.campusid);}
	if(localStorage.password != null){$("#password").val(supmark.d(localStorage.password));}
	if(localStorage.defaultPage != null){$("#defaultPage option[value='"+ localStorage.defaultPage +"']").attr('selected','selected');}
	$("#infos").hide();
	if(supmark.isRegistered()){	
		$("#test").attr("disabled","disabled");
		$("#save").attr("disabled","disabled");
		$("#campusId").attr("disabled","disabled");
		$("#password").attr("disabled","disabled");
	}
	addClickTest();
/*	$( "#slider" ).slider({
		range: "max",
		min: 1,
		max: 10,
		value: 2,
		slide: function( event, ui ) {
			$( "#amount" ).val( ui.value );
		}
	});
	$( "#amount" ).val( $( "#slider" ).slider( "value" ) );*/
});

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
 	var buttons = document.querySelectorAll('input');
 	for (var i = 0; i < buttons.length; i++) {
 		buttons[i].addEventListener('click', trackButtonClick);
 	}
 });