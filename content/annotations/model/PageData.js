lore.anno.ui.PageData = Ext.extend(Ext.util.Observable, {
    
   /** @constructor */
    constructor: function (config){
		this.clear();
		this.addEvents("annochanged");
	},
		
	store : function(url){
		var update_ds = {
			multiSelAnno: this.multiSelAnno.slice(),
			colourForOwner: lore.global.util.clone(this.colourForOwner),
			colourCount: this.colourCount,
			curSelAnnoId: this.curSelAnno ? this.curSelAnno.data.id : null,
			curAnnoMarkers: this.curAnnoMarkers.slice(),
			curImage: this.curImage,
			rdfa: lore.global.util.clone(this.rdfa),
			metaSelections: this.metaSelections.slice(),
		};
		
		lore.global.store.set(lore.constants.HIGHLIGHT_STORE, update_ds, url);
	},
	
	clear : function () {
		this.multiSelAnno = new Array();
		this.colourForOwner = {};
		this.colourCount = 0;
		this.curSelAnno;
		this.curAnnoMarkers = new Array();
		this.rdfa = {};
		this.metaSelections = [];
	},
	
	load : function(url, clear){
		var ds = lore.global.store.get(lore.constants.HIGHLIGHT_STORE, url);
		if (ds) {
			this.multiSelAnno = ds.multiSelAnno;
			this.colourForOwner = ds.colourForOwner;
			this.colourCount = ds.colourCount
			var curSelAnnoId = ds.curSelAnnoId;
			this.curAnnoMarkers = ds.curAnnoMarkers;
			this.curImage = ds.curImage;
			this.rdfa = ds.rdfa;
			this.metaSelections = ds.metaSelections;
			
			//TODO: should find unsaved version first?
			var rec = lore.global.util.findRecordById(lore.anno.annods, curSelAnnoId);
			if (rec) {
				this.curSelAnno = rec;
			}
		} else if ( clear)
			this.clear();
	},
	
	/**
	 * Store the annotation that is currently selected in the view
	 * @param {Record} rec Record Currently selected annotation
	 */
	setCurrentAnno : function(rec, store){
		var old = this.curSelAnno;
		this.curSelAnno = rec;
		this.curSelAnnoStore = store;
		this.fireEvent("annochanged", old, this.curSelAnno );
	},
	
	getCurrentAnno : function(){
		return this.curSelAnno;
	}
 
});