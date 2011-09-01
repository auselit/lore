
/**
 * lore.draw2d
 * 
 * * Based on the Draw2D Library: http://www.draw2d.org Copyright: 2006 Andreas
 * * Herz. All rights reserved. Created: 5.11.2006 by Andreas Herz (Web:
 * * http://www.freegroup.de ) LICENSE: LGPL
 * 
 * Modified to simplify library for use with LORE, 
 * and to use Raphael for graphics rather than wz_jsGraphics
 */

Ext.ns("lore.draw2d");
lore.draw2d.Event = function() {
	this.type = null;
	this.target = null;
	this.relatedTarget = null;
	this.cancelable = false;
	this.timeStamp = null;
	this.returnValue = true;
};
lore.draw2d.Event.prototype.initEvent = function(sType, _60e2) {
	this.type = sType;
	this.cancelable = _60e2;
	this.timeStamp = (new Date()).getTime();
};
lore.draw2d.Event.prototype.preventDefault = function() {
	if (this.cancelable) {
		this.returnValue = false;
	}
};
lore.draw2d.EventTarget = function() {
	this.eventhandlers = new Object();
};
lore.draw2d.EventTarget.prototype.addEventListener = function(sType, _60e7) {
	if (typeof this.eventhandlers[sType] == "undefined") {
		this.eventhandlers[sType] = new Array;
	}
	this.eventhandlers[sType][this.eventhandlers[sType].length] = _60e7;
};
lore.draw2d.EventTarget.prototype.dispatchEvent = function(_60e8) {
	_60e8.target = this;
	if (typeof this.eventhandlers[_60e8.type] != "undefined") {
		for (var i = 0; i < this.eventhandlers[_60e8.type].length; i++) {
			this.eventhandlers[_60e8.type][i](_60e8);
		}
	}
	return _60e8.returnValue;
};
lore.draw2d.EventTarget.prototype.removeEventListener = function(sType, _60eb) {
	if (typeof this.eventhandlers[sType] != "undefined") {
		var _60ec = new Array;
		for (var i = 0; i < this.eventhandlers[sType].length; i++) {
			if (this.eventhandlers[sType][i] != _60eb) {
				_60ec[_60ec.length] = this.eventhandlers[sType][i];
			}
		}
		this.eventhandlers[sType] = _60ec;
	}
};

lore.draw2d.UUID = function() {
};
lore.draw2d.UUID.prototype.type = "lore.draw2d.UUID";
lore.draw2d.UUID.create = function() {
	var _5f17 = function() {
		return (((1 + Math.random()) * 65536) | 0).toString(16).substring(1);
	};
	return (_5f17() + _5f17() + "-" + _5f17() + "-" + _5f17() + "-" + _5f17()
			+ "-" + _5f17() + _5f17() + _5f17());
};
lore.draw2d.ArrayList = function() {
	this.increment = 10;
	this.size = 0;
	this.data = new Array(this.increment);
};
lore.draw2d.ArrayList.EMPTY_LIST = new lore.draw2d.ArrayList();
lore.draw2d.ArrayList.prototype.type = "lore.draw2d.ArrayList";
lore.draw2d.ArrayList.prototype.reverse = function() {
	var _5aff = new Array(this.size);
	for (var i = 0; i < this.size; i++) {
		_5aff[i] = this.data[this.size - i - 1];
	}
	this.data = _5aff;
};
lore.draw2d.ArrayList.prototype.getCapacity = function() {
	return this.data.length;
};
lore.draw2d.ArrayList.prototype.getSize = function() {
	return this.size;
};
lore.draw2d.ArrayList.prototype.isEmpty = function() {
	return this.getSize() == 0;
};
lore.draw2d.ArrayList.prototype.getLastElement = function() {
	if (this.data[this.getSize() - 1] != null) {
		return this.data[this.getSize() - 1];
	}
};
lore.draw2d.ArrayList.prototype.getFirstElement = function() {
	if (this.data[0] != null) {
		return this.data[0];
	}
};
lore.draw2d.ArrayList.prototype.get = function(i) {
	return this.data[i];
};
lore.draw2d.ArrayList.prototype.add = function(obj) {
	if (this.getSize() == this.data.length) {
		this.resize();
	}
	this.data[this.size++] = obj;
};
lore.draw2d.ArrayList.prototype.addAll = function(obj) {
	for (var i = 0; i < obj.getSize(); i++) {
		this.add(obj.get(i));
	}
};
lore.draw2d.ArrayList.prototype.remove = function(obj) {
	var index = this.indexOf(obj);
	if (index >= 0) {
		return this.removeElementAt(index);
	}
	return null;
};
lore.draw2d.ArrayList.prototype.insertElementAt = function(obj, index) {
	if (this.size == this.capacity) {
		this.resize();
	}
	for (var i = this.getSize(); i > index; i--) {
		this.data[i] = this.data[i - 1];
	}
	this.data[index] = obj;
	this.size++;
};
lore.draw2d.ArrayList.prototype.removeElementAt = function(index) {
	var _5b0b = this.data[index];
	for (var i = index; i < (this.getSize() - 1); i++) {
		this.data[i] = this.data[i + 1];
	}
	this.data[this.getSize() - 1] = null;
	this.size--;
	return _5b0b;
};
lore.draw2d.ArrayList.prototype.removeAllElements = function() {
	this.size = 0;
	for (var i = 0; i < this.data.length; i++) {
		this.data[i] = null;
	}
};
lore.draw2d.ArrayList.prototype.indexOf = function(obj) {
	for (var i = 0; i < this.getSize(); i++) {
		if (this.data[i] == obj) {
			return i;
		}
	}
	return -1;
};
lore.draw2d.ArrayList.prototype.contains = function(obj) {
	for (var i = 0; i < this.getSize(); i++) {
		if (this.data[i] == obj) {
			return true;
		}
	}
	return false;
};
lore.draw2d.ArrayList.prototype.resize = function() {
	var newData = new Array(this.data.length + this.increment);
	for (var i = 0; i < this.data.length; i++) {
		newData[i] = this.data[i];
	}
	this.data = newData;
};
lore.draw2d.ArrayList.prototype.trimToSize = function() {
	if (this.data.length == this.size) {
		return;
	}
	var temp = new Array(this.getSize());
	for (var i = 0; i < this.getSize(); i++) {
		temp[i] = this.data[i];
	}
	this.size = temp.length;
	this.data = temp;
};
lore.draw2d.ArrayList.prototype.sort = function(f) {
	var i, j;
	var _5b17;
	var _5b18;
	var _5b19;
	var _5b1a;
	for (i = 1; i < this.getSize(); i++) {
		_5b18 = this.data[i];
		_5b17 = _5b18[f];
		j = i - 1;
		_5b19 = this.data[j];
		_5b1a = _5b19[f];
		while (j >= 0 && _5b1a > _5b17) {
			this.data[j + 1] = this.data[j];
			j--;
			if (j >= 0) {
				_5b19 = this.data[j];
				_5b1a = _5b19[f];
			}
		}
		this.data[j + 1] = _5b18;
	}
};
lore.draw2d.ArrayList.prototype.clone = function() {
	var _5b1b = new lore.draw2d.ArrayList(this.size);
	for (var i = 0; i < this.size; i++) {
		_5b1b.add(this.data[i]);
	}
	return _5b1b;
};
lore.draw2d.ArrayList.prototype.overwriteElementAt = function(obj, index) {
	this.data[index] = obj;
};
lore.draw2d.ArrayList.prototype.getPersistentAttributes = function() {
	return {
		data : this.data,
		increment : this.increment,
		size : this.getSize()
	};
};

lore.draw2d.Drag = function() {
};
lore.draw2d.Drag.current = null;
lore.draw2d.Drag.currentTarget = null;
lore.draw2d.Drag.dragging = false;
lore.draw2d.Drag.isDragging = function() {
	return this.dragging;
};
lore.draw2d.Drag.setCurrent = function(_4bc3) {
	this.current = _4bc3;
	this.dragging = true;
};
lore.draw2d.Drag.getCurrent = function() {
	return this.current;
};
lore.draw2d.Drag.clearCurrent = function() {
	this.current = null;
	this.dragging = false;
	this.currentTarget = null;
};
lore.draw2d.Draggable = function(_4bc4, _4bc5) {
	lore.draw2d.EventTarget.call(this);
	this.construct(_4bc4, _4bc5);
	this.diffX = 0;
	this.diffY = 0;
	this.targets = new lore.draw2d.ArrayList();
};
lore.draw2d.Draggable.prototype = new lore.draw2d.EventTarget;
lore.draw2d.Draggable.prototype.construct = function(_4bc6, _4bc7) {
	this.element = _4bc6;
	this.constraints = _4bc7;
	var oThis = this;
	var _4bc9 = function() {
		var _4bca = new lore.draw2d.DragDropEvent();
		_4bca.initDragDropEvent("dblclick", true);
		oThis.dispatchEvent(_4bca);
		var _4bcb = arguments[0] || window.event;
		_4bcb.cancelBubble = true;
		_4bcb.returnValue = false;
	};
	var _4bcc = function() {
		var _4bcd = arguments[0] || window.event;
		var _4bce = new lore.draw2d.DragDropEvent();
		var _4bcf = oThis.node.workflow.getAbsoluteX();
		var _4bd0 = oThis.node.workflow.getAbsoluteY();
		var _4bd1 = oThis.node.workflow.getScrollLeft();
		var _4bd2 = oThis.node.workflow.getScrollTop();
		_4bce.x = _4bcd.clientX - oThis.element.offsetLeft + _4bd1 - _4bcf;
		_4bce.y = _4bcd.clientY - oThis.element.offsetTop + _4bd2 - _4bd0;
		if (_4bcd.button == 2) {
			_4bce.initDragDropEvent("contextmenu", true);
			oThis.dispatchEvent(_4bce);
		} else {
			_4bce.initDragDropEvent("dragstart", true);
			if (oThis.dispatchEvent(_4bce)) {
				oThis.diffX = _4bcd.clientX - oThis.element.offsetLeft;
				oThis.diffY = _4bcd.clientY - oThis.element.offsetTop;
				lore.draw2d.Drag.setCurrent(oThis);
				if (oThis.isAttached == true) {
					oThis.detachEventHandlers();
				}
				oThis.attachEventHandlers();
			}
		}
		_4bcd.cancelBubble = true;
		_4bcd.returnValue = false;
	};
	var _4bd3 = function() {
		if (lore.draw2d.Drag.getCurrent() == null) {
			var _4bd4 = arguments[0] || window.event;
			if (lore.draw2d.Drag.currentHover != null
					&& oThis != lore.draw2d.Drag.currentHover) {
				var _4bd5 = new lore.draw2d.DragDropEvent();
				_4bd5.initDragDropEvent("mouseleave", false, oThis);
				lore.draw2d.Drag.currentHover.dispatchEvent(_4bd5);
			}
			if (oThis != null && oThis != lore.draw2d.Drag.currentHover) {
				var _4bd5 = new lore.draw2d.DragDropEvent();
				_4bd5.initDragDropEvent("mouseenter", false, oThis);
				oThis.dispatchEvent(_4bd5);
			}
			lore.draw2d.Drag.currentHover = oThis;
		} else {
		}
	};
	if (this.element.addEventListener) {
		this.element.addEventListener("mousemove", _4bd3, false);
		this.element.addEventListener("mousedown", _4bcc, false);
		this.element.addEventListener("dblclick", _4bc9, false);
	} else {
		if (this.element.attachEvent) {
			this.element.attachEvent("onmousemove", _4bd3);
			this.element.attachEvent("onmousedown", _4bcc);
			this.element.attachEvent("ondblclick", _4bc9);
		} else {
			throw new Error("Drag not supported in this browser.");
		}
	}
};
lore.draw2d.Draggable.prototype.attachEventHandlers = function() {
	var oThis = this;
	oThis.isAttached = true;
	this.tempMouseMove = function() {
		var _4bd7 = arguments[0] || window.event;
		var _4bd8 = new lore.draw2d.Point(_4bd7.clientX - oThis.diffX, _4bd7.clientY
						- oThis.diffY);
		if (oThis.node.getCanSnapToHelper()) {
			_4bd8 = oThis.node.getWorkflow().snapToHelper(oThis.node, _4bd8);
		}
		oThis.element.style.left = _4bd8.x + "px";
		oThis.element.style.top = _4bd8.y + "px";
		var _4bd9 = oThis.node.workflow.getScrollLeft();
		var _4bda = oThis.node.workflow.getScrollTop();
		var _4bdb = oThis.node.workflow.getAbsoluteX();
		var _4bdc = oThis.node.workflow.getAbsoluteY();
		var _4bdd = oThis.getDropTarget(_4bd7.clientX + _4bd9 - _4bdb,
				_4bd7.clientY + _4bda - _4bdc);
		var _4bde = oThis.getCompartment(_4bd7.clientX + _4bd9 - _4bdb,
				_4bd7.clientY + _4bda - _4bdc);
		if (lore.draw2d.Drag.currentTarget != null
				&& _4bdd != lore.draw2d.Drag.currentTarget) {
			var _4bdf = new lore.draw2d.DragDropEvent();
			_4bdf.initDragDropEvent("dragleave", false, oThis);
			lore.draw2d.Drag.currentTarget.dispatchEvent(_4bdf);
		}
		if (_4bdd != null && _4bdd != lore.draw2d.Drag.currentTarget) {
			var _4bdf = new lore.draw2d.DragDropEvent();
			_4bdf.initDragDropEvent("dragenter", false, oThis);
			_4bdd.dispatchEvent(_4bdf);
		}
		lore.draw2d.Drag.currentTarget = _4bdd;
		if (lore.draw2d.Drag.currentCompartment != null
				&& _4bde != lore.draw2d.Drag.currentCompartment) {
			var _4bdf = new lore.draw2d.DragDropEvent();
			_4bdf.initDragDropEvent("figureleave", false, oThis);
			lore.draw2d.Drag.currentCompartment.dispatchEvent(_4bdf);
		}
		if (_4bde != null && _4bde.node != oThis.node
				&& _4bde != lore.draw2d.Drag.currentCompartment) {
			var _4bdf = new lore.draw2d.DragDropEvent();
			_4bdf.initDragDropEvent("figureenter", false, oThis);
			_4bde.dispatchEvent(_4bdf);
		}
		lore.draw2d.Drag.currentCompartment = _4bde;
		var _4be0 = new lore.draw2d.DragDropEvent();
		_4be0.initDragDropEvent("drag", false);
		oThis.dispatchEvent(_4be0);
	};
	oThis.tempMouseUp = function() {
		oThis.detachEventHandlers();
		var _4be1 = arguments[0] || window.event;
		var _4be2 = oThis.node.workflow.getScrollLeft();
		var _4be3 = oThis.node.workflow.getScrollTop();
		var _4be4 = oThis.node.workflow.getAbsoluteX();
		var _4be5 = oThis.node.workflow.getAbsoluteY();
		var _4be6 = oThis.getDropTarget(_4be1.clientX + _4be2 - _4be4,
				_4be1.clientY + _4be3 - _4be5);
		var _4be7 = oThis.getCompartment(_4be1.clientX + _4be2 - _4be4,
				_4be1.clientY + _4be3 - _4be5);
		if (_4be6 != null) {
			var _4be8 = new lore.draw2d.DragDropEvent();
			_4be8.initDragDropEvent("drop", false, oThis);
			_4be6.dispatchEvent(_4be8);
		}
		if (_4be7 != null && _4be7.node != oThis.node) {
			var _4be8 = new lore.draw2d.DragDropEvent();
			_4be8.initDragDropEvent("figuredrop", false, oThis);
			_4be7.dispatchEvent(_4be8);
		}
		if (lore.draw2d.Drag.currentTarget != null) {
			var _4be8 = new lore.draw2d.DragDropEvent();
			_4be8.initDragDropEvent("dragleave", false, oThis);
			lore.draw2d.Drag.currentTarget.dispatchEvent(_4be8);
			lore.draw2d.Drag.currentTarget = null;
		}
		var _4be9 = new lore.draw2d.DragDropEvent();
		_4be9.initDragDropEvent("dragend", false);
		oThis.dispatchEvent(_4be9);
		lore.draw2d.Drag.currentCompartment = null;
		lore.draw2d.Drag.clearCurrent();
	};
	if (document.body.addEventListener) {
		document.body.addEventListener("mousemove", this.tempMouseMove, false);
		document.body.addEventListener("mouseup", this.tempMouseUp, false);
	} else {
		if (document.body.attachEvent) {
			document.body.attachEvent("onmousemove", this.tempMouseMove);
			document.body.attachEvent("onmouseup", this.tempMouseUp);
		} else {
			throw new Error("Drag doesn't support this browser.");
		}
	}
};
lore.draw2d.Draggable.prototype.detachEventHandlers = function() {
	this.isAttached = false;
	if (document.body.removeEventListener) {
		document.body.removeEventListener("mousemove", this.tempMouseMove,
				false);
		document.body.removeEventListener("mouseup", this.tempMouseUp, false);
	} else {
		if (document.body.detachEvent) {
			document.body.detachEvent("onmousemove", this.tempMouseMove);
			document.body.detachEvent("onmouseup", this.tempMouseUp);
		} else {
			throw new Error("Drag doesn't support this browser.");
		}
	}
};
lore.draw2d.Draggable.prototype.getDropTarget = function(x, y) {
	for (var i = 0; i < this.targets.getSize(); i++) {
		var _4bed = this.targets.get(i);
		if (_4bed.node.isOver(x, y) && _4bed.node != this.node) {
			return _4bed;
		}
	}
	return null;
};
lore.draw2d.Draggable.prototype.getCompartment = function(x, y) {
	var _4bf0 = null;
	for (var i = 0; i < this.node.workflow.compartments.getSize(); i++) {
		var _4bf2 = this.node.workflow.compartments.get(i);
		if (_4bf2.isOver(x, y) && _4bf2 != this.node) {
			if (_4bf0 == null) {
				_4bf0 = _4bf2;
			} else {
				if (_4bf0.getZOrder() < _4bf2.getZOrder()) {
					_4bf0 = _4bf2;
				}
			}
		}
	}
	return _4bf0 == null ? null : _4bf0.dropable;
};
lore.draw2d.Draggable.prototype.getCenter = function(){
    return [this.element.offsetLeft + this.element.offsetWidth /2, this.element.offsetTop + this.element.offsetHeight/2];
}
lore.draw2d.Draggable.prototype.getLeft = function() {
	return this.element.offsetLeft;
};
lore.draw2d.Draggable.prototype.getTop = function() {
	return this.element.offsetTop;
};
lore.draw2d.DragDropEvent = function() {
	lore.draw2d.Event.call(this);
};
lore.draw2d.DragDropEvent.prototype = new lore.draw2d.Event();
lore.draw2d.DragDropEvent.prototype.initDragDropEvent = function(sType, _4bf4, _4bf5) {
	this.initEvent(sType, _4bf4);
	this.relatedTarget = _4bf5;
};
lore.draw2d.DropTarget = function(_4bf6) {
	lore.draw2d.EventTarget.call(this);
	this.construct(_4bf6);
};
lore.draw2d.DropTarget.prototype = new lore.draw2d.EventTarget;
lore.draw2d.DropTarget.prototype.construct = function(_4bf7) {
	this.element = _4bf7;
};
lore.draw2d.DropTarget.prototype.getLeft = function() {
	var el = this.element;
	var ol = el.offsetLeft;
	while ((el = el.offsetParent) != null) {
		ol += el.offsetLeft;
	}
	return ol;
};
lore.draw2d.DropTarget.prototype.getTop = function() {
	var el = this.element;
	var ot = el.offsetTop;
	while ((el = el.offsetParent) != null) {
		ot += el.offsetTop;
	}
	return ot;
};
lore.draw2d.DropTarget.prototype.getHeight = function() {
	return this.element.offsetHeight;
};
lore.draw2d.DropTarget.prototype.getWidth = function() {
	return this.element.offsetWidth;
};
lore.draw2d.PositionConstants = function() {
};
lore.draw2d.PositionConstants.NORTH = 1;
lore.draw2d.PositionConstants.SOUTH = 4;
lore.draw2d.PositionConstants.WEST = 8;
lore.draw2d.PositionConstants.EAST = 16;
lore.draw2d.Color = function(red, green, blue) {
	if (typeof green == "undefined") {
		var rgb = this.hex2rgb(red);
		this.red = rgb[0];
		this.green = rgb[1];
		this.blue = rgb[2];
	} else {
		this.red = red;
		this.green = green;
		this.blue = blue;
	}
};
lore.draw2d.Color.prototype.type = "lore.draw2d.Color";
lore.draw2d.Color.prototype.getHTMLStyle = function() {
	return "rgb(" + this.red + "," + this.green + "," + this.blue + ")";
};
lore.draw2d.Color.prototype.getRed = function() {
	return this.red;
};
lore.draw2d.Color.prototype.getGreen = function() {
	return this.green;
};
lore.draw2d.Color.prototype.getBlue = function() {
	return this.blue;
};
lore.draw2d.Color.prototype.getIdealTextColor = function() {
	var _4f13 = 105;
	var _4f14 = (this.red * 0.299) + (this.green * 0.587) + (this.blue * 0.114);
	return (255 - _4f14 < _4f13)
			? new lore.draw2d.Color(0, 0, 0)
			: new lore.draw2d.Color(255, 255, 255);
};
lore.draw2d.Color.prototype.hex2rgb = function(_4f15) {
	_4f15 = _4f15.replace("#", "");
	return ({
		0 : parseInt(_4f15.substr(0, 2), 16),
		1 : parseInt(_4f15.substr(2, 2), 16),
		2 : parseInt(_4f15.substr(4, 2), 16)
	});
};
lore.draw2d.Color.prototype.hex = function() {
	return (this.int2hex(this.red) + this.int2hex(this.green) + this
			.int2hex(this.blue));
};
lore.draw2d.Color.prototype.int2hex = function(v) {
	v = Math.round(Math.min(Math.max(0, v), 255));
	return ("0123456789ABCDEF".charAt((v - v % 16) / 16) + "0123456789ABCDEF"
			.charAt(v % 16));
};
lore.draw2d.Color.prototype.darker = function(_4f17) {
	var red = parseInt(Math.round(this.getRed() * (1 - _4f17)));
	var green = parseInt(Math.round(this.getGreen() * (1 - _4f17)));
	var blue = parseInt(Math.round(this.getBlue() * (1 - _4f17)));
	if (red < 0) {
		red = 0;
	} else {
		if (red > 255) {
			red = 255;
		}
	}
	if (green < 0) {
		green = 0;
	} else {
		if (green > 255) {
			green = 255;
		}
	}
	if (blue < 0) {
		blue = 0;
	} else {
		if (blue > 255) {
			blue = 255;
		}
	}
	return new lore.draw2d.Color(red, green, blue);
};
lore.draw2d.Color.prototype.lighter = function(_4f1b) {
	var red = parseInt(Math.round(this.getRed() * (1 + _4f1b)));
	var green = parseInt(Math.round(this.getGreen() * (1 + _4f1b)));
	var blue = parseInt(Math.round(this.getBlue() * (1 + _4f1b)));
	if (red < 0) {
		red = 0;
	} else {
		if (red > 255) {
			red = 255;
		}
	}
	if (green < 0) {
		green = 0;
	} else {
		if (green > 255) {
			green = 255;
		}
	}
	if (blue < 0) {
		blue = 0;
	} else {
		if (blue > 255) {
			blue = 255;
		}
	}
	return new lore.draw2d.Color(red, green, blue);
};
lore.draw2d.Point = function(x, y) {
	this.x = x;
	this.y = y;
};
lore.draw2d.Point.prototype.type = "lore.draw2d.Point";
lore.draw2d.Point.prototype.getX = function() {
	return this.x;
};
lore.draw2d.Point.prototype.getY = function() {
	return this.y;
};
lore.draw2d.Point.prototype.getPosition = function(p) {
	var dx = p.x - this.x;
	var dy = p.y - this.y;
	if (Math.abs(dx) > Math.abs(dy)) {
		if (dx < 0) {
			return lore.draw2d.PositionConstants.WEST;
		}
		return lore.draw2d.PositionConstants.EAST;
	}
	if (dy < 0) {
		return lore.draw2d.PositionConstants.NORTH;
	}
	return lore.draw2d.PositionConstants.SOUTH;
};
lore.draw2d.Point.prototype.equals = function(o) {
	return this.x == o.x && this.y == o.y;
};
lore.draw2d.Point.prototype.getDistance = function(other) {
	return Math.sqrt((this.x - other.x) * (this.x - other.x)
			+ (this.y - other.y) * (this.y - other.y));
};
lore.draw2d.Point.prototype.getTranslated = function(other) {
	return new lore.draw2d.Point(this.x + other.x, this.y + other.y);
};
lore.draw2d.Point.prototype.getPersistentAttributes = function() {
	return {
		x : this.x,
		y : this.y
	};
};
lore.draw2d.Dimension = function(x, y, w, h) {
	lore.draw2d.Point.call(this, x, y);
	this.w = w;
	this.h = h;
};
lore.draw2d.Dimension.prototype = new lore.draw2d.Point;
lore.draw2d.Dimension.prototype.type = "lore.draw2d.Dimension";
lore.draw2d.Dimension.prototype.translate = function(dx, dy) {
	this.x += dx;
	this.y += dy;
	return this;
};
lore.draw2d.Dimension.prototype.resize = function(dw, dh) {
	this.w += dw;
	this.h += dh;
	return this;
};
lore.draw2d.Dimension.prototype.setBounds = function(rect) {
	this.x = rect.x;
	this.y = rect.y;
	this.w = rect.w;
	this.h = rect.h;
	return this;
};
lore.draw2d.Dimension.prototype.isEmpty = function() {
	return this.w <= 0 || this.h <= 0;
};
lore.draw2d.Dimension.prototype.getWidth = function() {
	return this.w;
};
lore.draw2d.Dimension.prototype.getHeight = function() {
	return this.h;
};
lore.draw2d.Dimension.prototype.getRight = function() {
	return this.x + this.w;
};
lore.draw2d.Dimension.prototype.getBottom = function() {
	return this.y + this.h;
};
lore.draw2d.Dimension.prototype.getTopLeft = function() {
	return new lore.draw2d.Point(this.x, this.y);
};
lore.draw2d.Dimension.prototype.getCenter = function() {
	return new lore.draw2d.Point(this.x + this.w / 2, this.y + this.h / 2);
};
lore.draw2d.Dimension.prototype.getBottomRight = function() {
	return new lore.draw2d.Point(this.x + this.w, this.y + this.h);
};
lore.draw2d.Dimension.prototype.equals = function(o) {
	return this.x == o.x && this.y == o.y && this.w == o.w && this.h == o.h;
};
lore.draw2d.SnapToHelper = function(_50db) {
	this.workflow = _50db;
};
lore.draw2d.SnapToHelper.NORTH = 1;
lore.draw2d.SnapToHelper.SOUTH = 4;
lore.draw2d.SnapToHelper.WEST = 8;
lore.draw2d.SnapToHelper.EAST = 16;
lore.draw2d.SnapToHelper.CENTER = 32;
lore.draw2d.SnapToHelper.NORTH_EAST = lore.draw2d.SnapToHelper.NORTH
		| lore.draw2d.SnapToHelper.EAST;
lore.draw2d.SnapToHelper.NORTH_WEST = lore.draw2d.SnapToHelper.NORTH
		| lore.draw2d.SnapToHelper.WEST;
lore.draw2d.SnapToHelper.SOUTH_EAST = lore.draw2d.SnapToHelper.SOUTH
		| lore.draw2d.SnapToHelper.EAST;
lore.draw2d.SnapToHelper.SOUTH_WEST = lore.draw2d.SnapToHelper.SOUTH
		| lore.draw2d.SnapToHelper.WEST;
lore.draw2d.SnapToHelper.NORTH_SOUTH = lore.draw2d.SnapToHelper.NORTH
		| lore.draw2d.SnapToHelper.SOUTH;
lore.draw2d.SnapToHelper.EAST_WEST = lore.draw2d.SnapToHelper.EAST
		| lore.draw2d.SnapToHelper.WEST;
lore.draw2d.SnapToHelper.NSEW = lore.draw2d.SnapToHelper.NORTH_SOUTH
		| lore.draw2d.SnapToHelper.EAST_WEST;
lore.draw2d.SnapToHelper.prototype.snapPoint = function(_50dc, _50dd, _50de) {
	return _50dd;
};
lore.draw2d.SnapToHelper.prototype.snapRectangle = function(_50df, _50e0) {
	return _50df;
};
lore.draw2d.SnapToHelper.prototype.onSetDocumentDirty = function() {
};
lore.draw2d.SnapToGrid = function(_51dc) {
	lore.draw2d.SnapToHelper.call(this, _51dc);
};
lore.draw2d.SnapToGrid.prototype = new lore.draw2d.SnapToHelper;
lore.draw2d.SnapToGrid.prototype.type = "lore.draw2d.SnapToGrid";
lore.draw2d.SnapToGrid.prototype.snapPoint = function(_51dd, _51de, _51df) {
	_51df.x = this.workflow.gridWidthX
			* Math
					.floor(((_51de.x + this.workflow.gridWidthX / 2) / this.workflow.gridWidthX));
	_51df.y = this.workflow.gridWidthY
			* Math
					.floor(((_51de.y + this.workflow.gridWidthY / 2) / this.workflow.gridWidthY));
	return 0;
};
lore.draw2d.SnapToGrid.prototype.snapRectangle = function(_51e0, _51e1) {
	_51e1.x = _51e0.x;
	_51e1.y = _51e0.y;
	_51e1.w = _51e0.w;
	_51e1.h = _51e0.h;
	return 0;
};
lore.draw2d.SnapToGeometryEntry = function(type, _5baf) {
	this.type = type;
	this.location = _5baf;
};
lore.draw2d.SnapToGeometryEntry.prototype.getLocation = function() {
	return this.location;
};
lore.draw2d.SnapToGeometryEntry.prototype.getType = function() {
	return this.type;
};
lore.draw2d.SnapToGeometry = function(_4ec2) {
	lore.draw2d.SnapToHelper.call(this, _4ec2);
};
lore.draw2d.SnapToGeometry.prototype = new lore.draw2d.SnapToHelper;
lore.draw2d.SnapToGeometry.THRESHOLD = 5;
lore.draw2d.SnapToGeometry.prototype.snapPoint = function(_4ec3, _4ec4, _4ec5) {
	if (this.rows == null || this.cols == null) {
		this.populateRowsAndCols();
	}
	if ((_4ec3 & lore.draw2d.SnapToHelper.EAST) != 0) {
		var _4ec6 = this.getCorrectionFor(this.cols, _4ec4.getX() - 1, 1);
		if (_4ec6 != lore.draw2d.SnapToGeometry.THRESHOLD) {
			_4ec3 &= ~lore.draw2d.SnapToHelper.EAST;
			_4ec5.x += _4ec6;
		}
	}
	if ((_4ec3 & lore.draw2d.SnapToHelper.WEST) != 0) {
		var _4ec7 = this.getCorrectionFor(this.cols, _4ec4.getX(), -1);
		if (_4ec7 != lore.draw2d.SnapToGeometry.THRESHOLD) {
			_4ec3 &= ~lore.draw2d.SnapToHelper.WEST;
			_4ec5.x += _4ec7;
		}
	}
	if ((_4ec3 & lore.draw2d.SnapToHelper.SOUTH) != 0) {
		var _4ec8 = this.getCorrectionFor(this.rows, _4ec4.getY() - 1, 1);
		if (_4ec8 != lore.draw2d.SnapToGeometry.THRESHOLD) {
			_4ec3 &= ~lore.draw2d.SnapToHelper.SOUTH;
			_4ec5.y += _4ec8;
		}
	}
	if ((_4ec3 & lore.draw2d.SnapToHelper.NORTH) != 0) {
		var _4ec9 = this.getCorrectionFor(this.rows, _4ec4.getY(), -1);
		if (_4ec9 != lore.draw2d.SnapToGeometry.THRESHOLD) {
			_4ec3 &= ~lore.draw2d.SnapToHelper.NORTH;
			_4ec5.y += _4ec9;
		}
	}
	return _4ec3;
};
lore.draw2d.SnapToGeometry.prototype.snapRectangle = function(_4eca, _4ecb) {
	var _4ecc = _4eca.getTopLeft();
	var _4ecd = _4eca.getBottomRight();
	var _4ece = this.snapPoint(lore.draw2d.SnapToHelper.NORTH_WEST, _4eca
					.getTopLeft(), _4ecc);
	_4ecb.x = _4ecc.x;
	_4ecb.y = _4ecc.y;
	var _4ecf = this.snapPoint(lore.draw2d.SnapToHelper.SOUTH_EAST, _4eca
					.getBottomRight(), _4ecd);
	if (_4ece & lore.draw2d.SnapToHelper.WEST) {
		_4ecb.x = _4ecd.x - _4eca.getWidth();
	}
	if (_4ece & lore.draw2d.SnapToHelper.NORTH) {
		_4ecb.y = _4ecd.y - _4eca.getHeight();
	}
	return _4ece | _4ecf;
};
lore.draw2d.SnapToGeometry.prototype.populateRowsAndCols = function() {
	this.rows = new Array();
	this.cols = new Array();
	var _4ed0 = this.workflow.getDocument().getFigures();
	var index = 0;
	for (var i = 0; i < _4ed0.getSize(); i++) {
		var _4ed3 = _4ed0.get(i);
		if (_4ed3 != this.workflow.getCurrentSelection()) {
			var _4ed4 = _4ed3.getBounds();
			this.cols[index * 3] = new lore.draw2d.SnapToGeometryEntry(-1, _4ed4
							.getX());
			this.rows[index * 3] = new lore.draw2d.SnapToGeometryEntry(-1, _4ed4
							.getY());
			this.cols[index * 3 + 1] = new lore.draw2d.SnapToGeometryEntry(0,
					_4ed4.x + (_4ed4.getWidth() - 1) / 2);
			this.rows[index * 3 + 1] = new lore.draw2d.SnapToGeometryEntry(0,
					_4ed4.y + (_4ed4.getHeight() - 1) / 2);
			this.cols[index * 3 + 2] = new lore.draw2d.SnapToGeometryEntry(1, _4ed4
							.getRight()
							- 1);
			this.rows[index * 3 + 2] = new lore.draw2d.SnapToGeometryEntry(1, _4ed4
							.getBottom()
							- 1);
			index++;
		}
	}
};
lore.draw2d.SnapToGeometry.prototype.getCorrectionFor = function(_4ed5, value, side) {
	var _4ed8 = lore.draw2d.SnapToGeometry.THRESHOLD;
	var _4ed9 = lore.draw2d.SnapToGeometry.THRESHOLD;
	for (var i = 0; i < _4ed5.length; i++) {
		var entry = _4ed5[i];
		var _4edc;
		if (entry.type == -1 && side != 0) {
			_4edc = Math.abs(value - entry.location);
			if (_4edc < _4ed8) {
				_4ed8 = _4edc;
				_4ed9 = entry.location - value;
			}
		} else {
			if (entry.type == 0 && side == 0) {
				_4edc = Math.abs(value - entry.location);
				if (_4edc < _4ed8) {
					_4ed8 = _4edc;
					_4ed9 = entry.location - value;
				}
			} else {
				if (entry.type == 1 && side != 0) {
					_4edc = Math.abs(value - entry.location);
					if (_4edc < _4ed8) {
						_4ed8 = _4edc;
						_4ed9 = entry.location - value;
					}
				}
			}
		}
	}
	return _4ed9;
};
lore.draw2d.SnapToGeometry.prototype.onSetDocumentDirty = function() {
	this.rows = null;
	this.cols = null;
};

lore.draw2d.Figure = function() {
	this.construct();
};
lore.draw2d.Figure.prototype.type = "lore.draw2d.Figure";
lore.draw2d.Figure.ZOrderBaseIndex = 100;
lore.draw2d.Figure.setZOrderBaseIndex = function(index) {
	lore.draw2d.Figure.ZOrderBaseIndex = index;
};
lore.draw2d.Figure.prototype.construct = function() {
	this.lastDragStartTime = 0;
	this.x = 0;
	this.y = 0;
	this.border = null;
	this.setDimension(10, 10);
	this.id = lore.draw2d.UUID.create();
	this.html = this.createHTMLElement();
	this.canvas = null;
	this.workflow = null;
	this.draggable = null;
	this.parent = null;
	this.isMoving = false;
	this.canSnapToHelper = true;
	this.snapToGridAnchor = new lore.draw2d.Point(0, 0);
	this.timer = -1;
	this.model = null;
	this.setDeleteable(true);
	this.setCanDrag(true);
	this.setResizeable(true);
	this.setSelectable(true);
	this.properties = new Object();
	this.moveListener = new lore.draw2d.ArrayList();
};
lore.draw2d.Figure.prototype.dispose = function() {
	this.canvas = null;
	this.workflow = null;
	this.moveListener = null;
	if (this.draggable != null) {
		this.draggable.removeEventListener("mouseenter", this.tmpMouseEnter);
		this.draggable.removeEventListener("mouseleave", this.tmpMouseLeave);
		this.draggable.removeEventListener("dragend", this.tmpDragend);
		this.draggable.removeEventListener("dragstart", this.tmpDragstart);
		this.draggable.removeEventListener("drag", this.tmpDrag);
		this.draggable.removeEventListener("dblclick", this.tmpDoubleClick);
		this.draggable.node = null;
        if (this.draggable.target){
		  this.draggable.target.removeAllElements();
        }
	}
	this.draggable = null;
	if (this.border != null) {
		this.border.dispose();
	}
	this.border = null;
	if (this.parent != null) {
		this.parent.removeChild(this);
	}
};
lore.draw2d.Figure.prototype.getProperties = function() {
	return this.properties;
};
lore.draw2d.Figure.prototype.getProperty = function(key) {
	return this.properties[key];
};
lore.draw2d.Figure.prototype.setProperty = function(key, value) {
	this.properties[key] = value;
	this.setDocumentDirty();
};
lore.draw2d.Figure.prototype.getId = function() {
	return this.id;
};
lore.draw2d.Figure.prototype.setId = function(id) {
	this.id = id;
	if (this.html != null) {
		this.html.id = id;
	}
};
lore.draw2d.Figure.prototype.setCanvas = function(_5aca) {
	this.canvas = _5aca;
};
lore.draw2d.Figure.prototype.getWorkflow = function() {
	return this.workflow;
};
lore.draw2d.Figure.prototype.setWorkflow = function(_5acb) {
	if (this.draggable == null) {
		this.html.tabIndex = "0";
		var oThis = this;
		this.keyDown = function(event) {
			event.cancelBubble = true;
			event.returnValue = true;
			oThis.onKeyDown(event.keyCode, event.ctrlKey);
		};
		if (this.html.addEventListener) {
			this.html.addEventListener("keydown", this.keyDown, false);
		} else {
			if (this.html.attachEvent) {
				this.html.attachEvent("onkeydown", this.keyDown);
			}
		}
		this.draggable = new lore.draw2d.Draggable(this.html,
				lore.draw2d.Draggable.DRAG_X | lore.draw2d.Draggable.DRAG_Y);
		this.draggable.node = this;
		this.tmpContextMenu = function(_5ace) {
			oThis.onContextMenu(oThis.x + _5ace.x, _5ace.y + oThis.y);
		};
		this.tmpMouseEnter = function(_5acf) {
			oThis.onMouseEnter();
		};
		this.tmpMouseLeave = function(_5ad0) {
			oThis.onMouseLeave();
		};
		this.tmpDragend = function(_5ad1) {
			oThis.onDragend();
		};
		this.tmpDragstart = function(_5ad2) {
			var w = oThis.workflow;
			w.showMenu(null);
			
			if (!(oThis instanceof lore.draw2d.ResizeHandle)
					&& !(oThis instanceof lore.draw2d.Port)) {
				var line = w.getBestLine(oThis.x + _5ad2.x, _5ad2.y + oThis.y);
				if (line != null) {
					_5ad2.returnValue = false;
					w.setCurrentSelection(line);
					w.showLineResizeHandles(line);
					w.onMouseDown(oThis.x + _5ad2.x, _5ad2.y + oThis.y);
					return;
				} else {
					if (oThis.isSelectable()) {
						w.showResizeHandles(oThis);
						w.setCurrentSelection(oThis);
					}
				}
			}
			_5ad2.returnValue = oThis.onDragstart(_5ad2.x, _5ad2.y);
		};
		this.tmpDrag = function(_5ad5) {
			oThis.onDrag();
		};
		this.tmpDoubleClick = function(_5ad6) {
			oThis.onDoubleClick();
		};
		this.draggable.addEventListener("contextmenu", this.tmpContextMenu);
		this.draggable.addEventListener("mouseenter", this.tmpMouseEnter);
		this.draggable.addEventListener("mouseleave", this.tmpMouseLeave);
		this.draggable.addEventListener("dragend", this.tmpDragend);
		this.draggable.addEventListener("dragstart", this.tmpDragstart);
		this.draggable.addEventListener("drag", this.tmpDrag);
		this.draggable.addEventListener("dblclick", this.tmpDoubleClick);
	}
	this.workflow = _5acb;
};
lore.draw2d.Figure.prototype.createHTMLElement = function() {
	var item = document.createElement("div");
	item.id = this.id;
	item.style.position = "absolute";
	item.style.left = this.x + "px";
	item.style.top = this.y + "px";
	item.style.height = this.width + "px";
	item.style.width = this.height + "px";
	item.style.margin = "0px";
	item.style.padding = "0px";
	item.style.outline = "none";
	item.style.zIndex = "" + lore.draw2d.Figure.ZOrderBaseIndex;
	return item;
};
lore.draw2d.Figure.prototype.setParent = function(_5ad8) {
	this.parent = _5ad8;
};
lore.draw2d.Figure.prototype.getParent = function() {
	return this.parent;
};
lore.draw2d.Figure.prototype.getZOrder = function() {
	return this.html.style.zIndex;
};
lore.draw2d.Figure.prototype.setZOrder = function(index) {
	this.html.style.zIndex = index;
};
lore.draw2d.Figure.prototype.hasFixedPosition = function() {
	return false;
};
lore.draw2d.Figure.prototype.getMinWidth = function() {
	return 5;
};
lore.draw2d.Figure.prototype.getMinHeight = function() {
	return 5;
};
lore.draw2d.Figure.prototype.getHTMLElement = function() {
	if (this.html == null) {
		this.html = this.createHTMLElement();
	}
	return this.html;
};
lore.draw2d.Figure.prototype.paint = function() {
};
lore.draw2d.Figure.prototype.setBorder = function(_5ada) {
	if (this.border != null) {
		this.border.figure = null;
	}
	this.border = _5ada;
	this.border.figure = this;
	this.border.refresh();
	this.setDocumentDirty();
};
lore.draw2d.Figure.prototype.onContextMenu = function(x, y) {
	var menu = this.getContextMenu();
	if (menu != null) {
		this.workflow.showMenu(menu, x, y);
	}
};
lore.draw2d.Figure.prototype.getContextMenu = function() {
	return null;
};
lore.draw2d.Figure.prototype.onDoubleClick = function() {
};
lore.draw2d.Figure.prototype.onMouseEnter = function() {
};
lore.draw2d.Figure.prototype.onMouseLeave = function() {
};
lore.draw2d.Figure.prototype.onDrag = function() {
	this.x = this.draggable.getLeft();
	this.y = this.draggable.getTop();
	if (this.isMoving == false) {
		this.isMoving = true;
		this.setAlpha(0.5);
	}
	this.fireMoveEvent();
};
lore.draw2d.Figure.prototype.onDragend = function() {
	
	this.setAlpha(1);
	
	this.command.setPosition(this.x, this.y);
	this.workflow.commandStack.execute(this.command);
	this.command = null;
	this.isMoving = false;
	this.workflow.hideSnapToHelperLines();
	this.fireMoveEvent();
};
lore.draw2d.Figure.prototype.onDragstart = function(x, y) {
	this.command = this
			.createCommand(new lore.draw2d.EditPolicy(lore.draw2d.EditPolicy.MOVE));
	return this.command != null;
};
lore.draw2d.Figure.prototype.setCanDrag = function(flag) {
	this.canDrag = flag;
	if (flag) {
		this.html.style.cursor = "move";
	} else {
		this.html.style.cursor = "";
	}
};
lore.draw2d.Figure.prototype.setAlpha = function(_5ae3) {
	if (this.alpha == _5ae3) {
		return;
	}
	try {
		this.html.style.MozOpacity = _5ae3;
	} catch (exc) {
	}
	try {
		this.html.style.opacity = _5ae3;
	} catch (exc) {
	}
	try {
		var _5ae4 = Math.round(_5ae3 * 100);
		if (_5ae4 >= 99) {
			this.html.style.filter = "";
		} else {
			this.html.style.filter = "alpha(opacity=" + _5ae4 + ")";
		}
	} catch (exc) {
	}
	this.alpha = _5ae3;
};
lore.draw2d.Figure.prototype.setDimension = function(w, h) {
	this.width = Math.max(this.getMinWidth(), w);
	this.height = Math.max(this.getMinHeight(), h);
	if (this.html == null) {
		return;
	}
	this.html.style.width = this.width + "px";
	this.html.style.height = this.height + "px";
	this.fireMoveEvent();
	if (this.workflow != null && this.workflow.getCurrentSelection() == this) {
		this.workflow.showResizeHandles(this);
	}
};
lore.draw2d.Figure.prototype.setPosition = function(xPos, yPos) {
	this.x = xPos;
	this.y = yPos;
	if (this.html == null) {
		return;
	}
	this.html.style.left = this.x + "px";
	this.html.style.top = this.y + "px";
	this.fireMoveEvent();
	if (this.workflow != null && this.workflow.getCurrentSelection() == this) {
		this.workflow.showResizeHandles(this);
	}
};
lore.draw2d.Figure.prototype.isResizeable = function() {
	return this.resizeable;
};
lore.draw2d.Figure.prototype.setResizeable = function(flag) {
	this.resizeable = flag;
};
lore.draw2d.Figure.prototype.isSelectable = function() {
	return this.selectable;
};
lore.draw2d.Figure.prototype.setSelectable = function(flag) {
	this.selectable = flag;
};
lore.draw2d.Figure.prototype.isStrechable = function() {
	return true;
};
lore.draw2d.Figure.prototype.isDeleteable = function() {
	return this.deleteable;
};
lore.draw2d.Figure.prototype.setDeleteable = function(flag) {
	this.deleteable = flag;
};
lore.draw2d.Figure.prototype.setCanSnapToHelper = function(flag) {
	this.canSnapToHelper = flag;
};
lore.draw2d.Figure.prototype.getCanSnapToHelper = function() {
	return this.canSnapToHelper;
};
lore.draw2d.Figure.prototype.getSnapToGridAnchor = function() {
	return this.snapToGridAnchor;
};
lore.draw2d.Figure.prototype.setSnapToGridAnchor = function(point) {
	this.snapToGridAnchor = point;
};
lore.draw2d.Figure.prototype.getBounds = function() {
	return new lore.draw2d.Dimension(this.getX(), this.getY(), this.getWidth(), this
					.getHeight());
};
lore.draw2d.Figure.prototype.getWidth = function() {
	return this.width;
};
lore.draw2d.Figure.prototype.getHeight = function() {
	return this.height;
};
lore.draw2d.Figure.prototype.getY = function() {
	return this.y;
};
lore.draw2d.Figure.prototype.getX = function() {
	return this.x;
};
lore.draw2d.Figure.prototype.getAbsoluteY = function() {
	return this.y;
};
lore.draw2d.Figure.prototype.getAbsoluteX = function() {
	return this.x;
};
lore.draw2d.Figure.prototype.onKeyDown = function(_5aee, ctrl) {
	if (_5aee == 46) {
		this.workflow
				.getCommandStack()
				.execute(this
						.createCommand(new lore.draw2d.EditPolicy(lore.draw2d.EditPolicy.DELETE)));
	}
	if (ctrl) {
		this.workflow.onKeyDown(_5aee, ctrl);
	}
};
lore.draw2d.Figure.prototype.getPosition = function() {
	return new lore.draw2d.Point(this.x, this.y);
};
lore.draw2d.Figure.prototype.isOver = function(iX, iY) {
	var x = this.getAbsoluteX();
	var y = this.getAbsoluteY();
	var iX2 = x + this.width;
	var iY2 = y + this.height;
	return (iX >= x && iX <= iX2 && iY >= y && iY <= iY2);
};
lore.draw2d.Figure.prototype.attachMoveListener = function(_5af6) {
	if (_5af6 == null || this.moveListener == null) {
		return;
	}
	this.moveListener.add(_5af6);
};
lore.draw2d.Figure.prototype.detachMoveListener = function(_5af7) {
	if (_5af7 == null || this.moveListener == null) {
		return;
	}
	this.moveListener.remove(_5af7);
};
lore.draw2d.Figure.prototype.fireMoveEvent = function() {
	this.setDocumentDirty();
	var size = this.moveListener.getSize();
	for (var i = 0; i < size; i++) {
		this.moveListener.get(i).onOtherFigureMoved(this);
	}
};
lore.draw2d.Figure.prototype.setModel = function(model) {
	if (this.model != null) {
		this.model.removePropertyChangeListener(this);
	}
	this.model = model;
	if (this.model != null) {
		this.model.addPropertyChangeListener(this);
	}
};
lore.draw2d.Figure.prototype.getModel = function() {
	return this.model;
};
lore.draw2d.Figure.prototype.onOtherFigureMoved = function(_5afb) {
};
lore.draw2d.Figure.prototype.setDocumentDirty = function() {
	if (this.workflow != null) {
		this.workflow.setDocumentDirty();
	}
};
lore.draw2d.Figure.prototype.disableTextSelection = function(e) {
	if (typeof e.onselectstart != "undefined") {
		e.onselectstart = function() {
			return false;
		};
	} else {
		if (typeof e.style.MozUserSelect != "undefined") {
			e.style.MozUserSelect = "none";
		}
	}
};
lore.draw2d.Figure.prototype.createCommand = function(_5afd) {
	if (_5afd.getPolicy() == lore.draw2d.EditPolicy.MOVE) {
		if (!this.canDrag) {
			return null;
		}
		return new lore.draw2d.CommandMove(this);
	}
	if (_5afd.getPolicy() == lore.draw2d.EditPolicy.DELETE) {
		if (!this.isDeleteable()) {
			return null;
		}
		return new lore.draw2d.CommandDelete(this);
	}
	if (_5afd.getPolicy() == lore.draw2d.EditPolicy.RESIZE) {
		if (!this.isResizeable()) {
			return null;
		}
		return new lore.draw2d.CommandResize(this);
	}
	return null;
};
lore.draw2d.Node = function() {
	this.bgColor = null;
	this.lineColor = new lore.draw2d.Color(128, 128, 255);
	this.lineStroke = 1;
	this.ports = new lore.draw2d.ArrayList();
	lore.draw2d.Figure.call(this);
};
lore.draw2d.Node.prototype = new lore.draw2d.Figure;
lore.draw2d.Node.prototype.type = "lore.draw2d.Node";
lore.draw2d.Node.prototype.dispose = function() {
	for (var i = 0; i < this.ports.getSize(); i++) {
		this.ports.get(i).dispose();
	}
	this.ports = null;
	lore.draw2d.Figure.prototype.dispose.call(this);
};
lore.draw2d.Node.prototype.createHTMLElement = function() {
	var item = lore.draw2d.Figure.prototype.createHTMLElement.call(this);
	item.style.width = "auto";
	item.style.height = "auto";
	item.style.margin = "0px";
	item.style.padding = "0px";
	if (this.lineColor != null) {
		item.style.border = this.lineStroke + "px solid "
				+ this.lineColor.getHTMLStyle();
	}
	item.style.fontSize = "1px";
	if (this.bgColor != null) {
		item.style.backgroundColor = this.bgColor.getHTMLStyle();
	}
	return item;
};
lore.draw2d.Node.prototype.paint = function() {
	lore.draw2d.Figure.prototype.paint.call(this);
	for (var i = 0; i < this.ports.getSize(); i++) {
		this.ports.get(i).paint();
	}
};
lore.draw2d.Node.prototype.getPorts = function() {
	return this.ports;
};
lore.draw2d.Node.prototype.getPort = function(_48b8) {
	if (this.ports == null) {
		return null;
	}
	for (var i = 0; i < this.ports.getSize(); i++) {
		var port = this.ports.get(i);
		if (port.getName() == _48b8) {
			return port;
		}
	}
};
lore.draw2d.Node.prototype.addPort = function(port, x, y) {
	this.ports.add(port);
	port.setOrigin(x, y);
	port.setPosition(x, y);
	port.setParent(this);
	port.setDeleteable(false);
	this.html.appendChild(port.getHTMLElement());
	if (this.workflow != null) {
		this.workflow.registerPort(port);
	}
};
lore.draw2d.Node.prototype.onDragstart = function(x, y){
    for (var i = 0; i < this.ports.getSize(); i++) {
            this.ports.get(i).setAlpha(0.5);
    }  
    return lore.draw2d.Figure.prototype.onDragstart.call(this, x, y);
};
lore.draw2d.Node.prototype.onDragend = function(){
    for (var i = 0; i < this.ports.getSize(); i++) {
            this.ports.get(i).setAlpha(1.0);
    }  
    return lore.draw2d.Figure.prototype.onDragend.call(this);
};
lore.draw2d.Node.prototype.removePort = function(port) {
	if (this.ports != null) {
		this.ports.removeElementAt(this.ports.indexOf(port));
	}
	try {
		this.html.removeChild(port.getHTMLElement());
	} catch (exc) {
	}
	if (this.workflow != null) {
		this.workflow.unregisterPort(port);
	}
};
lore.draw2d.Node.prototype.setWorkflow = function(_48bf) {
	var _48c0 = this.workflow;
	lore.draw2d.Figure.prototype.setWorkflow.call(this, _48bf);
	if (_48c0 != null) {
		for (var i = 0; i < this.ports.getSize(); i++) {
			_48c0.unregisterPort(this.ports.get(i));
		}
	}
	if (this.workflow != null) {
		for (var i = 0; i < this.ports.getSize(); i++) {
			this.workflow.registerPort(this.ports.get(i));
		}
	}
};
lore.draw2d.Node.prototype.setBackgroundColor = function(color) {
	this.bgColor = color;
	if (this.bgColor != null) {
		this.html.style.backgroundColor = this.bgColor.getHTMLStyle();
	} else {
		this.html.style.backgroundColor = "transparent";
	}
};
lore.draw2d.Node.prototype.getBackgroundColor = function() {
	return this.bgColor;
};
lore.draw2d.Node.prototype.setColor = function(color) {
	this.lineColor = color;
	if (this.lineColor != null) {
		this.html.style.border = this.lineStroke + "px solid "
				+ this.lineColor.getHTMLStyle();
	} else {
		this.html.style.border = "0px";
	}
};
lore.draw2d.Node.prototype.setLineWidth = function(w) {
	this.lineStroke = w;
	if (this.lineColor != null) {
		this.html.style.border = this.lineStroke + "px solid "
				+ this.lineColor.getHTMLStyle();
	} else {
		this.html.style.border = "0px";
	}
};
lore.draw2d.Node.prototype.getModelSourceConnections = function() {
	throw "You must override the method [Node.prototype.getModelSourceConnections]";
};
lore.draw2d.Node.prototype.refreshConnections = function() {
	if (this.workflow != null) {
		this.workflow.refreshConnections(this);
	}
};

lore.draw2d.Rectangle = function(width, _5bd4) {
	this.bgColor = null;
	this.lineColor = new lore.draw2d.Color(0, 0, 0);
	this.lineStroke = 1;
	lore.draw2d.Figure.call(this);
	if (width && _5bd4) {
		this.setDimension(width, _5bd4);
	}
};
lore.draw2d.Rectangle.prototype = new lore.draw2d.Figure;
lore.draw2d.Rectangle.prototype.type = "lore.draw2d.Rectangle";
lore.draw2d.Rectangle.prototype.dispose = function() {
	lore.draw2d.Figure.prototype.dispose.call(this);
	this.bgColor = null;
	this.lineColor = null;
};
lore.draw2d.Rectangle.prototype.createHTMLElement = function() {
	var item = lore.draw2d.Figure.prototype.createHTMLElement.call(this);
	item.style.width = "auto";
	item.style.height = "auto";
	item.style.margin = "0px";
	item.style.padding = "0px";
	item.style.border = this.lineStroke + "px solid "
			+ this.lineColor.getHTMLStyle();
	item.style.fontSize = "1px";
	item.style.lineHeight = "1px";
	item.textContent = " ";
	if (this.bgColor != null) {
		item.style.backgroundColor = this.bgColor.getHTMLStyle();
	}
	return item;
};
lore.draw2d.Rectangle.prototype.setBackgroundColor = function(color) {
	this.bgColor = color;
	if (this.bgColor != null) {
		this.html.style.backgroundColor = this.bgColor.getHTMLStyle();
	} else {
		this.html.style.backgroundColor = "transparent";
	}
};
lore.draw2d.Rectangle.prototype.getBackgroundColor = function() {
	return this.bgColor;
};
lore.draw2d.Rectangle.prototype.setColor = function(color) {
	this.lineColor = color;
	if (this.lineColor != null) {
		this.html.style.border = this.lineStroke + "px solid "
				+ this.lineColor.getHTMLStyle();
	} else {
		this.html.style.border = this.lineStroke + "0px";
	}
};
lore.draw2d.Rectangle.prototype.getColor = function() {
	return this.lineColor;
};
lore.draw2d.Rectangle.prototype.getWidth = function() {
	return lore.draw2d.Figure.prototype.getWidth.call(this) + 2 * this.lineStroke;
};
lore.draw2d.Rectangle.prototype.getHeight = function() {
	return lore.draw2d.Figure.prototype.getHeight.call(this) + 2 * this.lineStroke;
};
lore.draw2d.Rectangle.prototype.setDimension = function(w, h) {
	return lore.draw2d.Figure.prototype.setDimension.call(this, w - 2
					* this.lineStroke, h - 2 * this.lineStroke);
};
lore.draw2d.Rectangle.prototype.setLineWidth = function(w) {
	var diff = w - this.lineStroke;
	this.setDimension(this.getWidth() - 2 * diff, this.getHeight() - 2 * diff);
	this.lineStroke = w;
	var c = "transparent";
	if (this.lineColor != null) {
		c = this.lineColor.getHTMLStyle();
	}
	this.html.style.border = this.lineStroke + "px solid " + c;
};
lore.draw2d.Rectangle.prototype.getLineWidth = function() {
	return this.lineStroke;
};


lore.draw2d.Line = function() {
	this.lineColor = new lore.draw2d.Color(0, 0, 0);
	this.stroke = 1;
	this.canvas = null;
	this.workflow = null;
	this.html = null;
	this.graphics = null;
	this.id = lore.draw2d.UUID.create();
	this.startX = 30;
	this.startY = 30;
	this.endX = 100;
	this.endY = 100;
	this.alpha = 1;
	this.isMoving = false;
	this.model = null;
	this.zOrder = lore.draw2d.Line.ZOrderBaseIndex;
	this.corona = lore.draw2d.Line.CoronaWidth;
	this.properties = new Object();
	this.moveListener = new lore.draw2d.ArrayList();
	this.setSelectable(true);
	this.setDeleteable(true);
};
lore.draw2d.Line.prototype.type = "lore.draw2d.Line";
lore.draw2d.Line.ZOrderBaseIndex = 200;
lore.draw2d.Line.ZOrderBaseIndex = 200;
lore.draw2d.Line.CoronaWidth = 5;
lore.draw2d.Line.setZOrderBaseIndex = function(index) {
	lore.draw2d.Line.ZOrderBaseIndex = index;
};
lore.draw2d.Line.setDefaultCoronaWidth = function(width) {
	lore.draw2d.Line.CoronaWidth = width;
};
lore.draw2d.Line.prototype.dispose = function() {
	this.canvas = null;
	this.workflow = null;
	if (this.graphics != null) {
		this.graphics.clear();
	}
	this.graphics = null;
};
lore.draw2d.Line.prototype.getZOrder = function() {
	return this.zOrder;
};
lore.draw2d.Line.prototype.setZOrder = function(index) {
	if (this.html != null) {
		this.html.style.zIndex = index;
	}
	this.zOrder = index;
};
lore.draw2d.Line.prototype.setCoronaWidth = function(width) {
	this.corona = width;
};
lore.draw2d.Line.prototype.createHTMLElement = function() {
	var item = document.createElement("div");
	item.id = this.id;
	item.style.position = "absolute";
	item.style.left = "0px";
	item.style.top = "0px";
	item.style.height = "0px";
	item.style.width = "0px";
	item.style.zIndex = this.zOrder;
	return item;
};
lore.draw2d.Line.prototype.setId = function(id) {
	this.id = id;
	if (this.html != null) {
		this.html.id = id;
	}
};
lore.draw2d.Line.prototype.getProperties = function() {
	return this.properties;
};
lore.draw2d.Line.prototype.getProperty = function(key) {
	return this.properties[key];
};
lore.draw2d.Line.prototype.setProperty = function(key, value) {
	this.properties[key] = value;
	this.setDocumentDirty();
};
lore.draw2d.Line.prototype.getHTMLElement = function() {
	if (this.html == null) {
		this.html = this.createHTMLElement();
	}
	return this.html;
};
lore.draw2d.Line.prototype.getWorkflow = function() {
	return this.workflow;
};
lore.draw2d.Line.prototype.isResizeable = function() {
	return true;
};
lore.draw2d.Line.prototype.setCanvas = function(_4d3d) {
	this.canvas = _4d3d;
	if (this.graphics != null) {
		this.graphics.clear();
	}
	this.graphics = null;
};
lore.draw2d.Line.prototype.setWorkflow = function(_4d3e) {
	this.workflow = _4d3e;
	if (this.graphics != null) {
		this.graphics.clear();
	}
	this.graphics = null;
};
lore.draw2d.Line.prototype.paint = function() {
	if (this.graphics == null) {
		this.graphics = 
        this.graphics = {
            fig: this,
            canvElem: this.getWorkflow().canvElem,
            clear: function(){
                if (this.ln) {
                    this.ln.remove();
                }
            },
            
            drawLine : function(sx, sy, ex, ey){
                var path = "M " + sx + " " + sy + " L" + ex + " " + ey;
                this.ln = this.canvElem.path(path);
            },
            setStroke: function(s){
                this.ln.attr("stroke-width",s);
            },
            setColor: function(c){
                this.ln.attr("stroke",c)
            },
            setAlpha: function(a){
                this.ln.attr("opacity",a);  
            },
            paint: function(){
                // do nothing, here for compatibility with jsGraphics
            }
        };
	} else {
		this.graphics.clear();
	}
	
	this.graphics.drawLine(this.startX, this.startY, this.endX, this.endY);
    this.graphics.setStroke(this.stroke);
    this.graphics.setColor(this.lineColor.getHTMLStyle());
    if (this.alpha){
        this.graphics.setAlpha(this.alpha);
    }
};
lore.draw2d.Line.prototype.attachMoveListener = function(_4d3f) {
	this.moveListener.add(_4d3f);
};
lore.draw2d.Line.prototype.detachMoveListener = function(_4d40) {
	this.moveListener.remove(_4d40);
};
lore.draw2d.Line.prototype.fireMoveEvent = function() {
	var size = this.moveListener.getSize();
	for (var i = 0; i < size; i++) {
		this.moveListener.get(i).onOtherFigureMoved(this);
	}
};
lore.draw2d.Line.prototype.onOtherFigureMoved = function(_4d43) {
};
lore.draw2d.Line.prototype.setLineWidth = function(w) {
	this.stroke = w;
	if (this.graphics != null) {
		this.paint();
	}
	this.setDocumentDirty();
};
lore.draw2d.Line.prototype.setColor = function(color) {
	this.lineColor = color;
	if (this.graphics != null) {
		this.paint();
	}
	this.setDocumentDirty();
};
lore.draw2d.Line.prototype.getColor = function() {
	return this.lineColor;
};
lore.draw2d.Line.prototype.setAlpha = function(a) {
	if (a == this.alpha) {
		return;
	}
	
	this.alpha = a;
    if (this.ln){
        this.ln.attr("opacity",a);
    }
};
lore.draw2d.Line.prototype.setStartPoint = function(x, y) {
	this.startX = x;
	this.startY = y;
	if (this.graphics != null) {
		this.paint();
	}
	this.setDocumentDirty();
};
lore.draw2d.Line.prototype.setEndPoint = function(x, y) {
	this.endX = x;
	this.endY = y;
	if (this.graphics != null) {
		this.paint();
	}
	this.setDocumentDirty();
};
lore.draw2d.Line.prototype.getStartX = function() {
	return this.startX;
};
lore.draw2d.Line.prototype.getStartY = function() {
	return this.startY;
};
lore.draw2d.Line.prototype.getStartPoint = function() {
	return new lore.draw2d.Point(this.startX, this.startY);
};
lore.draw2d.Line.prototype.getEndX = function() {
	return this.endX;
};
lore.draw2d.Line.prototype.getEndY = function() {
	return this.endY;
};
lore.draw2d.Line.prototype.getEndPoint = function() {
	return new lore.draw2d.Point(this.endX, this.endY);
};
lore.draw2d.Line.prototype.isSelectable = function() {
	return this.selectable;
};
lore.draw2d.Line.prototype.setSelectable = function(flag) {
	this.selectable = flag;
};
lore.draw2d.Line.prototype.isDeleteable = function() {
	return this.deleteable;
};
lore.draw2d.Line.prototype.setDeleteable = function(flag) {
	this.deleteable = flag;
};
lore.draw2d.Line.prototype.getLength = function() {
	return Math.sqrt((this.startX - this.endX) * (this.startX - this.endX)
			+ (this.startY - this.endY) * (this.startY - this.endY));
};
lore.draw2d.Line.prototype.getAngle = function() {
	var _4d4e = this.getLength();
	var angle = -(180 / Math.PI) * Math.asin((this.startY - this.endY) / _4d4e);
	if (angle < 0) {
		if (this.endX < this.startX) {
			angle = Math.abs(angle) + 180;
		} else {
			angle = 360 - Math.abs(angle);
		}
	} else {
		if (this.endX < this.startX) {
			angle = 180 - angle;
		}
	}
	return angle;
};
lore.draw2d.Line.prototype.createCommand = function(_4d50) {
	if (_4d50.getPolicy() == lore.draw2d.EditPolicy.MOVE) {
		var x1 = this.getStartX();
		var y1 = this.getStartY();
		var x2 = this.getEndX();
		var y2 = this.getEndY();
		return new lore.draw2d.CommandMoveLine(this, x1, y1, x2, y2);
	}
	if (_4d50.getPolicy() == lore.draw2d.EditPolicy.DELETE) {
		if (this.isDeleteable() == false) {
			return null;
		}
		return new lore.draw2d.CommandDelete(this);
	}
	return null;
};
lore.draw2d.Line.prototype.setModel = function(model) {
	if (this.model != null) {
		this.model.removePropertyChangeListener(this);
	}
	this.model = model;
	if (this.model != null) {
		this.model.addPropertyChangeListener(this);
	}
};
lore.draw2d.Line.prototype.getModel = function() {
	return this.model;
};
lore.draw2d.Line.prototype.onContextMenu = function(x, y) {
	var menu = this.getContextMenu();
	if (menu != null) {
		this.workflow.showMenu(menu, x, y);
	}
};
lore.draw2d.Line.prototype.getContextMenu = function() {
	return null;
};
lore.draw2d.Line.prototype.onDoubleClick = function() {
};
lore.draw2d.Line.prototype.setDocumentDirty = function() {
	if (this.workflow != null) {
		this.workflow.setDocumentDirty();
	}
};
lore.draw2d.Line.prototype.containsPoint = function(px, py) {
	return lore.draw2d.Line.hit(this.corona, this.startX, this.startY, this.endX,
			this.endY, px, py);
};
lore.draw2d.Line.hit = function(_4d5b, X1, Y1, X2, Y2, px, py) {
	X2 -= X1;
	Y2 -= Y1;
	px -= X1;
	py -= Y1;
	var _4d62 = px * X2 + py * Y2;
	var _4d63;
	if (_4d62 <= 0) {
		_4d63 = 0;
	} else {
		px = X2 - px;
		py = Y2 - py;
		_4d62 = px * X2 + py * Y2;
		if (_4d62 <= 0) {
			_4d63 = 0;
		} else {
			_4d63 = _4d62 * _4d62 / (X2 * X2 + Y2 * Y2);
		}
	}
	var lenSq = px * px + py * py - _4d63;
	if (lenSq < 0) {
		lenSq = 0;
	}
	return Math.sqrt(lenSq) < _4d5b;
};
lore.draw2d.ConnectionRouter = function() {
};
lore.draw2d.ConnectionRouter.prototype.type = "lore.draw2d.ConnectionRouter";
lore.draw2d.ConnectionRouter.prototype.getDirection = function(r, p) {
	var _4dab = Math.abs(r.x - p.x);
	var _4dac = 3;
	var i = Math.abs(r.y - p.y);
	if (i <= _4dab) {
		_4dab = i;
		_4dac = 0;
	}
	i = Math.abs(r.getBottom() - p.y);
	if (i <= _4dab) {
		_4dab = i;
		_4dac = 2;
	}
	i = Math.abs(r.getRight() - p.x);
	if (i < _4dab) {
		_4dab = i;
		_4dac = 1;
	}
	return _4dac;
};
lore.draw2d.ConnectionRouter.prototype.getEndDirection = function(conn) {
	var p = conn.getEndPoint();
	var rect = conn.getTarget().getParent().getBounds();
	return this.getDirection(rect, p);
};
lore.draw2d.ConnectionRouter.prototype.getStartDirection = function(conn) {
	var p = conn.getStartPoint();
	var rect = conn.getSource().getParent().getBounds();
	return this.getDirection(rect, p);
};
lore.draw2d.ConnectionRouter.prototype.route = function(_4db4) {
};
lore.draw2d.NullConnectionRouter = function() {
};
lore.draw2d.NullConnectionRouter.prototype = new lore.draw2d.ConnectionRouter;
lore.draw2d.NullConnectionRouter.prototype.type = "lore.draw2d.NullConnectionRouter";
lore.draw2d.NullConnectionRouter.prototype.invalidate = function() {
};
lore.draw2d.NullConnectionRouter.prototype.route = function(_5f16) {
	_5f16.addPoint(_5f16.getStartPoint());
	_5f16.addPoint(_5f16.getEndPoint());
};
lore.draw2d.ManhattanConnectionRouter = function() {
	this.MINDIST = 20;
};
lore.draw2d.ManhattanConnectionRouter.prototype = new lore.draw2d.ConnectionRouter;
lore.draw2d.ManhattanConnectionRouter.prototype.type = "lore.draw2d.ManhattanConnectionRouter";
lore.draw2d.ManhattanConnectionRouter.prototype.route = function(conn) {
	var _5a56 = conn.getStartPoint();
	var _5a57 = this.getStartDirection(conn);
	var toPt = conn.getEndPoint();
	var toDir = this.getEndDirection(conn);
	this._route(conn, toPt, toDir, _5a56, _5a57);
};
lore.draw2d.ManhattanConnectionRouter.prototype._route = function(conn, _5a5b,
		_5a5c, toPt, toDir) {
	var TOL = 0.1;
	var _5a60 = 0.01;
	var UP = 0;
	var RIGHT = 1;
	var DOWN = 2;
	var LEFT = 3;
	var xDiff = _5a5b.x - toPt.x;
	var yDiff = _5a5b.y - toPt.y;
	var point;
	var dir;
	if (((xDiff * xDiff) < (_5a60)) && ((yDiff * yDiff) < (_5a60))) {
		conn.addPoint(new lore.draw2d.Point(toPt.x, toPt.y));
		return;
	}
	if (_5a5c == LEFT) {
		if ((xDiff > 0) && ((yDiff * yDiff) < TOL) && (toDir == RIGHT)) {
			point = toPt;
			dir = toDir;
		} else {
			if (xDiff < 0) {
				point = new lore.draw2d.Point(_5a5b.x - this.MINDIST, _5a5b.y);
			} else {
				if (((yDiff > 0) && (toDir == DOWN))
						|| ((yDiff < 0) && (toDir == UP))) {
					point = new lore.draw2d.Point(toPt.x, _5a5b.y);
				} else {
					if (_5a5c == toDir) {
						var pos = Math.min(_5a5b.x, toPt.x) - this.MINDIST;
						point = new lore.draw2d.Point(pos, _5a5b.y);
					} else {
						point = new lore.draw2d.Point(_5a5b.x - (xDiff / 2), _5a5b.y);
					}
				}
			}
			if (yDiff > 0) {
				dir = UP;
			} else {
				dir = DOWN;
			}
		}
	} else {
		if (_5a5c == RIGHT) {
			if ((xDiff < 0) && ((yDiff * yDiff) < TOL) && (toDir == LEFT)) {
				point = toPt;
				dir = toDir;
			} else {
				if (xDiff > 0) {
					point = new lore.draw2d.Point(_5a5b.x + this.MINDIST, _5a5b.y);
				} else {
					if (((yDiff > 0) && (toDir == DOWN))
							|| ((yDiff < 0) && (toDir == UP))) {
						point = new lore.draw2d.Point(toPt.x, _5a5b.y);
					} else {
						if (_5a5c == toDir) {
							var pos = Math.max(_5a5b.x, toPt.x) + this.MINDIST;
							point = new lore.draw2d.Point(pos, _5a5b.y);
						} else {
							point = new lore.draw2d.Point(_5a5b.x - (xDiff / 2),
									_5a5b.y);
						}
					}
				}
				if (yDiff > 0) {
					dir = UP;
				} else {
					dir = DOWN;
				}
			}
		} else {
			if (_5a5c == DOWN) {
				if (((xDiff * xDiff) < TOL) && (yDiff < 0) && (toDir == UP)) {
					point = toPt;
					dir = toDir;
				} else {
					if (yDiff > 0) {
						point = new lore.draw2d.Point(_5a5b.x, _5a5b.y
										+ this.MINDIST);
					} else {
						if (((xDiff > 0) && (toDir == RIGHT))
								|| ((xDiff < 0) && (toDir == LEFT))) {
							point = new lore.draw2d.Point(_5a5b.x, toPt.y);
						} else {
							if (_5a5c == toDir) {
								var pos = Math.max(_5a5b.y, toPt.y)
										+ this.MINDIST;
								point = new lore.draw2d.Point(_5a5b.x, pos);
							} else {
								point = new lore.draw2d.Point(_5a5b.x, _5a5b.y
												- (yDiff / 2));
							}
						}
					}
					if (xDiff > 0) {
						dir = LEFT;
					} else {
						dir = RIGHT;
					}
				}
			} else {
				if (_5a5c == UP) {
					if (((xDiff * xDiff) < TOL) && (yDiff > 0)
							&& (toDir == DOWN)) {
						point = toPt;
						dir = toDir;
					} else {
						if (yDiff < 0) {
							point = new lore.draw2d.Point(_5a5b.x, _5a5b.y
											- this.MINDIST);
						} else {
							if (((xDiff > 0) && (toDir == RIGHT))
									|| ((xDiff < 0) && (toDir == LEFT))) {
								point = new lore.draw2d.Point(_5a5b.x, toPt.y);
							} else {
								if (_5a5c == toDir) {
									var pos = Math.min(_5a5b.y, toPt.y)
											- this.MINDIST;
									point = new lore.draw2d.Point(_5a5b.x, pos);
								} else {
									point = new lore.draw2d.Point(_5a5b.x, _5a5b.y
													- (yDiff / 2));
								}
							}
						}
						if (xDiff > 0) {
							dir = LEFT;
						} else {
							dir = RIGHT;
						}
					}
				}
			}
		}
	}
	this._route(conn, point, dir, toPt, toDir);
	conn.addPoint(_5a5b);
};
lore.draw2d.BezierConnectionRouter = function(_5a8c) {
	if (!_5a8c) {
		this.cheapRouter = new lore.draw2d.ManhattanConnectionRouter();
	} else {
		this.cheapRouter = null;
	}
	this.iteration = 5;
};
lore.draw2d.BezierConnectionRouter.prototype = new lore.draw2d.ConnectionRouter;
lore.draw2d.BezierConnectionRouter.prototype.type = "lore.draw2d.BezierConnectionRouter";
lore.draw2d.BezierConnectionRouter.prototype.drawBezier = function(_5a8d, _5a8e, t,
		iter) {
	var n = _5a8d.length - 1;
	var q = new Array();
	var _5a93 = n + 1;
	for (var i = 0; i < _5a93; i++) {
		q[i] = new Array();
		q[i][0] = _5a8d[i];
	}
	for (var j = 1; j <= n; j++) {
		for (var i = 0; i <= (n - j); i++) {
			q[i][j] = new lore.draw2d.Point((1 - t) * q[i][j - 1].x + t
							* q[i + 1][j - 1].x, (1 - t) * q[i][j - 1].y + t
							* q[i + 1][j - 1].y);
		}
	}
	var c1 = new Array();
	var c2 = new Array();
	for (var i = 0; i < n + 1; i++) {
		c1[i] = q[0][i];
		c2[i] = q[i][n - i];
	}
	if (iter >= 0) {
		this.drawBezier(c1, _5a8e, t, --iter);
		this.drawBezier(c2, _5a8e, t, --iter);
	} else {
		for (var i = 0; i < n; i++) {
			_5a8e.push(q[i][n - i]);
		}
	}
};
lore.draw2d.BezierConnectionRouter.prototype.route = function(conn) {
	if (this.cheapRouter != null
			&& (conn.getSource().getParent().isMoving == true || conn
					.getTarget().getParent().isMoving == true)) {
		this.cheapRouter.route(conn);
		return;
	}
	var _5a99 = new Array();
	var _5a9a = conn.getStartPoint();
	var toPt = conn.getEndPoint();
	this._route(_5a99, conn, toPt, this.getEndDirection(conn), _5a9a, this
					.getStartDirection(conn));
	var _5a9c = new Array();
	this.drawBezier(_5a99, _5a9c, 0.5, this.iteration);
	for (var i = 0; i < _5a9c.length; i++) {
		conn.addPoint(_5a9c[i]);
	}
	conn.addPoint(toPt);
};
lore.draw2d.BezierConnectionRouter.prototype._route = function(_5a9e, conn, _5aa0,
		_5aa1, toPt, toDir) {
	var TOL = 0.1;
	var _5aa5 = 0.01;
	var _5aa6 = 90;
	var UP = 0;
	var RIGHT = 1;
	var DOWN = 2;
	var LEFT = 3;
	var xDiff = _5aa0.x - toPt.x;
	var yDiff = _5aa0.y - toPt.y;
	var point;
	var dir;
	if (((xDiff * xDiff) < (_5aa5)) && ((yDiff * yDiff) < (_5aa5))) {
		_5a9e.push(new lore.draw2d.Point(toPt.x, toPt.y));
		return;
	}
	if (_5aa1 == LEFT) {
		if ((xDiff > 0) && ((yDiff * yDiff) < TOL) && (toDir == RIGHT)) {
			point = toPt;
			dir = toDir;
		} else {
			if (xDiff < 0) {
				point = new lore.draw2d.Point(_5aa0.x - _5aa6, _5aa0.y);
			} else {
				if (((yDiff > 0) && (toDir == DOWN))
						|| ((yDiff < 0) && (toDir == UP))) {
					point = new lore.draw2d.Point(toPt.x, _5aa0.y);
				} else {
					if (_5aa1 == toDir) {
						var pos = Math.min(_5aa0.x, toPt.x) - _5aa6;
						point = new lore.draw2d.Point(pos, _5aa0.y);
					} else {
						point = new lore.draw2d.Point(_5aa0.x - (xDiff / 2), _5aa0.y);
					}
				}
			}
			if (yDiff > 0) {
				dir = UP;
			} else {
				dir = DOWN;
			}
		}
	} else {
		if (_5aa1 == RIGHT) {
			if ((xDiff < 0) && ((yDiff * yDiff) < TOL) && (toDir == LEFT)) {
				point = toPt;
				dir = toDir;
			} else {
				if (xDiff > 0) {
					point = new lore.draw2d.Point(_5aa0.x + _5aa6, _5aa0.y);
				} else {
					if (((yDiff > 0) && (toDir == DOWN))
							|| ((yDiff < 0) && (toDir == UP))) {
						point = new lore.draw2d.Point(toPt.x, _5aa0.y);
					} else {
						if (_5aa1 == toDir) {
							var pos = Math.max(_5aa0.x, toPt.x) + _5aa6;
							point = new lore.draw2d.Point(pos, _5aa0.y);
						} else {
							point = new lore.draw2d.Point(_5aa0.x - (xDiff / 2),
									_5aa0.y);
						}
					}
				}
				if (yDiff > 0) {
					dir = UP;
				} else {
					dir = DOWN;
				}
			}
		} else {
			if (_5aa1 == DOWN) {
				if (((xDiff * xDiff) < TOL) && (yDiff < 0) && (toDir == UP)) {
					point = toPt;
					dir = toDir;
				} else {
					if (yDiff > 0) {
						point = new lore.draw2d.Point(_5aa0.x, _5aa0.y + _5aa6);
					} else {
						if (((xDiff > 0) && (toDir == RIGHT))
								|| ((xDiff < 0) && (toDir == LEFT))) {
							point = new lore.draw2d.Point(_5aa0.x, toPt.y);
						} else {
							if (_5aa1 == toDir) {
								var pos = Math.max(_5aa0.y, toPt.y) + _5aa6;
								point = new lore.draw2d.Point(_5aa0.x, pos);
							} else {
								point = new lore.draw2d.Point(_5aa0.x, _5aa0.y
												- (yDiff / 2));
							}
						}
					}
					if (xDiff > 0) {
						dir = LEFT;
					} else {
						dir = RIGHT;
					}
				}
			} else {
				if (_5aa1 == UP) {
					if (((xDiff * xDiff) < TOL) && (yDiff > 0)
							&& (toDir == DOWN)) {
						point = toPt;
						dir = toDir;
					} else {
						if (yDiff < 0) {
							point = new lore.draw2d.Point(_5aa0.x, _5aa0.y - _5aa6);
						} else {
							if (((xDiff > 0) && (toDir == RIGHT))
									|| ((xDiff < 0) && (toDir == LEFT))) {
								point = new lore.draw2d.Point(_5aa0.x, toPt.y);
							} else {
								if (_5aa1 == toDir) {
									var pos = Math.min(_5aa0.y, toPt.y) - _5aa6;
									point = new lore.draw2d.Point(_5aa0.x, pos);
								} else {
									point = new lore.draw2d.Point(_5aa0.x, _5aa0.y
													- (yDiff / 2));
								}
							}
						}
						if (xDiff > 0) {
							dir = LEFT;
						} else {
							dir = RIGHT;
						}
					}
				}
			}
		}
	}
	this._route(_5a9e, conn, point, dir, toPt, toDir);
	_5a9e.push(_5aa0);
};
lore.draw2d.ConnectionAnchor = function(owner) {
	this.owner = owner;
};
lore.draw2d.ConnectionAnchor.prototype.type = "lore.draw2d.ConnectionAnchor";
lore.draw2d.ConnectionAnchor.prototype.getLocation = function(_5f25) {
	return this.getReferencePoint();
};
lore.draw2d.ConnectionAnchor.prototype.getOwner = function() {
	return this.owner;
};
lore.draw2d.ConnectionAnchor.prototype.setOwner = function(owner) {
	this.owner = owner;
};
lore.draw2d.ConnectionAnchor.prototype.getBox = function() {
	return this.getOwner().getAbsoluteBounds();
};
lore.draw2d.ConnectionAnchor.prototype.getReferencePoint = function() {
	if (this.getOwner() == null) {
		return null;
	} else {
		return this.getOwner().getAbsolutePosition();
	}
};
lore.draw2d.ChopboxConnectionAnchor = function(owner) {
	lore.draw2d.ConnectionAnchor.call(this, owner);
};
lore.draw2d.ChopboxConnectionAnchor.prototype = new lore.draw2d.ConnectionAnchor;
lore.draw2d.ChopboxConnectionAnchor.prototype.type = "lore.draw2d.ChopboxConnectionAnchor";
lore.draw2d.ChopboxConnectionAnchor.prototype.getLocation = function(_5bcc) {
	var r = new lore.draw2d.Dimension();
	r.setBounds(this.getBox());
	r.translate(-1, -1);
	r.resize(1, 1);
	var _5bce = r.x + r.w / 2;
	var _5bcf = r.y + r.h / 2;
	if (r.isEmpty() || (_5bcc.x == _5bce && _5bcc.y == _5bcf)) {
		return new Point(_5bce, _5bcf);
	}
	var dx = _5bcc.x - _5bce;
	var dy = _5bcc.y - _5bcf;
	var scale = 0.5 / Math.max(Math.abs(dx) / r.w, Math.abs(dy) / r.h);
	dx *= scale;
	dy *= scale;
	_5bce += dx;
	_5bcf += dy;
	return new lore.draw2d.Point(Math.round(_5bce), Math.round(_5bcf));
};
lore.draw2d.ChopboxConnectionAnchor.prototype.getBox = function() {
	return this.getOwner().getParent().getBounds();
};
lore.draw2d.ChopboxConnectionAnchor.prototype.getReferencePoint = function() {
	return this.getBox().getCenter();
};

lore.draw2d.CanvasDocument = function(_4f1f) {
	this.canvas = _4f1f;
};
lore.draw2d.CanvasDocument.prototype.type = "lore.draw2d.CanvasDocument";
lore.draw2d.CanvasDocument.prototype.getFigures = function() {
	var _4f20 = new lore.draw2d.ArrayList();
	var _4f21 = this.canvas.figures;
	var _4f22 = this.canvas.dialogs;
	for (var i = 0; i < _4f21.getSize(); i++) {
		var _4f24 = _4f21.get(i);
		if (_4f22.indexOf(_4f24) == -1 && _4f24.getParent() == null) {
			_4f20.add(_4f24);
		}
	}
	return _4f20;
};
lore.draw2d.CanvasDocument.prototype.getFigure = function(id) {
	return this.canvas.getFigure(id);
};
lore.draw2d.CanvasDocument.prototype.getLines = function() {
	return this.canvas.getLines();
};
lore.draw2d.CanvasDocument.prototype.getLine = function(id) {
	return this.canvas.getLine(id);
};



lore.draw2d.Canvas = function(_5a3c) {
	if (_5a3c) {
		this.construct(_5a3c);
	}
	this.enableSmoothFigureHandling = false;
	this.canvasLines = new lore.draw2d.ArrayList();
};
lore.draw2d.Canvas.prototype.type = "lore.draw2d.Canvas";
lore.draw2d.Canvas.prototype.construct = function(_5a3d) {
	this.canvasId = _5a3d;
	this.html = document.getElementById(this.canvasId);
	this.scrollArea = document.body.parentNode;
};
lore.draw2d.Canvas.prototype.setViewPort = function(divId) {
	this.scrollArea = document.getElementById(divId);
};
lore.draw2d.Canvas.prototype.addFigure = function(_5a3f, xPos, yPos, _5a42) {
	_5a3f.setCanvas(this);
	if (xPos && yPos) {
		_5a3f.setPosition(xPos, yPos);
	}
	if (_5a3f instanceof lore.draw2d.Line) {
		this.canvasLines.add(_5a3f);
		this.html.appendChild(_5a3f.getHTMLElement());
	} else {
		var obj = this.canvasLines.getFirstElement();
		if (obj == null) {
			this.html.appendChild(_5a3f.getHTMLElement());
		} else {
			this.html
					.insertBefore(_5a3f.getHTMLElement(), obj.getHTMLElement());
		}
	}
	if (!_5a42) {
		_5a3f.paint();
	}
};
lore.draw2d.Canvas.prototype.removeFigure = function(_5a46) {
	this.html.removeChild(_5a46.html);
	_5a46.setCanvas(null);
	if (_5a46 instanceof lore.draw2d.Line) {
		this.canvasLines.remove(_5a46);
	}
};
lore.draw2d.Canvas.prototype.getEnableSmoothFigureHandling = function() {
	return this.enableSmoothFigureHandling;
};
lore.draw2d.Canvas.prototype.setEnableSmoothFigureHandling = function(flag) {
	this.enableSmoothFigureHandling = flag;
};
lore.draw2d.Canvas.prototype.getWidth = function() {
	return parseInt(this.html.style.width);
};
lore.draw2d.Canvas.prototype.getHeight = function() {
	return parseInt(this.html.style.height);
};
lore.draw2d.Canvas.prototype.setBackgroundImage = function(_5a4b, _5a4c) {
	if (_5a4b != null) {
		if (_5a4c) {
			this.html.style.background = "transparent url(" + _5a4b + ") ";
		} else {
			this.html.style.background = "transparent url(" + _5a4b
					+ ") no-repeat";
		}
	} else {
		this.html.style.background = "transparent";
	}
};
lore.draw2d.Canvas.prototype.getY = function() {
	return this.y;
};
lore.draw2d.Canvas.prototype.getX = function() {
	return this.x;
};
lore.draw2d.Canvas.prototype.getAbsoluteY = function() {
	var el = this.html;
	var ot = el.offsetTop;
	while ((el = el.offsetParent) != null) {
		ot += el.offsetTop;
	}
	return ot;
};
lore.draw2d.Canvas.prototype.getAbsoluteX = function() {
	var el = this.html;
	var ol = el.offsetLeft;
	while ((el = el.offsetParent) != null) {
		ol += el.offsetLeft;
	}
	return ol;
};
lore.draw2d.Canvas.prototype.getScrollLeft = function() {
	return this.scrollArea.scrollLeft;
};
lore.draw2d.Canvas.prototype.getScrollTop = function() {
	return this.scrollArea.scrollTop;
};
lore.draw2d.Workflow = function(id) {
	if (!id) {
		return;
	}
	this.gridWidthX = 10;
	this.gridWidthY = 10;
	this.snapToGridHelper = null;
	this.verticalSnapToHelperLine = null;
	this.horizontalSnapToHelperLine = null;
	this.figures = new lore.draw2d.ArrayList();
	this.lines = new lore.draw2d.ArrayList();
	this.commonPorts = new lore.draw2d.ArrayList();
	this.dropTargets = new lore.draw2d.ArrayList();
	this.compartments = new lore.draw2d.ArrayList();
	this.selectionListeners = new lore.draw2d.ArrayList();
	this.dialogs = new lore.draw2d.ArrayList();
	this.dragging = false;
	this.draggingLine = null;
	this.draggingLineCommand = null;
	this.commandStack = new lore.draw2d.CommandStack();
	this.oldScrollPosLeft = 0;
	this.oldScrollPosTop = 0;
	this.currentSelection = null;
	this.currentMenu = null;
    
	this.resizeHandleStart = new lore.draw2d.LineStartResizeHandle(this);
	this.resizeHandleEnd = new lore.draw2d.LineEndResizeHandle(this);
	this.resizeHandle1 = new lore.draw2d.ResizeHandle(this, 1);
	this.resizeHandle2 = new lore.draw2d.ResizeHandle(this, 2);
	this.resizeHandle3 = new lore.draw2d.ResizeHandle(this, 3);
	this.resizeHandle4 = new lore.draw2d.ResizeHandle(this, 4);
	this.resizeHandle5 = new lore.draw2d.ResizeHandle(this, 5);
	this.resizeHandle6 = new lore.draw2d.ResizeHandle(this, 6);
	this.resizeHandle7 = new lore.draw2d.ResizeHandle(this, 7);
	this.resizeHandle8 = new lore.draw2d.ResizeHandle(this, 8);
	this.resizeHandleHalfWidth = parseInt(this.resizeHandle2.getWidth() / 2);
	lore.draw2d.Canvas.call(this, id);
    this.canvElem = Raphael(this.html,100,100);
    this.connectionLine = new lore.draw2d.Line();
    this.connectionLine.setWorkflow(this);
	this.setPanning(false);
	if (this.html != null) {
		this.html.style.backgroundImage = "url(grid_10.png)";
		var oThis = this;
		this.html.tabIndex = "0";
		var _4f2b = function() {
			var _4f2c = arguments[0] || window.event;
			var diffX = _4f2c.clientX;
			var diffY = _4f2c.clientY;
			var _4f2f = oThis.getScrollLeft();
			var _4f30 = oThis.getScrollTop();
			var _4f31 = oThis.getAbsoluteX();
			var _4f32 = oThis.getAbsoluteY();
			if (oThis.getBestFigure(diffX + _4f2f - _4f31, diffY + _4f30
							- _4f32) != null) {
				return;
			}
			var line = oThis.getBestLine(diffX + _4f2f - _4f31, diffY + _4f30
							- _4f32, null);
			if (line != null) {
				line
						.onContextMenu(diffX + _4f2f - _4f31, diffY + _4f30
										- _4f32);
			} else {
				oThis.onContextMenu(diffX + _4f2f - _4f31, diffY + _4f30
								- _4f32);
			}
		};
		this.html.oncontextmenu = function() {
			return false;
		};
		var oThis = this;
        // Modified for LORE to allow overriding
		this.keyDown = function(event) {
			var ctrl = event.ctrlKey;
			oThis.onKeyDown(event.keyCode, ctrl);
		};
		var _4f38 = function() {
			var _4f39 = arguments[0] || window.event;
			if (_4f39.returnValue == false) {
				return;
			}
			var diffX = _4f39.clientX;
			var diffY = _4f39.clientY;
			var _4f3c = oThis.getScrollLeft();
			var _4f3d = oThis.getScrollTop();
			var _4f3e = oThis.getAbsoluteX();
			var _4f3f = oThis.getAbsoluteY();
			oThis.onMouseDown(diffX + _4f3c - _4f3e, diffY + _4f3d - _4f3f);
		};
		var _4f40 = function() {
			var _4f41 = arguments[0] || window.event;
			if (oThis.currentMenu != null) {
				oThis.removeFigure(oThis.currentMenu);
				oThis.currentMenu = null;
			}
			if (_4f41.button == 2) {
				return;
			}
			var diffX = _4f41.clientX;
			var diffY = _4f41.clientY;
			var _4f44 = oThis.getScrollLeft();
			var _4f45 = oThis.getScrollTop();
			var _4f46 = oThis.getAbsoluteX();
			var _4f47 = oThis.getAbsoluteY();
			oThis.onMouseUp(diffX + _4f44 - _4f46, diffY + _4f45 - _4f47);
		};
		var _4f48 = function() {
			var _4f49 = arguments[0] || window.event;
			var diffX = _4f49.clientX;
			var diffY = _4f49.clientY;
			var _4f4c = oThis.getScrollLeft();
			var _4f4d = oThis.getScrollTop();
			var _4f4e = oThis.getAbsoluteX();
			var _4f4f = oThis.getAbsoluteY();
			oThis.currentMouseX = diffX + _4f4c - _4f4e;
			oThis.currentMouseY = diffY + _4f4d - _4f4f;
			var obj = oThis.getBestFigure(oThis.currentMouseX,
					oThis.currentMouseY);
			if (lore.draw2d.Drag.currentHover != null && obj == null) {
				var _4f51 = new lore.draw2d.DragDropEvent();
				_4f51.initDragDropEvent("mouseleave", false, oThis);
				lore.draw2d.Drag.currentHover.dispatchEvent(_4f51);
			} else {
				var diffX = _4f49.clientX;
				var diffY = _4f49.clientY;
				var _4f4c = oThis.getScrollLeft();
				var _4f4d = oThis.getScrollTop();
				var _4f4e = oThis.getAbsoluteX();
				var _4f4f = oThis.getAbsoluteY();
				oThis.onMouseMove(diffX + _4f4c - _4f4e, diffY + _4f4d - _4f4f);
			}
			if (obj == null) {
				lore.draw2d.Drag.currentHover = null;
			}
		};
		var _4f52 = function(_4f53) {
			var _4f53 = arguments[0] || window.event;
			var diffX = _4f53.clientX;
			var diffY = _4f53.clientY;
			var _4f56 = oThis.getScrollLeft();
			var _4f57 = oThis.getScrollTop();
			var _4f58 = oThis.getAbsoluteX();
			var _4f59 = oThis.getAbsoluteY();
			var line = oThis.getBestLine(diffX + _4f56 - _4f58, diffY + _4f57
							- _4f59, null);
			if (line != null) {
				line.onDoubleClick();
			}
		};
		if (this.html.addEventListener) {
			this.html.addEventListener("contextmenu", _4f2b, false);
			this.html.addEventListener("mousemove", _4f48, false);
			this.html.addEventListener("mouseup", _4f40, false);
			this.html.addEventListener("mousedown", _4f38, false);
			this.html.addEventListener("keydown", this.keyDown, false);
			this.html.addEventListener("dblclick", _4f52, false);
		} else {
			if (this.html.attachEvent) {
				this.html.attachEvent("oncontextmenu", _4f2b);
				this.html.attachEvent("onmousemove", _4f48);
				this.html.attachEvent("onmousedown", _4f38);
				this.html.attachEvent("onmouseup", _4f40);
				this.html.attachEvent("onkeydown", this.keyDown);
				this.html.attachEvent("ondblclick", _4f52);
			} else {
				throw new Error("Open-jACOB Draw2D not supported in this browser.");
			}
		}
	}

};
lore.draw2d.Workflow.prototype = new lore.draw2d.Canvas;
lore.draw2d.Workflow.prototype.type = "lore.draw2d.Workflow";
lore.draw2d.Workflow.COLOR_GREEN = new lore.draw2d.Color(0, 255, 0);
lore.draw2d.Workflow.prototype.clear = function() {
	this.scrollTo(0, 0, true);
	this.gridWidthX = 10;
	this.gridWidthY = 10;
	this.snapToGridHelper = null;
	this.verticalSnapToHelperLine = null;
	this.horizontalSnapToHelperLine = null;
	var _4f5b = this.getDocument();
	var _4f5c = _4f5b.getLines().clone();
	for (var i = 0; i < _4f5c.getSize(); i++) {
		new lore.draw2d.CommandDelete(_4f5c.get(i)).execute();
	}
	var _4f5e = _4f5b.getFigures().clone();
	for (var i = 0; i < _4f5e.getSize(); i++) {
		new lore.draw2d.CommandDelete(_4f5e.get(i)).execute();
	}
	this.commonPorts.removeAllElements();
	this.dropTargets.removeAllElements();
	this.compartments.removeAllElements();
	this.selectionListeners.removeAllElements();
	this.dialogs.removeAllElements();
	this.commandStack = new lore.draw2d.CommandStack();
	this.currentSelection = null;
	this.currentMenu = null;
	lore.draw2d.Drag.clearCurrent();
};
lore.draw2d.Workflow.prototype.onScroll = function() {
	var _4f5f = this.getScrollLeft();
	var _4f60 = this.getScrollTop();
	var _4f61 = _4f5f - this.oldScrollPosLeft;
	var _4f62 = _4f60 - this.oldScrollPosTop;
	for (var i = 0; i < this.figures.getSize(); i++) {
		var _4f64 = this.figures.get(i);
		if (_4f64.hasFixedPosition && _4f64.hasFixedPosition() == true) {
			_4f64.setPosition(_4f64.getX() + _4f61, _4f64.getY() + _4f62);
		}
	}
	this.oldScrollPosLeft = _4f5f;
	this.oldScrollPosTop = _4f60;
};
lore.draw2d.Workflow.prototype.setPanning = function(flag) {
	this.panning = flag;
	if (flag) {
		this.html.style.cursor = "move";
	} else {
		this.html.style.cursor = "default";
	}
};
lore.draw2d.Workflow.prototype.scrollTo = function(x, y, fast) {
	if (fast) {
		this.scrollArea.scrollLeft = x;
		this.scrollArea.scrollTop = y;
	} else {
		var steps = 40;
		var xStep = (x - this.getScrollLeft()) / steps;
		var yStep = (y - this.getScrollTop()) / steps;
		var oldX = this.getScrollLeft();
		var oldY = this.getScrollTop();
		for (var i = 0; i < steps; i++) {
			this.scrollArea.scrollLeft = oldX + (xStep * i);
			this.scrollArea.scrollTop = oldY + (yStep * i);
		}
	}
};

lore.draw2d.Workflow.prototype.showDialog = function(_4f73, xPos, yPos) {
	if (xPos) {
		this.addFigure(_4f73, xPos, yPos);
	} else {
		this.addFigure(_4f73, 200, 100);
	}
	this.dialogs.add(_4f73);
};
lore.draw2d.Workflow.prototype.showMenu = function(menu, xPos, yPos) {
	if (this.menu != null) {
		this.html.removeChild(this.menu.getHTMLElement());
		this.menu.setWorkflow();
	}
	this.menu = menu;
	if (this.menu != null) {
		this.menu.setWorkflow(this);
		this.menu.setPosition(xPos, yPos);
		this.html.appendChild(this.menu.getHTMLElement());
		this.menu.paint();
	}
};
lore.draw2d.Workflow.prototype.onContextMenu = function(x, y) {
	var menu = this.getContextMenu();
	if (menu != null) {
		this.showMenu(menu, x, y);
	}
};
lore.draw2d.Workflow.prototype.getContextMenu = function() {
	return null;
};

lore.draw2d.Workflow.prototype.setSnapToGrid = function(flag) {
	if (flag) {
		this.snapToGridHelper = new lore.draw2d.SnapToGrid(this);
	} else {
		this.snapToGridHelper = null;
	}
};
lore.draw2d.Workflow.prototype.setSnapToGeometry = function(flag) {
	if (flag) {
		this.snapToGeometryHelper = new lore.draw2d.SnapToGeometry(this);
	} else {
		this.snapToGeometryHelper = null;
	}
};
lore.draw2d.Workflow.prototype.setGridWidth = function(dx, dy) {
	this.gridWidthX = dx;
	this.gridWidthY = dy;
};
lore.draw2d.Workflow.prototype.addFigure = function(_4f83, xPos, yPos) {
	lore.draw2d.Canvas.prototype.addFigure.call(this, _4f83, xPos, yPos, true);
	_4f83.setWorkflow(this);
	var _4f86 = this;
	
	if (_4f83 instanceof lore.draw2d.Line) {
		this.lines.add(_4f83);
	} else {
		this.figures.add(_4f83);
		_4f83.draggable.addEventListener("drag", function(_4f87) {
					var _4f88 = _4f86.getFigure(_4f87.target.element.id);
					if (_4f88 == null) {
						return;
					}
					if (_4f88.isSelectable() == false) {
						return;
					}
					_4f86.moveResizeHandles(_4f88);
				});
	}
	_4f83.paint();
	this.setDocumentDirty();
};
lore.draw2d.Workflow.prototype.removeFigure = function(_4f89) {
	lore.draw2d.Canvas.prototype.removeFigure.call(this, _4f89);
	this.figures.remove(_4f89);
	this.lines.remove(_4f89);
	this.dialogs.remove(_4f89);
	_4f89.setWorkflow(null);
	
	if (_4f89 instanceof lore.draw2d.Connection) {
		_4f89.disconnect();
	}
	if (this.currentSelection == _4f89) {
		this.setCurrentSelection(null);
	}
	this.setDocumentDirty();
};
lore.draw2d.Workflow.prototype.moveFront = function(_4f8a) {
	this.html.removeChild(_4f8a.getHTMLElement());
	this.html.appendChild(_4f8a.getHTMLElement());
};
lore.draw2d.Workflow.prototype.moveBack = function(_4f8b) {
	this.html.removeChild(_4f8b.getHTMLElement());
	this.html.insertBefore(_4f8b.getHTMLElement(), this.html.firstChild);
};

lore.draw2d.Workflow.prototype.getBestFigure = function(x, y, _4f94) {
	var _4f95 = null;
	for (var i = 0; i < this.figures.getSize(); i++) {
		var _4f97 = this.figures.get(i);
		if (_4f97.isOver(x, y) == true && _4f97 != _4f94) {
			if (_4f95 == null) {
				_4f95 = _4f97;
			} else {
				if (_4f95.getZOrder() < _4f97.getZOrder()) {
					_4f95 = _4f97;
				}
			}
		}
	}
	return _4f95;
};
lore.draw2d.Workflow.prototype.getBestLine = function(x, y, _4f9a) {
	var _4f9b = null;
	var count = this.lines.getSize();
	for (var i = 0; i < count; i++) {
		var line = this.lines.get(i);
		if (line.containsPoint(x, y) == true && line != _4f9a) {
			if (_4f9b == null) {
				_4f9b = line;
			} else {
				if (_4f9b.getZOrder() < line.getZOrder()) {
					_4f9b = line;
				}
			}
		}
	}
	return _4f9b;
};
lore.draw2d.Workflow.prototype.getFigure = function(id) {
	for (var i = 0; i < this.figures.getSize(); i++) {
		var _4fa1 = this.figures.get(i);
		if (_4fa1.id == id) {
			return _4fa1;
		}
	}
	return null;
};
lore.draw2d.Workflow.prototype.getFigures = function() {
	return this.figures;
};
lore.draw2d.Workflow.prototype.getDocument = function() {
	return new lore.draw2d.CanvasDocument(this);
};
lore.draw2d.Workflow.prototype.addSelectionListener = function(w) {
	if (w != null) {
		this.selectionListeners.add(w);
	}
};
lore.draw2d.Workflow.prototype.removeSelectionListener = function(w) {
	this.selectionListeners.remove(w);
};
lore.draw2d.Workflow.prototype.setCurrentSelection = function(_4fa4) {
	if (_4fa4 == null) {
		this.hideResizeHandles();
		this.hideLineResizeHandles();
	}
	this.currentSelection = _4fa4;
	for (var i = 0; i < this.selectionListeners.getSize(); i++) {
		var w = this.selectionListeners.get(i);
		if (w.onSelectionChanged) {
			w.onSelectionChanged(this.currentSelection);
		}
	}
};
lore.draw2d.Workflow.prototype.getCurrentSelection = function() {
	return this.currentSelection;
};
lore.draw2d.Workflow.prototype.getLine = function(id) {
	var count = this.lines.getSize();
	for (var i = 0; i < count; i++) {
		var line = this.lines.get(i);
		if (line.getId() == id) {
			return line;
		}
	}
	return null;
};
lore.draw2d.Workflow.prototype.getLines = function() {
	return this.lines;
};
lore.draw2d.Workflow.prototype.registerPort = function(port) {
	port.draggable.targets = this.dropTargets;
	this.commonPorts.add(port);
	this.dropTargets.add(port.dropable);
};
lore.draw2d.Workflow.prototype.unregisterPort = function(port) {
	port.draggable.targets = null;
	this.commonPorts.remove(port);
	this.dropTargets.remove(port.dropable);
};
lore.draw2d.Workflow.prototype.getCommandStack = function() {
	return this.commandStack;
};
lore.draw2d.Workflow.prototype.showConnectionLine = function(x1, y1, x2, y2) {
	this.connectionLine.setStartPoint(x1, y1);
	this.connectionLine.setEndPoint(x2, y2);
	if (this.connectionLine.canvas == null) {
		lore.draw2d.Canvas.prototype.addFigure.call(this, this.connectionLine);
	}
};
lore.draw2d.Workflow.prototype.hideConnectionLine = function() {
	if (this.connectionLine.canvas != null) {
		lore.draw2d.Canvas.prototype.removeFigure.call(this, this.connectionLine);
	}
};
lore.draw2d.Workflow.prototype.showLineResizeHandles = function(_4fb1) {
	var _4fb2 = this.resizeHandleStart.getWidth() / 2;
	var _4fb3 = this.resizeHandleStart.getHeight() / 2;
	var _4fb4 = _4fb1.getStartPoint();
	var _4fb5 = _4fb1.getEndPoint();
	lore.draw2d.Canvas.prototype.addFigure.call(this, this.resizeHandleStart,
			_4fb4.x - _4fb2, _4fb4.y - _4fb2);
	lore.draw2d.Canvas.prototype.addFigure.call(this, this.resizeHandleEnd, _4fb5.x
					- _4fb2, _4fb5.y - _4fb2);
	this.resizeHandleStart.setCanDrag(_4fb1.isResizeable());
	this.resizeHandleEnd.setCanDrag(_4fb1.isResizeable());
	if (_4fb1.isResizeable()) {
		this.resizeHandleStart.setBackgroundColor(lore.draw2d.Workflow.COLOR_GREEN);
		this.resizeHandleEnd.setBackgroundColor(lore.draw2d.Workflow.COLOR_GREEN);
		this.resizeHandleStart.draggable.targets = this.dropTargets;
		this.resizeHandleEnd.draggable.targets = this.dropTargets;
	} else {
		this.resizeHandleStart.setBackgroundColor(null);
		this.resizeHandleEnd.setBackgroundColor(null);
	}
};
lore.draw2d.Workflow.prototype.hideLineResizeHandles = function() {
	if (this.resizeHandleStart.canvas != null) {
		lore.draw2d.Canvas.prototype.removeFigure.call(this, this.resizeHandleStart);
	}
	if (this.resizeHandleEnd.canvas != null) {
		lore.draw2d.Canvas.prototype.removeFigure.call(this, this.resizeHandleEnd);
	}
};
lore.draw2d.Workflow.prototype.showResizeHandles = function(_4fb6) {
	this.hideLineResizeHandles();
	this.hideResizeHandles();
	if (this.getEnableSmoothFigureHandling() == true
			&& this.getCurrentSelection() != _4fb6) {
		this.resizeHandle1.setAlpha(0.01);
		this.resizeHandle2.setAlpha(0.01);
		this.resizeHandle3.setAlpha(0.01);
		this.resizeHandle4.setAlpha(0.01);
		this.resizeHandle5.setAlpha(0.01);
		this.resizeHandle6.setAlpha(0.01);
		this.resizeHandle7.setAlpha(0.01);
		this.resizeHandle8.setAlpha(0.01);
	}
	var _4fb7 = this.resizeHandle1.getWidth();
	var _4fb8 = this.resizeHandle1.getHeight();
	var _4fb9 = _4fb6.getHeight();
	var _4fba = _4fb6.getWidth();
	var xPos = _4fb6.getX();
	var yPos = _4fb6.getY();
	lore.draw2d.Canvas.prototype.addFigure.call(this, this.resizeHandle1, xPos
					- _4fb7, yPos - _4fb8);
	lore.draw2d.Canvas.prototype.addFigure.call(this, this.resizeHandle3, xPos
					+ _4fba, yPos - _4fb8);
	lore.draw2d.Canvas.prototype.addFigure.call(this, this.resizeHandle5, xPos
					+ _4fba, yPos + _4fb9);
	lore.draw2d.Canvas.prototype.addFigure.call(this, this.resizeHandle7, xPos
					- _4fb7, yPos + _4fb9);
	this.moveFront(this.resizeHandle1);
	this.moveFront(this.resizeHandle3);
	this.moveFront(this.resizeHandle5);
	this.moveFront(this.resizeHandle7);
	this.resizeHandle1.setCanDrag(_4fb6.isResizeable());
	this.resizeHandle3.setCanDrag(_4fb6.isResizeable());
	this.resizeHandle5.setCanDrag(_4fb6.isResizeable());
	this.resizeHandle7.setCanDrag(_4fb6.isResizeable());
	if (_4fb6.isResizeable()) {
		var green = new lore.draw2d.Color(0, 255, 0);
		this.resizeHandle1.setBackgroundColor(green);
		this.resizeHandle3.setBackgroundColor(green);
		this.resizeHandle5.setBackgroundColor(green);
		this.resizeHandle7.setBackgroundColor(green);
	} else {
		this.resizeHandle1.setBackgroundColor(null);
		this.resizeHandle3.setBackgroundColor(null);
		this.resizeHandle5.setBackgroundColor(null);
		this.resizeHandle7.setBackgroundColor(null);
	}
	if (_4fb6.isStrechable() && _4fb6.isResizeable()) {
		this.resizeHandle2.setCanDrag(_4fb6.isResizeable());
		this.resizeHandle4.setCanDrag(_4fb6.isResizeable());
		this.resizeHandle6.setCanDrag(_4fb6.isResizeable());
		this.resizeHandle8.setCanDrag(_4fb6.isResizeable());
		lore.draw2d.Canvas.prototype.addFigure.call(this, this.resizeHandle2, xPos
						+ (_4fba / 2) - this.resizeHandleHalfWidth, yPos
						- _4fb8);
		lore.draw2d.Canvas.prototype.addFigure.call(this, this.resizeHandle4, xPos
						+ _4fba, yPos + (_4fb9 / 2) - (_4fb8 / 2));
		lore.draw2d.Canvas.prototype.addFigure.call(this, this.resizeHandle6, xPos
						+ (_4fba / 2) - this.resizeHandleHalfWidth, yPos
						+ _4fb9);
		lore.draw2d.Canvas.prototype.addFigure.call(this, this.resizeHandle8, xPos
						- _4fb7, yPos + (_4fb9 / 2) - (_4fb8 / 2));
		this.moveFront(this.resizeHandle2);
		this.moveFront(this.resizeHandle4);
		this.moveFront(this.resizeHandle6);
		this.moveFront(this.resizeHandle8);
	}
};
lore.draw2d.Workflow.prototype.hideResizeHandles = function() {
	if (this.resizeHandle1.canvas != null) {
		lore.draw2d.Canvas.prototype.removeFigure.call(this, this.resizeHandle1);
	}
	if (this.resizeHandle2.canvas != null) {
		lore.draw2d.Canvas.prototype.removeFigure.call(this, this.resizeHandle2);
	}
	if (this.resizeHandle3.canvas != null) {
		lore.draw2d.Canvas.prototype.removeFigure.call(this, this.resizeHandle3);
	}
	if (this.resizeHandle4.canvas != null) {
		lore.draw2d.Canvas.prototype.removeFigure.call(this, this.resizeHandle4);
	}
	if (this.resizeHandle5.canvas != null) {
		lore.draw2d.Canvas.prototype.removeFigure.call(this, this.resizeHandle5);
	}
	if (this.resizeHandle6.canvas != null) {
		lore.draw2d.Canvas.prototype.removeFigure.call(this, this.resizeHandle6);
	}
	if (this.resizeHandle7.canvas != null) {
		lore.draw2d.Canvas.prototype.removeFigure.call(this, this.resizeHandle7);
	}
	if (this.resizeHandle8.canvas != null) {
		lore.draw2d.Canvas.prototype.removeFigure.call(this, this.resizeHandle8);
	}
};
lore.draw2d.Workflow.prototype.moveResizeHandles = function(_4fbe) {
	var _4fbf = this.resizeHandle1.getWidth();
	var _4fc0 = this.resizeHandle1.getHeight();
	var _4fc1 = _4fbe.getHeight();
	var _4fc2 = _4fbe.getWidth();
	var xPos = _4fbe.getX();
	var yPos = _4fbe.getY();
	this.resizeHandle1.setPosition(xPos - _4fbf, yPos - _4fc0);
	this.resizeHandle3.setPosition(xPos + _4fc2, yPos - _4fc0);
	this.resizeHandle5.setPosition(xPos + _4fc2, yPos + _4fc1);
	this.resizeHandle7.setPosition(xPos - _4fbf, yPos + _4fc1);
	if (_4fbe.isStrechable()) {
		this.resizeHandle2.setPosition(xPos + (_4fc2 / 2)
						- this.resizeHandleHalfWidth, yPos - _4fc0);
		this.resizeHandle4.setPosition(xPos + _4fc2, yPos + (_4fc1 / 2)
						- (_4fc0 / 2));
		this.resizeHandle6.setPosition(xPos + (_4fc2 / 2)
						- this.resizeHandleHalfWidth, yPos + _4fc1);
		this.resizeHandle8.setPosition(xPos - _4fbf, yPos + (_4fc1 / 2)
						- (_4fc0 / 2));
	}
};
lore.draw2d.Workflow.prototype.onMouseDown = function(x, y) {
	this.dragging = true;
	this.mouseDownPosX = x;
	this.mouseDownPosY = y;
	
	this.setCurrentSelection(null);
	this.showMenu(null);
	var line = this.getBestLine(x, y);
	if (line != null && line.isSelectable()) {
		this.hideResizeHandles();
		this.setCurrentSelection(line);
		this.showLineResizeHandles(this.currentSelection);
		if (line instanceof lore.draw2d.Line && !(line instanceof lore.draw2d.Connection)) {
			this.draggingLineCommand = line
					.createCommand(new lore.draw2d.EditPolicy(lore.draw2d.EditPolicy.MOVE));
			if (this.draggingLineCommand != null) {
				this.draggingLine = line;
			}
		}
	}
};
lore.draw2d.Workflow.prototype.onMouseUp = function(x, y) {
	this.dragging = false;
	if (this.draggingLineCommand != null) {
		this.getCommandStack().execute(this.draggingLineCommand);
		this.draggingLine = null;
		this.draggingLineCommand = null;
	}
};
lore.draw2d.Workflow.prototype.onMouseMove = function(x, y) {
	if (this.dragging == true && this.draggingLine != null) {
		var diffX = x - this.mouseDownPosX;
		var diffY = y - this.mouseDownPosY;
		this.draggingLine.startX = this.draggingLine.getStartX() + diffX;
		this.draggingLine.startY = this.draggingLine.getStartY() + diffY;
		this.draggingLine.setEndPoint(this.draggingLine.getEndX() + diffX,
				this.draggingLine.getEndY() + diffY);
		this.mouseDownPosX = x;
		this.mouseDownPosY = y;
		this.showLineResizeHandles(this.currentSelection);
	} else {
		if (this.dragging == true && this.panning == true) {
			var diffX = x - this.mouseDownPosX;
			var diffY = y - this.mouseDownPosY;
			this.scrollTo(this.getScrollLeft() - diffX, this.getScrollTop()
							- diffY, true);
			this.onScroll();
		}
	}
};
lore.draw2d.Workflow.prototype.onKeyDown = function(_4fce, ctrl) {
	if (_4fce == 46 && this.currentSelection != null) {
		this.commandStack
				.execute(this.currentSelection
						.createCommand(new lore.draw2d.EditPolicy(lore.draw2d.EditPolicy.DELETE)));
	} else {
		if (_4fce == 90 && ctrl) {
			this.commandStack.undo();
		} else {
			if (_4fce == 89 && ctrl) {
				this.commandStack.redo();
			}
		}
	}
};
lore.draw2d.Workflow.prototype.setDocumentDirty = function() {
	for (var i = 0; i < this.dialogs.getSize(); i++) {
		var d = this.dialogs.get(i);
		if (d != null && d.onSetDocumentDirty) {
			d.onSetDocumentDirty();
		}
	}
	if (this.snapToGeometryHelper != null) {
		this.snapToGeometryHelper.onSetDocumentDirty();
	}
	if (this.snapToGridHelper != null) {
		this.snapToGridHelper.onSetDocumentDirty();
	}
};
lore.draw2d.Workflow.prototype.snapToHelper = function(_4fd2, pos) {
	if (this.snapToGeometryHelper != null) {
		if (_4fd2 instanceof lore.draw2d.ResizeHandle) {
			var _4fd4 = _4fd2.getSnapToGridAnchor();
			pos.x += _4fd4.x;
			pos.y += _4fd4.y;
			var _4fd5 = new lore.draw2d.Point(pos.x, pos.y);
			var _4fd6 = _4fd2.getSnapToDirection();
			var _4fd7 = this.snapToGeometryHelper.snapPoint(_4fd6, pos, _4fd5);
			if ((_4fd6 & lore.draw2d.SnapToHelper.EAST_WEST)
					&& !(_4fd7 & lore.draw2d.SnapToHelper.EAST_WEST)) {
				this.showSnapToHelperLineVertical(_4fd5.x);
			} else {
				this.hideSnapToHelperLineVertical();
			}
			if ((_4fd6 & lore.draw2d.SnapToHelper.NORTH_SOUTH)
					&& !(_4fd7 & lore.draw2d.SnapToHelper.NORTH_SOUTH)) {
				this.showSnapToHelperLineHorizontal(_4fd5.y);
			} else {
				this.hideSnapToHelperLineHorizontal();
			}
			_4fd5.x -= _4fd4.x;
			_4fd5.y -= _4fd4.y;
			return _4fd5;
		} else {
			var _4fd8 = new lore.draw2d.Dimension(pos.x, pos.y, _4fd2.getWidth(),
					_4fd2.getHeight());
			var _4fd5 = new lore.draw2d.Dimension(pos.x, pos.y, _4fd2.getWidth(),
					_4fd2.getHeight());
			var _4fd6 = lore.draw2d.SnapToHelper.NSEW;
			var _4fd7 = this.snapToGeometryHelper.snapRectangle(_4fd8, _4fd5);
			if ((_4fd6 & lore.draw2d.SnapToHelper.WEST)
					&& !(_4fd7 & lore.draw2d.SnapToHelper.WEST)) {
				this.showSnapToHelperLineVertical(_4fd5.x);
			} else {
				if ((_4fd6 & lore.draw2d.SnapToHelper.EAST)
						&& !(_4fd7 & lore.draw2d.SnapToHelper.EAST)) {
					this.showSnapToHelperLineVertical(_4fd5.getX()
							+ _4fd5.getWidth());
				} else {
					this.hideSnapToHelperLineVertical();
				}
			}
			if ((_4fd6 & lore.draw2d.SnapToHelper.NORTH)
					&& !(_4fd7 & lore.draw2d.SnapToHelper.NORTH)) {
				this.showSnapToHelperLineHorizontal(_4fd5.y);
			} else {
				if ((_4fd6 & lore.draw2d.SnapToHelper.SOUTH)
						&& !(_4fd7 & lore.draw2d.SnapToHelper.SOUTH)) {
					this.showSnapToHelperLineHorizontal(_4fd5.getY()
							+ _4fd5.getHeight());
				} else {
					this.hideSnapToHelperLineHorizontal();
				}
			}
			return _4fd5.getTopLeft();
		}
	} else {
		if (this.snapToGridHelper != null) {
			var _4fd4 = _4fd2.getSnapToGridAnchor();
			pos.x = pos.x + _4fd4.x;
			pos.y = pos.y + _4fd4.y;
			var _4fd5 = new lore.draw2d.Point(pos.x, pos.y);
			this.snapToGridHelper.snapPoint(0, pos, _4fd5);
			_4fd5.x = _4fd5.x - _4fd4.x;
			_4fd5.y = _4fd5.y - _4fd4.y;
			return _4fd5;
		}
	}
	return pos;
};
lore.draw2d.Workflow.prototype.showSnapToHelperLineHorizontal = function(_4fd9) {
	if (this.horizontalSnapToHelperLine == null) {
		this.horizontalSnapToHelperLine = new lore.draw2d.Line();
		this.horizontalSnapToHelperLine
				.setColor(new lore.draw2d.Color(175, 175, 255));
		this.addFigure(this.horizontalSnapToHelperLine);
	}
	this.horizontalSnapToHelperLine.setStartPoint(0, _4fd9);
	this.horizontalSnapToHelperLine.setEndPoint(this.getWidth(), _4fd9);
};
lore.draw2d.Workflow.prototype.showSnapToHelperLineVertical = function(_4fda) {
	if (this.verticalSnapToHelperLine == null) {
		this.verticalSnapToHelperLine = new lore.draw2d.Line();
		this.verticalSnapToHelperLine.setColor(new lore.draw2d.Color(175, 175, 255));
		this.addFigure(this.verticalSnapToHelperLine);
	}
	this.verticalSnapToHelperLine.setStartPoint(_4fda, 0);
	this.verticalSnapToHelperLine.setEndPoint(_4fda, this.getHeight());
};
lore.draw2d.Workflow.prototype.hideSnapToHelperLines = function() {
	this.hideSnapToHelperLineHorizontal();
	this.hideSnapToHelperLineVertical();
};
lore.draw2d.Workflow.prototype.hideSnapToHelperLineHorizontal = function() {
	if (this.horizontalSnapToHelperLine != null) {
		this.removeFigure(this.horizontalSnapToHelperLine);
		this.horizontalSnapToHelperLine = null;
	}
};
lore.draw2d.Workflow.prototype.hideSnapToHelperLineVertical = function() {
	if (this.verticalSnapToHelperLine != null) {
		this.removeFigure(this.verticalSnapToHelperLine);
		this.verticalSnapToHelperLine = null;
	}
};

/**
 * @class lore.draw2d.EditPolicy
 * @param {} p
 */
lore.draw2d.EditPolicy = function(p) {
	this.policy = p;
};
lore.draw2d.EditPolicy.DELETE = "DELETE";
lore.draw2d.EditPolicy.MOVE = "MOVE";
lore.draw2d.EditPolicy.CONNECT = "CONNECT";
lore.draw2d.EditPolicy.RESIZE = "RESIZE";
lore.draw2d.EditPolicy.prototype.type = "lore.draw2d.EditPolicy";
lore.draw2d.EditPolicy.prototype.getPolicy = function() {
	return this.policy;
};