/** 
 * @class lore.ore.ui.graph.CommandGroup Represents a complex command consisting of a group of other commands
 * @extends draw2d.Command
 */

lore.ore.ui.graph.CommandGroup = Ext.extend(draw2d.Command, {
	constructor: function(commands){
		draw2d.Command.call(this, "command group");
		this.commands = commands;
	},
	type: "lore.ore.ui.graph.CommandGroup",
	/** Execute the first time */
	canExecute: function(){
		if (!this.commands || this.commands.length == 0){
			return false;
		}
		return true;
	},
	execute: function(){
		// iterate over commands and execute them
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
		// iterate over commands and undo
		for (var i = 0; i < this.commands.length; i++){
			this.commands[i].undo();
		}
	},
	/** Redo all commands in group */
	redo: function(){
		// iterate over commands and redo them
		for (var i = 0; i < this.commands.length; i++){
			this.commands[i].redo();
		}
	}
});