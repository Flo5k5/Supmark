    var marker;

        /*$(function() {
            $( document ).ready(function() {
                $("#mark-container").fadeOut().queue(function() {
                    $("#mark-container").html('');
                    loadGMaps();
                    $(this).dequeue();
                }).fadeIn();
            });
            
        });*/

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
            console.log(position);
            var lat = position.coords.latitude;
            var lng = position.coords.longitude;
            var pos = new google.maps.LatLng(lat, lng);
            console.log(lat);
            console.log(lng);
            var mapOptions = {
                zoom: 7,
                center: pos,
                disableDefaultUI: true,
                mapTypeControl: true,
                mapTypeId: google.maps.MapTypeId.HYBRID
            }
            var map = new google.maps.Map(document.getElementById("gmaps"), mapOptions);

            marker = new google.maps.Marker({
                map:map,
                draggable: true,
                animation: google.maps.Animation.DROP,
                title: "You are here",
                position: pos
            });

            setLayersMaps(map);
            google.maps.event.addListener(marker, 'dragend', function(){
                geocodePosition(marker.getPosition());
            });
        }

        function mapsCallbackError(error) {
            console.log('There was an error with GMaps : ');
            console.log(error);

            var pos = new google.maps.LatLng(25.165173,-23.90625);

            var mapOptions = {
                zoom: 2,
                center: new google.maps.LatLng(25.165173,-23.90625),
                disableDefaultUI: true,
                mapTypeControl: true,
                mapTypeId: google.maps.MapTypeId.HYBRID
            }
            var map = new google.maps.Map(document.getElementById("gmaps"), mapOptions);

            marker = new google.maps.Marker({
                map:map,
                draggable: true,
                animation: google.maps.Animation.DROP,
                title: "Positioning error",
                position: pos
            });

            setLayersMaps(map);

            google.maps.event.addListener(marker, 'dragend', function(){
                geocodePosition(marker.getPosition());
            });
        }

        function setLayersMaps(map){
            var ctaLayer = new google.maps.KmlLayer(
                'https://maps.google.fr/maps/ms?ie=UTF8&t=h&oe=UTF8&authuser=0&msa=0&output=kml&msid=212676093823261248407.000465792f3231179dcb6',
                {   
                    preserveViewport: true,
                    suppressInfoWindows: false
                }
            );
            //ctaLayer.setMap(map);
            var weatherLayer = new google.maps.weather.WeatherLayer({
              temperatureUnits: google.maps.weather.TemperatureUnit.CELSIUS
            });
            //weatherLayer.setMap(map);
            var transitLayer = new google.maps.TransitLayer();
            //transitLayer.setMap(map);
            //map.setCenter(position);
        }



        function geocodePosition(pos) 
        {
           geocoder = new google.maps.Geocoder();
           geocoder.geocode
            ({
                latLng: pos
            }, 
                function(results, status) 
                {
                    if (status == google.maps.GeocoderStatus.OK) 
                    {
                        console.log("Results : ", results);
                        console.log("Adresse : ", results[0].formatted_address);
                        console.log("Latitude : ", results[0].geometry.location.jb);
                        console.log("Longitude : ", results[0].geometry.location.kb);
                        //$("#mapSearchInput").val(results[0].formatted_address);
                        //$("#mapErrorMsg").hide(100);
                    } 
                    else 
                    {
                        console.log("Cannot determine address at this location "+status);
                        //$("#mapErrorMsg").html('Cannot determine address at this location.'+status).show(100);
                    }
                }
            );
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
            loadGMaps();

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
