lore.anno.ui.AnnotationsDataView = Ext.extend(Ext.DataView, {
    initComponent : function() {
        Ext.apply(this, {
            tpl: new Ext.XTemplate(
                '<tpl for=".">',
                '<div class="annoListing" qtip="{title}">',
                    '<div class="annoListingTitle">{title}</div>',
                    '<div class="annoURL">{resource}</div>',
                    '<div class="annoListingMeta">{creator}',
                        ', created {created:date("M j, Y")}',
                        '<tpl if="typeof modified != \'undefined\' && modified != null && modified != \'\'">, last modified {modified:date("M j, Y")}</tpl>',
                    '</div>',
                '</div>',
                '</tpl>'
            ),
            loadingText: "Loading annotations...",
            multiSelect: true,
            autoScroll: true,
            itemSelector: "div.annoListing",
            overClass:'x-view-over',
            emptyText: 'No annotations / annotations loading'
        });
        lore.anno.ui.AnnotationsDataView.superclass.initComponent.apply(this,arguments);

        var contextmenu = new Ext.menu.Menu({
            items: [{
                text: "Add as node/s in Resource Map editor",
                icon: "../../skin/icons/add.png",
                handler: function () {
                    var recs = this.getSelectedRecords();
                    lore.anno.controller.handleAddResultsToCO(recs);
                },
                scope: this
            }, {
                text: "View annotation/s in browser",
                icon: "../../skin/icons/page_go.png",
                handler: function () {
                    var recs = this.getSelectedRecords();
                    lore.anno.controller.handleViewAnnotationInBrowser(recs);
                },
                scope: this
            }/*,
            {
                text: "Delete annotation",
                icon: "../../skin/icons/anno/comment_delete.png",
                handler: function () {
                    var rects = this.getSelectedRecords();
                    // TODO create doDelete method in Controller
                    lore.anno.controller.doDelete(recs);
                },
                scope: this
            }*/
        ]});
        
        this.on('contextmenu', function(scope, rowIndex, node, e) {
            e.preventDefault();
            this.select(node, true);
            contextmenu.showAt(e.xy);
        }, this);
        
        this.on('click', function searchLaunchTab(dv, rowIndex, node, event) {
            try{
            if (!event.ctrlKey && !event.shiftKey) {
                    var record = this.getRecord(node);
                    
                    var ruri = record.get("resource");
                    if (!ruri){ // replies currently don't have annotates field from solr
                        ruri = record.get("id"); // show annotation uri as fallback
                    }
                    if (ruri && ruri.match(lore.anno.prefs.url)){
                            ruri += "?danno_useStylesheet=";
                    }
                    if (ruri){
                        lore.anno.annoMan.justUpdated = record.id;
                        lore.util.launchTab(ruri);
                    }
            }
            } catch (e){
                lore.debug.anno("Error on AnnotationsDataView click",e);
            }
        }, this);
    }
});
Ext.reg('annodataview', lore.anno.ui.AnnotationsDataView);
//Ext.reg('annodataview', 'lore.anno.ui.AnnotationsDataView');
