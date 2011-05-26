lore.anno.ui.AnnotationsDataView = Ext.extend(Ext.DataView, {
    initComponent : function() {
        Ext.apply(this, {
            tpl: new Ext.XTemplate(
                '<tpl for=".">',
                '<div class="annoListing" qtip="{title}">',
                    '<div class="annoListingTitle">{title}</div>',
                    '<div class="annoURL">{resource}</div>',
                    '<div class="annoListingMeta">{creator}',
//                        ', created {[lore.global.util.shortDate(values.created,Date)]}',
                        ', created {created:date("M j, Y")}',
//                        '<tpl if="typeof modified != \'undefined\' && modified != null && modified != \'\'">, last modified {[lore.global.util.shortDate(values.modified,Date)]}</tpl>',
                    '</div>',
                '</div>',
                '</tpl>'
            ),
            loadingText: "Loading annotations...",
            multiSelect: true,
            autoScroll: true,
            itemSelector: "div.annoListing",
            overClass:'x-view-over',
            emptyText: 'No annotations to display'
        });
        lore.anno.ui.AnnotationsDataView.superclass.initComponent.apply(this,arguments);
    }
});
Ext.reg('annodataview', lore.anno.ui.AnnotationsDataView);


// lore.anno.ui.getAnnoTypeIcon(rec.data);
// modified

//Ext.override(Ext.DataView, {
//    setTemplate: function(tpl) {
//        this.tpl = tpl;
//        if (typeof this.tpl == 'string')
//	        this.tpl = new Ext.XTemplate(this.tpl);
//        }
//        this.refresh();
//    }
//);
