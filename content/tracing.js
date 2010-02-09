if (typeof(FBL) != "undefined"){
FBL.ns(function() { with (FBL) { 
/**
 * Functions used for debug to Firebug tracing console
 * @class Firebug.LoreTracingModel
 * @extends Firebug.Module
 */
Firebug.LoreTracingModel = extend(Firebug.Module, 
{ 
    /**
     * Open new FB Tracing Console window
     */
    initialize: function() 
    {
    	// Add listener for log customization
        Firebug.TraceModule.addListener(this);
        Firebug.TraceModule.openConsole("extensions.lore");
    },
    /**
     * Shutdown tracing console
     */
    shutdown: function() 
    {
        Firebug.TraceModule.removeListener(this);
    },

    initContext: function(context)
    {
  
    },
    /** 
     * Called when console window is loaded to add custom message stylesheet
     * @param {} win
     * @param {} rootNode
     */
    onLoadConsole: function(win, rootNode)
    {
        var doc = rootNode.ownerDocument;
        if ($("loreTracingStyles", doc))
            return;
        var styleSheet = createStyleSheet(doc, "chrome://lore/skin/tracing.css");
        styleSheet.setAttribute("id", "loreTracingStyles");
	    addStyleSheet(doc, styleSheet);
    },
    /**
     * Called when a new message is logged in to the trace-console window to color-code log entries
     * @param {} message
     */
    onDump: function(message)
    {
    	// Last item NOTYPE is the default fallback
    	var msgtypes = ["UI","ANNO", "ORE", "TM", "NOTYPE"]; 
		var i = -1;
		var j = 0;
		var msgtype;
		while (i != 0 && j < msgtypes.length){
			msgtype = msgtypes[j++];
			i = message.text.indexOf("[" + msgtype + "] ");
		}
        if (i == 0) // message matched one of the types - strip the prefix
        {
            message.text = message.text.substr(("[" + msgtype + "] ").length);      
        }
        message.type = "DBG_LORE_" + msgtype; 
    }

}); 

Firebug.registerModule(Firebug.LoreTracingModel); 

}})};
