/*
 * Copyright (C) 2008 - 2010 School of Information Technology and Electrical
 * Engineering, University of Queensland (www.itee.uq.edu.au).
 * 
 * This file is part of LORE. LORE was developed as part of the Aus-e-Lit
 * project.
 * 
 * LORE is free software: you can redistribute it and/or modify it under the
 * terms of the GNU General Public License as published by the Free Software
 * Foundation, either version 3 of the License, or (at your option) any later
 * version.
 * 
 * LORE is distributed in the hope that it will be useful, but WITHOUT ANY
 * WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR
 * A PARTICULAR PURPOSE. See the GNU General Public License for more details.
 * 
 * You should have received a copy of the GNU General Public License along with
 * LORE. If not, see <http://www.gnu.org/licenses/>.
 */


/**  
 * Replaces default function for generating contents of timeline bubbles
 * @param {Object} elmt  dom node that the timeline bubble will be inserted into
 * @param {Object} theme See timeline documentation
 * @param {Object} labeller See timeline documentation
 */
if (typeof Timeline !== "undefined") {
        Timeline.DefaultEventSource.Event.prototype.fillInfoBubble = function(elmt, theme, labeller){
            var doc = elmt.ownerDocument;
            var title = this.getText();
            var link = this.getLink();
            var image = this.getImage();
            
            if (image != null) {
                var img = doc.createElement("img");
                img.src = image;
                
                theme.event.bubble.imageStyler(img);
                elmt.appendChild(img);
            }
            
            var divTitle = doc.createElement("div");
            var textTitle = doc.createTextNode(title);
            if (link != null) {
                var a = doc.createElement("a");
                a.href = link;
                a.appendChild(textTitle);
                divTitle.appendChild(a);
            }
            else {
                divTitle.appendChild(textTitle);
            }
            theme.event.bubble.titleStyler(divTitle);
            elmt.appendChild(divTitle);
            
            var divBody = doc.createElement("div");
            this.fillDescription(divBody);
            theme.event.bubble.bodyStyler(divBody);
            elmt.appendChild(divBody);
            
            var divTime = doc.createElement("div");
            this.fillTime(divTime, labeller);
            divTime.className = 'anno-caption';
            elmt.appendChild(divTime);
            
            var divOps = doc.createElement("div");
            divOps.style.paddingTop = '5px';
            
            var divOpsInner = "<a class='timeline-link' href='#' " +
            "onclick='try{lore.anno.ui.handleEditTimeline(\"" +
            this._eventID +
            "\")} catch(e){lore.debug.anno(\"e:\"+e,e);}'>EDIT</a> | " +
            "<a class='timeline-link' href='#' " +
            "onclick='lore.anno.ui.handleReplyToAnnotation(\"" +
            this._eventID +
            "\")'>REPLY</a>";
            divOps.innerHTML = divOpsInner;
            elmt.appendChild(divOps);
            elmt.className = 'timeline-bubble';
            var annoid = this._eventID;
            var node = lore.global.util.findChildRecursively(lore.anno.ui.treeroot, 'id', annoid);
            if ( node) {
                node.select();
            } else {
                lore.debug.anno("Could not select node for :" + annoid, annoid); 
            }
                                    
        };
};


/**
 * Object that provides a timeline of the annotations
 * @class lore.anno.ui.TimelinePanel
 * @extends Ext.Container
 */
lore.anno.ui.TimelinePanel = Ext.extend(Ext.Container, {

	/**
	 * @constructor
	 */
	initComponent: function(){
      	  	try {				
				lore.anno.ui.TimelinePanel.superclass.initComponent.apply(this, arguments);
				if ( this.model )
					 this.addModel(this.model);
					
				
			} catch(e){
				lore.debug.anno("TimelinePanel:initComponent() - " + e, e);
			}
		},
		
		/**
		 * Attach event handlers to the model supplied
		 * @param {Store} model Datastore to attach events to
		 */
		addModel: function (model ) {
			this.model = model;
			this.model.on('load', this.handleLoad, this);
			this.model.on('remove', this.handleRemove, this);
			this.model.on('update', this.handleUpdate, this);
			this.model.on('clear', this.handleClear, this);
			
			
		},
		
		/**
		 * When annotations are loaded, add them to the timeline
		 * @param {Store} store	Datastore
		 * @param {Array} records	The records that were added
		 * @param {Object} options	Load options
		 */
		handleLoad : function(store, records, options ) {
			for ( var i =0; i < records.length; i++ ) {
				if ( !records[i].data.isNew() &&
					this.initialized) {
						this.addAnnoToTimeline(records[i].data,  lore.anno.ui.getAnnoTitle(records[i].data) );						
					}
			}
			this.scheduleTimelineLayout();
		},
		
		/**
		 * When an annotation is removed from the store, flag the item in the
		 * timeline as deleted
		 * @param {Store} store the datastore
		 * @param {rec} rec the record that was removed
		 * @param {ind} ind the index in the store of the record
		 */
		handleRemove: function(store, rec, ind ) {
			
			if (!rec.data.isNew()) {
					var evt = this.annoEventSource.getEvent(rec.data.id);
					if (evt) {
						evt._eventID = "flagdelete";
						this.scheduleTimelineLayout();
					}
				}
		},
		
		/**
		 * When an annotation record is updated, update the annotation in the timeline
		* @param {Store} store the datastore
		 * @param {rec} rec the record that was updated
		 * @param {Object} operation
		 */
		handleUpdate: function(store, rec, operation) {
			this.updateAnnoInTimeline(rec.data);
		},
		
		/**
		 * When store is cleared, remove all annotations from timeline.
		 * @param {Store} store the store
		 */
		handleClear: function(store) {
			this.annoEventSource.clear();
		},
	
		/**
 		* Create a Timeline visualisation
		 */
		initTimeline : function() {	
			var tl = this;
			
			if (typeof Timeline !== "undefined") {
				this.annoEventSource = new Timeline.DefaultEventSource();
		        var theme = Timeline.ClassicTheme.create();
		        theme.event.bubble.width = 350;
				var bandConfig = [Timeline.createBandInfo({
					eventSource : this.annoEventSource,
                    theme: theme,
					width : "90%",
					intervalUnit : Timeline.DateTime.WEEK,
					intervalPixels : 100,
					timeZone : 10,
                    layout: "original"
				}), Timeline.createBandInfo({
					eventSource : this.annoEventSource,
                    theme: theme,
					width : "10%",
					intervalUnit : Timeline.DateTime.MONTH,
					intervalPixels : 200,
					timeZone : 10,
                    layout: "overview"
				})];
        		
        		// Scrollbars are not useful for this component
				this.getEl().setStyle("overflow", "hidden");
				
				bandConfig[1].syncWith = 0;
				bandConfig[1].highlight = true;
				this.timeline = Timeline.create(this.getEl().dom, bandConfig, Timeline.HORIZONTAL);
				var t = this;
				tl.on("resize", function() {
					t.scheduleTimelineLayout(); // recalc display
				});
				
		        this.timeline.getBand(0).getEventPainter().setFilterMatcher(function(evt){
		            return !(evt._eventID == "flagdelete");
		        });
				this.initialized = true;
		} else {
  	      lore.debug.anno("Timeline is undefined",this);
  	  }
	},
	
		/**
		 * Add an annotation to the timeline
		 * @param {Annotation} anno The annotation to add to the timeline
		 * @param {String} title The title to give 
		 */
		
		addAnnoToTimeline : function(anno, title){
				// TODO: #192 - need to determine what clumps of annotations are close to each other
				// and what the threshold should be then create a Hotzone so that these
				// annotations are displayed more evenly
				
			if (this.annoEventSource) {
			
				var annoicon = "comment.png";
				
				if (anno.isReply) {
					annoicon = "comments.png";
				}
				
				var dateEvent = new Date();
				
				dateEvent = Date.parseDate(anno.created, "c");
				
				var evt = new Timeline.DefaultEventSource.Event({
					instant: true,
					
					icon: "chrome://lore/skin/icons/" + annoicon,
					
					start: dateEvent,
					
					text: title,
					
					id: anno.id,
					
					eventID: anno.id,
					
					description: this.getTimelineDescription(anno)
				});
				
				this.annoEventSource.add(evt);
				this.timeline.getBand(0).setCenterVisibleDate(evt.getStart());
			}
			
		},
		
		/**
		 * Refresh the timeline.  If the timeline is not visible then the refresh
		 * is scheduled to occur the next time the timeline is made visible
		 */
		scheduleTimelineLayout : function(){
			// Timeline needs to be visible to do layout otherwise it goes blank
			// check if timeline is active tab
			var tabbed = this.ownerCt.initialConfig.xtype == 'tabpanel';
			
			if ( tabbed ) {
				var activetab = this.ownerCt.getActiveTab();
				if (activetab == this ) {
					this.timeline.layout();
				}
				else {
					//...if not, do layout on next activation.  Only schedule this once
					if (!this.once || this.once == 0) {
						this.once = 1;
						this.on("activate", function(){
							this.once = 0;
							this.timeline.layout();
						}, this, {
							single: true
						});
					}
					
				}
			} else {
				this.timeline.layout();
			}
		},
		
		/**
		 * Activate the annotation timeline tab and show the annotation
		 * in the timeline.
		 * @param {String} annoid The id of the annotation to show
		 */
		showAnnoInTimeline : function(annoid){
			try {
				if (this.ownerCt.initialConfig.xtype == 'tabpanel') {
					this.on("activate", function(){
						var band = this.timeline.getBand(0);
						band.closeBubble();
						band.showBubbleForEvent(annoid);
					}, this, {
						single: true
					});
					this.ownerCt.activate(this.id);
				} else {
						var band = this.timeline.getBand(0);
						band.closeBubble();
						band.showBubbleForEvent(annoid);

				}
				
				
			} catch (e ) {
				lore.debug.anno("Error showing annotation in timeline: " +e ,e );
			}
		},
		
		/**
		 * Update an annotation in the timeline
		 * @param {Object} anno Annotation to update
		 */
		updateAnnoInTimeline : function(anno){
			var evt = this.annoEventSource.getEvent(anno.id);
			if (evt) {
				
				evt._text = anno.title;
				evt._caption = lore.anno.ui.genAnnotationCaption(anno, 't by c');
				evt._description = this.getTimelineDescription(anno);
				this.scheduleTimelineLayout();
				
			}
		},
		
		/**
		 * Generate a description for the annotation suitable for display
		 * in the timeline bubble.
		 * @param {Object} anno The annotation to generate the description for
		 * @return {String} A string containing a HTML formatted description of the annotation
		 */		
		 getTimelineDescription : function(anno){
			return "<span class='anno-caption'>" 
			// lore.global.util.splitTerm(anno.type).term +
			//" by " +
			//anno.creator +
			+ lore.anno.ui.genAnnotationCaption(anno, 't by c') + 
			"</span><br/> " +
			lore.anno.ui.genDescription(anno) +
			"<br />" +
			lore.anno.ui.genTagList(anno);
			
			
		} 

});
 

// register component with Ext
Ext.reg("annotimelinepanel",lore.anno.ui.TimelinePanel)	;				