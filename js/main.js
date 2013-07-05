/*
window.GMaps = {

    _el : "gmaps",
    _marker : null,
    _api_key : "",
    _position : null,
    _map : null,
    _kml : "https://maps.google.fr/maps/ms?ie=UTF8&t=h&oe=UTF8&authuser=0&msa=0&output=kml&msid=212676093823261248407.000465792f3231179dcb6",

    init : function(el){

        if(typeof el != 'undefined'){
            GMaps._el = $('#'+el);
        } else if (typeof GMaps._el != 'undefined'){
            GMaps._el = $('#'+GMaps._el);
        } else {
            console.error("No element was defined to draw map");
            return false;
        }

        var script = document.createElement("script");
		script.type = "text/javascript";
		//script.src = "https://maps.googleapis.com/maps/api/js?key="+GMaps._api_key+"&sensor=false&callback=GMaps.load";
		script.src = 'https://maps.googleapis.com/maps/api/js?v=3.exp&sensor=false&callback=GMaps.load';
		document.body.appendChild(script);
    },

    load : function(){
        navigator.geolocation.getCurrentPosition(GMaps.success, GMaps.error, { enableHighAccuracy: true, timeout: 10000, maximumAge: Infinity });
    },

    success : function(position){
        //console.log(position);
        var lat = position.coords.latitude;
        var lng = position.coords.longitude;
        console.log(lat);
        console.log(lng);

        GMaps._position = new google.maps.LatLng(lat, lng);

        var mapOptions = {
            zoom: 7,
            center: GMaps._position,
            disableDefaultUI: true,
            mapTypeControl: true,
            mapTypeId: google.maps.MapTypeId.HYBRID
        }

        GMaps.draw(mapOptions);
    },

    error : function(error){
        console.log('There was an error with GMaps : ');
        console.log(error);

        GMaps._position = new google.maps.LatLng(25.165173,-23.90625);

        var mapOptions = {
            zoom: 2,
            center: GMaps._position,
            disableDefaultUI: true,
            mapTypeControl: true,
            mapTypeId: google.maps.MapTypeId.HYBRID
        }

        GMaps.draw(mapOptions);
    },

    draw : function(mapOptions){
        GMaps._map = new google.maps.Map(GMaps._el, mapOptions);

        GMaps._marker = new google.maps.Marker({
            map: GMaps._map,
            draggable: true,
            animation: google.maps.Animation.DROP,
            title: "You are here",
            position: GMaps._position
        });

        google.maps.event.addListener(GMaps._marker, 'dragend', function(){
            GMaps.geocodePosition(GMaps._marker.getPosition());
        });
    },

    setKmlLayer : function(){
        var ctaLayer = new google.maps.KmlLayer(
            GMaps._kml,
            {   
                preserveViewport: true,
                suppressInfoWindows: false
            }
        );

        ctaLayer.setMap(GMaps._map);
    },

    setWeatherLayer : function(){
        var weatherLayer = new google.maps.weather.WeatherLayer({
          temperatureUnits: google.maps.weather.TemperatureUnit.CELSIUS
        });

        weatherLayer.setMap(GMaps._map);
    },

    setTransitLayer : function(){
        var transitLayer = new google.maps.TransitLayer();
        transitLayer.setMap(GMaps._map);
    },

    geocodePosition : function(markerPos){
        geocoder = new google.maps.Geocoder();
        geocoder.geocode(
            {
                latLng: markerPos
            }, 
            function(results, status){
                if (status == google.maps.GeocoderStatus.OK){
                    console.log("Results : ", results);
                    console.log("Adresse : ", results[0].formatted_address);
                    console.log("Latitude : ", results[0].geometry.location.jb);
                    console.log("Longitude : ", results[0].geometry.location.kb);
                    //$("#mapSearchInput").val(results[0].formatted_address);
                    //$("#mapErrorMsg").hide(100);
                } else {
                    console.log("Cannot determine address at this location "+status);
                    //$("#mapErrorMsg").html('Cannot determine address at this location.'+status).show(100);
                }
            }
        );
    }
}*/

window.GMaps = {
	_position : "",
	_lat : "48.85806239999999",
	_lng : "2.295147199999974",
	_kml : "https://maps.google.fr/maps/ms?ie=UTF8&t=h&oe=UTF8&authuser=0&msa=0&output=kml&msid=212676093823261248407.000465792f3231179dcb6",
	_marker : "",
	_map : "",
	_geocoder : "",
	_api_key : "",
	_el : document.getElementById("gmaps"),
	_elJq : $("#gmaps"),

	init : function(el) {
		if(typeof el != 'undefined'){
            GMaps._el =  document.getElementById(el);
            GMaps._elJq =  $("#"+el);
        }

		if(typeof google === 'undefined'){
			var script = document.createElement("script");
			script.type = "text/javascript";
			//script.src = "https://maps.googleapis.com/maps/api/js?key="+GMaps._api_key+"&sensor=false&callback=GMaps.load";
			script.src = 'https://maps.googleapis.com/maps/api/js?v=3.exp&sensor=false&libraries=weather&callback=GMaps.getUserLocation';
			document.body.appendChild(script);
		} else {
			GMaps.load();
		}
	},
	
	getUserLocation : function() {
		if(navigator.geolocation) {
			navigator.geolocation.getCurrentPosition(
				GMaps.load,
				GMaps.load,
				{ enableHighAccuracy: true, timeout: 10000, maximumAge: Infinity }
			);
		} else {
			GMaps.load()
		}
	},

	load : function(position) {
		var zoom = 7;
		if(typeof position != 'undefined'){
            GMaps._position = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
            zoom = 14;
            console.log("Geolocation enabled : ", position);
        } else {
			GMaps._position = new google.maps.LatLng(GMaps._lat, GMaps._lng);
			console.log("Geolocation disabled");
		}

		var mapOptions = {
			zoom: zoom,
			center: GMaps._position,
			disableDefaultUI: true,
			mapTypeControl: true,
			mapTypeId: google.maps.MapTypeId.HYBRID
		}
		
		GMaps.drawMap(mapOptions);
	},

	drawMap : function(mapOptions){
	    GMaps._map = new google.maps.Map(GMaps._el, mapOptions);

	    GMaps._marker = new google.maps.Marker({
	        map: GMaps._map,
	        draggable: true,
	        animation: google.maps.Animation.DROP,
	        title: "Drag me",
	        position: GMaps._position
	    });

	    google.maps.event.addListener(GMaps._marker, 'dragend', function(){
	        GMaps.geocodePosition(GMaps._marker.getPosition());
	    });

	    GMaps._geocoder = new google.maps.Geocoder();
	},

	centerMap : function(position){
		GMaps._map.setCenter(position);
	},

	setKmlLayer : function(){
	    var ctaLayer = new google.maps.KmlLayer(
	        GMaps._kml,
	        {   
	            preserveViewport: true,
	            suppressInfoWindows: false
	        }
	    );

	    ctaLayer.setMap(GMaps._map);
	},

	setWeatherLayer : function(){
	    var weatherLayer = new google.maps.weather.WeatherLayer({
    		temperatureUnits: google.maps.weather.TemperatureUnit.CELSIUS
  		});

	    weatherLayer.setMap(GMaps._map);
	},

	setTransitLayer : function(){
	    var transitLayer = new google.maps.TransitLayer();
	    transitLayer.setMap(GMaps._map);
	},

	setBikeLayer : function(){
	    var bikeLayer = new google.maps.BicyclingLayer();
  		bikeLayer.setMap(GMaps._map);
	},

	setTrafficLayer : function(){
	    var trafficLayer = new google.maps.TrafficLayer();
  		trafficLayer.setMap(GMaps._map);
	},

	setCloudLayer : function(){
	    var cloudLayer = new google.maps.weather.CloudLayer();
  		cloudLayer.setMap(GMaps._map);
	},

	geocodePosition : function(markerPos){

	    GMaps._geocoder.geocode(
	        {
	            latLng: markerPos
	        }, 
	        function(results, status){
	            if (status == google.maps.GeocoderStatus.OK){

	            	/*$("#modalDiv .addressInput").val(results[0].formatted_address);
					$("#modalDiv .latitudeInput").val(results[0].geometry.location.lat());
					$("#modalDiv .longitudeInput").val(results[0].geometry.location.lng());*/

	                console.log("Results : ", results);
	                console.log("Adresse : ", results[0].formatted_address);
	                console.log("Latitude : ", results[0].geometry.location.lat());
	                console.log("Longitude : ", results[0].geometry.location.lng());

	            } else {
	                console.error("Cannot determine address at this location "+status);
	            }
	        }
	    );
	},

	changeZoom : function(zoomValue){
		/*console.log("Zoom : ", GMaps._map.getZoom());

		if(GMaps._map.getZoom() > zoomValue){
			for (var i = GMaps._map.getZoom(); i >= zoomValue; i--) {
				window.setTimeout( 
					( function(zoom){ 
						return function(){ 
							GMaps._map.setZoom(zoom);
							console.log(zoom);
						}; 
					} )( i ),
					5000
				);
			}
		} else if(GMaps._map.getZoom() < zoomValue){
			for (var i = GMaps._map.getZoom(); i <= zoomValue; i++) {
				window.setTimeout( 
					( function(zoom){ 
						return function(){ 
							GMaps._map.setZoom(zoom);
							console.log(zoom);
						}; 
					} )( i ),
					5000
				);
			}
		}
		console.log("Zoom : ", GMaps._map.getZoom());*/

		GMaps._map.setZoom(zoomValue);
	},

	geocodeAddress : function(address) {

		/* Appel au service de geocodage avec l'adresse en paramètre */
		GMaps._geocoder.geocode( { 'address': address}, function(results, status) {
			/* Si l'adresse a pu être géolocalisée */
			if (status == google.maps.GeocoderStatus.OK) {
				/* Récupération de sa latitude et de sa longitude */

				console.log("Result : ", results);
				console.log("Latitude : ", results[0].geometry.location.lat());
	            console.log("Longitude : ", results[0].geometry.location.lng());

				/*$("#modalDiv .addressInput").val(results[0].formatted_address);
				$("#modalDiv .latitudeInput").val(results[0].geometry.location.lat());
				$("#modalDiv .longitudeInput").val(results[0].geometry.location.lng());*/

				GMaps.centerMap(results[0].geometry.location);

				GMaps.changeZoom(14);

				GMaps._marker.setMap(null);

				/* Affichage du marker */
				GMaps._marker = new google.maps.Marker({
					map: GMaps._map,
					draggable: true,
	       			animation: google.maps.Animation.DROP,
					position: results[0].geometry.location
				});

				google.maps.event.addListener(GMaps._marker, 'dragend', function(){
			        GMaps.geocodePosition(GMaps._marker.getPosition());
			    });

			} else {
				console.error("Cannot find this address "+status);
			}

		});
	},

	resizeInModal : function(){
		GMaps._elJq.height( ( $(window).height() - ( $('#modalDiv').outerHeight() - $('#modalDiv .modal-body').height() ) ) );
		if( GMaps._elJq.height() >= $('#modalDiv .modal-body').height() ){
			GMaps._elJq.height( ( $('#modalDiv .modal-body').height() - $('.form-geo').outerHeight() ) - 65 );
		}
		GMaps._elJq.width( $('#modalDiv .modal-body').width() );
	}
}

$(function() {

	window.Client = Backbone.Model.extend({
		defaults : {
			id : null,
			nom : null,
			remarque : null
		},
		initialize : function() {
			console.log("initialize client");
		}
	});

	window.ClientsCollection = Backbone.Collection.extend({
		model : Client,
		initialize : function() {
			console.log("initialize clients collection");
			this.bind("add", function(model){ console.log("Add", model.get('id'), model); });
			this.bind("remove", function(model){ console.log("Remove", model.get('model'), el); });
		}
	});

	window.ClientView = Backbone.View.extend({
		el : $("#divClient"), /* Utilisation de zepto pour lier ClientView au DOM */
		initialize : function() {
			var that = this;
			/*
				- Création d'une collection de clients à l'initialisation de la vue.
				- On passe la vue en référence à la collection pour créer une connexion entre les 2
			*/
			this.listeClients = new ClientsCollection();

			this.listeClients.bind("add", function(model){
				that.addClientToList(model);
			});
		},
		/*---  Définition des évènements associés à la vue ---*/
		events : {
			/*
				lorsque le onclick() de <button id="cmdAddClient">Ajouter Client</button>
				est déclenché alors appeler cmdAddClient_Click()
			*/
			'click #cmdAddClient' : 'cmdAddClient_Click'
		},

		cmdAddClient_Click : function(){
			/* Création d'un nouveau modèle Client à partir des données saisies */
			var tmpClient = new Client({
				id : $("#txtIdClient").val(),
				nom : $("#txtNomClient").val(),
				remarque : $("#txtRemarqueClient").val()
				/* utilisation de zepto pour récupérer les valeurs des différentes zones de saisie  */
			});

			/* ajout du nouveau client à la collection */
			this.listeClients.add(tmpClient);
		},
		/*---  addClientToList est appelée à chaque nouveau client inséré ---*/
		addClientToList : function(model) {
			/* utilisation de zepto pour ajouter un élément à la liste */
			$("#listeClient").append("<li>" + model.get('id') + " : " + model.get('nom') + "</li>");
		}
	});

	window.Workspace = Backbone.Router.extend({
		initialize : function() {
			/* Instancier la vue client */
			this.clientView = new ClientView();
			/* cacher le message "à propos" */
			$("#divAbout").hide();
		},
		/*--- Définition des routes

			- si l'on appelle l'url http:/mon.domaine.a.moi/index.html cela déclenche la méthode root
			- si l'on appelle l'url http:/mon.domaine.a.moi/index.html#showAbout cela déclenche la méthode showAbout
			- si l'on appelle l'url http:/mon.domaine.a.moi/index.html#hideAbout cela déclenche la méthode hideAbout
		*/
		routes: {
			"" : "root",
			"showAbout" : "showAbout",
			"hideAbout" : "hideAbout",
			"login" : "login",
			"gmaps" : "gmaps"
		},

		root : function() {
			document.title = "Vous êtes à la racine ...";
			$("#login").hide();
		},

		showAbout : function () {
			console.log("show about ...");
			$("#divAbout").show();
			$("#lnkAbout").attr("href","#hideAbout");
		},

		hideAbout : function () {
			console.log("hide about ...");
			$("#divAbout").hide();
			$("#lnkAbout").attr("href","#showAbout");
		},

		login : function () {
			console.log("Action : login");
			$("#divAbout").hide();
			$("#divClient").hide();
			$("#lnkAbout").hide();
			$("#login").fadeIn();

		},

		gmaps : function () {
			console.log("Action : gmaps");
			$("#divAbout").hide();
			$("#divClient").hide();
			$("#lnkAbout").hide();
			$("#login").hide();
			GMaps.init();

		}

	});

	$(function() {
		/*--- initialisation du router ---*/
		window.router = new Workspace();

		/*---
			activation du monitoring des "hashchange events"
			et dispatch des routes
		---*/
		Backbone.history.start();
	});

});
