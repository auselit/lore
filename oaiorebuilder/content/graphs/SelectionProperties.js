/* Updates the properties views when nodes or connections are selected
 * 
 */
lore.ore.graph.SelectionProperties=function(/*:workflow*/ workflow)
{
   this.workflow = workflow;
   
}

/** @private **/
lore.ore.graph.SelectionProperties.prototype.type="lore.ore.graph.SelectionProperties";
lore.ore.graph.SelectionProperties.prototype.onSelectionChanged = function(/*:Figure*/figure){
	if (figure != null) {
		lore.debug.ore("User selected figure in graph editor", figure);
		lore.ore.graph.selectedFigure = figure;
		if (figure.metadataproperties) {
			/*var ports = figure.getPorts();
			var incomingconnections = ports.get(0).getConnections();
            var outgoingconnections = ports.get(1).getConnections();
            for(var j=0; j<outgoingconnections.getSize();j++)
            {
			   var theconnector = outgoingconnections.get(j);
               var relpred = theconnector.edgetype;
			   var relobj = theconnector.targetPort.parentNode.url;
			   //var theprop = eval("props." + relpred);
			   //if (theprop != null){
			   
				
			   	//eval("props." + relpred + "")
			   //} else
			   	//eval("props." + relpred + "=\"" + relobj + "\";");
            }*/
			
			lore.ui.nodegrid.setSource(figure.metadataproperties);
			lore.ui.propertytabs.activate('nodegrid');
		}
		else if (figure.edgetype){
			lore.ui.nodegrid.setSource({"relationship": figure.edgetype, "namespace": figure.edgens});
			lore.ui.propertytabs.activate('nodegrid');
		}
	} else {
		lore.ui.nodegrid.setSource({});
		lore.ui.propertytabs.activate('remgrid');
		lore.debug.ore("User deselected figure in graph editor");
	}
}