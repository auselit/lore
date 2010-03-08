/**
 * @class draw2d.Menu
 */
 
/**
 * Fix problem in draw2d menu: not displaying icons
 * 
 **/
draw2d.Menu.prototype.createList=function()
{
  this.dirty=false;
  this.html.innerHTML="";
  var oThis = this;
  for(var i=0;i<this.menuItems.getSize();i++)
  {
      var item = this.menuItems.get(i);

      var li = document.createElement("a");
      li.innerHTML = (item.iconUrl? "<img style='padding-right:5px' src='" + item.iconUrl + "'>" : "") 
        + item.getLabel();
      li.style.display="block";
      li.style.fontFamily="Verdana, Arial, Helvetica, sans-serif";
      li.style.fontSize="9pt";
      li.style.color="dimgray";
      li.style.borderBottom="1px solid silver";
      li.style.paddingLeft="5px";
      li.style.paddingRight="5px";
      li.style.cursor="pointer";
      
      
      this.html.appendChild(li);

      li.menuItem = item;
      if (li.addEventListener) 
      {
         li.addEventListener("click",  function(event)
         {
            var oEvent = arguments[0] || window.event;
            oEvent.cancelBubble = true; 
            oEvent.returnValue = false;
            var diffX = oEvent.clientX;// - oThis.html.offsetLeft;
            var diffY = oEvent.clientY;// - oThis.html.offsetTop;
            var scrollLeft= document.body.parentNode.scrollLeft;
            var scrollTop = document.body.parentNode.scrollTop;
            this.menuItem.execute(diffX+scrollLeft, diffY+scrollTop);
         }, false);
         li.addEventListener("mouseup",  function(event){event.cancelBubble = true; event.returnValue = false;}, false);
         li.addEventListener("mousedown",  function(event){event.cancelBubble = true; event.returnValue = false;}, false);
         li.addEventListener("mouseover", function(event){this.style.backgroundColor="silver";},false);
         li.addEventListener("mouseout", function(event){this.style.backgroundColor="transparent";},false);
      } 
      else if (li.attachEvent) 
      {
         li.attachEvent("onclick",  function(event)
         {
            var oEvent = arguments[0] || window.event;
            oEvent.cancelBubble = true; 
            oEvent.returnValue = false;
            var diffX = oEvent.clientX;// - oThis.html.offsetLeft;
            var diffY = oEvent.clientY;// - oThis.html.offsetTop;
            var scrollLeft= document.body.parentNode.scrollLeft;
            var scrollTop = document.body.parentNode.scrollTop;
            event.srcElement.menuItem.execute(diffX+scrollLeft, diffY+scrollTop);
         });
         li.attachEvent("onmousedown",  function(event){event.cancelBubble = true; event.returnValue = false;});
         li.attachEvent("onmouseup",  function(event){event.cancelBubble = true; event.returnValue = false;});
         li.attachEvent("onmouseover", function(event){event.srcElement.style.backgroundColor="silver";});
         li.attachEvent("onmouseout", function(event){event.srcElement.style.backgroundColor="transparent";});
      }
  }
}