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
	
	
	// set defaults for page
	lore.anno.ui.colourLookup = new Array("#00FF00", "#FFFF00", "#00FFFF", "#FF00FF", "#FF8000", /*"#80FF00",*/ "#00FF80", "#0080FF", "#8000FF", "#FF0080", "#FFC000", "#C0FF00", "#00FFC0", "#00C0FF", "#C000FF", "#FF00C0", "#FF4000", /*"#40FF00", "#00FF40",*/ "#0040FF", /*"#4000FF",*/ "#FF0040", "#0000FF" /*, "#FF0000",*/);
	var closeIcon = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAABIAAAASABGyWs+AAAACXZwQWcAAAAQAAAAEABcxq3DAAACjklEQVQ4y2XTv2uddRTH8dfzPDf3Po9pjRfSVGKvlUApWEkdEkRxCI4pdAgdYjvrZBEyhFJwyT+QVdAiLqLQNg6Nix10ukoGsYU0Y/OrMdomJqm5ufc+9/k65IehnuWc4ZwPh88578j/I8ZrGRer1CJssNzgAVZQHG+ODosyWtTO89FIYmw48UYtkkZYDvbmOhZ/7rjziC8qLDePq5xCwtBorH6noniSCn93CZslYaMkPO0SFlPhdipcStQThk4fDpf208BoYq5eEbYSYYPwzH/5L8ITwkoi/FQRLiXmMNCFpCA+H/vsZsnYcJt2gXKZclnI831TskwSx4q84+WC3pL+h0H4M/gxxrkPYpffyWkFOmmqMjkpm55WVKuKalU2PS2dnJSkqSjwVs77scs4V0ojF4eC/q6CXWSjo166cUOUZXR3g+zqVaHR0Jyf17p7V6XgQqQ/jQyWqvT1Fcpt5Nit11VmZ3VfuSK7dm3foRDszs7ardePblgtdPXQF8eBKAj5gUBzbc3G1JT20hJRRBRpLy3ZmJrSXFuTHz7C/lwUb7O+STscCOjt1TMxoVSrHZ25VKvpmZigt9fhplu0d1iPd3jwkNUOOiiPjDgxPi5KEtszM7ZnZkRJ4sT4uPLIiBx7WGD1H35PsNnk7Nu824vni4viNNVaXLR6/brte/d09fd7fv++Z7duCe22BXzDV+t8F1XQZOBDvv2U4VfQyDJKJZ2dHZCcPCnkubjR8Ac+59fvGS/zOOngdTbn+G2DwVc5cyrPxa2W6ICsqNXSznPzhK+p/8Anp3m0dRymDA1qF/j4Pcbe5GyVtMBT9uZ5/Au3F/iywsohTEcCL+B8JmWwh1rANkt7+zivvojzv3rjBCvezErGAAAAJXRFWHRjcmVhdGUtZGF0ZQAyMDA4LTEwLTE4VDE4OjQ1OjQ1KzA4OjAwKJpk+wAAACV0RVh0bW9kaWZ5LWRhdGUAMjAwOC0xMC0xOFQxODo0NTo0NSswODowMHcrEs8AAAAASUVORK5CYII=";
	
	/**
	 * Class that abstracts a highlighted area of text or of an image based off an xpointer or semantic pointer. This
	 * highlighted area can have tooltip based off of annotation data.
	 * @param {Object} args Valid arguments are 
	 * {
	 * 	xpointer: The xpointer pointing to the image region or area of text to be highlighted
	 *  borderWidth: The width of the border used for highlighting 
	 *  target: The target document the xpointer applies to. Defaults to the current content window (tab).
	 */
	lore.anno.ui.Marker = function(args) {
					
					this.xpointer = lore.global.util.normalizeXPointer(args.xpointer);
					this.target = args.target || lore.global.util.getContentWindow(window).document;
					this.type  = lore.global.util.isXPointerImageRange(this.xpointer) ? 1:0;
					this.visible = false;
					this.bw = args.borderWidth || 1;
					
					/**
					 * Highlight the marker and 
					 * @param {Colour} colour Colour of the highlighting border
					 * @param {Function} styleCallback Callback function to override how the highlighting is performed
					 * @param {Boolean} scroll Specify whether to scroll to the highlighted DOM element defaults to false
					 */
					this.show = function (colour, styleCallback, scroll) {
						this.colour = colour;
						this.styleCallback = styleCallback;
						
						if ( this.type == 1) {
							if (!this.data) {
								lore.debug.anno("lore.anno.ui.Marker: " + this.xpointer);
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
								if (typeof(this.xpointer) != 'string' ) {
									this.data = {};
									lore.debug.anno('xpointers', this.xpointer);
									if ( lore.anno.ui.rdfa) {
										
										this.data.range = lore.global.util.getSelectionForHash(this.xpointer[0], lore.anno.ui.rdfa.rdf.databank.triples());
										lore.debug.anno("Resolved from hashed triple string to range: " + this.data.range, this.data.range);
									}
									else {
										this.data.range = lore.global.util.getSelectionForXPath(this.xpointer[1], this.target);
									}
								}
								else {
									this.data = {
										range: lore.global.util.getSelectionForXPath(this.xpointer, this.target)
									};
								}
								
								this.data.nodes = lore.global.util.highlightRange(this.data.range, this.target, scroll, stylin);
							} else {
								for (var i=0; i < this.data.nodes.length; i++ ) {
									stylin(this.data.nodes[i]);
								}
							}
						}	
						
						this.visible = true;		
					}

					/**
					 * Updates the position and size of the marker based off any changes made
					 * to the window size and parameters passed in.
					 * @param {Object} colour The colour the border should be changed to
					 * @param {Object} styleCallback The callback function that overrides how the highlighting is displayed
					 */
					this.update = function(colour, styleCallback){
						try {
							if (this.data.nodes && this.type == 1) {
							
								this.colour = colour || this.colour;
								this.styleCallback = styleCallback || this.styleCallback;
								
								var c = lore.anno.ui.scaleImageCoords(this.data.image, this.data.coords, this.target);
								var o = lore.anno.ui.calcImageOffsets(this.data.image, this.target);
								
								//if (this.target && this.target.defaultView.innerWidth > 0) {
									var _n = $(this.data.nodes[0]);
								//	lore.debug.anno('z:' + this.xpointer, this.xpointer);
									_n.css({
										position: 'absolute',
										left: c.x1 + o.left + this.bw,
										top: c.y1 + o.top + this.bw,
										border: this.bw + 'px solid ' + this.colour,
										zIndex: _n.parent().css('zIndex')
									}).width(c.x2 - c.x1 - this.bw * 2).height(c.y2 - c.y1 - this.bw * 2);
									if (this.styleCallback) 
										this.styleCallback(this.type, this.data.nodes[0]);
							//	}
							}
						}catch (e ) {
							lore.debug.anno(e,e);
						}
					}
							
					/**
					 * Hide the highlighted area of text or image and remove the marker
					 * DOM entry from the document.
					 */			
					this.hide = function(){
						try {
							if (this.data && (this.data.image || this.data.nodes)) {
								var w = lore.global.util.getContentWindow(window);
								if (this.type == 0) {
									for (var i = 0; i < this.data.nodes.length; i++) {
										var n = this.data.nodes[i];
										if (n) {
											n.style.display = 'none'; // in the event removal fails, the marker
																// will at least be hidden
											lore.global.util.removeNodePreserveChildren(n, w);
										}
									}
									this.data = null;
								}
								else {
									this.data.nodes[0].style.display = 'none';
									lore.global.util.removeNodePreserveChildren(this.data.nodes[0], w);
								}
							}
							this.visible = false;
						}catch (e){
							lore.debug.anno(e,e);
						}
					}
					
				/**
				 * Generated a pop up for the given annotation and place the HTML into the
				 * supplied dom container
				 * @param {Object} annodata	The annotation to create the tip for
				 * @param {Object} domContainer An object or an array containing the dom container/s
				 * to insert the pop up HTML into
				 */
		 		this.tip = function(annodata){
				try {
					var doc = this.target || lore.global.util.getContentWindow(window).document;
					var cw = doc.defaultView;
					var uid = annodata.id;
					var desc = "<div style='color:white;background-color:darkred;width:100%;min-height:18'><strong>" + annodata.title + "</strong></div><span style='font-size:smaller;color:#51666b;'>" + lore.global.util.splitTerm(annodata.type).term +
					" by " +
					annodata.creator +
					"<br />";
					desc += "<div style='max-width:" + (cw.innerWidth * 0.75 - 30) + ";max-height: " + (cw.innerHeight * 0.75 - 30) + ";overflow:auto' >"; 			
					desc += lore.anno.ui.genDescription(annodata, true);
					desc += '</div>';
					//desc += lore.anno.ui.genDescription(annodata, true);
					var d = lore.global.util.longDate(annodata.created, Date);
					desc += "<br /><span style=\"font-size:smaller;color:#aaa\">" + d + "</span></span><br />";
					var descDom = doc.createElement("span");
					descDom.setAttribute("style", "font-family:sans-serif");
					descDom.setAttribute("display", "none");
					
					// innerHTML does not work for pages that are image/... content type, so parse html
					// by temporarily adding to local document head. html has been sanitized.
					var	h =	document.getElementsByTagName("head")[0];
					h.appendChild(descDom); 
					descDom.innerHTML = desc;
					h.removeChild(descDom);
					descDom.removeAttribute("display");

				$(this.data.nodes[0], doc).simpletip({
					content: descDom,
					focus: true,
					boundryCheck: false,
					position: 'cursor',
					showEffect: 'custom',
					onetip: true,
					closeIcon: closeIcon,
					showCustom: function(){
						try {
								Ext.apply(this.context.style, 
								{
									position : 'absolute',
									opacity  : "1",
									backgroundColor : "#fcfcfc",
									fontSize : "9pt",
									fontWeight : "normal",
									color : "#51666b",
									border : '1.5px solid darkgrey',
									zIndex : "3",
									fontFamily : 'sans-serif',
									maxWidth : cw.innerWidth * 0.75,
									maxHeight : cw.innerHeight * 0.75
									//overflow : 'auto'
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
			}
			
	
		/*
	 	* General highlighting functions
	 	*
	 	*/
		
		/**
		 * Update the image scale information if necessary
		 * @param {Object} img
		 * @param {Object} doc
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
		
		/**
		 * Scale the image co-ordinates
		 * @param {Element} img DOM element for the image i.e <img>
		 * @param {Object} coords Object containing the co-ordinates and scale factor {x1,y1,x2,y2,sx,sy}
		 * @param {Object} doc The target document 
		 */
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
		
		/**
		 * Calculate the image's absolute position on the page
		 * @param {Object} img DOM element for image i.e <img>
		 * @param {Object} doc The target document
		 */
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
		
	
		/**
		 * Hide the currently selected annotation markers
		 * @param {Object} cw Content window that this applies to
		 */
		lore.anno.ui.hideMarker = function(cw){
			
			try {
				if (lore.anno.ui.page.curAnnoMarkers) {
					for (var i = 0; i < lore.anno.ui.page.curAnnoMarkers.length; i++) {
						var m = lore.anno.ui.page.curAnnoMarkers[i];
						if (cw) {
							if ( m.target.defaultView == cw ) {
								m.hide();
								delete m;
								lore.anno.ui.page.curAnnoMarkers.splice(i,1);
								i--;
							}
						}
						else {
							m.hide();
							delete m;
						} 
					}
					if (!cw)
						lore.anno.ui.page.curAnnoMarkers = [];
				}
			} 
			catch (ex) {
				lore.debug.anno("hide marker failure: " + ex, ex);
			}
		}
		
		/**
		 * Get a colour based off the creator's name.  This is retrieve from a predefined
		 * table of colours.  If there a no colours available from the table, then a
		 * colour is generated.
		 * @param {String} creator Creator name
		 * @return {String} A hexadecimal colour value of the form #RRGGBB 
		 */
		lore.anno.ui.getCreatorColour = function(creator){
			creator = creator.replace(/\s+$/, ""); //rtrim
			var colour = lore.anno.ui.page.colourForOwner[creator];
			if (!colour) {
				if (lore.anno.ui.page.colourCount < lore.anno.ui.colourLookup.length) {
					colour = lore.anno.ui.colourLookup[lore.anno.ui.page.colourCount++];
				}
				else {
					// back up
					colour = lore.global.util.generateColour(196, 196, 196, 240, 240, 240);
				}
				lore.anno.ui.page.colourForOwner[creator] = colour;
			}
			return colour;
		}
		
		/**
		 * Set the currently selected image
		 * @param {Object} img The dom element for the image i.e <img>
		 */
		lore.anno.ui.setCurSelImage = function (img) {
			lore.anno.ui.page.curImage = $(img);
		}
		
		/**
		 * Get the currently selected image 
		 */
		lore.anno.ui.getCurSelImage = function () {
			return lore.anno.ui.page.curImage ? lore.anno.ui.page.curImage.get(0):null;
		}
		
		/**
		 * Retrieve th current selection whether that is selected text or selected part of an image
		 */
		lore.anno.ui.getCurrentSelection = function(){
			var selxp = lore.global.util.getXPathForSelection(window);
			
			if ( lore.anno.ui.page.curImage && lore.global.util.trim(selxp) == '' ) {
				var sel = lore.anno.ui.page.curImage.imgAreaSelectInst().getSelection()
				if (sel.x1 != sel.x2 && sel.y1 != sel.y2) {
					return lore.global.util.getXPathForImageSelection(lore.anno.ui.page.curImage.get(0), lore.anno.ui.page.curImage.get(0).ownerDocument, sel, true);
				}
			}

			return selxp;	
		}
		
		
		/**
		 * Highlight the current annotation 
		 * @param {Record} rec The record of the annotation to highlight 
		 */
		lore.anno.ui.highlightCurrentAnnotation = function(rec){
			if ( lore.anno.ui.page.curImage) {
				var inst = lore.anno.ui.page.curImage.imgAreaSelectInst();
				inst.setOptions({show:false,hide:true});
				inst.update();
				
			}
			lore.anno.ui.page.curAnnoMarkers = lore.anno.ui.highlightAnnotation(rec, lore.anno.ui.setCurAnnoStyle);
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
			
			var cc = lore.anno.ui.getCreatorColour(rec.data.creator);
			for ( var i=0; i < markers.length;i++) {
				markers[i].show(cc, annoStyle, true);
				markers[i].tip(rec.data);
			}
			if ( rec.data.meta.context){
				var m = new lore.anno.ui.Marker({xpointer:rec.data.meta.context});
				markers.push(m);
				m.show(cc, function (type, node) {
					node.style.backgroundColor = null;
					node.style.border = "2px dashed " + cc;
					lore.debug.anno(node.style.border, node);
					return node;
				});
				m.tip(rec.data);
			}
			
			return markers;
				
		}
		
			/**
	 	* Highlight all annotations on the current page
	 	*/
		lore.anno.ui.toggleAllAnnotations = function(){
		
			if (lore.anno.ui.page.multiSelAnno.length == 0) {
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
					if ( rec.data.context || rec.data.meta.context ) {
						try {
							var markers = lore.anno.ui.highlightAnnotation(rec, selAllStyle);	
							
							// 'attach' annotation description bubble
							if (markers != null) {
								lore.anno.ui.page.multiSelAnno = lore.anno.ui.page.multiSelAnno.concat(markers);
								// create the tip div in the content window
								for ( var i =0 ; i < markers.length;i++)						
									markers[i].tip(rec.data);
									
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
				lore.debug.anno("Unhighlighting all annotations", lore.anno.ui.page.multiSelAnno);
				for (var i = 0; i < lore.anno.ui.page.multiSelAnno.length; i++) {
					try {
						var m = lore.anno.ui.page.multiSelAnno[i];
						m.hide();
						delete m;
					} 
					catch (ex) {
						lore.debug.anno("Error unhighlighting: " + ex, lore.anno.ui.page.multiSelAnno[i]);
					}
					
				}
				// clear selection info
				lore.anno.ui.page.multiSelAnno = new Array();
			}
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
			var frag = doc.createDocumentFragment();
			
			// add a handler that loads image selection capabilites to an image
			// when the user mouses over an image for the first time. This is because
			// trying to load the image selection library on page load causes browser 
			// timeouts for pages with large amounts of image
			
			// TODO: further optimization on the imgareaselect library
			im.each(function(){
					

				// minimum area check 
				if ( parseInt(this.offsetWidth) + parseInt(this.offsetHeight) < 64) 
					return;				
				
				$(this).mouseover(function(){
					try {
						// remove self, as it's once off use of handler
						$(this).unbind('mouseover');
						
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
							imageWidth: scale.origWidth,
						})
					} 
					catch (e) {
						lore.debug.anno("error initing image handler: " + e, e);
					}
				});
				
			});
	 					
			var e = lore.global.util.domCreate('span', doc);
			e.id = 'lore_image_highlighting_inserted';
			e.style.display = "none";
			$('body', doc).append(e);
			
			lore.debug.anno("image selection enabled for the page");
			
			var refreshImageMarkers = function(e){
				try {
					var markers = lore.anno.ui.page.curAnnoMarkers.concat(lore.anno.ui.page.multiSelAnno);
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
			