/**
 * Listens for commands such as delete, undo, redo and updates the oreGraphLookup object that is used
 * to map resource URLs to figure IDs
 **/
oaiorebuilder.CommandListener=function(){
draw2d.CommandStackEventListener.call(this);};
oaiorebuilder.CommandListener.prototype=new draw2d.CommandStackEventListener;
oaiorebuilder.CommandListener.prototype.type="oaiorebuilder.CommandListener";
oaiorebuilder.CommandListener.prototype.stackChanged=function(event){
	// remove the url from oreGraphLookup if node is deleted, add it back if it is undone
	var details=event.getDetails();
	var comm = event.getCommand();
	var comm_fig = comm.figure;
	if(0!=(details&(draw2d.CommandStack.POST_EXECUTE)))
	{
		if(comm instanceof draw2d.CommandDelete){
			delete oreGraphLookup[comm_fig.url];
		}
	}
	else{if(0!=(details&(draw2d.CommandStack.POST_UNDO)))
	{
		if(comm instanceof draw2d.CommandDelete){
			oreGraphLookup[comm_fig.url] = comm_fig.getId();
		}
	}
	else{if(0!=(details&(draw2d.CommandStack.POST_REDO)))
	{
		if(comm instanceof draw2d.CommandDelete){
			delete oreGraphLookup[comm_gif.url];
		}
	}}}
};