/* Updates the properties views when nodes or connections are selected
 * 
 */
oaiorebuilder.SelectionProperties=function(/*:workflow*/ workflow)
{
   this.workflow = workflow;
   
}

/** @private **/
oaiorebuilder.SelectionProperties.prototype.type="oaiorebuilder.SelectionProperties";
oaiorebuilder.SelectionProperties.prototype.onSelectionChanged = function(/*:Figure*/figure){
	if (figure != null) {
		selectedFigure = figure;
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
			
			nodegrid.setSource(figure.metadataproperties);
			propertytabs.activate('nodegrid');
			//nodegrid.getColumnModel().setColumnWidth(0,70);
		}
		else if (figure.edgetype){
			nodegrid.setSource({"relationship": figure.edgetype, "namespace": figure.edgens});
			//nodegrid.getColumnModel().setColumnWidth(0,80);
			propertytabs.activate('nodegrid');
		}
	} else {
		nodegrid.setSource({});
		propertytabs.activate('remgrid');
	}
}