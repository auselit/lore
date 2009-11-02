/*
 * Copyright (C) 2008 - 2009 School of Information Technology and Electrical
 * Engineering, University of Queensland (www.itee.uq.edu.au).
 * 
 * This file is part of LORE. LORE was developed as part of the Aus-e-Lit
 * project.
 * 
 * LORE is free software: you can redistribute it and/or modify it under the
 * terms of the GNU General Public License as published by the Free Software
 * Foundation, either version 3 of the License, or (at your option) any later
 * version.
 * 
 * LORE is distributed in the hope that it will be useful, but WITHOUT ANY
 * WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR
 * A PARTICULAR PURPOSE. See the GNU General Public License for more details.
 * 
 * You should have received a copy of the GNU General Public License along with
 * LORE. If not, see <http://www.gnu.org/licenses/>.
 */
/**
 * Listens for commands such as delete, undo, redo and updates the graph lookup object that is used
 * to map resource URLs to figure IDs
 * @class
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
    
    if(comm instanceof draw2d.CommandMove && (comm.newX < 0 || comm.newY < 0)){
        // don't allow figures to be moved outside bounds of canvas
        comm.undo();
    }
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