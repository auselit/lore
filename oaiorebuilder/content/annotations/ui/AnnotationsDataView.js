lore.anno.ui.AnnotationsDataView = Ext.extend(Ext.DataView, {
    initComponent : function() {
        Ext.apply(this, {
            tpl: new Ext.XTemplate(
                '<tpl for=".">',
                '<div class="annoListing" qtip="{title}: A tooltip huh?">',
                    '<div class="annoListingTitle">{title}</div>',
                    '<div class="annoURL">{resource}</div>',
                    '<div class="annoListingMeta">{creator}',
                        ', created {[fm.date(values.created,\'j M Y, g:ia\')]}',
                        '<tpl if="typeof modified != \'undefined\' && modified != null && modified != \'\'">, last modified {[fm.date(values.modified,\'j M Y, g:ia\')]}</tpl>',
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
    },
    beforeShow : function(event) {
    	var node = this.eventModel.getNode(event);
    	
    }
});
Ext.reg('annodataview', lore.anno.ui.AnnotationsDataView);


var dragZoneOverrides = {
	containerScroll : true,
	scroll : false,
	getDragData : function(evtObj) {
		var dataView = this.dataView;
		var sourceEl = evtObj.getTarget(dataView.itemSelector, 10);
		
		if (sourceEl) {
			var selectedNodes = dataView.getSelectedNodes();
			var dragDropEl = document.createElement('div');
			
			if (selectedNodes.length < 1) {
				selectedNodes.push(sourceEl);
			}
			
			Ext.each(selectedNodes, function(node) {
				dragDropEl.appendChild(node.cloneNode(true));
			});
			return {
				ddel : dragDropEl,
				repairXY : Ext.fly(sourceEl).getXY(),
				dragRecords : dataView.getSelectedRecords(),
				sourceDataView : dataView
			};
		}
	},
	getRepairXY : function() {
		return this.dragData.repairXY;
	}
}

var AnnotationsDragZoneCfg = Ext.apply({}, {
//    ddGroup : 'annotationsDD',
	dataView: thedataView
});

new Ext.ddDragZone(thedataView.getEl(), AnnotationsDragZoneCfg);

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