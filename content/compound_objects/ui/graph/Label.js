/** 
 * @class lore.draw2d.Label An editable label that represents a relationship between resources
 */
lore.draw2d.Label = function(msg) {
    this.msg = msg;
    this.bgColor = null;
    this.color = new lore.draw2d.Color(0, 0, 0);
    this.fontSize = 10;
    this.textNode = null;
    this.align = "center";
    lore.draw2d.Figure.call(this);
    this.html.className="ctxtConnLabel";
    this.createEditElement();
    //TODO: enable filtering by direct editing of label
    //Ext.get(this.getHTMLElement()).on('dblclick',this.startEditing,this);
    Ext.get(this.getHTMLElement()).on('dblclick',this.showMenu,this);
    this.editing = false;
};
Ext.extend(lore.draw2d.Label, lore.draw2d.Figure, {
    /** sets up an editable field to change the relationship type */
    createEditElement : function(){
        try{
        this.editField = new Ext.form.TriggerField({
            editable: true,
            width: 100,
            renderTo: this.getHTMLElement(),
            hidden: true,
            triggerClass: 'x-form-ellipsis-trigger',
            triggerConfig: {
               tag : "img", 
               src : Ext.BLANK_IMAGE_URL,
               cls: "x-form-trigger x-form-ellipsis-trigger",
               qtip: 'Set relationship'
            },
            onTriggerClick: function(ev) {
               try {
                lore.debug.ore("on trigger click",ev);
                lore.draw2d.Connection.contextmenu.showAt(ev.xy);
             
                
               } catch (e){
                   lore.debug.ore("problem in trigger click",e);
               }
            } 
        });
        this.editField.on("specialkey",function(f,e){   
            var key = e.getKey();
            if (e.getKey() == e.ENTER || e.getKey() == e.ESC){
                // cancel edit if escape is pressed
                this.stopEditing(key == e.ESC);
            }
                
        },this);
        this.editField.on("blur",function(f,n,o){
                this.stopEditing();
        },this);
        } catch (ex){
            lore.debug.ore("createEditElement",ex);
        }
    },
    createHTMLElement : function() {
        var item = lore.draw2d.Figure.prototype.createHTMLElement.call(this);
        this.textNode = document.createTextNode(this.msg);
        item.appendChild(this.textNode);
        item.style.color = this.color.getHTMLStyle();
        item.style.fontSize = this.fontSize + "pt";
        item.style.width = "auto";
        item.style.height = "auto";
        item.style.paddingLeft = "3px";
        item.style.paddingRight = "3px";
        item.style.textAlign = this.align;
        item.style.MozUserSelect = "none";
        this.disableTextSelection(item);
        if (this.bgColor != null) {
            item.style.backgroundColor = this.bgColor.getHTMLStyle();
        }
        return item;
    },
    isResizable: function(){
        return false;
    },
    setWordwrap : function(flag) {
        this.html.style.whiteSpace = flag ? "wrap" : "nowrap";
    },
    setAlign : function(align) {
        this.align = align;
        this.html.style.textAlign = align;
    },
    
    setBackgroundColor : function(color) {
        this.bgColor = color;
        if (this.bgColor != null) {
            this.html.style.backgroundColor = this.bgColor.getHTMLStyle();
        } else {
            this.html.style.backgroundColor = "transparent";
        }
    },
    setColor : function(color) {
    this.color = color;
    this.html.style.color = this.color.getHTMLStyle();
    },
    setFontSize : function(size) {
        this.fontSize = size;
        this.html.style.fontSize = this.fontSize + "pt";
    },
    getWidth : function() {
        if (window.getComputedStyle) {
            return parseInt(getComputedStyle(this.html, "")
                    .getPropertyValue("width"));
        }
        return parseInt(this.html.clientWidth);
    },
    getHeight : function() {
        if (window.getComputedStyle) {
            return parseInt(getComputedStyle(this.html, "")
                    .getPropertyValue("height"));
        }
        return parseInt(this.html.clientHeight);
    },
    getText : function() {
        return this.msg;
    },
    setText : function(text) {
        this.msg = text;
        this.html.removeChild(this.textNode);
        this.textNode = document.createTextNode(this.msg);
        this.html.appendChild(this.textNode);
    },
    setStyledText : function(text) {
        this.msg = text;
        this.html.removeChild(this.textNode);
        this.textNode = document.createElement("div");
        this.textNode.style.whiteSpace = "nowrap";
        this.textNode.textContent = text;
        this.html.appendChild(this.textNode);
    },
    /** 
     * Stop direct editing of relationship
     */
    stopEditing : function(cancel){
        if (!cancel && this.editField.isValid()){
            // update rel
        }
        this.editField.hide();
        Ext.get(this.textNode).show();
        this.parent.workflow.editingText = false;
        this.editing = false;
    },
    /**
     * Start direct editing of relationship
     */
    startEditing : function(){
        try{
            lore.debug.ore("startEditing",this.editField);
        if (this.editing){
            return;
        }
        this.editing = true;
        // hide display label
        Ext.get(this.textNode).hide();
        // display editing field with current value
        this.editField.setRawValue(this.getText());
        this.editField.show();
        
        // prevent keystrokes entered into text field being interpreted by editor to move/delete nodes
        var wf = this.parent.workflow;
        wf.editingText = true;
        
        this.editField.focus();
        //this.editField.expand();
        } catch (ex){
            lore.debug.ore("startEditing",ex);
        }
    },
    showMenu : function(ev){
        var pos = ev.xy;  
        this.parent.onContextMenu(pos[0],pos[1],true)
    }
});