/*
 * Copyright (C) 2008 - 2011 School of Information Technology and Electrical
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
 * 
 * * Based on the Draw2D Library: http://www.draw2d.org Copyright: 2006 Andreas
 * * Herz. All rights reserved. Created: 5.11.2006 by Andreas Herz (Web:
 * * http://www.freegroup.de ) LICENSE: LGPL
 * 
 */

/**
 * @class lore.draw2d.Command Abstract superclass for commands
 * @param {} label
 */
lore.draw2d.Command = function(label) {
    this.label = label;
};
Ext.apply(lore.draw2d.Command.prototype, {
    getLabel : function() {
        return this.label;
    },
    canExecute : function() {
        return true;
    },
    execute : function() {
    },
    cancel : function() {
    },
    undo : function() {
    },
    redo : function() {
    }
});
/** 
 * @class draw2d.CommandGroup Represents a complex command consisting of a group of other commands
 * @extends lore.draw2d.Command
 */
lore.draw2d.CommandGroup = Ext.extend(lore.draw2d.Command, {
    constructor: function(commands){
        lore.draw2d.Command.call(this, "command group");
        this.commands = commands;
    },
    /** Execute the first time */
    canExecute: function(){
        if (!this.commands || this.commands.length == 0){
            return false;
        }
        return true;
    },
    /** Iterate over commands and execute them */
    execute: function(){
        for (var i = 0; i < this.commands.length; i++){
            this.commands[i].execute();
        }
    },
    /** Called when user cancels operation */
    cancel: function(){
        delete this.commands;
    },
    /** Undo all commands in group */
    undo: function(){
        for (var i = 0; i < this.commands.length; i++){
            this.commands[i].undo();
        }
    },
    /** Redo all commands in group */
    redo: function(){
        for (var i = 0; i < this.commands.length; i++){
            this.commands[i].redo();
        }
    }
});
/**
 * @class lore.draw2d.CommandStack
 */
lore.draw2d.CommandStack = function() {
    this.undostack = new Array();
    this.redostack = new Array();
    this.maxundo = 50;
    this.eventListeners = new lore.draw2d.ArrayList();
    /** indicates whether command group is currently active */
    this.inGroup = false;
};
lore.draw2d.CommandStack.PRE_EXECUTE = 1;
lore.draw2d.CommandStack.PRE_REDO = 2;
lore.draw2d.CommandStack.PRE_UNDO = 4;
lore.draw2d.CommandStack.POST_EXECUTE = 8;
lore.draw2d.CommandStack.POST_REDO = 16;
lore.draw2d.CommandStack.POST_UNDO = 32;
lore.draw2d.CommandStack.POST_MASK = lore.draw2d.CommandStack.POST_EXECUTE
        | lore.draw2d.CommandStack.POST_UNDO | lore.draw2d.CommandStack.POST_REDO;
lore.draw2d.CommandStack.PRE_MASK = lore.draw2d.CommandStack.PRE_EXECUTE
        | lore.draw2d.CommandStack.PRE_UNDO | lore.draw2d.CommandStack.PRE_REDO;
Ext.apply(lore.draw2d.CommandStack.prototype, {
    /** start adding commands to a new command group */
    startCommandGroup: function(){
        if (this.inGroup){
            this.endCommandGroup();
        }
        this.inGroup = true;
        this.groupCommands = new Array();
    },
    /** finish adding commands to the current command group */
    endCommandGroup: function(){
        // bundle up commands into a CommandGroup and add it to undo stack
        this.inGroup = false;
        if (this.groupCommands){
            var comm = new lore.draw2d.CommandGroup(this.groupCommands);
            this.execute(comm);
        }
    },
    setUndoLimit : function(count) {
        this.maxundo = count;
    },
    markSaveLocation : function() {
        this.undostack = new Array();
        this.redostack = new Array();
    },
    execute : function(command) {
        if (this.inGroup) {
            this.groupCommands.push(command);
            return;
        }
        if (command == null) {
            return;
        }
        if (command.canExecute() == false) {
            return;
        }
        this.notifyListeners(command, lore.draw2d.CommandStack.PRE_EXECUTE);
        this.undostack.push(command);
        command.execute();
        this.redostack = new Array();
        if (this.undostack.length > this.maxundo) {
            this.undostack = this.undostack.slice(this.undostack.length
                    - this.maxundo);
        }
        this.notifyListeners(command, lore.draw2d.CommandStack.POST_EXECUTE);
    },
    undo : function() {
        var _4ef4 = this.undostack.pop();
        if (_4ef4) {
            this.notifyListeners(_4ef4, lore.draw2d.CommandStack.PRE_UNDO);
            this.redostack.push(_4ef4);
            _4ef4.undo();
            this.notifyListeners(_4ef4, lore.draw2d.CommandStack.POST_UNDO);
        }
    },
    redo : function() {
        var _4ef5 = this.redostack.pop();
        if (_4ef5) {
            this.notifyListeners(_4ef5, lore.draw2d.CommandStack.PRE_REDO);
            this.undostack.push(_4ef5);
            _4ef5.redo();
            this.notifyListeners(_4ef5, lore.draw2d.CommandStack.POST_REDO);
        }
    },
    canRedo : function() {
        return this.redostack.length > 0;
    },
    canUndo : function() {
        return this.undostack.length > 0;
    },
    /**
     * Listener must implement stackChanged function, with param event
     * @param {} _4ef6
     */
    addCommandStackEventListener : function(listener) {
        this.eventListeners.add(listener);
    },
    removeCommandStackEventListener : function(listener) {
        this.eventListeners.remove(listener);
    },
    notifyListeners : function(_4ef8, state) {
        var event = new lore.draw2d.CommandStackEvent(_4ef8, state);
        var size = this.eventListeners.getSize();
        for (var i = 0; i < size; i++) {
            this.eventListeners.get(i).stackChanged(event);
        }
    }
});
/**
 * @class lore.draw2d.CommandStackEvent
 * @param {} _48ed
 * @param {} _48ee
 */
lore.draw2d.CommandStackEvent = function(_48ed, _48ee) {
    this.command = _48ed;
    this.details = _48ee;
};
Ext.apply(lore.draw2d.CommandStackEvent.prototype,{
    getCommand : function() {
        return this.command;
    },
    getDetails : function() {
        return this.details;
    },
    isPostChangeEvent : function() {
        return 0 != (this.getDetails() & lore.draw2d.CommandStack.POST_MASK);
    },
    isPreChangeEvent : function() {
        return 0 != (this.getDetails() & lore.draw2d.CommandStack.PRE_MASK);
    }
});
/** 
 * @class lore.draw2d.CommandAdd
 * @param {} wf Workflow
 * @param {} f figure
 * @param {} x
 * @param {} y
 * @param {} p parent
 */
lore.draw2d.CommandAdd = function(wf, f, x, y, p) {
    lore.draw2d.Command.call(this, "add figure");
    this.parent = p;
    this.figure = f;
    this.x = x;
    this.y = y;
    this.workflow = wf;
};
Ext.extend(lore.draw2d.CommandAdd, lore.draw2d.Command, {
    execute : function() {
        this.redo();
    },
    redo : function() {
        if (this.x && this.y) {
            this.workflow.addFigure(this.figure, this.x, this.y);
        } else {
            this.workflow.addFigure(this.figure);
        }
        this.workflow.setCurrentSelection(this.figure);
        if (this.parent != null) {
            this.parent.addChild(this.figure);
        }
    },
    undo : function() {
        this.workflow.removeFigure(this.figure);
        this.workflow.setCurrentSelection(null);
        if (this.parent != null) {
            this.parent.removeChild(this.figure);
        }
    }
});
/**
 * @class lore.draw2d.CommandDelete
 * @param {} fig
 */
lore.draw2d.CommandDelete = function(fig) {
    lore.draw2d.Command.call(this, "delete figure");
    this.parent = fig.parent;
    this.figure = fig;
    this.workflow = fig.workflow;
    this.connections = null;
    this.compartmentDeleteCommands = null;
};
Ext.extend(lore.draw2d.CommandDelete, lore.draw2d.Command, {
    execute : function() {
        this.redo();
    },
    undo : function() {
        
        this.workflow.addFigure(this.figure);
        if (this.figure instanceof lore.draw2d.Connection) {
            this.figure.reconnect();
        }
        this.workflow.setCurrentSelection(this.figure);
        if (this.parent != null) {
            this.parent.addChild(this.figure);
        }
        for (var i = 0; i < this.connections.getSize(); ++i) {
            this.workflow.addFigure(this.connections.get(i));
            this.connections.get(i).reconnect();
        }
    },
    redo : function() {
        this.workflow.removeFigure(this.figure);
        this.workflow.setCurrentSelection(null);
        if (this.figure instanceof lore.draw2d.Node && this.connections == null) {
            this.connections = new lore.draw2d.ArrayList();
            var ports = this.figure.getPorts();
            for (var i = 0; i < ports.getSize(); i++) {
                if (ports.get(i).getConnections) {
                    this.connections.addAll(ports.get(i).getConnections());
                }
            }
        }
        if (this.connections == null) {
            this.connections = new lore.draw2d.ArrayList();
        }
        if (this.parent != null) {
            this.parent.removeChild(this.figure);
        }
        for (var i = 0; i < this.connections.getSize(); ++i) {
            this.workflow.removeFigure(this.connections.get(i));
        }
    }
});
/**
 * @class lore.draw2d.CommandMove
 * @param {} fig
 * @param {} x
 * @param {} y
 */
lore.draw2d.CommandMove = function(fig, x, y) {
    lore.draw2d.Command.call(this, "move figure");
    this.figure = fig;
    if (x == undefined) {
        this.oldX = fig.getX();
        this.oldY = fig.getY();
    } else {
        this.oldX = x;
        this.oldY = y;
    }
};
Ext.extend(lore.draw2d.CommandMove, lore.draw2d.Command,{
    setStartPosition : function(x, y) {
        this.oldX = x;
        this.oldY = y;
    },
    setPosition : function(x, y) {
        this.newX = x;
        this.newY = y;
        
    },
    canExecute : function() {
        return this.newX != this.oldX || this.newY != this.oldY;
    },
    execute : function() {
        this.redo();
    },
    undo : function() {
        this.figure.setPosition(this.oldX, this.oldY);
        
        
        this.figure.workflow.moveResizeHandles(this.figure);
    },
    redo : function() {
        this.figure.setPosition(this.newX, this.newY);
        
        this.figure.workflow.moveResizeHandles(this.figure);
    }
});
/**
 * @class lore.draw2d.CommandResize
 * @param {} _4ee0
 * @param {} width
 * @param {} _4ee2
 */
lore.draw2d.CommandResize = function(_4ee0, width, _4ee2) {
    lore.draw2d.Command.call(this, "resize figure");
    this.figure = _4ee0;
    if (width == undefined) {
        this.oldWidth = _4ee0.getWidth();
        this.oldHeight = _4ee0.getHeight();
    } else {
        this.oldWidth = width;
        this.oldHeight = _4ee2;
    }
};
lore.draw2d.CommandResize.prototype = new lore.draw2d.Command;
lore.draw2d.CommandResize.prototype.type = "lore.draw2d.CommandResize";
lore.draw2d.CommandResize.prototype.setDimension = function(width, _4ee4) {
    this.newWidth = width;
    this.newHeight = _4ee4;
};
lore.draw2d.CommandResize.prototype.canExecute = function() {
    return this.newWidth != this.oldWidth || this.newHeight != this.oldHeight;
};
lore.draw2d.CommandResize.prototype.execute = function() {
    this.redo();
};
lore.draw2d.CommandResize.prototype.undo = function() {
    this.figure.setDimension(this.oldWidth, this.oldHeight);
    this.figure.workflow.moveResizeHandles(this.figure);
};
lore.draw2d.CommandResize.prototype.redo = function() {
    this.figure.setDimension(this.newWidth, this.newHeight);
    this.figure.workflow.moveResizeHandles(this.figure);
};
/**
 * @class lore.draw2d.CommandConnect
 * @param {} _5176
 * @param {} _5177
 * @param {} _5178
 */
lore.draw2d.CommandConnect = function(_5176, _5177, _5178) {
    lore.draw2d.Command.call(this, "create connection");
    this.workflow = _5176;
    this.source = _5177;
    this.target = _5178;
    this.connection = null;
};
lore.draw2d.CommandConnect.prototype = new lore.draw2d.Command;
lore.draw2d.CommandConnect.prototype.type = "lore.draw2d.CommandConnect";
lore.draw2d.CommandConnect.prototype.setConnection = function(_5179) {
    this.connection = _5179;
};
lore.draw2d.CommandConnect.prototype.execute = function() {
    if (this.connection == null) {
        this.connection = new lore.draw2d.Connection();
    }
    this.connection.setSource(this.source);
    this.connection.setTarget(this.target);
    this.workflow.addFigure(this.connection);
};
lore.draw2d.CommandConnect.prototype.redo = function() {
    this.workflow.addFigure(this.connection);
    this.connection.reconnect();
};
lore.draw2d.CommandConnect.prototype.undo = function() {
    this.workflow.removeFigure(this.connection);
};

/**
 * @class lore.draw2d.CommandReconnect
 * @param {} con
 */
lore.draw2d.CommandReconnect = function(con) {
    lore.draw2d.Command.call(this, "reconnect connection");
    this.con = con;
    this.oldSourcePort = con.getSource();
    this.oldTargetPort = con.getTarget();
    this.oldRouter = con.getRouter();
    this.con.setRouter(new lore.draw2d.NullConnectionRouter());
};
Ext.extend(lore.draw2d.CommandReconnect, lore.draw2d.Command, {
    canExecute : function() {
        return true;
    },
    setNewPorts : function(_5ac1, _5ac2) {
        this.newSourcePort = _5ac1;
        this.newTargetPort = _5ac2;
    },
    execute : function() {
        this.redo();
    },
    cancel : function() {
        var start = this.con.sourceAnchor.getLocation(this.con.targetAnchor
                .getReferencePoint());
        var end = this.con.targetAnchor.getLocation(this.con.sourceAnchor
                .getReferencePoint());
        this.con.setStartPoint(start.x, start.y);
        this.con.setEndPoint(end.x, end.y);
        this.con.getWorkflow().showLineResizeHandles(this.con);
        this.con.setRouter(this.oldRouter);
    },
    undo : function() {
        this.con.setSource(this.oldSourcePort);
        this.con.setTarget(this.oldTargetPort);
        this.con.setRouter(this.oldRouter);
        if (this.con.getWorkflow().getCurrentSelection() == this.con) {
            this.con.getWorkflow().showLineResizeHandles(this.con);
        }
    },
    redo : function() {
        this.con.setSource(this.newSourcePort);
        this.con.setTarget(this.newTargetPort);
        this.con.setRouter(this.oldRouter);
        if (this.con.getWorkflow().getCurrentSelection() == this.con) {
            this.con.getWorkflow().showLineResizeHandles(this.con);
        }
    }
});
/**
 * @class lore.draw2d.CommandMoveLine Command to move a line
 * @param {} line
 * @param {} _60d6
 * @param {} _60d7
 * @param {} endX
 * @param {} endY
 */
lore.draw2d.CommandMoveLine = function(line, _60d6, _60d7, endX, endY) {
    lore.draw2d.Command.call(this, "move line");
    this.line = line;
    this.startX1 = _60d6;
    this.startY1 = _60d7;
    this.endX1 = endX;
    this.endY1 = endY;
};
Ext.extend(lore.draw2d.CommandMoveLine, lore.draw2d.Command, {
    canExecute : function() {
        return this.startX1 != this.startX2 || this.startY1 != this.startY2
                || this.endX1 != this.endX2 || this.endY1 != this.endY2;
    },
    execute : function() {
        this.startX2 = this.line.getStartX();
        this.startY2 = this.line.getStartY();
        this.endX2 = this.line.getEndX();
        this.endY2 = this.line.getEndY();
        this.redo();
    },
    undo : function() {
        this.line.setStartPoint(this.startX1, this.startY1);
        this.line.setEndPoint(this.endX1, this.endY1);
        if (this.line.workflow.getCurrentSelection() == this.line) {
            this.line.workflow.showLineResizeHandles(this.line);
        }
    },
    redo : function() {
        this.line.setStartPoint(this.startX2, this.startY2);
        this.line.setEndPoint(this.endX2, this.endY2);
        if (this.line.workflow.getCurrentSelection() == this.line) {
            this.line.workflow.showLineResizeHandles(this.line);
        }
    }
});
/**
 * @class lore.draw2d.CommandMovePort Command to move a port
 * @param {} port
 */
lore.draw2d.CommandMovePort = function(port) {
    lore.draw2d.Command.call(this, "move port");
    this.port = port;
};
Ext.extend(lore.draw2d.CommandMovePort, lore.draw2d.Command, {
    execute : function() {
        this.port.setAlpha(1);
        this.port.setPosition(this.port.originX, this.port.originY);
        this.port.parentNode.workflow.hideConnectionLine();
    },
    undo : function() {
    },
    redo : function() {
    },
    setPosition : function(x, y) {
    }
});

/**
 * @class lore.draw2d.CommandSetRelationship Command to set relationship (provides undo support for setting relationship type on connections)
 * @param {} figure
 * @param {} edgens
 * @param {} edgetype
 * @param {} symmetric
 */
lore.draw2d.CommandSetRelationship = function(figure, edgens, edgetype, symmetric){
   this.figure = figure;
   this.newNS = edgens;
   this.oldNS = figure.edgens;
   this.newType = edgetype;
   this.oldType = figure.edgetype;
   this.newSymmetric = symmetric;
   this.oldSymmetric = figure.symmetric;
};
Ext.extend(lore.draw2d.CommandSetRelationship, lore.draw2d.Command, {
   /** Execute the command the first time */
   execute: function() {
        this.redo();
   },
   /** Redo the command after it has been undone */
   redo: function() {
        var fig = this.figure;
        var wf = fig.workflow;
        fig.setRelationshipType(this.newNS, this.newType, this.newSymmetric);
        // workaround to force relationship grid to update until we have proper MVC (it can then listen to model)
        if (wf.currentSelection == fig){
            wf.setCurrentSelection(fig);
        }
    
   },
   /** Undo the command */
   undo: function() {
        var fig = this.figure;
        var wf = fig.workflow;
        fig.setRelationshipType(this.oldNS, this.oldType, this.oldSymmetric);
        // workaround to force relationship grid to update until we have proper MVC (it can then listen to model)
        if (wf.currentSelection == fig){
            wf.setCurrentSelection(fig);
        }
   }
});