/**
 * Midas Command for creating custom buttons in HTMLEditor
 * From http://code.google.com/p/ext-ux-htmleditor-plugins/ (MIT License)
 * Modified by Anna to be compatible with Ext 2.2.x
 * Also to add button to insert image
 * 
 * Damien (17/03/2011):
 * Added a font colour button, since the built in one also adds a 
 * background highlight colour button, which doesn't work if CSS styling
 * is turned off.
 */
Ext.ns('Ext.ux.form.HtmlEditor');

Ext.ux.form.HtmlEditor.MidasCommand = Ext.extend(Ext.util.Observable, {
    init: function(cmp){
        this.cmp = cmp;
        this.cmp.on('render', this.onRender, this);
    },
    onRender: function() {
        var midasCmdButtons = [];
        Ext.each(this.midasBtns,function(b){
            if (b && typeof b == "object") {
                midasCmdButtons.push({
                    iconCls: 'x-edit-' + b.cmd,
                    handler: function(){
                        this.cmp.relayCmd(b.cmd);
                    },
                    scope: this,
                    tooltip: b.title
                });
            }else{
                midasCmdButtons.push(new Ext.Toolbar.Separator());
            }
        }, this);
        this.cmp.getToolbar().addButton(midasCmdButtons);
    }
});

Ext.ux.form.HtmlEditor.Img = Ext.extend(Ext.util.Observable, {
    init: function(cmp){
        this.cmp = cmp;
        this.cmp.on('render', this.onRender, this);
    },
    onRender: function() {
        var cmp = this.cmp;
        var btn = this.cmp.getToolbar().addButton({
          iconCls: 'x-edit-img',
          handler: function() {
            this.imgWindow = new Ext.Window({
                title: 'Insert image',
                items: [{
                    itemId: 'insert-img',
                    xtype: 'form',
                    border: false,
                    plain: true,
                    bodyStyle: 'padding: 10px;',
                    labelWidth: 30,
                    labelAlign: 'right',
                    items: [{
                        xtype: 'label',
                        html: 'Enter the full URL of the image<br/>&nbsp;'
                    },{
                        xtype: 'textfield',
                        regexText: 'Enter the full URL to the image including http:// at the start',
                        // at least check it starts with http:// probably should do more validation
                        regex: /^http:\/\/[.]*/,
                        fieldLabel: 'URL',
                        name: 'imgurl',
                        value: 'http://',
                        width: 140,
                        listeners: {
                            specialkey: function(f, e){
                                if (e.getKey() == e.ENTER || e.getKey() == e.RETURN){
                                    this.insertImg();
                                }
                            },
                            scope: this
                        }
                    }]
                }],
                buttons: [{
                    text: 'Insert',
                    handler: this.insertImg,
                    scope: this
                }, {
                    text: 'Cancel',
                    handler: this.close,
                    scope: this
                }]
            });
            this.imgWindow.show(); 
          },
          scope: this,
          tooltip: 'Insert image'
        });
    },
    close: function(){
      this.imgWindow.close();  
    },
    insertImg: function() {
        try {
        var frm = this.imgWindow.getComponent('insert-img').getForm();
        if (frm.isValid()) {
            var imgurl = frm.findField('imgurl').getValue();
            if (imgurl) {
                this.cmp.insertAtCursor('<img src="'+imgurl+'"/>');
            }
            this.imgWindow.close();
        }
        } catch (ex) {
            lore.debug.ui("problem in insertImg",ex);
        }
    }
});

Ext.ux.form.HtmlEditor.ForegroundFontButton = Ext.extend(Ext.util.Observable, {
    init: function(cmp){
        this.cmp = cmp;
        this.cmp.on('render', this.onRender, this);
    },
    onRender: function() {
    	var cmp = this.cmp;
    	var btn = this.cmp.getToolbar().addButton({
            itemId:'forecolor',
            cls:'x-btn-icon',
            iconCls: 'x-edit-forecolor',
            clickEvent:'mousedown',
//            tooltip: tipsEnabled ? editor.buttonTips.forecolor || undefined : undefined,
            tabIndex:-1,
            menu : new Ext.menu.ColorMenu({
                allowReselect: true,
                focus: Ext.emptyFn,
                value:'000000',
                plain:true,
                listeners: {
                    scope: this,
                    select: function(cp, color){
                        this.cmp.execCmd('forecolor', Ext.isWebKit || Ext.isIE ? '#'+color : color);
                        this.cmp.deferFocus();
                    }
                },
                clickEvent:'mousedown'
            })
    	});
    }
    
});