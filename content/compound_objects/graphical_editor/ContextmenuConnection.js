/*
 * Connection figure that provides a context menu to set the connection type
 * The types are sourced from ontrelationships, which is populated from an ontology (see uifunctions.js)
 */
lore.ore.graph.ContextmenuConnection=function(){
	draw2d.Connection.call(this);
	this.grey = new draw2d.Color(174,174,174);
	this.darkgrey = new draw2d.Color(51,51,51);
	var theArrow = new draw2d.ArrowConnectionDecorator();
	theArrow.setColor(this.grey);
	this.setTargetDecorator(theArrow); 
	this.setRouter(new draw2d.BezierConnectionRouter());
	//this.setRouter(new draw2d.ManhattanConnectionRouter());
	this.label = new draw2d.Label();
	this.label.setColor(this.darkgrey);
	this.addFigure(this.label, new draw2d.ManhattanMidpointLocator(this));
    this.setRelationshipType("http://purl.org/dc/elements/1.1/","relation");
	this.sourcePort=null;
    this.targetPort=null;
	this.lineSegments=new Array();
	this.setColor(this.grey);
	this.setLineWidth(1);
	this.setSourceAnchor(new draw2d.ChopboxConnectionAnchor());
	this.setTargetAnchor(new draw2d.ChopboxConnectionAnchor());
};
lore.ore.graph.ContextmenuConnection.prototype=new draw2d.Connection();
lore.ore.graph.ContextmenuConnection.prototype.setRelationshipType=function(enamespace, etype, symmetric){
	this.edgetype=etype;
	this.edgens=enamespace;
	lore.ui.nodegrid.setSource({"Relationship":etype, "Schema": enamespace});
	this.label.setText(etype);
    try{
    if (symmetric){
        var theArrow = new draw2d.ArrowConnectionDecorator();
        theArrow.setColor(this.grey);
        this.setSourceDecorator(theArrow);
    } else {
        this.setSourceDecorator(null);
    }
    } catch(ex) {
        lore.debug.ore("Exception setting connection rel type",ex);
    }
};
lore.ore.graph.ContextmenuConnection.prototype.getContextMenu=function() {
    try {
    // use the cached menu if the relationship ontology has not changed
    if (lore.ore.graph.ContextmenuConnection.cmenu && (
        lore.ore.graph.ContextmenuConnection.loadedOntology == lore.ore.onturl)) {
        return lore.ore.graph.ContextmenuConnection.cmenu;
    } else {
        lore.debug.ore("generating context menu for connection",this);
	    lore.ore.graph.ContextmenuConnection.cmenu=new draw2d.Menu();
		// sort the menu entries
		var keys = [];
	 	for (var rel in lore.ore.ontrelationships){
			keys.push(rel);
	 	}
	 	keys.sort();
	 	for (var i =0; i< keys.length; i++){
	 		rel = keys[i];
			var enamespace=lore.ore.ontrelationships[rel];
			var etype = rel; 
            var thequery = lore.ore.relOntology.prefix('rdf',lore.constants.RDF_SYNTAX_NS).where('<' + enamespace + rel +'> rdf:type <' + lore.constants.OWL_SPROP + '>');
	        var symm = thequery.length > 0;
			var functionstr = "lore.ore.graph.selectedFigure.setRelationshipType(\"" + enamespace + "\", \"" +  etype + "\"," + symm + ");"
			var thefunc = eval ("(function () {" + functionstr + "})");
	 		lore.ore.graph.ContextmenuConnection.cmenu.appendMenuItem(new draw2d.MenuItem(rel,null, thefunc));
	 	}
        lore.ore.graph.ContextmenuConnection.loadedOntology = lore.ore.onturl;
		return lore.ore.graph.ContextmenuConnection.cmenu;
    }
    } catch (ex){
        lore.debug.ore("problem generating context menu for connection",ex);
        return null;
    }
};


