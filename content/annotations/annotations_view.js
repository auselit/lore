/*
 * Copyright (C) 2008 - 2009 School of Information Technology and Electrical
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

/*
 * @include  "/oaiorebuilder/content/annotations/annotations.js"
 * @include  "/oaiorebuilder/content/debug.js"
 * @include  "/oaiorebuilder/content/util.js"
 * @include  "/oaiorebuilder/content/uiglobal.js"
 * @include  "/oaiorebuilder/content/constants.js"
 */

var closeIcon = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAABIAAAASABGyWs+AAAACXZwQWcAAAAQAAAAEABcxq3DAAACjklEQVQ4y2XTv2uddRTH8dfzPDf3Po9pjRfSVGKvlUApWEkdEkRxCI4pdAgdYjvrZBEyhFJwyT+QVdAiLqLQNg6Nix10ukoGsYU0Y/OrMdomJqm5ufc+9/k65IehnuWc4ZwPh88578j/I8ZrGRer1CJssNzgAVZQHG+ODosyWtTO89FIYmw48UYtkkZYDvbmOhZ/7rjziC8qLDePq5xCwtBorH6noniSCn93CZslYaMkPO0SFlPhdipcStQThk4fDpf208BoYq5eEbYSYYPwzH/5L8ITwkoi/FQRLiXmMNCFpCA+H/vsZsnYcJt2gXKZclnI831TskwSx4q84+WC3pL+h0H4M/gxxrkPYpffyWkFOmmqMjkpm55WVKuKalU2PS2dnJSkqSjwVs77scs4V0ojF4eC/q6CXWSjo166cUOUZXR3g+zqVaHR0Jyf17p7V6XgQqQ/jQyWqvT1Fcpt5Nit11VmZ3VfuSK7dm3foRDszs7ardePblgtdPXQF8eBKAj5gUBzbc3G1JT20hJRRBRpLy3ZmJrSXFuTHz7C/lwUb7O+STscCOjt1TMxoVSrHZ25VKvpmZigt9fhplu0d1iPd3jwkNUOOiiPjDgxPi5KEtszM7ZnZkRJ4sT4uPLIiBx7WGD1H35PsNnk7Nu824vni4viNNVaXLR6/brte/d09fd7fv++Z7duCe22BXzDV+t8F1XQZOBDvv2U4VfQyDJKJZ2dHZCcPCnkubjR8Ac+59fvGS/zOOngdTbn+G2DwVc5cyrPxa2W6ICsqNXSznPzhK+p/8Anp3m0dRymDA1qF/j4Pcbe5GyVtMBT9uZ5/Au3F/iywsohTEcCL+B8JmWwh1rANkt7+zivvojzv3rjBCvezErGAAAAJXRFWHRjcmVhdGUtZGF0ZQAyMDA4LTEwLTE4VDE4OjQ1OjQ1KzA4OjAwKJpk+wAAACV0RVh0bW9kaWZ5LWRhdGUAMjAwOC0xMC0xOFQxODo0NTo0NSswODowMHcrEs8AAAAASUVORK5CYII=";

/** 
 * Annotations View
 * @namespace
 * @name lore.anno.ui
 */
	
	try {
	
		/*
	 * Initialization
	 */
		// set defaults for page
		lore.anno.ui.colourLookup = new Array("#00FF00", "#FFFF00", "#00FFFF", "#FF00FF", "#FF8000", /*"#80FF00",*/ "#00FF80", "#0080FF", "#8000FF", "#FF0080", "#FFC000", "#C0FF00", "#00FFC0", "#00C0FF", "#C000FF", "#FF00C0", "#FF4000", /*"#40FF00", "#00FF40",*/ "#0040FF", /*"#4000FF",*/ "#FF0040", "#0000FF" /*, "#FF0000",*/);
		
		lore.anno.ui.initPageData = function(){
		
			lore.anno.ui.multiSelAnno = new Array();
			lore.anno.ui.colourForOwner = {};
			lore.anno.ui.colourCount = 0;
			lore.anno.ui.curSelAnno;
			lore.anno.ui.curAnnoMarkers = new Array();
		}
		
		lore.anno.ui.initPageData();
		
		
		
		/**
	 * Setup the event hooks that notify the view functions of store events
	 */
		lore.anno.ui.initModelHandlers = function(){
			var annosourcestreeroot = Ext.getCmp("annosourcestree").getRootNode();
			lore.anno.annods.on({
				"update": {
					fn: lore.anno.ui.updateUIOnUpdate
				},
				"load": {
					fn: lore.anno.ui.updateUI
				},
				"remove": {
					fn: lore.anno.ui.updateUIOnRemove
				},
				"clear": {
					fn: lore.anno.ui.updateUIOnClear
				}//,
			// "datachanged": {fn: lore.anno.ui.updateUIOnRefresh},
			});
		}
		
		
		/*
	 * General functions
	 */
		/** Helper function to create a view displayed in a closeable tab */
		lore.anno.ui.openView = function(/*String*/panelid,/*String*/ paneltitle,/*function*/ activationhandler){
			var tab = Ext.getCmp(panelid);
			if (!tab) {
				tab = lore.anno.ui.views.add({
					'title': paneltitle,
					'id': panelid,
					'autoScroll': true,
					'closable': true
				});
				tab.on("activate", activationhandler);
			}
			tab.show();
		}
		
		/**
	 * Output a message to notification window
	 * @param {String} message Notification message
	 * @param {Object} iconCls CSS Class for notification icon
	 */
		lore.anno.ui.loreMsg = function(message, iconCls){
			if (!lore.anno.ui.loreMsgStack) {
				lore.anno.ui.loreMsgStack = [];
			}
			iconCls = iconCls || '';
			message = '<div class="status-bubble-icon ' + iconCls + '"></div><div class="status-bubble-msg">' + message + "</div>";
			
			lore.anno.ui.loreMsgStack.push(message);
			Ext.Msg.show({
				msg: '',
				modal: false,
				closable: true,
				width: window.innerWidth
			});
			Ext.Msg.updateText(lore.anno.ui.loreMsgStack.join('<br/>'));
			var w = Ext.Msg.getDialog();
			w.setPosition(0, window.innerHeight - w.getBox().height);
			
			window.setTimeout(function(){
				try {
					if (lore.anno.ui.loreMsgStack.length == 1) {
						lore.anno.ui.loreMsgStack.pop();
						Ext.Msg.hide();
					}
					else {
						lore.anno.ui.loreMsgStack.splice(0, 1);
						Ext.Msg.updateText(lore.anno.ui.loreMsgStack.join('<br/>'));
						var w = Ext.Msg.getDialog();
						w.setPosition(0, window.innerHeight - w.getBox().height);
					}
				} 
				catch (e) {
					lore.debug.ui(e, e);
				}
			}, 3000);
			
		}
		
		/**
	 * Output a notification to notification window
	 * @param {String} message Notification message
	 */
		lore.anno.ui.loreInfo = function(message){
			lore.anno.ui.loreMsg(message, 'info-icon');
			lore.global.ui.loreInfo(message);
		}
		
		/**
	 * Output a error message to notification window
	 * @param {String} message Erro message
	 */
		lore.anno.ui.loreError = function(message){
			lore.anno.ui.loreMsg(message, 'error-icon');
			lore.global.ui.loreError(message);
			
		}
		
		/**
	 * Output a warning to notification window
	 * @param {String} message Warning message
	 */
		lore.anno.ui.loreWarning = function(message){
			lore.anno.ui.loreMsg(message, 'warning-icon');
			lore.global.ui.loreWarning(message);
		}
		
		
		/**
	 * Set the default creator for annotations
	 * @param {String} creator The default creator of annotations
	 */
		lore.anno.ui.setdccreator = function(creator){
			lore.defaultCreator = creator;
		}
		
		/**
	 * Set the annotation server URL
	 * @param {String} annoserver The annotation server URL
	 */
		lore.anno.ui.setRepos = function(annoserver){
			lore.anno.annoURL = annoserver; // annotation server
		}
		
		
		/**
	 * Show the annotations view. Update the annotations source list
	 * to match this page
	 */
		lore.anno.ui.show = function(){
			lore.anno.ui.lorevisible = true;
			
			if (lore.anno.ui.currentURL && lore.anno.ui.currentURL != 'about:blank' &&
			lore.anno.ui.currentURL != '' &&
			(!lore.anno.ui.loadedURL || lore.anno.ui.currentURL != lore.anno.ui.loadedURL)) {
				lore.anno.ui.handleLocationChange(lore.anno.ui.currentURL);
			//lore.anno.ui.loadedURL = lore.anno.ui.currentURL; 
			}
		}
		
		/**
	 * Hide the annotations view
	 */
		lore.anno.ui.hide = function(){
			lore.anno.ui.lorevisible = false;
		}
		
		/**
	 * Update GUI elements based off the record passed in
	 * @param {Record} rec Ext Annotation record to base update off of
	 */
		lore.anno.ui.updateUIElements = function(rec){
			// update the highlighted fields colour in the event the creator is changed
			// the colour is identified by the creator's name
			
			if (rec) {
				lore.anno.ui.hideMarker();
				lore.anno.ui.highlightCurrentAnnotation(rec);
			}
			
			if (lore.anno.ui.multiSelAnno.length > 0) {
				// hide then reshow 
				lore.anno.ui.showAllAnnotations();
				lore.anno.ui.showAllAnnotations();
			}
			
		}
		
		/**
	 * Store the annotation that is currently selected in the view
	 * @param {Record} rec Record Currently selected annotation
	 */
		lore.anno.ui.setCurrentAnno = function(rec){
			lore.anno.ui.hideMarker();
			lore.anno.ui.curSelAnno = rec;
		}
		
		lore.anno.ui.getCurrentAnno = function(){
			return lore.anno.ui.curSelAnno;
		}
		
		/**
	 * Generate annotation caption for the given annotation using the formatting
	 * string
	 * @param {Object} anno The annotation to retrieve the information from
	 * @param {String} formatStr Formatting string. The following
	 */
		lore.anno.ui.genAnnotationCaption = function(anno, formatStr){
			var buf = '';
			
			
			for (var i = 0; i < formatStr.length; i++) {
				switch (formatStr[i]) {
					case 't':
						buf += lore.global.util.splitTerm(anno.type).term;
						break;
					case 'c':
						buf += anno.creator
						break;
					case 'd':
						buf += lore.global.util.shortDate(anno.created, Date);
						break;
					case 'D':
						buf += lore.global.util.longDate(anno.created, Date);
						break;
					case 'r':
						var replies = "";
						if (anno.replies) {
							var n = anno.replies.count;
							if (n > 0) {
								replies = " (" + n + (n == 1 ? " reply" : " replies") + ")";
							}
						}
						buf += replies;
						break;
					case '\\':
						if (i < formatStr.length - 1) {
							i++;
							buf += formatStr[i];
						}
						break;
					default:
						buf += formatStr[i];
				}
			}
			
			return buf;
		}
		
		/**
	 * Generate HTML formatted tag list
	 * @param {Object} annodata The annotation to retrieve the tag information from
	 * @return {String} HTML formatted tag list
	 */
		lore.anno.ui.genTagList = function(annodata){
			var bodyText = "";
			if (annodata.tags) {
				bodyText += '<span style="font-size:smaller;color:#51666b">Tags: ';
				var tagarray = annodata.tags.split(',');
				for (var ti = 0; ti < tagarray.length; ti++) {
					var thetag = tagarray[ti];
					if (thetag.indexOf('http://') == 0) {
						try {
							var tagname = thetag;
							Ext.getCmp('tagselector').store.findBy(function(rec){
								if (rec.data.id == thetag) {
									tagname = rec.data.name;
								}
							});
							bodyText += '<a target="_blank" style="color:orange" href="' + thetag + '">' + tagname + '</a>, ';
						} 
						catch (e) {
							lore.debug.anno("unable to find tag name for " + thetag, e);
						}
					}
					else {
						bodyText += thetag + ", ";
					}
				}
				bodyText += "</span>";
			}
			return bodyText;
		}
		
		/**
	 * Retrieve the annotation title
	 * @param {Object} anno The annotation
	 * @return {String} The annotation titile. The default value is 'Untitled'
	 */
		lore.anno.ui.getAnnoTitle = function(anno){
			var title = anno.title;
			if (!title || title == '') {
				title = "Untitled";
			}
			return title;
		}
		
		lore.anno.ui.getAnnoTypeIcon = function(anno){
			var aType = lore.global.util.splitTerm(anno.type).term;
			var icons = {
				'Comment': 'anno-icon',
				'Explanation': 'anno-icon-explanation',
				'VariationAnnotation': 'anno-icon-variation',
				'Question': 'anno-icon-question'
			};
			
			return icons[aType] || 'anno-icon';
		}
		
		/**
	 * Generated a pop up for the given annotation and place the HTML into the
	 * supplied dom container
	 * @param {Object} annodata	The annotation to create the tip for
	 * @param {Object} domContainer An object or an array containing the dom container/s
	 * to insert the pop up HTML into
	 */
		lore.anno.ui.genTipForAnnotation = function(annodata, marker){
			try {
					var doc = marker.target || lore.global.util.getContentWindow(window).document;
					var cw = doc.defaultView;
					var uid = annodata.id;
					var desc = "<div style='color:white;background-color:darkred;width:100%;min-height:18'><strong>" + annodata.title + "</strong></div><span style='font-size:smaller;color:#51666b;'>" + lore.global.util.splitTerm(annodata.type).term +
					" by " +
					annodata.creator +
					"<br />";
					desc += lore.anno.ui.genDescription(annodata, true);
					var d = lore.global.util.longDate(annodata.created, Date);
					desc += "<br /><span style=\"font-size:smaller;color:#aaa\">" + d + "</span></span><br />";
					var descDom = doc.createElement("span");
					descDom.setAttribute("style", "font-family:sans-serif");
					descDom.setAttribute("display", "none");
					
					// innerHTML does not work for pages that are image/... content type, so parse html
					// by temporarily adding to local document head. html has been sanitized.
					var	h=	document.getElementsByTagName("head")[0];
					h.appendChild(descDom); 
					descDom.innerHTML = desc;
					h.removeChild(descDom);
					descDom.removeAttribute("display");

				$(marker.data.nodes[0], doc).simpletip({
					content: descDom,
					focus: true,
					boundryCheck: false,
					position: 'cursor',
					showEffect: 'custom',
					onetip: true,
					closeIcon: closeIcon,
					showCustom: function(){
						try {
							this.context.style.position = 'absolute';
							this.context.style.opacity = "1";
							this.context.style.backgroundColor = "#fcfcfc";
							this.context.style.fontSize = "9pt";
							this.context.style.fontWeight = "normal";
							this.context.style.color = "#51666b";
							this.context.style.border = '1.5px solid darkgrey';
							this.context.style.zIndex = "3";
							this.context.style.fontFamily = 'sans-serif';
							
							$(this.context).find('img').css({
								'max-width': '256',
								'height': 'auto'
							});
							jQuery(this).animate({
								width: 'auto',
								display: 'block'
							}, 400);
						} 
						catch (e) {
							lore.debug.anno("error showing tip: " + e, e);
						}
					}
				});
		}
		catch (ex) {
			lore.debug.anno("Tip creation failure: " + ex, ex);
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
		 * Add an annotation to the timelne
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
				
		/* Form Editor Functions */
		
		/*
		 Can use for debugging purposes when isDirty() is overzealous on the form
		 
		 lore.anno.ui.isDirty = function() {
			 var dirtyList = [];
			 lore.anno.ui.form.items.each( function (item, index, length) {
			 if ( item.isDirty()) {
			 
			 dirtyList.push(item.getName());
			 }
			 });
			 
			 alert("The dirty items are: " + dirtyList.join());
		 }*/
		
		/**
		 * Reject any changes made to the current annotation
		 */
		lore.anno.ui.rejectChanges = function(){
			lore.anno.ui.curSelAnno.reject();
		}
		
		/**
		 * Hide the annotation editor
		 */
		lore.anno.ui.hideAnnotation = function() {
			if ( lore.anno.ui.formpanel.isVisible() ) {
				lore.anno.ui.formpanel.hide();
				Ext.getCmp("treeview").doLayout();
			}
		}
		
		/**
		 * Show the annotation editor. 
		 * @param {Record} rec  The record containing the annotation to show in the editor
		 * @param {Boolean} loadOnly (Optional) Load the annotation data into form fields but don't show editor. Defaults to false.
		 */
		lore.anno.ui.showAnnotation = function(rec, loadOnly){
			try {
				// display contents of context
				if (rec.data.context) {
					
					var ctxtField = lore.anno.ui.form.findField('contextdisp');
					if (rec.data.original == lore.anno.ui.currentURL) {
						var selText = '';
						try {
							selText = lore.global.util.getSelectionText(
							rec.data.context, lore.global.util.getContentWindow(window).document)
						} 
						catch (e) {
						}
						
						lore.anno.ui.form.setValues([{
							id: 'contextdisp',
							value: '"' + selText + '"'
						}]);
					} else if ( !lore.anno.ui.topView.variationContentWindowIsVisible() ){
						lore.anno.ui.updateSplitter(lore.anno.ui.curSelAnno, false); // when content is loaded in splitter
															// context field will be set
					}

					ctxtField.getEl().setStyle("background-color", lore.anno.ui.getCreatorColour(rec.data.creator));
					lore.anno.ui.setVisibilityFormField('contextdisp', false);
					
				}
				else {
					var ctxtField = lore.anno.ui.form.findField('contextdisp');
					lore.anno.ui.form.setValues([{
						id: 'contextdisp',
						value: ""
					}]);
					ctxtField.getEl().setStyle("background-color", "inherit");
				}
				if (rec.data.variantcontext) {
					var vCtxtField = lore.anno.ui.form.findField('rcontextdisp');
					if (rec.data.variant == lore.anno.ui.currentURL) {
						var selText = '';
						try {
							// need to do this while the xpointer library still has emotional problems
							selText = lore.global.util.getSelectionText(
							rec.data.variantcontext, lore.global.util.getContentWindow(window).document)
						} 
						catch (e) {
						}
						lore.anno.ui.form.setValues([{
							id: 'rcontextdisp',
							value: '"' + selText + '"'
						}]);
					} else if ( !lore.anno.ui.topView.variationContentWindowIsVisible() ){
						lore.anno.ui.updateSplitter(lore.anno.ui.curSelAnno, false); // when content is loaded in splitter
															// context field will be set
					}
					vCtxtField.getEl().setStyle("background-color", lore.anno.ui.getCreatorColour(rec.data.creator));
					lore.anno.ui.setVisibilityFormField('rcontextdisp', false);
				}
				else {
					var ctxtField = lore.anno.ui.form.findField('rcontextdisp');
					lore.anno.ui.form.setValues([{
						id: 'rcontextdisp',
						value: ""
					}]);
					ctxtField.getEl().setStyle("background-color", "inherit");
				}
				
				/*if (rec.data.context && rec.data.variantcontext) {
					if ( rec.data.original == rec.data.context)
						url = rec.data.variant;
					else
						url = rec.data.original;
					lore.anno.ui.topView.updateVariationSplitter(ctx, title, true, function(){
						lore.anno.ui.hideMarker();
						lore.anno.ui.highlightCurrentAnnotation(rec);
					});
				}*/
				
				if (!loadOnly) {
					lore.anno.ui.formpanel.show();
					Ext.getCmp("treeview").doLayout();
				}
					lore.anno.ui.form.loadRecord(rec);
					
				
				
				var val = rec.data.resource;
				if (rec.data.isReply) {
					var prec = lore.global.util.findRecordById(lore.anno.annods, rec.data.about);
					
					val = "'" + prec.data.title + "'";
					if (!lore.anno.isNewAnnotation(prec)) {
						val += " ( " + rec.data.about + " )";
					}
				}
				lore.anno.ui.form.setValues([{ id: 'res', value: val }]);
						
				if ( !loadOnly){	
					if (rec.data.isReply) {
						Ext.getCmp("updctxtbtn").hide();
						Ext.getCmp("updrctxtbtn").hide();
							
					}
					else {
						Ext.getCmp("updctxtbtn").show();
					}
				}
				
			} 
			catch (e) {
				lore.debug.anno("Error display annotation: " + e, e);
			}
		}
		
		/**
		 * Show/hide a field on a form
		 * @param {String} fieldName The field name to set the visibility of
		 * @param {Boolean} hide (Optional)Specify whether to hide the field or not. Defaults to false
		 */
		lore.anno.ui.setVisibilityFormField = function(fieldName, hide){
			var thefield = lore.anno.ui.form.findField(fieldName);
			if (thefield) {
				var cont = thefield.container.up('div.x-form-item');
				cont.setDisplayed(false);
				if (hide && cont.isVisible()) {
					cont.slideOut();
					thefield.hide();
				}
				else 
					if (!hide && !cont.isVisible()) {
						thefield.hide();
						cont.slideIn();
						thefield.show();
						cont.setDisplayed(true);
					}
				
			}
		}
		
		/**
		 * Hide list of form fields
		 * @param {Array} fieldNameArr List of fields to hide
		 */
		lore.anno.ui.hideFormFields = function(fieldNameArr){
			for (var i = 0; i < fieldNameArr.length; i++) {
				lore.anno.ui.setVisibilityFormField(fieldNameArr[i], true);
			}
		}
		
		/**
		 * Show list of form fields
		 * @param {Array} fieldNameArr List of fields to show
		 */
		lore.anno.ui.showFormFields = function(fieldNameArr){
			for (var i = 0; i < fieldNameArr.length; i++) {
				lore.anno.ui.setVisibilityFormField(fieldNameArr[i], false);
			}
		}
		
		/**
		 * Show hide fields depending on whether the current annotation is a variation
		 * @param {Boolean} variation Specify whether the annotation is variation annotation or not
		 */
		lore.anno.ui.setAnnotationFormUI = function(variation){
		
			var nonVariationFields = ['res'];
			var variationFields = ['original', 'variant', 'rcontextdisp', 'variationagent', 'variationplace', 'variationdate'];
			if (variation) {
				lore.anno.ui.hideFormFields(nonVariationFields);
				lore.anno.ui.showFormFields(variationFields);
				var isReply = (lore.anno.ui.curSelAnno && lore.anno.ui.curSelAnno.data.isReply);
				if (!isReply) {
					Ext.getCmp('updrctxtbtn').setVisible(true);
				}
			}
			else {
				Ext.getCmp('updrctxtbtn').setVisible(false);
				lore.anno.ui.hideFormFields(variationFields);
				lore.anno.ui.showFormFields(nonVariationFields);
			}
		}
		
		/**
		 * Update the annotation object to use the values from the
		 * form
		 * @param {Record} rec The annotation to update
		 */
		lore.anno.ui.updateAnnoFromRecord = function(rec){
		/*	if (!rec.data.isReply) {
				var resField = lore.anno.ui.form.findField('res');
				if (resField.getValue() != rec.data.resource) {
					rec.data.resource = resField.getValue();
				}
			}*/
			
			lore.anno.ui.form.updateRecord(rec);
			
		}
				
		/** Tree UI Functions */

		
		/**
		 * Generate the tree node text
		 * @param {Object} anno Annotation to generate the node text for
		 */
		lore.anno.ui.genTreeNodeText = function(anno){
		
			return lore.anno.ui.genDescription(lore.anno.getAnnoData(anno.id).data, true);
			
		}
		
				
		
		/**
		 * Create a tree node and insert into the tree. If it's a new annotation then set
		 * inital values.  If it's not a new annotation, add it to the timeline. 
		 * @param {Object} anno  Annotation to add as a tree node
		 * @param {Object} defparent (Optional) The default parent to add the annotation to
		 */
		lore.anno.ui.createAndInsertTreeNode = function(anno, defparent){
			
			var parent = null;
			
			if ( defparent ) {
				parent = defparent;
			}
		
			if ( !parent && anno.isReply) {
				parent = lore.global.util.findChildRecursively(lore.anno.ui.treeroot, 'id', anno.about);				
			} else {
				parent = lore.anno.ui.treeroot;
			}
			
			var tmpNode;
			var nodeLinks = [{title: 'View annotation body in a new window',
							iconCls: 'anno-icon-launchWindow',
							 jscript: "lore.global.util.launchWindow('" + anno.bodyURL + "',false, window);"},
							
							 { title: 'View annotation in the timeline',
							 	iconCls: 'anno-icon-timeline',
							 jscript: "lore.anno.ui.showAnnoInTimeline('" + anno.id + "');"}
							  ];
			
			var iCls = lore.anno.ui.getAnnoTypeIcon(anno);
				  
			if (lore.anno.isNewAnnotation(anno)) {
				
				tmpNode = new lore.anno.ui.LOREColumnTreeNode ( {
					id: anno.id,
					nodeType: anno.type,
					title: lore.anno.ui.getAnnoTitle(anno),
					text: anno.body || '',
					iconCls: iCls,
					uiProvider: lore.anno.ui.LOREColumnTreeNodeUI,
					// links: nodeLinks,
					qtip:  lore.anno.ui.genAnnotationCaption(anno, 't by c, d')
				});
				
				parent.appendChild(tmpNode);
				
			}
			else {
				if (lore.global.util.splitTerm(anno.type).term == 'VariationAnnotation' ) {
					nodeLinks.push({ title: 'Show Variation Window',
									 iconCls:'anno-icon-splitter', 
									 jscript: "lore.anno.ui.showSplitter('" + anno.id + "');"});
				}
				
				var args = {
					id: anno.id,
					nodeType: anno.type,
					text: lore.anno.ui.genTreeNodeText(anno),
					title: anno.title,
					bheader: lore.anno.ui.genAnnotationCaption(anno, 'by c, d r'),
					iconCls: iCls,
					uiProvider: lore.anno.ui.LOREColumnTreeNodeUI,
					links: nodeLinks,
					qtip: lore.anno.ui.genAnnotationCaption(anno, 't by c, d')
				};
				
				tmpNode = new lore.anno.ui.LOREColumnTreeNode (args );
				
				parent.appendChild(tmpNode);
  			    lore.anno.ui.addAnnoToTimeline(anno, lore.anno.ui.getAnnoTitle(anno));
				
			}
			lore.anno.ui.attachAnnoCtxMenuEvents(tmpNode);
			
			return tmpNode;
			
		}
		
		/**
		 * Attach context menu events to a tree node
		 * @param {TreeNode} annoNode  The tree node to attach the events to
		 */
		lore.anno.ui.attachAnnoCtxMenuEvents = function(annoNode){
			 annoNode.on('contextmenu', function(node, ev){
			 	node.select();
			 });
			 
			 
			 annoNode.on('contextmenu', function(node, e){
			 	if (!node.contextmenu) {
				 node.contextmenu = new Ext.menu.Menu({
				 id: node.id + "-context-menu"
			 	});
			 
			 var isNew = lore.anno.isNewAnnotation(lore.global.util.findRecordById(lore.anno.annods, node.id));
			 
				if (!isNew) {
					node.contextmenu.add({
						text: "Show in Timeline",
						handler: function(evt){
							lore.anno.ui.showAnnoInTimeline(node.id);
						}
					});
					node.contextmenu.add({
						text: "Reply to annotation",
						handler: function(evt){
							lore.anno.ui.handleReplyToAnnotation(node.id);
						}
					});
				}
				
								 
				 node.contextmenu.add({
				 text: "Edit annotation",
				 handler: function(evt){
				 	lore.anno.ui.handleEditAnnotation(node.id);
				 }
				 });
	 
	 			if (!isNew) {
					node.contextmenu.add({
						text: "Add as node in compound object editor",
						handler: function(evt){
							try {
                                var rec = lore.global.util.findRecordById(lore.anno.annods, node.id);
								lore.global.ui.compoundObjectView.get(window.instanceId).addFigure(node.id,
                                    {"rdf:type_0":rec.data.type});
							} catch (e ){
								lore.debug.anno("Error adding node to compound editor:" + e, e);
							}
						}
					});
					
					if (node.nodeType == lore.constants.NAMESPACES["vanno"] + "VariationAnnotation") {
						node.contextmenu.add({
							text: "Show Variation Window",
							handler: function(evt){
								lore.anno.ui.showSplitter(node.id);
							}
						});
					}
				}
			 }
	 		node.contextmenu.showAt(e.xy);
	 	});
	 }
	
	
	/**
	 * Generate a description for an annotation
	 * @param {Object} annodata The annotation to generate the description for 
	 * @param {Object} noimglink (Optional) If true, specifies that a link to a new window containing the 
	 * annotation body will not be generated in the description
	 * @return {String} A string containing the annotation description. The string may contain HTML.
	 */	
	lore.anno.ui.genDescription = function(annodata, noimglink){
			var res = "";
			if (!noimglink) {
                res += "<a title='Show annotation body in separate window' xmlns=\"" +
                lore.constants.NAMESPACES["xhtml"] +
                "\" href=\"javascript:lore.global.util.launchWindow('" +
                annodata.bodyURL +
                "',false);\" ><img src='chrome://lore/skin/icons/page_go.png' alt='View annotation body in new window'></a>&nbsp;";
            }
			var defText = annodata.bodyLoaded ? annodata.body : 'Loading content...';
			var body = lore.global.util.externalizeLinks(defText);
			res += body;
			
			
			return res;
		}
		
		/*
	 	* Highlighting functions
	 	*
	 	*/
		
		lore.anno.ui.updateImageData = function (img, doc) {
			var _img = $(img);
			var scale = _img.data("scale");
							
			if ( !scale || scale.imgWidth != _img.width() ||
							scale.imgHeight != _img.height()) {
								// either no scale information stored, or is out of date
								scale = lore.global.util.getImageScaleFactor(_img.get(0), doc );
								_img.data("scale", scale);
							}
			return scale;
		}
		
		lore.anno.ui.scaleImageCoords = function (img, coords, doc) {
			var scale = lore.anno.ui.updateImageData(img, doc); 
			// scale coords ( getting their unscale state if they are already scaled)
			var sx = coords.sx || 1;
			var sy = coords.sy || 1;
			return {
				x1: coords.x1 * sx / scale.x,
				y1: coords.y1 * sy / scale.y,
				x2: coords.x2 * sx / scale.x,
				y2: coords.y2 * sy / scale.y,
				sx: scale.x,
				sy: scale.y
			};
		}
		
		lore.anno.ui.calcImageOffsets = function(img, doc){
			var _img = $(img);
			var _parent = $('body', doc);
			
			// image page offset and parent scroll offset 
			var imgOfs = {
				left: Math.round(_img.offset().left),
				top: Math.round(_img.offset().top)
			};
			var parOfs = $.inArray(_parent.css('position'), ['absolute', 'relative']) + 1 ? {
				left: Math.round(_parent.offset().left) - _parent.scrollLeft(),
				top: Math.round(_parent.offset().top) - _parent.scrollTop()
			} : {
				left: 0,
				top: 0
			};
			
			return {
				left: (imgOfs.left - parOfs.left),
				top: (imgOfs.top - parOfs.top)
			};
		}
		
		lore.anno.ui.Marker = function(args) {
					this.xpointer = lore.global.util.normalizeXPointer(args.xpointer);
					this.target = args.target || lore.global.util.getContentWindow(window).document;
					this.type  = lore.global.util.isXPointerImageRange(this.xpointer) ? 1:0;
					this.visible = false;
					this.bw = args.borderWidth || 1;
					
					this.show = function (colour, styleCallback, scroll) {
						this.colour = colour;
						this.styleCallback = styleCallback;
						
						if ( this.type == 1) {
							if (!this.data) {
								this.data = lore.global.util.parseImageRangeXPointer(this.xpointer, this.target);
							} 
							
							var doc = this.target;
							var _div = $(lore.global.util.domCreate('span', doc));
							var _parent = $('body',doc)
							_parent.append(_div);
							this.data.nodes = [_div.get(0)];
							this.update(); 
							
							if ( scroll )
								lore.global.util.scrollToElement(this.data.nodes[0], this.target.defaultView);
							
						} else {
							var type = this.type;
							var stylin = function(domNode){
									domNode.style.backgroundColor = colour || "yellow";
									if ( styleCallback) styleCallback(type, domNode);
								}
								
							if (!this.data || !this.data.nodes) {
								this.data = {
									range: lore.global.util.getSelectionForXPath(this.xpointer, this.target)
								};
								
								this.data.nodes = lore.global.util.highlightRange(this.data.range, this.target, scroll, stylin);
							} else {
								for (var i=0; i < this.data.nodes.length; i++ ) {
									stylin(this.data.nodes[i]);
								}
							}
						}	
						
						this.visible = true;		
					}

					this.update = function(colour, styleCallback){
						if (this.data.nodes && this.type == 1) {
							
							this.colour = colour || this.colour;
							this.styleCallback = styleCallback || this.styleCallback;
							
							var c = lore.anno.ui.scaleImageCoords(this.data.image, this.data.coords, this.target);
							var o = lore.anno.ui.calcImageOffsets(this.data.image, this.target);
							
							var _n = $(this.data.nodes[0]);
							
							 _n.css({
							 	position: 'absolute',
							 	left: c.x1 + o.left + this.bw,
							 	top: c.y1 + o.top + this.bw,
								border: this.bw + 'px solid ' + this.colour,
								zIndex: _n.parent().css('zIndex')
							 }).width(c.x2 - c.x1 - this.bw*2).height(c.y2-c.y1 - this.bw*2);
							 if ( this.styleCallback) this.styleCallback(this.type, this.data.nodes[0]);
						}
					}
										
					this.hide = function(){
						if (this.data && (this.data.image || this.data.nodes)) {
							var w = lore.global.util.getContentWindow(window);
							if (this.type == 0) {
								for (var i = 0; i < this.data.nodes.length; i++) {
									var n = this.data.nodes[i]; 
									if (n) 
										lore.global.util.removeNodePreserveChildren(n, w);
								}
								this.data = null;
							} else {
								lore.global.util.removeNodePreserveChildren(this.data.nodes[0], w);
							}
						}
						this.visible = false;
					}
			}
			
		/**
		 * Hide the currently selected annotation markers
		 */
		lore.anno.ui.hideMarker = function(){
			try {
				if (lore.anno.ui.curAnnoMarkers) {
					for (var i = 0; i < lore.anno.ui.curAnnoMarkers.length; i++) {
						var m = lore.anno.ui.curAnnoMarkers[i];
						m.hide();
						delete m; 
					}
					lore.anno.ui.curAnnoMarkers = [];
				}
			} 
			catch (ex) {
				lore.debug.anno("hide marker failure: " + ex, ex);
			}
		}
		
		/**
		 * Get a colour based of the creator name.  This is retrieve from a predefined
		 * table of colours.  If there a no colours available from the table, then a
		 * colour is generated.
		 * @param {String} creator Creator name
		 * @return {String} A hexadecimal colour value of the form #RRGGBB 
		 */
		lore.anno.ui.getCreatorColour = function(creator){
			creator = creator.replace(/\s+$/, ""); //rtrim
			var colour = lore.anno.ui.colourForOwner[creator];
			if (!colour) {
				if (lore.anno.ui.colourCount < lore.anno.ui.colourLookup.length) {
					colour = lore.anno.ui.colourLookup[lore.anno.ui.colourCount++];
				}
				else {
					// back up
					colour = lore.global.util.generateColour(196, 196, 196, 240, 240, 240);
				}
				lore.anno.ui.colourForOwner[creator] = colour;
			}
			return colour;
		}
		
		lore.anno.ui.setCurSelImage = function (img) {
				
			lore.anno.ui.curImage = $(img);
			
		}
		
		lore.anno.ui.getCurSelImage = function () {
			return lore.anno.ui.curImage ? lore.anno.ui.curImage.get(0):null;
		}
		
		lore.anno.ui.getCurrentSelection = function(){
			var selxp = lore.global.util.getXPathForSelection(window);
			
			if ( lore.anno.ui.curImage && lore.global.util.trim(selxp) == '' ) {
				var sel = lore.anno.ui.curImage.imgAreaSelectInst().getSelection()
				if (sel.x1 != sel.x2 && sel.y1 != sel.y2) {
					return lore.global.util.getXPathForImageSelection(lore.anno.ui.curImage.get(0), lore.anno.ui.curImage.get(0).ownerDocument, sel, true);
				}
			}

			return selxp;	
		}
		 
	/*
	 * Handlers
	 */
		
		/**
		 * Retrieve the currently selected text and, create a new annotation in
		 * the local store
		 * @param {Record} rec (Optional) The parent annotation record. Defaults to null
		 */
		lore.anno.ui.handleAddAnnotation = function(rec){
			try {
				var currentContext = "";
				
				if (!rec) {
					try {
						currentContext = lore.anno.ui.getCurrentSelection();
					} 
					catch (e) {
						lore.debug.anno("exception creating xpath for new annotation", e);
					}
				}
				
				
				if (rec) {
					lore.anno.addAnnotation(currentContext,  lore.anno.ui.currentURL, rec);
				}
				else {
					if ( lore.anno.ui.rdfa && (lore.anno.ui.rdfa.agent || lore.anno.ui.rdf.work )) {
					var data = [];
					if ( lore.anno.ui.rdfa.agent ) {
						for (var e in lore.anno.ui.rdfa.agent) {
							//data.push([e,'Agent->'])
						}
					}
					
					if ( lore.anno.ui.rdfa.work) {}
					
						var win = new Ext.Window(
						{
							title:'Associate annotation with...',
							width:300,
							items: [
							{
								xtype: 'displayfield',
								value:'This page has embedded information, you can optionally select a field to attach the annotation to.'
							},							
							{
								xtype: "combo",
								id: "rdffield",
								name: 'rdffield',
								hiddenName: 'rdffield',
								store: new Ext.data.SimpleStore({
									fields: ['field', 'fieldname' ],
									data: data
								}),
								valueField: 'field',
								displayField: 'fieldname',
								typeAhead: true,
								emptyText: "None",
								triggerAction: 'all',
								forceSelection: true,
								mode: 'local',
								resizable:true,
								selectOnFocus: true
							}],
							buttons: [
							{ text: 'Ok',
								id: 'addanookbtn',
								handler: function (b,e ) {
									//TODO: change to make context and original and variant fields arrays
									lore.anno.ui.curSelAnno.data.context2 = ''; // genTriplePointer(lsdfklfff)
									win.hide();
									win.destroy();
								}
							}]
						});
						win.show(this);
						
					}
					lore.anno.addAnnotation(currentContext, lore.anno.ui.currentURL);
				}
			} 
			catch (e) {
				lore.debug.anno(e, e);
			}
		}
		
		/**
	 	* Highlight all annotations on the current page
	 	*/
		lore.anno.ui.showAllAnnotations = function(){
		
			if (lore.anno.ui.multiSelAnno.length == 0) {
				// toggle to highlight all
				
				// set text to inherit for select all fields   
				var selAllStyle = function(type, domObj){
					if (type == 0) {
						if (domObj) {
							domObj.style.textDecoration = "inherit";
						}
					} else if ( type == 1) {
						domObj.style.borderStyle = "dashed";
					}
						
					return domObj;
				}
				
				lore.anno.annods.each(function highlightAnnotations(rec){
					if ( rec.data.context ) {
						try {
							var markers = lore.anno.ui.highlightAnnotation(rec, selAllStyle);	
							
							// 'attach' annotation description bubble
							if (markers != null) {
								lore.anno.ui.multiSelAnno = lore.anno.ui.multiSelAnno.concat(markers);
								// create the tip div in the content window
								for ( var i =0 ; i < markers.length;i++)						
									lore.anno.ui.genTipForAnnotation(rec.data, markers[i]);
							}
							else {
								lore.debug.anno("marker null for context: " + rec.data.context, rec);
							}
						} 
						catch (ex) {
							lore.debug.anno("Error during highlight all: " + ex, rec);
						}
					}
					
				});
			}
			else {
				// unhighlight
				lore.debug.anno("Unhighlighting all annotations", lore.anno.ui.multiSelAnno);
				for (var i = 0; i < lore.anno.ui.multiSelAnno.length; i++) {
					try {
						var m = lore.anno.ui.multiSelAnno[i];
						m.hide();
						delete m;
					} 
					catch (ex) {
						lore.debug.anno("Error unhighlighting: " + ex, lore.anno.ui.multiSelAnno[i]);
					}
					
				}
				// clear selection info
				lore.anno.ui.multiSelAnno = new Array();
			}
		}
		
		lore.anno.ui.handleEndImageSelection = function(img, sel) {
			if ((sel.x1 + sel.x2 + sel.y1 + sel.y2) == 0) 
				return;

				lore.anno.ui.setCurSelImage(img);
			 
		}
		
		/**
		 * Reset all changes made to annotation
		 */
		lore.anno.ui.handleCancelAnnotationEdit = function(){
			// reset all annotation form items to empty
			lore.anno.ui.form.items.each(function(item, index, len){
				item.reset();
			});
			
			if (lore.anno.ui.curSelAnno && lore.anno.isNewAnnotation(lore.anno.ui.curSelAnno)) {
				lore.anno.annods.remove(lore.anno.ui.curSelAnno);
			}
		}
		
		/**
		 * Save all annotation changes
		 */		
		lore.anno.ui.handleSaveAllAnnotationChanges = function(){
			try {
				
				if (lore.anno.ui.curSelAnno &&
					(lore.anno.ui.form.isDirty() && 
					lore.anno.ui.form.findField('id').getValue() == lore.anno.ui.curSelAnno.data.id)) {
						lore.anno.ui.updateAnnoFromRecord(lore.anno.ui.curSelAnno);
						//lore.anno.ui.form.updateRecord(lore.anno.ui.curSelAnno);
					
				}
							
				lore.anno.updateAnnotations(lore.anno.ui.currentURL, function(anno, action, result, resultMsg){
					/*if (failures.length == 0) {
				 lore.anno.ui.loreInfo('Saved all annotation changes');
				 }
				 else {
				 lore.anno.ui.loreInfo("Could not update " + failures.length + " annotations.");
				 }
				 lore.debug.anno("Successfully updated " + successes.length + " annotations", successes);
				 lore.debug.anno("Failed to update " + failures.length + " annotations", failures);*/
					try {
						if (result == "success") {
							lore.anno.ui.loreInfo('Annotation ' + action + 'd.');
							lore.debug.anno(action + 'd ' + anno.data.title, anno);
						}
						else {
							lore.anno.ui.loreError('Unable to ' + action + ' annotation');
							lore.debug.anno('Unable to ' + action + ' annotation', resultMsg);
						}
					} 
					catch (e) {
						lore.debug.anno(e, e);
					}
				});
				
			} 
			catch (e) {
				lore.debug.anno(e, e);
			}
		}
		
		/**
		 * Save the currently selected annotation
		 */
		lore.anno.ui.handleSaveAnnotationChanges = function(){
		
			try {
			
				var anno = lore.anno.ui.curSelAnno;
				
				if (!anno) {
					lore.anno.ui.loreError('No annotation selected to save!');
					return;
				}
				
				// update existing annotation
				if (!lore.anno.isNewAnnotation(anno) && !lore.anno.ui.form.isDirty() && !anno.dirty ) {
					lore.anno.ui.loreWarning('Annotation content was not modified, save will not occur.');
					return;
				}
				
				// update anno with properties from form
				lore.anno.ui.updateAnnoFromRecord(anno);
				lore.anno.ui.form.reset(); // clear dirty flag
				lore.anno.updateAnnotation(anno, lore.anno.ui.currentURL, function(action, result, resultMsg){
				
					if (result == "success") {
						lore.anno.ui.loreInfo('Annotation ' + action + 'd.');
						lore.debug.anno(action + 'd ' + anno.data.title, resultMsg);
						
						// maybe need to replace this with firing event that when annotation 
						// is saved or 'cleaned' that UI elements are updated i.e highlight fields
						// are updated ( i.e the colour may change as it's based of creator name),
						// the annotation summary window needs to be updated etc.
						lore.anno.ui.updateUIElements(anno);
					}
					else {
						lore.anno.ui.loreError('Unable to ' + action + ' annotation');
						lore.debug.anno('Unable to ' + action + ' annotation', resultMsg);
					}
				});
				
				
				
			} 
			catch (e) {
				lore.debug.anno("Error updating saving annotation: " + e, e);
			}
		}
		
		
		/**
		 * Delete the currently selected annotation
		 */
		lore.anno.ui.handleDeleteAnnotation = function (){
	       if (lore.anno.ui.curSelAnno) {
		   	
	       	var msg = 'Are you sure you want to delete this annotation forever?';
	       	if ( lore.anno.hasChildren(lore.anno.ui.curSelAnno) ) {
	       		//msg = "Are you sure you want to delete this annotation and its REPLIES forever?";
				lore.anno.ui.loreError("Delete the replies for this annotation first.");
				return;
	       	}
		   	Ext.MessageBox.show({
		   	
		   		title: 'Delete annotation',
		   		msg: msg,
		   		buttons: Ext.MessageBox.YESNO,
		   		fn: function(btn){
		   			if (btn == 'yes') 
		   				lore.anno.ui.handleDeleteAnnotation2();
		   		},
		   		icon: Ext.Msg.QUESTION
		   	});
		   }
	    }
		
		lore.anno.ui.handleDeleteAnnotation2 = function(){
			try {
				lore.debug.anno("deleting " + lore.anno.ui.curSelAnno);
				
				lore.anno.deleteAnnotation(lore.anno.ui.curSelAnno, function(result, resultMsg){
					if (result == 'success') {
						lore.debug.anno('Annotation deleted', resultMsg);
						lore.anno.ui.loreInfo('Annotation deleted');
					}
					else {
					
						lore.anno.ui.loreError('Unable to delete annotation');
					}
				});
				
				lore.anno.ui.hideAnnotation();
				lore.anno.ui.setCurrentAnno(null);
			} 
			catch (ex) {
				lore.debug.anno("Exception when deleting annotation", ex);
				lore.anno.ui.loreWarning("Unable to delete annotation");
			}
		}
		
		
		/**
		 * Search the annotation respository for the given filters on the search
		 * forms and display results in grid
		 */
		lore.anno.ui.handleSearchAnnotations = function () {
			
			var searchParams = { 
							  'creator':  lore.constants.DANNO_RESTRICT_CREATOR,
		 					  'datecreatedafter': lore.constants.DANNO_RESTRICT_AFTER_CREATED,
							  'datecreatedbefore': lore.constants.DANNO_RESTRICT_BEFORE_CREATED,
							  'datemodafter': 	lore.constants.DANNO_RESTRICT_AFTER_MODIFIED,
							  'datemodbefore': 	lore.constants.DANNO_RESTRICT_BEFORE_MODIFIED};
							  
			
			try {
				var vals = lore.anno.ui.sform.getValues();
				lore.debug.anno("vals: " + vals, vals);
				var filters = [];
				for (var e in vals) {
					var v = vals[e];
					
					if (v && e != 'url') {
						v = lore.anno.ui.sform.findField(e).getValue()
						if (e.indexOf('date') == 0) {
						//	v = v.format("Y-m-d");
							v = v.format("c");
						}
						filters.push({
							attribute: searchParams[e],
							filter: v
						});
					}
				}
				lore.anno.ui.loreInfo("Searching...");
				lore.anno.searchAnnotations(vals['url']!='' ? vals['url']:null, filters, function(result, resp){
	 				lore.debug.anno("result from search: " + result, resp);
					lore.anno.ui.loreInfo("Search Finished");
					
					Ext.getCmp("annosearchgrid").doLayout();
	 			});
			} catch (e) {
				lore.debug.anno("error occurring performing search annotations: " +e, e);
			}
			
		}
		
		/**
		 * Update the annotation xpath context
		 * @param {Object} btn Not currently used
		 * @param {Object} e Not currently used
		 */
		lore.anno.ui.handleUpdateAnnotationContext = function(){
			try {
				if (!lore.anno.ui.formpanel.isVisible())
					 lore.anno.ui.showAnnotation(lore.anno.ui.curSelAnno);
				var currentCtxt = lore.anno.ui.getCurrentSelection();
				var theField = lore.anno.ui.form.findField('context');
				theField.setValue(currentCtxt);
				theField = lore.anno.ui.form.findField('originalcontext');
				theField.setValue(currentCtxt);
				theField = lore.anno.ui.form.findField('res');
				theField.setValue(lore.anno.ui.currentURL);
				if ( lore.anno.ui.curSelAnno)
					lore.anno.ui.curSelAnno.data.resource = lore.anno.ui.currentURL;
				theField = lore.anno.ui.form.findField('original');
				theField.setValue(lore.anno.ui.currentURL);
				theField = lore.anno.ui.form.findField('contextdisp');
				theField.setValue('"' + lore.global.util.getSelectionText(currentCtxt, lore.global.util.getContentWindow(window).document) + '"');
			} 
			catch (ex) {
				lore.debug.anno("Exception updating anno context", ex);
			}
		}
		/**
		 * Update the variation annotation xpath context
		 * @param {Object} btn Not currently used
		 * @param {Object} e Not currently used
		 */
		lore.anno.ui.handleUpdateAnnotationVariantContext = function(btn, e){
			try {
				var currentCtxt = lore.anno.ui.getCurrentSelection();
				var theField = lore.anno.ui.form.findField('variantcontext');
				theField.setValue(currentCtxt);
				theField = lore.anno.ui.form.findField('variant');
				theField.setValue(lore.anno.ui.currentURL);
				theField = lore.anno.ui.form.findField('rcontextdisp');
				theField.setValue('"' + lore.global.util.getSelectionText(currentCtxt, lore.global.util.getContentWindow(window).document) + '"');
			} 
			catch (ex) {
				lore.debug.anno("Exception updating anno variant context", ex);
			}
		}
		
		/**
		 * Update the form when the annotation type changes
		 * @param {Combo} combo The Combo field that has changed
		 */
		lore.anno.ui.handleAnnotationTypeChange = function(combo){
			var theVal = combo.getValue();
			
			if ( theVal == 'Variation'){
				lore.anno.ui.setAnnotationFormUI(true);
			}
			else if (theVal == 'Question' ||  theVal == 'Comment' || theVal == 'Explanation' ) {
					lore.anno.ui.setAnnotationFormUI(false);
			}
			
		}
		
		
		
		/**
		 * Launch field value in a new window
		 * @param {Field} field Form field to launch in a new window
		 */
		lore.anno.ui.launchFieldWindow = function(field){
			lore.global.util.launchWindow(field.value, true, window);
		}
		
		
		
		/**
		 * Show the variation splitter for the current/supplied annotation
		 * @param {Record} rec (Optional)The annotation to show in the splitter window. Defaults to currently
		 * selected annotation
		 */
		lore.anno.ui.showSplitter = function (rec) {
			if (!rec) {
				rec = lore.anno.ui.curSelAnno;
			} else if ( typeof(rec) == 'string') {
				rec = lore.global.util.findRecordById(lore.anno.annods, rec);
			}
			lore.anno.ui.updateSplitter(rec, true);
		}
		
		/**
		 * Update the variation splitter for the supplied annotation
		 * @param {Record} rec The annotation to update in the splitter window. 
		 * @param {Boolean} show Specifies whether the variation window is to be made visible
		 */
		lore.anno.ui.updateSplitter =  function (rec, show) {
						
			try {
				
				if (rec.data.variant) {
					// show splitter
					var ctx = null;
					var title = '';
					if (rec.data.original == lore.anno.ui.currentURL) {
						ctx = rec.data.variant;
						title = "Variation Resource";
					}
					else {
						ctx = rec.data.original;
						title = "Original Resource";
					}
					
					lore.anno.ui.topView.updateVariationSplitter(ctx, title, show, function(){
						// when page has loaded perform the following
						lore.anno.ui.hideMarker();
						var cw = lore.anno.ui.topView.getVariationContentWindow();
						//lore.anno.ui.enableImageHighlightingForPage(cw);
						lore.anno.ui.highlightCurrentAnnotation(rec);

						var n = 'rcontextdisp';
						var ctx = rec.data.variantcontext;
						if (rec.data.variant == lore.anno.ui.currentURL) {
							n = 'contextdisp';
							ctx = rec.data.context;
						}
						
						var selText = '';
						try {
							selText = lore.global.util.getSelectionText(ctx, cw.document);
						} 
						catch (e) {
							lore.debug.anno(e,e);
						}
						lore.anno.ui.form.setValues([{
							id: n,
							value: '"' + selText + '"'
						}]);
					});
				}
			} catch (e ) {
				lore.debug.anno(e, e);
			}
		}
	
		/**
		 * Notification function called when a load operation occurs in the store.
		 * This is called when annotations are loaded in bulk from the server or when
		 * an individual annotation was added by a user.  Adds one or more nodes to the
		 * tree
		 * @param {Store} store The data store that created the notification
		 * @param {Array} records The list of records that have been added to the store
		 * @param {Object} options Not used
		 */
		lore.anno.ui.updateUI = function(store, records, options){
			
			try {
				// add
				if (records.length == 1 && lore.anno.isNewAnnotation(records[0])) {
					lore.debug.anno("updateUI() - add", records);
					var rec = records[0];
					var node;
					
					node = lore.anno.ui.createAndInsertTreeNode(rec.data);
						
					// update the currently selected annotation before the focus is taken off it
					// for the newly created annotation
					if (lore.anno.ui.curSelAnno &&
						((lore.anno.ui.form.isDirty()||
							lore.anno.isNewAnnotation(lore.anno.ui.curSelAnno)) && 
							lore.anno.ui.form.findField('id').getValue() == lore.anno.ui.curSelAnno.data.id)) {
							lore.anno.ui.updateAnnoFromRecord(lore.anno.ui.curSelAnno);
					}
					
					if (!lore.anno.ui.formpanel.isVisible()) {
					
						lore.anno.ui.formpanel.show();
					}
					lore.anno.ui.showAnnotation(rec);
				
					node.ensureVisible();
					lore.anno.ui.setCurrentAnno(rec);
					
					node.select();
					
				}
				else {
					lore.debug.anno("updateUI() - load", records);
					for (var i = 0; i < records.length; i++) {
						var rec = records[i];
						var anno = rec.data;
						try {
							lore.anno.ui.createAndInsertTreeNode(anno);
						} 
						catch (e) {
							lore.debug.anno("error loading: " + rec.id, e);
						}
					}
					
					lore.anno.ui.scheduleTimelineLayout();
					lore.anno.ui.updateUIElements();
				}
				
				if (!lore.anno.ui.treeroot.isExpanded()) {
					lore.anno.ui.treeroot.expand();
				}
				
			} 
			catch (e) {
				lore.debug.ui("Error loading annotation tree view: " + e, e);
			}
		}
		
		/**
		 * Notification function called when a clear operation occurs in the store.
		 * Clears the tree.
		 * @param {Store} store The data store that performed the notification
		 */
		lore.anno.ui.updateUIOnClear = function(store) {
			var tree = lore.anno.ui.treeroot.getOwnerTree();
			lore.anno.ui.treeroot = new Ext.tree.TreeNode({});
			tree.setRootNode(lore.anno.ui.treeroot);
			lore.anno.ui.annoEventSource.clear();
		}
		
		lore.anno.ui.updateUIOnRefresh = function (store) {
			lore.anno.ui.updateUIOnClear(store);
			lore.anno.ui.updateUI(store, store.getRange());
		}
		
		lore.anno.ui.handleSortTypeChange = function (combo, rec, index) {
			//lore.anno.ui.addTreeSorter(rec.data.type, rec.data.direction);
			
			lore.anno.ui.treesorter.sortField = rec.data.type;
			lore.anno.ui.treesorter.direction  = rec.data.direction;
			try {
				lore.anno.ui.updateUIOnRefresh(lore.anno.annods);
			} catch (e ) {
				lore.debug.anno("Error occurred changing sort type: " + e,e);
			}
		}
		
		lore.anno.ui.addTreeSorter = function(field, direction){
			var tree = 	Ext.getCmp("annosourcestree");
			lore.anno.ui.treesorter = {};
			lore.anno.ui.treesorter.sortField  = field;
			lore.anno.ui.treesorter.direction = direction;
			
			// taken from TreeSorter Ext, and modified so that
			// direction can be dynamically changed
			var sortType =  function(node){
					try {
						var r = lore.global.util.findRecordById(lore.anno.annods, node.id);
						if (r) {
							return r.data[lore.anno.ui.treesorter.sortField] || r.data.created;
						}
					} 
					catch (e) {
						lore.debug.anno(e, e);
					}
					return "";
				}
				
			var sortFn = function(n1, n2){
       		 	if(n1.attributes["leaf"] && !n2.attributes["leaf"]){
	            	    return 1;
	          	  }
	           	 if(!n1.attributes["leaf"] && n2.attributes["leaf"]){
	           	     return -1;
	            }
      	  	
	    		var v1 = sortType(n1).toUpperCase();
	    		var v2 = sortType(n2).toUpperCase() ;
				var dsc = lore.anno.ui.treesorter.direction == 'desc';
	    		if(v1 < v2){
					return dsc ? +1 : -1;
				}else if(v1 > v2){
				return dsc ? -1 : +1;
	       		 }else{
		    		return 0;
	       	 	}
			 };
			 
			var doSort = function(node){
     		   node.sort(sortFn);
    		}
			var compareNodes = function(n1, n2){
        		return (n1.text.toUpperCase() > n2.text.toUpperCase() ? 1 : -1);
    		}
    
    		var updateSort  = function(tree, node){
        		if(node.childrenRendered){
            		doSort.defer(1, this, [node]);
        		}
    		}
			tree.on("beforechildrenrendered", doSort, this);
   			tree.on("append", updateSort, this);
    		tree.on("insert", updateSort, this);
    
	};

  	/**
		 * Notification function  called when a remove operation occurs in the store.
		 * Removes a node from the tree and the timeline.
		 * @param {Store} store The data store that performed the notification
		 * @param {Record} rec  The record for the annotation that has been removed
		 * @param {Integer} index Not used
		 */
		lore.anno.ui.updateUIOnRemove = function(store, rec, index){
			try {
				var node = lore.global.util.findChildRecursively(lore.anno.ui.treeroot, 'id', rec.data.id);
				if (node) {
					node.remove();
				}
				
				if (!lore.anno.isNewAnnotation(rec)) {
				
					// remove from timeline
					
					var evt = lore.anno.ui.annoEventSource.getEvent(rec.data.id);
					if (evt) {
						evt._eventID = "flagdelete";
						lore.anno.ui.scheduleTimelineLayout();
					}
				}
			} 
			catch (e) {
				lore.debug.ui("Error removing annotation from tree view: " + e, e);
			}
		}
		
		/**
		 * Notification function called when an update operation occurs in the store
		 * Update the values of a node in tree
		 * @param {Object} store The datastore that perofmred the notification
		 * @param {Object} rec The record of the annotation that has changed
		 * @param {Object} operation The update operation that occurred to the record
		 */
		lore.anno.ui.updateUIOnUpdate = function(store, rec, operation){
			
			try {
				var node = lore.global.util.findChildRecursively(lore.anno.ui.treeroot, 'id', rec.data.id);
				
				if (!node) {
					return;
				}
				
				if (rec.dirty) {
					if (operation == Ext.data.Record.EDIT) {
						node.getUI().addClass("annochanged");
					}
				}
				if ( operation == Ext.data.Record.COMMIT || 
						( operation == Ext.data.Record.REJECT 
						&& !lore.anno.isNewAnnotation(rec)) ) {
						
						node.getUI().removeClass("annochanged");
				}
				
				var info = ' ';
				if (!lore.anno.isNewAnnotation(rec)) {
					info = lore.anno.ui.genAnnotationCaption(rec.data, 'by c, d r')
				}
				else if (lore.anno.isNewAnnotation(rec)) {
					var url = rec.data.resource; 
					if ( url != lore.anno.ui.currentURL) {
						info = "Unsaved annotation from " + url;
					}
				}
				node.setText(rec.data.title, info,'', lore.anno.ui.genTreeNodeText(rec.data));
				lore.anno.ui.updateAnnoInTimeline(rec.data);
				if ( lore.anno.ui.curSelAnno == rec )
					lore.anno.ui.showAnnotation(rec, true);
				
				
			} 
			catch (e) {
				lore.debug.ui("Error updating annotation tree view: " + e, e);
			}
		}
		
		
		/**
		 * Highlight the current annotation 
		 * @param {Record} rec The record of the annoation to highlight 
		 */
		lore.anno.ui.highlightCurrentAnnotation = function(rec){
			if ( lore.anno.ui.curImage) {
				var inst = lore.anno.ui.curImage.imgAreaSelectInst();
				inst.setOptions({show:false,hide:true});
				inst.update();
				
			}
			lore.anno.ui.curAnnoMarkers = lore.anno.ui.highlightAnnotation(rec, lore.anno.ui.setCurAnnoStyle);
		}
	
		lore.anno.ui.setCurAnnoStyle = function(type, domObj){
			
			if (type == 0) {
				domObj.style.textDecoration = "underline";
			}
			else if (type == 1) { 
					domObj.style.borderStyle = 'solid';
			}
			return domObj;
		}
		
		/**
		 * Highlight an annotation.
		 * @param {Record} rec The record of the annotation to highlight
		 * @param {Function} annoStyle a callback which is called once the dom node is created for the selection.
		 * The dom node is passed in as a parameter to the callback.
		 */	
		lore.anno.ui.highlightAnnotation = function(rec, annoStyle) {
			
			var markers = [];
			
			
			
			// regular non variant case for highlighting
			if (rec.data.context && rec.data.resource == lore.anno.ui.currentURL &&
				rec.data.type!= lore.constants.NAMESPACES["vanno"] + "VariationAnnotation")  {
					try {
						markers.push(new lore.anno.ui.Marker({xpointer:rec.data.context}));
					} 
					catch (e) {
						lore.debug.anno(e, e);
					}
			} else 	{
			
				if (rec.data.original == lore.anno.ui.currentURL) {
					try {
						if ( rec.data.context) markers.push(new lore.anno.ui.Marker({xpointer:rec.data.context}));
					} 
					catch (e) {
						lore.debug.anno("Error highlighting variation context: " + e, e);
					}
					var cw = lore.anno.ui.topView.getVariationContentWindow();
					if (rec.data.variantcontext && lore.anno.ui.topView.variationContentWindowIsVisible() && cw.location == rec.data.variant) {
						try {
							markers.push(new lore.anno.ui.Marker({xpointer:rec.data.variantcontext, target:cw.document}));
						} 
						catch (e) {
							lore.debug.anno(e, e);
						}
						
					}
				}
				if ( rec.data.variant == lore.anno.ui.currentURL) {
					try {
						if ( rec.data.variantcontext ) markers.push(new lore.anno.ui.Marker({xpointer:rec.data.variantcontext}));
					} 
					catch (e) {
						lore.debug.anno("Error highlighting variation context: " + e, e);
					}
					var cw = lore.anno.ui.topView.getVariationContentWindow();
					if (rec.data.context && lore.anno.ui.topView.variationContentWindowIsVisible() && cw.location == rec.data.original) {
						try {
							markers.push(new lore.anno.ui.Marker({xpointer:rec.data.context, target:cw.document}));
						} 
						catch (e) {
							lore.debug.anno("Error highlighting variation context: " + e, e);
						}
					}
				}
			}
			
			for ( var i=0; i < markers.length;i++) {
				markers[i].show(lore.anno.ui.getCreatorColour(rec.data.creator), annoStyle, true);
				lore.anno.ui.genTipForAnnotation(rec.data, markers[i]);
			}
			return markers;
				
		}
		
		/**
		 * When an annotation is selected in the tree this function is called. The annotation
		 * is loaded into the form. It is highlighted on the current content window's document and if
		 * it's a variation annotation the splitter is shown
		 * @param {Node} node The tree node that was selected
		 * @param {Object} event Not Used
		 */
		lore.anno.ui.handleAnnotationSelection = function(node, event){
		
			try {
				
				var rec = lore.global.util.findRecordById(lore.anno.annods, node.id);
				
				if ( rec == lore.anno.ui.curSelAnno )
					return;
			
				
				// update annotations grid from form if it's a new annotation
				//lore.anno.ui.hideMarker();
				
				if (lore.anno.ui.curSelAnno &&
				(lore.anno.ui.form.isDirty() ||
				lore.anno.isNewAnnotation(lore.anno.ui.curSelAnno))) {
					lore.anno.ui.updateAnnoFromRecord(lore.anno.ui.curSelAnno);
				}
				
				if (rec == null) { // if they select root element, if it's shown 
					lore.anno.ui.setCurrentAnno(null);
					return;
				}
				
				lore.anno.ui.setCurrentAnno(rec);
				 
				if ( lore.anno.ui.topView.variationContentWindowIsVisible() &&
					 lore.anno.ui.curSelAnno.data.type== lore.constants.NAMESPACES["vanno"] + "VariationAnnotation") {
					 lore.anno.ui.showSplitter();	
				} else {
					lore.anno.ui.highlightCurrentAnnotation(rec);
				}
				
				lore.anno.ui.formpanel.hide();
				Ext.getCmp("treeview").doLayout();
				
			} 
			catch (e) {
				lore.debug.anno("Error occurred highlightling " + e, e);
			}
			
		}
		
		/**
		 * Reply to an annotation. Add the reply to the local store. 
		 * @param {Object} arg (Optional) The parent annotation. A string containing the annotation id or if not supplied defaults
		 * to the currently selected annotation
		 */
		lore.anno.ui.handleReplyToAnnotation = function(arg){
			lore.anno.ui.views.activate('treeview');
			try {
				var rec;
				if (!arg) { //toolbar
					rec = lore.anno.ui.curSelAnno;
					if (!rec)
						return;
				}
				else if (typeof(arg) == 'string') {  // timeline
					rec = lore.global.util.findRecordById(lore.anno.annods, arg);
					if ( rec) lore.anno.ui.setCurrentAnno(rec);//lore.anno.ui.curSelAnno = rec;
				}
					
				if (!rec) {
					lore.debug.anno("Couldn't find record to reply to: " + arg, arg);
					return;
				}
				
				if ( lore.anno.isNewAnnotation(rec) ) {
					lore.anno.ui.loreError("Save the annotation first before replying to it.");
					return;
				}
				lore.anno.ui.handleAddAnnotation(rec);
			} 
			catch (e) {
				lore.debug.anno(e, e);
			}
		}
		
		
		/**
	 	* Load the annoation in the form editor and show the editor.
	 	* @param {Object} annoid (Optional) A string or Annotation object supplying the annotation
	 	* to be editted. Defaults to the currently selected annotation.
	 	*/
		lore.anno.ui.handleEditAnnotation = function(arg){
			lore.anno.ui.views.activate('treeview');
		
			var rec;
			try {
				if (!arg) { // no argument supplied, via the toolbar
					rec = lore.anno.ui.curSelAnno
					if (!rec)
						return;
				}
				else 
					if (typeof(arg) == 'string') { // via timeline
						rec = lore.global.util.findRecordById(lore.anno.annods, arg);
					}
					else { // treenode supplied
						rec = lore.global.util.findRecordById(lore.anno.annods, arg.id);
					}
				
				if (!rec) {
					lore.debug.anno("Couldn't find record to edit: " + arg, arg);
					return;
				}
				var node = lore.global.util.findChildRecursively(lore.anno.ui.treeroot, 'id', rec.data.id);

				if (node) {
					lore.anno.ui.showAnnotation(rec);
					node.ensureVisible();
					node.select();
				}
			}
			catch (e ) {
				lore.debug.anno(e,e);
			}
		}
		
	} catch(e ) {
		alert(e + " " + e.stack);
	}

	/**
	 * Serialize the annotations on the page into the supplied format to a file.  Opens a save as
	 * dialog to allow the user to select the file path.
	 * @param {String} format The format to serialize the annotations into. 'rdf' or 'wordml'.
	 */
	lore.anno.ui.handleSerialize = function (format ) {
		 var fileExtensions = {
	        "rdf": "xml",
	        "wordml": "xml"
	    }
		if ( !format) {
			format = "rdf";
		}
		try {
			if ( lore.anno.ui.curSelAnno) lore.anno.ui.updateAnnoFromRecord(lore.anno.ui.curSelAnno);
			var fobj = lore.global.util.writeFileWithSaveAs("Export Annotations (for current page) as", fileExtensions[format], 
												function(){
													return lore.anno.serialize(format);
												},window);
			if ( fobj) lore.anno.ui.loreInfo("Annotations exported to " + fobj.fname);
		} catch (e ) {
			lore.debug.anno("Error exporting annotations: " + e, e );
			lore.anno.ui.loreError("Error exporting annotations: " + e);
		}
	}
	
	/**
	 * Import annotations from an xml file in RDF format.  Provides an Open Dialog for the user
	 * to supply the file path.
	 */
	lore.anno.ui.handleImportRDF = function () {
		
			var fObj = lore.global.util.loadFileWithOpen("Select Annotations RDF/XML file", {
				desc: "RDF documents",
				filter: "*.rdf"
			}, window);
			
			if (fObj) {
					Ext.MessageBox.show({
		   	
		   		title: 'Import and save annotations?',
		   		msg: "This will import and SAVE the annotations to the server. Do you wish to proceed?",
		   		buttons: Ext.MessageBox.YESNO,
		   		fn: function(btn){
		   			if (btn == 'yes') 
		   				lore.anno.ui.handleImportRDF2(fObj.data);
		   		},
		   		icon: Ext.Msg.QUESTION
		   	});
			}
		
	}
	
	lore.anno.ui.handleImportRDF2 = function(theRDF){
		try {
			var output = function(result, resultMsg){
				if ( result == 'success') {
					lore.anno.ui.loreInfo("Successfully imported all annotations");		
				} else if ( result == 'fail') {
					lore.anno.ui.loreError("Failed to import all annotations: " + resultMsg, resultMsg);
				}
			};
			lore.anno.ui.loreInfo("Importing annotations...");
			lore.anno.importRDF(theRDF, lore.anno.ui.currentURL, output);
		} catch(e) {
			lore.debug.anno("Error importing annotations: " +e, e);
			lore.anno.ui.loreError("Error importing annotations: " + e );
		}
	}
	
	lore.anno.ui.refreshPage = function () {
		lore.debug.anno("page refreshed");
		
		lore.anno.ui.initPageData();
		lore.anno.ui.enableImageHighlightingForPage();
		 
		lore.anno.ui.setCurrentAnno(null);
		
		//TODO: unselect a currently selected node from the tree and make sure curselanno is empty
		
	}
	/**
	 * Notifiation function called when a change in location is detected in the currently
	 * selected tab
	 * @param {String} contextURL The url the currently selected browser tab is now pointing to    
	 */
	lore.anno.ui.handleLocationChange = function(contextURL) {
			var oldurl = lore.anno.ui.currentURL + '';
			lore.anno.ui.currentURL = contextURL;
			if (!lore.anno.ui.initialized ||	!lore.anno.ui.lorevisible)
					return;
				
			var initialLoad = oldurl == lore.anno.ui.currentURL;
						
			lore.debug.anno("handleLocationChange: The uri is " + lore.anno.ui.currentURL);
			
			
			
			if ( !initialLoad ) {
			try{
				lore.debug.anno("Setting/Getting cached annotation page data");
				//TODO: need some de-/serialization function with an array of variable names instead of this
				var update_ds = {
					multiSelAnno: lore.anno.ui.multiSelAnno.slice(),
					colourForOwner: lore.global.util.clone(lore.anno.ui.colourForOwner),
					colourCount: lore.anno.ui.colourCount,
					curSelAnnoId: lore.anno.ui.curSelAnno ? lore.anno.ui.curSelAnno.data.id:null,
					curAnnoMarkers: lore.anno.ui.curAnnoMarkers.slice(),
					curImage: lore.anno.ui.curImage
				};
				
				lore.global.store.set(lore.constants.HIGHLIGHT_STORE, update_ds, oldurl);
				
				// tag any unsaved new annotations for the new page
				lore.anno.annods.each(function(rec){
					if (lore.anno.isNewAnnotation(rec)) {
						var n = lore.global.util.findChildRecursively(lore.anno.ui.treeroot, 'id', rec.data.id);
						if ( n) 
							n.setText(rec.data.title, "Unsaved annotation from " + rec.data.resource, '', lore.anno.ui.genTreeNodeText(rec.data));
						else {
							lore.debug.anno("new annotation not found in tree window. This is incorrect. " + rec.data.id );
						}
					}
				})
				
				if (lore.anno.ui.curSelAnno) {
					if (!lore.anno.isNewAnnotation(lore.anno.ui.curSelAnno)) {
						lore.anno.ui.hideAnnotation();
					}
				}
				
				var ds = lore.global.store.get(lore.constants.HIGHLIGHT_STORE, contextURL);
				if (ds) {
					lore.anno.ui.multiSelAnno = ds.multiSelAnno;
					lore.anno.ui.colourForOwner = ds.colourForOwner;
					lore.anno.ui.colourCount = ds.colourCount
					var curSelAnnoId = ds.curSelAnnoId;
					lore.anno.ui.curAnnoMarkers = ds.curAnnoMarkers;
					lore.anno.ui.curImage = ds.curImage;
					
					var rec = lore.global.util.findRecordById(lore.anno.annods, curSelAnnoId);
					if (rec) {
						lore.anno.ui.curSelAnno = rec;
					}
				} else {
					lore.anno.ui.initPageData();
				}
				
			} catch (e ) {
				lore.debug.anno(e,e);
			}
			
		}else {
					lore.anno.ui.initPageData();
		}
		
		try {
			lore.anno.ui.enableImageHighlightingForPage();
			//lore.anno.ui.gleanRDFa();
			lore.anno.ui.loreInfo("Loading annotations for " + contextURL);
			lore.anno.updateAnnotationsSourceList(contextURL, function(result, resultMsg){
				if (result == 'fail') {
					lore.anno.annods.each(function(rec){
						if (!lore.anno.isNewAnnotation(rec)) {
							lore.anno.annods.remove(rec);
						}
					});
					lore.anno.ui.loreError("Failure loading annotations for page.");
				}
			});
			lore.anno.ui.annoEventSource.clear();
		} catch(e) {
			lore.debug.anno(e,e);
		}
		lore.anno.ui.loadedURL = contextURL;
	}
	

lore.anno.ui.enableImageHighlightingForPage = function(contentWindow){


	var cw = contentWindow ? contentWindow : lore.global.util.getContentWindow(window);
	var doc = cw.document;
	var imgOnly = doc.contentType.indexOf("image") == 0;
	var e = function(){
		try {
			var cw = contentWindow ? contentWindow : lore.global.util.getContentWindow(window);
			var doc = cw.document;
			
			if ($('span#lore_image_highlighting_inserted', doc).size() > 0) {
				lore.debug.anno("page already enabled for image annotations");
				return;
			}
			
			if (doc.getElementsByTagName("head").length == 0) {
				lore.debug.anno("image selection disabled for page.  Either not a HTML page or no <head> element.");
				lore.anno.ui.loreWarning("Image selection disabled for page. Not a valid HTML page.");
				return;
			}
			lore.global.util.injectCSS("content/lib/imgareaselect-deprecated.css", cw);
			
			var im;
			
			if (imgOnly) {
				im = $('img', doc);
				lore.debug.anno("image only", im);
			}
			else 
				im = $('img[offsetWidth!=0]', doc);

			im.each(function(){
				// preload image scale factor
				var scale = lore.anno.ui.updateImageData(this, doc);
				
				// attach image area select handle for image			
				$(this).imgAreaSelect({
					onSelectEnd: lore.anno.ui.handleEndImageSelection,
					onSelectStart: function(){
						var selObj = cw.getSelection();
						selObj.removeAllRanges();
					},
					handles: 'corners',
					imageHeight: scale.origHeight,
					imageWidth: scale.origWidth
				})
			});
			
			var e = lore.global.util.domCreate('span', doc);
			e.id = 'lore_image_highlighting_inserted';
			e.style.display = "none";
			$('body', doc).append(e);
			
			lore.debug.anno("image selection enabled for the page");
			
			var refreshImageMarkers = function(e){
				try {
					var markers = lore.anno.ui.curAnnoMarkers.concat(lore.anno.ui.multiSelAnno);
					var d = this.document || this.ownerDocument;
					for (var i = 0; i < markers.length; i++) {
						var m = markers[i];
						if (m.type == 1 && (m.target == d)) {
							m.update();
						}
					}
					
					im.each(function(){
						
						var inst = $(this).imgAreaSelectInst();
						
						if (inst) {
							// imgarea supports scaling, but it refreshes it scaling
							// in a stupid way, merely calling update will not work
							var s = inst.getSelection();
							inst.setOptions({});
							inst.setSelection(s.x1, s.y1, s.x2, s.y2);
							inst.update();
						}
					});
				} 
				catch (e) {
					lore.debug.anno("error occurred during window resize handler: " + e, e);
				}
			}
			//TODO: need the remove event handlers on page unload
			lore.global.util.getContentWindow(window).addEventListener("resize", refreshImageMarkers, false);
			lore.anno.ui.topView.getVariationContentWindow().addEventListener("resize", refreshImageMarkers, false);
			if (imgOnly) 
				im.click(refreshImageMarkers);
			
			
		} 
		catch (e) {
			lore.debug.anno("error occurred enabling image highlighting: " + e, e);
		}
	};
	var ol = function(){
		cw.removeEventListener("load", ol, true);
		lore.debug.anno("on load image anno handler called");
		e();
		
	}
	
	// case: dom content not loaded
	if ( !doc.body) {
		cw.addEventListener("load", ol, true);
		return;
	}
	
	var im = $('img', doc);

	if (im.size() > 0) {
		var contentLoaded = true;
		if ( imgOnly)
			contentLoaded = im.get(0).offsetWidth != 0;
		else 
			im.each(function () {
					contentLoaded = contentLoaded && this.offsetWidth != null;  
					
			});
			
	 	if (!contentLoaded)  // case: dom content loaded, images aren't
			cw.addEventListener("load", ol, true);
		else 			// case: page already loaded (i.e switching between preloaded tabs)
			e(); 
	}
}

lore.anno.ui.gleanRDFa = function () {	
	try {
		window.setTimeout(function() {lore.anno.ui.gleanAustlitRDFa();
		lore.debug.anno('glean rdfa: ' + lore.anno.ui.rdfa, lore.anno.ui.rdfa);}, 0);		
	}catch (e) {
		lore.debug.anno("Error gleaning potential rdfa from page: " +e , e);
	}
}

lore.anno.ui.gleanAustlitRDFa = function () {
	lore.anno.ui.rdfa = null;
	var agent;
	try {
		
		var cw = lore.global.util.getContentWindow(window);
		var doc = cw.document;
		
		var myrdf = $('body', doc).rdf();
		agent = myrdf.about('<' + decodeURI('http://www.austlit.edu.au' + cw.location.pathname +
		cw.location.search ) +'#me>');
		lore.debug.anno('Agent...');
		agent.each(function(){
			lore.debug.anno(' has ' + this.property + ' value ' + this.value + "(" + typeof(this.value) + ")");
		});
	} catch (e) {
		lore.debug.ui(e,e);
	}
	var work;
	try {
		work = myrdf.about('<http://www.austlit.edu.au' + cw.location.pathname + cw.location.search +
		"#work");
		lore.debug.anno('Work...');
		
		
	}catch (e) {
		lore.debug.ui(e,e);
	}
	
	lore.anno.ui.rdfa =  {
			agent: agent,
			work: work
		};
	 
}
