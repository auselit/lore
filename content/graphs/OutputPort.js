/* Ouput port that accepts connections to ContextmenuConnections
 * 
 */
lore.ore.graph.OutputPort=function(_48a4){draw2d.OutputPort.call(this,_48a4);};
lore.ore.graph.OutputPort.prototype=new draw2d.OutputPort;
lore.ore.graph.OutputPort.prototype.type="lore.ore.graph.OutputPort";
lore.ore.graph.OutputPort.prototype.onDrop=function(port)
{if(this.getMaxFanOut()<=this.getFanOut()){return;}
if(this.parentNode.id==port.parentNode.id){}
else{var _48a6=new draw2d.CommandConnect(this.parentNode.workflow,this,port);
_48a6.setConnection(new lore.ore.graph.ContextmenuConnection());
this.parentNode.workflow.getCommandStack().execute(_48a6);}};