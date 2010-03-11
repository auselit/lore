/*
 * Copyright (C) 2008 - 2010 School of Information Technology and Electrical
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
 * Port that accepts connections from ContextmenuConnections 
 * @class lore.ore.ui.graph.Port
 */
lore.ore.ui.graph.Port = function(uirep) {
    draw2d.Port.call(this,uirep);
    this.setCoronaWidth(35);
    var lemon = new draw2d.Color(255, 252, 182);
    var grey = new draw2d.Color(174, 174, 174);
    this.setBackgroundColor(lemon);
    this.setColor(grey);
};
lore.ore.ui.graph.Port.prototype = new draw2d.Port;
lore.ore.ui.graph.Port.prototype.type = "lore.ore.ui.graph.Port";
/**
 * Create a connection between nodes if a port from another node is dropped on this port
 * @param {} port
 */
lore.ore.ui.graph.Port.prototype.onDrop = function(port) {
	if (this.parentNode.id != port.parentNode.id) {
		var commConn = new draw2d.CommandConnect(this.parentNode.workflow, this, port);
		commConn.setConnection(new lore.ore.ui.graph.ContextmenuConnection());
		this.parentNode.workflow.getCommandStack().execute(commConn);
	}
};