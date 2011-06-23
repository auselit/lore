/*
 * Copyright (C) 2008 - 2010 School of Information Technology and Electrical
 * Engineering, University of Queensland (www.itee.uq.edu.au).
 *
 * This file is part of LORE. LORE was developed as part of the Aus-e-Lit
 * project.
 *
 * LORE is free software: you can redistribute it and/or modify it under the
 * terms of the GNU General Public License as published by the Free Software
 * Foundation, either version 3 of the License, or (at your option) any later
 * version.
 *
 * LORE is distributed in the hope that it will be useful, but WITHOUT ANY
 * WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR
 * A PARTICULAR PURPOSE. See the GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License along with
 * LORE. If not, see <http://www.gnu.org/licenses/>.
 */


Ext.ns('lore');

lore.AuthManager = Ext.extend(Ext.util.Observable, {
    // TODO: check authorities independently: for now we do not support accounts without both roles
    ANNO_AUTHORITY: "ROLE_ANNOTATOR",
    ORE_AUTHORITY: "ROLE_ORE",
    constructor: function() {
        this.addEvents(
			/**
			 * @event signedin
			 * Fires when the user has successfully signed into the server
			 */
			'signedin',
            /**
			 * @event signedin
			 * Fires when the user has signed out from the server.
			 */
			'signedout',
            /**
             * @event cancel
             * Fires when user cancels logging in
             */
            'cancel',
            /**
             * @event error
             * Fires when authorisation cannot be established due to error
             */
            'error');
        // Tracks signed in state, to prevent superfluous event firing
        this.signedIn = false; 
    },
    /**
     * Load login, logout and registration urls from Emmet service
     * @param {} prefs Preferences (must contain a url property)
     * @param {} callback Function to call after urls have been loaded
     */
    reloadEmmetUrls: function(prefs, callback) {
        this.prefs = prefs;
        var emmetUrl = prefs.url + '/emmet.svc';
        lore.debug.ui("reloadEmmetUrls " + emmetUrl);
        // check whether login url is defined (if not, network may not have been enabled on load)
        if (this.EMMET_URL == emmetUrl && this.LOGIN_URL) {
            return;
        } else {
            this.EMMET_URL = emmetUrl;
        }

        Ext.Ajax.request({
            url: this.EMMET_URL,
            success: function(response){
                this.parseEmmetUrlsResponse(response, callback)
            },
            method: 'GET',
            params: {action: 'fetchEmmetUrls',
                     format: 'json'},
            scope: this

        });
    },
    /**
     * Get login, logout and registration urls from response
     * @param {} response
     * @param {} callback
     */
    parseEmmetUrlsResponse: function(response, callback) {
        var jsObject = Ext.decode(response.responseText);
        var emmetUrls = jsObject.emmetUrls;
        this.LOGOUT_URL = emmetUrls['emmet.logout.url'];
        this.LOGIN_URL = emmetUrls['emmet.login.url'];
        this.REGISTER_URL = emmetUrls['emmet.register.url'];

        this.isAuthenticated();
        if (this.LOGIN_URL){
            if (callback && typeof callback == 'function'){
                callback();
            }    
        } else {
            lore.debug.ui("Unable to get Emmet URLs",[this,response]);
        }
        
    },


    /**
     * Run the supplied callback function if the user is currently authorised
     */
    isAuthenticated : function(callback) {
        //lore.debug.ui("isAuthenticated",this);
        if (this.EMMET_URL){
	        Ext.Ajax.request({
	           url: this.EMMET_URL,
	           success: this.checkAuthentication,
	           failure: this.fireError.createDelegate(this),
	           method: 'GET',
	           params: { action: 'fetchAuthentication',
	                     format: 'json' },
	           callIfAuthorised: callback,
	           scope: this
	        });
        } else {
            lore.debug.ui("isAuthenticated: No emmet url defined!",this);
        }
    },

    /**
     * Run the supplied callback function if the user is *not* currently authorised
     */
    ifNotAuthenticated : function(callback) {
        //lore.debug.ui("ifNotAuthenticated",this);
        if (this.EMMET_URL){
	        Ext.Ajax.request({
	           url: this.EMMET_URL,
	           success: this.checkAuthentication,
	           failure: this.fireError.createDelegate(this),
	           method: 'GET',
	           params: { action: 'fetchAuthentication',
	                     format: 'json' },
	           callIfNotAuthorised: callback,
	           scope: this
	        });
        } else {
             lore.debug.ui("ifNotAuthenticated: No emmet url defined!",this);
        }
    },

    // private
    checkAuthentication : function(xhr, options) {
    	try {
            var principal = Ext.decode(xhr.responseText).userAuthentication.principal;
            lore.debug.ui("checkAuthentication: ", principal);
            var authorities = principal.authorities;
            var authorised = this.hasAuthority(authorities, this.ANNO_AUTHORITY) &&
                this.hasAuthority(authorities, this.ORE_AUTHORITY);

            if (authorised) {
            	this.fireSignedIn(principal.userName);
                if (typeof options.callIfAuthorised == 'function') {
                    options.callIfAuthorised(principal);
                }
                return;
            }
    	} catch (e) {
    		lore.debug.ui("AuthManager:checkAuthentication failed", e);
    	}
        lore.debug.ui("User is not authorised");
        this.fireSignedOut();
        if (typeof options.callIfNotAuthorised == 'function') {
            options.callIfNotAuthorised();
        }
    },

    // private
    hasAuthority : function(authorities, requiredAuthority) {
        if (authorities) {
            for (var i = 0; i < authorities.length; i++) {
                if (authorities[i].authority == requiredAuthority) {
                    return true;
                }
            }
        }
        return false;
    },

    /**
     * Checks whether the user is currently authorised,
     * if so, runs the callback function, if not
     * displays a loginwindow, and if successful runs the function.
     * If not, the function is not run.
     */
    runWithAuthorisation : function(callback) {
        var t = this;
        this.isAuthenticated(function(principal) {
            if (typeof callback == 'function') {
                callback(principal);
            }
        });
        this.ifNotAuthenticated(function() {
            t.popupLoginWindow(callback);
        });
    },

    /**
     * If the user is not already authorised, open a login dialog for them to do so
     */
    displayLoginWindow : function() {
        var t = this;
        this.ifNotAuthenticated(function () {
            t.popupLoginWindow();
        });
    },

    //private
    popupLoginWindow : function(callback) {
        var oThis = this;
        var doPopup = function(){
            var winOpts = 'height=250,width=470,top=200,left=250,resizable,scrollbars=yes,dependent=yes';
            var loginwindow = window.openDialog("chrome://lore/content/loginWindow.xul", 'lore_login_window', winOpts,
                                                {initURL: oThis.LOGIN_URL,
                                                 logger: lore.debug.ui});
    
            loginwindow.addEventListener("close", function() {
                    oThis.fireEvent("cancel");
                    oThis.isAuthenticated(callback);
            }, false);
            loginwindow.addEventListener('DOMWindowClose', function() {
                    oThis.fireEvent("cancel");
                    oThis.isAuthenticated(callback);
            }, false);
        }
        
        try{
            if (!this.LOGIN_URL){
                // Network might not have been available when LORE was loaded: try reloading emmet urls
                this.reloadEmmetUrls(this.prefs,doPopup);
            } else {
                doPopup();
            }
            
        } catch (ex){
            lore.debug.ui("Error in popupLoginWindow",ex);
        }
    },
    
    logout : function() {
        var oThis = this;
        var doLogout = function(){
            Ext.Ajax.request({
                url: oThis.LOGOUT_URL,
                success: oThis.isAuthenticated,
                method: 'GET',
                scope: oThis
             });
        }
        if (!this.LOGOUT_URL){
            this.reloadEmmetUrls(this.prefs, doLogout);
        } else {
            doLogout();
        }
    },
    
    fireSignedIn : function(userName) {
    	if (!this.signedIn) {
    		this.signedIn = true;
    		this.fireEvent('signedin', userName);
    	}
    },
    
    fireSignedOut : function() {
    	if (this.signedIn) {
    		this.signedIn = false;
            this.fireEvent('signedout');
    	}  
    },
    fireError : function(){
        this.fireSignedOut();
        this.fireEvent('error');
    }

});
