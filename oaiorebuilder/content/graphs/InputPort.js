/* Input port that accepts connections from ContextmenuConnections 
 * 
 */
oaiorebuilder.InputPort=function(_5320){draw2d.InputPort.call(this,_5320);};
oaiorebuilder.InputPort.prototype=new draw2d.InputPort;
oaiorebuilder.InputPort.prototype.type="oaiorebuilder.InputPort";
oaiorebuilder.InputPort.prototype.onDrop=function(port){
if(port.getMaxFanOut&&port.getMaxFanOut()<=port.getFanOut()){return;}
if(this.parentNode.id==port.parentNode.id){}
else{var _5322=new draw2d.CommandConnect(this.parentNode.workflow,port,this);
_5322.setConnection(new oaiorebuilder.ContextmenuConnection());
this.parentNode.workflow.getCommandStack().execute(_5322);}};