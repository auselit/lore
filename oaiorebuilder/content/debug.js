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

debug = {};

// debugging options
debug.ui_pref   = false;
debug.anno_pref = false;
debug.ore_pref  = false;
debug.tm_pref   = false;

//Use Firebug trace console for debug logs - edit the extension preferences to enable (about:config)
try {
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

debug.ui = function (message, obj){
    if (debug.ui_pref){
        debug.FBTrace.sysout("[UI] " + message, obj);
    } 
}
debug.anno = function (message, obj){
    if (debug.anno_pref){
        debug.FBTrace.sysout("[ANNO] " + message, obj);
    } 
}
debug.ore = function (message, obj){
    if (debug.ore_pref){
        debug.FBTrace.sysout("[ORE] " + message, obj);
    } 
}
debug.tm = function (message, obj){
    if (debug.tm_pref){
        debug.FBTrace.sysout("[TM] " + message, obj);
    } 
}