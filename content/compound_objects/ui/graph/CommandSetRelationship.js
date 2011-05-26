/**
 * @class lore.ore.ui.graph.CommandSetRelationship Command to set relationship (provides undo support for setting relationship type on connections)
 * @param {} figure
 * @param {} edgens
 * @param {} edgetype
 * @param {} symmetric
 */
lore.ore.ui.graph.CommandSetRelationship = function(figure, edgens, edgetype, symmetric){
   this.figure = figure;
   this.newNS = edgens;
   this.oldNS = figure.edgens;
   this.newType = edgetype;
   this.oldType = figure.edgetype;
   this.newSymmetric = symmetric;
   this.oldSymmetric = figure.symmetric;
};
Ext.extend(lore.ore.ui.graph.CommandSetRelationship, draw2d.Command, {
   type :  "lore.ore.ui.graph.CommandSetRelationship",
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