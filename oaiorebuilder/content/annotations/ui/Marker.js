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
 * Class that abstracts a highlighted area of text or of an image based off an xpointer or semantic pointer. This
 * highlighted area can have tooltip based off of annotation data.
 * @class lore.anno.ui.Marker
 * @param {Object} args Valid arguments are 
 * {
 * 	xpointer: The xpointer pointing to the image region or area of text to be highlighted
 *  borderWidth: The width of the border used for highlighting 
 *  target: The target document (ContentWindow) the xpointer applies to. Defaults to the current content window (tab).
 */
	
lore.anno.ui.Marker = function(args){
	this.xpointer = lore.global.util.normalizeXPointer(args.xpointer);
	this.target = args.target || lore.global.util.getContentWindow(window).document;
    this.type = lore.global.util.getXPointerType(this.xpointer);
	this.visible = false;
	this.bw = args.borderWidth || 2;
	this.page = args.page;
};

lore.anno.ui.Marker.prototype = {
	/**
	* Highlight the marker  
	* @param {Colour} colour Colour of the highlighting border
	* @param {Function} style Callback Callback function to override how the highlighting is performed
	* @param {Boolean} scroll Specify whether to scroll to the highlighted DOM element defaults to false
	*/
	show : function (colour, styleCallback, scroll) {
		this.colour = colour;
		this.styleCallback = styleCallback;
		
		if (this.isImageMarker()) {
			// image marker
			if (!this.data) {
				this.data = lore.global.util.parseImageRangeXPointer(this.xpointer, this.target);
			} 
			
			var doc = this.target;
			// add span to doc body
			var _div = $(lore.global.util.domCreate('span', doc));
			var _parent = $('body',doc);
			_parent.append(_div);
			this.data.nodes = [_div.get(0)];
			this.update(); 
			
		} else if (this.isStringMarker()) {
			// text marker
			var type = this.type;
			var stylin = function(domNode){
					domNode.style.backgroundColor = colour || "yellow";
					if (styleCallback) styleCallback(type, domNode);
				};
				
			if (!this.data || !this.data.nodes) {
				// get range from xpath
				this.data = {
					range: lore.global.util.getSelectionForXPath(this.xpointer, this.target)
				};
                
				// highlight marker
				this.data.nodes = lore.global.util.highlightRange(this.data.range, this.target, stylin);
			} else {
				// apply style callback to dom node
				for (var i=0; i < this.data.nodes.length; i++ ) {
					stylin(this.data.nodes[i]);
				}
			}
        } else {
            var xpath = lore.global.util.getXPathFromXPointer(this.xpointer);
            var node = lore.global.util.getNodeForXPath(xpath, this.target);
            
            //TODO: properly fix for when we have no nodes
            
            this.data = {};
            this.data.nodes = [node];
            if (node) {
                this.oldBackgroundColor = node.style.backgroundColor;
                node.style.backgroundColor = colour;
            }
        }
        
		if (scroll) {
            lore.global.util.scrollToElement(this.data.nodes[0], this.target.defaultView);
        }
            
		this.visible = true;		
	},

	/**
	 * Updates the position and size of the marker based off any changes made
	 * to the window size and parameters passed in.
	 * @param {Object} colour The colour the border should be changed to
	 * @param {Object} styleCallback The callback function that overrides how the highlighting is displayed
	 */
	update : function(colour, styleCallback){
		try {
			if (this.data.nodes && this.isImageMarker()) {
				// image annotation
				this.colour = colour || this.colour;
				this.styleCallback = styleCallback || this.styleCallback;
				// update scaling and offsets
				var c = lore.anno.ui.scaleImageCoords(this.data.image, this.data.coords, this.target);
				var o = lore.anno.ui.calcImageOffsets(this.data.image, this.target);
				
				// update CSS 
					var _n = $(this.data.nodes[0]);
					_n.css({
						position: 'absolute',
						left: c.x1 + o.left + this.bw,
						top: c.y1 + o.top + this.bw,
						border: this.bw + 'px solid ' + this.colour,
						zIndex: _n.parent().css('zIndex')
					}).width(c.x2 - c.x1 - this.bw * 2).height(c.y2 - c.y1 - this.bw * 2);
					if (this.styleCallback) 
						this.styleCallback(this.type, this.data.nodes[0]);
			}
		}catch (e ) {
			lore.debug.anno("Marker update",e);
		}
	},
			
	/**
	 * Hide the highlighted area of text or image and remove the marker
	 * DOM entry from the document.
	 */			
	hide : function(){
		try {
            this.disableTip();
			
			if (this.data && (this.data.image || this.data.nodes)) {
				// for each of the dom nodes, set display to none
				// and then to remove from DOM.
				var w = lore.global.util.getContentWindow(window);
				if (this.isStringMarker()) {
					for (var i = 0; i < this.data.nodes.length; i++) {
						var n = this.data.nodes[i];
						if (n) {
							n.style.display = 'none'; // in the event removal fails, the marker
													  // will at least be hidden
							lore.global.util.removeNodePreserveChildren(n, w);
						}
					}
					this.data = null;
				} else if (this.isImageMarker()) {
					// set display none and then try to remove from DOM
					this.data.nodes[0].style.display = 'none';
					lore.global.util.removeNodePreserveChildren(this.data.nodes[0], w);
				} else {
                    this.data.nodes[0].style.backgroundColor = this.oldBackgroundColor;
                }
			}
			this.visible = false;
		} catch (e){
			lore.debug.anno("lore.anno.ui.Marker.hide()",e);
		}
	},
    disableTip : function() {
        if (this.data)
            $(this.data.nodes[0]).simpletip().disable();
    },
    
	/**
	 * Generated a pop up for the given annotation and place the HTML into the
	 * supplied dom container
	 * @param {Object} annodata	The annotation to create the tip for
	 * @param {Object} domContainer An object or an array containing the dom container/s
	 * to insert the pop up HTML into
	 */
 	tip : function(annodata){
		try {
			var doc = this.target || lore.global.util.getContentWindow(window).document;
			var cw = doc.defaultView;
			var uid = annodata.id;
			var descDom = doc.createElement("div");
            descDom.setAttribute("style", "font-family:sans-serif");
            var d = lore.global.util.longDate(annodata.created, Date);
            var desc = Ext.get(descDom);
            desc.createChild({
               tag:"div",
                style: "color:white;background-color:darkred;min-height:18;padding:3px",
                children:[{
                    tag: "strong",
                    children: [
                        annodata.title
                    ]
                }]
            });
            desc.createChild({
                    tag: "div",
                    style: "color:#51666b;padding:3px",
                    children: [
                        (lore.global.util.splitTerm(annodata.type).term + " by " + annodata.creator),
                        {
                            tag: "div",
                            cls: "loreAnnoTip",
                            style: ("margin:4px;max-width:" + (cw.innerWidth * 0.75 - 30) + ";max-height: " + (cw.innerHeight * 0.75 - 30) + ";overflow:auto"),
                            children: [lore.anno.ui.genDescription(annodata, true),
                            {tag: "br"}, lore.anno.ui.genTagList(annodata)
                            ]
                        }
                    ]
            });
            desc.createChild({
                    tag: "span",
                    style: 'font-size:smaller;color:#aaa',
                    children: [d]
                }    
            );

			$(this.data.nodes[0], doc).simpletip({
			content: descDom,
			focus: true,
			boundryCheck: true,
			position: 'cursor',
			onetip: true,		// custom config which specifies only one tip can show at a time
			closeIcon: lore.constants.icons.closeIcon,  // close button
            extraStyles: {
                opacity  : "1",
                backgroundColor : "#fcfcfc",
                color : "#51666b",
                border : '1.5px solid darkgrey',
                zIndex : "99999",
                fontFamily : 'sans-serif',
                minWidth : "250px"}
			});
		}
		catch (ex) {
			lore.debug.anno("Tip creation failure: " + ex, ex);
		}
	},
    
    isImageMarker: function() {
        return this.type === 'image-range';
    },
    
    isStringMarker: function() {
        return this.type === 'string-range';
    },
    
    isNodeMarker: function() {
        return this.type === 'plain';
    }
		
};