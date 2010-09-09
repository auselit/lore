/** 
 * @class lore.ore.ui.CompoundObjectDataView Displays a summary of a compound object eg in browse, history, search lists
 * @extends Ext.DataView
 */
lore.ore.ui.CompoundObjectDataView = Ext.extend(Ext.DataView, {
    initComponent : function(){
        Ext.apply(this, { 
            plugins: new Ext.DataView.DragSelector({dragSafe:true}),
            tpl :  new Ext.XTemplate(               
                '<tpl for=".">',
                '<div class="coListing" onclick="lore.ore.controller.loadCompoundObjectFromURL(\'{uri}\')">',
                    '<table><tr valign="top"><td>{[this.genNumber(values.uri)]}</td><td>',
                    '<div style="float:left;padding:2px;">',
                    '<tpl if="lore.ore.reposAdapter && uri.match(lore.ore.reposAdapter.idPrefix)"><img src="chrome://lore/skin/icons/oaioreicon-sm.png"></tpl>',
                    '<tpl if="lore.ore.reposAdapter && !uri.match(lore.ore.reposAdapter.idPrefix)"><img src="chrome://lore/skin/icons/oaioreicon-grey.png"></tpl>',
                    '</div>',
                    '<div>{title}</div>',
                    '<div style="padding-left:20px;color:#51666b;font-size:87%">{creator}',
                        '<tpl if="typeof modified != \'undefined\' && modified != null">, last modified {[fm.date(values.modified,\'j M Y, g:ia\')]}</tpl>',
                        '<tpl if="typeof accessed != \'undefined\' && accessed != null">Last accessed {[fm.date(values.accessed,\'j M Y, g:ia\')]}</tpl>',
                    '</div>',
                    '</td></tr></table>',
                '</div>',
                '</tpl>',
                {
                    dv: this,
                    genNumber: function(uri){
                        var idx = this.dv.store.find('uri',uri);
                        return this.dv.store.lastOptions.params.start + idx + 1;
                    }
                }
            ),
            loadingText: "Loading compound objects...",
            singleSelect: true,
            autoScroll: false,
            style: "overflow-y:auto;overflow-x:hidden",
            itemSelector : "div.coListing"
        });
        lore.ore.ui.CompoundObjectDataView.superclass.initComponent.call(this,arguments); 
        this.on('contextmenu',this.onContextMenu,this);
        
        // When data is loaded, refresh view to reset numbering
        this.store.on("load", 
            function(){
                this.refresh();
                // auto raise browse view when results are loaded
                if (this.id == 'cobview'){
                    if (!this.parentPanel) {
                        this.parentPanel = this.findParentByType('panel');
                    }
                    if (this.parentPanel){
                        lore.debug.ore("activating " + this.id,this.parentPanel);
                        Ext.getCmp("propertytabs").activate(this.parentPanel.id);
                    }
                }
            },
            this
        );
    },
    onContextMenu: function (e, node, obj){ 
        var elem = e.getTarget(this.itemSelector, 10);
        this.sel = this.getRecord(elem);
        try{
            if (!this.contextMenu){
                var cm = new Ext.menu.Menu({
                    id : this.id + "-context-menu",
                    showSeparator: false
                });
                this.contextMenu = cm;
                cm.remoteMsg = new Ext.form.Label({
                        text : "Compound object is not from default repository",
                        cls: 'underlined'
                 });
                cm.add(cm.remoteMsg);
                cm.localLoad = new Ext.menu.Item({
                    text: "Edit compound object",
                       iconCls: "edit-icon",
                       scope: this,
                       handler: function(obj,evt) {
                            lore.debug.ore("edit " + this.sel.data.uri);
                            lore.ore.controller.loadCompoundObjectFromURL(this.sel.data.uri);
                        }
                    });
                 cm.remoteLoad = new Ext.menu.Item({
                    text: "View compound object in editor (read-only)",
                       iconCls: "edit-icon",
                       scope: this,
                       handler: function(obj,evt) {
                            lore.debug.ore("view " + this.sel.data.uri);
                            lore.ore.controller.loadCompoundObjectFromURL(this.sel.data.uri);
                        }
                    });
                 
                 cm.add(cm.localLoad);
                 cm.add(cm.remoteLoad);
                 cm.localDelete = new Ext.menu.Item({
                    text : "Delete compound object",
                    iconCls: "delete-icon",
                    scope: this,
                    handler : function(obj,evt) {
                        lore.debug.ore("delete handler " + this.sel.data.uri,[this,obj, evt]);
                        lore.ore.controller.deleteCompoundObjectFromRepository(this.sel.data.uri, this.sel.data.title);
                    }
                 });
                 
                 cm.add(cm.localDelete);
                 
                 cm.add({
                    text : "Add as nested compound object",
                    iconCls: "add-icon",
                    scope: this,
                    handler : function(obj, evt) {
                        lore.ore.ui.graphicalEditor.addFigure({url:this.sel.data.uri,
                            props:{
                            "rdf:type_0": lore.constants.RESOURCE_MAP,
                            "dc:title_0": this.sel.data.title}});
                 }});
                 if (this.id == 'cohview'){
                    cm.add({
                       text: "Do not show in history",
                       iconCls: "no-icon",
                       scope: this,
                       handler: function(obj,evt) {
                            if (lore.ore.historyManager){
                                lore.ore.historyManager.deleteFromHistory(this.sel.data.uri);
                            }
                        }
                    });
                 }
                 
                 
                 cm.on('beforeshow',function(menu){
                    if(lore.ore.reposAdapter && this.sel.data.uri.match(lore.ore.reposAdapter.idPrefix)){
                        menu.localLoad.show();
                        menu.localDelete.show();
                        menu.remoteMsg.hide();
                        menu.remoteLoad.hide();
                    } else {
                        menu.remoteLoad.show();
                        menu.remoteMsg.show();
                        menu.localDelete.hide();
                        menu.localLoad.hide();
                    }
                 },this);
                        
            }
            this.contextMenu.showAt(e.xy);
        } catch (ex){
            lore.debug.ore("onContextMenu",ex);
        }
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
                };
                return dragData;
            }
        } catch (e){
            lore.debug.ore("problem in get drag data",e);
        }
        return false;
    }
});
