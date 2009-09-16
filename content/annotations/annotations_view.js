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

	try {
		lore.ui.anno.colourLookup = new Array("#00FF00", "#FFFF00", "#00FFFF", "#FF00FF", "#FF8000", /*"#80FF00",*/ "#00FF80", "#0080FF", "#8000FF", "#FF0080", "#FFC000", "#C0FF00", "#00FFC0", "#00C0FF", "#C000FF", "#FF00C0", "#FF4000", /*"#40FF00", "#00FF40",*/ "#0040FF", /*"#4000FF",*/ "#FF0040", "#0000FF" /*, "#FF0000",*/);
		
		lore.ui.anno.multiSelAnno = new Array();
		lore.ui.anno.colourForOwner = {};
		lore.ui.anno.colourCount = 0;
		lore.ui.anno.curSelAnno;
		lore.ui.anno.curAnnoMarkers = new Array();
		
		
	/**
	 * General functions
	 */
	lore.ui.loreMsg = function(message, iconCls){
		if (!lore.ui.loreMsgStack) {
			lore.ui.loreMsgStack = [];
		}
		iconCls = iconCls || '';
		message = '<div class="status-bubble-icon ' + iconCls + '"></div><div class="status-bubble-msg">' + message + "</div>";
		
		lore.ui.loreMsgStack.push(message);
		Ext.Msg.show({
			msg: '',
			modal: false,
			closable: true,
			width: window.innerWidth
		});
		Ext.Msg.updateText(lore.ui.loreMsgStack.join('<br/>'));
		var w = Ext.Msg.getDialog();
		w.setPosition(0, window.innerHeight - w.getBox().height);
		
		window.setTimeout(function(){
			try {
				if (lore.ui.loreMsgStack.length == 1) {
					lore.ui.loreMsgStack.pop();
					Ext.Msg.hide();
				}
				else {
					lore.ui.loreMsgStack.splice(0, 1);
					Ext.Msg.updateText(lore.ui.loreMsgStack.join('<br/>'));
					var w = Ext.Msg.getDialog();
					w.setPosition(0, window.innerHeight - w.getBox().height);
				}
			} 
			catch (e) {
				lore.debug.ui(e, e);
			}
		}, 3000);
		
	}
	
	
	lore.ui.loreInfo = function(message ) {
		lore.ui.loreMsg(message, 'info-icon');
		lore.ui.global.loreInfo(message);
	}
	
	lore.ui.loreError = function(message) {
		lore.ui.loreMsg(message, 'error-icon');
		lore.ui.global.loreError(message);	
		
	}
	lore.ui.loreWarning = function(message) {
		lore.ui..loreMsg(message, 'warning-icon');
		lore.ui.global.loreWarning(message);
	}
	
	
			
	lore.ui.anno.setdccreator = function(creator){
			lore.defaultCreator = creator;
	}
	/**
	 * Set the global variables for the repository access URLs
	 *
	 * @param {}
	 *            rdfrepos The repository access URL
	 * @param {}
	 *            rdfrepostype The type of the repository (eg sesame, fedora)
	 * @param {}
	 *            annoserver The annotation server access URL
	 */
	lore.ui.anno.setRepos = function(annoserver){
		lore.anno.annoURL = annoserver; // annotation server
	}
	
		//loreOpen
	lore.ui.anno.show = function(){
				lore.ui.lorevisible = true;
			
			if (lore.ui.currentURL && lore.ui.currentURL != 'about:blank' &&
			lore.ui.currentURL != '' &&
			(!lore.ui.loadedURL || lore.ui.currentURL != lore.ui.loadedURL)) {
			
				lore.anno.updateAnnotationsSourceList(lore.ui.currentURL);
				lore.ui.loadedURL = lore.ui.currentURL; //TODO: this could be shared code
			}
		}
		
		//loreClose
		lore.ui.anno.hide = function(){
			lore.ui.lorevisible = false;
		}
	
		lore.ui.anno.updateUIElements = function(rec){
			// update the highlighted fields colour in the event the creator is changed
			// the colour is identified by the creator's name
			//lore.ui.anno.updateHighlightFields(lore.ui.anno.curAnnoMarkers, lore.ui.anno.getCreatorColour(rec.data.creator));
			lore.ui.anno.hideMarker();
			lore.ui.anno.highlightCurrentAnnotation(rec);
			
			if (lore.ui.anno.multiSelAnno.length > 0) {
				// hide then reshow 
				lore.ui.anno.showAllAnnotations();
				lore.ui.anno.showAllAnnotations();
			}
			
		}
		
		lore.ui.anno.setCurrentAnno = function (rec) {
			lore.ui.anno.hideMarker();
			lore.ui.anno.curSelAnno = rec;	
		}
		
		
		lore.ui.anno.genAnnotationCaption = function(anno, formatStr){
			var buf = '';
			
			
			for ( var i=0; i < formatStr.length; i++) {
				switch ( formatStr[i]) {
					case 't': 
						buf += lore.util.splitTerm(anno.type).term;
						break;
					case 'c':
						buf += anno.creator
						break;
					case 'd':
						buf += lore.util.shortDate(anno.created);
						break;
					case 'D':
						buf += lore.util.longDate(anno.created);
						break;
					case 'r':
						var replies = "";
						if ( anno.replies) {
							var numreplies = lore.anno.calcNumReplies(anno);
							if (numreplies > 0) {
								replies = " (" + numreplies + (numreplies == 1 ? " reply" : " replies") + ")";
							}
						}
						buf += replies;
						break;
					case '\\':
						if ( i < formatStr.length -1 ) {
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
		
		lore.ui.anno.getAnnoTitle = function(anno){
			var title = anno.title;
			if (!title || title == '') {
				title = "Untitled";
			}
			return title;
		}
		
		lore.ui.anno.genTipForAnnotation = function(annodata, domContainer){
			try {
				//TODO: Replace with an existing pop-up library? 
				var uid = annodata.id;
				var obj = document.createElement("span");
				obj.setAttribute("id", uid);
				var desc = "<span style='font-size:smaller;color:#51666b;'>" + lore.util.splitTerm(annodata.type).term +
				" by " +
				annodata.creator +
				"</span><br />";
				desc += lore.ui.anno.genDescription(annodata, true);
				var d = lore.util.longDate(annodata.created);
				desc += "<br /><span style=\"font-size:smaller;color:#aaa>" + d + "</span><br />";
				obj.innerHTML = desc;
				
				
				var doc = lore.util.getContentWindow().document;
				var tipContainer = doc.getElementById("tipcontainer");
				
				// create the tip container and import the script onto the page
				// if first time a tip is created			
				if (tipContainer == null) {
					tipContainer = doc.createElement("div");
					tipContainer.id = "tipcontainer";
					tipContainer.style.display = "none";
					
					doc.body.appendChild(tipContainer);
					
					lore.util.injectScript("content/lib/wz_tooltip.js", doc);
					
				}
				
				// add tip to the container
				if (doc.getElementById(uid) == null) {
					tipContainer.appendChild(obj);
				}
				else {
					tipContainer.replaceChild(obj, doc.getElementById(uid));
				}
				
				// set events via DOM so that events are handled in the context of the content window
				// and not the extension
				domContainer.setAttribute("onmouseover", "TagToTip('" + uid +
				"',CLOSEBTN, true, STICKY, true, SHADOW, true, BGCOLOR, '#ffffff', " +
				"BORDERCOLOR, '#51666b', TITLEBGCOLOR, '#cc0000', TITLE,'" +
				annodata.title.replace(/'/g, '&apos;') +
				"');");
				domContainer.setAttribute("onmouseout", "UnTip();");
			} 
			catch (ex) {
				lore.debug.anno("Tip creation failure: " + ex, ex);
			}
		}
		
		/*lore.ui.anno.genPreview = function(annodata){
			var body = lore.ui.anno.replaceImgTag(lore.util.externalizeLinks(annodata.body));
			body = Components.classes["@mozilla.org/feed-unescapehtml;1"].getService(Components.interfaces.nsIScriptableUnescapeHTML).unescape(body);
			
			if (body.length > 67) {
				body = body.substring(0, 67) + "..."
			}
			return body;
		}
		
		lore.ui.anno.replaceImgTag = function(body){
			// TODO: this is a hacky function, not meant to be kept in this format
			var ind = 0;
			while (ind != -1 || ind >= body.length) {
				var ind = body.indexOf("<", ind);
				if (ind != -1) {
					var tmpind = body.indexOf("img", ind);
					if (tmpind == -1) {
						ind = body.indexOf("IMG", ind);
					}
					else {
						ind = tmpind;
					}
					if (ind != -1) {
						body = body.substring(0, ind - 1) + " [image attached] " + body.substring(body.indexOf(">", ind) + 1);
						ind = ind + " [image attached] ".length;
					}
				}
			}
			return body;
		}*/
		
		
		
		
		/** Timeline Functions **/
		
		lore.ui.anno.getTimelineDescription = function(anno){
			return "<span style='font-size:small;color:#51666b;'>" 
			// lore.util.splitTerm(anno.type).term +
			//" by " +
			//anno.creator +
			+ lore.ui.anno.genAnnotationCaption(anno, 't by c') + 
			"</span><br/> " +
			lore.ui.anno.genDescription(anno) +
			"<br />" +
			lore.anno.genTagList(anno);
			
			
		}
		
		lore.ui.anno.addAnnoToTimeline = function(anno, title){
				// TODO: need to determine what clumps of annotations are close to each other
				// and what the threshold should be then, should create a Hotzone so that these
				// annotations are displayed more evenly
				
			if (lore.ui.anno.annoEventSource) {
			
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
					
					description: lore.ui.anno.getTimelineDescription(anno)
				});
				
				
				lore.ui.anno.annoEventSource.add(evt);
				lore.ui.anno.annotimeline.getBand(0).setCenterVisibleDate(evt.getStart());
			}
			
		}
		
		lore.ui.anno.updateAnnoInTimeline = function(anno){
			var evt = lore.ui.anno.annoEventSource.getEvent(anno.id);
			if (evt) {
				evt.text = anno.title;
				evt.caption = lore.ui.anno.genAnnotationCaption(anno, 't by c');
				evt.description = lore.ui.anno.getTimelineDescription(anno);
				lore.ui.anno.scheduleTimelineLayout();
			}
		}
		
		lore.ui.anno.scheduleTimelineLayout = function(){
			// Timeline needs to be visible to do layout otherwise it goes blank
			// check if timeline is active tab, if not, do layout on next activation
			
			
			var tltab = Ext.getCmp("annotimeline");
			var activetab = Ext.getCmp("annotationstab").getActiveTab();
			if (activetab == tltab) {
				lore.ui.anno.annotimeline.layout();
			}
			else {
				if (!lore.ui.anno.scheduleTimelineLayout.once || lore.ui.anno.scheduleTimelineLayout.once == 0) {
					lore.ui.anno.scheduleTimelineLayout.once = 1;
					tltab.on("activate", function(){
						lore.ui.anno.scheduleTimelineLayout.once = 0;
						lore.ui.anno.annotimeline.layout();
					}, this, {
						single: true
					});
				}
				
			}
		}
		
		
		lore.ui.anno.showAnnoInTimeline = function(annoid){
			try {
				Ext.getCmp("annotimeline").on("activate",
				function() {
					var band = lore.ui.anno.annotimeline.getBand(0);
					band.closeBubble();
					band.showBubbleForEvent(annoid);
				}, this, {
					single: true
				});
				
				lore.ui.anno.views.activate("annotimeline");
				
				
			} catch (e ) {
				lore.debug.anno("Error showing annotation in timeline: " +e ,e );
			}
		}
				
		/** Form Editor Functions */
		
		/*
		 Can use for debugging purposes when isDirty() is overzealous on the form
		 
		 lore.ui.anno.isDirty = function() {
		 var dirtyList = [];
		 lore.ui.annotationsform.items.each( function (item, index, length) {
		 if ( item.isDirty()) {
		 
		 dirtyList.push(item.getName());
		 }
		 });
		 
		 alert("The dirty items are: " + dirtyList.join());
		 
		 }*/
		
		lore.ui.anno.rejectChanges = function(){
			lore.ui.anno.curSelAnno.reject();
		}
		
		lore.ui.anno.hideAnnotation = function() {
			if ( lore.ui.annotationsformpanel.isVisible() ) {
				lore.ui.annotationsformpanel.hide();
				Ext.getCmp("treeview").doLayout();
			}
		}
		lore.ui.anno.showAnnotation = function(rec, loadOnly){
			try {
				// display contents of context
				if (rec.data.context) {
					var ctxtField = lore.ui.annotationsform.findField('contextdisp');
					var selText = '';
					try {
						selText = lore.util.getSelectionText(rec.data.context) 
					} catch (e ) {
					}
					
					lore.ui.annotationsform.setValues([{
						id: 'contextdisp',
						value: selText
					}]);
					ctxtField.getEl().setStyle("background-color", lore.ui.anno.getCreatorColour(rec.data.creator));
					lore.ui.anno.setVisibilityFormField('contextdisp', false);
				}
				else {
					var ctxtField = lore.ui.annotationsform.findField('contextdisp');
					lore.ui.annotationsform.setValues([{
						id: 'contextdisp',
						value: ""
					}]);
					ctxtField.getEl().setStyle("background-color", "inherit");
				}
				if (rec.data.variantcontext) {
					var vCtxtField = lore.ui.annotationsform.findField('rcontextdisp');
					var selText = '';
					try {
						// need to do this while the xpointer library still has emotional problems
						selText = lore.util.getSelectionText(rec.data.variantcontext) 
					} catch (e ) {
					}
					lore.ui.annotationsform.setValues([{
						id: 'rcontextdisp',
						value: selText
					}]);
					vCtxtField.getEl().setStyle("background-color", lore.ui.anno.getCreatorColour(rec.data.creator));
					lore.ui.anno.setVisibilityFormField('rcontextdisp', false);
				}
				else {
					var ctxtField = lore.ui.annotationsform.findField('rcontextdisp');
					lore.ui.annotationsform.setValues([{
						id: 'rcontextdisp',
						value: ""
					}]);
					ctxtField.getEl().setStyle("background-color", "inherit");
				}
				
				if (!loadOnly) {
					lore.ui.annotationsformpanel.show();
					Ext.getCmp("treeview").doLayout();
				}
					lore.ui.annotationsform.loadRecord(rec);
					
				
				
				var val = rec.data.resource;
				if (rec.data.isReply) {
					var prec = lore.util.findRecordById(lore.anno.annods, rec.data.resource);
					val = "'" + prec.data.title + "'";
					if (!lore.anno.isNewAnnotation(prec)) {
						val += " ( " + rec.data.resource + " )";
					}
				}
				lore.ui.annotationsform.setValues([{ id: 'res', value: val }]);
						
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
		
		lore.ui.anno.setVisibilityFormField = function(fieldName, hide){
			var thefield = lore.ui.annotationsform.findField(fieldName);
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
		lore.ui.anno.hideFormFields = function(fieldNameArr){
			for (var i = 0; i < fieldNameArr.length; i++) {
				lore.ui.anno.setVisibilityFormField(fieldNameArr[i], true);
			}
		}
		lore.ui.anno.showFormFields = function(fieldNameArr){
			for (var i = 0; i < fieldNameArr.length; i++) {
				lore.ui.anno.setVisibilityFormField(fieldNameArr[i], false);
			}
		}
		lore.ui.anno.setAnnotationFormUI = function(variation){
		
			var nonVariationFields = ['res'];
			var variationFields = ['original', 'variant', 'rcontextdisp', 'variationagent', 'variationplace', 'variationdate'];
			if (variation) {
				lore.ui.anno.hideFormFields(nonVariationFields);
				lore.ui.anno.showFormFields(variationFields);
				var isReply = (lore.ui.anno.curSelAnno && lore.ui.anno.curSelAnno.data.isReply);
				if (!isReply) {
					Ext.getCmp('updrctxtbtn').setVisible(true);
				}
			}
			else {
				Ext.getCmp('updrctxtbtn').setVisible(false);
				lore.ui.anno.hideFormFields(variationFields);
				lore.ui.anno.showFormFields(nonVariationFields);
			}
		}
		
		lore.ui.anno.updateAnnoFromRecord = function(rec){
		/*	if (!rec.data.isReply) {
				var resField = lore.ui.annotationsform.findField('res');
				if (resField.getValue() != rec.data.resource) {
					rec.data.resource = resField.getValue();
				}
			}*/
			
			lore.ui.annotationsform.updateRecord(rec);
			
		}
				
		/** Tree UI Functions */

		
		lore.ui.anno.genTreeNodeText = function(anno){
		
			return lore.ui.anno.genDescription(lore.anno.getAnnoData(anno.id).data, true);
			
		}
		
				
		lore.ui.anno.createAndInsertTreeNode = function(anno, defparent){
			var parent = defparent ? defparent : lore.ui.annotationstreeroot;
			
			var tmpNode;
			var nodeLinks = [{title: 'View annotation body in a new window',
							iconCls: 'anno-icon-launchWindow',
							 jscript: "lore.util.launchWindow('" + anno.bodyURL + "',false);"},
							 { title: 'View annotation in the timeline',
							 	iconCls: 'anno-icon-timeline',
							 jscript: "lore.ui.anno.showAnnoInTimeline('" + anno.id + "');"}
							  ];
							  
			if (lore.anno.isNewAnnotation(anno)) {
				tmpNode = new lore.ui.anno.LOREColumnTreeNode ( {
					id: anno.id,
					nodeType: anno.type,
					title: lore.ui.anno.getAnnoTitle(anno),
					text: '',
					iconCls: 'anno-icon',
					uiProvider: lore.ui.anno.LOREColumnTreeNodeUI,
					links: nodeLinks,
					qtip:  lore.ui.anno.genAnnotationCaption(anno, 't by c, d')
				});
				
				parent.appendChild(tmpNode);
				
			}
			else {
				if (lore.util.splitTerm(anno.type).term == 'VariationAnnotation' ) {
					nodeLinks.push({ title: 'Show Variation Window',
									 iconCls:'anno-icon-splitter', 
									 jscript: "lore.ui.anno.showSplitter('" + anno.id + "');"});
				}
				
				var args = {
					id: anno.id,
					nodeType: anno.type,
					text: lore.ui.anno.genTreeNodeText(anno),
					title: anno.title,
					bheader: lore.ui.anno.genAnnotationCaption(anno, 'by c, d r'),
					iconCls: 'anno-icon',
					uiProvider: lore.ui.anno.LOREColumnTreeNodeUI,
					links: nodeLinks,
					qtip: lore.ui.anno.genAnnotationCaption(anno, 't by c, d')
				};
				
				tmpNode = new lore.ui.anno.LOREColumnTreeNode (args );
				
				if (anno.about) { // reply
					parent = lore.util.findChildRecursively(lore.ui.annotationstreeroot, 'id', anno.about);
					
				}
				
				parent.appendChild(tmpNode);
  			    lore.ui.anno.addAnnoToTimeline(anno, lore.ui.anno.getAnnoTitle(anno));
				
			}
			lore.ui.anno.attachAnnoCtxMenuEvents(tmpNode);
			
			return tmpNode;
			
		}
		
		lore.ui.anno.attachAnnoCtxMenuEvents = function(annoNode){
			 annoNode.on('contextmenu', function(node, ev){
			 	node.select();
			 });
			 
			 
			 annoNode.on('contextmenu', function(node, e){
			 	if (!node.contextmenu) {
				 node.contextmenu = new Ext.menu.Menu({
				 id: node.id + "-context-menu"
			 	});
			 
			 var isNew = lore.anno.isNewAnnotation(lore.util.findRecordById(lore.anno.annods, node.id));
			 
				if (!isNew) {
					node.contextmenu.add({
						text: "Show in Timeline",
						handler: function(evt){
							lore.ui.anno.showAnnoInTimeline(node.id);
						}
					});
					node.contextmenu.add({
						text: "Reply to annotation",
						handler: function(evt){
							lore.ui.anno.handleReplyToAnnotation(node.id);
						}
					});
				}
				
								 
				 node.contextmenu.add({
				 text: "Edit annotation",
				 handler: function(evt){
				 	lore.ui.anno.handleEditAnnotation(node.id);
				 }
				 });
	 
	 			if (!isNew) {
					node.contextmenu.add({
						text: "Add as node in compound object editor",
						handler: function(evt){
							try {
								lore.ui.global.compoundObjectView.addFigure(node.id);
							} catch (e ){
								lore.debug.anno("Error adding node to compound editor:" + e, e);
							}
						}
					});
					
					if (node.nodeType == lore.constants.VARIATION_ANNOTATION_NS + "VariationAnnotation") {
						node.contextmenu.add({
							text: "Show Variation Window",
							handler: function(evt){
								lore.ui.anno.showSplitter(node.id);
							}
						});
					}
				}
			 }
	 		node.contextmenu.showAt(e.xy);
	 	});
	 }
	
		
	lore.ui.anno.genDescription = function(annodata, noimglink){
			var res = "";
			if (!noimglink) {
                res += "<a title='Show annotation body in separate window' xmlns=\"" +
                lore.constants.XHTML_NS +
                "\" href=\"javascript:lore.util.launchWindow('" +
                annodata.bodyURL +
                "',false);\" ><img src='chrome://lore/skin/icons/page_go.png' alt='View annotation body in new window'></a>&nbsp;";
            }
			var body = lore.util.externalizeLinks(annodata.body || '');
			res += body;
			
			
			return res;
		}
		
		/**
	 * Highlighting functions
	 *
	 */
		lore.ui.anno.hideMarker = function(){
			try {
				if (lore.ui.anno.curAnnoMarkers) {
					for (var i = 0; i < lore.ui.anno.curAnnoMarkers.length; i++) {
						lore.ui.anno.hideMarkerFromXP(lore.ui.anno.curAnnoMarkers[i]);
					}
				}
			} 
			catch (ex) {
				lore.debug.anno("hide marker failure: " + ex, ex);
			}
		}
		
		lore.ui.anno.hideMarkerFromXP = function(domObj){
			// this is silly but the parent node disappears
			// in certain circumstances, so can't use this for the moment
			// lore.util.removeNodePreserveChildren(domObj);
			if (domObj) {
				domObj.style.textDecoration = "inherit";
				domObj.style.backgroundColor = "transparent";
				domObj.removeAttribute("onmouseover");
				domObj.removeAttribute("onmouseout");
			}
			
			
		}
		
		lore.ui.anno.getCreatorColour = function(creator){
		
			creator = creator.replace(/\s+$/, ""); //rtrim
			var colour = lore.ui.anno.colourForOwner[creator];
			if (!colour) {
				if (lore.ui.anno.colourCount < lore.ui.anno.colourLookup.length) {
					colour = lore.ui.anno.colourLookup[lore.ui.anno.colourCount++];
				}
				else {
					// back up
					colour = lore.util.generateColour(196, 196, 196, 240, 240, 240);
				}
				lore.ui.anno.colourForOwner[creator] = colour;
			}
			return colour;
		}
		
		lore.ui.anno.highlightAnnotation = function(currentCtxt, colour, extraStyle, contentWindow){
			if (currentCtxt) {
				var idx, marker = null;
				// lore.debug.anno("highlighting annotation context: " + currentCtxt, currentCtxt);
				if (!contentWindow) {
					contentWindow = lore.util.getContentWindow();
				}
				var domObj = lore.util.highlightXPointer(currentCtxt, contentWindow.document, true, colour);
				if (domObj && extraStyle) {
				
					domObj = extraStyle(domObj);
				}
				return domObj;
				
			}
			else {
				return null;
			}
		}
		
		
		lore.ui.anno.updateHighlightFields = function(fields, colour){
			if (fields) {
				if (fields.length) {
					for (var i = 0; i < fields.length; i++) {
						fields[i].style.backgroundColor = colour;
					}
				}
				else {
					fields.style.backgroundColor = colour;
				}
			}
		}
		
		lore.ui.anno.setCurAnnoStyle = function(domObj){
			domObj.style.textDecoration = "underline";
			return domObj;
		}
		

	/**
	 * Handlers
	 */
		/** 
	 * Create a new annotation which
	 * @param {} annoid
	 */
		lore.ui.anno.handleAddAnnotation = function(rec){
			try {
				var currentContext = "";
				
				if (!rec) {
				try {
					currentContext = lore.util.getXPathForSelection();
				} 
				catch (e) {
					lore.debug.anno("exception creating xpath for new annotation", e);
				}
				}
				
				
				
				if (rec) {
					lore.anno.addAnnotation(currentContext, rec);
				
				}
				else {
					lore.anno.addAnnotation(currentContext);
				}
			} 
			catch (e) {
				lore.debug.anno(e, e);
			}
			
		}
		
		/**
	 * Highlight all annotations on the current page
	 */
		lore.ui.anno.showAllAnnotations = function(){
		
			if (lore.ui.anno.multiSelAnno.length == 0) {
				// toggle to highlight all
				
				// set text to inherit for select all fields   
				var selAllStyle = function(domObj){
					if (domObj) {
						domObj.style.textDecoration = "inherit";
					}
					return domObj;
				}
				
				lore.anno.annods.each(function highlightAnnotations(rec){
					if (rec.data.context) {
						try {
							var domContainer = lore.ui.anno.highlightAnnotation(lore.util.normalizeXPointer(rec.data.context), lore.ui.anno.getCreatorColour(rec.data.creator), selAllStyle);
							// 'attach' annotation description bubble
							if (domContainer != null) {
								lore.ui.anno.multiSelAnno.push(domContainer);
								// create the tip div in the content window						
								lore.ui.anno.genTipForAnnotation(rec.data, domContainer);
							}
							else {
								lore.debug.anno("domContainer null for context: " + rec.data.context, rec);
							}
						} 
						catch (ex) {
							lore.debug.anno("Error during highlight all: " + ex, rec);
						}
					}
					
					if (rec.data.variantcontext) {
						try {
							var domContainer = lore.ui.anno.highlightAnnotation(lore.util.normalizeXPointer(rec.data.variantcontext), lore.ui.anno.getCreatorColour(rec.data.creator), selAllStyle);
							if (domContainer) {
								lore.ui.anno.multiSelAnno.push(domContainer);
								// create the tip div in the content window						
								lore.ui.anno.genTipForAnnotation(rec.data, domContainer);
							}
						} 
						catch (ex) {
							lore.debug.anno("Error during highlight all for variant: " + ex, rec);
						}
					}
				});
			}
			else {
				// unhighlight
				lore.debug.anno("Unhighlighting all annotations", lore.ui.anno.multiSelAnno);
				for (var i = 0; i < lore.ui.anno.multiSelAnno.length; i++) {
					try {
						lore.ui.anno.hideMarkerFromXP(lore.ui.anno.multiSelAnno[i]);
					} 
					catch (ex) {
						lore.debug.anno("Error unhighlighting: " + ex, lore.ui.anno.multiSelAnno[i]);
					}
					
				}
				// clear selection info
				lore.ui.anno.multiSelAnno = new Array();
			}
		}
		
		lore.ui.anno.handleCancelAnnotationEdit = function(){
			// reset all annotation form items to empty
			lore.ui.annotationsform.items.each(function(item, index, len){
				item.reset();
			});
			
			if (lore.ui.anno.curSelAnno && lore.anno.isNewAnnotation(lore.ui.anno.curSelAnno)) {
				lore.anno.annods.remove(lore.ui.anno.curSelAnno);
			}
		}
		
		lore.ui.anno.handleSaveAllAnnotationChanges = function(){
			try {
				
				if (lore.ui.anno.curSelAnno &&
					(lore.ui.annotationsform.isDirty() && 
					lore.ui.annotationsform.findField('id').getValue() == lore.ui.anno.curSelAnno.data.id)) {
						lore.ui.anno.updateAnnoFromRecord(lore.ui.anno.curSelAnno);
						//lore.ui.annotationsform.updateRecord(lore.ui.anno.curSelAnno);
					
				}
							
				lore.anno.updateAnnotations(function(anno, action, result, resultMsg){
					/*if (failures.length == 0) {
				 lore.ui.loreInfo('Saved all annotation changes');
				 }
				 else {
				 lore.ui.loreInfo("Could not update " + failures.length + " annotations.");
				 }
				 lore.debug.anno("Successfully updated " + successes.length + " annotations", successes);
				 lore.debug.anno("Failed to update " + failures.length + " annotations", failures);*/
					try {
						if (result == "success") {
							lore.ui.loreInfo('Annotation ' + action + 'd.');
							lore.debug.anno(action + 'd ' + anno.data.title, anno);
						}
						else {
							lore.ui.loreError('Unable to ' + action + ' annotation');
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
		
		lore.ui.anno.handleSaveAnnotationChanges = function(){
		
			try {
			
				var anno = lore.ui.anno.curSelAnno;
				
				if (!anno) {
					lore.ui.loreError('No annotation selected to save!');
					return;
				}
				
				// update existing annotation
				if (!lore.ui.annotationsform.isDirty() && !anno.dirty) {
					lore.ui.loreWarning('Annotation content was not modified, save will not occur.');
					return;
				}
				
				// update anno with properties from form
				lore.ui.anno.updateAnnoFromRecord(anno);
				lore.ui.annotationsform.reset(); // clear dirty flag
				lore.anno.updateAnnotation(anno, function(action, result, resultMsg){
				
					if (result == "success") {
						lore.ui.loreInfo('Annotation ' + action + 'd.');
						lore.debug.anno(action + 'd ' + anno.data.title, anno);
					}
					else {
						lore.ui.loreError('Unable to ' + action + ' annotation');
						lore.debug.anno('Unable to ' + action + ' annotation', resultMsg);
					}
				});
				
				
				// maybe need to replace this with firing event that when annotation 
				// is saved or 'cleaned' that UI elements are updated i.e highlight fields
				// are updated ( i.e the colour may change as it's based of creator name),
				// the annotation summary window needs to be updated etc.
				lore.ui.anno.updateUIElements(anno);
			} 
			catch (e) {
				lore.debug.anno("Error updating saving annotation: " + e, e);
			}
		}
		
		
		lore.ui.anno.deleteMsgBoxShow = function (){
	       if (lore.ui.anno.curSelAnno) {
		   	Ext.MessageBox.show({
		   		title: 'Delete annotation',
		   		msg: 'Are you sure you want to delete this annotation forever?',
		   		buttons: Ext.MessageBox.YESNO,
		   		fn: function(btn){
		   			if (btn == 'yes') 
		   				lore.ui.anno.handleDeleteAnnotation();
		   		},
		   		icon: Ext.Msg.QUESTION
		   	});
		   }
	    }
		
		lore.ui.anno.handleDeleteAnnotation = function(){
			try {
				lore.debug.anno("deleting " + lore.ui.anno.curSelAnno);
				
				lore.anno.deleteAnnotation(lore.ui.anno.curSelAnno, function(result, resultMsg){
					if (result == 'success') {
						lore.debug.anno('Annotation deleted', resultMsg);
						lore.ui.loreInfo('Annotation deleted');
					}
					else {
					
						lore.ui.loreError('Unable to delete annotation');
					}
				});
				
				lore.ui.anno.hideAnnotation();
				lore.ui.anno.setCurrentAnno(null);
			} 
			catch (ex) {
				lore.debug.anno("Exception when deleting annotation", ex);
				lore.ui.loreWarning("Unable to delete annotation");
			}
		}
		
		lore.ui.anno.handleUpdateAnnotationContext = function(btn, e){
			try {
				var currentCtxt = lore.util.getXPathForSelection();
				var theField = lore.ui.annotationsform.findField('context');
				theField.setValue(currentCtxt);
				theField = lore.ui.annotationsform.findField('originalcontext');
				theField.setValue(currentCtxt);
				theField = lore.ui.annotationsform.findField('res');
				theField.setValue(lore.ui.currentURL);
				if ( lore.ui.curSelAnno)
					lore.ui.curSelAnno.data.resource = lore.ui.currentURL;
				theField = lore.ui.annotationsform.findField('original');
				theField.setValue(lore.ui.currentURL);
				theField = lore.ui.annotationsform.findField('contextdisp');
				theField.setValue('"' + lore.util.getSelectionText(currentCtxt) + '"');
			} 
			catch (ex) {
				lore.debug.anno("Exception updating anno context", ex);
			}
		}
		lore.ui.anno.handleUpdateAnnotationVariantContext = function(btn, e){
			try {
				var currentCtxt = lore.util.getXPathForSelection();
				var theField = lore.ui.annotationsform.findField('variantcontext');
				theField.setValue(currentCtxt);
				theField = lore.ui.annotationsform.findField('variant');
				theField.setValue(lore.ui.currentURL);
				theField = lore.ui.annotationsform.findField('rcontextdisp');
				theField.setValue('"' + lore.util.getSelectionText(currentCtxt) + '"');
			} 
			catch (ex) {
				lore.debug.anno("Exception updating anno variant context", ex);
			}
		}
		
		lore.ui.anno.handleAnnotationTypeChange = function(combo){
		
			var theVal = combo.getValue();
			if (theVal == 'Variation') {
				lore.ui.anno.setAnnotationFormUI(true);
			}
			else 
				if (theVal == 'Comment' || theVal == 'Explanation') {
					lore.ui.anno.setAnnotationFormUI(false);
				}
			
		}
		
		lore.ui.anno.launchFieldWindow = function(field){
			lore.util.launchWindow(field.value, true);
		}
		
		
		
	
		lore.ui.anno.showSplitter = function (rec) {
			var rec;
			
			if (!rec) {
				rec = lore.ui.anno.curSelAnno;
			} else if ( typeof(rec) == 'string') {
				rec = lore.util.findRecordById(lore.anno.annods, rec);
			}
			try {
			
				if (rec.data.variantcontext) {
					// show splitter
					var ctx = null;
					var title = '';
					if (rec.data.original == lore.ui.currentURL) {
						ctx = rec.data.variant;
						title = "Variation Resource";
					}
					else {
						ctx = rec.data.original;
						title = "Original Resource";
					}
					
					lore.ui.global.topWindowView.updateVariationSplitter(ctx, title, true, function(){
						lore.ui.anno.hideMarker();
						lore.ui.anno.highlightCurrentAnnotation(rec);
					});
					
				}
			} catch (e ) {
				lore.debug.anno(e, e);
			}
		}
	

		lore.ui.anno.updateUI = function(store, records, options){
			lore.debug.anno("updateUI()");
			// TODO: Timeline and Editor code should have their own listener functions
			// instead of being clumped with treeui handler code
			try {
				// add
				if (records.length == 1 && lore.anno.isNewAnnotation(records[0])) {
				
					var rec = records[0];
					var node;
					
					
					if (rec.data.isReply && rec.data.isReply == true) {
						var pnode = lore.util.findChildRecursively(lore.ui.annotationstreeroot, 'id', lore.ui.anno.curSelAnno.data.id);
						node = lore.ui.anno.createAndInsertTreeNode(rec.data, pnode);
					}
					else {
						node = lore.ui.anno.createAndInsertTreeNode(rec.data);
						
					}
					
					// update the currently selected annotation before the focus is taken off it
					// for the newly created annotation
					if (lore.ui.anno.curSelAnno &&
						((lore.ui.annotationsform.isDirty()||
							lore.anno.isNewAnnotation(lore.ui.anno.curSelAnno)) && 
							lore.ui.annotationsform.findField('id').getValue() == lore.ui.anno.curSelAnno.data.id)) {
							lore.ui.anno.updateAnnoFromRecord(lore.ui.anno.curSelAnno);
					}
					
					if (!lore.ui.annotationsformpanel.isVisible()) {
					
						lore.ui.annotationsformpanel.show();
					}
					lore.ui.anno.showAnnotation(rec);
				
					node.ensureVisible();
					lore.ui.anno.setCurrentAnno(rec);
					
					node.select();
				}
				else {
				
					for (var i = 0; i < records.length; i++) {
						var rec = records[i];
						var anno = rec.data;
						try {
							lore.ui.anno.createAndInsertTreeNode(anno);
							
						} 
						catch (e) {
							lore.debug.anno("error loading: " + rec.id, e);
						}
					}
					
					lore.ui.anno.scheduleTimelineLayout();
				}
				
				if (!lore.ui.annotationstreeroot.isExpanded()) {
					lore.ui.annotationstreeroot.expand();
				}
			} 
			catch (e) {
				lore.debug.ui("Error loading annotation tree view: " + e, e);
			}
		}
		
		lore.ui.anno.updateUIOnClear = function(store) {
			var tree = lore.ui.annotationstreeroot.getOwnerTree();
			lore.ui.annotationstreeroot = new Ext.tree.TreeNode({});
			tree.setRootNode(lore.ui.annotationstreeroot);
		}
		
		lore.ui.anno.updateUIOnRemove = function(store, rec, index){
			try {
				var node = lore.util.findChildRecursively(lore.ui.annotationstreeroot, 'id', rec.data.id);
				if (!node) {
					return;
				}
				
				node.remove();
				if (!lore.anno.isNewAnnotation(rec)) {
				
					// remove from timeline
					
					var evt = lore.ui.anno.annoEventSource.getEvent(rec.data.id);
					if (evt) {
						evt._eventID = "flagdelete";
						lore.ui.anno.scheduleTimelineLayout();
					}
					
				}
			} 
			catch (e) {
				lore.debug.ui("Error removing annotation from tree view: " + e, e);
			}
		}
		
		lore.ui.anno.updateUIOnUpdate = function(store, rec, operation){
			
			try {
				var node = lore.util.findChildRecursively(lore.ui.annotationstreeroot, 'id', rec.data.id);
				
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
					info = lore.ui.anno.genAnnotationCaption(rec.data, 'by c, d r')
				}
				else if (lore.anno.isNewAnnotation(rec) && rec.data.resource != lore.ui.currentURL) {
					//TODO: Need to change this logic or add an entry for replies that recursively checks
					// to find the leaf annotation and if that annotation's resource != currentURL
						info = "Unsaved annotation from " + rec.data.resource;
				}
				node.setText(rec.data.title, info,'', lore.ui.anno.genTreeNodeText(rec.data));
				lore.ui.anno.updateAnnoInTimeline(rec.data);
				lore.ui.anno.showAnnotation(rec, true);
				
				
			} 
			catch (e) {
				lore.debug.ui("Error updating annotation tree view: " + e, e);
			}
		}
		
		lore.ui.anno.highlightCurrentAnnotation = function(rec){
		
			lore.ui.anno.curAnnoMarkers = new Array();
			
			// regular non variant case for highlighting
			if (rec.data.context && !rec.data.variantcontext 
					&& rec.data.resource == lore.ui.currentURL) {
					try {
						lore.ui.anno.curAnnoMarkers.push(lore.ui.anno.highlightAnnotation(lore.util.normalizeXPointer(rec.data.context), lore.ui.anno.getCreatorColour(rec.data.creator), lore.ui.anno.setCurAnnoStyle));
					} 
					catch (e) {
						lore.debug.anno(e, e);
					}
			} else 	if (rec.data.variantcontext) {
			
				if (rec.data.original && rec.data.original == lore.ui.currentURL) {
					try {
						lore.ui.anno.curAnnoMarkers.push(lore.ui.anno.highlightAnnotation(lore.util.normalizeXPointer(rec.data.context), lore.ui.anno.getCreatorColour(rec.data.creator), lore.ui.anno.setCurAnnoStyle));
					} 
					catch (e) {
						lore.debug.anno("Error highlighting variation context: " + e, e);
					}
					
					if (lore.ui.global.topWindowView.variationContentWindowIsVisible()) {
						try {
							lore.ui.anno.curAnnoMarkers.push(lore.ui.anno.highlightAnnotation(lore.util.normalizeXPointer(rec.data.variantcontext), lore.ui.anno.getCreatorColour(rec.data.creator), lore.ui.anno.setCurAnnoStyle, lore.ui.global.topWindowView.getVariationContentWindow()))
						} 
						catch (e) {
							lore.debug.anno(e, e);
						}
						
					}
				}
				if (rec.data.variant == lore.ui.currentURL) {
					try {
						lore.ui.anno.curAnnoMarkers.push(lore.ui.anno.highlightAnnotation(lore.util.normalizeXPointer(rec.data.variantcontext), lore.ui.anno.getCreatorColour(rec.data.creator), lore.ui.anno.setCurAnnoStyle));
					} 
					catch (e) {
						lore.debug.anno("Error highlighting variation context: " + e, e);
					}
					
					if (rec.data.context && lore.ui.global.topWindowView.variationContentWindowIsVisible()) {
						try {
							lore.ui.anno.curAnnoMarkers.push(lore.ui.anno.highlightAnnotation(lore.util.normalizeXPointer(rec.data.context), lore.ui.anno.getCreatorColour(rec.data.creator), lore.ui.anno.setCurAnnoStyle, lore.ui.global.topWindowView.getVariationContentWindow()))
						} 
						catch (e) {
							lore.debug.anno("Error highlighting variation context: " + e, e);
						}
					}
				}
			}
				
		}
		
		lore.ui.anno.handleAnnotationSelection = function(node, event){
		
			try {
				
				var rec = lore.util.findRecordById(lore.anno.annods, node.id);
				
				if ( rec == lore.ui.anno.curSelAnno )
					return;
			
				
				// update annotations grid from form if it's a new annotation
				//lore.ui.anno.hideMarker();
				
				if (lore.ui.anno.curSelAnno &&
				(lore.ui.annotationsform.isDirty() ||
				lore.anno.isNewAnnotation(lore.ui.anno.curSelAnno))) {
					lore.ui.anno.updateAnnoFromRecord(lore.ui.anno.curSelAnno);
				}
				
				if (rec == null) { // if they select root element, if it's shown 
					lore.ui.anno.setCurrentAnno(null);
					return;
				}
				
				lore.ui.anno.setCurrentAnno(rec);
				//lore.ui.anno.curSelAnno = rec; // TODO: eventually have a listener on this to abstract on which gui element was selected
				 
				
				
				if ( lore.ui.global.topWindowView.variationContentWindowIsVisible() &&
					 lore.ui.anno.curSelAnno.data.type== lore.constants.VARIATION_ANNOTATION_NS + "VariationAnnotation") {
					 lore.ui.anno.showSplitter();	
				} else {
					lore.ui.anno.highlightCurrentAnnotation(rec);
				}
				
				lore.ui.annotationsformpanel.hide();
				Ext.getCmp("treeview").doLayout();
				
			} 
			catch (e) {
				lore.debug.anno("Error occurred highlightling " + e, e);
			}
			
		}
		
		lore.ui.anno.handleReplyToAnnotation = function(arg){
			lore.ui.anno.views.activate('treeview');
			try {
				var rec;
				if (!arg) { //toolbar
					rec = lore.ui.anno.curSelAnno;
					if (!rec)
						return;
				}
				else if (typeof(arg) == 'string') {  // timeline
					rec = lore.util.findRecordById(lore.anno.annods, arg);
					if ( rec) lore.ui.anno.setCurrentAnno(rec);//lore.ui.anno.curSelAnno = rec;
				}
					
				if (!rec) {
					lore.debug.anno("Couldn't find record to reply to: " + arg, arg);
					return;
				}
				
				lore.ui.anno.handleAddAnnotation(rec);
			} 
			catch (e) {
				lore.debug.anno(e, e);
			}
		}
		
		/**
	 * Open an annotation in the editor
	 * @param {} annoid The id of the anotation to open
	 */
		lore.ui.anno.handleEditAnnotation = function(arg){
			lore.ui.anno.views.activate('treeview');
		
			var rec;
			try {
				if (!arg) { // no argument supplied, via the toolbar
					rec = lore.ui.anno.curSelAnno
					if (!rec)
						return;
				}
				else 
					if (typeof(arg) == 'string') { // via timeline
						rec = lore.util.findRecordById(lore.anno.annods, arg);
					}
					else { // treenode supplied
						rec = lore.util.findRecordById(lore.anno.annods, arg.id);
					}
				
				if (!rec) {
					lore.debug.anno("Couldn't find record to edit: " + arg, arg);
					return;
				}
				var node = lore.util.findChildRecursively(lore.ui.annotationstreeroot, 'id', rec.data.id);

				if (node) {
					lore.ui.anno.showAnnotation(rec);
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
	 * 
	 * 
	 */
	lore.ui.anno.handleLocationChange = function(contextURL) {
		try {
			var oldurl = lore.ui.currentURL + '';
			lore.ui.currentURL = contextURL;
			if (!lore.ui.initialized ||	!lore.ui.lorevisible)
					return;
				
				
			
			lore.debug.anno("The uri is " + lore.ui.currentURL);
			lore.debug.ui("Updating annotation source list");
			
			var update_ds = {
				multiSelAnno: lore.ui.anno.multiSelAnno.slice(),
				colourForOwner: lore.util.clone(lore.ui.anno.colourForOwner),
				colourCount: lore.ui.anno.colourCount,
				curSelAnnoId: lore.ui.anno.curSelAnno ? lore.ui.anno.curSelAnno.data.id:null,
				curAnnoMarkers: lore.ui.anno.curAnnoMarkers.slice()
			};
			
			lore.store.set(lore.ui.anno.HIGHLIGHT_STORE, update_ds, oldurl);
			
			// tag any unsaved new annotations for the new page
			lore.anno.annods.each(function(rec){
				if (lore.anno.isNewAnnotation(rec)) {
					var n = lore.util.findChildRecursively(lore.ui.annotationstreeroot, 'id', rec.data.id);
					n.setText(rec.data.title, "Unsaved annotation from " + rec.data.resource, '', lore.ui.anno.genTreeNodeText(rec.data));
				}
			})
			
			if (lore.ui.anno.curSelAnno) {
				if (!lore.anno.isNewAnnotation(lore.ui.anno.curSelAnno)) {
					lore.ui.anno.hideAnnotation();
				}
			}
			
			var ds = lore.store.get(lore.ui.anno.HIGHLIGHT_STORE, contextURL);
			if (ds) {
				lore.ui.anno.multiSelAnno = ds.multiSelAnno;
				lore.ui.anno.colourForOwner = ds.colourForOwner;
				lore.ui.anno.colourCount = ds.colourCount
				var curSelAnnoId = ds.curSelAnnoId;
				lore.ui.anno.curAnnoMarkers = ds.curAnnoMarkers;
				
				var rec = lore.util.findRecordById(lore.anno.annods, curSelAnnoId);
				if (rec) {
					lore.ui.anno.curSelAnno = rec;
				}
			}
		} catch (e ) {
			
			lore.debug.anno(e,e);
		}
		lore.anno.updateAnnotationsSourceList(contextURL);
		lore.ui.loadedURL = contextURL;
		lore.ui.anno.annoEventSource.clear();
	}
