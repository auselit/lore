// debugging options
lore.debug.ui_pref = false;
lore.debug.anno_pref = false;
lore.debug.ore_pref = false;
lore.debug.tm_pref = false;

//Use Firebug trace console for debug logs - edit the extension preferences to enable (about:config)
try {
	lore.debug.FBTrace = Components.classes["@joehewitt.com/firebug-trace-service;1"]
		.getService(Components.interfaces.nsISupports)
		.wrappedJSObject
		.getTracer("extensions.lore");
			
	lore.debug.ui_pref = lore.debug.FBTrace.DBG_LORE_UI;
	lore.debug.anno_pref = lore.debug.FBTrace.DBG_LORE_ANNOTATIONS;
	lore.debug.ore_pref = lore.debug.FBTrace.DBG_LORE_COMPOUND_OBJECTS;
	lore.debug.tm_pref = lore.debug.FBTrace.DBG_LORE_TEXT_MINING;
		
		
} catch (ex) {
		// suppress errors if FBTrace fails - Firebug probably not enabled
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