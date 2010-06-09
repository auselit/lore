lore.ore.ui.graph.CommandSetRelationship = function(figure, edgens, edgetype, symmetric){
   this.figure = figure;
   this.newNS = edgens;
   this.oldNS = figure.edgens;
   this.newType = edgetype;
   this.oldType = figure.edgetype;
   this.newSymmetric = symmetric;
   this.oldSymmetric = figure.symmetric;
   lore.debug.ore("CommandSetRelationship",this);
};
Ext.extend(lore.ore.ui.graph.CommandSetRelationship, draw2d.Command, {
   type :  "lore.ore.ui.graph.CommandSetRelationship",
   /** Execute the command the first time */
   execute: function() {
        this.redo();
   },
   /** Redo the command after it has been undone */
   redo: function() {
        this.figure.setRelationshipType(this.newNS, this.newType, this.newSymmetric);
   },
   /** Undo the command */
   undo: function() {
        this.figure.setRelationshipType(this.oldNS, this.oldType, this.oldSymmetric);
   }
});