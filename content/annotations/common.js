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

	 

Ext.ns('lore.anno.ui');
		
		
/**
 * Output a message to notification window
 * @param {String} message Notification message
 * @param {Object} iconCls CSS Class for notification icon
 */
lore.anno.ui.loreMsg = function(message, iconCls){
	try {
		if (!lore.anno.ui.loreMsg.Stack) {
			lore.anno.ui.loreMsg.stack = [];
		}
		iconCls = iconCls || '';
		
		 var statusopts = {
            'text': message,
            'iconCls': iconCls ,
            'clear': {
                'wait': 3000
            }
		};
		 	Ext.getCmp("status").setStatus(statusopts);	
		 
		lore.anno.ui.loreMsg.stack.push(message);
		window.setTimeout(function(){
			try {
				if (lore.anno.ui.loreMsg.stack.length == 1) {
					lore.anno.ui.loreMsg.stack.pop();
				//	Ext.Msg.hide();
				}
				else {
					lore.anno.ui.loreMsg.stack.splice(0, 1);
				//	Ext.Msg.updateText(lore.anno.ui.loreMsg.stack.join('<br/>'));
				//	var w = Ext.Msg.getDialog();
				//	w.setPosition(0, window.innerHeight - w.getBox().height);
				}
			} 
			catch (e) {
				lore.debug.ui("loreMsg setTimeout", e);
			}
		}, 3000);
	} catch (e) {
		lore.debug.anno("loreMsg",e);
	}
};
		
/**
 * Output a notification to notification window
 * @param {String} message Notification message
 */
lore.anno.ui.loreInfo = function(message){
	lore.anno.ui.loreMsg(message, 'info-icon');
};

/**
 * Output a error message to notification window
 * @param {String} message Erro message
 */
lore.anno.ui.loreError = function(message){
	lore.anno.ui.loreMsg(message, 'error-icon');
};

/**
 * Output a warning to notification window
 * @param {String} message Warning message
 */
lore.anno.ui.loreWarning = function(message){
	lore.anno.ui.loreMsg(message, 'warning-icon');
};


				
/**
 * Generate a description for an annotation
 * @param {Object} annodata The annotation to generate the description for 
 * @return {String} A string containing the annotation description. The string may contain HTML.
 */	
lore.anno.ui.genTreeNodeText = function(annodata){
	var res = "";
    var body = '';
    if (annodata.bodyLoaded) {
    	if (annodata.meta.length > 0) {
    		// Metadata annotation
    		body = 'Metadata Annotation<br>';
    		for (var i = 0; i < annodata.meta.length; i++) {
    			body += '<b>' + annodata.meta[i].name + '</b>: ' + annodata.meta[i].value + '<br>';
    		}
    	} else {
    		body = annodata.body;
    	}
    } else {
    	body = 'Loading content...';
    }
    
	body = lore.util.externalizeLinks(body);
	res += body;
	
	
	return res;
};

/**
 * Convert a tree node id to it's corresponding record id
 * @param {TreeNode} node
 */
lore.anno.ui.nodeIdToRecId = function(node) {
	return node.id.replace("-unsaved", "");
};
		

/**
 * Update the image scale information if necessary
 * @param {Object} img The DOM node for the image
 * @param {Object} doc The target document that the node belongs to
 * @return {Object} scale data
 */ 
lore.anno.ui.updateImageData = function (img, doc) {
	var _img = $(img);
	var scale = _img.data("scale");
					
	if ( !scale || scale.imgWidth != _img.width() ||
					scale.imgHeight != _img.height()) {
						// either no scale information stored, or is out of date
						scale = lore.util.getImageScaleFactor(_img.get(0), doc );
						_img.data("scale", scale);
					}
	return scale;
};

