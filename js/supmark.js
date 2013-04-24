function supmark() {

	"use strict";

	//###############################
	// ATTRIBUTS DE LA CLASSE
	//###############################

	// Les données contennu dans l'objet ne sont que temporaire, pour les enregistrer dans le localStorage, utiliser la fonction WriteStorage().
	var name;
	var promo;
	var password;
	var campusid;
	var tempId;
	var tempPassword;
	var errors = new Array();


	//var doc;

	 // Dépendance

	var background = chrome.extension.getBackgroundPage();

	var keyStr = "/128GhIoPQROSTeU" + "bADfgHijKLM+n0pF" + "WXY456xyzB7=39Va" + "qrstJklmNuZvwcdE" + "C";

	//Enable / disable supmark.log() message 
	var debug = false;	

	//Enable / disable TTS messages 
	var tts = false;

	//###################################
	// METHODES DE GESTION D'ERREUR
	//###################################

	//Vérifie la présence d'erreurs Renvoi true si il y a une erreur, et false si il n'y en a pas.
	this.isError = function()
	{
		if(errors.length > 0){
			return true; 
		} else {
			return false;
		}
	}

	// Retourne le tableau contennant toutes les erreurs
	this.getErrorArray = function() 
	{
		return errors;
	}

	// Vide le tableau d'erreur
	this.clearError = function() 
	{
		errors = [];
	}

	//Ajoute une erreur dans le tableau	
	this.addError = function(description){ 
		supmark.log("Error :" + description);
		errors.push(description);
	}

	//############################
	// METHODES PRINCIPALES
	//############################

	//Remplace la fonction console.log() et permet supprimer les sorties console en dehors du mode debug
	this.log = function(string){
		if(debug === true){
			supmark.speak(string);
			console.log(string);
		}
	}

	//Utilise le TTS pour lire la string en paramètre
	this.speak = function(string){
		if(tts === true){
			if(typeof(string) === 'string'){
				chrome.tts.speak( string, {'enqueue': true});
			}
		}
	}

	//Permet de calculer le temps d'execution d'une fonction passée en paramètre
	this.timing = function(func){
		if(debug === true){
			if(typeof(func) === 'function'){
				start = new Date().getTime();
				func();
				time = new Date().getTime() - start;
				//supmark.log("Execution time : "+ time +" ms");
				return "Execution time : "+ time +" ms";
			} else {
				//supmark.log("Argument is not a function");
				return "Argument is not a function";
			}
		}
	}

	//Equivalent fonction trim de PHP : supprimer les espaces en début et fin de chaîne
	this.trim = function(string){
		return string.replace(/^\s+/g,'').replace(/\s+$/g,'');
	}

	// Cette fonction test si il existe un compte enregistré dans le localStorage, elle peut servir à renvoyer sur la page d'options dans le cas de la premiére utilisation.
	this.isRegistered = function(callback) 
	{
		if(localStorage.campusid!=null){
			return true;
		} else { 
			return false; 
		}
	}

	// Cette fonction test si il existe un compte enregistré dans le localStorage, elle peu servir a renvoyer sur la page d'option dans le cas de la premiére utilisation.
	this.init = function(callback) 
	{

		chrome.storage.sync.get( {'campusid': '', 'password': '', 'name': ''} , function(items){
		    if( items.campusid && items.password ){
		        supmark.log('Sync : '+items.campusid);
		        supmark.log('Sync : *******');
		        supmark.log('Sync : '+items.name);
		        if( items.campusid !== localStorage.campusid || items.password !== localStorage.password || items.name !== localStorage.name ){
		        	localStorage.clear();
		            localStorage.campusid = items.campusid;
		            localStorage.password = items.password;
		            localStorage.name = items.name;
		            supmark.launchNotification(null, 'Sync', 'Synchronisation done');
		        }
		        supmark.initVars();
		        supmark.log("Account found : " + localStorage.name );
		    } else {
		        if( localStorage.campusid && localStorage.password){
		            chrome.storage.sync.set( {campusid: localStorage.campusid, password: localStorage.password, name: localStorage.name}, function(){
		            	if(chrome.runtime.lastError){
		            		supmark.launchNotification(null, 'Sync', 'Synchronisation failed');
		            		supmark.log("Data NOT written in sync storage.");
		            	} else {
		            		supmark.launchNotification(null, 'Sync', 'Synchronisation done');
		            		supmark.log("Data written in sync storage.");
		            	}
		            });
		            supmark.log('Local : '+ localStorage.campusid );
		            supmark.log('Local : *******');
		            supmark.log('Local : '+ localStorage.name );
		            supmark.initVars();
		            supmark.log("Account found : " + localStorage.name );
		        } else {
		        	supmark.log("No account found, goto option page.");
		        	chrome.tabs.create({"url":chrome.extension.getURL("html/options.html"), "selected":true});
		        }
		    }
			chrome.storage.onChanged.addListener(function(items, namespace) {
				//if( items.campusid.newValue && items.campusid.newValue != undefined ){
				if( items.campusid.newValue ){
					localStorage.clear();
				}
				for (var item in items) {
					var obj = items[item];
					//if(items[item].newValue != undefined){
					if(items[item].newValue == undefined){
						localStorage.removeItem(item);
					} else {
						localStorage.setItem(item, items[item].newValue);
					}
					if( item === 'password' ){
						supmark.log('Sync : '+item+' : ******* ');
					} else {
						supmark.log('Sync : '+item+' : '+items[item].newValue);
					}
					//} else {
					//	supmark.log('Sync has changed but no data written.');
					//}
				}
			});
		    if(callback){
		    	callback();
		    }
		    //chrome.storage.sync.set( {campusid: localStorage.campusid});
		    //chrome.storage.sync.set( {password: localStorage.password});
		    //chrome.storage.sync.set( {name:     localStorage.name});
		});

	}

	this.initVars = function()
	{
		this.setCampusId(localStorage.campusid);
		if(localStorage.password.indexOf("<!::!>") >= 0 ){
			this.setPassword(localStorage.password);
		} else {
			localStorage.password = this.e(localStorage.password);
			this.setPassword(localStorage.password);
		}
	}

	//Fonction regroupant toutes les fonctions de vérification
	this.checkAll = function()
	{

		supmark.getMarks();
		supmark.getSummary();
		supmark.getClassMates;
		supmark.checkICal();
		supmark.getInternship();
	}

	//Ecrit les données dans le local Storage ou dans le storage synchronisé avec le compte Google
	this.writeStorage = function()         
	{
		localStorage.campusid = this.campusid;	
		localStorage.password = this.password;
		localStorage.name     = this.name;
		supmark.log("Data written in localStorage.");
		chrome.storage.sync.set( {campusid: this.campusid, password: this.password, name: this.name}, function(){
			if(chrome.runtime.lastError){
				supmark.launchNotification(null, 'Sync', 'Synchronisation failed');
				supmark.log("Data NOT written in sync storage.");
			} else {
				supmark.launchNotification(null, 'Sync', 'Synchronisation done');
				supmark.log("Data written in sync storage.");
			}
		});
	}

	this.saveAccount = function(login,password){	
		if(this.login2(login, password) === true){
			this.writeStorage();
			supmark.log("Account saved");
			return true;
		} else {	
			supmark.log("Account can't be saved, login error.");
			return false;
		} 
	}

	//Vide le storage local et synchronisé
	this.resetAccount = function(){		
		chrome.storage.sync.clear(function(){
			if(chrome.runtime.lastError){
				supmark.log("Sync clear failed.");
			} else {
				supmark.log("Sync cleaned.");
			}
			chrome.storage.local.clear(function(){
				if(chrome.runtime.lastError){
					supmark.log("Local clear failed.");
				} else {
					supmark.log("Local cleaned.");
				}
				localStorage.clear();
				supmark.log("Account resetted");
			});
		});
	}

	//Permet de connecter l'utilisateur sur https://id.supinfo.com/
	this.loginSup = function(login, password){
		 $.ajax({
			type   : "GET",
			async  : true,
			url    : "https://id.supinfo.com/login.aspx?ReturnUrl=%2fdecide.aspx",
		    success: function(msg){
				var doc             = supmark.parseResults(supmark.cleanResults(msg));
				var viewstate       = doc.getElementById("__VIEWSTATE").getAttribute('value');
				var eventValidation = doc.getElementById("__EVENTVALIDATION").getAttribute('value');
		  		$.ajax({
				 	type  : "POST",
				   	async : true,
				   	data  :{ 
						__VIEWSTATE       			  : viewstate,
						__EVENTVALIDATION 			  :	eventValidation,
						ctl00$Main$login1$LoginButton : "Log In",
						ctl00$Main$login1$UserName    : login,
						ctl00$Main$login1$Password    : password,
						__EVENTARGUMENT               : "",
						__EVENTTARGET 				  : "",
						__LASTFOCUS 				  : ""
				  	},
				  	url    : "https://id.supinfo.com/login.aspx?ReturnUrl=%2fdecide.aspx",
				 	success: function(msg){
				   		var doc = supmark.parseResults(supmark.cleanResults(msg));
				   		if(!doc.getElementById("LbUser")){
							supmark.log("Login Failed.");
							supmark.addError("Wrong Login and/or Password !");
							supmark.login2(null, null, {"function":"loginSup", "result":false});					
						} else {
							supmark.log("Login Ok.");
							supmark.setName(doc.getElementById("LbUser").childNodes[0].nodeValue);
							supmark.setCampusId(login);
							supmark.setPassword(password);
							supmark.login2(null, null, {"function":"loginSup", "result":true});
						}
					},
				 	error  : function(error, status, xhr){
				 		supmark.log(error);
				 		supmark.log(status);
				 		supmark.log(xhr);
			          	supmark.addError("Ajax request failed, check your internet connection.");
	   				}		 		   				   
				});
			},
		 	error  : function(error, status, xhr){
		 		supmark.log(error);
		 		supmark.log(status);
		 		supmark.log(xhr);
	          	supmark.addError("Ajax request failed, check your internet connection.");
			}		 		   				   
		});
		if(supmark.isError()){
			supmark.login2(null, null, {"function":"loginSup", "result":false});
		}
	}

	//Permet de connecter l'utilisateur sur http://www.campus-booster.net/
	this.loginCb = function(login){
		var asyncRsp = null;
		$.ajax({
		 	type   : "GET",
		   	async  : true,
		  	url    : "http://www.campus-booster.net/Booster/students/marks.aspx?kind=Marks",
		 	success: function(msg){
		 		var doc             = supmark.parseResults(supmark.cleanResults(msg));
		 		var viewstate       = doc.getElementById("__VIEWSTATE").getAttribute('value');
		 		var eventValidation = doc.getElementById("__EVENTVALIDATION").getAttribute('value');
		  		$.ajax({
				  	type   : "POST",
					async  : true,
					data  :{ 
					 	__EVENTTARGET			                   : "",
					 	__VIEWSTATE       			               : viewstate,
					 	__EVENTVALIDATION 			  			   : eventValidation,
					 	actor_login_university_openid1$loginButton : "Login",
				 		actor_login_university_openid1$openIdBox   : login,
					 	actor_login_university_openid1$CkbRemember : "on",
					 	__EVENTARGUMENT               			   : ""
					},
				   	url    : "http://www.campus-booster.net/Booster/OpenLogin.aspx?ReturnUrl=%2fbooster%2f",
				 	success: function(msg){
				  		doc = supmark.parseResults(supmark.cleanResults(msg));
		  		   		if(doc.getElementById("openid_message") && doc.getElementById("openid_message").getAttribute('action').indexOf("dnoa") >= 0){ 
							var url = doc.getElementById("openid_message").getAttribute('action');
							var data = "";
							for (var i = 0; i<doc.getElementById("openid_message").getElementsByTagName("input").length; i++){
								if(doc.getElementById("openid_message").getElementsByTagName("input")[i].getAttribute("type") == "hidden"){
									if(i > 0){
										data += "&";
									}
									data += encodeURIComponent(doc.getElementById("openid_message").getElementsByTagName("input")[i].getAttribute("name")) + "=" + encodeURIComponent(doc.getElementById("openid_message").getElementsByTagName("input")[i].getAttribute("value"));
								}
							}
							supmark.log("Redirection detected.");
							supmark.login2(null, null, {"function":"loginCb", "result":"redir", "url":url, "data":data});
						} else if(doc.getElementsByTagName("title")[0].childNodes[0].nodeValue != null && doc.getElementsByTagName("title")[0].childNodes[0].nodeValue.indexOf("Student") >= 0){
		  					supmark.log("You are logged on CB");
		  					supmark.login2(null, null, {"function":"loginCb", "result":true});
						} else {
		  					supmark.log("Login Failed.");
		  					supmark.addError("Login Failed on campus-booster.net !");
		  					supmark.login2(null, null, {"function":"loginCb", "result":false});
		  				}
					},
				 	error  : function(error, status, xhr){
				 		supmark.log(error);
				 		supmark.log(status);
				 		supmark.log(xhr);
			          	supmark.addError("Ajax request failed, check your internet connection.");
	   				}		 		   				   
				});
			},
		 	error  : function(error, status, xhr){
		 		supmark.log(error);
		 		supmark.log(status);
		 		supmark.log(xhr);
	          	supmark.addError("Ajax request failed, check your internet connection.");
			}		 		   				   
		});
		if(supmark.isError()){
			supmark.login2(null, null, {"function":"loginCb", "result":false});
		}
	}

	//Permet de gérer la redirection appliquée sur certains comptes
	this.loginRedir = function(url, data){
		if(url === null && data === null){
			supmark.log("Empty arguments.")
			supmark.login2(null, null, {"function":"loginRedir", "result":false});
		}
		$.ajax({
		  	type   : "POST",
			async  : true,
			data   : data,
		  	url    : url,
		 	success: function(msg){
		 		doc = supmark.parseResults(supmark.cleanResults(msg));
		 		supmark.login2(null, null, {"function":"loginRedir", "result":true});
			},
		 	error  : function(error, status, xhr){
		 		supmark.log(error);
		 		supmark.log(status);
		 		supmark.log(xhr);
	          	supmark.addError("Ajax request failed, check your internet connection.");
			}		 		   				   
		});
		if(supmark.isError()){
			supmark.login2(null, null, {"function":"loginRedir", "result":false});
		}
	}

	// Vérifie la validité du login/password // { "function" : "loginSup", "result": "true"}
	this.login2 = function(login , password, arrayCallback)   
	{
		supmark.clearError();
		supmark.log("login2 launched");
		if (login == "" || password == ""){
			this.clearError();
			if(login == "") this.addError("CampusID field empty !");
			if(password == "") this.addError("Password field empty !");
			return false;
		} else if(login != null && password != null){
			this.setTempId(login);
			this.setTempPassword(password);
		} else if((login === null || password === null) && (this.getTempId() === null || this.getTempPassword() === null)){
			this.clearError();
			this.addError("No login or password specified!");
			return false;
		}
		if(typeof(arrayCallback) === "undefined"){
			supmark.log("Clear cookies launched");
			this.clearCookies(supmark.login2(null, null, {"function":"clearCookies"}));
		} else if(arrayCallback.function == "clearCookies"){
			supmark.log("loginSup launched");
			this.loginSup(this.getTempId(), this.getTempPassword());
		} else if(arrayCallback.function == "loginSup"){
			if (arrayCallback.result === true) {
				supmark.log("loginCb launched");
				this.loginCb(this.getTempId());
			} else {
				return false;
			}
		} else if(arrayCallback.function == "loginCb"){
			if (arrayCallback.result === true) {
				supmark.log("return from loginCb true");
				return true;
			} else if(arrayCallback.result === "redir" && arrayCallback.url != null && arrayCallback.data != null) {
				supmark.log("return from loginCb: redir");
				this.loginRedir(arrayCallback.url, arrayCallback.data);
			} else {
				supmark.log("return from loginCb false");
				return false;
			}
		} else if(arrayCallback.function == "loginRedir"){
			if (arrayCallback.result === true) {
				supmark.log("return from loginRedir true");
				return true;
			} else {
				supmark.log("return from loginCb false");
				return false;
			}
		}
	}

	//
	this.cleanResults = function(string){
		string   = string.replace(/&reg;/g, "&#174;").replace(/&nbsp;/g, "&#160;").replace(/&radic;/g, "&#8730;").replace(/&amp;/g, "&#38;").replace(/amp;/g, "&#38;").replace(/ & /g, " &#38; ").replace(/<</g, "&#139;&#139;").replace(/>>/g, "&#155;&#155;").replace(/'\//g, "&#130;/");
		return string;
	}

	this.parseResults = function(string){
		var parser = new DOMParser();
		var doc    = parser.parseFromString(string, "application/xml");		
		return doc;
	}

	this.getInfos = function()   // Récupére les infos sur CampusBooster
	{
		if(supmark.isLogged() === true){
			var url = "http://www.campus-booster.net/Booster/Pages/default_container.aspx?actorid="+supmark.getCampusId()+"&amp;ascxname=actor_admin";
			//supmark.log(url);
			var infos = {};
	  		$.ajax({
			 	type   : "GET",
			   	async  : false,
			  	url    : url,
			 	success: function(msg){
			 		doc = supmark.parseResults(supmark.cleanResults(msg));
			 		if(doc.getElementsByTagName("title")[0].childNodes[0].nodeValue != null && doc.getElementsByTagName("title")[0].childNodes[0].nodeValue.indexOf("Error") < 0){
						infos.id          = doc.getElementById("container1_ctl00_Actors1_AIDL").childNodes[0].nodeValue.toString();
						infos.civil       = doc.getElementById("container1_ctl00_Actors1_ACIVIL").childNodes[0].nodeValue.toString();
						infos.lastname    = doc.getElementById("container1_ctl00_Actors1_AEXTNAMEL1").childNodes[0].nodeValue.toString();
						infos.name        = doc.getElementById("container1_ctl00_Actors1_ANAMEL1").childNodes[0].nodeValue.toString();
						infos.birthdate   = doc.getElementById("container1_ctl00_Actors1_ABIRTHDATEL").childNodes[0].nodeValue.toString();
						infos.birthplace  = doc.getElementById("container1_ctl00_Actors1_ABIRTHPLACEL").childNodes[0].nodeValue.toString();
						infos.nationality = doc.getElementById("container1_ctl00_Actors1_ACOUNTRYL").childNodes[0].nodeValue.toString();
					} else {
						return false;
					}
				},
				error  : function(){
		           supmark.addError("Ajax request failed, check your internet connection.");
   				}
			});
	  		return infos;
		} else {
			return false;
		}
	}


	this.refreshBadge = function(){
		if(localStorage.getItem("notification")){
			var notification = JSON.parse(localStorage.getItem("notification"));
			var notifcounter = 0;
			for (var i = 0; i<notification.length; i++){
				if(notification[i].isViewed == 0){
					notifcounter++;
				}
			}
			if(!notifcounter>0){
				chrome.browserAction.setBadgeText({text:""});
			} else {
				chrome.browserAction.setBadgeText({text:notifcounter.toString()});
			}
		}
	}

	this.getMarksOld = function()   // Récupére les notes sur CampusBooster
	{
		// Une fois que checklogin a verifier la validité des login mot de passe et enregistrer les information dans le localstorage, nous pouvons utiliser la methode getMark à intervalle de temp régulier.
		if(supmark.isMarksAvailable() !== true){ return false; }
		if(supmark.isLogged() === true){
			var subjects = [];
	  		$.ajax({
			 	type   : "GET",
			   	async  : false,
			  	url    : "http://www.campus-booster.net/Booster/students/marks.aspx?kind=Marks",
			 	success: function(msg){
					var doc        = supmark.parseResults(supmark.cleanResults(msg));
					var promo      = doc.getElementsByTagName("ul")[1].getElementsByTagName("b")[1].childNodes[0].nodeValue.toString();
					var titlesMark = doc.getElementById("ctl00_ContentPlaceHolder1_Lab1_ctl01_fstMain").getElementsByTagName("div")[40].getElementsByTagName("table");
		     		for (var i = 0; i<titlesMark.length; i++){
						var subject       = {};
						var titleMark     = titlesMark[i].childNodes[1].childNodes[1].childNodes[0].nodeValue.toString() + titlesMark[i].childNodes[1].childNodes[1].childNodes[1].childNodes[0].nodeValue.toString();
						subject.id        = titlesMark[i].childNodes[1].childNodes[1].childNodes[1].childNodes[0].nodeValue.toString().match(/\(#[a-zA-Z0-9]*[ -]+/i).toString().replace(/\(/i, "").replace(/ - /i, "");
						subject.title     = supmark.trim(titlesMark[i].childNodes[1].childNodes[1].childNodes[0].nodeValue.toString());
						var subject1      = titlesMark[i].childNodes[3].childNodes[1].childNodes[0].nodeValue;
						var isValidated   = titlesMark[i].childNodes[1].childNodes[1].childNodes[1].childNodes[0].nodeValue.toString().indexOf("√");
						var isMarkPresent = subject1.indexOf("No Mark");
						subject.credits   = titleMark.match(/Credits:[0-9]+\)/i).toString().replace(/Credits:/i, "").replace(/\)/i, "");
		     			if(isValidated >= 0){
		     				subject.pass = true;
		     			} else {
		     				subject.pass = false;
		     			}
		     			if(isMarkPresent >= 0){
		     				subject.marks = null;
		     			} else {
		     				subject.marks = [];
		     				var marks = doc.getElementById("ctl00_ContentPlaceHolder1_Lab1_ctl01_fstMain").getElementsByTagName("div")[40].getElementsByTagName("table")[i].getElementsByTagName("div");
		     				for (var j = 0; j<marks.length; j++){	     					
								var mark      = {};
								mark.type     = marks[j].getElementsByTagName("b")[0].childNodes[0].nodeValue;
								mark.fullType = marks[j].childNodes[1].nodeValue.substring(3);
								mark.points   = marks[j].getElementsByTagName("b")[1].childNodes[0].nodeValue;
		     					subject.marks.push(mark);
		     				}
		     			}
		     			subjects.push(subject);
		     		}
				},
				error  : function(){
		           supmark.addError("Ajax request failed, check your internet connection.");
   				}
			});
			supmark.checkMarks(subjects);
			if(subjects.length>0){
				localStorage.setItem("marks", JSON.stringify(subjects)); // Serialise l'objet pour l'enregistrer dans le storage		
			}	
			return subjects;
		} else {
			supmark.login2(localStorage.campusid, this.d(localStorage.password)); // On se log
			setTimeout(function(){
			    supmark.log("Now getting marks...");
			    supmark.getMarks();
			},10000);
		}
	}


	this.parseMarks = function(idyear,viewstate,eventValidation)
	{
			var subjects = [];
			$.ajax({

     			type   : "POST",
     			async  : false,
     			data  :{
     				__VIEWSTATE       : viewstate,
     				__EVENTVALIDATION : eventValidation,
     				__EVENTTARGET   : "ctl00$ContentPlaceHolder1$btnPreviousTop",					 	
     				__EVENTARGUMENT : "",
     				'container1$ctl00$ctl00$ctl01$ODropCursus':idyear,
     				ctl00_ContentPlaceHolder1_DayPilotCalendar2_scrollpos : "321",
     				ctl00_ContentPlaceHolder1_DayPilotCalendar2_select : ""
     			},
     			url    : "http://www.campus-booster.net/Booster/Pages/default_iframe_container.aspx?type=marks&amp;ascxname=actor_admin_bis_con&amp;kind=Marks&amp;actorid="+supmark.campusid,
     			success: function(msg){
     				
     				var doc        = supmark.parseResults(supmark.cleanResults(msg));

     				//supmark.log(msg);
     				//supmark.log(doc.getElementById("container1_ctl00_ctl00_ctl01_fstMain").getElementsByTagName("table"));
					var promo      = doc.getElementsByTagName("ul")[1].getElementsByTagName("b")[1].childNodes[0].nodeValue.toString();
					
					var titlesMark = doc.getElementById("container1_ctl00_ctl00_ctl01_fstMain").getElementsByTagName("table");
		     		
		     		for (var j = 1; j<titlesMark.length; j++){

						var subject       = {};
						var titleMark     = titlesMark[j].childNodes[1].childNodes[1].childNodes[0].nodeValue.toString() + titlesMark[j].childNodes[1].childNodes[1].childNodes[1].childNodes[0].nodeValue.toString();
						subject.id        = titlesMark[j].childNodes[1].childNodes[1].childNodes[1].childNodes[0].nodeValue.toString().match(/\(#[a-zA-Z0-9]*[ -]+/i).toString().replace(/\(/i, "").replace(/ - /i, "");
						subject.title     = supmark.trim(titlesMark[j].childNodes[1].childNodes[1].childNodes[0].nodeValue.toString());
						var subject1      = titlesMark[j].childNodes[3].childNodes[1].childNodes[0].nodeValue;
						var isValidated   = titlesMark[j].childNodes[1].childNodes[1].childNodes[1].childNodes[0].nodeValue.toString().indexOf("√");
						var isMarkPresent = subject1.indexOf("No Mark");
						if( titleMark.match(/Credits:[0-9]+\)/i) ){
							subject.credits = titleMark.match(/Credits:[0-9]+\)/i).toString().replace(/Credits:/i, "").replace(/\)/i, "");
						} else {
							subject.credits = 0;
						}
		     			if(isValidated >= 0){
		     				subject.pass = true;
		     			} else {
		     				subject.pass = false;
		     			}
		     			if(isMarkPresent >= 0){
		     				subject.marks = null;
		     			} else {
		     				subject.marks = [];
		     				var marks = doc.getElementById("container1_ctl00_ctl00_ctl01_fstMain").getElementsByTagName("table")[j].getElementsByTagName("div");
		     				for (var k = 0; k<marks.length; k++){	     					
								var mark      = {};
								mark.type     = marks[k].getElementsByTagName("b")[0].childNodes[0].nodeValue;
								mark.fullType = marks[k].childNodes[1].nodeValue.substring(3);
								mark.points   = marks[k].getElementsByTagName("b")[1].childNodes[0].nodeValue;
		     					subject.marks.push(mark);
		     				}
		     			}
		     			
		     			subjects.push(subject);

		     		}

		     		
		     		
		     		
     			},
     			error  : function(){
     				supmark.addError("Ajax request failed, check your internet connection.");
     			}
     		});

			return subjects;
			
			
	}

	this.getMarks = function()   // Récupére les notes sur CampusBooster
	{
		var years = [];  
		var start = new Date().getTime();
		var currentYear;
		// Une fois que checklogin a verifier la validité des login mot de passe et enregistrer les information dans le localstorage, nous pouvons utiliser la methode getMark à intervalle de temp régulier.
		if(supmark.isMarksAvailable() !== true){ return false; }
		if(supmark.isLogged() === true){
			var subjects = [];
	  		$.ajax({
			 	type   : "GET",
			   	async  : false,
			  	url    : "http://www.campus-booster.net/Booster/Pages/default_iframe_container.aspx?type=marks&amp;ascxname=actor_admin_bis_con&amp;kind=Marks&amp;actorid="+supmark.campusid,
			 	success: function(msg){
			 		
			 		msg = msg.replace(/<img[^>]+>/gi, "");
			 	
			 		msg = $(msg);
			 	
					var listYears;
					

					//$(msg).find('#ob_iDdlODropCursusMainContainer .ob_iDdlICBC li:first').remove(); // Suppresion du premier element de la dropdown
					

					if($(msg).find('#ob_iDdlODropCursusMainContainer').length > 0)
					{

						listYears = $(msg).find('#ob_iDdlODropCursusMainContainer .ob_iDdlICBC li');
						supmark.log('option 1');

					} 
					else if($(msg).find('#ob_iDdlcontainer1_ctl00_ctl00_ctl01_ODropCursusItemsContainer').length > 0)
					{

						listYears = $(msg).find('#ob_iDdlcontainer1_ctl00_ctl00_ctl01_ODropCursusItemsContainer .ob_iDdlICBC li');
						supmark.log('option 2');

					} 
					else 
					{

						listYears = $(msg).find('#ob_iDdlODropCursusItemsContainer .ob_iDdlICBC li');
						supmark.log('option 3');

					}
				
					
					// On rentre la liste des différentes années dans l'objet years

						

					 // Variable qui contiendra l'id de l'année actuelle.

					listYears.each(function(index,elem)
					{
						if($(elem).find('i').text() != 'select')
						{
							// if(index == 0)	currentYear =  $(elem).find('i').text();
							//if(index == 1)	currentYear =  $(elem).find('i').text(); // 1 pour les tests
				 			var tmpYear = {};
				 			tmpYear.label = $(elem).find('b').text();
				 			tmpYear.id = $(elem).find('i').text();
				 			years.push(tmpYear);
			 			}
						
			 		});
			 		currentYear = years[0].id;
			 		

			 		// Construction du POST

			 		var viewstate        = $(msg).find('#__VIEWSTATE').attr('value');
					var eventValidation = $(msg).find('__EVENTVALIDATION').attr('value');

				
					
					for (var i = 0; i < years.length; i++) {
						

				 		years[i].subjects = supmark.parseMarks(years[i].id,viewstate,eventValidation);
						
					
					}

					

				},
				error  : function(){
		           supmark.addError("Ajax request failed, check your internet connection.");
   				}
			});
			
			if(years.length>0){
					
				localStorage.setItem("current-year", currentYear);

				localStorage.setItem("marks", JSON.stringify(years)); // Serialise l'objet pour l'enregistrer dans le storage		
				
			}	

			supmark.checkMarks(years);
			return years;


			
			
			
			
		} else {
			supmark.login2(localStorage.campusid, this.d(localStorage.password)); // On se log
			setTimeout(function(){
			    supmark.log("Now getting marks...");
			    supmark.getMarks();
			},10000);
		}
	}

	this.getCalendar = function()   // Récupére les notes sur CampusBooster
	{
		// Une fois que checklogin a verifier la validité des login mot de passe et enregistrer les information dans le localstorage, nous pouvons utiliser la methode getMark à intervalle de temp régulier.
		if(supmark.isLogged() === true){
			var cal = {};
			var doc;
			var days;
			var events;

			//Récupération de semaine n0
	  		$.ajax({
			 	type   : "GET",
			   	async  : false,
			  	url    : "http://www.campus-booster.net/Booster/students/Planning.aspx",
			 	success: function(msg){
					doc                  = supmark.parseResults(supmark.cleanResults(msg));
					var viewstate        = doc.getElementById("__VIEWSTATE").getAttribute('value');
					var eventValidation  = doc.getElementById("__EVENTVALIDATION").getAttribute('value');
					var dateIcs          = doc.getElementById("ctl00_ContentPlaceHolder1_LnkIcs").childNodes[0].nodeValue.toString().replace(/Download ICS -/im, "").replace(/z/im, "");
					dateIcs              = supmark.trim(dateIcs);
					localStorage.dateIcs = dateIcs;
				
					days                 = msg.match(/v[.]columns[ ]=[^]+v[.]hashes/im).toString().replace(/v[.]columns[ ]=/im, "").replace(/v[.]hashes/im, "").replace(/;/m, "");
					days                 = JSON.parse(days);
					events               = msg.match(/v[.]events[ ]=[^]+v[.]hours/im).toString().replace(/v[.]events[ ]=/im, "").replace(/v[.]hours/im, "").replace(/;/m, "").replace(/\\\'/gi, "'");
					events               = JSON.parse(events);
					cal.week0            = {};
					cal.week0.days       = days;
					cal.week0.events     = events;

					//Récupération de semaine n-1
					$.ajax({
						type   : "POST",
						async  : false,
						data  :{
							__VIEWSTATE       : viewstate,
							__EVENTVALIDATION : eventValidation,
							__EVENTTARGET   : "ctl00$ContentPlaceHolder1$btnPreviousTop",					 	
							__EVENTARGUMENT : "",
							ctl00_ContentPlaceHolder1_DayPilotCalendar2_scrollpos : "321",
							ctl00_ContentPlaceHolder1_DayPilotCalendar2_select : ""
						},
						url    : "http://www.campus-booster.net/Booster/students/Planning.aspx",
						success: function(msg){
							days                  = msg.match(/v[.]columns[ ]=[^]+v[.]hashes/im).toString().replace(/v[.]columns[ ]=/im, "").replace(/v[.]hashes/im, "").replace(/;/m, "");
							days                  = JSON.parse(days);
							events                = msg.match(/v[.]events[ ]=[^]+v[.]hours/im).toString().replace(/v[.]events[ ]=/im, "").replace(/v[.]hours/im, "").replace(/;/m, "").replace(/\\\'/gi, "'");
							events                = JSON.parse(events);
							cal.weekMinus1        = {};
							cal.weekMinus1.days   = days;
							cal.weekMinus1.events = events;
						},
						error  : function(){
							supmark.addError("Ajax request failed, check your internet connection.");
						}
					});

					//Récupération de semaine n+1
					$.ajax({
						type   : "POST",
						async  : false,
						data   : {
							__VIEWSTATE       : viewstate,
							__EVENTVALIDATION : eventValidation,
							__EVENTTARGET     : "ctl00$ContentPlaceHolder1$btnNextTop",					 	
							__EVENTARGUMENT   : "",
							ctl00_ContentPlaceHolder1_DayPilotCalendar2_scrollpos : "321",
							ctl00_ContentPlaceHolder1_DayPilotCalendar2_select    : ""
						},
						url    : "http://www.campus-booster.net/Booster/students/Planning.aspx",
						success: function(msg){
							days                = msg.match(/v[.]columns[ ]=[^]+v[.]hashes/im).toString().replace(/v[.]columns[ ]=/im, "").replace(/v[.]hashes/im, "").replace(/;/m, "");
							days                = JSON.parse(days);
							events              = msg.match(/v[.]events[ ]=[^]+v[.]hours/im).toString().replace(/v[.]events[ ]=/im, "").replace(/v[.]hours/im, "").replace(/;/m, "").replace(/\\\'/gi, "'");
							events              = JSON.parse(events);
							cal.week1           = {};
							cal.week1.days      = days;
							cal.week1.events    = events;
							doc                 = supmark.parseResults(supmark.cleanResults(msg));
							var viewstate       = doc.getElementById("__VIEWSTATE").getAttribute('value');
							var eventValidation = doc.getElementById("__EVENTVALIDATION").getAttribute('value');

							//Récupération de semaine n+2
							$.ajax({
								type   : "POST",
								async  : false,
								data   : {
									__VIEWSTATE       : viewstate,
									__EVENTVALIDATION : eventValidation,
									__EVENTTARGET     : "ctl00$ContentPlaceHolder1$btnNextTop",					 	
									__EVENTARGUMENT   : "",
									ctl00_ContentPlaceHolder1_DayPilotCalendar2_scrollpos : "321",
									ctl00_ContentPlaceHolder1_DayPilotCalendar2_select    : ""
								},
								url    : "http://www.campus-booster.net/Booster/students/Planning.aspx",
								success: function(msg){
									days                = msg.match(/v[.]columns[ ]=[^]+v[.]hashes/im).toString().replace(/v[.]columns[ ]=/im, "").replace(/v[.]hashes/im, "").replace(/;/m, "");
									days                = JSON.parse(days);
									events              = msg.match(/v[.]events[ ]=[^]+v[.]hours/im).toString().replace(/v[.]events[ ]=/im, "").replace(/v[.]hours/im, "").replace(/;/m, "").replace(/\\\'/gi, "'");
									events              = JSON.parse(events);
									cal.week2           = {};
									cal.week2.days      = days;
									cal.week2.events    = events;
									doc                 = supmark.parseResults(supmark.cleanResults(msg));
									var viewstate       = doc.getElementById("__VIEWSTATE").getAttribute('value');
									var eventValidation = doc.getElementById("__EVENTVALIDATION").getAttribute('value');

									//Récupération de semaine n+3
									$.ajax({
										type   : "POST",
										async  : false,
										data   : {
											__VIEWSTATE       : viewstate,
											__EVENTVALIDATION : eventValidation,
											__EVENTTARGET     : "ctl00$ContentPlaceHolder1$btnNextTop",					 	
											__EVENTARGUMENT   : "",
											ctl00_ContentPlaceHolder1_DayPilotCalendar2_scrollpos : "321",
											ctl00_ContentPlaceHolder1_DayPilotCalendar2_select    : ""
										},
										url    : "http://www.campus-booster.net/Booster/students/Planning.aspx",
										success: function(msg){
											days             = msg.match(/v[.]columns[ ]=[^]+v[.]hashes/im).toString().replace(/v[.]columns[ ]=/im, "").replace(/v[.]hashes/im, "").replace(/;/m, "");
											days             = JSON.parse(days);
											events           = msg.match(/v[.]events[ ]=[^]+v[.]hours/im).toString().replace(/v[.]events[ ]=/im, "").replace(/v[.]hours/im, "").replace(/;/m, "").replace(/\\\'/gi, "'");
											events           = JSON.parse(events);
											cal.week3        = {};
											cal.week3.days   = days;
											cal.week3.events = events;
										},
										error  : function(){
											supmark.addError("Ajax request failed, check your internet connection.");
										}
									});
								},
								error  : function(){
									supmark.addError("Ajax request failed, check your internet connection.");
								}
							});
						},
						error  : function(){
							supmark.addError("Ajax request failed, check your internet connection.");
						}
					});
				},
				error  : function(){
		           supmark.addError("Ajax request failed, check your internet connection.");
   				}
			});
			localStorage.setItem("cal", JSON.stringify(cal)); // Serialise l'objet pour l'enregistrer dans le storage
			return cal;
		} else {
			supmark.login2(localStorage.campusid, this.d(localStorage.password)); // On se log
			setTimeout(function(){
			    supmark.log("Now getting calendar...");
			    supmark.getCalendar();
			},10000);
		}
	}

	this.getICal = function()
	{
		// Une fois que checklogin a verifier la validité des login mot de passe et enregistrer les information dans le localstorage, nous pouvons utiliser la methode getMark à intervalle de temp régulier.
		if(supmark.isLogged() === true){
			var subjects = [];
	  		$.ajax({
			 	type   : "GET",
			   	async  : false,
			  	url    : "http://www.campus-booster.net/Booster/students/Planning.aspx",
			 	success: function(msg){
					var doc              = supmark.parseResults(supmark.cleanResults(msg));
					var dateIcs          = doc.getElementById("ctl00_ContentPlaceHolder1_LnkIcs").childNodes[0].nodeValue.toString().replace(/Download ICS -/im, "").replace(/z/im, "");
					var viewstate        = doc.getElementById("__VIEWSTATE").getAttribute('value');
					var eventValidation  = doc.getElementById("__EVENTVALIDATION").getAttribute('value');
					dateIcs              = supmark.trim(dateIcs);
					localStorage.dateIcs = dateIcs;
			 		chrome.tabs.create( {url: "http://www.campus-booster.net/Booster/students/Planning.aspx", active: false}, function(tab){
			 			var currentTab   = tab;
			 			chrome.tabs.executeScript(currentTab.id, {code: "aForm = document.forms['aspnetForm'];function submitAForm(){aForm.__EVENTTARGET.value = 'ctl00$ContentPlaceHolder1$LnkIcs';aForm.__EVENTARGUMENT.value = '';aForm.submit();setTimeout(function(){window.close();}, 1000);}aForm.onload = submitAForm();", runAt: "document_end" });
			 		});

/*					$.ajax({
						type   : "POST",
						async  : false,
						data   : {
							__VIEWSTATE       : viewstate,
							__EVENTVALIDATION : eventValidation,
							__EVENTTARGET     : "ctl00$ContentPlaceHolder1$LnkIcs",					 	
							__EVENTARGUMENT   : "",
							ctl00_ContentPlaceHolder1_DayPilotCalendar2_scrollpos : "321",
							ctl00_ContentPlaceHolder1_DayPilotCalendar2_select    : ""
						},
						url    : "http://www.campus-booster.net/Booster/students/Planning.aspx",
						success: function(msg){
							supmark.log(msg);
						},
						error  : function(){
							supmark.addError("Ajax request failed, check your internet connection.");
						}
					});*/

				},
				error  : function(){
		           supmark.addError("Ajax request failed, check your internet connection.");
   				}
			});
		} else {
			supmark.login2(localStorage.campusid, this.d(localStorage.password)); // On se log
			setTimeout(function(){
			    supmark.log("Now getting calendar...");
			    supmark.getICal();
			},10000);
		}
	}

	this.checkICal = function()
	{
		// Une fois que checklogin a verifier la validité des login mot de passe et enregistrer les information dans le localstorage, nous pouvons utiliser la methode getMark à intervalle de temp régulier.
		if(supmark.isLogged() === true){
			var cal = false;
			var doc;
			var days;

	  		$.ajax({
			 	type   : "GET",
			   	async  : false,
			  	url    : "http://www.campus-booster.net/Booster/students/Planning.aspx",
			 	success: function(msg){
					doc         = supmark.parseResults(supmark.cleanResults(msg));
					var dateIcs = doc.getElementById("ctl00_ContentPlaceHolder1_LnkIcs").childNodes[0].nodeValue.toString().replace(/Download ICS -/im, "").replace(/z/im, "");
					dateIcs     = supmark.trim(dateIcs);
					days        = msg.match(/v[.]columns[ ]=[^]+v[.]hashes/im).toString().replace(/v[.]columns[ ]=/im, "").replace(/v[.]hashes/im, "").replace(/;/m, "");
					days        = JSON.parse(days);
			 		if( !localStorage.dateIcs || localStorage.dateIcs == '' ||  dateIcs > localStorage.dateIcs){
			 			localStorage.dateIcs = dateIcs;		
			 			supmark.log(localStorage.dateIcs);
			 			supmark.pushNotification("New Calendar !", "Date", "Calendar", dateIcs);
			 			cal = supmark.getCalendar();
			 		} else if( !localStorage.cal || localStorage.cal == '' || days[0].Name !== JSON.parse(localStorage.cal).week0.days[0].Name ){
			 			supmark.log("Calendar refreshed!");
			 			cal = supmark.getCalendar();
			 		//} else if( Date() > JSON.parse(localStorage.cal).week0.days[4].Name.replace(/\//g, "-") + " 18:30:00" || !localStorage.cal ){
			 		//	supmark.getCalendar2();
			 		//	supmark.log("Calendar refreshed!");
			 		} else {
			 			supmark.log("No new calendar!");
			 		}
			 		supmark.refreshBadge();
				},
				error  : function(){
		           supmark.addError("Ajax request failed, check your internet connection.");
   				}
			});
			//supmark.log(cal);
			return cal;
		} else {
			supmark.login2(localStorage.campusid, this.d(localStorage.password)); // On se log
			setTimeout(function(){
			    supmark.log("Now checking calendar...");
			    supmark.checkICal();
			},10000);
		}
	}
	this.checkMarks = function(years)
	{	
		if(localStorage.getItem("marks")){


			var subjects;
			var storedSubjects;
			var currentYear = localStorage.getItem("current-year");
			for (var i = 0; i < years.length; i++) {
				if(years[i].id == currentYear)subjects = years[i].subjects;
			};


			var storedYears = JSON.parse(localStorage.getItem("marks"));		
			for (var i = 0; i < storedYears.length; i++) {
				if(storedYears[i].id == currentYear)storedSubjects = storedYears[i].subjects;
			};

			var newMarks = [];
			var oldMarks = [];
			for (var i = 0; i<subjects.length; i++){
				if(subjects[i].marks != null){
					for (var y = 0; y<subjects[i].marks.length; y++){
						var hash = supmark.md5(subjects[i].id+subjects[i].marks[y].type+subjects[i].marks[y].points+subjects[i].marks[y].fullType);
						newMarks.push({id: subjects[i].id,type: subjects[i].marks[y].type,points: subjects[i].marks[y].points,fullType: subjects[i].marks[y].fullType,hash: hash});
					}
				}
			}
			for (var i = 0; i<storedSubjects.length; i++){
				if(storedSubjects[i].marks != null){
					for (var y = 0; y<storedSubjects[i].marks.length; y++){
						var hash = supmark.md5(storedSubjects[i].id+storedSubjects[i].marks[y].type+storedSubjects[i].marks[y].points+storedSubjects[i].marks[y].fullType);
						oldMarks.push({id: storedSubjects[i].id,type: storedSubjects[i].marks[y].type,points: storedSubjects[i].marks[y].points,fullType: storedSubjects[i].marks[y].fullType,hash: hash});
					}
				}
			}
			if(oldMarks!=null && newMarks!=null){
				if(oldMarks.length != newMarks.length){
					var pushMarks = [];
					for (var i=0; i < newMarks.length; i++){
						var found = false;
						for (var y=0; y < oldMarks.length;y++){
							if(newMarks[i].hash === oldMarks[y].hash)found=true;
						}
						if(found == false){
							pushMarks.push(newMarks[i]);
						}
					}
				}		
			}
			if(pushMarks!=null){
				for (var i = 0; i < pushMarks.length ; i++){
					supmark.pushNotification("New Mark !", pushMarks[i].id,pushMarks[i].type,pushMarks[i].points);
				}				
			}
			supmark.refreshBadge();
			supmark.log('Marks '+currentYear+' checked');
		}
	}

	this.clearCookies = function(callback){ // Fonction permettant la suppression des cookies et de la session active.	
		var domain = new Array();
		domain[0]  = ".campus-booster.net";
		domain[1]  = ".supinfo.com";
		supmark.log("Clearing cookies...");
		for (var i = 0; i<domain.length; i++){
			chrome.cookies.getAll({"domain": domain[i]}, function(cookies) {
				supmark.log(" ");
				if(cookies.length > 0){
					for (var j = 0; j<cookies.length; j++){
						var url = cookies[j].secure ? "https://" : "http://";
						if(cookies[j].domain.charAt(0) == "."){ 
							url += cookies[j].domain.slice(1); 
						} else { 
							url += cookies[j].domain;
						}
						url += cookies[j].path;
						supmark.log(cookies[j].domain + " : " + cookies[j].name + " : " + cookies[j].value + " : " + url);
						if(typeof(callback) != "undefined" && j == cookies.length-1 && i == domain.length-1){
							supmark.log("callback");
							supmark.log(callback);
							chrome.cookies.remove({url: url, name: cookies[j].name}, callback());
						} else {
							chrome.cookies.remove({url: url, name: cookies[j].name});
						}
					}
				} else {
					supmark.log("Empty cookie : " + cookies);
					if(typeof(callback) != "undefined" && i == domain.length-1){
						supmark.log("callback");
						callback();
					}
				}
			});
		}
	}

	this.isLogged = function(){
		supmark.clearError();
  		$.ajax({
		 	type   : "GET",
		   	async  : false,
		  	url    : "https://id.supinfo.com/login.aspx?ReturnUrl=%2fdecide.aspx",
		 	success: function(msg){
		 		var doc = supmark.parseResults(supmark.cleanResults(msg));
 		   		if(!doc.getElementById("LbUser")){
 					supmark.log("Not logged on supinfo.com .");
 					supmark.addError("You are not logged in supinfo.com !");				
 					return false;
 				} else {
 					var campusid = msg.match(/\([0-9]+\)/).toString();
		 			var campusid = campusid.match(/[0-9]+/);		 			
		 			if(localStorage.getItem("campusid")){  // SI UN COMPTE EXISTE DEJA DANS LE STORAGE
				 		if(campusid != localStorage.getItem("campusid")){ // ON LE COMPÄRE AVEC LE COMPTE DU COOKIE ACTUEL
				 			supmark.log("You are not logged in supinfo.com but wrong CampusID !");
		 					supmark.addError("You are not logged in supinfo.com but wrong CampusID !");
		 					return false;
				 		}
			 		}
 					supmark.log("You are logged in supinfo.com .");
			  		$.ajax({
					 	type   : "GET",
					   	async  : false,
					  	url    : "http://www.campus-booster.net/Booster/students/marks.aspx?kind=Marks",
					 	success: function(msg){
					 		doc = supmark.parseResults(supmark.cleanResults(msg));
				     		//if(!doc.getElementById("ctl00_ContentPlaceHolder1_Lab1_ctl01_fstMain")){
				     		//On vérifie si le bloc "Sign Out" est présent pour vérifier qu'on est bien connecté
				     		if(!doc.getElementById("lnkSignOut")){
				     			supmark.log("Not logged on campus-booster.net .");
				     			supmark.addError("You are not logged in campus-booster.net !");
				     			return false;
				     		} else {
				     			supmark.log("You are logged in campus-booster.net .");
				     			return true;
				     		}
						},
						error  : function(){
				           supmark.addError("Ajax request failed, check your internet connection.");
		   				}
					});
 				}
			},
			error  : function(){
	           supmark.addError("Ajax request failed, check your internet connection.");
			}
		});
  		if(supmark.isError()){
  			return false;
  		} else {
  			return true;
  		} 
	}
	
	//Vérifie si le module de notes de campus booster est en maintenance
	this.isMarksAvailable = function(){
		supmark.clearError();
  		$.ajax({
		 	type   : "GET",
		   	async  : false,
		  	url    : "http://www.campus-booster.net/Booster/Pages/default_iframe_container.aspx?type=marks&amp;ascxname=actor_admin_bis_con&amp;kind=Marks&amp;actorid="+supmark.campusid,
		 	success: function(msg){
		 		var doc = supmark.parseResults(supmark.cleanResults(msg));
 		   		if(doc.getElementById("container1_ctl00_ctl00_lblModuleNotAvailable")){
 					supmark.log("Marks not available! (maintenance)");
 					supmark.addError("Marks not available! (maintenance)");				
 					return false;
 				}
			},
			error  : function(){
	           supmark.addError("Ajax request failed, check your internet connection.");
			}
		});
  		if(supmark.isError()){
  			return false;
  		} else {
  			return true;
  		} 
	}
		
	//Vérifie si le module summary de campus booster est en maintenance
	this.isSummaryAvailable = function(){
		supmark.clearError();
  		$.ajax({
		 	type   : "GET",
		   	async  : false,
		  	url    : "http://www.campus-booster.net/Booster/students/marks.aspx?kind=Summary",
		 	success: function(msg){
		 		var doc = supmark.parseResults(supmark.cleanResults(msg));
 		   		if(doc.getElementById("ctl00_ContentPlaceHolder1_Lab1_lblModuleNotAvailable")){
 					supmark.log("Summary not available! (maintenance)");
 					supmark.addError("Summary not available! (maintenance)");				
 					return false;
 				}
			},
			error  : function(){
	           supmark.addError("Ajax request failed, check your internet connection.");
			}
		});
  		if(supmark.isError()){
  			return false;
  		} else {
  			return true;
  		} 
	}
	
	this.pushNotification = function(description, id, type, mark, onclickFunction)
	{		
		if(!localStorage.getItem("notification")){
			var notification = [];			
		} else {
			notification = JSON.parse(localStorage.getItem("notification"));
		}
		var time = new Date().getTime();
		notification.push({description:description,id:id,type:type,mark:mark,isViewed:0,time:time});
		if(onclickFunction){
			supmark.launchNotification(null, description, id + " : " + mark, onclickFunction);
		} else {
			supmark.launchNotification(null, description, id + " : " + mark);	
		}     		
		localStorage.setItem("notification", JSON.stringify(notification));
	}

	this.getClassMates = function(){	
		if(supmark.isLogged() === true){
			var mates = [];
	  		$.ajax({
			 	type   : "GET",
			   	async  : false,
			  	url    : "http://www.campus-booster.net/Booster/students/classMembers.aspx",
			 	success: function(msg){
			 		//msg = msg.replace(/<img([^>]*)[^]ico_key_small.png[^]+>/gi, "");
			 		$(msg).find("#ctl00_ContentPlaceHolder1_dtlTrombi td").each(function(index,elem){
			 			if($(elem).html()!=""){
							var name = $(elem).find("span").attr("title");
							var id   = $(elem).find("img").attr("src").match(/[0-9]+/);
							mates.push({name:name,id:id});
				 		}
			 		});
				},
				error  : function(){
		           supmark.addError("Ajax request failed, check your internet connection.");
   				}
			});
			localStorage.setItem("mates", JSON.stringify(mates)); // Serialise l'objet pour l'enregistrer dans le storage	
			return mates;
		} else {
			supmark.login2(localStorage.campusid, this.d(localStorage.password)); // On se log
			setTimeout(function(){
			    supmark.log("Now getting ClassMates...");
			    supmark.getClassMates();
			},10000);
		}
	}
	this.getInternship = function(){	
		if(supmark.isLogged() === true){
			var internship = [];
	  		$.ajax({
			 	type   : "GET",
			   	async  : false,
			  	url    : "http://www.campus-booster.net/Booster/students/internship.aspx",
			 	success: function(msg){
			 		msg = msg.replace(/<img[^>]+>/gi, "");
			 		$(msg).find('#ctl00_ContentPlaceHolder1_internshipCtrl1_ctl00_INTERNSHIPListStudent1_ListStudent tr:not(tr.ActorInfosHeader)').each(function(index,tr){
						var intershipToPush      = {};
						intershipToPush.firmName = $(this).find('td:eq(0)').text();
						intershipToPush.date     = $(this).find('td:eq(1)').text();
						intershipToPush.state    = $(this).find('td:eq(2)').text();
						internship.push(intershipToPush);
			 		});

				},
				error  : function(){
		           supmark.addError("Ajax request failed, check your internet connection.");
   				}
			});			
			localStorage.setItem("internship", JSON.stringify(internship)); // Serialise l'objet pour l'enregistrer dans le storage	
			return internship;
		} else {
			supmark.login2(localStorage.campusid, this.d(localStorage.password)); // On se log
			setTimeout(function(){
			    supmark.log("Now getting Summary/..");
			    supmark.getInternship();
			},10000);
		}
	}

	this.getSummary = function(){
		if(supmark.isLogged() === true){
			var summary = [];
	  		$.ajax({
			 	type   : "GET",
			   	async  : false,
			  	url    : "http://www.campus-booster.net/Booster/students/marks.aspx?kind=Summary",
			 	success: function(msg){
			 		msg = msg.replace(/<img[^>]+>/gi, "");
			 		$(msg).find("#ctl00_ContentPlaceHolder1_Lab1_updMain table:last tr").each(function(index,elem){
			 			if(index>0 && index<6){
			 				if(!$(elem).find("td").attr("colspan")){
								var name    = $(elem).find("td:first").text();
								var credits = $(elem).find("strong:first").text();
			 					summary.push({name:name,credits:credits});
			 				}
			 			}
			 		});
				},
				error  : function(){
		           supmark.addError("Ajax request failed, check your internet connection.");
   				}
			});
			localStorage.setItem("summary", JSON.stringify(summary)); // Serialise l'objet pour l'enregistrer dans le storage	
			return summary;
		} else {
			supmark.login2(localStorage.campusid, this.d(localStorage.password)); // On se log
			setTimeout(function(){
			    supmark.log("Now getting Summary...");
			    supmark.getSummary();
			},10000);
		}
	}

	this.launchNotification = function(urlIcon, titleNotif, textNotif, onclickFunction){
		if(urlIcon    === null){urlIcon    = "../img/logo48.png";}
		if(textNotif  === null){textNotif  = 'Hello';}
		if(titleNotif === null){titleNotif = 'THello';}
		var notification = webkitNotifications.createNotification(urlIcon, titleNotif, textNotif);
		chrome.extension.getViews().forEach(function(view){
			notification.show();
			notification.onclick = function(){ if(onclickFunction){onclickFunction();} notification.cancel();};
			var timerNotif       = setTimeout(function(){notification.cancel();}, 10000);
		});
	}

	// Credits : crypo.net
	this.e = function(input) {
		input = escape(input); 
		var output = ""; 
		var chr1, chr2, chr3 = ""; 
		var enc1, enc2, enc3, enc4 = ""; 
		var i = 0; 

		do { 
			chr1 = input.charCodeAt(i++); 
			chr2 = input.charCodeAt(i++); 
			chr3 = input.charCodeAt(i++); 
			enc1 = chr1 >> 2; 
			enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);  
			enc3 = ((chr2 & 15) << 2) | (chr3 >> 6); 
			enc4 = chr3 & 63; 

			if (isNaN(chr2)) { 
				enc3 = enc4 = 64; 
			} else if (isNaN(chr3)) { 
				enc4 = 64; 
			} 

			output = output + keyStr.charAt(enc1) + keyStr.charAt(enc2) + keyStr.charAt(enc3) + keyStr.charAt(enc4); 
			chr1 = chr2 = chr3 = ""; 
			enc1 = enc2 = enc3 = enc4 = ""; 
		} while (i < input.length); 
		output = "<!::!>" + output;
		return output; 
	}

	// Credits : crypo.net
	this.d = function(input){ 
		var output = ""; 
		var chr1, chr2, chr3 = ""; 
		var enc1, enc2, enc3, enc4 = ""; 
		var i = 0; 
		var mimcod = /[^A-Za-z0-9\+\/\=]/g; 

		input = input.replace(/<!::!>/g, "");
		
		if (mimcod.exec(input)) { 
			supmark.log("Errors in decoding."); 
		} 

		input = input.replace(/[^A-Za-z0-9\+\/\=]/g, ""); 

		do { 
			enc1 = keyStr.indexOf(input.charAt(i++));  
			enc2 = keyStr.indexOf(input.charAt(i++)); 
			enc3 = keyStr.indexOf(input.charAt(i++)); 
			enc4 = keyStr.indexOf(input.charAt(i++)); 
			chr1 = (enc1 << 2) | (enc2 >> 4); 
			chr2 = ((enc2 & 15) << 4) | (enc3 >> 2); 
			chr3 = ((enc3 & 3) << 6) | enc4; 
			output = output + String.fromCharCode(chr1); 

			if (enc3 != 64) { 
				output = output + String.fromCharCode(chr2); 
			} 

			if (enc4 != 64) { 
				output = output + String.fromCharCode(chr3); 
			} 

			chr1 = chr2 = chr3 = ""; 
			enc1 = enc2 = enc3 = enc4 = ""; 
		} while (i < input.length); 

		return unescape(output); 
	}

	// Credits : crypo.net
	this.md5 = function (string) {
		function RotateLeft(lValue, iShiftBits) {
			return (lValue<<iShiftBits) | (lValue>>>(32-iShiftBits));
		}

		function AddUnsigned(lX,lY) {
			var lX4,lY4,lX8,lY8,lResult;
			lX8 = (lX & 0x80000000);
			lY8 = (lY & 0x80000000);
			lX4 = (lX & 0x40000000);
			lY4 = (lY & 0x40000000);
			lResult = (lX & 0x3FFFFFFF)+(lY & 0x3FFFFFFF);
			if (lX4 & lY4) {
				return (lResult ^ 0x80000000 ^ lX8 ^ lY8);
			}
			if (lX4 | lY4) {
				if (lResult & 0x40000000) {
					return (lResult ^ 0xC0000000 ^ lX8 ^ lY8);
				} else {
					return (lResult ^ 0x40000000 ^ lX8 ^ lY8);
				}
			} else {
				return (lResult ^ lX8 ^ lY8);
			}
			}

			function F(x,y,z) { return (x & y) | ((~x) & z); }
			function G(x,y,z) { return (x & z) | (y & (~z)); }
			function H(x,y,z) { return (x ^ y ^ z); }
		function I(x,y,z) { return (y ^ (x | (~z))); }

		function FF(a,b,c,d,x,s,ac) {
			a = AddUnsigned(a, AddUnsigned(AddUnsigned(F(b, c, d), x), ac));
			return AddUnsigned(RotateLeft(a, s), b);
		};

		function GG(a,b,c,d,x,s,ac) {
			a = AddUnsigned(a, AddUnsigned(AddUnsigned(G(b, c, d), x), ac));
			return AddUnsigned(RotateLeft(a, s), b);
		};

		function HH(a,b,c,d,x,s,ac) {
			a = AddUnsigned(a, AddUnsigned(AddUnsigned(H(b, c, d), x), ac));
			return AddUnsigned(RotateLeft(a, s), b);
		};

		function II(a,b,c,d,x,s,ac) {
			a = AddUnsigned(a, AddUnsigned(AddUnsigned(I(b, c, d), x), ac));
			return AddUnsigned(RotateLeft(a, s), b);
		};

		function ConvertToWordArray(string) {
			var lWordCount;
			var lMessageLength = string.length;
			var lNumberOfWords_temp1=lMessageLength + 8;
			var lNumberOfWords_temp2=(lNumberOfWords_temp1-(lNumberOfWords_temp1 % 64))/64;
			var lNumberOfWords = (lNumberOfWords_temp2+1)*16;
			var lWordArray=Array(lNumberOfWords-1);
			var lBytePosition = 0;
			var lByteCount = 0;
			while ( lByteCount < lMessageLength ) {
				lWordCount = (lByteCount-(lByteCount % 4))/4;
				lBytePosition = (lByteCount % 4)*8;
				lWordArray[lWordCount] = (lWordArray[lWordCount] | (string.charCodeAt(lByteCount)<<lBytePosition));
				lByteCount++;
			}
			lWordCount = (lByteCount-(lByteCount % 4))/4;
			lBytePosition = (lByteCount % 4)*8;
			lWordArray[lWordCount] = lWordArray[lWordCount] | (0x80<<lBytePosition);
			lWordArray[lNumberOfWords-2] = lMessageLength<<3;
			lWordArray[lNumberOfWords-1] = lMessageLength>>>29;
			return lWordArray;
		};

		function WordToHex(lValue) {
			var WordToHexValue="",WordToHexValue_temp="",lByte,lCount;
			for (lCount = 0;lCount<=3;lCount++) {
				lByte = (lValue>>>(lCount*8)) & 255;
				WordToHexValue_temp = "0" + lByte.toString(16);
				WordToHexValue = WordToHexValue + WordToHexValue_temp.substr(WordToHexValue_temp.length-2,2);
			}
			return WordToHexValue;
		};

		function Utf8Encode(string) {
			string = string.replace(/\r\n/g,"\n");
			var utftext = "";

			for (var n = 0; n < string.length; n++) {

				var c = string.charCodeAt(n);

				if (c < 128) {
					utftext += String.fromCharCode(c);
				}
				else if((c > 127) && (c < 2048)) {
					utftext += String.fromCharCode((c >> 6) | 192);
					utftext += String.fromCharCode((c & 63) | 128);
				}
				else {
					utftext += String.fromCharCode((c >> 12) | 224);
					utftext += String.fromCharCode(((c >> 6) & 63) | 128);
					utftext += String.fromCharCode((c & 63) | 128);
				}

			}

			return utftext;
		};

		var x=Array();
		var k,AA,BB,CC,DD,a,b,c,d;
		var S11=7, S12=12, S13=17, S14=22;
		var S21=5, S22=9 , S23=14, S24=20;
		var S31=4, S32=11, S33=16, S34=23;
		var S41=6, S42=10, S43=15, S44=21;

		string = Utf8Encode(string);

		x = ConvertToWordArray(string);

		a = 0x67452301; b = 0xEFCDAB89; c = 0x98BADCFE; d = 0x10325476;

		for (k=0;k<x.length;k+=16) {
			AA=a; BB=b; CC=c; DD=d;
			a=FF(a,b,c,d,x[k+0], S11,0xD76AA478);
			d=FF(d,a,b,c,x[k+1], S12,0xE8C7B756);
			c=FF(c,d,a,b,x[k+2], S13,0x242070DB);
			b=FF(b,c,d,a,x[k+3], S14,0xC1BDCEEE);
			a=FF(a,b,c,d,x[k+4], S11,0xF57C0FAF);
			d=FF(d,a,b,c,x[k+5], S12,0x4787C62A);
			c=FF(c,d,a,b,x[k+6], S13,0xA8304613);
			b=FF(b,c,d,a,x[k+7], S14,0xFD469501);
			a=FF(a,b,c,d,x[k+8], S11,0x698098D8);
			d=FF(d,a,b,c,x[k+9], S12,0x8B44F7AF);
			c=FF(c,d,a,b,x[k+10],S13,0xFFFF5BB1);
			b=FF(b,c,d,a,x[k+11],S14,0x895CD7BE);
			a=FF(a,b,c,d,x[k+12],S11,0x6B901122);
			d=FF(d,a,b,c,x[k+13],S12,0xFD987193);
			c=FF(c,d,a,b,x[k+14],S13,0xA679438E);
			b=FF(b,c,d,a,x[k+15],S14,0x49B40821);
			a=GG(a,b,c,d,x[k+1], S21,0xF61E2562);
			d=GG(d,a,b,c,x[k+6], S22,0xC040B340);
			c=GG(c,d,a,b,x[k+11],S23,0x265E5A51);
			b=GG(b,c,d,a,x[k+0], S24,0xE9B6C7AA);
			a=GG(a,b,c,d,x[k+5], S21,0xD62F105D);
			d=GG(d,a,b,c,x[k+10],S22,0x2441453);
			c=GG(c,d,a,b,x[k+15],S23,0xD8A1E681);
			b=GG(b,c,d,a,x[k+4], S24,0xE7D3FBC8);
			a=GG(a,b,c,d,x[k+9], S21,0x21E1CDE6);
			d=GG(d,a,b,c,x[k+14],S22,0xC33707D6);
			c=GG(c,d,a,b,x[k+3], S23,0xF4D50D87);
			b=GG(b,c,d,a,x[k+8], S24,0x455A14ED);
			a=GG(a,b,c,d,x[k+13],S21,0xA9E3E905);
			d=GG(d,a,b,c,x[k+2], S22,0xFCEFA3F8);
			c=GG(c,d,a,b,x[k+7], S23,0x676F02D9);
			b=GG(b,c,d,a,x[k+12],S24,0x8D2A4C8A);
			a=HH(a,b,c,d,x[k+5], S31,0xFFFA3942);
			d=HH(d,a,b,c,x[k+8], S32,0x8771F681);
			c=HH(c,d,a,b,x[k+11],S33,0x6D9D6122);
			b=HH(b,c,d,a,x[k+14],S34,0xFDE5380C);
			a=HH(a,b,c,d,x[k+1], S31,0xA4BEEA44);
			d=HH(d,a,b,c,x[k+4], S32,0x4BDECFA9);
			c=HH(c,d,a,b,x[k+7], S33,0xF6BB4B60);
			b=HH(b,c,d,a,x[k+10],S34,0xBEBFBC70);
			a=HH(a,b,c,d,x[k+13],S31,0x289B7EC6);
			d=HH(d,a,b,c,x[k+0], S32,0xEAA127FA);
			c=HH(c,d,a,b,x[k+3], S33,0xD4EF3085);
			b=HH(b,c,d,a,x[k+6], S34,0x4881D05);
			a=HH(a,b,c,d,x[k+9], S31,0xD9D4D039);
			d=HH(d,a,b,c,x[k+12],S32,0xE6DB99E5);
			c=HH(c,d,a,b,x[k+15],S33,0x1FA27CF8);
			b=HH(b,c,d,a,x[k+2], S34,0xC4AC5665);
			a=II(a,b,c,d,x[k+0], S41,0xF4292244);
			d=II(d,a,b,c,x[k+7], S42,0x432AFF97);
			c=II(c,d,a,b,x[k+14],S43,0xAB9423A7);
			b=II(b,c,d,a,x[k+5], S44,0xFC93A039);
			a=II(a,b,c,d,x[k+12],S41,0x655B59C3);
			d=II(d,a,b,c,x[k+3], S42,0x8F0CCC92);
			c=II(c,d,a,b,x[k+10],S43,0xFFEFF47D);
			b=II(b,c,d,a,x[k+1], S44,0x85845DD1);
			a=II(a,b,c,d,x[k+8], S41,0x6FA87E4F);
			d=II(d,a,b,c,x[k+15],S42,0xFE2CE6E0);
			c=II(c,d,a,b,x[k+6], S43,0xA3014314);
			b=II(b,c,d,a,x[k+13],S44,0x4E0811A1);
			a=II(a,b,c,d,x[k+4], S41,0xF7537E82);
			d=II(d,a,b,c,x[k+11],S42,0xBD3AF235);
			c=II(c,d,a,b,x[k+2], S43,0x2AD7D2BB);
			b=II(b,c,d,a,x[k+9], S44,0xEB86D391);
			a=AddUnsigned(a,AA);
			b=AddUnsigned(b,BB);
			c=AddUnsigned(c,CC);
			d=AddUnsigned(d,DD);
		}

		var temp = WordToHex(a)+WordToHex(b)+WordToHex(c)+WordToHex(d);

		return temp.toLowerCase();
	}

	//##############################
	// GETTERS & SETTERS
	//##############################

	this.setCampusId = function(id)   // Setter de l'ID
	{
		this.campusid = id; 
	}

	this.getCampusId = function() // Getter de l'ID
	{
		return this.campusid;
	}
	this.getPassword = function(password) // getter du password
	{
		return this.d(this.password);
	}

	this.setPassword = function(password) // Setter du password
	{
		this.password = this.e(password);
	}

	this.setName = function(name)   // Setter du nom
	{
		this.name = name; 
	}

	this.getName = function() // Getter du nom
	{
		return this.name;
	}

	this.setTempId = function(tempId)   // Setter de l'ID temporaire
	{
		this.tempId = tempId; 
	}

	this.getTempId = function() // Getter de l'ID temporaire
	{
		return this.tempId;
	}

	this.setTempPassword = function(tempPassword)   // Setter du password temporaire
	{
		this.tempPassword = tempPassword; 
	}

	this.getTempPassword = function() // Getter du password temporaire
	{
		return this.tempPassword;
	}

	//##############################
	// CONSTRUCTEUR
	//##############################

}
 
