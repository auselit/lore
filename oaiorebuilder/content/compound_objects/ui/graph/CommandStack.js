/** 
 * @class lore.ore.ui.graph.CommandStack CommandStack for undo and redo, supporting grouping of commands (very basic: does not support nesting of group commands)
 * @extends draw2d.CommandStack
 */
lore.ore.ui.graph.CommandStack = Ext.extend(draw2d.CommandStack, {
	constructor: function(){
		// indicates whether command group is currently active
		this.inGroup = false;
		draw2d.CommandStack.call(this);
	},
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
			var comm = new lore.ore.ui.graph.CommandGroup(this.groupCommands);
			this.execute(comm);
		}
	},
	execute: function(command){
		// when in a group, don't execute commands directly: they will be added to CommandGroup
		if (this.inGroup) {
			this.groupCommands.push(command);
			return;
		}
		draw2d.CommandStack.prototype.execute.call(this, command);
	}
});