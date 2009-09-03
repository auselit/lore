/* Port that accepts connections from ContextmenuConnections 
 * 
 */
lore.ore.graph.Port = function(uirep) {
    draw2d.Port.call(this,uirep);
    this.setCoronaWidth(35);
};
lore.ore.graph.Port.prototype = new draw2d.Port;
lore.ore.graph.Port.prototype.type = "lore.ore.graph.Port";
lore.ore.graph.Port.prototype.onDrop = function(port) {
	if (this.parentNode.id != port.parentNode.id) {
		var _5322 = new draw2d.CommandConnect(this.parentNode.workflow, this,
				port);
		_5322.setConnection(new lore.ore.graph.ContextmenuConnection());
		this.parentNode.workflow.getCommandStack().execute(_5322);
	}
};