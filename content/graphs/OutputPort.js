/* Ouput port that accepts connections to ContextmenuConnections
 * 
 */
oaiorebuilder.OutputPort=function(_48a4){draw2d.OutputPort.call(this,_48a4);};
oaiorebuilder.OutputPort.prototype=new draw2d.OutputPort;
oaiorebuilder.OutputPort.prototype.type="oaiorebuilder.OutputPort";
oaiorebuilder.OutputPort.prototype.onDrop=function(port)
{if(this.getMaxFanOut()<=this.getFanOut()){return;}
if(this.parentNode.id==port.parentNode.id){}
else{var _48a6=new draw2d.CommandConnect(this.parentNode.workflow,this,port);
_48a6.setConnection(new oaiorebuilder.ContextmenuConnection());
this.parentNode.workflow.getCommandStack().execute(_48a6);}};