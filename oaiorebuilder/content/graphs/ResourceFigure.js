
/* 
 * Based on ExtJS UI integration example from draw2d.org
 * Modified for use with OAI-ORE Graph Builder
 * Anna Gerber, UQ ITEE eResearch, May 2008
 * Copyright (c) 2008 The University of Queensland
 * 
 * Displays a resource identified by a url and stored associated metadata
 * 
 */

oaiorebuilder.ResourceFigure=function()
{this.cornerWidth=15;
this.url = "";
this.metadataproperties = {"Resource" : this.url};
this.cornerHeight=14.5;
draw2d.Node.call(this);
this.setDimension(250,150);
this.originalHeight=-1;};

oaiorebuilder.ResourceFigure.prototype=new draw2d.Node;
oaiorebuilder.ResourceFigure.prototype.type="oaiorebuilder.ResourceFigure";

oaiorebuilder.ResourceFigure.prototype.createHTMLElement=function()
{var item=document.createElement("div");
item.id=this.id;
item.style.position="absolute";
item.style.left=this.x+"px";
item.style.top=this.y+"px";
item.style.height=this.height+"px";
item.style.width=this.width+"px";
item.style.margin="0px";
item.style.padding="0px";
item.style.outline="none";
item.style.zIndex=""+draw2d.Figure.ZOrderBaseIndex;

this.top_left=document.createElement("div");
this.top_left.style.background="url(chrome://oaiorebuilder/skin/resourcenodecircleminus.gif) no-repeat top left";
this.top_left.style.position="absolute";
this.top_left.style.width=this.cornerWidth+"px";
this.top_left.style.height=this.cornerHeight+"px";
this.top_left.style.left="0px";
this.top_left.style.top="0px";this.top_left.style.fontSize="2px";
this.top_right=document.createElement("div");
this.top_right.style.background="url(chrome://oaiorebuilder/skin/resourcenodecircleminus.gif) no-repeat top right";
this.top_right.style.position="absolute";
this.top_right.style.width=this.cornerWidth+"px";
this.top_right.style.height=this.cornerHeight+"px";
this.top_right.style.left="0px";
this.top_right.style.top="0px";
this.top_right.style.fontSize="2px";
this.bottom_left=document.createElement("div");
this.bottom_left.style.background="url(chrome://oaiorebuilder/skin/resourcenodecircleminus.gif) no-repeat bottom left";
this.bottom_left.style.position="absolute";
this.bottom_left.style.width=this.cornerWidth+"px";
this.bottom_left.style.height=(this.cornerHeight-1)+"px";
this.bottom_left.style.left="0px";
this.bottom_left.style.top="0px";
this.bottom_left.style.fontSize="2px";
this.bottom_right=document.createElement("div");
this.bottom_right.style.background="url(chrome://oaiorebuilder/skin/resourcenodecircleminus.gif) no-repeat bottom right";
this.bottom_right.style.position="absolute";
this.bottom_right.style.width=this.cornerWidth+"px";
this.bottom_right.style.height=(this.cornerHeight-1)+"px";
this.bottom_right.style.left="0px";
this.bottom_right.style.top="0px";
this.bottom_right.style.fontSize="2px";this.header=document.createElement("div");
this.header.style.position="absolute";this.header.style.left=this.cornerWidth+"px";
this.header.style.top="0px";this.header.style.height=(this.cornerHeight)+"px";
this.header.style.backgroundColor="#e5e5e5";
this.header.style.color="#333341";
this.header.style.borderTop="1px solid #aeaeae";
this.header.style.fontSize="10px";
this.header.style.textAlign="center";
this.header.style.fontFamily="tahoma, arial, helvetica";
this.footer=document.createElement("div");
this.footer.style.position="absolute";
this.footer.style.left=this.cornerWidth+"px";
this.footer.style.top="0px";
this.footer.style.height=(this.cornerHeight-2)+"px";
this.footer.style.backgroundColor="transparent";
this.footer.style.borderBottom="1px solid #aeaeae";
this.footer.style.fontSize="2px";
this.textarea=document.createElement("div");
this.textarea.style.position="absolute";
this.textarea.style.left="0px";
this.textarea.style.top=this.cornerHeight+"px";
this.textarea.style.backgroundColor="white";
this.textarea.style.borderTop="1px solid #aeaeae";
this.textarea.style.borderLeft="1px solid #aeaeae";
this.textarea.style.borderRight="1px solid #aeaeae";
this.textarea.style.overflow="hidden";
this.textarea.style.fontSize="9pt";
this.metadataarea = document.createElement("div");
this.metadataarea.style.paddingLeft="3px";
this.metadataarea.style.borderBottom="1px solid #aeaeae";
this.iframearea = document.createElement("div");
this.iframearea.style.border="none";
this.textarea.appendChild(this.metadataarea);
this.textarea.appendChild(this.iframearea);
this.disableTextSelection(this.textarea);
item.appendChild(this.top_left);
item.appendChild(this.header);
item.appendChild(this.top_right);
item.appendChild(this.textarea);
item.appendChild(this.bottom_left);
item.appendChild(this.footer);
item.appendChild(this.bottom_right);
return item;};

oaiorebuilder.ResourceFigure.prototype.setDimension=function(w,h)
{draw2d.Node.prototype.setDimension.call(this,w,h);
if(this.top_left!=null)
{
	this.top_right.style.left=(this.width-this.cornerWidth)+"px";
	this.bottom_right.style.left=(this.width-this.cornerWidth)+"px";
	this.bottom_right.style.top=(this.height-this.cornerHeight)+"px";
	this.bottom_left.style.top=(this.height-this.cornerHeight)+"px";
	this.textarea.style.width=(this.width-2)+"px";
	this.iframearea.style.width=(this.width-3) + "px";
	this.textarea.style.height=(this.height-this.cornerHeight*2)+"px";
	this.iframearea.style.height=(this.height - this.cornerHeight*2 - 11) + "px";
	this.header.style.width=(this.width-this.cornerWidth*2)+"px";
	this.footer.style.width=(this.width-this.cornerWidth*2)+"px";
	this.footer.style.top=(this.height-this.cornerHeight)+"px";
}
if(this.outputPort!=null){
	this.outputPort.setPosition(this.width+5,this.height/2);
}
if(this.inputPort!=null){
	this.inputPort.setPosition(-5,this.height/2);
}
};
oaiorebuilder.ResourceFigure.prototype.setTitle=function(title){
	this.header.innerHTML=title;
};


oaiorebuilder.ResourceFigure.prototype.setContent=function(urlparam)
{
if (urlparam && urlparam != ""){
	var theurl = urlparam;
}
else {var theurl = "about:blank";}
this.setMetadata(theurl);
// Don't display PDFs in preview TODO this should be done from mime type not just file extension
if (!theurl.contains(".pdf"))
	this.iframearea.innerHTML="<object id='" + theurl + "-data' data='" + theurl + "' style='z-index:-9001' width='100%' height='100%'></object>";
this.setIcon(theurl);
};

oaiorebuilder.ResourceFigure.prototype.setMetadata=function(urlparam)
{
	this.url=urlparam;
	this.metadataproperties["Resource"] = urlparam;
	this.metadataarea.innerHTML="<ul><li id='"+ urlparam + "-icon'>" +
		"<a target='_blank' href='" + urlparam + "'>" + urlparam + "</a></li></ul>";
}
oaiorebuilder.ResourceFigure.prototype.setIcon=function(theurl)
{
	var mimetype = "text/html";
	var handler = this;
	try {
		var req = new XMLHttpRequest();
		req.open('GET', theurl, true); 
		req.onreadystatechange = function (aEvt) {
  			if (req.readyState == 4) {
				var mimetype = "";
				try {
      				mimetype = req.getResponseHeader('Content-Type');
				} catch (e) {}
				var icontype = "mimeicon ";
				if (mimetype.contains("html"))
					icontype += "htmlicon";
				else if (mimetype.contains("image")){
					icontype += "imageicon";
					document.getElementById(theurl + "-data").style.width='auto';
				}
				else if (mimetype.contains("audio")) {
					icontype += "audioicon";
				}
				else if (mimetype.contains("video") || mimetype.contains("flash")) 
					icontype += "videoicon";
				else if (mimetype.contains("pdf")) {
					icontype += "pdficon";
					document.getElementById(theurl + "-data")
				}
				else 
					icontype += "pageicon";
				if (mimetype && mimetype != "" && !handler.metadataproperties["dc:format"])
					handler.metadataproperties["dc:format"] = mimetype;
				document.getElementById(theurl + '-icon').className = icontype;
  			}
		};
		req.send(null);
	} catch (e) {}
}

oaiorebuilder.ResourceFigure.prototype.onDragstart=function(x,y){
	var _4677=draw2d.Node.prototype.onDragstart.call(this,x,y);
	if(this.header==null){return false;}
	if(y<this.cornerHeight&&x<this.width&&x>(this.width-this.cornerWidth))
	{
		this.toggle();
		return false;
	}
	if(this.originalHeight==-1){
		if(this.canDrag==true&&x<parseInt(this.header.style.width)&&y<parseInt(this.header.style.height)){return true;}
	}else{return _4677;}};
oaiorebuilder.ResourceFigure.prototype.setCanDrag=function(flag){
	draw2d.Node.prototype.setCanDrag.call(this,flag);
	this.html.style.cursor="";
	if(this.header==null){return;}
	if(flag){this.header.style.cursor="move";}else{this.header.style.cursor="";}
};
oaiorebuilder.ResourceFigure.prototype.setWorkflow=function(_4679){
	draw2d.Node.prototype.setWorkflow.call(this,_4679);
	if(_4679!=null&&this.inputPort==null){
		this.inputPort=new oaiorebuilder.InputPort();
		this.inputPort.setWorkflow(_4679);
		this.inputPort.setName("input");
		this.inputPort.setBackgroundColor(new draw2d.Color(255,204,51));
		this.inputPort.setColor(new draw2d.Color(174,174,174));
		this.addPort(this.inputPort,-5,this.height/2);
		this.outputPort=new oaiorebuilder.OutputPort();
		this.outputPort.setMaxFanOut(5);
		this.outputPort.setWorkflow(_4679);
		this.outputPort.setName("output");
		this.outputPort.setBackgroundColor(new draw2d.Color(255,204,51));
		this.outputPort.setColor(new draw2d.Color(174,174,174));
		this.addPort(this.outputPort,this.width+5,this.height/2);}
};
oaiorebuilder.ResourceFigure.prototype.toggle=function(){
	if(this.originalHeight==-1){
		this.originalHeight=this.height;
		this.iframearea.style.display="none";
		var newHeight = this.metadataarea.offsetHeight + this.header.offsetHeight + this.footer.offsetHeight - 4;
		this.setDimension(this.width,newHeight);
		this.setResizeable(false);
		this.top_left.style.background="url(chrome://oaiorebuilder/skin/resourcenodecircleplus.gif) no-repeat top left";
		this.top_right.style.background="url(chrome://oaiorebuilder/skin/resourcenodecircleplus.gif) no-repeat top right";
		this.bottom_left.style.background="url(chrome://oaiorebuilder/skin/resourcenodecircleplus.gif) no-repeat bottom left";
		this.bottom_right.style.background="url(chrome://oaiorebuilder/skin/resourcenodecircleplus.gif) no-repeat bottom right";
	}
	else{
		this.setDimension(this.width,this.originalHeight);
		this.iframearea.style.display="block";
		this.originalHeight=-1;
		this.setResizeable(true);
		this.top_left.style.background="url(chrome://oaiorebuilder/skin/resourcenodecircleminus.gif) no-repeat top left";
		this.top_right.style.background="url(chrome://oaiorebuilder/skin/resourcenodecircleminus.gif) no-repeat top right";
		this.bottom_left.style.background="url(chrome://oaiorebuilder/skin/resourcenodecircleminus.gif) no-repeat bottom left";
		this.bottom_right.style.background="url(chrome://oaiorebuilder/skin/resourcenodecircleminus.gif) no-repeat bottom right";
		}};
oaiorebuilder.ResourceFigure.prototype.updateMetadata=function(source){
	this.metadataproperties = source;
	if (source["Resource"] != this.url) {
		this.setContent(source["Resource"]);
	}
}
/*oaiorebuilder.ResourceFigure.prototype.getContextMenu=function()
{
  var menu =new draw2d.Menu();
  var oThis = this;

  menu.appendMenuItem(new draw2d.MenuItem("Add rdf:type", null,function(){}));
  menu.appendMenuItem(new draw2d.MenuItem("Add ore:isAggregatedBy", null,function(){}));

  return menu;
}*/