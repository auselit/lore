/*
 * Connection figure that provides a context menu to set the connection type
 * The types are sourced from ontrelationships, which is populated from an ontology (see uifunctions.js)
 */
var oaiorebuilder = {}
oaiorebuilder.ContextmenuConnection=function()
{draw2d.Connection.call(this);
var grey = new draw2d.Color(174,174,174);
var darkgrey = new draw2d.Color(51,51,51);
var theArrow = new draw2d.ArrowConnectionDecorator();
theArrow.setColor(grey);
this.setTargetDecorator(theArrow);
this.setRouter(new draw2d.BezierConnectionRouter());
this.label = new draw2d.Label();
this.label.setColor(darkgrey);
this.addFigure(this.label, new draw2d.ManhattanMidpointLocator(this));
this.setRelationshipType("http://purl.org/vocab/frbr/core#","partOf");
this.sourcePort=null;this.targetPort=null;
this.lineSegments=new Array();
this.setColor(grey);
this.setLineWidth(1);
};
oaiorebuilder.ContextmenuConnection.prototype=new draw2d.Connection();
oaiorebuilder.ContextmenuConnection.prototype.setRelationshipType=function(enamespace, etype)
{this.edgetype=etype;
this.edgens=enamespace;
nodegrid.setSource({"Relationship":etype, "Schema": enamespace});
//nodegrid.getColumnModel().setColumnWidth(0,70);
this.label.setText(etype);
};
oaiorebuilder.ContextmenuConnection.prototype.setOntologyRelationships=function(r){
	this.ontrelationships = r;
};
oaiorebuilder.ContextmenuConnection.prototype.getContextMenu=function()
{
	// ontrelationships is global - set up by main html page
	var menu=new draw2d.Menu();
	var oThis = this;
 	for (rel in ontrelationships){
		var enamespace=ontrelationships[rel];
		var etype = rel;
		var functionstr = "oThis.setRelationshipType(\"" + enamespace + "\", \"" +  etype + "\");"
		var thefunc = eval ("(function () {" + functionstr + "})");
		
 		menu.appendMenuItem(new draw2d.MenuItem(rel,null, thefunc));
 	}
	return menu;
};


