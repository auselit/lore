	/*
		 * General functions
		 */
		
		
		
/**
 * Disable or enable the annotations view
 * @param {Object} opts Object containing disable/enable options. Valid fields includes opts.disable_annotations
 */	
lore.anno.ui.disableUIFeatures = function(opts) {
    lore.debug.ui("LORE Annotations: disable ui features?", opts);
    lore.anno.ui.disabled = opts;

	// don't set visibility on start up 
	if (!lore.anno.ui.disableUIFeatures.initialCall) {
		lore.anno.ui.disableUIFeatures.initialCall = 1;
	}
	else {
	
		if (opts.disable_annotations) {
			lore.anno.ui.topView.setAnnotationsVisibility(false);
		}
		else {
			lore.anno.ui.topView.setAnnotationsVisibility(true);
		}
	}
}



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