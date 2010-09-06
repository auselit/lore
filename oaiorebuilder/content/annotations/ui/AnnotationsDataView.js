lore.anno.ui.AnnotationsDataView = Ext.extend(Ext.DataView, {
    initComponent : function() {
        Ext.apply(this, {
            tpl: new Ext.XTemplate(
                '<tpl for=".">',
                '<div class="annoListing">',
                    '<div>{title}</div>',
                    '<div style="padding-left:7px;color:#51666b;font-size:90%">{creator}',
                        ', created {[fm.date(values.created,\'j M Y, g:ia\')]}',
                        '<tpl if="typeof modified != \'undefined\' && modified != null && modified != \'\'">, last modified {[fm.date(values.modified,\'j M Y, g:ia\')]}</tpl>',
                    '</div>',
                '</div>',
                '</tpl>'
            ),
            loadingText: "Loading annotations...",
            singleSelect: true,
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