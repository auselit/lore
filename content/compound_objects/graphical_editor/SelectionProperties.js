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
			lore.ore.ui.nodegrid.setSource(figure.metadataproperties);
			lore.ore.ui.propertytabs.activate('nodegrid');
		}
		else if (figure.edgetype){
			lore.ore.ui.nodegrid.setSource({"relationship": figure.edgetype, "namespace": figure.edgens});
			lore.ore.ui.propertytabs.activate('nodegrid');
		}
	} else {
		lore.ore.ui.nodegrid.setSource({});
		lore.ore.ui.propertytabs.activate('remgrid');
	}
}