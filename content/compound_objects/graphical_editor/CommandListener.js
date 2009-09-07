/**
 * Listens for commands such as delete, undo, redo and updates the graph lookup object that is used
 * to map resource URLs to figure IDs
 **/
lore.ore.graph.CommandListener=function(){
draw2d.CommandStackEventListener.call(this);};
lore.ore.graph.CommandListener.prototype=new draw2d.CommandStackEventListener;
lore.ore.graph.CommandListener.prototype.type="lore.ore.graph.CommandListener";
lore.ore.graph.CommandListener.prototype.stackChanged=function(event){
	lore.debug.ore("CommandListener stackChanged", event);
	// remove the url from lookup if node is deleted, add it back if it is undone
	var details=event.getDetails();
	var comm = event.getCommand();
	var comm_fig = comm.figure;
	lore.ore.graph.modified = true;
	if(0!=(details&(draw2d.CommandStack.POST_EXECUTE)))
	{
		if(comm instanceof draw2d.CommandDelete){
			delete lore.ore.graph.lookup[comm_fig.url];
		}
	}
	else{if(0!=(details&(draw2d.CommandStack.POST_UNDO)))
	{
		if(comm instanceof draw2d.CommandDelete){
			lore.ore.graph.lookup[comm_fig.url] = comm_fig.getId();
		}
	}
	else{if(0!=(details&(draw2d.CommandStack.POST_REDO)))
	{
		if(comm instanceof draw2d.CommandDelete){
			delete lore.ore.graph.lookup[comm_gif.url];
		}
	}}}
};