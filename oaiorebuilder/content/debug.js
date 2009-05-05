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
 
// debugging options
lore.debug.ui_pref   = false;
lore.debug.anno_pref = false;
lore.debug.ore_pref  = false;
lore.debug.tm_pref   = false;

//Use Firebug trace console for debug logs - edit the extension preferences to enable (about:config)
try {
    lore.debug.FBTrace = Components.classes["@joehewitt.com/firebug-trace-service;1"]
        .getService(Components.interfaces.nsISupports)
        .wrappedJSObject
        .getTracer("extensions.lore");
            
    lore.debug.ui_pref   = lore.debug.FBTrace.DBG_LORE_UI;
    lore.debug.anno_pref = lore.debug.FBTrace.DBG_LORE_ANNOTATIONS;
    lore.debug.ore_pref  = lore.debug.FBTrace.DBG_LORE_COMPOUND_OBJECTS;
    lore.debug.tm_pref   = lore.debug.FBTrace.DBG_LORE_TEXT_MINING;
        
        
} catch (ex) {
    // suppress errors if getting FBTrace fails - Firebug probably not enabled
}

lore.debug.ui = function (message, obj){
    if (lore.debug.ui_pref){
        lore.debug.FBTrace.sysout("[UI] " + message, obj);
    } 
}
lore.debug.anno = function (message, obj){
    if (lore.debug.anno_pref){
        lore.debug.FBTrace.sysout("[ANNO] " + message, obj);
    } 
}
lore.debug.ore = function (message, obj){
    if (lore.debug.ore_pref){
        lore.debug.FBTrace.sysout("[ORE] " + message, obj);
    } 
}
lore.debug.tm = function (message, obj){
    if (lore.debug.tm_pref){
        lore.debug.FBTrace.sysout("[TM] " + message, obj);
    } 
}