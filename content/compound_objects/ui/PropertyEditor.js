lore.ore.ui.PropertyEditor = Ext.extend(Ext.grid.EditorGridPanel,{ 
    initComponent: function(config){
        Ext.apply(this, { 
            clicksToEdit : 1,
            columnLines : true,
            autoHeight : true,
            anchor : "100%",
            collapsible : true,
            collapseFirst: false,
            animCollapse : false,
            store : new Ext.data.JsonStore({
                idProperty : 'id',
                fields : [
                    {
                        name : 'id',
                        type : 'string'
                    }, {
                        name : 'name',
                        type : 'string'
                    }, {
                        name : 'value',
                        type : 'auto'
                    }
                ]
            }),
            colModel : new Ext.grid.ColumnModel({
                columns : [{
                            id : 'name',
                            header : 'Property Name',
                            sortable : true,
                            dataIndex : 'name',
                            menuDisabled : true
                 }, {
                            id : 'value',
                            header : 'Value',
                            dataIndex : 'value',
                            menuDisabled : true,
                            /*
                             * editor: new
                             * Ext.form.TriggerField({
                             * id: "propedittrigger",
                             * 'triggerClass':
                             * 'x-form-ellipsis-trigger',
                             * 'onTriggerClick':
                             * function(ev) {
                             * 
                             *  } })
                             */
                            editor : new Ext.form.TextField()
                        }

                ]
            }),
            sm : new Ext.grid.RowSelectionModel({
                        singleSelect : true
            }),
            viewConfig : {
                forceFit : true,
                scrollOffset : 0
            },
            tools : [{
                        id : 'plus',
                        qtip : 'Add a property',
                        handler : this.addPropertyAction
                    }, {
                        id : 'minus',
                        qtip : 'Remove the selected property',
                        handler : this.removePropertyAction
                    }, {
                        id : 'help',
                        qtip : 'Display information about the selected property',
                        handler : this.helpPropertyAction
                    }
            ]
                        
        });
        lore.ore.ui.PropertyEditor.superclass.initComponent.call(this,config);
        
        // hide/show the properties when the collapse/expand button in the toolbar is triggered
        // FIXME: collapse/expand getting out of sync when CO is loaded
        this.on('beforecollapse', function(p){p.body.setStyle('display','none');});
        this.on('beforeexpand', function(p){p.body.setStyle('display','block');});

        // Set up listeners
        this.on("afteredit", this.handlePropertyChange);
        this.store.on("remove", this.handlePropertyRemove);
        
        // TODO: use MVC, store read only status of properties in model rather than hardcoding this?
        if (this.id == "nodegrid"){
            this.on("beforeedit", function(e) {
                    // don't allow generated format or type field to be edited
                    if (e.record.id == "dc:format_0" || e.record.id == "rdf:type_0") {
                        e.cancel = true;
                    }
                    
            });
        } else {
            this.on("beforeedit", function(e) {
                // don't allow these fields to be edited
                if (e.record.id == "dcterms:modified_0"
                        || e.record.id == "dcterms:created_0"
                        || e.record.id == "rdf:about_0") {
                    e.cancel = true;
                }
            });
           
            this.on("afteredit", function(e) {
                try{
                    
                
                 // update the CO title in the dataview
                   
                  if (e.record.id == "dc:title_0") {
                    lore.ore.coListManager.updateCompoundObject(
                        lore.ore.cache.getLoadedCompoundObjectUri(),
                        {title: e.value}
                    );
                  }
                // commit the change to the datastore
                this.store.commitChanges();
                } catch (e){
                    lore.debug.ore("problem",e);
                }
            });
        }
    },
    /** Handler for plus tool button on property grids 
     * 
     * @param {} ev
     * @param {} toolEl
     * @param {} panel
     */
    addPropertyAction : function (ev, toolEl, panel) {
        var makeAddMenu  = function(panel){
            panel.propMenu = new Ext.menu.Menu({
                id: panel.id + "-add-metadata"
            });
            panel.propMenu.panelref = panel.id;
            for (var i = 0; i < lore.ore.METADATA_PROPS.length; i++) {
                var propname = lore.ore.METADATA_PROPS[i];
                panel.propMenu.add({
                    id: panel.id + "-add-" + propname,
                    text: propname,
                    handler: function () {
                        try{
                            var panel = Ext.getCmp(this.parentMenu.panelref);
                            var pstore = panel.getStore();
                            var counter = 0;
                            var prop = pstore.getById(this.text + "_" + counter);
                            while (prop) {
                                counter = counter + 1;
                                prop = pstore.getById(this.text + "_" + counter);
                            }
                            var theid = this.text + "_" + counter;
                            pstore.loadData([{id: theid, name: this.text, value: ""}],true);
                            
                        } catch (ex){
                            lore.debug.ore("exception adding prop " + this.text,ex);
                        }
                    }
                });
            }
        };
        if (!panel.propMenu) {
            makeAddMenu(panel);
        }
        if (panel.id == "remgrid" || lore.ore.ui.graphicalEditor.getSelectedFigure() instanceof lore.ore.ui.graph.ResourceFigure){
            if (panel.collapsed) {
                panel.expand(false);
            }
            panel.propMenu.showAt(ev.xy);
        } else {
            lore.ore.ui.loreInfo("Please click on a Resource node before adding property");
        }
    },
    /** Handler for minus tool button on property grids
     * 
     * @param {} ev
     * @param {} toolEl
     * @param {} panel
     */
    removePropertyAction: function (ev, toolEl, panel) { 
        try {
        lore.debug.ore("remove Property was triggered",ev);
        var sel = panel.getSelectionModel().getSelected();
        // don't allow delete when panel is collapsed (user can't see what is selected)
        if (panel.collapsed) {
            lore.ore.ui.loreInfo("Please expand the properties panel and select the property to remove");
        } else if (sel) {
            // TODO: #2 (refactor): should allow first to be deleted as long as another exists
            // should also probably renumber
                 if (sel.id.match("_0")){ // first instance of property: check if it's mandatory
                    var propId = sel.id.substring(0,sel.id.indexOf("_0"));
                    if ((panel.id == "remgrid" && lore.ore.CO_REQUIRED.indexOf(propId)!=-1) ||
                        (panel.id == "nodegrid" && 
                            (lore.ore.RES_REQUIRED.indexOf(propId) !=-1 ||
                                lore.ore.REL_REQUIRED.indexOf(propId)!=-1))){
                        lore.ore.ui.loreWarning("Cannot remove mandatory property: " + sel.data.name);
                    } else {
                        panel.getStore().remove(sel);
                    }
                } else { // not the first instance of the property: always ok to delete
                    panel.getStore().remove(sel);
                }
         } else {
            lore.ore.ui.loreInfo("Please click on the property to remove prior to selecting the remove button");
         }
        } catch (ex) {
            lore.debug.ore("error removing property ",ex);
        }
    },
    /** Handler for help tool button on property grids
     * 
     * @param {} ev
     * @param {} toolEl
     * @param {} panel
     */
    helpPropertyAction : function (ev,toolEl, panel) {
        var sel = panel.getSelectionModel().getSelected();
        if (panel.collapsed){
            lore.ore.ui.loreInfo("Please expand the properties panel and select a property");
        } else if (sel){
            var splitprop =  sel.data.name.split(":");
            var infoMsg = "<p style='font-weight:bold;font-size:130%'>" + sel.data.name + "</p><p style='font-size:110%;margin:5px;'>" 
            + sel.data.value + "</p>";
            if (splitprop.length > 1){
                var ns = lore.constants.NAMESPACES[splitprop[0]];
                infoMsg += "<p>This property is defined in " 
                        + "<a style='text-decoration:underline' href='#' onclick='lore.global.util.launchTab(\"" 
                        + ns + "\");'>" + ns + "</a></p>";
            }
            
            Ext.Msg.show({
                    title : 'About ' + sel.data.name,
                    buttons : Ext.MessageBox.OK,
                    msg : infoMsg
                });
        } else {
            lore.ore.ui.loreInfo("Please click on a property prior to selecting the help button");
        }
    },
    // TODO: use MVC
    handlePropertyRemove : function(store, record, index){
        if (this.id == "nodegrid"){
            lore.debug.ore("deleting property " + record.id,record);
            lore.ore.ui.graphicalEditor.getSelectedFigure().unsetProperty(record.id);
        }
    },
    /** update the metadataproperties recorded in the figure for that node */
    handlePropertyChange : function(args) {
        // TODO: MVC: this needs to update the model (and view needs to listen to model)
        // at present this only updates resource/rel properties - also needs to update on compound object
        try{
            if (this.id == "nodegrid"){
                var theval;
                var selfig = lore.ore.ui.graphicalEditor.getSelectedFigure();
                lore.debug.ore("handle property change " + args.record.id + "  to " + args.value + " " + args.originalValue,args);
                if (selfig instanceof lore.ore.ui.graph.ContextmenuConnection){
                    if (args.record.data.name == 'relationship'){ 
                        selfig.setRelationship(
                            lore.ore.getPropertyValue("namespace",lore.ore.ui.nodegrid),args.value);
                    }
                } else { // Resource property
                    if (args.record.data.name == 'resource') {
                        // the URL of the resource has changed
                        if (args.value && args.value != '') {
                            theval = args.value;
                        } else {
                            theval = "about:blank";
                        }
                        if (lore.ore.ui.graphicalEditor.lookup[theval]) {
                            lore.ore.ui.loreWarning("Cannot change resource URL: a node already exists for " + theval);
                            return;
                        } else {
                           lore.ore.ui.graphicalEditor.lookup[theval] = selfig.getId();
                           delete lore.ore.ui.graphicalEditor.lookup[args.originalValue];
                        }
                        if (lore.ore.ui.topView){
                            if (lore.ore.ui.currentURL == theval){
                               lore.ore.ui.topView.hideAddIcon(true);
                            } else if (lore.ore.ui.currentURL == args.originalValue){
                               lore.ore.ui.topView.hideAddIcon(false);
                            }
                        }
                    }
                    selfig.setProperty(args.record.id,args.value);
                }
                lore.ore.ui.nodegrid.store.commitChanges();
                lore.ore.ui.graph.modified = true;
            }
        } catch (e){
            lore.debug.ore("error handling node property change",e);
        }
    }
});
/* Old code:
lore.ore.handleNodePropertyAdd = function(store, records, index){
    lore.debug.ore("added property " + record.id,record);
    // user should only be editing a single record at a time
    // TODO: handle case where node has one record and is selected (triggering add record for existing value)
    if (records.length == 1){
        lore.ore.ui.graphicalEditor.getSelectedFigure().setProperty(records[0].id,records[0].data.value);
    }
};
*/
Ext.reg('propertyeditor',lore.ore.ui.PropertyEditor);