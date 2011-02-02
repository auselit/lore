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


Ext.ns('lore.anno');

lore.anno.AuthManager = Ext.extend(Ext.util.Observable, {
    ANNOTATOR_AUTHORITY: 'ROLE_ANNOTATOR',

    constructor: function(config) {
        this.addEvents(
			/**
			 * @event signedin
			 * Fires when the user has successfully signed into the annotation
			 * server.
			 */
			'signedin',
            /**
			 * @event signedin
			 * Fires when the user has signed out from the annotation server.
			 */
			'signedout');
        this.prefs = config.prefs;

        // Find Emmet URLs
        this.prefs.on('prefs_changed', this.reloadEmmetUrls, this);
    },

    reloadEmmetUrls: function() {
        var emmetUrl = this.prefs.url.replace('annotea', 'emmet.svc');

        if (this.EMMET_URL == emmetUrl) {
            return;
        } else {
            this.EMMET_URL = emmetUrl;
        }

        Ext.Ajax.request({
            url: this.EMMET_URL,
            success: this.parseEmmetUrlsResponse,
            method: 'GET',
            params: {action: 'fetchEmmetUrls',
                     format: 'json'},
            scope: this

        });
    },

    parseEmmetUrlsResponse: function(response) {
        var jsObject = Ext.decode(response.responseText);
        var emmetUrls = jsObject.emmetUrls;
        this.LOGOUT_URL = emmetUrls['emmet.logout.url'];
        this.LOGIN_URL = emmetUrls['emmet.login.url'];
        this.REGISTER_URL = emmetUrls['emmet.register.url'];

        this.isAuthenticated();
    },


    /**
     * Run the supplied callback function if the user is currently authorised
     * as an annotator.
     */
    isAuthenticated : function(callback) {
        Ext.Ajax.request({
           url: this.EMMET_URL,
           success: this.checkAuthentication,
           failure: this.fireEvent.createDelegate(this,['signedout']),
           method: 'GET',
           params: { action: 'fetchAuthentication',
                     format: 'json' },
           callIfAuthorised: callback,
           scope: this
        });
    },

    /**
     * Run the supplied callback function if the user is *not* currently authorised
     * as an annotator.
     */
    ifNotAuthenticated : function(callback) {
        Ext.Ajax.request({
           url: this.EMMET_URL,
           success: this.checkAuthentication,
           failure: this.fireEvent.createDelegate(this,['signedout']),
           method: 'GET',
           params: { action: 'fetchAuthentication',
                     format: 'json' },
           callIfNotAuthorised: callback,
           scope: this
        });
    },

    // private
    checkAuthentication : function(xhr, options) {
        var jsObject = Ext.decode(xhr.responseText);
        var authorities = jsObject.userAuthentication.principal.authorities;
        var authorised = this.hasAuthority(authorities, this.ANNOTATOR_AUTHORITY);

        if (authorised) {
            this.fireEvent('signedin');
            if (typeof options.callIfAuthorised == 'function') {
                options.callIfAuthorised();
            }
        } else {
            this.fireEvent('signedout');
            if (typeof options.callIfNotAuthorised == 'function') {
                options.callIfNotAuthorised();
            }
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
        this.isAuthenticated(function() {
            if (typeof callback == 'function') {
                callback();
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
        var winOpts = 'height=250,width=470,top=200,left=250,resizable,scrollbars=yes,dependent=yes';
        var loginwindow = window.openDialog("chrome://lore/content/loginWindow.xul", 'lore_login_window', winOpts,
                                            {initURL: this.LOGIN_URL,
                                             logger: lore.debug.anno});

        var t = this;
        loginwindow.addEventListener("close", function() {
                t.isAuthenticated(callback);
        }, false);
        loginwindow.addEventListener('DOMWindowClose', function() {
                t.isAuthenticated(callback);
        }, false);
    }
});
