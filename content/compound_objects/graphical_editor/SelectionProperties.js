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
        lore.ore.ui.nodegrid.store.removeAll();
		if (figure.metadataproperties) {
            for (p in figure.metadataproperties){
                var pname = p;
                var pidx = p.indexOf("_");
                if (pidx != -1){
                    pname = p.substring(0,pidx);
                }
                //lore.ore.appendPropertyValue(p,figure.metadataproperties[p],lore.ore.ui.nodegrid);
                lore.ore.ui.nodegrid.store.loadData([{id: p, name: pname, value: figure.metadataproperties[p]}],true);
            }
            lore.ore.ui.propertytabs.activate("properties");
            lore.ore.ui.nodegrid.expand();
		}
		else if (figure.edgetype){
            lore.ore.ui.nodegrid.store.loadData([
                {name:'relationship',id:'relationship',value:figure.edgetype},
                {name: 'namespace', id: 'namespace', value:figure.edgens}
            ]);
            lore.ore.ui.propertytabs.activate("properties");
            lore.ore.ui.nodegrid.expand();
		}
	} else {
        delete lore.ore.graph.selectedFigure;
        lore.ore.ui.nodegrid.store.removeAll();
        lore.ore.ui.nodegrid.collapse();
	}
}