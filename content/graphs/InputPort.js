/* Input port that accepts connections from ContextmenuConnections 
 * 
 */
lore.ore.graph.InputPort=function(_5320){draw2d.InputPort.call(this,_5320);};
lore.ore.graph.InputPort.prototype=new draw2d.InputPort;
lore.ore.graph.InputPort.prototype.type="lore.ore.graph.InputPort";
lore.ore.graph.InputPort.prototype.onDrop=function(port){
if(port.getMaxFanOut&&port.getMaxFanOut()<=port.getFanOut()){return;}
if(this.parentNode.id==port.parentNode.id){}
else{var _5322=new draw2d.CommandConnect(this.parentNode.workflow,port,this);
_5322.setConnection(new lore.ore.graph.ContextmenuConnection());
this.parentNode.workflow.getCommandStack().execute(_5322);}};