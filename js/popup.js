var supmark = chrome.extension.getBackgroundPage().supmark;

function initializeGMaps() {
	navigator.geolocation.getCurrentPosition(mapsCallbackSuccess, mapsCallbackError, { enableHighAccuracy: true, timeout: 10000, maximumAge: Infinity });
}

function loadGMaps() {
	var script = document.createElement("script");
	script.type = "text/javascript";
	script.src = "https://maps.googleapis.com/maps/api/js?key=AIzaSyBBvFQ4cJF4FegZ1vVgXrrJZ__djvMPdcE&sensor=false&libraries=weather&callback=initializeGMaps";
	document.body.appendChild(script);
}

function mapsCallbackSuccess(position) {
	supmark.log(position);
	var lat = position.coords.latitude;
	var lng = position.coords.longitude;
	var pos = new google.maps.LatLng(lat, lng);
	supmark.log(lat);
	supmark.log(lng);
	var mapOptions = {
		zoom: 7,
		center: pos,
		disableDefaultUI: true,
		mapTypeControl: true,
		mapTypeId: google.maps.MapTypeId.HYBRID
	}
	var map = new google.maps.Map(document.getElementById("mark-container"), mapOptions);
	marker = new google.maps.Marker({
		map:map,
		draggable: false,
		animation: google.maps.Animation.DROP,
		title: "You are here",
		position: pos
	});
	setLayersMaps(map);
}

function mapsCallbackError(error) {
	supmark.log('There was an error with GMaps : ');
	supmark.log(error);
	var mapOptions = {
		zoom: 2,
		center: new google.maps.LatLng(25.165173,-23.90625),
		disableDefaultUI: true,
		mapTypeControl: true,
		mapTypeId: google.maps.MapTypeId.HYBRID
	}
	var map = new google.maps.Map(document.getElementById("mark-container"), mapOptions);
	setLayersMaps(map);
}

//Rajoute la couche météo et les transports en commun dans les grandes villes

function refreshAll()
{
	if(!supmark.isRegistered()){
		exit;
	}
	runPageStart();
	$("#mark-container").fadeOut().queue(function() 
	{
		
		supmark.checkAll();
		showMark($("#mark-container"), false);
		supmark.refreshBadge();
		$("#mark-container").fadeIn();
		runPageEnd();
		$(this).dequeue();
		supmark.launchNotification(null,"Success","All informations have been refreshed");
	}).fadeIn();

}


function setLayersMaps(map){
	var ctaLayer = new google.maps.KmlLayer(
		'https://maps.google.fr/maps/ms?ie=UTF8&t=h&oe=UTF8&authuser=0&msa=0&output=kml&msid=212676093823261248407.000465792f3231179dcb6',
		{	
			preserveViewport: true,
			suppressInfoWindows: false
		}
	);
	ctaLayer.setMap(map);
	var weatherLayer = new google.maps.weather.WeatherLayer({
	  temperatureUnits: google.maps.weather.TemperatureUnit.CELSIUS
	});
	weatherLayer.setMap(map);
	var transitLayer = new google.maps.TransitLayer();
	transitLayer.setMap(map);
	//map.setCenter(position);
}

function update_counter(){
	if(localStorage.getItem("notification")){
		notification     = JSON.parse(localStorage.getItem("notification"));
		var notifcounter = 0;
		for (var i = 0; i<notification.length; i++){
			if(notification[i].isViewed == 0){
				notifcounter++;
			}
		}
		$("#notifcounter").html(notifcounter);
		if(notifcounter == 0){
			$("#notifcounter").hide();
		} else {
			$("#notifcounter").show();
		}
		supmark.refreshBadge();
	}
}

function showCalendar(action){
	if(!supmark.isRegistered()){
		exit;
	}
	var currentWeek = $("#current-week").val();
	runPageStart();
	$("#mark-container").fadeOut().queue(function() {
		var cal;
		if(!localStorage.cal || localStorage.cal == ''){
			cal = supmark.checkICal();
		} else {
			cal = JSON.parse(localStorage.getItem("cal"));
		}
		if(cal == undefined){ $("#mark-container").html('Impossible de charger le contenu!'); return false;}
		if(action==undefined) {
			week = 0;
		} else {
			switch (action){
				case 'next':
					week = parseInt(currentWeek) + parseInt(1);
				break;
				case 'previous':
					week = parseInt(currentWeek) - parseInt(1);
				break;
			}
		}
		var selectedWeek;
		switch (week){
			case -1:
				selectedWeek = cal.weekMinus1;
			break;
			case 0:
				selectedWeek = cal.week0;
			break;
			case 1:
				selectedWeek = cal.week1;
			break;
			case 2:
				selectedWeek = cal.week2;
			break;
			case 3:
				selectedWeek = cal.week3;
			break;
		}
		day       = [ "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday" ];
		html      = "";
		html      += '<input type="hidden" id="current-week" value="' + week + '">';
		html      += '<div class="navbar" style="margin-bottom:0px;"><div class="navbar-inner">';
		html      += '<button style="width:150px;" class="btn pull-left" id="previous-week"><i class="icon icon-black icon-chevron-left"></i> Previous week </button>';
		html      += '<button class="btn btn-primary" style="margin-left:120px;" id="download-cal"><i class="icon icon-white icon-arrow-down"></i> Download ICS version</button>'
		html      += '<button style="width:150px;" class="btn pull-right" id="next-week"> Next week <i class="icon icon-black icon-chevron-right"></i></button>';
		html      += '</div></div>';
		//supmark.log(cal);
		html      += '<table class="cal-table table table-bordered table-condensed" >';
		html      += '<tr>'
		timeID    = [];
		var d     = new Date();
		var dat   = d.getDate();
		var hour  = d.getHours();
		var month = d.getMonth()+1;
		var isCurrentDay = false;
		html      += '<th class="btn-like"> Hours </th>';
		dateDay   = [];
		dateMonth = [];
		for(i=0;i<5;i++){
			dateDay[i]   = selectedWeek.days[i].Name.split('/')[0];	
			dateMonth[i] = selectedWeek.days[i].Name.split('/')[1];	
			if ((dateDay[i] == dat) && (dateMonth[i] == month)){
				today = ' btn-success';
				isCurrentDay = true;
			} else {
				today = ' btn-like';
			}
			html       += '<th class="'+today+'">';
			html       += day[i] + '<br/>' + selectedWeek.days[i].Name;
			html       += '</th>';
			timeIDTemp = selectedWeek.days[i].Name.split('/');
			timeID[i]  = timeIDTemp[2]+'-'+timeIDTemp[1]+'-'+timeIDTemp[0]+'T';
		}
		html += '</tr>';
		for(i=8;i<=19;i++){
			html += '<tr>';
			if(hour == i && isCurrentDay){
				today = ' btn-success';
			} else {
				today = ' btn-like';
			}
			html += '<td style="line-height:30px;" class="cal-td'+today+'">' + i + 'h - ' + (parseInt(i)+parseInt(1)) + 'h</td>';
			for(j=0;j<5;j++){
				var time;
				time = timeID[j] + ('0' + ( i)).slice(-2) + ':00:00';
				time = supmark.md5(time);
				html += '<td class="cal-td" ><div class="cal-div" id="'+time+'"></div></td>';
			}
			html += '</tr>';
		}
		html += '</table>';
		$("#mark-container").html(html);
		if($("#current-week").val() == '3'){
			$('#next-week').attr("disabled","disabled");
		}
		if($("#current-week").val() == '-1'){
			$('#previous-week').attr("disabled","disabled");
		}
		$("#next-week").click(function(){
			//runPageStart();
			$(this).attr('disabled','disabled');
			showCalendar('next');
			runPageEnd();
		});
		$("#previous-week").click(function(){
			//runPageStart();
			$(this).attr('disabled','disabled');
			showCalendar('previous');
			runPageEnd();
		});
		$("#download-cal").click(function(){
			supmark.getICal();
		});
		for(i=0;i<selectedWeek.events.length;i++){
			var idhash;
			idhash     = supmark.md5(selectedWeek.events[i].Start);
			eventObj   = selectedWeek.events[i];
			endHour    = eventObj.End.split('T')[1].split(':')[0];
			startHour  = eventObj.Start.split('T')[1].split(':')[0];
			courseTime = endHour - startHour;
			currentTd  = $('#' + idhash);
			$(currentTd).html( '<br/>'+eventObj.Text );
			if( eventObj.BackColor == '#FF0000' || eventObj.BackColor == '#E55653' || eventObj.Tag[2] == 'QCM'  || eventObj.Tag[2] == 'SOE' ){
				$(currentTd).parent().addClass('cal-red');
			} else {
				$(currentTd).parent().addClass('cal-blue');
			}
			weekDay = new Date(eventObj.Start)
			if(parseInt(weekDay.getDay()) < parseInt(3) ){
				placement = 'right';
			} else {
				placement = 'left';
			}
			htmlContent = '<div style="margin:0px;padding:3px;font-size:10px;" class="well"><ul class="nav nav-list">';
			htmlContent += '<li><i class="icon icon-time icon-black"></i> ' +  courseTime + ' hour(s)</li>';
			htmlContent += '<li style="white-space:nowrap;overflow:hidden"><i class="icon icon-tags icon-black"></i> ' +  eventObj.Tag[2] + '</li>';
			htmlContent += '</ul></div>'
			$(currentTd).parent().attr('rowspan',courseTime);
			//$(currentTd).parent().popover({ title:eventObj.ToolTip, animate: false, trigger:"click", "placement":placement, content:htmlContent, html:true, delay:{show:0,hide:0} });
			$(currentTd).popover({ title:eventObj.ToolTip, animate: false, trigger:"hover", "placement":placement, content:htmlContent, html:true, delay:{show:0,hide:0} });
			
			if(courseTime > 1)
			{		
				for(j=1;j<courseTime;j++)
				{
					
					var datePart  = eventObj.Start.split('T')[0];
					var clockPart = eventObj.Start.split('T')[1].split(':');
					clockPart[0]  = parseInt(clockPart[0],10) + parseInt(j,10) ;
					var finalPart = supmark.md5(datePart + 'T' + ('0' +  clockPart[0] ).slice(-2)  + ':' + clockPart[1] + ':' + clockPart[2]);
					$('#' + finalPart).parent().remove();

				}
		
			}

			
		}
		$('.cal-table td').width($('.cal-table').width()/5);
		runPageEnd();
		$(this).dequeue();
	}).fadeIn();
}

function showMark(divObject,force,year){
	

	if(!supmark.isRegistered()){
		exit;
	}
	runPageStart();
	$("#mark-container").fadeOut().queue(function() 
	{

		if(supmark.isMarksAvailable() === true)
		{

			if(!localStorage.getItem("marks") || force==true)
			{ // Si pas de note dans le storage

				var years;
				years = supmark.getMarks(); // On les récupére

			} 
			else 
			{
				var years = JSON.parse(localStorage.getItem("marks"));
			}

			var currentYear = localStorage.getItem("current-year"); // On set l'année actuelle

			if(year == undefined) // Si aucune année est envoyée en paramétre
			{
				year = currentYear; // On prend la premiére année de la liste (Année actuelle)
			}

			// Maintenant on récupére les notes de la promo demandé

			for (var i = 0; i < years.length; i++) {
				
				if(years[i].id == year)
				{
					var subjects = years[i].subjects;
				}
			};

	

			update_counter();
			var total_credits = 0;
			var owned_credits = 0;

			if(subjects)
			{

				if(divObject)
				{

					divObject.html('');
					var navbar;

					navbar = '<div class="navbar" style="margin-bottom:0px;"><div class="navbar-inner">';

					navbar +=	'<a style="margin-left:5px;" class="btn pull-right" id="refresh_button"><i class="icon-refresh icon-black"></i><span>&nbsp;Refresh</span></a>';
					navbar += '<select class="pull-right" id="year-select">';

					for (var i = 0; i < years.length; i++) 
					{
						navbar += '<option value="'+years[i].id+'">'+years[i].label+'</option>';
					};

					navbar += '</select>';
					navbar += '</div></div>';
					divObject.append(navbar);


					$("#refresh_button").click(function()
					{

						if(supmark.isRegistered()){ 
							if(supmark.isLogged()){

								showMark($("#mark-container"), true, $('#year-select option:selected').val());
								supmark.launchNotification(null,"Success","Refresh done");
								
							} else {
								supmark.launchNotification(null,"Error","Refresh failed");
								supmark.login2(localStorage.campusid, supmark.d(localStorage.password));
							}
						}
					});


					//On focus l'option du select sur l'année sélectionnée
					$('#year-select').val(year);

					if(subjects.length<1)
					{
						divObject.append('<div style="font-size:20px;text-align:center;margin-top:200px;">No marks for the moment</div>');
					}
					else
					{

						divObject.append('<div class=""><table id="mark_table" class="table "><tr></tr></table></div>');

						for (var i = 0; i<subjects.length; i++){
							total_credits += parseInt(subjects[i].credits);
							if(subjects[i].pass == true){
								owned_credits += parseInt(subjects[i].credits);
							}
							if(subjects[i].id != null){
								if(subjects[i].pass === true){
									var icon = "glyphicon-ok-2";
									var navClass = 'btn-like';
								} else {
									var icon = "glyphicon-remove-2";
									var navClass = 'btn-like';
								}
								$("<tr class='"+navClass+"' id='"+ subjects[i].id +"'><th> <i class=\""+icon+"\"></i> " + subjects[i].id + " - " + subjects[i].title + " - " + subjects[i].credits + ' Credit(s) </th></tr>').insertAfter("#mark_table>tbody>tr:last");
								if(subjects[i].marks != null){
									for (var j = 0; j<subjects[i].marks.length; j++){
										var color = "";
										if(subjects[i].marks[j].points>=10){
											color="success";
										} else {
											color="important";
										}
										$("<tr><td><b>"+subjects[i].marks[j].type+"</b> - " + subjects[i].marks[j].fullType + " <span style='min-width:30px;text-align:center;' class='badge badge-"+color+" pull-right'>"+subjects[i].marks[j].points+"</span></td></tr>").insertAfter("#mark_table>tbody>tr:last");
									}
								} else {
									$("<tr><td>No Marks</td></tr>").insertAfter("#mark_table>tbody>tr:last");		
								}
							}
						}

					}

				} else {
					for (var i = 0; i<subjects.length; i++){
						total_credits += parseInt(subjects[i].credits);	
						if(subjects[i].pass == true){
							owned_credits += parseInt(subjects[i].credits);
						}
					}
				}
			}

			//Permet d'appeler la fonction showMark lorsqu'une année est selectionnée dans le select
			$('#year-select').change(function() {
	  			supmark.log( $('#year-select option:selected').val() );
	  			showMark($("#mark-container"), false, $('#year-select option:selected').val());
			});

			$("#owned_credits").html(owned_credits);
			$("#total_credits").html(total_credits);
			if(owned_credits>=60)
			{
				$("#parent-bar").attr("class", "progress progress-success progress-striped");
			} 
			else 
			{
				$("#parent-bar").attr("class", "progress progress-danger progress-striped");	
			}
			var percent   = (owned_credits>0) ? owned_credits / total_credits   * 100 : owned_credits ;
			var percent60 = owned_credits / 60   * 100   ;
			$("#progress-bar").css("width", percent60+"%");
			$("#percent60").html(Math.round(percent60).toString());
			$("#percent").html(Math.round(percent).toString());
		
		} 
		else 
		{
			$("#mark-container").html('<p>Marks not available on Campus Booster (maintenance).</p>');
		}

		$("#mark-container").fadeIn();
		runPageEnd();
		$(this).dequeue();

	}).fadeIn();

}

/** Links **/

var links = {
	'apple'         : { 'link' : 'http://www.campus-booster.net/Booster/Partners/Apple/default.aspx' },
	'campusbooster' : { 'link' : 'http://www.campus-booster.net/' },
	'courses'       : { 'link' : 'http://courses.supinfo.com/' },
	'documents'     : { 'link' : 'http://www.campus-booster.net/Booster/students/schoolingServ.aspx' },
	'dreamspark'    : { 'link' : 'http://e5.onthehub.com/WebStore/ProductsByMajorVersionList.aspx?cmi_mnuMain=04cce678-138e-e111-981b-f04da23e67f6&ws=bce27656-836f-e011-971f-0030487d8897' },
	'exam-vouchers' : { 'link' : 'http://www.campus-booster.net/Booster/students/voucher.aspx' },
	'libraries'     : { 'link' : 'http://libraries.supinfo.com/' },
	'licensing'     : { 'link' : 'http://www.campus-booster.net/Booster/students/licensing.aspx' },
	'msdnaa'        : { 'link' : 'http://e5.onthehub.com/WebStore/ProductsByMajorVersionList.aspx?cmi_mnuMain=14cc2a68-cb92-e011-969d-0030487d8897&ws=bce27656-836f-e011-971f-0030487d8897' },
	'outlook'       : { 'link' : 'http://www.outlook.com/' },
	'spr'           : { 'link' : 'http://spr.supinfo.com/' },
	'vmware'        : { 'link' : 'http://e5.onthehub.com/WebStore/ProductsByMajorVersionList.aspx?ws=c9e8142d-f0a6-de11-886d-0030487d8897' }
};

function clickHandler(name){
	chrome.tabs.create({"url":links[name].link, "selected":true});
}

function runPageStart(){ 
	$('#mark-container').removeAttr('style');
	//$('#mark-container').css('cursor', 'wait');
	$("#mark-container").html('<div id="spinner"><div class="bar1"></div><div class="bar2"></div><div class="bar3"></div><div class="bar4"></div><div class="bar5"></div><div class="bar6"></div><div class="bar7"></div><div class="bar8"></div></div>');
	centerSpinner();
	$('.cal-td').unbind();
}

function runPageEnd(){ 
	//$('#mark-container').css('cursor', 'auto');
}

function centerSpinner(){ 
	marginH = ( $('#mark-container').outerHeight() - $('#spinner').outerHeight() ) / 2;
	marginW = ( $('#mark-container').outerWidth() - $('#spinner').outerWidth() ) / 2;
	$('#spinner').css('margin', marginH+'px '+marginW+'px');
}

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
 	var buttons = document.querySelectorAll('a');
 	for (var i = 0; i < buttons.length; i++) {
 		buttons[i].addEventListener('click', trackButtonClick);
 	}

	$("#internship").click(function(){
		if(!supmark.isRegistered()){
			exit;
		}
		runPageStart();
		$("#mark-container").fadeOut().queue(function() {
			$("#mark-container").html('');
			if(!localStorage.getItem("internship")){
				var internship = supmark.getInternship();
			} else {
				var internship = JSON.parse(localStorage.getItem("internship"));	
			}
			$("#mark-container").html('<table id="internship_tab" class="table"><tr class="btn-like"><th>Company name</th><th>Request date</th><th>Request state</th></tr></table>');
			for (var i = 0; i < internship.length; i++) {
				$('#internship_tab').append('<tr class="btn-like"><td>' + internship[i].firmName + '</td><td>'  + internship[i].date + '</td><td>'+  internship[i].state + '</td></tr>')
			};
			runPageEnd();
			$(this).dequeue();
		}).fadeIn();
	});

	$("#summary").click(function(){
		if(!supmark.isRegistered()){
			exit;
		}
		runPageStart();
		$("#mark-container").fadeOut().queue(function() {
			if(!localStorage.getItem("summary")){
				var summary = supmark.getSummary();
			} else {
				var summary = JSON.parse(localStorage.getItem("summary"));	
			}
			$("#mark-container").html('<table id="summary_tab" class="table"><tr class="btn-like"><th style="text-align:center" colspan=3>Estimated ECTS Credits</th></tr></table>');
			var counter = 0;
			for( i=0;i < summary.length;i++){		
				var color;
				if(summary[i].credits>=60) {
					color = "success";
					check = '<i title="Validated" class="icon icon-ok pull-left"></i> ';
					if(summary[i].credits>60) {
						plus = '<i title="More than 60 Credits" class="icon icon-plus pull-left"></i> ';
					} else {
						plus = '';
					}
				} else {
					check = '';
					color = "danger";
					plus  = '';
				} 
				counter             += parseInt(summary[i].credits);
				var percent         = summary[i].credits / 70 * 100;
				var percent60       = summary[i].credits / 60 * 100;
				var credits_display = summary[i].credits + ' Credits | '+Math.round(percent60).toString()+'%';
				var progressbar     = '<div  class="progress progress-'+color+' progress-striped pull-left" style="margin-bottom: 10px;margin-top:10px;margin-left:5px;width:300px;margin-right:5px;"><div class="bar" id="progress-bar" style="width: '+percent60+'%;"></div></div>';
				$('<tr  class="btn-like"><td style="line-height : 40px;">'+summary[i].name+'</td><td style="line-height : 30px; ">'+progressbar+'<div style="padding-bottom:10px;padding-top:10px;">'+plus+check+'</div></td><td style="line-height : 40px;">'+credits_display+'</td></tr>').insertAfter("#summary_tab>tbody>tr:last");
			}
			var color;
			if(counter>=(summary.length*60)){
				color = "success";
			} else {
				color = "danger";
			}
			percentTotal    = counter / (summary.length*60) * 100;
			var progressbar = '<div id="parent-bar" class=" progress-info progress progress-'+color+' progress-striped pull-left" style="margin-bottom: 10px;margin-top:10px;margin-left:5px;width:300px;margin-right:5px;"><div class="bar" id="progress-bar" style="width: '+percentTotal.toString()+'%;"></div></div>';
			$('<tr class="btn-like"><td style="line-height : 40px;"><b>Total Credits Earned</b></td><td style="line-height : 30px;">' + progressbar + '</td><td style="line-height : 40px;">'+counter+' / '+(summary.length*60)+' Credits | '+Math.round(percentTotal).toString()+'%</td></tr>').insertAfter("#summary_tab>tbody>tr:last");
			if(supmark.isSummaryAvailable() !== true){
				$("#mark-container").append('<p>Summary not available on Campus Booster (maintenance).</p>');
			}
			runPageEnd();
			$(this).dequeue();	
		}).fadeIn();
	});
	$("#refresh-all").click(function(){
		refreshAll();
	});
	$("#marks").click(function(){
		showMark($("#mark-container"),false);
	});

	$("#planning").click(function(){
		showCalendar();
	});

	$("#mates").click(function(){
		if(!supmark.isRegistered()){
			exit;
		}
		runPageStart();
		$("#mark-container").fadeOut().queue(function() {
			if(!localStorage.getItem("mates")){
				var mates = supmark.getClassMates();
			} else {
				var mates = JSON.parse(localStorage.getItem("mates"));	
			}
			html = "";
			for(i=0;i<mates.length;i++){
				html += '<div class="card-style"><img class="supinfo-img" src="../img/supinfo.png"/><img class="card-style-photo" src="http://www.campus-booster.net/actorpictures/'+mates[i].id+'.jpg"/><div class="infos" ><ul class="list-infos"><li><span class="icon icon-user icon-black"> </span>&nbsp;&nbsp;'+mates[i].name+'<li/><li><span class="icon icon-tag icon-black"> </span>&nbsp;&nbsp;'+mates[i].id+'<li/><li><span class="icon icon-envelope icon-black"> </span>&nbsp;&nbsp;<a class="mailto" href="mailto:'+mates[i].id+'@supinfo.com" >'+mates[i].id+'@supinfo.com</a></li></ul></div></div>';
			}
			$("#mark-container").html(html);
			$("img").error(function(){
				$(this).attr("src", "../img/missing.png");
			});
			$('.mailto').click(function(){
				chrome.tabs.create({url: $(this).attr('href')});
				return false;
			});
			runPageEnd();
			$(this).dequeue();	
		}).fadeIn();
	});

	$("#maps").click(function(){
		if(!supmark.isRegistered()){
			exit;
		}
		runPageStart();
		$("#mark-container").fadeOut().queue(function() {
			$("#mark-container").html('');
			loadGMaps();
			runPageEnd();
			$(this).dequeue();
		}).fadeIn();
	});

	$("#facebook").click(function(){
		chrome.tabs.create({"url":"http://www.facebook.com/supmarkplugin", "selected":true});
	});

	$("#notif_button").click(function(){
		$("#notification_list").html('<li class="divider"></li>');
		if(localStorage.getItem("notification")){
			notification    = JSON.parse(localStorage.getItem("notification"));
			var startOffset = notification.length - 10; // On récupére uniquement les 10 derniére notification
			if(startOffset<0){
				startOffset = 0;
			}
			for (var i = startOffset; i<notification.length; i++){				
				var dateObj = new Date(notification[i].time); 
				var date    = ('0' +  dateObj.getDate()).slice(-2) + '/' + ('0' + ( dateObj.getMonth()+1)).slice(-2) + '/' +  dateObj.getFullYear() + " " + ('0' +  dateObj.getHours()).slice(-2) + "h" + ('0' +  dateObj.getMinutes()).slice(-2);
				if(notification[i].isViewed == 0){				
					var new_icon = "<span class='label label-important'>NEW</span></i>";
				} else {
					new_icon = "";
				}
				$("<li class='divider'></li><li><i class='icon icon-exclamation-sign'></i> " + new_icon + " - " + date + " - " + notification[i].id + " - " + notification[i].type + " : <b>" + notification[i].mark + "</b> - " + notification[i].description + "</li>").insertBefore("#notification_list>li:first");
			}
			for(var i = 0; i < notification.length;i++){
				notification[i].isViewed = 1;
				localStorage.setItem("notification",JSON.stringify(notification));
			}
			update_counter();
		}
		$("<li > Lastest Notifications : </li>").insertBefore("#notification_list>li:first");		
	});

	for(var item in links){
		$("#" + item).click(function(){
			clickHandler($(this).attr('id'));
		});
	}

	$("#option_button").click(function(){
		chrome.tabs.create({"url": chrome.extension.getURL("../html/options.html"), "selected":true});
	});

	$("#close_button").click(function(){
		window.close();
	});



	if(supmark.isRegistered()){
		runPageStart();
		$("#user").html(localStorage.name);
		if( localStorage.defaultPage != null){
			$("#mark-container").html('');
			$('#' + localStorage.defaultPage ).trigger('click');
		} else {
			$("#mark-container").html('');
			$('#marks').trigger('click');
		}
	} else {
		$("#mark-container").html('<h5>Please register your account</h5>');
	}

	setInterval(function() { 
		update_counter();
	}, 2000);

 });


