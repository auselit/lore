/** Override collapse behaviour in split region to improve UI responsiveness **/
(function(){
var oldcollapse = Ext.layout.BorderLayout.SplitRegion.prototype.onCollapseClick;
var oldexpand = Ext.layout.BorderLayout.SplitRegion.prototype.onExpandClick;
var oldsplitmove = Ext.layout.BorderLayout.SplitRegion.prototype.onSplitMove;
// overrides to prevent memory leak (can be removed after we upgrade to Ext 3.2)
Ext.override(Ext.layout.BorderLayout.Region, {
    destroy: function () {
        Ext.destroy(
            this.miniCollapsedEl, 
            this.collapsedEl
        );
    }
});
Ext.override(Ext.layout.BorderLayout.SplitRegion, {
    destroy: function () {
        Ext.destroy(
            this.miniSplitEl, 
            this.split, 
            this.splitEl
        );
        Ext.layout.BorderLayout.SplitRegion.superclass.destroy.call(this);
    },
    onCollapseClick: function(e){

        var activetab = Ext.getCmp("loreviews").getActiveTab();
        lore.debug.ore("collapse click");
        activetab.hide();
		oldcollapse.apply(this,arguments);
        activetab.show();
    },
    onExpandClick : function (e){
        var activetab = Ext.getCmp("loreviews").getActiveTab();
        activetab.hide();
        oldexpand.apply(this,arguments);
        activetab.show();
    },
    onSplitMove : function (split, newSize){
        var activetab = Ext.getCmp("loreviews").getActiveTab();
        var propactivetab = Ext.getCmp("propertytabs").getActiveTab();
        activetab.hide();
        // TODO: should hide these but doing this means property grids don't resize
        //propactivetab.hide();
        oldsplitmove.apply(this, arguments);
        activetab.show();
        //propactivetab.show();
        return false;
    }
})
})();
