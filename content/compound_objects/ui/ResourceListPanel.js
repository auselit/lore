Ext.namespace("lore.ore.ui");

/**
 * @class lore.ore.ui.SummaryPanel Display the list of resources aggregated by the Resource Map and allow editing
 * @extends Ext.Panel
 */
lore.ore.ui.ResourceListPanel = Ext.extend(Ext.grid.GridPanel,{
    initComponent: function(){
        try{
            this.defaultCM = new Ext.grid.ColumnModel([
                 new Ext.grid.RowNumberer(),
                 {
                    header: 'Title',
                    dataIndex: 'title',
                    renderer: this.titleRenderFunction
                 },
                 {header: 'URI', dataIndex:'uri', renderer: this.uriRenderFunction}
            ]);
            Ext.apply(this,{
                columnLines : true,
                autoScroll: true, 
                header: false,
                enableHdMenu: false,
                store: new Ext.data.Store({}), 
                ddGroup:'resgridDD',
                enableDragDrop: true, 
                keys: {
                    key: [46,8],
                    scope: this,
                    fn: function(){
                        var sel = this.getSelectionModel().getSelected();
                        if (sel){
                            lore.ore.controller.removeResource(sel.data.uri);
                        } 
                    }
                },
                sm: new Ext.grid.RowSelectionModel({
                    singleSelect:true,
                    listeners: {
                        'rowselect': function(sm,i,rec){        
                            try{                        
                                sm.grid.ddText = rec.data.title + " (" + rec.data.uri + ")";
                                lore.ore.controller.updateSelection(rec.data.uri, this.grid);
                            } catch (e){
                                lore.debug.ore("Error in ResourceListPanel: row select",e);
                            }
                        }
                    }
                }),
                viewConfig: {
                    deferEmptyText: false,
                    emptyText: 'Empty Resource Map',
                    forceFit: true
                }, 
                colModel: this.defaultCM
            });
            
            lore.ore.ui.ResourceListPanel.superclass.initComponent.call(this);
            
            this.on("activate", this.updateContent);                               
            this.on("rowcontextmenu", this.showContextMenu,this);

            this.on("render",function(){
                // enable autoscrolling of list during drag and drop
                Ext.dd.ScrollManager.register(this.getView().getEditorParent())
                // prevent drag and drop if read only
                this.view.dragZone.onBeforeDrag = function(){
                    if (lore.ore.controller.checkReadOnly()){
                        return false;
                    } else {
                        return true;
                    }
                };
            },this);
            this.on("beforedestroy",function(){Ext.dd.ScrollManager.unregister(this.getView().getEditorParent());},this);
        } catch (e){
            lore.debug.ore("Error in ResourceListPanel: init",e);
        }
        
        
    },
    titleRenderFunction: function(val, metaData, rec, rowIndex, colIndex, store){
      var props = rec.get('properties');
      var iconcls = "";
      var hc = "";
      if (props){
        if (rec.get('representsAnno')){
            iconcls = "annoicon";
        } else if (rec.get('representsCO')){
            iconcls = "oreicon";
        } else {
            var dc = lore.constants.NAMESPACES["dc"];
            var dctype = props.getProperty(dc+"type",0);
            iconcls = lore.ore.controller.lookupIcon((dctype? dctype: props.getProperty(dc+"format",0)),dctype);
        }
        var hcProp = rec.get('properties').getProperty(lore.constants.NAMESPACES["layout"] + "highlightColor",0);
        var hcClass;
        if (hcProp){
            hc = hcProp.value;
            if (hc && hc!= "FFFFFF"){
                hcClass=" class='highlightedResource'";
                metaData.attr = "style='background-color:#" + hc + "'";
            } 
        }
      }
      return "<ul><li"   
        + ((iconcls && iconcls != 'pageicon')? " class='remlisticon " + iconcls + "'" : "") 
        + "><span" + (hcClass? hcClass : "") + ">" + (val? val : "Untitled Resource") + "</span></li></ul>";      
    },
    uriRenderFunction: function(val,metaData,rec,rowIndex,colIndex,store){
      var isPlaceholder = rec.get('isPlaceholder');
      if (isPlaceholder){
        return "<span class='orelink'>(placeholder)</span>";
      } else {
        return val;
      }
    },
    /**
     * Sets the Resource Map
     * @param {} co The Resource Map model object
     */
    bindModel: function(){
        if (this.model) {
            this.model.un("add", this.addResourceHandler,this);
            this.model.un("remove", this.removeResourceHandler,this);
        }
        var currentCO = lore.ore.cache.getLoadedCompoundObject();
        var resstore = currentCO.aggregatedResourceStore;
        this.model = resstore;
        this.reconfigure(resstore, this.defaultCM);
        // make sure all loaded resources have an order index starting from 1, no gaps, no duplicates
        // resources have already been sorted by the store according to their loaded order index values
        var orderIndex = 1;
        resstore.each(function (rec){
            rec.set('index',orderIndex++);
        });
        // listen for add/remove events to reorder resources  
        this.model.on("add", this.addResourceHandler, this);
        this.model.on("remove", this.removeResourceHandler, this);
     },
     /** Update layout order index when resources are added  */
     addResourceHandler : function(store, records, idx){
        try{
         var last = store.getTotalCount();
         for (var j = 0; j < records.length; j++){
             var rec = records[j];
             var recIndex = rec.get('index');
             if (typeof recIndex != "undefined" && recIndex != 1000){
                // check if the record has an index, if it does, insert it there and shift other indexes
                store.each(function (r){
                    var oldIndex = r.get('index');
                    if (oldIndex >= recIndex && r != rec){
                        r.set('index', oldIndex + 1);
                    }
                });
             } else {
                // otherwise add it to the end and update record index
                rec.set('index',idx + j + 1);
             }
         }
         store.commitChanges();
        } catch(ex){
            lore.debug.ore("Error in addResourceHandler:",ex);
        }
     },
     /** Update layout order index when a resource is removed */
     removeResourceHandler : function(store, record, idx){       
         var last = store.getTotalCount();
         if (idx != last){ // deleted item was not last in list           
             for (var j = idx; j <= (last - 1); j++){
               // update the orderIndex (add one as orderIndex starts from 1 not 0)
                var r = store.getAt(j);
                r.set('index',j + 1);
                r.commit();         
             }
         }
     },
    /** Temporary function to update selection each time the panel is activated 
     * @param {} p The panel
     */
    updateContent : function (p) {
        if (!p.ddrow) {
            /* Supports resource re-ordering via drag and drop */
            p.ddrow = new Ext.dd.DropTarget(p.getView().scroller.dom, {
                ddGroup : 'resgridDD',             
                copy: false,
                notifyDrop : function(dd, e, data){
                    try{
                        var sm = p.getSelectionModel();
                        var selrows = sm.getSelections();
                        if(dd.getDragData(e)) {
                              var cindex=dd.getDragData(e).rowIndex;
                              if(typeof(cindex) != "undefined") {
                                  //sm.clearSelections();
                                  var rs = p.model;
                                  // This code handles multiple rows selected
                                  // but at present we only allow single selection
                                  for(i = 0; i <  selrows.length; i++) {                  
                                      rs.remove(rs.getById(selrows[i].id));
                                      rs.insert(cindex,selrows[i]);
                                      // select the dragged resource
                                      if (i == 0){
                                          p.selectResource(selrows[i].id);
                                      }
                                  }          
                                 var startidx = Math.min(cindex, data.rowIndex);           
                                 var endidx = rs.getTotalCount() - 1;
                                 if (startidx != endidx){         
                                       for (var j = startidx; j <= endidx; j++){
                                           var r = rs.getAt(j);
                                           // update the orderIndex (add one as orderIndex starts from 1 not 0)
                                           r.set('index',j + 1); 
                                           r.commit();
                                           lore.ore.controller.setDirty();
                                       }
                                 } 
                                 
                               }
                        }
                    } catch (e){
                        lore.debug.ore("Error in ResourceListPanel: notifyDrop",e);
                    }
                 }
              });
        }
        try{
            p.getSelectionModel().clearSelections();
            var sfig = lore.ore.ui.graphicalEditor.getSelectedFigure();
            if (sfig) {
                p.selectResource(sfig.url);
            }
            p.store.sort('index','ASC');
            p.getView().refresh();
            // focus on the grid view to enable key navigation/deletion to work
            if (p.getView().focusEl){
                p.getView().focusEl.focus();
            }
        } catch (e){
            lore.debug.ore("Error in ResourceListPanel: updateContent",e);
        }
    },
    showContextMenu: function(grid, rowIndex, e){
        try{
        var rec = this.store.getAt(rowIndex);
        this.tmpurl = rec.get("uri");
        this.tmpPlaceholder = rec.get("isPlaceholder");
        this.tmpColor = rec.get("properties").getProperty(lore.constants.NAMESPACES["layout"] + "highlightColor",0).value;
        if (!this.contextmenu) {
            this.contextmenu = new Ext.menu.Menu({
                id : this.id + "-context-menu",
                showSeparator: false
            });
            this.contextmenu.add({
                text: "Copy URI to clipboard",
                icon: "../../skin/icons/ore/page_white_paste.png",
                scope: this,
                handler: function(evt){
                    if (!this.tmpPlaceholder){
                       lore.util.copyToClip(this.tmpurl);
                       lore.ore.ui.vp.info("URI copied to clipboard: " + this.tmpurl);
                    } else {
                        lore.ore.ui.vp.info("Cannot copy URI for placeholder");
                    }
                }
             });
            
            this.contextmenu.add({
                text: "Show in browser",
                icon: "../../skin/icons/page_go.png",
                scope: this,
                handler: function(evt){
                    if (!this.tmpPlaceholder){
                       lore.util.launchTab(this.tmpurl, window);
                    } else {
                        lore.ore.ui.vp.info("Cannot show placeholder in browser");
                    }
                }
             });
            
            this.contextmenu.add({
                text: "Delete resource from Resource Map",
                icon: "../../skin/icons/delete.png",
                scope: this,
                handler: function(evt){
                    if (lore.ore.controller.checkReadOnly()){
                        return;
                    }
                    lore.ore.controller.removeResource(this.tmpurl);
                }
            });
            this.contextmenu.add("-");
            this.contextmenu.add({
                text: "Show in Graphical Editor",
                icon: "../../skin/icons/ore/layout_pencil.png",
                scope: this,
                handler: function(evt){
                    lore.ore.ui.graphicalEditor.showResource(this.tmpurl);          
                }
            });
            this.contextmenu.add({
                text: "Show in Details view",
                icon: "../../skin/icons/ore/application_view_detail.png",
                scope: this,
                handler: function(evt){
                    Ext.getCmp("remdetailsview").showResource(this.tmpurl);             
                }
            });
            this.contextmenu.add({
                text: "Show in Slideshow view",
                icon: "../../skin/icons/ore/picture_empty.png",
                scope: this,
                handler: function(evt){         
                    Ext.getCmp("newss").showResource(this.tmpurl);
                }
            });
            this.contextmenu.add({
                text: "Show in Explore view",
                icon: "../../skin/icons/ore/network.png",
                scope: this,
                handler: function(evt){
                    var title = this.tmpurl;
                    var propR = lore.ore.cache.getLoadedCompoundObject().getAggregatedResource(this.tmpurl);
                    if (propR) {
                        title = propR.get('properties').getTitle() || title;
                    }
                    var isCO = propR.get('representsCO');
                    
                    lore.ore.explorePanel.showInExploreView(this.tmpurl, title, isCO);
                }
            });
            this.contextmenu.add("-");
            this.contextmenu.add(
                new Ext.ColorPalette({
                    id: this.id + "palette",
                    //value: this.tmpColor || "FFFFFF",
                    style: {
                      height: '15px',
                      width: '130px'
                    },
                    colors: ["FFFFFF", "FFFF99","CCFFCC","DBEBFF","EFD7FF","FFE5B4","FFDBFB"],
                    handler: function(cp,color){
                        var propData = {
                            id: lore.constants.NAMESPACES["layout"] + "highlightColor", 
                            ns: lore.constants.NAMESPACES["layout"],
                            name: "highlightColor", 
                            value: color, 
                            prefix: "layout"
                        };
                        var propR = lore.ore.cache.getLoadedCompoundObject().getAggregatedResource(this.tmpurl);
                        if (propR) {
                            propR.get('properties').setProperty(propData,0);
                        }
                        lore.ore.controller.setDirty();
                        this.getView().refresh();
                        this.contextmenu.hide();
                    },
                    scope: this
                    
                })
            );
            
        } else {
            var cp = Ext.getCmp(this.id + "palette");
            cp.select(this.tmpColor || "FFFFFF",true);
        }
        this.contextmenu.showAt(e.xy);
        e.stopEvent();
        return false;
        } catch (ex){
            lore.debug.ore("Error in ResourceListPanel: showContextMenu",ex);
        }
    },
    showResource : function(uri){
        Ext.getCmp("loreviews").activate(this.id);
        this.selectResource(uri);
    },
    selectResource: function(uri){
        try{
            var sm = this.getSelectionModel();
            if (!uri){
                sm.clearSelections();
            } else {
                var idx = this.store.findExact('uri',uri);
                var rec = this.store.getAt(idx);
                var selrec = sm.getSelected();
                if (rec && (selrec != rec)){
                    sm.selectRow(idx);
                } 
            }
        } catch (e){
            lore.debug.ore("Error in ResourceListPanel: selectResource " + uri,e);
        }
    }
});
Ext.reg('resourcepanel',lore.ore.ui.ResourceListPanel);