/* Updates the properties views when nodes or connections are selected
 * 
 */
lore.ore.graph.SelectionProperties=function(/*:workflow*/ workflow)
{
   this.workflow = workflow; 
}

lore.ore.graph.SelectionProperties.prototype.type="lore.ore.graph.SelectionProperties";
lore.ore.graph.SelectionProperties.prototype.onSelectionChanged = function(/*:Figure*/figure){
	if (figure != null) {
		lore.debug.ore("User selected figure in graph editor", figure);
		lore.ore.graph.selectedFigure = figure;
		if (figure.metadataproperties) {
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
	}
}