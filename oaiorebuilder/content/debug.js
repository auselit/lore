/*
 * Copyright (C) 2008 - 2009 School of Information Technology and Electrical
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

var EXPORTED_SYMBOLS = ['debug'];

Components.utils.import("resource://lore/constants.js");

/**
 * @namespace
 * @name lore.debug 
 */
debug = {
	FB_UI: '[UI] ',
	FB_ANNO: '[ANNO] ',
	FB_ORE: '[ORE] ',
	FB_TM: '[TM] ',
	UI: 'LORE-UI ',
	ANNO: 'LORE-ANNO ',
	ORE: 'LORE-ORE ',
	TM: 'LORE-TM ',
	
    /** @lends lore.debug */

	
	/**
	 * Log message to the built-in mozilla console service
	 * can attach listeners which peform further formatting
	 * also will go to the default Error Console provided in
	 * Firefox
	 * @param {String} module Code module which this message applies to
	 * @param {String} message The logging message
	 * @param {Object} obj An object to attach
	 */
	mozConsole: function (module, message, obj) {
		if (debug.moz) {
			// TODO: Send a more details message object via other console logging function
			debug.moz.console.logStringMessage(module + message + (obj ? (" " + obj):''));
			if ( obj instanceof Error)
				Components.utils.reportError(obj);
		}
	},
	/**
	 * Log debug message for UI components
	 * @param {} message
	 * @param {} obj
	 */
	ui : function (message, obj){
	    if (debug.ui_pref){
	        debug.FBTrace.sysout(debug.FB_UI + message, obj);
	    } 
		debug.mozConsole(debug.UI, message, obj);
	},
	/**
	 * Log debug message for Annotations components
	 * @param {} message
	 * @param {} obj
	 */
	anno : function (message, obj){
	    if (debug.anno_pref){
	        debug.FBTrace.sysout(debug.FB_ANNO + message, obj);
	    } 
		debug.mozConsole(debug.ANNO, message, obj);
	},
	/**
	 * Lore debug message for ORE components
	 * @param {} message
	 * @param {} obj
	 */
	ore : function (message, obj){
	    if (debug.ore_pref){
	        debug.FBTrace.sysout(debug.FB_ORE + message, obj);
	    } 
		debug.mozConsole(debug.ORE, message, obj);
	},
	/** Log debug message for Text mining components
	 * 
	 * @param {} message
	 * @param {} obj
	 */
	tm : function (message, obj){
	    if (debug.tm_pref){
	        debug.FBTrace.sysout(debugFB_TM + message, obj);
	    } 
		debug.mozConsole(debug.TM, message, obj);
    },
	
	enableFileLogger: function (enable) {
		if ( enable && !debug.moz ) {
			debug.moz = new MozillaFileLogger();
		} else if( !enable && debug.moz) {
			debug.moz.destruct();
			debug.moz = null;
		}
				
	},
    // debugging options
    /** Preference for UI messages  */
    ui_pref   : false,
    /** Preference for Annotation messages */
    anno_pref : false,
    /** Preference for ORE/Compound Object messages */
    ore_pref  : false,
    /** Preference for Text mining messages */
    tm_pref   : false
};

function MozillaFileLogger(){
	this.console = Components.classes["@mozilla.org/consoleservice;1"].getService(Components.interfaces.nsIConsoleService)
	
	var e = Components.classes["@mozilla.org/extensions/manager;1"]
		.getService(Components.interfaces.nsIExtensionManager)
		.getInstallLocation(constants.EXTENSION_ID)
		.getItemLocation(constants.EXTENSION_ID);
		
	var file = Components.classes["@mozilla.org/file/local;1"].createInstance(Components.interfaces.nsILocalFile);
	file.initWithPath(e.path);
	file.append("content");
	file.append("lore.log");
	
	if (!file.exists()) {
		file.create(Components.interfaces.nsIFile.NORMAL_FILE_TYPE, 420);
	}
	
	var stream = Components.classes["@mozilla.org/network/file-output-stream;1"].createInstance(Components.interfaces.nsIFileOutputStream);
	stream.init(file, 0x02 | 0x08 | 0x20, 0666, 0);
	this.fstream = stream;
	
	this.exitObserver = {
		  observe: function(subject, topic, data) {
     			this.parent.destruct();
		  },
		  register: function(parent) {
		  	this.parent = parent;
		    var observerService = Components.classes["@mozilla.org/observer-service;1"]
		                          .getService(Components.interfaces.nsIObserverService);
		    observerService.addObserver(this, "quit-application", false);
		  },
		  unregister: function() {
		    var observerService = Components.classes["@mozilla.org/observer-service;1"]
		                            .getService(Components.interfaces.nsIObserverService);
		    observerService.removeObserver(this, "quit-application");
		  }
    }

	this.exitObserver.register(this);
			
	this.listener = {
	
		observe: function(aMessage){
			
			var content = aMessage.message;
						
			//dump("Log : " + aMessage.message);
			if (content && (content.indexOf(debug.UI) == 0 ||
			content.indexOf(debug.ANNO) == 0 ||
			content.indexOf(debug.ORE) == 0 ||
			content.indexOf(debug.TM) == 0)) {
				content = new Date().toString() +":  " + content + "\r\n";
				stream.write(content, content.length);
			}
		},
		
		QueryInterface: function(iid){
			if (!iid.equals(Components.interfaces.nsIConsoleListener) &&
			!iid.equals(Components.interfaces.nsISupports)) {
				throw Components.results.NS_ERROR_NO_INTERFACE;
			}
			return this;
		}
	};
	this.console.registerListener(this.listener);
}

MozillaFileLogger.prototype.destruct = function() {
	this.console.unregisterListener(this.listener);
	this.fstream.close();
	this.exitObserver.unregister();
}



//Use Firebug trace console for debug logs - edit the extension preferences to enable (about:config)
try {
    /** Firebug Tracer 
     * @name lore.FBTrace */
    debug.FBTrace = Components.classes["@joehewitt.com/firebug-trace-service;1"]
        .getService(Components.interfaces.nsISupports)
        .wrappedJSObject
        .getTracer("extensions.lore");
        
    debug.ui_pref   = debug.FBTrace.DBG_LORE_UI;
    debug.anno_pref = debug.FBTrace.DBG_LORE_ANNOTATIONS;
    debug.ore_pref  = debug.FBTrace.DBG_LORE_COMPOUND_OBJECTS;
    debug.tm_pref   = debug.FBTrace.DBG_LORE_TEXT_MINING;
	
} catch (ex) {
    // suppress errors if getting FBTrace fails - Firebug probably not enabled
}
