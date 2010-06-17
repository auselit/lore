lore.ore.ui.CompoundObjectDataView = Ext.extend(Ext.DataView, {
    initComponent : function(){
        Ext.apply(this, { 
            plugins: new Ext.DataView.DragSelector({dragSafe:true}),                  
            tpl :  new Ext.XTemplate(               
                "<tpl for=\".\">",
                "<div class='coListing' onclick='lore.ore.readRDF(\"{uri}\")' style='list-style-image: url(chrome://lore/skin/icons/oaioreicon-sm.png);cursor:pointer;font-size:smaller;'>{title}",
                    "<div style='color:#51666b;font-size:90%'>{creator}",
                        "<tpl if='typeof modified != \"undefined\" && modified != null'>, Last modified {modified}</tpl>",
                        "<tpl if='typeof accessed != \"undefined\" &&accessed != null'>, Last accessed {accessed}</tpl>",
                    "</div>",
                "</div>",
                "</tpl>"
            ),
            singleSelect: true,
            autoScroll: true,
            itemSelector : "div.coListing"
        });
        lore.ore.ui.CompoundObjectDataView.superclass.initComponent.call(this,arguments); 
    }
});
Ext.reg('codataview', lore.ore.ui.CompoundObjectDataView);

lore.ore.ui.CompoundObjectDragZone = function(dataview, config){
    this.dataview = dataview;
    lore.ore.ui.CompoundObjectDragZone.superclass.constructor.call(this, dataview.getEl(), config);
};
Ext.extend(lore.ore.ui.CompoundObjectDragZone, Ext.dd.DragZone, {
    containerScroll: true,
    ddGroup: "coDD",
    getDragData: function(evt) {
        var dataview = this.dataview;
        try{
            var sourceEl = evt.getTarget(dataview.itemSelector, 10);
            if (sourceEl) {
                var dragData = {
                    ddel: sourceEl,
                    draggedRecord: dataview.getRecord(sourceEl)
                }
                return dragData;
            }
        } catch (e){
            lore.debug.ore("problem in get drag data",e);
        }
        return false;
    }
});
