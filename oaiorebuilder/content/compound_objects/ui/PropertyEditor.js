lore.ore.ui.PropertyEditor = Ext.extend(Ext.grid.EditorGridPanel,{ 
    initComponent: function(config){
        Ext.apply(this, { 
            clicksToEdit : 1,
            columnLines : true,
            autoHeight : true,
            anchor : "100%",
            //collapsed : true,
            collapsible : true,
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
                        handler : this.handleAddProperty
                    }, {
                        id : 'minus',
                        qtip : 'Remove the selected property',
                        handler : this.handleRemoveProperty
                    }, {
                        id : 'help',
                        qtip : 'Display information about the selected property',
                        handler : this.handleHelpProperty
                    }
            ]
                        
        });
        lore.ore.ui.PropertyEditor.superclass.initComponent.call(this,config);
    },
    /** Handler for plus tool button on property grids 
     * 
     * @param {} ev
     * @param {} toolEl
     * @param {} panel
     */
    handleAddProperty : function (ev, toolEl, panel) {
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
    handleRemoveProperty: function (ev, toolEl, panel) { 
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
    handleHelpProperty : function (ev,toolEl, panel) {
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
    }
});
Ext.reg('propertyeditor',lore.ore.ui.PropertyEditor);