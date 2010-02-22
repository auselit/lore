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

/*	 Timeline UI Definitions */

/**  Replaces default function for generating contents of timeline bubbles
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
			divTime.style.fontSize = 'smaller';
			divTime.style.color = '#aaa';
			elmt.appendChild(divTime);
			
			var divOps = doc.createElement("div");
			divOps.style.paddingTop = '5px';
			var divOpsInner = "<a style='color:orange;font-size:smaller' href='#' " +
			"onclick='lore.anno.ui.annotimeline.getBand(0).closeBubble();lore.anno.ui.handleEditAnnotation(\"" +
			this._eventID +
			"\")'>EDIT</a> | " +
			"<a style='color:orange;font-size:smaller' href='#' " +
			"onclick='lore.anno.ui.annotimeline.getBand(0).closeBubble();lore.anno.ui.handleReplyToAnnotation(\"" +
			this._eventID +
			"\")'>REPLY</a>";
			divOps.innerHTML = divOpsInner;
			elmt.appendChild(divOps);
			
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
 * Create a Timeline visualisation
 */
lore.anno.ui.initTimeline = function() {
	var tl = Ext.getCmp("annotimeline");
	if (typeof Timeline !== "undefined") {
		lore.anno.ui.annoEventSource = new Timeline.DefaultEventSource();
        var theme = Timeline.ClassicTheme.create();
        theme.event.bubble.width = 350;
		var bandConfig = [Timeline.createBandInfo({
							eventSource : lore.anno.ui.annoEventSource,
                            theme: theme,
							width : "90%",
							intervalUnit : Timeline.DateTime.WEEK,
							intervalPixels : 100,
							timeZone : 10,
                            layout: "original"
						}), Timeline.createBandInfo({
							eventSource : lore.anno.ui.annoEventSource,
                            theme: theme,
                            //showEventText:  false,
							width : "10%",
							intervalUnit : Timeline.DateTime.MONTH,
							intervalPixels : 430,
							timeZone : 10,
                            layout: "overview"
						})];
        
		bandConfig[1].syncWith = 0;
		bandConfig[1].highlight = true;
		lore.anno.ui.annotimeline = Timeline.create(document
						.getElementById("annotimeline"), bandConfig, Timeline.HORIZONTAL);
		tl.on("resize", function() {
			lore.anno.ui.scheduleTimelineLayout();
		});
        lore.anno.ui.annotimeline.getBand(0).getEventPainter().setFilterMatcher(function(evt){
            return !(evt._eventID == "flagdelete");
        });
	} else {
        lore.debug.anno("Timeline is undefined",this);
    }
}

/* Timeline Functions */
	
		
		/**
		 * Generate a description for the annotation suitable for display
		 * in the timeline bubble.
		 * @param {Object} anno The annotation to generate the description for
		 * @return {String} A string containing a HTML formatted description of the annotation
		 */		
		lore.anno.ui.getTimelineDescription = function(anno){
			return "<span style='font-size:small;color:#51666b;'>" 
			// lore.global.util.splitTerm(anno.type).term +
			//" by " +
			//anno.creator +
			+ lore.anno.ui.genAnnotationCaption(anno, 't by c') + 
			"</span><br/> " +
			lore.anno.ui.genDescription(anno) +
			"<br />" +
			lore.anno.ui.genTagList(anno);
			
			
		}
		
		/**
		 * Add an annotation to the timeline
		 * @param {Object} anno The annotation to add to the timeline
		 * @param {Object} title The title to give 
		 */
		
		lore.anno.ui.addAnnoToTimeline = function(anno, title){
				// TODO: need to determine what clumps of annotations are close to each other
				// and what the threshold should be then create a Hotzone so that these
				// annotations are displayed more evenly
				
			if (lore.anno.ui.annoEventSource) {
			
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
					
					description: lore.anno.ui.getTimelineDescription(anno)
				});
				
				lore.anno.ui.annoEventSource.add(evt);
				lore.anno.ui.annotimeline.getBand(0).setCenterVisibleDate(evt.getStart());
			}
			
		}
		
		/**
		 * Update an annotation in the timeline
		 * @param {Object} anno Annotation to update
		 */
		lore.anno.ui.updateAnnoInTimeline = function(anno){
			var evt = lore.anno.ui.annoEventSource.getEvent(anno.id);
			if (evt) {
				
				evt._text = anno.title;
				evt._caption = lore.anno.ui.genAnnotationCaption(anno, 't by c');
				evt._description = lore.anno.ui.getTimelineDescription(anno);
				lore.anno.ui.scheduleTimelineLayout();
				
			}
		}
		
		/**
		 * Refresh the timeline.  If the timeline is not visible then the refresh
		 * is scheduled to occur the next time the timeline is made visible
		 */
		lore.anno.ui.scheduleTimelineLayout = function(){
			// Timeline needs to be visible to do layout otherwise it goes blank
			// check if timeline is active tab...
			var tltab = Ext.getCmp("annotimeline");
			var activetab = lore.anno.ui.views.getActiveTab();
			
			if (activetab == tltab) {
				lore.anno.ui.annotimeline.layout();
			}
			else {
				//...if not, do layout on next activation.  Only schedule this once
				if (!lore.anno.ui.scheduleTimelineLayout.once || lore.anno.ui.scheduleTimelineLayout.once == 0) {
					lore.anno.ui.scheduleTimelineLayout.once = 1;
					tltab.on("activate", function(){
						lore.anno.ui.scheduleTimelineLayout.once = 0;
						lore.anno.ui.annotimeline.layout();
					}, this, {
						single: true
					});
				}
				
			}
		}
		
		/**
		 * Activate the annotation timeline tab and show the annotation
		 * in the timeline.
		 * @param {String} annoid The id of the annotation to show
		 */
		lore.anno.ui.showAnnoInTimeline = function(annoid){
			try {
				Ext.getCmp("annotimeline").on("activate",
				function() {
					var band = lore.anno.ui.annotimeline.getBand(0);
					band.closeBubble();
					band.showBubbleForEvent(annoid);
				}, this, {
					single: true
				});
				
				lore.anno.ui.views.activate("annotimeline");
				
				
			} catch (e ) {
				lore.debug.anno("Error showing annotation in timeline: " +e ,e );
			}
		}
		
		
	
				