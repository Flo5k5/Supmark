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
            "login" : "login"
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
