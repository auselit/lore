/*
 * Connection figure that provides a context menu to set the connection type
 * The types are sourced from ontrelationships, which is populated from an ontology (see uifunctions.js)
 */
lore.ore.graph.ContextmenuConnection=function(){
	draw2d.Connection.call(this);
	var grey = new draw2d.Color(174,174,174);
	var darkgrey = new draw2d.Color(51,51,51);
	var theArrow = new draw2d.ArrowConnectionDecorator();
	theArrow.setColor(grey);
	this.setTargetDecorator(theArrow);
	this.setRouter(new draw2d.BezierConnectionRouter());
	//this.setRouter(new draw2d.ManhattanConnectionRouter());
	this.label = new draw2d.Label();
	this.label.setColor(darkgrey);
	this.addFigure(this.label, new draw2d.ManhattanMidpointLocator(this));
    this.setRelationshipType("http://purl.org/dc/elements/1.1/","relation");
	this.sourcePort=null;
    this.targetPort=null;
	this.lineSegments=new Array();
	this.setColor(grey);
	this.setLineWidth(1);
	this.setSourceAnchor(new draw2d.ChopboxConnectionAnchor());
	this.setTargetAnchor(new draw2d.ChopboxConnectionAnchor());
};
lore.ore.graph.ContextmenuConnection.prototype=new draw2d.Connection();
lore.ore.graph.ContextmenuConnection.prototype.setRelationshipType=function(enamespace, etype){
	this.edgetype=etype;
	this.edgens=enamespace;
	lore.ui.nodegrid.setSource({"Relationship":etype, "Schema": enamespace});
	this.label.setText(etype);
};
lore.ore.graph.ContextmenuConnection.prototype.getContextMenu=function() {
	var menu=new draw2d.Menu();
	var oThis = this;
	// sort the menu entries
	var keys = [];
 	for (rel in lore.ore.ontrelationships){
		keys.push(rel);
 	}
 	keys.sort();
 	for (var i =0; i< keys.length; i++){
 		var rel = keys[i];
		var enamespace=lore.ore.ontrelationships[rel];
		var etype = rel;
		var functionstr = "oThis.setRelationshipType(\"" + enamespace + "\", \"" +  etype + "\");"
		var thefunc = eval ("(function () {" + functionstr + "})");
 		menu.appendMenuItem(new draw2d.MenuItem(rel,null, thefunc));
 	}
	return menu;
};


