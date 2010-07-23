
/**
 * This notice must be untouched at all times. This is the COMPRESSED version of
 * the Draw2D Library WebSite: http://www.draw2d.org Copyright: 2006 Andreas
 * Herz. All rights reserved. Created: 5.11.2006 by Andreas Herz (Web:
 * http://www.freegroup.de ) LICENSE: LGPL
 */
var draw2d = new Object();
draw2d.Event = function() {
	this.type = null;
	this.target = null;
	this.relatedTarget = null;
	this.cancelable = false;
	this.timeStamp = null;
	this.returnValue = true;
};
draw2d.Event.prototype.initEvent = function(sType, _60e2) {
	this.type = sType;
	this.cancelable = _60e2;
	this.timeStamp = (new Date()).getTime();
};
draw2d.Event.prototype.preventDefault = function() {
	if (this.cancelable) {
		this.returnValue = false;
	}
};
draw2d.Event.fireDOMEvent = function(_60e3, _60e4) {
	if (document.createEvent) {
		var evt = document.createEvent("Events");
		evt.initEvent(_60e3, true, true);
		_60e4.dispatchEvent(evt);
	} else {
		if (document.createEventObject) {
			var evt = document.createEventObject();
			_60e4.fireEvent("on" + _60e3, evt);
		}
	}
};
draw2d.EventTarget = function() {
	this.eventhandlers = new Object();
};
draw2d.EventTarget.prototype.addEventListener = function(sType, _60e7) {
	if (typeof this.eventhandlers[sType] == "undefined") {
		this.eventhandlers[sType] = new Array;
	}
	this.eventhandlers[sType][this.eventhandlers[sType].length] = _60e7;
};
draw2d.EventTarget.prototype.dispatchEvent = function(_60e8) {
	_60e8.target = this;
	if (typeof this.eventhandlers[_60e8.type] != "undefined") {
		for (var i = 0; i < this.eventhandlers[_60e8.type].length; i++) {
			this.eventhandlers[_60e8.type][i](_60e8);
		}
	}
	return _60e8.returnValue;
};
draw2d.EventTarget.prototype.removeEventListener = function(sType, _60eb) {
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
String.prototype.trim = function() {
	return (this.replace(new RegExp("^([\\s]+)|([\\s]+)$", "gm"), ""));
};
String.prototype.lefttrim = function() {
	return (this.replace(new RegExp("^[\\s]+", "gm"), ""));
};
String.prototype.righttrim = function() {
	return (this.replace(new RegExp("[\\s]+$", "gm"), ""));
};
String.prototype.between = function(left, right, _60ad) {
	if (!_60ad) {
		_60ad = 0;
	}
	var li = this.indexOf(left, _60ad);
	if (li == -1) {
		return null;
	}
	var ri = this.indexOf(right, li);
	if (ri == -1) {
		return null;
	}
	return this.substring(li + left.length, ri);
};
draw2d.UUID = function() {
};
draw2d.UUID.prototype.type = "draw2d.UUID";
draw2d.UUID.create = function() {
	var _5f17 = function() {
		return (((1 + Math.random()) * 65536) | 0).toString(16).substring(1);
	};
	return (_5f17() + _5f17() + "-" + _5f17() + "-" + _5f17() + "-" + _5f17()
			+ "-" + _5f17() + _5f17() + _5f17());
};
draw2d.ArrayList = function() {
	this.increment = 10;
	this.size = 0;
	this.data = new Array(this.increment);
};
draw2d.ArrayList.EMPTY_LIST = new draw2d.ArrayList();
draw2d.ArrayList.prototype.type = "draw2d.ArrayList";
draw2d.ArrayList.prototype.reverse = function() {
	var _5aff = new Array(this.size);
	for (var i = 0; i < this.size; i++) {
		_5aff[i] = this.data[this.size - i - 1];
	}
	this.data = _5aff;
};
draw2d.ArrayList.prototype.getCapacity = function() {
	return this.data.length;
};
draw2d.ArrayList.prototype.getSize = function() {
	return this.size;
};
draw2d.ArrayList.prototype.isEmpty = function() {
	return this.getSize() == 0;
};
draw2d.ArrayList.prototype.getLastElement = function() {
	if (this.data[this.getSize() - 1] != null) {
		return this.data[this.getSize() - 1];
	}
};
draw2d.ArrayList.prototype.getFirstElement = function() {
	if (this.data[0] != null) {
		return this.data[0];
	}
};
draw2d.ArrayList.prototype.get = function(i) {
	return this.data[i];
};
draw2d.ArrayList.prototype.add = function(obj) {
	if (this.getSize() == this.data.length) {
		this.resize();
	}
	this.data[this.size++] = obj;
};
draw2d.ArrayList.prototype.addAll = function(obj) {
	for (var i = 0; i < obj.getSize(); i++) {
		this.add(obj.get(i));
	}
};
draw2d.ArrayList.prototype.remove = function(obj) {
	var index = this.indexOf(obj);
	if (index >= 0) {
		return this.removeElementAt(index);
	}
	return null;
};
draw2d.ArrayList.prototype.insertElementAt = function(obj, index) {
	if (this.size == this.capacity) {
		this.resize();
	}
	for (var i = this.getSize(); i > index; i--) {
		this.data[i] = this.data[i - 1];
	}
	this.data[index] = obj;
	this.size++;
};
draw2d.ArrayList.prototype.removeElementAt = function(index) {
	var _5b0b = this.data[index];
	for (var i = index; i < (this.getSize() - 1); i++) {
		this.data[i] = this.data[i + 1];
	}
	this.data[this.getSize() - 1] = null;
	this.size--;
	return _5b0b;
};
draw2d.ArrayList.prototype.removeAllElements = function() {
	this.size = 0;
	for (var i = 0; i < this.data.length; i++) {
		this.data[i] = null;
	}
};
draw2d.ArrayList.prototype.indexOf = function(obj) {
	for (var i = 0; i < this.getSize(); i++) {
		if (this.data[i] == obj) {
			return i;
		}
	}
	return -1;
};
draw2d.ArrayList.prototype.contains = function(obj) {
	for (var i = 0; i < this.getSize(); i++) {
		if (this.data[i] == obj) {
			return true;
		}
	}
	return false;
};
draw2d.ArrayList.prototype.resize = function() {
	newData = new Array(this.data.length + this.increment);
	for (var i = 0; i < this.data.length; i++) {
		newData[i] = this.data[i];
	}
	this.data = newData;
};
draw2d.ArrayList.prototype.trimToSize = function() {
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
draw2d.ArrayList.prototype.sort = function(f) {
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
draw2d.ArrayList.prototype.clone = function() {
	var _5b1b = new draw2d.ArrayList(this.size);
	for (var i = 0; i < this.size; i++) {
		_5b1b.add(this.data[i]);
	}
	return _5b1b;
};
draw2d.ArrayList.prototype.overwriteElementAt = function(obj, index) {
	this.data[index] = obj;
};
draw2d.ArrayList.prototype.getPersistentAttributes = function() {
	return {
		data : this.data,
		increment : this.increment,
		size : this.getSize()
	};
};
function trace(_5f18) {
	var _5f19 = openwindow("about:blank", 700, 400);
	_5f19.document.writeln("<pre>" + _5f18 + "</pre>");
}
function openwindow(url, width, _5f1c) {
	var left = (screen.width - width) / 2;
	var top = (screen.height - _5f1c) / 2;
	property = "left="
			+ left
			+ ", top="
			+ top
			+ ", toolbar=0,scrollbars=0,location=0,statusbar=0,menubar=0,resizable=1,alwaysRaised,width="
			+ width + ",height=" + _5f1c;
	return window.open(url, "_blank", property);
}
function dumpObject(obj) {
	trace("----------------------------------------------------------------------------");
	trace("- Object dump");
	trace("----------------------------------------------------------------------------");
	for (var i in obj) {
		try {
			if (typeof obj[i] != "function") {
				trace(i + " --&gt; " + obj[i]);
			}
		} catch (e) {
		}
	}
	for (var i in obj) {
		try {
			if (typeof obj[i] == "function") {
				trace(i + " --&gt; " + obj[i]);
			}
		} catch (e) {
		}
	}
	trace("----------------------------------------------------------------------------");
}
draw2d.Drag = function() {
};
draw2d.Drag.current = null;
draw2d.Drag.currentTarget = null;
draw2d.Drag.dragging = false;
draw2d.Drag.isDragging = function() {
	return this.dragging;
};
draw2d.Drag.setCurrent = function(_4bc3) {
	this.current = _4bc3;
	this.dragging = true;
};
draw2d.Drag.getCurrent = function() {
	return this.current;
};
draw2d.Drag.clearCurrent = function() {
	this.current = null;
	this.dragging = false;
	this.currentTarget = null;
};
draw2d.Draggable = function(_4bc4, _4bc5) {
	draw2d.EventTarget.call(this);
	this.construct(_4bc4, _4bc5);
	this.diffX = 0;
	this.diffY = 0;
	this.targets = new draw2d.ArrayList();
};
draw2d.Draggable.prototype = new draw2d.EventTarget;
draw2d.Draggable.prototype.construct = function(_4bc6, _4bc7) {
	this.element = _4bc6;
	this.constraints = _4bc7;
	var oThis = this;
	var _4bc9 = function() {
		var _4bca = new draw2d.DragDropEvent();
		_4bca.initDragDropEvent("dblclick", true);
		oThis.dispatchEvent(_4bca);
		var _4bcb = arguments[0] || window.event;
		_4bcb.cancelBubble = true;
		_4bcb.returnValue = false;
	};
	var _4bcc = function() {
		var _4bcd = arguments[0] || window.event;
		var _4bce = new draw2d.DragDropEvent();
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
				draw2d.Drag.setCurrent(oThis);
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
		if (draw2d.Drag.getCurrent() == null) {
			var _4bd4 = arguments[0] || window.event;
			if (draw2d.Drag.currentHover != null
					&& oThis != draw2d.Drag.currentHover) {
				var _4bd5 = new draw2d.DragDropEvent();
				_4bd5.initDragDropEvent("mouseleave", false, oThis);
				draw2d.Drag.currentHover.dispatchEvent(_4bd5);
			}
			if (oThis != null && oThis != draw2d.Drag.currentHover) {
				var _4bd5 = new draw2d.DragDropEvent();
				_4bd5.initDragDropEvent("mouseenter", false, oThis);
				oThis.dispatchEvent(_4bd5);
			}
			draw2d.Drag.currentHover = oThis;
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
draw2d.Draggable.prototype.attachEventHandlers = function() {
	var oThis = this;
	oThis.isAttached = true;
	this.tempMouseMove = function() {
		var _4bd7 = arguments[0] || window.event;
		var _4bd8 = new draw2d.Point(_4bd7.clientX - oThis.diffX, _4bd7.clientY
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
		if (draw2d.Drag.currentTarget != null
				&& _4bdd != draw2d.Drag.currentTarget) {
			var _4bdf = new draw2d.DragDropEvent();
			_4bdf.initDragDropEvent("dragleave", false, oThis);
			draw2d.Drag.currentTarget.dispatchEvent(_4bdf);
		}
		if (_4bdd != null && _4bdd != draw2d.Drag.currentTarget) {
			var _4bdf = new draw2d.DragDropEvent();
			_4bdf.initDragDropEvent("dragenter", false, oThis);
			_4bdd.dispatchEvent(_4bdf);
		}
		draw2d.Drag.currentTarget = _4bdd;
		if (draw2d.Drag.currentCompartment != null
				&& _4bde != draw2d.Drag.currentCompartment) {
			var _4bdf = new draw2d.DragDropEvent();
			_4bdf.initDragDropEvent("figureleave", false, oThis);
			draw2d.Drag.currentCompartment.dispatchEvent(_4bdf);
		}
		if (_4bde != null && _4bde.node != oThis.node
				&& _4bde != draw2d.Drag.currentCompartment) {
			var _4bdf = new draw2d.DragDropEvent();
			_4bdf.initDragDropEvent("figureenter", false, oThis);
			_4bde.dispatchEvent(_4bdf);
		}
		draw2d.Drag.currentCompartment = _4bde;
		var _4be0 = new draw2d.DragDropEvent();
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
			var _4be8 = new draw2d.DragDropEvent();
			_4be8.initDragDropEvent("drop", false, oThis);
			_4be6.dispatchEvent(_4be8);
		}
		if (_4be7 != null && _4be7.node != oThis.node) {
			var _4be8 = new draw2d.DragDropEvent();
			_4be8.initDragDropEvent("figuredrop", false, oThis);
			_4be7.dispatchEvent(_4be8);
		}
		if (draw2d.Drag.currentTarget != null) {
			var _4be8 = new draw2d.DragDropEvent();
			_4be8.initDragDropEvent("dragleave", false, oThis);
			draw2d.Drag.currentTarget.dispatchEvent(_4be8);
			draw2d.Drag.currentTarget = null;
		}
		var _4be9 = new draw2d.DragDropEvent();
		_4be9.initDragDropEvent("dragend", false);
		oThis.dispatchEvent(_4be9);
		draw2d.Drag.currentCompartment = null;
		draw2d.Drag.clearCurrent();
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
draw2d.Draggable.prototype.detachEventHandlers = function() {
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
draw2d.Draggable.prototype.getDropTarget = function(x, y) {
	for (var i = 0; i < this.targets.getSize(); i++) {
		var _4bed = this.targets.get(i);
		if (_4bed.node.isOver(x, y) && _4bed.node != this.node) {
			return _4bed;
		}
	}
	return null;
};
draw2d.Draggable.prototype.getCompartment = function(x, y) {
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
draw2d.Draggable.prototype.getLeft = function() {
	return this.element.offsetLeft;
};
draw2d.Draggable.prototype.getTop = function() {
	return this.element.offsetTop;
};
draw2d.DragDropEvent = function() {
	draw2d.Event.call(this);
};
draw2d.DragDropEvent.prototype = new draw2d.Event();
draw2d.DragDropEvent.prototype.initDragDropEvent = function(sType, _4bf4, _4bf5) {
	this.initEvent(sType, _4bf4);
	this.relatedTarget = _4bf5;
};
draw2d.DropTarget = function(_4bf6) {
	draw2d.EventTarget.call(this);
	this.construct(_4bf6);
};
draw2d.DropTarget.prototype = new draw2d.EventTarget;
draw2d.DropTarget.prototype.construct = function(_4bf7) {
	this.element = _4bf7;
};
draw2d.DropTarget.prototype.getLeft = function() {
	var el = this.element;
	var ol = el.offsetLeft;
	while ((el = el.offsetParent) != null) {
		ol += el.offsetLeft;
	}
	return ol;
};
draw2d.DropTarget.prototype.getTop = function() {
	var el = this.element;
	var ot = el.offsetTop;
	while ((el = el.offsetParent) != null) {
		ot += el.offsetTop;
	}
	return ot;
};
draw2d.DropTarget.prototype.getHeight = function() {
	return this.element.offsetHeight;
};
draw2d.DropTarget.prototype.getWidth = function() {
	return this.element.offsetWidth;
};
draw2d.PositionConstants = function() {
};
draw2d.PositionConstants.NORTH = 1;
draw2d.PositionConstants.SOUTH = 4;
draw2d.PositionConstants.WEST = 8;
draw2d.PositionConstants.EAST = 16;
draw2d.Color = function(red, green, blue) {
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
draw2d.Color.prototype.type = "draw2d.Color";
draw2d.Color.prototype.getHTMLStyle = function() {
	return "rgb(" + this.red + "," + this.green + "," + this.blue + ")";
};
draw2d.Color.prototype.getRed = function() {
	return this.red;
};
draw2d.Color.prototype.getGreen = function() {
	return this.green;
};
draw2d.Color.prototype.getBlue = function() {
	return this.blue;
};
draw2d.Color.prototype.getIdealTextColor = function() {
	var _4f13 = 105;
	var _4f14 = (this.red * 0.299) + (this.green * 0.587) + (this.blue * 0.114);
	return (255 - _4f14 < _4f13)
			? new draw2d.Color(0, 0, 0)
			: new draw2d.Color(255, 255, 255);
};
draw2d.Color.prototype.hex2rgb = function(_4f15) {
	_4f15 = _4f15.replace("#", "");
	return ({
		0 : parseInt(_4f15.substr(0, 2), 16),
		1 : parseInt(_4f15.substr(2, 2), 16),
		2 : parseInt(_4f15.substr(4, 2), 16)
	});
};
draw2d.Color.prototype.hex = function() {
	return (this.int2hex(this.red) + this.int2hex(this.green) + this
			.int2hex(this.blue));
};
draw2d.Color.prototype.int2hex = function(v) {
	v = Math.round(Math.min(Math.max(0, v), 255));
	return ("0123456789ABCDEF".charAt((v - v % 16) / 16) + "0123456789ABCDEF"
			.charAt(v % 16));
};
draw2d.Color.prototype.darker = function(_4f17) {
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
	return new draw2d.Color(red, green, blue);
};
draw2d.Color.prototype.lighter = function(_4f1b) {
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
	return new draw2d.Color(red, green, blue);
};
draw2d.Point = function(x, y) {
	this.x = x;
	this.y = y;
};
draw2d.Point.prototype.type = "draw2d.Point";
draw2d.Point.prototype.getX = function() {
	return this.x;
};
draw2d.Point.prototype.getY = function() {
	return this.y;
};
draw2d.Point.prototype.getPosition = function(p) {
	var dx = p.x - this.x;
	var dy = p.y - this.y;
	if (Math.abs(dx) > Math.abs(dy)) {
		if (dx < 0) {
			return draw2d.PositionConstants.WEST;
		}
		return draw2d.PositionConstants.EAST;
	}
	if (dy < 0) {
		return draw2d.PositionConstants.NORTH;
	}
	return draw2d.PositionConstants.SOUTH;
};
draw2d.Point.prototype.equals = function(o) {
	return this.x == o.x && this.y == o.y;
};
draw2d.Point.prototype.getDistance = function(other) {
	return Math.sqrt((this.x - other.x) * (this.x - other.x)
			+ (this.y - other.y) * (this.y - other.y));
};
draw2d.Point.prototype.getTranslated = function(other) {
	return new draw2d.Point(this.x + other.x, this.y + other.y);
};
draw2d.Point.prototype.getPersistentAttributes = function() {
	return {
		x : this.x,
		y : this.y
	};
};
draw2d.Dimension = function(x, y, w, h) {
	draw2d.Point.call(this, x, y);
	this.w = w;
	this.h = h;
};
draw2d.Dimension.prototype = new draw2d.Point;
draw2d.Dimension.prototype.type = "draw2d.Dimension";
draw2d.Dimension.prototype.translate = function(dx, dy) {
	this.x += dx;
	this.y += dy;
	return this;
};
draw2d.Dimension.prototype.resize = function(dw, dh) {
	this.w += dw;
	this.h += dh;
	return this;
};
draw2d.Dimension.prototype.setBounds = function(rect) {
	this.x = rect.x;
	this.y = rect.y;
	this.w = rect.w;
	this.h = rect.h;
	return this;
};
draw2d.Dimension.prototype.isEmpty = function() {
	return this.w <= 0 || this.h <= 0;
};
draw2d.Dimension.prototype.getWidth = function() {
	return this.w;
};
draw2d.Dimension.prototype.getHeight = function() {
	return this.h;
};
draw2d.Dimension.prototype.getRight = function() {
	return this.x + this.w;
};
draw2d.Dimension.prototype.getBottom = function() {
	return this.y + this.h;
};
draw2d.Dimension.prototype.getTopLeft = function() {
	return new draw2d.Point(this.x, this.y);
};
draw2d.Dimension.prototype.getCenter = function() {
	return new draw2d.Point(this.x + this.w / 2, this.y + this.h / 2);
};
draw2d.Dimension.prototype.getBottomRight = function() {
	return new draw2d.Point(this.x + this.w, this.y + this.h);
};
draw2d.Dimension.prototype.equals = function(o) {
	return this.x == o.x && this.y == o.y && this.w == o.w && this.h == o.h;
};
draw2d.SnapToHelper = function(_50db) {
	this.workflow = _50db;
};
draw2d.SnapToHelper.NORTH = 1;
draw2d.SnapToHelper.SOUTH = 4;
draw2d.SnapToHelper.WEST = 8;
draw2d.SnapToHelper.EAST = 16;
draw2d.SnapToHelper.CENTER = 32;
draw2d.SnapToHelper.NORTH_EAST = draw2d.SnapToHelper.NORTH
		| draw2d.SnapToHelper.EAST;
draw2d.SnapToHelper.NORTH_WEST = draw2d.SnapToHelper.NORTH
		| draw2d.SnapToHelper.WEST;
draw2d.SnapToHelper.SOUTH_EAST = draw2d.SnapToHelper.SOUTH
		| draw2d.SnapToHelper.EAST;
draw2d.SnapToHelper.SOUTH_WEST = draw2d.SnapToHelper.SOUTH
		| draw2d.SnapToHelper.WEST;
draw2d.SnapToHelper.NORTH_SOUTH = draw2d.SnapToHelper.NORTH
		| draw2d.SnapToHelper.SOUTH;
draw2d.SnapToHelper.EAST_WEST = draw2d.SnapToHelper.EAST
		| draw2d.SnapToHelper.WEST;
draw2d.SnapToHelper.NSEW = draw2d.SnapToHelper.NORTH_SOUTH
		| draw2d.SnapToHelper.EAST_WEST;
draw2d.SnapToHelper.prototype.snapPoint = function(_50dc, _50dd, _50de) {
	return _50dd;
};
draw2d.SnapToHelper.prototype.snapRectangle = function(_50df, _50e0) {
	return _50df;
};
draw2d.SnapToHelper.prototype.onSetDocumentDirty = function() {
};
draw2d.SnapToGrid = function(_51dc) {
	draw2d.SnapToHelper.call(this, _51dc);
};
draw2d.SnapToGrid.prototype = new draw2d.SnapToHelper;
draw2d.SnapToGrid.prototype.type = "draw2d.SnapToGrid";
draw2d.SnapToGrid.prototype.snapPoint = function(_51dd, _51de, _51df) {
	_51df.x = this.workflow.gridWidthX
			* Math
					.floor(((_51de.x + this.workflow.gridWidthX / 2) / this.workflow.gridWidthX));
	_51df.y = this.workflow.gridWidthY
			* Math
					.floor(((_51de.y + this.workflow.gridWidthY / 2) / this.workflow.gridWidthY));
	return 0;
};
draw2d.SnapToGrid.prototype.snapRectangle = function(_51e0, _51e1) {
	_51e1.x = _51e0.x;
	_51e1.y = _51e0.y;
	_51e1.w = _51e0.w;
	_51e1.h = _51e0.h;
	return 0;
};
draw2d.SnapToGeometryEntry = function(type, _5baf) {
	this.type = type;
	this.location = _5baf;
};
draw2d.SnapToGeometryEntry.prototype.getLocation = function() {
	return this.location;
};
draw2d.SnapToGeometryEntry.prototype.getType = function() {
	return this.type;
};
draw2d.SnapToGeometry = function(_4ec2) {
	draw2d.SnapToHelper.call(this, _4ec2);
};
draw2d.SnapToGeometry.prototype = new draw2d.SnapToHelper;
draw2d.SnapToGeometry.THRESHOLD = 5;
draw2d.SnapToGeometry.prototype.snapPoint = function(_4ec3, _4ec4, _4ec5) {
	if (this.rows == null || this.cols == null) {
		this.populateRowsAndCols();
	}
	if ((_4ec3 & draw2d.SnapToHelper.EAST) != 0) {
		var _4ec6 = this.getCorrectionFor(this.cols, _4ec4.getX() - 1, 1);
		if (_4ec6 != draw2d.SnapToGeometry.THRESHOLD) {
			_4ec3 &= ~draw2d.SnapToHelper.EAST;
			_4ec5.x += _4ec6;
		}
	}
	if ((_4ec3 & draw2d.SnapToHelper.WEST) != 0) {
		var _4ec7 = this.getCorrectionFor(this.cols, _4ec4.getX(), -1);
		if (_4ec7 != draw2d.SnapToGeometry.THRESHOLD) {
			_4ec3 &= ~draw2d.SnapToHelper.WEST;
			_4ec5.x += _4ec7;
		}
	}
	if ((_4ec3 & draw2d.SnapToHelper.SOUTH) != 0) {
		var _4ec8 = this.getCorrectionFor(this.rows, _4ec4.getY() - 1, 1);
		if (_4ec8 != draw2d.SnapToGeometry.THRESHOLD) {
			_4ec3 &= ~draw2d.SnapToHelper.SOUTH;
			_4ec5.y += _4ec8;
		}
	}
	if ((_4ec3 & draw2d.SnapToHelper.NORTH) != 0) {
		var _4ec9 = this.getCorrectionFor(this.rows, _4ec4.getY(), -1);
		if (_4ec9 != draw2d.SnapToGeometry.THRESHOLD) {
			_4ec3 &= ~draw2d.SnapToHelper.NORTH;
			_4ec5.y += _4ec9;
		}
	}
	return _4ec3;
};
draw2d.SnapToGeometry.prototype.snapRectangle = function(_4eca, _4ecb) {
	var _4ecc = _4eca.getTopLeft();
	var _4ecd = _4eca.getBottomRight();
	var _4ece = this.snapPoint(draw2d.SnapToHelper.NORTH_WEST, _4eca
					.getTopLeft(), _4ecc);
	_4ecb.x = _4ecc.x;
	_4ecb.y = _4ecc.y;
	var _4ecf = this.snapPoint(draw2d.SnapToHelper.SOUTH_EAST, _4eca
					.getBottomRight(), _4ecd);
	if (_4ece & draw2d.SnapToHelper.WEST) {
		_4ecb.x = _4ecd.x - _4eca.getWidth();
	}
	if (_4ece & draw2d.SnapToHelper.NORTH) {
		_4ecb.y = _4ecd.y - _4eca.getHeight();
	}
	return _4ece | _4ecf;
};
draw2d.SnapToGeometry.prototype.populateRowsAndCols = function() {
	this.rows = new Array();
	this.cols = new Array();
	var _4ed0 = this.workflow.getDocument().getFigures();
	var index = 0;
	for (var i = 0; i < _4ed0.getSize(); i++) {
		var _4ed3 = _4ed0.get(i);
		if (_4ed3 != this.workflow.getCurrentSelection()) {
			var _4ed4 = _4ed3.getBounds();
			this.cols[index * 3] = new draw2d.SnapToGeometryEntry(-1, _4ed4
							.getX());
			this.rows[index * 3] = new draw2d.SnapToGeometryEntry(-1, _4ed4
							.getY());
			this.cols[index * 3 + 1] = new draw2d.SnapToGeometryEntry(0,
					_4ed4.x + (_4ed4.getWidth() - 1) / 2);
			this.rows[index * 3 + 1] = new draw2d.SnapToGeometryEntry(0,
					_4ed4.y + (_4ed4.getHeight() - 1) / 2);
			this.cols[index * 3 + 2] = new draw2d.SnapToGeometryEntry(1, _4ed4
							.getRight()
							- 1);
			this.rows[index * 3 + 2] = new draw2d.SnapToGeometryEntry(1, _4ed4
							.getBottom()
							- 1);
			index++;
		}
	}
};
draw2d.SnapToGeometry.prototype.getCorrectionFor = function(_4ed5, value, side) {
	var _4ed8 = draw2d.SnapToGeometry.THRESHOLD;
	var _4ed9 = draw2d.SnapToGeometry.THRESHOLD;
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
draw2d.SnapToGeometry.prototype.onSetDocumentDirty = function() {
	this.rows = null;
	this.cols = null;
};
draw2d.Border = function() {
	this.color = null;
};
draw2d.Border.prototype.type = "draw2d.Border";
draw2d.Border.prototype.dispose = function() {
	this.color = null;
};
draw2d.Border.prototype.getHTMLStyle = function() {
	return "";
};
draw2d.Border.prototype.setColor = function(c) {
	this.color = c;
};
draw2d.Border.prototype.getColor = function() {
	return this.color;
};
draw2d.Border.prototype.refresh = function() {
};
draw2d.LineBorder = function(width) {
	draw2d.Border.call(this);
	this.width = 1;
	if (width) {
		this.width = width;
	}
	this.figure = null;
};
draw2d.LineBorder.prototype = new draw2d.Border;
draw2d.LineBorder.prototype.type = "draw2d.LineBorder";
draw2d.LineBorder.prototype.dispose = function() {
	draw2d.Border.prototype.dispose.call(this);
	this.figure = null;
};
draw2d.LineBorder.prototype.setLineWidth = function(w) {
	this.width = w;
	if (this.figure != null) {
		this.figure.html.style.border = this.getHTMLStyle();
	}
};
draw2d.LineBorder.prototype.getHTMLStyle = function() {
	if (this.getColor() != null) {
		return this.width + "px solid " + this.getColor().getHTMLStyle();
	}
	return this.width + "px solid black";
};
draw2d.LineBorder.prototype.refresh = function() {
	this.setLineWidth(this.width);
};
draw2d.Figure = function() {
	this.construct();
};
draw2d.Figure.prototype.type = "draw2d.Figure";
draw2d.Figure.ZOrderBaseIndex = 100;
draw2d.Figure.setZOrderBaseIndex = function(index) {
	draw2d.Figure.ZOrderBaseIndex = index;
};
draw2d.Figure.prototype.construct = function() {
	this.lastDragStartTime = 0;
	this.x = 0;
	this.y = 0;
	this.border = null;
	this.setDimension(10, 10);
	this.id = draw2d.UUID.create();
	this.html = this.createHTMLElement();
	this.canvas = null;
	this.workflow = null;
	this.draggable = null;
	this.parent = null;
	this.isMoving = false;
	this.canSnapToHelper = true;
	this.snapToGridAnchor = new draw2d.Point(0, 0);
	this.timer = -1;
	this.model = null;
	this.setDeleteable(true);
	this.setCanDrag(true);
	this.setResizeable(true);
	this.setSelectable(true);
	this.properties = new Object();
	this.moveListener = new draw2d.ArrayList();
};
draw2d.Figure.prototype.dispose = function() {
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
		this.draggable.target.removeAllElements();
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
draw2d.Figure.prototype.getProperties = function() {
	return this.properties;
};
draw2d.Figure.prototype.getProperty = function(key) {
	return this.properties[key];
};
draw2d.Figure.prototype.setProperty = function(key, value) {
	this.properties[key] = value;
	this.setDocumentDirty();
};
draw2d.Figure.prototype.getId = function() {
	return this.id;
};
draw2d.Figure.prototype.setId = function(id) {
	this.id = id;
	if (this.html != null) {
		this.html.id = id;
	}
};
draw2d.Figure.prototype.setCanvas = function(_5aca) {
	this.canvas = _5aca;
};
draw2d.Figure.prototype.getWorkflow = function() {
	return this.workflow;
};
draw2d.Figure.prototype.setWorkflow = function(_5acb) {
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
		this.draggable = new draw2d.Draggable(this.html,
				draw2d.Draggable.DRAG_X | draw2d.Draggable.DRAG_Y);
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
			if (w.toolPalette && w.toolPalette.activeTool) {
				_5ad2.returnValue = false;
				w.onMouseDown(oThis.x + _5ad2.x, _5ad2.y + oThis.y);
				w.onMouseUp(oThis.x + _5ad2.x, _5ad2.y + oThis.y);
				return;
			}
			if (!(oThis instanceof draw2d.ResizeHandle)
					&& !(oThis instanceof draw2d.Port)) {
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
draw2d.Figure.prototype.createHTMLElement = function() {
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
	item.style.zIndex = "" + draw2d.Figure.ZOrderBaseIndex;
	return item;
};
draw2d.Figure.prototype.setParent = function(_5ad8) {
	this.parent = _5ad8;
};
draw2d.Figure.prototype.getParent = function() {
	return this.parent;
};
draw2d.Figure.prototype.getZOrder = function() {
	return this.html.style.zIndex;
};
draw2d.Figure.prototype.setZOrder = function(index) {
	this.html.style.zIndex = index;
};
draw2d.Figure.prototype.hasFixedPosition = function() {
	return false;
};
draw2d.Figure.prototype.getMinWidth = function() {
	return 5;
};
draw2d.Figure.prototype.getMinHeight = function() {
	return 5;
};
draw2d.Figure.prototype.getHTMLElement = function() {
	if (this.html == null) {
		this.html = this.createHTMLElement();
	}
	return this.html;
};
draw2d.Figure.prototype.paint = function() {
};
draw2d.Figure.prototype.setBorder = function(_5ada) {
	if (this.border != null) {
		this.border.figure = null;
	}
	this.border = _5ada;
	this.border.figure = this;
	this.border.refresh();
	this.setDocumentDirty();
};
draw2d.Figure.prototype.onContextMenu = function(x, y) {
	var menu = this.getContextMenu();
	if (menu != null) {
		this.workflow.showMenu(menu, x, y);
	}
};
draw2d.Figure.prototype.getContextMenu = function() {
	return null;
};
draw2d.Figure.prototype.onDoubleClick = function() {
};
draw2d.Figure.prototype.onMouseEnter = function() {
};
draw2d.Figure.prototype.onMouseLeave = function() {
};
draw2d.Figure.prototype.onDrag = function() {
	this.x = this.draggable.getLeft();
	this.y = this.draggable.getTop();
	if (this.isMoving == false) {
		this.isMoving = true;
		this.setAlpha(0.5);
	}
	this.fireMoveEvent();
};
draw2d.Figure.prototype.onDragend = function() {
	if (this.getWorkflow().getEnableSmoothFigureHandling() == true) {
		var _5ade = this;
		var _5adf = function() {
			if (_5ade.alpha < 1) {
				_5ade.setAlpha(Math.min(1, _5ade.alpha + 0.05));
			} else {
				window.clearInterval(_5ade.timer);
				_5ade.timer = -1;
			}
		};
		if (_5ade.timer > 0) {
			window.clearInterval(_5ade.timer);
		}
		_5ade.timer = window.setInterval(_5adf, 20);
	} else {
		this.setAlpha(1);
	}
	this.command.setPosition(this.x, this.y);
	this.workflow.commandStack.execute(this.command);
	this.command = null;
	this.isMoving = false;
	this.workflow.hideSnapToHelperLines();
	this.fireMoveEvent();
};
draw2d.Figure.prototype.onDragstart = function(x, y) {
	this.command = this
			.createCommand(new draw2d.EditPolicy(draw2d.EditPolicy.MOVE));
	return this.command != null;
};
draw2d.Figure.prototype.setCanDrag = function(flag) {
	this.canDrag = flag;
	if (flag) {
		this.html.style.cursor = "move";
	} else {
		this.html.style.cursor = "";
	}
};
draw2d.Figure.prototype.setAlpha = function(_5ae3) {
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
draw2d.Figure.prototype.setDimension = function(w, h) {
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
draw2d.Figure.prototype.setPosition = function(xPos, yPos) {
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
draw2d.Figure.prototype.isResizeable = function() {
	return this.resizeable;
};
draw2d.Figure.prototype.setResizeable = function(flag) {
	this.resizeable = flag;
};
draw2d.Figure.prototype.isSelectable = function() {
	return this.selectable;
};
draw2d.Figure.prototype.setSelectable = function(flag) {
	this.selectable = flag;
};
draw2d.Figure.prototype.isStrechable = function() {
	return true;
};
draw2d.Figure.prototype.isDeleteable = function() {
	return this.deleteable;
};
draw2d.Figure.prototype.setDeleteable = function(flag) {
	this.deleteable = flag;
};
draw2d.Figure.prototype.setCanSnapToHelper = function(flag) {
	this.canSnapToHelper = flag;
};
draw2d.Figure.prototype.getCanSnapToHelper = function() {
	return this.canSnapToHelper;
};
draw2d.Figure.prototype.getSnapToGridAnchor = function() {
	return this.snapToGridAnchor;
};
draw2d.Figure.prototype.setSnapToGridAnchor = function(point) {
	this.snapToGridAnchor = point;
};
draw2d.Figure.prototype.getBounds = function() {
	return new draw2d.Dimension(this.getX(), this.getY(), this.getWidth(), this
					.getHeight());
};
draw2d.Figure.prototype.getWidth = function() {
	return this.width;
};
draw2d.Figure.prototype.getHeight = function() {
	return this.height;
};
draw2d.Figure.prototype.getY = function() {
	return this.y;
};
draw2d.Figure.prototype.getX = function() {
	return this.x;
};
draw2d.Figure.prototype.getAbsoluteY = function() {
	return this.y;
};
draw2d.Figure.prototype.getAbsoluteX = function() {
	return this.x;
};
draw2d.Figure.prototype.onKeyDown = function(_5aee, ctrl) {
	if (_5aee == 46) {
		this.workflow
				.getCommandStack()
				.execute(this
						.createCommand(new draw2d.EditPolicy(draw2d.EditPolicy.DELETE)));
	}
	if (ctrl) {
		this.workflow.onKeyDown(_5aee, ctrl);
	}
};
draw2d.Figure.prototype.getPosition = function() {
	return new draw2d.Point(this.x, this.y);
};
draw2d.Figure.prototype.isOver = function(iX, iY) {
	var x = this.getAbsoluteX();
	var y = this.getAbsoluteY();
	var iX2 = x + this.width;
	var iY2 = y + this.height;
	return (iX >= x && iX <= iX2 && iY >= y && iY <= iY2);
};
draw2d.Figure.prototype.attachMoveListener = function(_5af6) {
	if (_5af6 == null || this.moveListener == null) {
		return;
	}
	this.moveListener.add(_5af6);
};
draw2d.Figure.prototype.detachMoveListener = function(_5af7) {
	if (_5af7 == null || this.moveListener == null) {
		return;
	}
	this.moveListener.remove(_5af7);
};
draw2d.Figure.prototype.fireMoveEvent = function() {
	this.setDocumentDirty();
	var size = this.moveListener.getSize();
	for (var i = 0; i < size; i++) {
		this.moveListener.get(i).onOtherFigureMoved(this);
	}
};
draw2d.Figure.prototype.setModel = function(model) {
	if (this.model != null) {
		this.model.removePropertyChangeListener(this);
	}
	this.model = model;
	if (this.model != null) {
		this.model.addPropertyChangeListener(this);
	}
};
draw2d.Figure.prototype.getModel = function() {
	return this.model;
};
draw2d.Figure.prototype.onOtherFigureMoved = function(_5afb) {
};
draw2d.Figure.prototype.setDocumentDirty = function() {
	if (this.workflow != null) {
		this.workflow.setDocumentDirty();
	}
};
draw2d.Figure.prototype.disableTextSelection = function(e) {
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
draw2d.Figure.prototype.createCommand = function(_5afd) {
	if (_5afd.getPolicy() == draw2d.EditPolicy.MOVE) {
		if (!this.canDrag) {
			return null;
		}
		return new draw2d.CommandMove(this);
	}
	if (_5afd.getPolicy() == draw2d.EditPolicy.DELETE) {
		if (!this.isDeleteable()) {
			return null;
		}
		return new draw2d.CommandDelete(this);
	}
	if (_5afd.getPolicy() == draw2d.EditPolicy.RESIZE) {
		if (!this.isResizeable()) {
			return null;
		}
		return new draw2d.CommandResize(this);
	}
	return null;
};
draw2d.Node = function() {
	this.bgColor = null;
	this.lineColor = new draw2d.Color(128, 128, 255);
	this.lineStroke = 1;
	this.ports = new draw2d.ArrayList();
	draw2d.Figure.call(this);
};
draw2d.Node.prototype = new draw2d.Figure;
draw2d.Node.prototype.type = "draw2d.Node";
draw2d.Node.prototype.dispose = function() {
	for (var i = 0; i < this.ports.getSize(); i++) {
		this.ports.get(i).dispose();
	}
	this.ports = null;
	draw2d.Figure.prototype.dispose.call(this);
};
draw2d.Node.prototype.createHTMLElement = function() {
	var item = draw2d.Figure.prototype.createHTMLElement.call(this);
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
draw2d.Node.prototype.paint = function() {
	draw2d.Figure.prototype.paint.call(this);
	for (var i = 0; i < this.ports.getSize(); i++) {
		this.ports.get(i).paint();
	}
};
draw2d.Node.prototype.getPorts = function() {
	return this.ports;
};
draw2d.Node.prototype.getPort = function(_48b8) {
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
draw2d.Node.prototype.addPort = function(port, x, y) {
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
draw2d.Node.prototype.removePort = function(port) {
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
draw2d.Node.prototype.setWorkflow = function(_48bf) {
	var _48c0 = this.workflow;
	draw2d.Figure.prototype.setWorkflow.call(this, _48bf);
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
draw2d.Node.prototype.setBackgroundColor = function(color) {
	this.bgColor = color;
	if (this.bgColor != null) {
		this.html.style.backgroundColor = this.bgColor.getHTMLStyle();
	} else {
		this.html.style.backgroundColor = "transparent";
	}
};
draw2d.Node.prototype.getBackgroundColor = function() {
	return this.bgColor;
};
draw2d.Node.prototype.setColor = function(color) {
	this.lineColor = color;
	if (this.lineColor != null) {
		this.html.style.border = this.lineStroke + "px solid "
				+ this.lineColor.getHTMLStyle();
	} else {
		this.html.style.border = "0px";
	}
};
draw2d.Node.prototype.setLineWidth = function(w) {
	this.lineStroke = w;
	if (this.lineColor != null) {
		this.html.style.border = this.lineStroke + "px solid "
				+ this.lineColor.getHTMLStyle();
	} else {
		this.html.style.border = "0px";
	}
};
draw2d.Node.prototype.getModelSourceConnections = function() {
	throw "You must override the method [Node.prototype.getModelSourceConnections]";
};
draw2d.Node.prototype.refreshConnections = function() {
	if (this.workflow != null) {
		this.workflow.refreshConnections(this);
	}
};
draw2d.VectorFigure = function() {
	this.bgColor = null;
	this.lineColor = new draw2d.Color(0, 0, 0);
	this.stroke = 1;
	this.graphics = null;
	draw2d.Node.call(this);
};
draw2d.VectorFigure.prototype = new draw2d.Node;
draw2d.VectorFigure.prototype.type = "draw2d.VectorFigure";
draw2d.VectorFigure.prototype.dispose = function() {
	draw2d.Node.prototype.dispose.call(this);
	this.bgColor = null;
	this.lineColor = null;
	if (this.graphics != null) {
		this.graphics.clear();
	}
	this.graphics = null;
};
draw2d.VectorFigure.prototype.createHTMLElement = function() {
	var item = draw2d.Node.prototype.createHTMLElement.call(this);
	item.style.border = "0px";
	item.style.backgroundColor = "transparent";
	return item;
};
draw2d.VectorFigure.prototype.setWorkflow = function(_5f28) {
	draw2d.Node.prototype.setWorkflow.call(this, _5f28);
	if (this.workflow == null) {
		this.graphics.clear();
		this.graphics = null;
	}
};
draw2d.VectorFigure.prototype.paint = function() {
	if (this.graphics == null) {
		this.graphics = new jsGraphics(this.id);
	} else {
		this.graphics.clear();
	}
	draw2d.Node.prototype.paint.call(this);
	for (var i = 0; i < this.ports.getSize(); i++) {
		this.getHTMLElement().appendChild(this.ports.get(i).getHTMLElement());
	}
};
draw2d.VectorFigure.prototype.setDimension = function(w, h) {
	draw2d.Node.prototype.setDimension.call(this, w, h);
	if (this.graphics != null) {
		this.paint();
	}
};
draw2d.VectorFigure.prototype.setBackgroundColor = function(color) {
	this.bgColor = color;
	if (this.graphics != null) {
		this.paint();
	}
};
draw2d.VectorFigure.prototype.getBackgroundColor = function() {
	return this.bgColor;
};
draw2d.VectorFigure.prototype.setLineWidth = function(w) {
	this.stroke = w;
	if (this.graphics != null) {
		this.paint();
	}
};
draw2d.VectorFigure.prototype.setColor = function(color) {
	this.lineColor = color;
	if (this.graphics != null) {
		this.paint();
	}
};
draw2d.VectorFigure.prototype.getColor = function() {
	return this.lineColor;
};
draw2d.SVGFigure = function(width, _60b6) {
	this.bgColor = null;
	this.lineColor = new draw2d.Color(0, 0, 0);
	this.stroke = 1;
	this.context = null;
	draw2d.Node.call(this);
	if (width && _60b6) {
		this.setDimension(width, _60b6);
	}
};
draw2d.SVGFigure.prototype = new draw2d.Node;
draw2d.SVGFigure.prototype.type = "draw2d.SVGFigure";
draw2d.SVGFigure.prototype.createHTMLElement = function() {
	var item = new MooCanvas(this.id, {
				width : 100,
				height : 100
			});
	item.style.position = "absolute";
	item.style.left = this.x + "px";
	item.style.top = this.y + "px";
	item.style.zIndex = "" + draw2d.Figure.ZOrderBaseIndex;
	this.context = item.getContext("2d");
	return item;
};
draw2d.SVGFigure.prototype.paint = function() {
	this.context.clearRect(0, 0, this.getWidth(), this.getHeight());
	this.context.fillStyle = "rgba(200,0,0,0.3)";
	this.context.fillRect(0, 0, this.getWidth(), this.getHeight());
};
draw2d.SVGFigure.prototype.setDimension = function(w, h) {
	draw2d.Node.prototype.setDimension.call(this, w, h);
	this.html.width = w;
	this.html.height = h;
	this.html.style.width = w + "px";
	this.html.style.height = h + "px";
	if (this.context != null) {
		if (this.context.element) {
			this.context.element.style.width = w + "px";
			this.context.element.style.height = h + "px";
		}
		this.paint();
	}
};
draw2d.SVGFigure.prototype.setBackgroundColor = function(color) {
	this.bgColor = color;
	if (this.graphics != null) {
		this.paint();
	}
};
draw2d.SVGFigure.prototype.getBackgroundColor = function() {
	return this.bgColor;
};
draw2d.SVGFigure.prototype.setLineWidth = function(w) {
	this.stroke = w;
	if (this.context != null) {
		this.paint();
	}
};
draw2d.SVGFigure.prototype.setColor = function(color) {
	this.lineColor = color;
	if (this.context != null) {
		this.paint();
	}
};
draw2d.SVGFigure.prototype.getColor = function() {
	return this.lineColor;
};
draw2d.Label = function(msg) {
	this.msg = msg;
	this.bgColor = null;
	this.color = new draw2d.Color(0, 0, 0);
	this.fontSize = 10;
	this.textNode = null;
	this.align = "center";
	draw2d.Figure.call(this);
};
draw2d.Label.prototype = new draw2d.Figure;
draw2d.Label.prototype.type = "draw2d.Label";
draw2d.Label.prototype.createHTMLElement = function() {
	var item = draw2d.Figure.prototype.createHTMLElement.call(this);
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
};
draw2d.Label.prototype.isResizeable = function() {
	return false;
};
draw2d.Label.prototype.setWordwrap = function(flag) {
	this.html.style.whiteSpace = flag ? "wrap" : "nowrap";
};
draw2d.Label.prototype.setAlign = function(align) {
	this.align = align;
	this.html.style.textAlign = align;
};
draw2d.Label.prototype.setBackgroundColor = function(color) {
	this.bgColor = color;
	if (this.bgColor != null) {
		this.html.style.backgroundColor = this.bgColor.getHTMLStyle();
	} else {
		this.html.style.backgroundColor = "transparent";
	}
};
draw2d.Label.prototype.setColor = function(color) {
	this.color = color;
	this.html.style.color = this.color.getHTMLStyle();
};
draw2d.Label.prototype.setFontSize = function(size) {
	this.fontSize = size;
	this.html.style.fontSize = this.fontSize + "pt";
};
draw2d.Label.prototype.getWidth = function() {
	if (window.getComputedStyle) {
		return parseInt(getComputedStyle(this.html, "")
				.getPropertyValue("width"));
	}
	return parseInt(this.html.clientWidth);
};
draw2d.Label.prototype.getHeight = function() {
	if (window.getComputedStyle) {
		return parseInt(getComputedStyle(this.html, "")
				.getPropertyValue("height"));
	}
	return parseInt(this.html.clientHeight);
};
draw2d.Label.prototype.getText = function() {
	return this.msg;
};
draw2d.Label.prototype.setText = function(text) {
	this.msg = text;
	this.html.removeChild(this.textNode);
	this.textNode = document.createTextNode(this.msg);
	this.html.appendChild(this.textNode);
};
draw2d.Label.prototype.setStyledText = function(text) {
	this.msg = text;
	this.html.removeChild(this.textNode);
	this.textNode = document.createElement("div");
	this.textNode.style.whiteSpace = "nowrap";
	this.textNode.innerHTML = text;
	this.html.appendChild(this.textNode);
};
draw2d.Oval = function() {
	draw2d.VectorFigure.call(this);
};
draw2d.Oval.prototype = new draw2d.VectorFigure;
draw2d.Oval.prototype.type = "draw2d.Oval";
draw2d.Oval.prototype.paint = function() {
	draw2d.VectorFigure.prototype.paint.call(this);
	this.graphics.setStroke(this.stroke);
	if (this.bgColor != null) {
		this.graphics.setColor(this.bgColor.getHTMLStyle());
		this.graphics.fillOval(0, 0, this.getWidth() - 1, this.getHeight() - 1);
	}
	if (this.lineColor != null) {
		this.graphics.setColor(this.lineColor.getHTMLStyle());
		this.graphics.drawOval(0, 0, this.getWidth() - 1, this.getHeight() - 1);
	}
	this.graphics.paint();
};
draw2d.Circle = function(_575d) {
	draw2d.Oval.call(this);
	if (_575d) {
		this.setDimension(_575d, _575d);
	}
};
draw2d.Circle.prototype = new draw2d.Oval;
draw2d.Circle.prototype.type = "draw2d.Circle";
draw2d.Circle.prototype.setDimension = function(w, h) {
	if (w > h) {
		draw2d.Oval.prototype.setDimension.call(this, w, w);
	} else {
		draw2d.Oval.prototype.setDimension.call(this, h, h);
	}
};
draw2d.Circle.prototype.isStrechable = function() {
	return false;
};
draw2d.Rectangle = function(width, _5bd4) {
	this.bgColor = null;
	this.lineColor = new draw2d.Color(0, 0, 0);
	this.lineStroke = 1;
	draw2d.Figure.call(this);
	if (width && _5bd4) {
		this.setDimension(width, _5bd4);
	}
};
draw2d.Rectangle.prototype = new draw2d.Figure;
draw2d.Rectangle.prototype.type = "draw2d.Rectangle";
draw2d.Rectangle.prototype.dispose = function() {
	draw2d.Figure.prototype.dispose.call(this);
	this.bgColor = null;
	this.lineColor = null;
};
draw2d.Rectangle.prototype.createHTMLElement = function() {
	var item = draw2d.Figure.prototype.createHTMLElement.call(this);
	item.style.width = "auto";
	item.style.height = "auto";
	item.style.margin = "0px";
	item.style.padding = "0px";
	item.style.border = this.lineStroke + "px solid "
			+ this.lineColor.getHTMLStyle();
	item.style.fontSize = "1px";
	item.style.lineHeight = "1px";
	item.innerHTML = "&nbsp";
	if (this.bgColor != null) {
		item.style.backgroundColor = this.bgColor.getHTMLStyle();
	}
	return item;
};
draw2d.Rectangle.prototype.setBackgroundColor = function(color) {
	this.bgColor = color;
	if (this.bgColor != null) {
		this.html.style.backgroundColor = this.bgColor.getHTMLStyle();
	} else {
		this.html.style.backgroundColor = "transparent";
	}
};
draw2d.Rectangle.prototype.getBackgroundColor = function() {
	return this.bgColor;
};
draw2d.Rectangle.prototype.setColor = function(color) {
	this.lineColor = color;
	if (this.lineColor != null) {
		this.html.style.border = this.lineStroke + "px solid "
				+ this.lineColor.getHTMLStyle();
	} else {
		this.html.style.border = this.lineStroke + "0px";
	}
};
draw2d.Rectangle.prototype.getColor = function() {
	return this.lineColor;
};
draw2d.Rectangle.prototype.getWidth = function() {
	return draw2d.Figure.prototype.getWidth.call(this) + 2 * this.lineStroke;
};
draw2d.Rectangle.prototype.getHeight = function() {
	return draw2d.Figure.prototype.getHeight.call(this) + 2 * this.lineStroke;
};
draw2d.Rectangle.prototype.setDimension = function(w, h) {
	return draw2d.Figure.prototype.setDimension.call(this, w - 2
					* this.lineStroke, h - 2 * this.lineStroke);
};
draw2d.Rectangle.prototype.setLineWidth = function(w) {
	var diff = w - this.lineStroke;
	this.setDimension(this.getWidth() - 2 * diff, this.getHeight() - 2 * diff);
	this.lineStroke = w;
	var c = "transparent";
	if (this.lineColor != null) {
		c = this.lineColor.getHTMLStyle();
	}
	this.html.style.border = this.lineStroke + "px solid " + c;
};
draw2d.Rectangle.prototype.getLineWidth = function() {
	return this.lineStroke;
};
draw2d.ImageFigure = function(url) {
	this.url = url;
	draw2d.Node.call(this);
	this.setDimension(40, 40);
};
draw2d.ImageFigure.prototype = new draw2d.Node;
draw2d.ImageFigure.prototype.type = "draw2d.Image";
draw2d.ImageFigure.prototype.createHTMLElement = function() {
	var item = draw2d.Node.prototype.createHTMLElement.call(this);
	item.style.width = this.width + "px";
	item.style.height = this.height + "px";
	item.style.margin = "0px";
	item.style.padding = "0px";
	item.style.border = "0px";
	if (this.url != null) {
		item.style.backgroundImage = "url(" + this.url + ")";
	} else {
		item.style.backgroundImage = "";
	}
	return item;
};
draw2d.ImageFigure.prototype.setColor = function(color) {
};
draw2d.ImageFigure.prototype.isResizeable = function() {
	return false;
};
draw2d.ImageFigure.prototype.setImage = function(url) {
	this.url = url;
	if (this.url != null) {
		this.html.style.backgroundImage = "url(" + this.url + ")";
	} else {
		this.html.style.backgroundImage = "";
	}
};
draw2d.Port = function(_5193, _5194) {
	Corona = function() {
	};
	Corona.prototype = new draw2d.Circle;
	Corona.prototype.setAlpha = function(_5195) {
		draw2d.Circle.prototype.setAlpha.call(this, Math.min(0.3, _5195));
	};
	if (_5193 == null) {
		this.currentUIRepresentation = new draw2d.Circle();
	} else {
		this.currentUIRepresentation = _5193;
	}
	if (_5194 == null) {
		this.connectedUIRepresentation = new draw2d.Circle();
		this.connectedUIRepresentation.setColor(null);
	} else {
		this.connectedUIRepresentation = _5194;
	}
	this.disconnectedUIRepresentation = this.currentUIRepresentation;
	this.hideIfConnected = false;
	this.uiRepresentationAdded = true;
	this.parentNode = null;
	this.originX = 0;
	this.originY = 0;
	this.coronaWidth = 10;
	this.corona = null;
	draw2d.Rectangle.call(this);
	this.setDimension(8, 8);
	this.setBackgroundColor(new draw2d.Color(100, 180, 100));
	this.setColor(new draw2d.Color(90, 150, 90));
	draw2d.Rectangle.prototype.setColor.call(this, null);
	this.dropable = new draw2d.DropTarget(this.html);
	this.dropable.node = this;
	this.dropable.addEventListener("dragenter", function(_5196) {
				_5196.target.node.onDragEnter(_5196.relatedTarget.node);
			});
	this.dropable.addEventListener("dragleave", function(_5197) {
				_5197.target.node.onDragLeave(_5197.relatedTarget.node);
			});
	this.dropable.addEventListener("drop", function(_5198) {
				_5198.relatedTarget.node.onDrop(_5198.target.node);
			});
};
draw2d.Port.prototype = new draw2d.Rectangle;
draw2d.Port.prototype.type = "draw2d.Port";
draw2d.Port.ZOrderBaseIndex = 5000;
draw2d.Port.setZOrderBaseIndex = function(index) {
	draw2d.Port.ZOrderBaseIndex = index;
};
draw2d.Port.prototype.setHideIfConnected = function(flag) {
	this.hideIfConnected = flag;
};
draw2d.Port.prototype.dispose = function() {
	var size = this.moveListener.getSize();
	for (var i = 0; i < size; i++) {
		var _519d = this.moveListener.get(i);
		this.parentNode.workflow.removeFigure(_519d);
		_519d.dispose();
	}
	draw2d.Rectangle.prototype.dispose.call(this);
	this.parentNode = null;
	this.dropable.node = null;
	this.dropable = null;
	this.disconnectedUIRepresentation.dispose();
	this.connectedUIRepresentation.dispose();
};
draw2d.Port.prototype.createHTMLElement = function() {
	var item = draw2d.Rectangle.prototype.createHTMLElement.call(this);
	item.style.zIndex = draw2d.Port.ZOrderBaseIndex;
	this.currentUIRepresentation.html.zIndex = draw2d.Port.ZOrderBaseIndex;
	item.appendChild(this.currentUIRepresentation.html);
	this.uiRepresentationAdded = true;
	return item;
};
draw2d.Port.prototype.setUiRepresentation = function(_519f) {
	if (_519f == null) {
		_519f = new draw2d.Figure();
	}
	if (this.uiRepresentationAdded) {
		this.html.removeChild(this.currentUIRepresentation.getHTMLElement());
	}
	this.html.appendChild(_519f.getHTMLElement());
	_519f.paint();
	this.currentUIRepresentation = _519f;
};
draw2d.Port.prototype.onMouseEnter = function() {
	this.setLineWidth(2);
};
draw2d.Port.prototype.onMouseLeave = function() {
	this.setLineWidth(0);
};
draw2d.Port.prototype.setDimension = function(width, _51a1) {
	draw2d.Rectangle.prototype.setDimension.call(this, width, _51a1);
	this.connectedUIRepresentation.setDimension(width, _51a1);
	this.disconnectedUIRepresentation.setDimension(width, _51a1);
	this.setPosition(this.x, this.y);
};
draw2d.Port.prototype.setBackgroundColor = function(color) {
	this.currentUIRepresentation.setBackgroundColor(color);
};
draw2d.Port.prototype.getBackgroundColor = function() {
	return this.currentUIRepresentation.getBackgroundColor();
};
draw2d.Port.prototype.getConnections = function() {
	var _51a3 = new draw2d.ArrayList();
	var size = this.moveListener.getSize();
	for (var i = 0; i < size; i++) {
		var _51a6 = this.moveListener.get(i);
		if (_51a6 instanceof draw2d.Connection) {
			_51a3.add(_51a6);
		}
	}
	return _51a3;
};
draw2d.Port.prototype.setColor = function(color) {
	this.currentUIRepresentation.setColor(color);
};
draw2d.Port.prototype.getColor = function() {
	return this.currentUIRepresentation.getColor();
};
draw2d.Port.prototype.setLineWidth = function(width) {
	this.currentUIRepresentation.setLineWidth(width);
};
draw2d.Port.prototype.getLineWidth = function() {
	return this.currentUIRepresentation.getLineWidth();
};
draw2d.Port.prototype.paint = function() {
	this.currentUIRepresentation.paint();
};
draw2d.Port.prototype.setPosition = function(xPos, yPos) {
	this.originX = xPos;
	this.originY = yPos;
	draw2d.Rectangle.prototype.setPosition.call(this, xPos, yPos);
	if (this.html == null) {
		return;
	}
	this.html.style.left = (this.x - this.getWidth() / 2) + "px";
	this.html.style.top = (this.y - this.getHeight() / 2) + "px";
};
draw2d.Port.prototype.setParent = function(_51ab) {
	if (this.parentNode != null) {
		this.parentNode.detachMoveListener(this);
	}
	this.parentNode = _51ab;
	if (this.parentNode != null) {
		this.parentNode.attachMoveListener(this);
	}
};
draw2d.Port.prototype.attachMoveListener = function(_51ac) {
	draw2d.Rectangle.prototype.attachMoveListener.call(this, _51ac);
	if (this.hideIfConnected == true) {
		this.setUiRepresentation(this.connectedUIRepresentation);
	}
};
draw2d.Port.prototype.detachMoveListener = function(_51ad) {
	draw2d.Rectangle.prototype.detachMoveListener.call(this, _51ad);
	if (this.getConnections().getSize() == 0) {
		this.setUiRepresentation(this.disconnectedUIRepresentation);
	}
};
draw2d.Port.prototype.getParent = function() {
	return this.parentNode;
};
draw2d.Port.prototype.onDrag = function() {
	draw2d.Rectangle.prototype.onDrag.call(this);
	this.parentNode.workflow.showConnectionLine(this.parentNode.x + this.x,
			this.parentNode.y + this.y, this.parentNode.x + this.originX,
			this.parentNode.y + this.originY);
};
draw2d.Port.prototype.getCoronaWidth = function() {
	return this.coronaWidth;
};
draw2d.Port.prototype.setCoronaWidth = function(width) {
	this.coronaWidth = width;
};
draw2d.Port.prototype.setOrigin = function(x, y) {
	this.originX = x;
	this.originY = y;
};
draw2d.Port.prototype.onDragend = function() {
	this.setAlpha(1);
	this.setPosition(this.originX, this.originY);
	this.parentNode.workflow.hideConnectionLine();
};
draw2d.Port.prototype.onDragEnter = function(port) {
	this.parentNode.workflow.connectionLine
			.setColor(new draw2d.Color(0, 150, 0));
	this.parentNode.workflow.connectionLine.setLineWidth(3);
	this.showCorona(true);
};
draw2d.Port.prototype.onDragLeave = function(port) {
	this.parentNode.workflow.connectionLine.setColor(new draw2d.Color(0, 0, 0));
	this.parentNode.workflow.connectionLine.setLineWidth(1);
	this.showCorona(false);
};
draw2d.Port.prototype.onDrop = function(port) {
	var _51b4 = new draw2d.EditPolicy(draw2d.EditPolicy.CONNECT);
	_51b4.canvas = this.parentNode.workflow;
	_51b4.source = port;
	_51b4.target = this;
	var _51b5 = this.createCommand(_51b4);
	if (_51b5 != null) {
		this.parentNode.workflow.getCommandStack().execute(_51b5);
	}
};
draw2d.Port.prototype.getAbsolutePosition = function() {
	return new draw2d.Point(this.getAbsoluteX(), this.getAbsoluteY());
};
draw2d.Port.prototype.getAbsoluteBounds = function() {
	return new draw2d.Dimension(this.getAbsoluteX(), this.getAbsoluteY(), this
					.getWidth(), this.getHeight());
};
draw2d.Port.prototype.getAbsoluteY = function() {
	return this.originY + this.parentNode.getY();
};
draw2d.Port.prototype.getAbsoluteX = function() {
	return this.originX + this.parentNode.getX();
};
draw2d.Port.prototype.onOtherFigureMoved = function(_51b6) {
	this.fireMoveEvent();
};
draw2d.Port.prototype.getName = function() {
	return this.name;
};
draw2d.Port.prototype.setName = function(name) {
	this.name = name;
};
draw2d.Port.prototype.isOver = function(iX, iY) {
	var x = this.getAbsoluteX() - this.coronaWidth - this.getWidth() / 2;
	var y = this.getAbsoluteY() - this.coronaWidth - this.getHeight() / 2;
	var iX2 = x + this.width + (this.coronaWidth * 2) + this.getWidth() / 2;
	var iY2 = y + this.height + (this.coronaWidth * 2) + this.getHeight() / 2;
	return (iX >= x && iX <= iX2 && iY >= y && iY <= iY2);
};
draw2d.Port.prototype.showCorona = function(flag, _51bf) {
	if (flag == true) {
		this.corona = new Corona();
		this.corona.setAlpha(0.3);
		this.corona.setBackgroundColor(new draw2d.Color(0, 125, 125));
		this.corona.setColor(null);
		this.corona.setDimension(this.getWidth() + (this.getCoronaWidth() * 2),
				this.getWidth() + (this.getCoronaWidth() * 2));
		this.parentNode.getWorkflow().addFigure(
				this.corona,
				this.getAbsoluteX() - this.getCoronaWidth() - this.getWidth()
						/ 2,
				this.getAbsoluteY() - this.getCoronaWidth() - this.getHeight()
						/ 2);
	} else {
		if (flag == false && this.corona != null) {
			this.parentNode.getWorkflow().removeFigure(this.corona);
			this.corona = null;
		}
	}
};
draw2d.Port.prototype.createCommand = function(_51c0) {
	if (_51c0.getPolicy() == draw2d.EditPolicy.MOVE) {
		return new draw2d.CommandMovePort(this);
	}
	if (_51c0.getPolicy() == draw2d.EditPolicy.CONNECT) {
		if (_51c0.source.parentNode.id == _51c0.target.parentNode.id) {
			return null;
		} else {
			return new draw2d.CommandConnect(_51c0.canvas, _51c0.source,
					_51c0.target);
		}
	}
	return null;
};
draw2d.InputPort = function(_5285) {
	draw2d.Port.call(this, _5285);
};
draw2d.InputPort.prototype = new draw2d.Port;
draw2d.InputPort.prototype.type = "draw2d.InputPort";
draw2d.InputPort.prototype.onDragEnter = function(port) {
	if (port instanceof draw2d.OutputPort) {
		draw2d.Port.prototype.onDragEnter.call(this, port);
	} else {
		if (port instanceof draw2d.LineStartResizeHandle) {
			var line = this.workflow.currentSelection;
			if (line instanceof draw2d.Connection
					&& line.getSource() instanceof draw2d.InputPort) {
				draw2d.Port.prototype.onDragEnter.call(this, line.getSource());
			}
		} else {
			if (port instanceof draw2d.LineEndResizeHandle) {
				var line = this.workflow.currentSelection;
				if (line instanceof draw2d.Connection
						&& line.getTarget() instanceof draw2d.InputPort) {
					draw2d.Port.prototype.onDragEnter.call(this, line
									.getTarget());
				}
			}
		}
	}
};
draw2d.InputPort.prototype.onDragLeave = function(port) {
	if (port instanceof draw2d.OutputPort) {
		draw2d.Port.prototype.onDragLeave.call(this, port);
	} else {
		if (port instanceof draw2d.LineStartResizeHandle) {
			var line = this.workflow.currentSelection;
			if (line instanceof draw2d.Connection
					&& line.getSource() instanceof draw2d.InputPort) {
				draw2d.Port.prototype.onDragLeave.call(this, line.getSource());
			}
		} else {
			if (port instanceof draw2d.LineEndResizeHandle) {
				var line = this.workflow.currentSelection;
				if (line instanceof draw2d.Connection
						&& line.getTarget() instanceof draw2d.InputPort) {
					draw2d.Port.prototype.onDragLeave.call(this, line
									.getTarget());
				}
			}
		}
	}
};
draw2d.InputPort.prototype.createCommand = function(_528a) {
	if (_528a.getPolicy() == draw2d.EditPolicy.CONNECT) {
		if (_528a.source.parentNode.id == _528a.target.parentNode.id) {
			return null;
		}
		if (_528a.source instanceof draw2d.OutputPort) {
			return new draw2d.CommandConnect(_528a.canvas, _528a.source,
					_528a.target);
		}
		return null;
	}
	return draw2d.Port.prototype.createCommand.call(this, _528a);
};
draw2d.OutputPort = function(_48cd) {
	draw2d.Port.call(this, _48cd);
	this.maxFanOut = 100;
};
draw2d.OutputPort.prototype = new draw2d.Port;
draw2d.OutputPort.prototype.type = "draw2d.OutputPort";
draw2d.OutputPort.prototype.onDragEnter = function(port) {
	if (this.getMaxFanOut() <= this.getFanOut()) {
		return;
	}
	if (port instanceof draw2d.InputPort) {
		draw2d.Port.prototype.onDragEnter.call(this, port);
	} else {
		if (port instanceof draw2d.LineStartResizeHandle) {
			var line = this.workflow.currentSelection;
			if (line instanceof draw2d.Connection
					&& line.getSource() instanceof draw2d.OutputPort) {
				draw2d.Port.prototype.onDragEnter.call(this, line.getSource());
			}
		} else {
			if (port instanceof draw2d.LineEndResizeHandle) {
				var line = this.workflow.currentSelection;
				if (line instanceof draw2d.Connection
						&& line.getTarget() instanceof draw2d.OutputPort) {
					draw2d.Port.prototype.onDragEnter.call(this, line
									.getTarget());
				}
			}
		}
	}
};
draw2d.OutputPort.prototype.onDragLeave = function(port) {
	if (port instanceof draw2d.InputPort) {
		draw2d.Port.prototype.onDragLeave.call(this, port);
	} else {
		if (port instanceof draw2d.LineStartResizeHandle) {
			var line = this.workflow.currentSelection;
			if (line instanceof draw2d.Connection
					&& line.getSource() instanceof draw2d.OutputPort) {
				draw2d.Port.prototype.onDragLeave.call(this, line.getSource());
			}
		} else {
			if (port instanceof draw2d.LineEndResizeHandle) {
				var line = this.workflow.currentSelection;
				if (line instanceof draw2d.Connection
						&& line.getTarget() instanceof draw2d.OutputPort) {
					draw2d.Port.prototype.onDragLeave.call(this, line
									.getTarget());
				}
			}
		}
	}
};
draw2d.OutputPort.prototype.onDragstart = function(x, y) {
	if (this.maxFanOut == -1) {
		return true;
	}
	if (this.getMaxFanOut() <= this.getFanOut()) {
		return false;
	}
	return true;
};
draw2d.OutputPort.prototype.setMaxFanOut = function(count) {
	this.maxFanOut = count;
};
draw2d.OutputPort.prototype.getMaxFanOut = function() {
	return this.maxFanOut;
};
draw2d.OutputPort.prototype.getFanOut = function() {
	if (this.getParent().workflow == null) {
		return 0;
	}
	var count = 0;
	var lines = this.getParent().workflow.getLines();
	var size = lines.getSize();
	for (var i = 0; i < size; i++) {
		var line = lines.get(i);
		if (line instanceof draw2d.Connection) {
			if (line.getSource() == this) {
				count++;
			} else {
				if (line.getTarget() == this) {
					count++;
				}
			}
		}
	}
	return count;
};
draw2d.OutputPort.prototype.createCommand = function(_48da) {
	if (_48da.getPolicy() == draw2d.EditPolicy.CONNECT) {
		if (_48da.source.parentNode.id == _48da.target.parentNode.id) {
			return null;
		}
		if (_48da.source instanceof draw2d.InputPort) {
			return new draw2d.CommandConnect(_48da.canvas, _48da.target,
					_48da.source);
		}
		return null;
	}
	return draw2d.Port.prototype.createCommand.call(this, _48da);
};
draw2d.Line = function() {
	this.lineColor = new draw2d.Color(0, 0, 0);
	this.stroke = 1;
	this.canvas = null;
	this.workflow = null;
	this.html = null;
	this.graphics = null;
	this.id = draw2d.UUID.create();
	this.startX = 30;
	this.startY = 30;
	this.endX = 100;
	this.endY = 100;
	this.alpha = 1;
	this.isMoving = false;
	this.model = null;
	this.zOrder = draw2d.Line.ZOrderBaseIndex;
	this.corona = draw2d.Line.CoronaWidth;
	this.properties = new Object();
	this.moveListener = new draw2d.ArrayList();
	this.setSelectable(true);
	this.setDeleteable(true);
};
draw2d.Line.prototype.type = "draw2d.Line";
draw2d.Line.ZOrderBaseIndex = 200;
draw2d.Line.ZOrderBaseIndex = 200;
draw2d.Line.CoronaWidth = 5;
draw2d.Line.setZOrderBaseIndex = function(index) {
	draw2d.Line.ZOrderBaseIndex = index;
};
draw2d.Line.setDefaultCoronaWidth = function(width) {
	draw2d.Line.CoronaWidth = width;
};
draw2d.Line.prototype.dispose = function() {
	this.canvas = null;
	this.workflow = null;
	if (this.graphics != null) {
		this.graphics.clear();
	}
	this.graphics = null;
};
draw2d.Line.prototype.getZOrder = function() {
	return this.zOrder;
};
draw2d.Line.prototype.setZOrder = function(index) {
	if (this.html != null) {
		this.html.style.zIndex = index;
	}
	this.zOrder = index;
};
draw2d.Line.prototype.setCoronaWidth = function(width) {
	this.corona = width;
};
draw2d.Line.prototype.createHTMLElement = function() {
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
draw2d.Line.prototype.setId = function(id) {
	this.id = id;
	if (this.html != null) {
		this.html.id = id;
	}
};
draw2d.Line.prototype.getProperties = function() {
	return this.properties;
};
draw2d.Line.prototype.getProperty = function(key) {
	return this.properties[key];
};
draw2d.Line.prototype.setProperty = function(key, value) {
	this.properties[key] = value;
	this.setDocumentDirty();
};
draw2d.Line.prototype.getHTMLElement = function() {
	if (this.html == null) {
		this.html = this.createHTMLElement();
	}
	return this.html;
};
draw2d.Line.prototype.getWorkflow = function() {
	return this.workflow;
};
draw2d.Line.prototype.isResizeable = function() {
	return true;
};
draw2d.Line.prototype.setCanvas = function(_4d3d) {
	this.canvas = _4d3d;
	if (this.graphics != null) {
		this.graphics.clear();
	}
	this.graphics = null;
};
draw2d.Line.prototype.setWorkflow = function(_4d3e) {
	this.workflow = _4d3e;
	if (this.graphics != null) {
		this.graphics.clear();
	}
	this.graphics = null;
};
draw2d.Line.prototype.paint = function() {
	if (this.graphics == null) {
		this.graphics = new jsGraphics(this.id);
	} else {
		this.graphics.clear();
	}
	this.graphics.setStroke(this.stroke);
	this.graphics.setColor(this.lineColor.getHTMLStyle());
	this.graphics.drawLine(this.startX, this.startY, this.endX, this.endY);
	this.graphics.paint();
};
draw2d.Line.prototype.attachMoveListener = function(_4d3f) {
	this.moveListener.add(_4d3f);
};
draw2d.Line.prototype.detachMoveListener = function(_4d40) {
	this.moveListener.remove(_4d40);
};
draw2d.Line.prototype.fireMoveEvent = function() {
	var size = this.moveListener.getSize();
	for (var i = 0; i < size; i++) {
		this.moveListener.get(i).onOtherFigureMoved(this);
	}
};
draw2d.Line.prototype.onOtherFigureMoved = function(_4d43) {
};
draw2d.Line.prototype.setLineWidth = function(w) {
	this.stroke = w;
	if (this.graphics != null) {
		this.paint();
	}
	this.setDocumentDirty();
};
draw2d.Line.prototype.setColor = function(color) {
	this.lineColor = color;
	if (this.graphics != null) {
		this.paint();
	}
	this.setDocumentDirty();
};
draw2d.Line.prototype.getColor = function() {
	return this.lineColor;
};
draw2d.Line.prototype.setAlpha = function(_4d46) {
	if (_4d46 == this.alpha) {
		return;
	}
	try {
		this.html.style.MozOpacity = _4d46;
	} catch (exc) {
	}
	try {
		this.html.style.opacity = _4d46;
	} catch (exc) {
	}
	try {
		var _4d47 = Math.round(_4d46 * 100);
		if (_4d47 >= 99) {
			this.html.style.filter = "";
		} else {
			this.html.style.filter = "alpha(opacity=" + _4d47 + ")";
		}
	} catch (exc) {
	}
	this.alpha = _4d46;
};
draw2d.Line.prototype.setStartPoint = function(x, y) {
	this.startX = x;
	this.startY = y;
	if (this.graphics != null) {
		this.paint();
	}
	this.setDocumentDirty();
};
draw2d.Line.prototype.setEndPoint = function(x, y) {
	this.endX = x;
	this.endY = y;
	if (this.graphics != null) {
		this.paint();
	}
	this.setDocumentDirty();
};
draw2d.Line.prototype.getStartX = function() {
	return this.startX;
};
draw2d.Line.prototype.getStartY = function() {
	return this.startY;
};
draw2d.Line.prototype.getStartPoint = function() {
	return new draw2d.Point(this.startX, this.startY);
};
draw2d.Line.prototype.getEndX = function() {
	return this.endX;
};
draw2d.Line.prototype.getEndY = function() {
	return this.endY;
};
draw2d.Line.prototype.getEndPoint = function() {
	return new draw2d.Point(this.endX, this.endY);
};
draw2d.Line.prototype.isSelectable = function() {
	return this.selectable;
};
draw2d.Line.prototype.setSelectable = function(flag) {
	this.selectable = flag;
};
draw2d.Line.prototype.isDeleteable = function() {
	return this.deleteable;
};
draw2d.Line.prototype.setDeleteable = function(flag) {
	this.deleteable = flag;
};
draw2d.Line.prototype.getLength = function() {
	return Math.sqrt((this.startX - this.endX) * (this.startX - this.endX)
			+ (this.startY - this.endY) * (this.startY - this.endY));
};
draw2d.Line.prototype.getAngle = function() {
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
draw2d.Line.prototype.createCommand = function(_4d50) {
	if (_4d50.getPolicy() == draw2d.EditPolicy.MOVE) {
		var x1 = this.getStartX();
		var y1 = this.getStartY();
		var x2 = this.getEndX();
		var y2 = this.getEndY();
		return new draw2d.CommandMoveLine(this, x1, y1, x2, y2);
	}
	if (_4d50.getPolicy() == draw2d.EditPolicy.DELETE) {
		if (this.isDeleteable() == false) {
			return null;
		}
		return new draw2d.CommandDelete(this);
	}
	return null;
};
draw2d.Line.prototype.setModel = function(model) {
	if (this.model != null) {
		this.model.removePropertyChangeListener(this);
	}
	this.model = model;
	if (this.model != null) {
		this.model.addPropertyChangeListener(this);
	}
};
draw2d.Line.prototype.getModel = function() {
	return this.model;
};
draw2d.Line.prototype.onContextMenu = function(x, y) {
	var menu = this.getContextMenu();
	if (menu != null) {
		this.workflow.showMenu(menu, x, y);
	}
};
draw2d.Line.prototype.getContextMenu = function() {
	return null;
};
draw2d.Line.prototype.onDoubleClick = function() {
};
draw2d.Line.prototype.setDocumentDirty = function() {
	if (this.workflow != null) {
		this.workflow.setDocumentDirty();
	}
};
draw2d.Line.prototype.containsPoint = function(px, py) {
	return draw2d.Line.hit(this.corona, this.startX, this.startY, this.endX,
			this.endY, px, py);
};
draw2d.Line.hit = function(_4d5b, X1, Y1, X2, Y2, px, py) {
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
draw2d.ConnectionRouter = function() {
};
draw2d.ConnectionRouter.prototype.type = "draw2d.ConnectionRouter";
draw2d.ConnectionRouter.prototype.getDirection = function(r, p) {
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
draw2d.ConnectionRouter.prototype.getEndDirection = function(conn) {
	var p = conn.getEndPoint();
	var rect = conn.getTarget().getParent().getBounds();
	return this.getDirection(rect, p);
};
draw2d.ConnectionRouter.prototype.getStartDirection = function(conn) {
	var p = conn.getStartPoint();
	var rect = conn.getSource().getParent().getBounds();
	return this.getDirection(rect, p);
};
draw2d.ConnectionRouter.prototype.route = function(_4db4) {
};
draw2d.NullConnectionRouter = function() {
};
draw2d.NullConnectionRouter.prototype = new draw2d.ConnectionRouter;
draw2d.NullConnectionRouter.prototype.type = "draw2d.NullConnectionRouter";
draw2d.NullConnectionRouter.prototype.invalidate = function() {
};
draw2d.NullConnectionRouter.prototype.route = function(_5f16) {
	_5f16.addPoint(_5f16.getStartPoint());
	_5f16.addPoint(_5f16.getEndPoint());
};
draw2d.ManhattanConnectionRouter = function() {
	this.MINDIST = 20;
};
draw2d.ManhattanConnectionRouter.prototype = new draw2d.ConnectionRouter;
draw2d.ManhattanConnectionRouter.prototype.type = "draw2d.ManhattanConnectionRouter";
draw2d.ManhattanConnectionRouter.prototype.route = function(conn) {
	var _5a56 = conn.getStartPoint();
	var _5a57 = this.getStartDirection(conn);
	var toPt = conn.getEndPoint();
	var toDir = this.getEndDirection(conn);
	this._route(conn, toPt, toDir, _5a56, _5a57);
};
draw2d.ManhattanConnectionRouter.prototype._route = function(conn, _5a5b,
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
		conn.addPoint(new draw2d.Point(toPt.x, toPt.y));
		return;
	}
	if (_5a5c == LEFT) {
		if ((xDiff > 0) && ((yDiff * yDiff) < TOL) && (toDir == RIGHT)) {
			point = toPt;
			dir = toDir;
		} else {
			if (xDiff < 0) {
				point = new draw2d.Point(_5a5b.x - this.MINDIST, _5a5b.y);
			} else {
				if (((yDiff > 0) && (toDir == DOWN))
						|| ((yDiff < 0) && (toDir == UP))) {
					point = new draw2d.Point(toPt.x, _5a5b.y);
				} else {
					if (_5a5c == toDir) {
						var pos = Math.min(_5a5b.x, toPt.x) - this.MINDIST;
						point = new draw2d.Point(pos, _5a5b.y);
					} else {
						point = new draw2d.Point(_5a5b.x - (xDiff / 2), _5a5b.y);
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
					point = new draw2d.Point(_5a5b.x + this.MINDIST, _5a5b.y);
				} else {
					if (((yDiff > 0) && (toDir == DOWN))
							|| ((yDiff < 0) && (toDir == UP))) {
						point = new draw2d.Point(toPt.x, _5a5b.y);
					} else {
						if (_5a5c == toDir) {
							var pos = Math.max(_5a5b.x, toPt.x) + this.MINDIST;
							point = new draw2d.Point(pos, _5a5b.y);
						} else {
							point = new draw2d.Point(_5a5b.x - (xDiff / 2),
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
						point = new draw2d.Point(_5a5b.x, _5a5b.y
										+ this.MINDIST);
					} else {
						if (((xDiff > 0) && (toDir == RIGHT))
								|| ((xDiff < 0) && (toDir == LEFT))) {
							point = new draw2d.Point(_5a5b.x, toPt.y);
						} else {
							if (_5a5c == toDir) {
								var pos = Math.max(_5a5b.y, toPt.y)
										+ this.MINDIST;
								point = new draw2d.Point(_5a5b.x, pos);
							} else {
								point = new draw2d.Point(_5a5b.x, _5a5b.y
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
							point = new draw2d.Point(_5a5b.x, _5a5b.y
											- this.MINDIST);
						} else {
							if (((xDiff > 0) && (toDir == RIGHT))
									|| ((xDiff < 0) && (toDir == LEFT))) {
								point = new draw2d.Point(_5a5b.x, toPt.y);
							} else {
								if (_5a5c == toDir) {
									var pos = Math.min(_5a5b.y, toPt.y)
											- this.MINDIST;
									point = new draw2d.Point(_5a5b.x, pos);
								} else {
									point = new draw2d.Point(_5a5b.x, _5a5b.y
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
draw2d.BezierConnectionRouter = function(_5a8c) {
	if (!_5a8c) {
		this.cheapRouter = new draw2d.ManhattanConnectionRouter();
	} else {
		this.cheapRouter = null;
	}
	this.iteration = 5;
};
draw2d.BezierConnectionRouter.prototype = new draw2d.ConnectionRouter;
draw2d.BezierConnectionRouter.prototype.type = "draw2d.BezierConnectionRouter";
draw2d.BezierConnectionRouter.prototype.drawBezier = function(_5a8d, _5a8e, t,
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
			q[i][j] = new draw2d.Point((1 - t) * q[i][j - 1].x + t
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
draw2d.BezierConnectionRouter.prototype.route = function(conn) {
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
draw2d.BezierConnectionRouter.prototype._route = function(_5a9e, conn, _5aa0,
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
		_5a9e.push(new draw2d.Point(toPt.x, toPt.y));
		return;
	}
	if (_5aa1 == LEFT) {
		if ((xDiff > 0) && ((yDiff * yDiff) < TOL) && (toDir == RIGHT)) {
			point = toPt;
			dir = toDir;
		} else {
			if (xDiff < 0) {
				point = new draw2d.Point(_5aa0.x - _5aa6, _5aa0.y);
			} else {
				if (((yDiff > 0) && (toDir == DOWN))
						|| ((yDiff < 0) && (toDir == UP))) {
					point = new draw2d.Point(toPt.x, _5aa0.y);
				} else {
					if (_5aa1 == toDir) {
						var pos = Math.min(_5aa0.x, toPt.x) - _5aa6;
						point = new draw2d.Point(pos, _5aa0.y);
					} else {
						point = new draw2d.Point(_5aa0.x - (xDiff / 2), _5aa0.y);
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
					point = new draw2d.Point(_5aa0.x + _5aa6, _5aa0.y);
				} else {
					if (((yDiff > 0) && (toDir == DOWN))
							|| ((yDiff < 0) && (toDir == UP))) {
						point = new draw2d.Point(toPt.x, _5aa0.y);
					} else {
						if (_5aa1 == toDir) {
							var pos = Math.max(_5aa0.x, toPt.x) + _5aa6;
							point = new draw2d.Point(pos, _5aa0.y);
						} else {
							point = new draw2d.Point(_5aa0.x - (xDiff / 2),
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
						point = new draw2d.Point(_5aa0.x, _5aa0.y + _5aa6);
					} else {
						if (((xDiff > 0) && (toDir == RIGHT))
								|| ((xDiff < 0) && (toDir == LEFT))) {
							point = new draw2d.Point(_5aa0.x, toPt.y);
						} else {
							if (_5aa1 == toDir) {
								var pos = Math.max(_5aa0.y, toPt.y) + _5aa6;
								point = new draw2d.Point(_5aa0.x, pos);
							} else {
								point = new draw2d.Point(_5aa0.x, _5aa0.y
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
							point = new draw2d.Point(_5aa0.x, _5aa0.y - _5aa6);
						} else {
							if (((xDiff > 0) && (toDir == RIGHT))
									|| ((xDiff < 0) && (toDir == LEFT))) {
								point = new draw2d.Point(_5aa0.x, toPt.y);
							} else {
								if (_5aa1 == toDir) {
									var pos = Math.min(_5aa0.y, toPt.y) - _5aa6;
									point = new draw2d.Point(_5aa0.x, pos);
								} else {
									point = new draw2d.Point(_5aa0.x, _5aa0.y
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
draw2d.FanConnectionRouter = function() {
};
draw2d.FanConnectionRouter.prototype = new draw2d.NullConnectionRouter;
draw2d.FanConnectionRouter.prototype.type = "draw2d.FanConnectionRouter";
draw2d.FanConnectionRouter.prototype.route = function(conn) {
	var _5bb3 = conn.getStartPoint();
	var toPt = conn.getEndPoint();
	var lines = conn.getSource().getConnections();
	var _5bb6 = new draw2d.ArrayList();
	var index = 0;
	for (var i = 0; i < lines.getSize(); i++) {
		var _5bb9 = lines.get(i);
		if (_5bb9.getTarget() == conn.getTarget()
				|| _5bb9.getSource() == conn.getTarget()) {
			_5bb6.add(_5bb9);
			if (conn == _5bb9) {
				index = _5bb6.getSize();
			}
		}
	}
	if (_5bb6.getSize() > 1) {
		this.routeCollision(conn, index);
	} else {
		draw2d.NullConnectionRouter.prototype.route.call(this, conn);
	}
};
draw2d.FanConnectionRouter.prototype.routeNormal = function(conn) {
	conn.addPoint(conn.getStartPoint());
	conn.addPoint(conn.getEndPoint());
};
draw2d.FanConnectionRouter.prototype.routeCollision = function(conn, index) {
	var start = conn.getStartPoint();
	var end = conn.getEndPoint();
	conn.addPoint(start);
	var _5bbf = 10;
	var _5bc0 = new draw2d.Point((end.x + start.x) / 2, (end.y + start.y) / 2);
	var _5bc1 = end.getPosition(start);
	var ray;
	if (_5bc1 == draw2d.PositionConstants.SOUTH
			|| _5bc1 == draw2d.PositionConstants.EAST) {
		ray = new draw2d.Point(end.x - start.x, end.y - start.y);
	} else {
		ray = new draw2d.Point(start.x - end.x, start.y - end.y);
	}
	var _5bc3 = Math.sqrt(ray.x * ray.x + ray.y * ray.y);
	var _5bc4 = _5bbf * ray.x / _5bc3;
	var _5bc5 = _5bbf * ray.y / _5bc3;
	var _5bc6;
	if (index % 2 == 0) {
		_5bc6 = new draw2d.Point(_5bc0.x + (index / 2) * (-1 * _5bc5), _5bc0.y
						+ (index / 2) * _5bc4);
	} else {
		_5bc6 = new draw2d.Point(_5bc0.x + (index / 2) * _5bc5, _5bc0.y
						+ (index / 2) * (-1 * _5bc4));
	}
	conn.addPoint(_5bc6);
	conn.addPoint(end);
};
draw2d.Graphics = function(_4b58, _4b59, _4b5a) {
	this.jsGraphics = _4b58;
	this.xt = _4b5a.x;
	this.yt = _4b5a.y;
	this.radian = _4b59 * Math.PI / 180;
	this.sinRadian = Math.sin(this.radian);
	this.cosRadian = Math.cos(this.radian);
};
draw2d.Graphics.prototype.setStroke = function(x) {
	this.jsGraphics.setStroke(x);
};
draw2d.Graphics.prototype.drawLine = function(x1, y1, x2, y2) {
	var _x1 = this.xt + x1 * this.cosRadian - y1 * this.sinRadian;
	var _y1 = this.yt + x1 * this.sinRadian + y1 * this.cosRadian;
	var _x2 = this.xt + x2 * this.cosRadian - y2 * this.sinRadian;
	var _y2 = this.yt + x2 * this.sinRadian + y2 * this.cosRadian;
	this.jsGraphics.drawLine(_x1, _y1, _x2, _y2);
};
draw2d.Graphics.prototype.fillRect = function(x, y, w, h) {
	var x1 = this.xt + x * this.cosRadian - y * this.sinRadian;
	var y1 = this.yt + x * this.sinRadian + y * this.cosRadian;
	var x2 = this.xt + (x + w) * this.cosRadian - y * this.sinRadian;
	var y2 = this.yt + (x + w) * this.sinRadian + y * this.cosRadian;
	var x3 = this.xt + (x + w) * this.cosRadian - (y + h) * this.sinRadian;
	var y3 = this.yt + (x + w) * this.sinRadian + (y + h) * this.cosRadian;
	var x4 = this.xt + x * this.cosRadian - (y + h) * this.sinRadian;
	var y4 = this.yt + x * this.sinRadian + (y + h) * this.cosRadian;
	this.jsGraphics.fillPolygon([x1, x2, x3, x4], [y1, y2, y3, y4]);
};
draw2d.Graphics.prototype.fillPolygon = function(_4b70, _4b71) {
	var rotX = new Array();
	var rotY = new Array();
	for (var i = 0; i < _4b70.length; i++) {
		rotX[i] = this.xt + _4b70[i] * this.cosRadian - _4b71[i]
				* this.sinRadian;
		rotY[i] = this.yt + _4b70[i] * this.sinRadian + _4b71[i]
				* this.cosRadian;
	}
	this.jsGraphics.fillPolygon(rotX, rotY);
};
draw2d.Graphics.prototype.setColor = function(color) {
	this.jsGraphics.setColor(color.getHTMLStyle());
};
draw2d.Graphics.prototype.drawPolygon = function(_4b76, _4b77) {
	var rotX = new Array();
	var rotY = new Array();
	for (var i = 0; i < _4b76.length; i++) {
		rotX[i] = this.xt + _4b76[i] * this.cosRadian - _4b77[i]
				* this.sinRadian;
		rotY[i] = this.yt + _4b76[i] * this.sinRadian + _4b77[i]
				* this.cosRadian;
	}
	this.jsGraphics.drawPolygon(rotX, rotY);
};
draw2d.Connection = function() {
	draw2d.Line.call(this);
	this.sourcePort = null;
	this.targetPort = null;
	this.sourceDecorator = null;
	this.targetDecorator = null;
	this.sourceAnchor = new draw2d.ConnectionAnchor();
	this.targetAnchor = new draw2d.ConnectionAnchor();
	this.router = draw2d.Connection.defaultRouter;
	this.lineSegments = new draw2d.ArrayList();
	this.children = new draw2d.ArrayList();
	this.setColor(new draw2d.Color(0, 0, 115));
	this.setLineWidth(1);
};
draw2d.Connection.prototype = new draw2d.Line;
draw2d.Connection.prototype.type = "draw2d.Connection";
draw2d.Connection.defaultRouter = new draw2d.ManhattanConnectionRouter();
draw2d.Connection.setDefaultRouter = function(_5618) {
	draw2d.Connection.defaultRouter = _5618;
};
draw2d.Connection.prototype.disconnect = function() {
	if (this.sourcePort != null) {
		this.sourcePort.detachMoveListener(this);
		this.fireSourcePortRouteEvent();
	}
	if (this.targetPort != null) {
		this.targetPort.detachMoveListener(this);
		this.fireTargetPortRouteEvent();
	}
};
draw2d.Connection.prototype.reconnect = function() {
	if (this.sourcePort != null) {
		this.sourcePort.attachMoveListener(this);
		this.fireSourcePortRouteEvent();
	}
	if (this.targetPort != null) {
		this.targetPort.attachMoveListener(this);
		this.fireTargetPortRouteEvent();
	}
};
draw2d.Connection.prototype.isResizeable = function() {
	return true;
};
draw2d.Connection.prototype.addFigure = function(_5619, _561a) {
	var entry = new Object();
	entry.figure = _5619;
	entry.locator = _561a;
	this.children.add(entry);
	if (this.graphics != null) {
		this.paint();
	}
	var oThis = this;
	var _561d = function() {
		var _561e = arguments[0] || window.event;
		_561e.returnValue = false;
		oThis.getWorkflow().setCurrentSelection(oThis);
		oThis.getWorkflow().showLineResizeHandles(oThis);
	};
	if (_5619.getHTMLElement().addEventListener) {
		_5619.getHTMLElement().addEventListener("mousedown", _561d, false);
	} else {
		if (this.html.attachEvent) {
			_5619.getHTMLElement().attachEvent("onmouseup", mouseUp);
		}
	}
};
draw2d.Connection.prototype.setSourceDecorator = function(_561f) {
	this.sourceDecorator = _561f;
	if (this.graphics != null) {
		this.paint();
	}
};
draw2d.Connection.prototype.setTargetDecorator = function(_5620) {
	this.targetDecorator = _5620;
	if (this.graphics != null) {
		this.paint();
	}
};
draw2d.Connection.prototype.setSourceAnchor = function(_5621) {
	this.sourceAnchor = _5621;
	this.sourceAnchor.setOwner(this.sourcePort);
	if (this.graphics != null) {
		this.paint();
	}
};
draw2d.Connection.prototype.setTargetAnchor = function(_5622) {
	this.targetAnchor = _5622;
	this.targetAnchor.setOwner(this.targetPort);
	if (this.graphics != null) {
		this.paint();
	}
};
draw2d.Connection.prototype.setRouter = function(_5623) {
	if (_5623 != null) {
		this.router = _5623;
	} else {
		this.router = new draw2d.NullConnectionRouter();
	}
	if (this.graphics != null) {
		this.paint();
	}
};
draw2d.Connection.prototype.getRouter = function() {
	return this.router;
};
draw2d.Connection.prototype.setWorkflow = function(_5624) {
	draw2d.Line.prototype.setWorkflow.call(this, _5624);
	for (var i = 0; i < this.children.getSize(); i++) {
		this.children.get(i).isAppended = false;
	}
};
draw2d.Connection.prototype.paint = function() {
	for (var i = 0; i < this.children.getSize(); i++) {
		var entry = this.children.get(i);
		if (entry.isAppended == true) {
			this.html.removeChild(entry.figure.getHTMLElement());
		}
		entry.isAppended = false;
	}
	if (this.graphics == null) {
		this.graphics = new jsGraphics(this.id);
	} else {
		this.graphics.clear();
	}
	this.graphics.setStroke(this.stroke);
	this.graphics.setColor(this.lineColor.getHTMLStyle());
	this.startStroke();
	this.router.route(this);
	if (this.getSource().getParent().isMoving == false
			&& this.getTarget().getParent().isMoving == false) {
		if (this.targetDecorator != null) {
			this.targetDecorator.paint(new draw2d.Graphics(this.graphics, this
							.getEndAngle(), this.getEndPoint()));
		}
		if (this.sourceDecorator != null) {
			this.sourceDecorator.paint(new draw2d.Graphics(this.graphics, this
							.getStartAngle(), this.getStartPoint()));
		}
	}
	this.finishStroke();
	for (var i = 0; i < this.children.getSize(); i++) {
		var entry = this.children.get(i);
		this.html.appendChild(entry.figure.getHTMLElement());
		entry.isAppended = true;
		entry.locator.relocate(entry.figure);
	}
};
draw2d.Connection.prototype.getStartPoint = function() {
	if (this.isMoving == false) {
		return this.sourceAnchor.getLocation(this.targetAnchor
				.getReferencePoint());
	} else {
		return draw2d.Line.prototype.getStartPoint.call(this);
	}
};
draw2d.Connection.prototype.getEndPoint = function() {
	if (this.isMoving == false) {
		return this.targetAnchor.getLocation(this.sourceAnchor
				.getReferencePoint());
	} else {
		return draw2d.Line.prototype.getEndPoint.call(this);
	}
};
draw2d.Connection.prototype.startStroke = function() {
	this.oldPoint = null;
	this.lineSegments = new draw2d.ArrayList();
};
draw2d.Connection.prototype.finishStroke = function() {
	this.graphics.paint();
	this.oldPoint = null;
};
draw2d.Connection.prototype.getPoints = function() {
	var _5628 = new draw2d.ArrayList();
	var line;
	for (var i = 0; i < this.lineSegments.getSize(); i++) {
		line = this.lineSegments.get(i);
		_5628.add(line.start);
	}
	_5628.add(line.end);
	return _5628;
};
draw2d.Connection.prototype.addPoint = function(p) {
	p = new draw2d.Point(parseInt(p.x), parseInt(p.y));
	if (this.oldPoint != null) {
		this.graphics.drawLine(this.oldPoint.x, this.oldPoint.y, p.x, p.y);
		var line = new Object();
		line.start = this.oldPoint;
		line.end = p;
		this.lineSegments.add(line);
	}
	this.oldPoint = new Object();
	this.oldPoint.x = p.x;
	this.oldPoint.y = p.y;
};
draw2d.Connection.prototype.setSource = function(port) {
	if (this.sourcePort != null) {
		this.sourcePort.detachMoveListener(this);
	}
	this.sourcePort = port;
	if (this.sourcePort == null) {
		return;
	}
	this.sourceAnchor.setOwner(this.sourcePort);
	this.fireSourcePortRouteEvent();
	this.sourcePort.attachMoveListener(this);
	this.setStartPoint(port.getAbsoluteX(), port.getAbsoluteY());
};
draw2d.Connection.prototype.getSource = function() {
	return this.sourcePort;
};
draw2d.Connection.prototype.setTarget = function(port) {
	if (this.targetPort != null) {
		this.targetPort.detachMoveListener(this);
	}
	this.targetPort = port;
	if (this.targetPort == null) {
		return;
	}
	this.targetAnchor.setOwner(this.targetPort);
	this.fireTargetPortRouteEvent();
	this.targetPort.attachMoveListener(this);
	this.setEndPoint(port.getAbsoluteX(), port.getAbsoluteY());
};
draw2d.Connection.prototype.getTarget = function() {
	return this.targetPort;
};
draw2d.Connection.prototype.onOtherFigureMoved = function(_562f) {
	if (_562f == this.sourcePort) {
		this.setStartPoint(this.sourcePort.getAbsoluteX(), this.sourcePort
						.getAbsoluteY());
	} else {
		this.setEndPoint(this.targetPort.getAbsoluteX(), this.targetPort
						.getAbsoluteY());
	}
};
draw2d.Connection.prototype.containsPoint = function(px, py) {
	for (var i = 0; i < this.lineSegments.getSize(); i++) {
		var line = this.lineSegments.get(i);
		if (draw2d.Line.hit(this.corona, line.start.x, line.start.y,
				line.end.x, line.end.y, px, py)) {
			return true;
		}
	}
	return false;
};
draw2d.Connection.prototype.getStartAngle = function() {
	var p1 = this.lineSegments.get(0).start;
	var p2 = this.lineSegments.get(0).end;
	if (this.router instanceof draw2d.BezierConnectionRouter) {
		p2 = this.lineSegments.get(5).end;
	}
	var _5636 = Math.sqrt((p1.x - p2.x) * (p1.x - p2.x) + (p1.y - p2.y)
			* (p1.y - p2.y));
	var angle = -(180 / Math.PI) * Math.asin((p1.y - p2.y) / _5636);
	if (angle < 0) {
		if (p2.x < p1.x) {
			angle = Math.abs(angle) + 180;
		} else {
			angle = 360 - Math.abs(angle);
		}
	} else {
		if (p2.x < p1.x) {
			angle = 180 - angle;
		}
	}
	return angle;
};
draw2d.Connection.prototype.getEndAngle = function() {
	var p1 = this.lineSegments.get(this.lineSegments.getSize() - 1).end;
	var p2 = this.lineSegments.get(this.lineSegments.getSize() - 1).start;
	if (this.router instanceof draw2d.BezierConnectionRouter) {
		p2 = this.lineSegments.get(this.lineSegments.getSize() - 5).end;
	}
	var _563a = Math.sqrt((p1.x - p2.x) * (p1.x - p2.x) + (p1.y - p2.y)
			* (p1.y - p2.y));
	var angle = -(180 / Math.PI) * Math.asin((p1.y - p2.y) / _563a);
	if (angle < 0) {
		if (p2.x < p1.x) {
			angle = Math.abs(angle) + 180;
		} else {
			angle = 360 - Math.abs(angle);
		}
	} else {
		if (p2.x < p1.x) {
			angle = 180 - angle;
		}
	}
	return angle;
};
draw2d.Connection.prototype.fireSourcePortRouteEvent = function() {
	var _563c = this.sourcePort.getConnections();
	for (var i = 0; i < _563c.getSize(); i++) {
		_563c.get(i).paint();
	}
};
draw2d.Connection.prototype.fireTargetPortRouteEvent = function() {
	var _563e = this.targetPort.getConnections();
	for (var i = 0; i < _563e.getSize(); i++) {
		_563e.get(i).paint();
	}
};
draw2d.Connection.prototype.createCommand = function(_5640) {
	if (_5640.getPolicy() == draw2d.EditPolicy.MOVE) {
		return new draw2d.CommandReconnect(this);
	}
	if (_5640.getPolicy() == draw2d.EditPolicy.DELETE) {
		if (this.isDeleteable() == true) {
			return new draw2d.CommandDelete(this);
		}
		return null;
	}
	return null;
};
draw2d.ConnectionAnchor = function(owner) {
	this.owner = owner;
};
draw2d.ConnectionAnchor.prototype.type = "draw2d.ConnectionAnchor";
draw2d.ConnectionAnchor.prototype.getLocation = function(_5f25) {
	return this.getReferencePoint();
};
draw2d.ConnectionAnchor.prototype.getOwner = function() {
	return this.owner;
};
draw2d.ConnectionAnchor.prototype.setOwner = function(owner) {
	this.owner = owner;
};
draw2d.ConnectionAnchor.prototype.getBox = function() {
	return this.getOwner().getAbsoluteBounds();
};
draw2d.ConnectionAnchor.prototype.getReferencePoint = function() {
	if (this.getOwner() == null) {
		return null;
	} else {
		return this.getOwner().getAbsolutePosition();
	}
};
draw2d.ChopboxConnectionAnchor = function(owner) {
	draw2d.ConnectionAnchor.call(this, owner);
};
draw2d.ChopboxConnectionAnchor.prototype = new draw2d.ConnectionAnchor;
draw2d.ChopboxConnectionAnchor.prototype.type = "draw2d.ChopboxConnectionAnchor";
draw2d.ChopboxConnectionAnchor.prototype.getLocation = function(_5bcc) {
	var r = new draw2d.Dimension();
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
	return new draw2d.Point(Math.round(_5bce), Math.round(_5bcf));
};
draw2d.ChopboxConnectionAnchor.prototype.getBox = function() {
	return this.getOwner().getParent().getBounds();
};
draw2d.ChopboxConnectionAnchor.prototype.getReferencePoint = function() {
	return this.getBox().getCenter();
};
draw2d.ConnectionDecorator = function() {
	this.color = new draw2d.Color(0, 0, 0);
	this.backgroundColor = new draw2d.Color(250, 250, 250);
};
draw2d.ConnectionDecorator.prototype.type = "draw2d.ConnectionDecorator";
draw2d.ConnectionDecorator.prototype.paint = function(g) {
};
draw2d.ConnectionDecorator.prototype.setColor = function(c) {
	this.color = c;
};
draw2d.ConnectionDecorator.prototype.setBackgroundColor = function(c) {
	this.backgroundColor = c;
};
draw2d.ArrowConnectionDecorator = function() {
};
draw2d.ArrowConnectionDecorator.prototype = new draw2d.ConnectionDecorator;
draw2d.ArrowConnectionDecorator.prototype.type = "draw2d.ArrowConnectionDecorator";
draw2d.ArrowConnectionDecorator.prototype.paint = function(g) {
	if (this.backgroundColor != null) {
		g.setColor(this.backgroundColor);
		g.fillPolygon([3, 20, 20, 3], [0, 5, -5, 0]);
	}
	g.setColor(this.color);
	g.setStroke(1);
	g.drawPolygon([3, 20, 20, 3], [0, 5, -5, 0]);
};
draw2d.CompartmentFigure = function() {
	draw2d.Node.call(this);
	this.children = new draw2d.ArrayList();
	this.setBorder(new draw2d.LineBorder(1));
	this.dropable = new draw2d.DropTarget(this.html);
	this.dropable.node = this;
	this.dropable.addEventListener("figureenter", function(_48f6) {
				_48f6.target.node.onFigureEnter(_48f6.relatedTarget.node);
			});
	this.dropable.addEventListener("figureleave", function(_48f7) {
				_48f7.target.node.onFigureLeave(_48f7.relatedTarget.node);
			});
	this.dropable.addEventListener("figuredrop", function(_48f8) {
				_48f8.target.node.onFigureDrop(_48f8.relatedTarget.node);
			});
};
draw2d.CompartmentFigure.prototype = new draw2d.Node;
draw2d.CompartmentFigure.prototype.type = "draw2d.CompartmentFigure";
draw2d.CompartmentFigure.prototype.onFigureEnter = function(_48f9) {
};
draw2d.CompartmentFigure.prototype.onFigureLeave = function(_48fa) {
};
draw2d.CompartmentFigure.prototype.onFigureDrop = function(_48fb) {
};
draw2d.CompartmentFigure.prototype.getChildren = function() {
	return this.children;
};
draw2d.CompartmentFigure.prototype.addChild = function(_48fc) {
	_48fc.setZOrder(this.getZOrder() + 1);
	_48fc.setParent(this);
	this.children.add(_48fc);
};
draw2d.CompartmentFigure.prototype.removeChild = function(_48fd) {
	_48fd.setParent(null);
	this.children.remove(_48fd);
};
draw2d.CompartmentFigure.prototype.setZOrder = function(index) {
	draw2d.Node.prototype.setZOrder.call(this, index);
	for (var i = 0; i < this.children.getSize(); i++) {
		this.children.get(i).setZOrder(index + 1);
	}
};
draw2d.CompartmentFigure.prototype.setPosition = function(xPos, yPos) {
	var oldX = this.getX();
	var oldY = this.getY();
	draw2d.Node.prototype.setPosition.call(this, xPos, yPos);
	for (var i = 0; i < this.children.getSize(); i++) {
		var child = this.children.get(i);
		child.setPosition(child.getX() + this.getX() - oldX, child.getY()
						+ this.getY() - oldY);
	}
};
draw2d.CompartmentFigure.prototype.onDrag = function() {
	var oldX = this.getX();
	var oldY = this.getY();
	draw2d.Node.prototype.onDrag.call(this);
	for (var i = 0; i < this.children.getSize(); i++) {
		var child = this.children.get(i);
		child.setPosition(child.getX() + this.getX() - oldX, child.getY()
						+ this.getY() - oldY);
	}
};
draw2d.CanvasDocument = function(_4f1f) {
	this.canvas = _4f1f;
};
draw2d.CanvasDocument.prototype.type = "draw2d.CanvasDocument";
draw2d.CanvasDocument.prototype.getFigures = function() {
	var _4f20 = new draw2d.ArrayList();
	var _4f21 = this.canvas.figures;
	var _4f22 = this.canvas.dialogs;
	for (var i = 0; i < _4f21.getSize(); i++) {
		var _4f24 = _4f21.get(i);
		if (_4f22.indexOf(_4f24) == -1 && _4f24.getParent() == null
				&& !(_4f24 instanceof draw2d.WindowFigure)) {
			_4f20.add(_4f24);
		}
	}
	return _4f20;
};
draw2d.CanvasDocument.prototype.getFigure = function(id) {
	return this.canvas.getFigure(id);
};
draw2d.CanvasDocument.prototype.getLines = function() {
	return this.canvas.getLines();
};
draw2d.CanvasDocument.prototype.getLine = function(id) {
	return this.canvas.getLine(id);
};
draw2d.Annotation = function(msg) {
	this.msg = msg;
	this.color = new draw2d.Color(0, 0, 0);
	this.bgColor = new draw2d.Color(241, 241, 121);
	this.fontSize = 10;
	this.textNode = null;
	draw2d.Figure.call(this);
};
draw2d.Annotation.prototype = new draw2d.Figure;
draw2d.Annotation.prototype.type = "draw2d.Annotation";
draw2d.Annotation.prototype.createHTMLElement = function() {
	var item = draw2d.Figure.prototype.createHTMLElement.call(this);
	item.style.color = this.color.getHTMLStyle();
	item.style.backgroundColor = this.bgColor.getHTMLStyle();
	item.style.fontSize = this.fontSize + "pt";
	item.style.width = "auto";
	item.style.height = "auto";
	item.style.margin = "0px";
	item.style.padding = "0px";
	item.onselectstart = function() {
		return false;
	};
	item.unselectable = "on";
	item.style.cursor = "default";
	this.textNode = document.createTextNode(this.msg);
	item.appendChild(this.textNode);
	this.disableTextSelection(item);
	return item;
};
draw2d.Annotation.prototype.onDoubleClick = function() {
	var _5b44 = new draw2d.AnnotationDialog(this);
	this.workflow.showDialog(_5b44);
};
draw2d.Annotation.prototype.setBackgroundColor = function(color) {
	this.bgColor = color;
	if (this.bgColor != null) {
		this.html.style.backgroundColor = this.bgColor.getHTMLStyle();
	} else {
		this.html.style.backgroundColor = "transparent";
	}
};
draw2d.Annotation.prototype.getBackgroundColor = function() {
	return this.bgColor;
};
draw2d.Annotation.prototype.setFontSize = function(size) {
	this.fontSize = size;
	this.html.style.fontSize = this.fontSize + "pt";
};
draw2d.Annotation.prototype.getText = function() {
	return this.msg;
};
draw2d.Annotation.prototype.setText = function(text) {
	this.msg = text;
	this.html.removeChild(this.textNode);
	this.textNode = document.createTextNode(this.msg);
	this.html.appendChild(this.textNode);
};
draw2d.Annotation.prototype.setStyledText = function(text) {
	this.msg = text;
	this.html.removeChild(this.textNode);
	this.textNode = document.createElement("div");
	this.textNode.innerHTML = text;
	this.html.appendChild(this.textNode);
};
draw2d.ResizeHandle = function(_4e8d, type) {
	draw2d.Rectangle.call(this, 5, 5);
	this.type = type;
	var _4e8f = this.getWidth();
	var _4e90 = _4e8f / 2;
	switch (this.type) {
		case 1 :
			this.setSnapToGridAnchor(new draw2d.Point(_4e8f, _4e8f));
			break;
		case 2 :
			this.setSnapToGridAnchor(new draw2d.Point(_4e90, _4e8f));
			break;
		case 3 :
			this.setSnapToGridAnchor(new draw2d.Point(0, _4e8f));
			break;
		case 4 :
			this.setSnapToGridAnchor(new draw2d.Point(0, _4e90));
			break;
		case 5 :
			this.setSnapToGridAnchor(new draw2d.Point(0, 0));
			break;
		case 6 :
			this.setSnapToGridAnchor(new draw2d.Point(_4e90, 0));
			break;
		case 7 :
			this.setSnapToGridAnchor(new draw2d.Point(_4e8f, 0));
			break;
		case 8 :
			this.setSnapToGridAnchor(new draw2d.Point(_4e8f, _4e90));
		case 9 :
			this.setSnapToGridAnchor(new draw2d.Point(_4e90, _4e90));
			break;
	}
	this.setBackgroundColor(new draw2d.Color(0, 255, 0));
	this.setWorkflow(_4e8d);
	this.setZOrder(10000);
};
draw2d.ResizeHandle.prototype = new draw2d.Rectangle;
draw2d.ResizeHandle.prototype.type = "draw2d.ResizeHandle";
draw2d.ResizeHandle.prototype.getSnapToDirection = function() {
	switch (this.type) {
		case 1 :
			return draw2d.SnapToHelper.NORTH_WEST;
		case 2 :
			return draw2d.SnapToHelper.NORTH;
		case 3 :
			return draw2d.SnapToHelper.NORTH_EAST;
		case 4 :
			return draw2d.SnapToHelper.EAST;
		case 5 :
			return draw2d.SnapToHelper.SOUTH_EAST;
		case 6 :
			return draw2d.SnapToHelper.SOUTH;
		case 7 :
			return draw2d.SnapToHelper.SOUTH_WEST;
		case 8 :
			return draw2d.SnapToHelper.WEST;
		case 9 :
			return draw2d.SnapToHelper.CENTER;
	}
};
draw2d.ResizeHandle.prototype.onDragend = function() {
	var _4e91 = this.workflow.currentSelection;
	if (this.commandMove != null) {
		this.commandMove.setPosition(_4e91.getX(), _4e91.getY());
		this.workflow.getCommandStack().execute(this.commandMove);
		this.commandMove = null;
	}
	if (this.commandResize != null) {
		this.commandResize.setDimension(_4e91.getWidth(), _4e91.getHeight());
		this.workflow.getCommandStack().execute(this.commandResize);
		this.commandResize = null;
	}
	this.workflow.hideSnapToHelperLines();
};
draw2d.ResizeHandle.prototype.setPosition = function(xPos, yPos) {
	this.x = xPos;
	this.y = yPos;
	this.html.style.left = this.x + "px";
	this.html.style.top = this.y + "px";
};
draw2d.ResizeHandle.prototype.onDragstart = function(x, y) {
	if (!this.canDrag) {
		return false;
	}
	var _4e96 = this.workflow.currentSelection;
	this.commandMove = _4e96
			.createCommand(new draw2d.EditPolicy(draw2d.EditPolicy.MOVE));
	this.commandResize = _4e96
			.createCommand(new draw2d.EditPolicy(draw2d.EditPolicy.RESIZE));
	return true;
};
draw2d.ResizeHandle.prototype.onDrag = function() {
	var oldX = this.getX();
	var oldY = this.getY();
	draw2d.Rectangle.prototype.onDrag.call(this);
	var diffX = oldX - this.getX();
	var diffY = oldY - this.getY();
	var _4e9b = this.workflow.currentSelection.getX();
	var _4e9c = this.workflow.currentSelection.getY();
	var _4e9d = this.workflow.currentSelection.getWidth();
	var _4e9e = this.workflow.currentSelection.getHeight();
	switch (this.type) {
		case 1 :
			this.workflow.currentSelection.setPosition(_4e9b - diffX, _4e9c
							- diffY);
			this.workflow.currentSelection.setDimension(_4e9d + diffX, _4e9e
							+ diffY);
			break;
		case 2 :
			this.workflow.currentSelection.setPosition(_4e9b, _4e9c - diffY);
			this.workflow.currentSelection.setDimension(_4e9d, _4e9e + diffY);
			break;
		case 3 :
			this.workflow.currentSelection.setPosition(_4e9b, _4e9c - diffY);
			this.workflow.currentSelection.setDimension(_4e9d - diffX, _4e9e
							+ diffY);
			break;
		case 4 :
			this.workflow.currentSelection.setPosition(_4e9b, _4e9c);
			this.workflow.currentSelection.setDimension(_4e9d - diffX, _4e9e);
			break;
		case 5 :
			this.workflow.currentSelection.setPosition(_4e9b, _4e9c);
			this.workflow.currentSelection.setDimension(_4e9d - diffX, _4e9e
							- diffY);
			break;
		case 6 :
			this.workflow.currentSelection.setPosition(_4e9b, _4e9c);
			this.workflow.currentSelection.setDimension(_4e9d, _4e9e - diffY);
			break;
		case 7 :
			this.workflow.currentSelection.setPosition(_4e9b - diffX, _4e9c);
			this.workflow.currentSelection.setDimension(_4e9d + diffX, _4e9e
							- diffY);
			break;
		case 8 :
			this.workflow.currentSelection.setPosition(_4e9b - diffX, _4e9c);
			this.workflow.currentSelection.setDimension(_4e9d + diffX, _4e9e);
			break;
	}
	this.workflow.moveResizeHandles(this.workflow.getCurrentSelection());
};
draw2d.ResizeHandle.prototype.setCanDrag = function(flag) {
	draw2d.Rectangle.prototype.setCanDrag.call(this, flag);
	if (!flag) {
		this.html.style.cursor = "";
		return;
	}
	switch (this.type) {
		case 1 :
			this.html.style.cursor = "nw-resize";
			break;
		case 2 :
			this.html.style.cursor = "s-resize";
			break;
		case 3 :
			this.html.style.cursor = "ne-resize";
			break;
		case 4 :
			this.html.style.cursor = "w-resize";
			break;
		case 5 :
			this.html.style.cursor = "se-resize";
			break;
		case 6 :
			this.html.style.cursor = "n-resize";
			break;
		case 7 :
			this.html.style.cursor = "sw-resize";
			break;
		case 8 :
			this.html.style.cursor = "e-resize";
			break;
		case 9 :
			this.html.style.cursor = "resize";
			break;
	}
};
draw2d.ResizeHandle.prototype.onKeyDown = function(_4ea0, ctrl) {
	this.workflow.onKeyDown(_4ea0, ctrl);
};
draw2d.ResizeHandle.prototype.fireMoveEvent = function() {
};
draw2d.LineStartResizeHandle = function(_574e) {
	draw2d.ResizeHandle.call(this, _574e, 9);
	this.setDimension(10, 10);
	this.setBackgroundColor(new draw2d.Color(100, 255, 0));
	this.setZOrder(10000);
};
draw2d.LineStartResizeHandle.prototype = new draw2d.ResizeHandle;
draw2d.LineStartResizeHandle.prototype.type = "draw2d.LineStartResizeHandle";
draw2d.LineStartResizeHandle.prototype.onDragend = function() {
	if (this.workflow.currentSelection instanceof draw2d.Connection) {
		if (this.command != null) {
			this.command.cancel();
		}
	} else {
		if (this.command != null) {
			this.getWorkflow().getCommandStack().execute(this.command);
		}
	}
	this.command = null;
};
draw2d.LineStartResizeHandle.prototype.onDragstart = function(x, y) {
	if (!this.canDrag) {
		return false;
	}
	this.command = this.workflow.currentSelection
			.createCommand(new draw2d.EditPolicy(draw2d.EditPolicy.MOVE));
	return true;
};
draw2d.LineStartResizeHandle.prototype.onDrag = function() {
	var oldX = this.getX();
	var oldY = this.getY();
	draw2d.Rectangle.prototype.onDrag.call(this);
	var diffX = oldX - this.getX();
	var diffY = oldY - this.getY();
	var _5755 = this.workflow.currentSelection.getStartPoint();
	var line = this.workflow.currentSelection;
	line.setStartPoint(_5755.x - diffX, _5755.y - diffY);
	line.isMoving = true;
};
draw2d.LineStartResizeHandle.prototype.onDrop = function(_5757) {
	var line = this.workflow.currentSelection;
	line.isMoving = false;
	if (line instanceof draw2d.Connection) {
		this.command.setNewPorts(_5757, line.getTarget());
		this.getWorkflow().getCommandStack().execute(this.command);
	}
	this.command = null;
};
draw2d.LineEndResizeHandle = function(_517c) {
	draw2d.ResizeHandle.call(this, _517c, 9);
	this.setDimension(10, 10);
	this.setBackgroundColor(new draw2d.Color(0, 255, 0));
	this.setZOrder(10000);
};
draw2d.LineEndResizeHandle.prototype = new draw2d.ResizeHandle;
draw2d.LineEndResizeHandle.prototype.type = "draw2d.LineEndResizeHandle";
draw2d.LineEndResizeHandle.prototype.onDragend = function() {
	if (this.workflow.currentSelection instanceof draw2d.Connection) {
		if (this.command != null) {
			this.command.cancel();
		}
	} else {
		if (this.command != null) {
			this.workflow.getCommandStack().execute(this.command);
		}
	}
	this.command = null;
};
draw2d.LineEndResizeHandle.prototype.onDragstart = function(x, y) {
	if (!this.canDrag) {
		return false;
	}
	this.command = this.workflow.currentSelection
			.createCommand(new draw2d.EditPolicy(draw2d.EditPolicy.MOVE));
	return true;
};
draw2d.LineEndResizeHandle.prototype.onDrag = function() {
	var oldX = this.getX();
	var oldY = this.getY();
	draw2d.Rectangle.prototype.onDrag.call(this);
	var diffX = oldX - this.getX();
	var diffY = oldY - this.getY();
	var _5183 = this.workflow.currentSelection.getEndPoint();
	var line = this.workflow.currentSelection;
	line.setEndPoint(_5183.x - diffX, _5183.y - diffY);
	line.isMoving = true;
};
draw2d.LineEndResizeHandle.prototype.onDrop = function(_5185) {
	var line = this.workflow.currentSelection;
	line.isMoving = false;
	if (line instanceof draw2d.Connection) {
		this.command.setNewPorts(line.getSource(), _5185);
		this.getWorkflow().getCommandStack().execute(this.command);
	}
	this.command = null;
};
draw2d.Canvas = function(_5a3c) {
	if (_5a3c) {
		this.construct(_5a3c);
	}
	this.enableSmoothFigureHandling = false;
	this.canvasLines = new draw2d.ArrayList();
};
draw2d.Canvas.prototype.type = "draw2d.Canvas";
draw2d.Canvas.prototype.construct = function(_5a3d) {
	this.canvasId = _5a3d;
	this.html = document.getElementById(this.canvasId);
	this.scrollArea = document.body.parentNode;
};
draw2d.Canvas.prototype.setViewPort = function(divId) {
	this.scrollArea = document.getElementById(divId);
};
draw2d.Canvas.prototype.addFigure = function(_5a3f, xPos, yPos, _5a42) {
	if (this.enableSmoothFigureHandling == true) {
		if (_5a3f.timer <= 0) {
			_5a3f.setAlpha(0.001);
		}
		var _5a43 = _5a3f;
		var _5a44 = function() {
			if (_5a43.alpha < 1) {
				_5a43.setAlpha(Math.min(1, _5a43.alpha + 0.05));
			} else {
				window.clearInterval(_5a43.timer);
				_5a43.timer = -1;
			}
		};
		if (_5a43.timer > 0) {
			window.clearInterval(_5a43.timer);
		}
		_5a43.timer = window.setInterval(_5a44, 30);
	}
	_5a3f.setCanvas(this);
	if (xPos && yPos) {
		_5a3f.setPosition(xPos, yPos);
	}
	if (_5a3f instanceof draw2d.Line) {
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
draw2d.Canvas.prototype.removeFigure = function(_5a46) {
	if (this.enableSmoothFigureHandling == true) {
		var oThis = this;
		var _5a48 = _5a46;
		var _5a49 = function() {
			if (_5a48.alpha > 0) {
				_5a48.setAlpha(Math.max(0, _5a48.alpha - 0.05));
			} else {
				window.clearInterval(_5a48.timer);
				_5a48.timer = -1;
				oThis.html.removeChild(_5a48.html);
				_5a48.setCanvas(null);
			}
		};
		if (_5a48.timer > 0) {
			window.clearInterval(_5a48.timer);
		}
		_5a48.timer = window.setInterval(_5a49, 20);
	} else {
		this.html.removeChild(_5a46.html);
		_5a46.setCanvas(null);
	}
	if (_5a46 instanceof draw2d.Line) {
		this.canvasLines.remove(_5a46);
	}
};
draw2d.Canvas.prototype.getEnableSmoothFigureHandling = function() {
	return this.enableSmoothFigureHandling;
};
draw2d.Canvas.prototype.setEnableSmoothFigureHandling = function(flag) {
	this.enableSmoothFigureHandling = flag;
};
draw2d.Canvas.prototype.getWidth = function() {
	return parseInt(this.html.style.width);
};
draw2d.Canvas.prototype.getHeight = function() {
	return parseInt(this.html.style.height);
};
draw2d.Canvas.prototype.setBackgroundImage = function(_5a4b, _5a4c) {
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
draw2d.Canvas.prototype.getY = function() {
	return this.y;
};
draw2d.Canvas.prototype.getX = function() {
	return this.x;
};
draw2d.Canvas.prototype.getAbsoluteY = function() {
	var el = this.html;
	var ot = el.offsetTop;
	while ((el = el.offsetParent) != null) {
		ot += el.offsetTop;
	}
	return ot;
};
draw2d.Canvas.prototype.getAbsoluteX = function() {
	var el = this.html;
	var ol = el.offsetLeft;
	while ((el = el.offsetParent) != null) {
		ol += el.offsetLeft;
	}
	return ol;
};
draw2d.Canvas.prototype.getScrollLeft = function() {
	return this.scrollArea.scrollLeft;
};
draw2d.Canvas.prototype.getScrollTop = function() {
	return this.scrollArea.scrollTop;
};
draw2d.Workflow = function(id) {
	if (!id) {
		return;
	}
	this.gridWidthX = 10;
	this.gridWidthY = 10;
	this.snapToGridHelper = null;
	this.verticalSnapToHelperLine = null;
	this.horizontalSnapToHelperLine = null;
	this.figures = new draw2d.ArrayList();
	this.lines = new draw2d.ArrayList();
	this.commonPorts = new draw2d.ArrayList();
	this.dropTargets = new draw2d.ArrayList();
	this.compartments = new draw2d.ArrayList();
	this.selectionListeners = new draw2d.ArrayList();
	this.dialogs = new draw2d.ArrayList();
	this.toolPalette = null;
	this.dragging = false;
	this.tooltip = null;
	this.draggingLine = null;
	this.draggingLineCommand = null;
	this.commandStack = new draw2d.CommandStack();
	this.oldScrollPosLeft = 0;
	this.oldScrollPosTop = 0;
	this.currentSelection = null;
	this.currentMenu = null;
	this.connectionLine = new draw2d.Line();
	this.resizeHandleStart = new draw2d.LineStartResizeHandle(this);
	this.resizeHandleEnd = new draw2d.LineEndResizeHandle(this);
	this.resizeHandle1 = new draw2d.ResizeHandle(this, 1);
	this.resizeHandle2 = new draw2d.ResizeHandle(this, 2);
	this.resizeHandle3 = new draw2d.ResizeHandle(this, 3);
	this.resizeHandle4 = new draw2d.ResizeHandle(this, 4);
	this.resizeHandle5 = new draw2d.ResizeHandle(this, 5);
	this.resizeHandle6 = new draw2d.ResizeHandle(this, 6);
	this.resizeHandle7 = new draw2d.ResizeHandle(this, 7);
	this.resizeHandle8 = new draw2d.ResizeHandle(this, 8);
	this.resizeHandleHalfWidth = parseInt(this.resizeHandle2.getWidth() / 2);
	draw2d.Canvas.call(this, id);
	this.setPanning(false);
	if (this.html != null) {
		this.html.style.backgroundImage = "url(grid_10.png)";
		oThis = this;
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
			if (draw2d.Drag.currentHover != null && obj == null) {
				var _4f51 = new draw2d.DragDropEvent();
				_4f51.initDragDropEvent("mouseleave", false, oThis);
				draw2d.Drag.currentHover.dispatchEvent(_4f51);
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
				draw2d.Drag.currentHover = null;
			}
			if (oThis.tooltip != null) {
				if (Math.abs(oThis.currentTooltipX - oThis.currentMouseX) > 10
						|| Math
								.abs(oThis.currentTooltipY
										- oThis.currentMouseY) > 10) {
					oThis.showTooltip(null);
				}
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
draw2d.Workflow.prototype = new draw2d.Canvas;
draw2d.Workflow.prototype.type = "draw2d.Workflow";
draw2d.Workflow.COLOR_GREEN = new draw2d.Color(0, 255, 0);
draw2d.Workflow.prototype.clear = function() {
	this.scrollTo(0, 0, true);
	this.gridWidthX = 10;
	this.gridWidthY = 10;
	this.snapToGridHelper = null;
	this.verticalSnapToHelperLine = null;
	this.horizontalSnapToHelperLine = null;
	var _4f5b = this.getDocument();
	var _4f5c = _4f5b.getLines().clone();
	for (var i = 0; i < _4f5c.getSize(); i++) {
		new draw2d.CommandDelete(_4f5c.get(i)).execute();
	}
	var _4f5e = _4f5b.getFigures().clone();
	for (var i = 0; i < _4f5e.getSize(); i++) {
		new draw2d.CommandDelete(_4f5e.get(i)).execute();
	}
	this.commonPorts.removeAllElements();
	this.dropTargets.removeAllElements();
	this.compartments.removeAllElements();
	this.selectionListeners.removeAllElements();
	this.dialogs.removeAllElements();
	this.commandStack = new draw2d.CommandStack();
	this.currentSelection = null;
	this.currentMenu = null;
	draw2d.Drag.clearCurrent();
};
draw2d.Workflow.prototype.onScroll = function() {
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
draw2d.Workflow.prototype.setPanning = function(flag) {
	this.panning = flag;
	if (flag) {
		this.html.style.cursor = "move";
	} else {
		this.html.style.cursor = "default";
	}
};
draw2d.Workflow.prototype.scrollTo = function(x, y, fast) {
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
draw2d.Workflow.prototype.showTooltip = function(_4f6f, _4f70) {
	if (this.tooltip != null) {
		this.removeFigure(this.tooltip);
		this.tooltip = null;
		if (this.tooltipTimer >= 0) {
			window.clearTimeout(this.tooltipTimer);
			this.tooltipTimer = -1;
		}
	}
	this.tooltip = _4f6f;
	if (this.tooltip != null) {
		this.currentTooltipX = this.currentMouseX;
		this.currentTooltipY = this.currentMouseY;
		this.addFigure(this.tooltip, this.currentTooltipX + 10,
				this.currentTooltipY + 10);
		var oThis = this;
		var _4f72 = function() {
			oThis.tooltipTimer = -1;
			oThis.showTooltip(null);
		};
		if (_4f70 == true) {
			this.tooltipTimer = window.setTimeout(_4f72, 5000);
		}
	}
};
draw2d.Workflow.prototype.showDialog = function(_4f73, xPos, yPos) {
	if (xPos) {
		this.addFigure(_4f73, xPos, yPos);
	} else {
		this.addFigure(_4f73, 200, 100);
	}
	this.dialogs.add(_4f73);
};
draw2d.Workflow.prototype.showMenu = function(menu, xPos, yPos) {
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
draw2d.Workflow.prototype.onContextMenu = function(x, y) {
	var menu = this.getContextMenu();
	if (menu != null) {
		this.showMenu(menu, x, y);
	}
};
draw2d.Workflow.prototype.getContextMenu = function() {
	return null;
};
draw2d.Workflow.prototype.setToolWindow = function(_4f7c, x, y) {
	this.toolPalette = _4f7c;
	if (y) {
		this.addFigure(_4f7c, x, y);
	} else {
		this.addFigure(_4f7c, 20, 20);
	}
	this.dialogs.add(_4f7c);
};
draw2d.Workflow.prototype.setSnapToGrid = function(flag) {
	if (flag) {
		this.snapToGridHelper = new draw2d.SnapToGrid(this);
	} else {
		this.snapToGridHelper = null;
	}
};
draw2d.Workflow.prototype.setSnapToGeometry = function(flag) {
	if (flag) {
		this.snapToGeometryHelper = new draw2d.SnapToGeometry(this);
	} else {
		this.snapToGeometryHelper = null;
	}
};
draw2d.Workflow.prototype.setGridWidth = function(dx, dy) {
	this.gridWidthX = dx;
	this.gridWidthY = dy;
};
draw2d.Workflow.prototype.addFigure = function(_4f83, xPos, yPos) {
	draw2d.Canvas.prototype.addFigure.call(this, _4f83, xPos, yPos, true);
	_4f83.setWorkflow(this);
	var _4f86 = this;
	if (_4f83 instanceof draw2d.CompartmentFigure) {
		this.compartments.add(_4f83);
	}
	if (_4f83 instanceof draw2d.Line) {
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
draw2d.Workflow.prototype.removeFigure = function(_4f89) {
	draw2d.Canvas.prototype.removeFigure.call(this, _4f89);
	this.figures.remove(_4f89);
	this.lines.remove(_4f89);
	this.dialogs.remove(_4f89);
	_4f89.setWorkflow(null);
	if (_4f89 instanceof draw2d.CompartmentFigure) {
		this.compartments.remove(_4f89);
	}
	if (_4f89 instanceof draw2d.Connection) {
		_4f89.disconnect();
	}
	if (this.currentSelection == _4f89) {
		this.setCurrentSelection(null);
	}
	this.setDocumentDirty();
};
draw2d.Workflow.prototype.moveFront = function(_4f8a) {
	this.html.removeChild(_4f8a.getHTMLElement());
	this.html.appendChild(_4f8a.getHTMLElement());
};
draw2d.Workflow.prototype.moveBack = function(_4f8b) {
	this.html.removeChild(_4f8b.getHTMLElement());
	this.html.insertBefore(_4f8b.getHTMLElement(), this.html.firstChild);
};
draw2d.Workflow.prototype.getBestCompartmentFigure = function(x, y, _4f8e) {
	var _4f8f = null;
	for (var i = 0; i < this.figures.getSize(); i++) {
		var _4f91 = this.figures.get(i);
		if ((_4f91 instanceof draw2d.CompartmentFigure)
				&& _4f91.isOver(x, y) == true && _4f91 != _4f8e) {
			if (_4f8f == null) {
				_4f8f = _4f91;
			} else {
				if (_4f8f.getZOrder() < _4f91.getZOrder()) {
					_4f8f = _4f91;
				}
			}
		}
	}
	return _4f8f;
};
draw2d.Workflow.prototype.getBestFigure = function(x, y, _4f94) {
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
draw2d.Workflow.prototype.getBestLine = function(x, y, _4f9a) {
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
draw2d.Workflow.prototype.getFigure = function(id) {
	for (var i = 0; i < this.figures.getSize(); i++) {
		var _4fa1 = this.figures.get(i);
		if (_4fa1.id == id) {
			return _4fa1;
		}
	}
	return null;
};
draw2d.Workflow.prototype.getFigures = function() {
	return this.figures;
};
draw2d.Workflow.prototype.getDocument = function() {
	return new draw2d.CanvasDocument(this);
};
draw2d.Workflow.prototype.addSelectionListener = function(w) {
	if (w != null) {
		this.selectionListeners.add(w);
	}
};
draw2d.Workflow.prototype.removeSelectionListener = function(w) {
	this.selectionListeners.remove(w);
};
draw2d.Workflow.prototype.setCurrentSelection = function(_4fa4) {
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
draw2d.Workflow.prototype.getCurrentSelection = function() {
	return this.currentSelection;
};
draw2d.Workflow.prototype.getLine = function(id) {
	var count = this.lines.getSize();
	for (var i = 0; i < count; i++) {
		var line = this.lines.get(i);
		if (line.getId() == id) {
			return line;
		}
	}
	return null;
};
draw2d.Workflow.prototype.getLines = function() {
	return this.lines;
};
draw2d.Workflow.prototype.registerPort = function(port) {
	port.draggable.targets = this.dropTargets;
	this.commonPorts.add(port);
	this.dropTargets.add(port.dropable);
};
draw2d.Workflow.prototype.unregisterPort = function(port) {
	port.draggable.targets = null;
	this.commonPorts.remove(port);
	this.dropTargets.remove(port.dropable);
};
draw2d.Workflow.prototype.getCommandStack = function() {
	return this.commandStack;
};
draw2d.Workflow.prototype.showConnectionLine = function(x1, y1, x2, y2) {
	this.connectionLine.setStartPoint(x1, y1);
	this.connectionLine.setEndPoint(x2, y2);
	if (this.connectionLine.canvas == null) {
		draw2d.Canvas.prototype.addFigure.call(this, this.connectionLine);
	}
};
draw2d.Workflow.prototype.hideConnectionLine = function() {
	if (this.connectionLine.canvas != null) {
		draw2d.Canvas.prototype.removeFigure.call(this, this.connectionLine);
	}
};
draw2d.Workflow.prototype.showLineResizeHandles = function(_4fb1) {
	var _4fb2 = this.resizeHandleStart.getWidth() / 2;
	var _4fb3 = this.resizeHandleStart.getHeight() / 2;
	var _4fb4 = _4fb1.getStartPoint();
	var _4fb5 = _4fb1.getEndPoint();
	draw2d.Canvas.prototype.addFigure.call(this, this.resizeHandleStart,
			_4fb4.x - _4fb2, _4fb4.y - _4fb2);
	draw2d.Canvas.prototype.addFigure.call(this, this.resizeHandleEnd, _4fb5.x
					- _4fb2, _4fb5.y - _4fb2);
	this.resizeHandleStart.setCanDrag(_4fb1.isResizeable());
	this.resizeHandleEnd.setCanDrag(_4fb1.isResizeable());
	if (_4fb1.isResizeable()) {
		this.resizeHandleStart.setBackgroundColor(draw2d.Workflow.COLOR_GREEN);
		this.resizeHandleEnd.setBackgroundColor(draw2d.Workflow.COLOR_GREEN);
		this.resizeHandleStart.draggable.targets = this.dropTargets;
		this.resizeHandleEnd.draggable.targets = this.dropTargets;
	} else {
		this.resizeHandleStart.setBackgroundColor(null);
		this.resizeHandleEnd.setBackgroundColor(null);
	}
};
draw2d.Workflow.prototype.hideLineResizeHandles = function() {
	if (this.resizeHandleStart.canvas != null) {
		draw2d.Canvas.prototype.removeFigure.call(this, this.resizeHandleStart);
	}
	if (this.resizeHandleEnd.canvas != null) {
		draw2d.Canvas.prototype.removeFigure.call(this, this.resizeHandleEnd);
	}
};
draw2d.Workflow.prototype.showResizeHandles = function(_4fb6) {
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
	draw2d.Canvas.prototype.addFigure.call(this, this.resizeHandle1, xPos
					- _4fb7, yPos - _4fb8);
	draw2d.Canvas.prototype.addFigure.call(this, this.resizeHandle3, xPos
					+ _4fba, yPos - _4fb8);
	draw2d.Canvas.prototype.addFigure.call(this, this.resizeHandle5, xPos
					+ _4fba, yPos + _4fb9);
	draw2d.Canvas.prototype.addFigure.call(this, this.resizeHandle7, xPos
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
		var green = new draw2d.Color(0, 255, 0);
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
		draw2d.Canvas.prototype.addFigure.call(this, this.resizeHandle2, xPos
						+ (_4fba / 2) - this.resizeHandleHalfWidth, yPos
						- _4fb8);
		draw2d.Canvas.prototype.addFigure.call(this, this.resizeHandle4, xPos
						+ _4fba, yPos + (_4fb9 / 2) - (_4fb8 / 2));
		draw2d.Canvas.prototype.addFigure.call(this, this.resizeHandle6, xPos
						+ (_4fba / 2) - this.resizeHandleHalfWidth, yPos
						+ _4fb9);
		draw2d.Canvas.prototype.addFigure.call(this, this.resizeHandle8, xPos
						- _4fb7, yPos + (_4fb9 / 2) - (_4fb8 / 2));
		this.moveFront(this.resizeHandle2);
		this.moveFront(this.resizeHandle4);
		this.moveFront(this.resizeHandle6);
		this.moveFront(this.resizeHandle8);
	}
};
draw2d.Workflow.prototype.hideResizeHandles = function() {
	if (this.resizeHandle1.canvas != null) {
		draw2d.Canvas.prototype.removeFigure.call(this, this.resizeHandle1);
	}
	if (this.resizeHandle2.canvas != null) {
		draw2d.Canvas.prototype.removeFigure.call(this, this.resizeHandle2);
	}
	if (this.resizeHandle3.canvas != null) {
		draw2d.Canvas.prototype.removeFigure.call(this, this.resizeHandle3);
	}
	if (this.resizeHandle4.canvas != null) {
		draw2d.Canvas.prototype.removeFigure.call(this, this.resizeHandle4);
	}
	if (this.resizeHandle5.canvas != null) {
		draw2d.Canvas.prototype.removeFigure.call(this, this.resizeHandle5);
	}
	if (this.resizeHandle6.canvas != null) {
		draw2d.Canvas.prototype.removeFigure.call(this, this.resizeHandle6);
	}
	if (this.resizeHandle7.canvas != null) {
		draw2d.Canvas.prototype.removeFigure.call(this, this.resizeHandle7);
	}
	if (this.resizeHandle8.canvas != null) {
		draw2d.Canvas.prototype.removeFigure.call(this, this.resizeHandle8);
	}
};
draw2d.Workflow.prototype.moveResizeHandles = function(_4fbe) {
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
draw2d.Workflow.prototype.onMouseDown = function(x, y) {
	this.dragging = true;
	this.mouseDownPosX = x;
	this.mouseDownPosY = y;
	if (this.toolPalette != null && this.toolPalette.getActiveTool() != null) {
		this.toolPalette.getActiveTool().execute(x, y);
	}
	this.setCurrentSelection(null);
	this.showMenu(null);
	var line = this.getBestLine(x, y);
	if (line != null && line.isSelectable()) {
		this.hideResizeHandles();
		this.setCurrentSelection(line);
		this.showLineResizeHandles(this.currentSelection);
		if (line instanceof draw2d.Line && !(line instanceof draw2d.Connection)) {
			this.draggingLineCommand = line
					.createCommand(new draw2d.EditPolicy(draw2d.EditPolicy.MOVE));
			if (this.draggingLineCommand != null) {
				this.draggingLine = line;
			}
		}
	}
};
draw2d.Workflow.prototype.onMouseUp = function(x, y) {
	this.dragging = false;
	if (this.draggingLineCommand != null) {
		this.getCommandStack().execute(this.draggingLineCommand);
		this.draggingLine = null;
		this.draggingLineCommand = null;
	}
};
draw2d.Workflow.prototype.onMouseMove = function(x, y) {
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
draw2d.Workflow.prototype.onKeyDown = function(_4fce, ctrl) {
	if (_4fce == 46 && this.currentSelection != null) {
		this.commandStack
				.execute(this.currentSelection
						.createCommand(new draw2d.EditPolicy(draw2d.EditPolicy.DELETE)));
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
draw2d.Workflow.prototype.setDocumentDirty = function() {
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
draw2d.Workflow.prototype.snapToHelper = function(_4fd2, pos) {
	if (this.snapToGeometryHelper != null) {
		if (_4fd2 instanceof draw2d.ResizeHandle) {
			var _4fd4 = _4fd2.getSnapToGridAnchor();
			pos.x += _4fd4.x;
			pos.y += _4fd4.y;
			var _4fd5 = new draw2d.Point(pos.x, pos.y);
			var _4fd6 = _4fd2.getSnapToDirection();
			var _4fd7 = this.snapToGeometryHelper.snapPoint(_4fd6, pos, _4fd5);
			if ((_4fd6 & draw2d.SnapToHelper.EAST_WEST)
					&& !(_4fd7 & draw2d.SnapToHelper.EAST_WEST)) {
				this.showSnapToHelperLineVertical(_4fd5.x);
			} else {
				this.hideSnapToHelperLineVertical();
			}
			if ((_4fd6 & draw2d.SnapToHelper.NORTH_SOUTH)
					&& !(_4fd7 & draw2d.SnapToHelper.NORTH_SOUTH)) {
				this.showSnapToHelperLineHorizontal(_4fd5.y);
			} else {
				this.hideSnapToHelperLineHorizontal();
			}
			_4fd5.x -= _4fd4.x;
			_4fd5.y -= _4fd4.y;
			return _4fd5;
		} else {
			var _4fd8 = new draw2d.Dimension(pos.x, pos.y, _4fd2.getWidth(),
					_4fd2.getHeight());
			var _4fd5 = new draw2d.Dimension(pos.x, pos.y, _4fd2.getWidth(),
					_4fd2.getHeight());
			var _4fd6 = draw2d.SnapToHelper.NSEW;
			var _4fd7 = this.snapToGeometryHelper.snapRectangle(_4fd8, _4fd5);
			if ((_4fd6 & draw2d.SnapToHelper.WEST)
					&& !(_4fd7 & draw2d.SnapToHelper.WEST)) {
				this.showSnapToHelperLineVertical(_4fd5.x);
			} else {
				if ((_4fd6 & draw2d.SnapToHelper.EAST)
						&& !(_4fd7 & draw2d.SnapToHelper.EAST)) {
					this.showSnapToHelperLineVertical(_4fd5.getX()
							+ _4fd5.getWidth());
				} else {
					this.hideSnapToHelperLineVertical();
				}
			}
			if ((_4fd6 & draw2d.SnapToHelper.NORTH)
					&& !(_4fd7 & draw2d.SnapToHelper.NORTH)) {
				this.showSnapToHelperLineHorizontal(_4fd5.y);
			} else {
				if ((_4fd6 & draw2d.SnapToHelper.SOUTH)
						&& !(_4fd7 & draw2d.SnapToHelper.SOUTH)) {
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
			var _4fd5 = new draw2d.Point(pos.x, pos.y);
			this.snapToGridHelper.snapPoint(0, pos, _4fd5);
			_4fd5.x = _4fd5.x - _4fd4.x;
			_4fd5.y = _4fd5.y - _4fd4.y;
			return _4fd5;
		}
	}
	return pos;
};
draw2d.Workflow.prototype.showSnapToHelperLineHorizontal = function(_4fd9) {
	if (this.horizontalSnapToHelperLine == null) {
		this.horizontalSnapToHelperLine = new draw2d.Line();
		this.horizontalSnapToHelperLine
				.setColor(new draw2d.Color(175, 175, 255));
		this.addFigure(this.horizontalSnapToHelperLine);
	}
	this.horizontalSnapToHelperLine.setStartPoint(0, _4fd9);
	this.horizontalSnapToHelperLine.setEndPoint(this.getWidth(), _4fd9);
};
draw2d.Workflow.prototype.showSnapToHelperLineVertical = function(_4fda) {
	if (this.verticalSnapToHelperLine == null) {
		this.verticalSnapToHelperLine = new draw2d.Line();
		this.verticalSnapToHelperLine.setColor(new draw2d.Color(175, 175, 255));
		this.addFigure(this.verticalSnapToHelperLine);
	}
	this.verticalSnapToHelperLine.setStartPoint(_4fda, 0);
	this.verticalSnapToHelperLine.setEndPoint(_4fda, this.getHeight());
};
draw2d.Workflow.prototype.hideSnapToHelperLines = function() {
	this.hideSnapToHelperLineHorizontal();
	this.hideSnapToHelperLineVertical();
};
draw2d.Workflow.prototype.hideSnapToHelperLineHorizontal = function() {
	if (this.horizontalSnapToHelperLine != null) {
		this.removeFigure(this.horizontalSnapToHelperLine);
		this.horizontalSnapToHelperLine = null;
	}
};
draw2d.Workflow.prototype.hideSnapToHelperLineVertical = function() {
	if (this.verticalSnapToHelperLine != null) {
		this.removeFigure(this.verticalSnapToHelperLine);
		this.verticalSnapToHelperLine = null;
	}
};
draw2d.WindowFigure = function(title) {
	this.title = title;
	this.titlebar = null;
	draw2d.Figure.call(this);
	this.setDeleteable(false);
	this.setCanSnapToHelper(false);
	this.setZOrder(draw2d.WindowFigure.ZOrderIndex);
};
draw2d.WindowFigure.prototype = new draw2d.Figure;
draw2d.WindowFigure.prototype.type = ":draw2d.WindowFigure";
draw2d.WindowFigure.ZOrderIndex = 50000;
draw2d.WindowFigure.setZOrderBaseIndex = function(index) {
	draw2d.WindowFigure.ZOrderBaseIndex = index;
};
draw2d.WindowFigure.prototype.hasFixedPosition = function() {
	return true;
};
draw2d.WindowFigure.prototype.hasTitleBar = function() {
	return true;
};
draw2d.WindowFigure.prototype.createHTMLElement = function() {
	var item = draw2d.Figure.prototype.createHTMLElement.call(this);
	item.style.margin = "0px";
	item.style.padding = "0px";
	item.style.border = "1px solid black";
	item.style.backgroundImage = "url(window_bg.png)";
	item.style.zIndex = draw2d.WindowFigure.ZOrderBaseIndex;
	item.style.cursor = null;
	if (this.hasTitleBar()) {
		this.titlebar = document.createElement("div");
		this.titlebar.style.position = "absolute";
		this.titlebar.style.left = "0px";
		this.titlebar.style.top = "0px";
		this.titlebar.style.width = this.getWidth() + "px";
		this.titlebar.style.height = "15px";
		this.titlebar.style.margin = "0px";
		this.titlebar.style.padding = "0px";
		this.titlebar.style.font = "normal 10px verdana";
		this.titlebar.style.backgroundColor = "blue";
		this.titlebar.style.borderBottom = "2px solid gray";
		this.titlebar.style.whiteSpace = "nowrap";
		this.titlebar.style.textAlign = "center";
		this.titlebar.style.backgroundImage = "url(window_toolbar.png)";
		this.textNode = document.createTextNode(this.title);
		this.titlebar.appendChild(this.textNode);
		item.appendChild(this.titlebar);
	}
	return item;
};
draw2d.WindowFigure.prototype.setDocumentDirty = function(_4eae) {
};
draw2d.WindowFigure.prototype.onDragend = function() {
};
draw2d.WindowFigure.prototype.onDragstart = function(x, y) {
	if (this.titlebar == null) {
		return false;
	}
	if (this.canDrag == true && x < parseInt(this.titlebar.style.width)
			&& y < parseInt(this.titlebar.style.height)) {
		return true;
	}
	return false;
};
draw2d.WindowFigure.prototype.isSelectable = function() {
	return false;
};
draw2d.WindowFigure.prototype.setCanDrag = function(flag) {
	draw2d.Figure.prototype.setCanDrag.call(this, flag);
	this.html.style.cursor = "";
	if (this.titlebar == null) {
		return;
	}
	if (flag) {
		this.titlebar.style.cursor = "move";
	} else {
		this.titlebar.style.cursor = "";
	}
};
draw2d.WindowFigure.prototype.setWorkflow = function(_4eb2) {
	var _4eb3 = this.workflow;
	draw2d.Figure.prototype.setWorkflow.call(this, _4eb2);
	if (_4eb3 != null) {
		_4eb3.removeSelectionListener(this);
	}
	if (this.workflow != null) {
		this.workflow.addSelectionListener(this);
	}
};
draw2d.WindowFigure.prototype.setDimension = function(w, h) {
	draw2d.Figure.prototype.setDimension.call(this, w, h);
	if (this.titlebar != null) {
		this.titlebar.style.width = this.getWidth() + "px";
	}
};
draw2d.WindowFigure.prototype.setTitle = function(title) {
	this.title = title;
};
draw2d.WindowFigure.prototype.getMinWidth = function() {
	return 50;
};
draw2d.WindowFigure.prototype.getMinHeight = function() {
	return 50;
};
draw2d.WindowFigure.prototype.isResizeable = function() {
	return false;
};
draw2d.WindowFigure.prototype.setAlpha = function(_4eb7) {
};
draw2d.WindowFigure.prototype.setBackgroundColor = function(color) {
	this.bgColor = color;
	if (this.bgColor != null) {
		this.html.style.backgroundColor = this.bgColor.getHTMLStyle();
	} else {
		this.html.style.backgroundColor = "transparent";
		this.html.style.backgroundImage = "";
	}
};
draw2d.WindowFigure.prototype.setColor = function(color) {
	this.lineColor = color;
	if (this.lineColor != null) {
		this.html.style.border = this.lineStroke + "px solid "
				+ this.lineColor.getHTMLStyle();
	} else {
		this.html.style.border = "0px";
	}
};
draw2d.WindowFigure.prototype.setLineWidth = function(w) {
	this.lineStroke = w;
	this.html.style.border = this.lineStroke + "px solid black";
};
draw2d.WindowFigure.prototype.onSelectionChanged = function(_4ebb) {
};
draw2d.Button = function(_6099, width, _609b) {
	this.x = 0;
	this.y = 0;
	this.id = draw2d.UUID.create();
	this.enabled = true;
	this.active = false;
	this.palette = _6099;
	if (width && _609b) {
		this.setDimension(width, _609b);
	} else {
		this.setDimension(24, 24);
	}
	this.html = this.createHTMLElement();
};
draw2d.Button.prototype.type = "draw2d.Button";
draw2d.Button.prototype.dispose = function() {
};
draw2d.Button.prototype.getImageUrl = function() {
	if (this.enabled) {
		return this.type + ".png";
	} else {
		return this.type + "_disabled.png";
	}
};
draw2d.Button.prototype.createHTMLElement = function() {
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
	if (this.getImageUrl() != null) {
		item.style.backgroundImage = "url(" + this.getImageUrl() + ")";
	} else {
		item.style.backgroundImage = "";
	}
	var oThis = this;
	this.omousedown = function(event) {
		if (oThis.enabled) {
			oThis.setActive(true);
		}
		event.cancelBubble = true;
		event.returnValue = false;
	};
	this.omouseup = function(event) {
		if (oThis.enabled) {
			oThis.setActive(false);
			oThis.execute();
		}
		event.cancelBubble = true;
		event.returnValue = false;
	};
	if (item.addEventListener) {
		item.addEventListener("mousedown", this.omousedown, false);
		item.addEventListener("mouseup", this.omouseup, false);
	} else {
		if (item.attachEvent) {
			item.attachEvent("onmousedown", this.omousedown);
			item.attachEvent("onmouseup", this.omouseup);
		}
	}
	return item;
};
draw2d.Button.prototype.getHTMLElement = function() {
	if (this.html == null) {
		this.html = this.createHTMLElement();
	}
	return this.html;
};
draw2d.Button.prototype.execute = function() {
};
draw2d.Button.prototype.setTooltip = function(_60a0) {
	this.tooltip = _60a0;
	if (this.tooltip != null) {
		this.html.title = this.tooltip;
	} else {
		this.html.title = "";
	}
};
draw2d.Button.prototype.setActive = function(flag) {
	if (!this.enabled) {
		return;
	}
	this.active = flag;
	if (flag == true) {
		this.html.style.border = "2px inset";
	} else {
		this.html.style.border = "0px";
	}
};
draw2d.Button.prototype.isActive = function() {
	return this.active;
};
draw2d.Button.prototype.setEnabled = function(flag) {
	this.enabled = flag;
	if (this.getImageUrl() != null) {
		this.html.style.backgroundImage = "url(" + this.getImageUrl() + ")";
	} else {
		this.html.style.backgroundImage = "";
	}
};
draw2d.Button.prototype.setDimension = function(w, h) {
	this.width = w;
	this.height = h;
	if (this.html == null) {
		return;
	}
	this.html.style.width = this.width + "px";
	this.html.style.height = this.height + "px";
};
draw2d.Button.prototype.setPosition = function(xPos, yPos) {
	this.x = Math.max(0, xPos);
	this.y = Math.max(0, yPos);
	if (this.html == null) {
		return;
	}
	this.html.style.left = this.x + "px";
	this.html.style.top = this.y + "px";
};
draw2d.Button.prototype.getWidth = function() {
	return this.width;
};
draw2d.Button.prototype.getHeight = function() {
	return this.height;
};
draw2d.Button.prototype.getY = function() {
	return this.y;
};
draw2d.Button.prototype.getX = function() {
	return this.x;
};
draw2d.Button.prototype.getPosition = function() {
	return new draw2d.Point(this.x, this.y);
};
draw2d.Button.prototype.getToolPalette = function() {
	return this.palette;
};
draw2d.ToggleButton = function(_5cd8) {
	draw2d.Button.call(this, _5cd8);
	this.isDownFlag = false;
};
draw2d.ToggleButton.prototype = new draw2d.Button;
draw2d.ToggleButton.prototype.type = "draw2d.ToggleButton";
draw2d.ToggleButton.prototype.createHTMLElement = function() {
	var item = document.createElement("div");
	item.id = this.id;
	item.style.position = "absolute";
	item.style.left = this.x + "px";
	item.style.top = this.y + "px";
	item.style.height = "24px";
	item.style.width = "24px";
	item.style.margin = "0px";
	item.style.padding = "0px";
	if (this.getImageUrl() != null) {
		item.style.backgroundImage = "url(" + this.getImageUrl() + ")";
	} else {
		item.style.backgroundImage = "";
	}
	var oThis = this;
	this.omousedown = function(event) {
		if (oThis.enabled) {
			if (!oThis.isDown()) {
				draw2d.Button.prototype.setActive.call(oThis, true);
			}
		}
		event.cancelBubble = true;
		event.returnValue = false;
	};
	this.omouseup = function(event) {
		if (oThis.enabled) {
			if (oThis.isDown()) {
				draw2d.Button.prototype.setActive.call(oThis, false);
			}
			oThis.isDownFlag = !oThis.isDownFlag;
			oThis.execute();
		}
		event.cancelBubble = true;
		event.returnValue = false;
	};
	if (item.addEventListener) {
		item.addEventListener("mousedown", this.omousedown, false);
		item.addEventListener("mouseup", this.omouseup, false);
	} else {
		if (item.attachEvent) {
			item.attachEvent("onmousedown", this.omousedown);
			item.attachEvent("onmouseup", this.omouseup);
		}
	}
	return item;
};
draw2d.ToggleButton.prototype.isDown = function() {
	return this.isDownFlag;
};
draw2d.ToggleButton.prototype.setActive = function(flag) {
	draw2d.Button.prototype.setActive.call(this, flag);
	this.isDownFlag = flag;
};
draw2d.ToggleButton.prototype.execute = function() {
};
draw2d.ToolGeneric = function(_4b82) {
	this.x = 0;
	this.y = 0;
	this.enabled = true;
	this.tooltip = null;
	this.palette = _4b82;
	this.setDimension(10, 10);
	this.html = this.createHTMLElement();
};
draw2d.ToolGeneric.prototype.type = "draw2d.ToolGeneric";
draw2d.ToolGeneric.prototype.dispose = function() {
};
draw2d.ToolGeneric.prototype.getImageUrl = function() {
	if (this.enabled) {
		return this.type + ".png";
	} else {
		return this.type + "_disabled.png";
	}
};
draw2d.ToolGeneric.prototype.createHTMLElement = function() {
	var item = document.createElement("div");
	item.id = this.id;
	item.style.position = "absolute";
	item.style.left = this.x + "px";
	item.style.top = this.y + "px";
	item.style.height = "24px";
	item.style.width = "24px";
	item.style.margin = "0px";
	item.style.padding = "0px";
	if (this.getImageUrl() != null) {
		item.style.backgroundImage = "url(" + this.getImageUrl() + ")";
	} else {
		item.style.backgroundImage = "";
	}
	var oThis = this;
	this.click = function(event) {
		if (oThis.enabled) {
			oThis.palette.setActiveTool(oThis);
		}
		event.cancelBubble = true;
		event.returnValue = false;
	};
	if (item.addEventListener) {
		item.addEventListener("click", this.click, false);
	} else {
		if (item.attachEvent) {
			item.attachEvent("onclick", this.click);
		}
	}
	return item;
};
draw2d.ToolGeneric.prototype.getHTMLElement = function() {
	if (this.html == null) {
		this.html = this.createHTMLElement();
	}
	return this.html;
};
draw2d.ToolGeneric.prototype.execute = function(x, y) {
	if (this.enabled) {
		this.palette.setActiveTool(null);
	}
};
draw2d.ToolGeneric.prototype.setTooltip = function(_4b88) {
	this.tooltip = _4b88;
	if (this.tooltip != null) {
		this.html.title = this.tooltip;
	} else {
		this.html.title = "";
	}
};
draw2d.ToolGeneric.prototype.setActive = function(flag) {
	if (!this.enabled) {
		return;
	}
	if (flag == true) {
		this.html.style.border = "2px inset";
	} else {
		this.html.style.border = "0px";
	}
};
draw2d.ToolGeneric.prototype.setEnabled = function(flag) {
	this.enabled = flag;
	if (this.getImageUrl() != null) {
		this.html.style.backgroundImage = "url(" + this.getImageUrl() + ")";
	} else {
		this.html.style.backgroundImage = "";
	}
};
draw2d.ToolGeneric.prototype.setDimension = function(w, h) {
	this.width = w;
	this.height = h;
	if (this.html == null) {
		return;
	}
	this.html.style.width = this.width + "px";
	this.html.style.height = this.height + "px";
};
draw2d.ToolGeneric.prototype.setPosition = function(xPos, yPos) {
	this.x = Math.max(0, xPos);
	this.y = Math.max(0, yPos);
	if (this.html == null) {
		return;
	}
	this.html.style.left = this.x + "px";
	this.html.style.top = this.y + "px";
};
draw2d.ToolGeneric.prototype.getWidth = function() {
	return this.width;
};
draw2d.ToolGeneric.prototype.getHeight = function() {
	return this.height;
};
draw2d.ToolGeneric.prototype.getY = function() {
	return this.y;
};
draw2d.ToolGeneric.prototype.getX = function() {
	return this.x;
};
draw2d.ToolGeneric.prototype.getPosition = function() {
	return new draw2d.Point(this.x, this.y);
};
draw2d.ToolPalette = function(title) {
	draw2d.WindowFigure.call(this, title);
	this.setDimension(75, 400);
	this.activeTool = null;
	this.children = new Object();
};
draw2d.ToolPalette.prototype = new draw2d.WindowFigure;
draw2d.ToolPalette.prototype.type = "draw2d.ToolPalette";
draw2d.ToolPalette.prototype.dispose = function() {
	draw2d.WindowFigure.prototype.dispose.call(this);
};
draw2d.ToolPalette.prototype.createHTMLElement = function() {
	var item = draw2d.WindowFigure.prototype.createHTMLElement.call(this);
	this.scrollarea = document.createElement("div");
	this.scrollarea.style.position = "absolute";
	this.scrollarea.style.left = "0px";
	if (this.hasTitleBar()) {
		this.scrollarea.style.top = "15px";
	} else {
		this.scrollarea.style.top = "0px";
	}
	this.scrollarea.style.width = this.getWidth() + "px";
	this.scrollarea.style.height = "15px";
	this.scrollarea.style.margin = "0px";
	this.scrollarea.style.padding = "0px";
	this.scrollarea.style.font = "normal 10px verdana";
	this.scrollarea.style.borderBottom = "2px solid gray";
	this.scrollarea.style.whiteSpace = "nowrap";
	this.scrollarea.style.textAlign = "center";
	this.scrollarea.style.overflowX = "auto";
	this.scrollarea.style.overflowY = "auto";
	this.scrollarea.style.overflow = "auto";
	item.appendChild(this.scrollarea);
	return item;
};
draw2d.ToolPalette.prototype.setDimension = function(w, h) {
	draw2d.WindowFigure.prototype.setDimension.call(this, w, h);
	if (this.scrollarea != null) {
		this.scrollarea.style.width = this.getWidth() + "px";
		if (this.hasTitleBar()) {
			this.scrollarea.style.height = (this.getHeight() - 15) + "px";
		} else {
			this.scrollarea.style.height = this.getHeight() + "px";
		}
	}
};
draw2d.ToolPalette.prototype.addChild = function(item) {
	this.children[item.id] = item;
	this.scrollarea.appendChild(item.getHTMLElement());
};
draw2d.ToolPalette.prototype.getChild = function(id) {
	return this.children[id];
};
draw2d.ToolPalette.prototype.getActiveTool = function() {
	return this.activeTool;
};
draw2d.ToolPalette.prototype.setActiveTool = function(tool) {
	if (this.activeTool != tool && this.activeTool != null) {
		this.activeTool.setActive(false);
	}
	if (tool != null) {
		tool.setActive(true);
	}
	this.activeTool = tool;
};
draw2d.Dialog = function(title) {
	this.buttonbar = null;
	if (title) {
		draw2d.WindowFigure.call(this, title);
	} else {
		draw2d.WindowFigure.call(this, "Dialog");
	}
	this.setDimension(400, 300);
};
draw2d.Dialog.prototype = new draw2d.WindowFigure;
draw2d.Dialog.prototype.type = "draw2d.Dialog";
draw2d.Dialog.prototype.createHTMLElement = function() {
	var item = draw2d.WindowFigure.prototype.createHTMLElement.call(this);
	var oThis = this;
	this.buttonbar = document.createElement("div");
	this.buttonbar.style.position = "absolute";
	this.buttonbar.style.left = "0px";
	this.buttonbar.style.bottom = "0px";
	this.buttonbar.style.width = this.getWidth() + "px";
	this.buttonbar.style.height = "30px";
	this.buttonbar.style.margin = "0px";
	this.buttonbar.style.padding = "0px";
	this.buttonbar.style.font = "normal 10px verdana";
	this.buttonbar.style.backgroundColor = "#c0c0c0";
	this.buttonbar.style.borderBottom = "2px solid gray";
	this.buttonbar.style.whiteSpace = "nowrap";
	this.buttonbar.style.textAlign = "center";
	this.okbutton = document.createElement("button");
	this.okbutton.style.border = "1px solid gray";
	this.okbutton.style.font = "normal 10px verdana";
	this.okbutton.style.width = "80px";
	this.okbutton.style.margin = "5px";
	this.okbutton.innerHTML = "Ok";
	this.okbutton.onclick = function() {
		oThis.onOk();
	};
	this.buttonbar.appendChild(this.okbutton);
	this.cancelbutton = document.createElement("button");
	this.cancelbutton.innerHTML = "Cancel";
	this.cancelbutton.style.font = "normal 10px verdana";
	this.cancelbutton.style.border = "1px solid gray";
	this.cancelbutton.style.width = "80px";
	this.cancelbutton.style.margin = "5px";
	this.cancelbutton.onclick = function() {
		oThis.onCancel();
	};
	this.buttonbar.appendChild(this.cancelbutton);
	item.appendChild(this.buttonbar);
	return item;
};
draw2d.Dialog.prototype.onOk = function() {
	this.workflow.removeFigure(this);
};
draw2d.Dialog.prototype.onCancel = function() {
	this.workflow.removeFigure(this);
};
draw2d.Dialog.prototype.setDimension = function(w, h) {
	draw2d.WindowFigure.prototype.setDimension.call(this, w, h);
	if (this.buttonbar != null) {
		this.buttonbar.style.width = this.getWidth() + "px";
	}
};
draw2d.Dialog.prototype.setWorkflow = function(_526f) {
	draw2d.WindowFigure.prototype.setWorkflow.call(this, _526f);
	this.setFocus();
};
draw2d.Dialog.prototype.setFocus = function() {
};
draw2d.Dialog.prototype.onSetDocumentDirty = function() {
};
draw2d.InputDialog = function() {
	draw2d.Dialog.call(this);
	this.setDimension(400, 100);
};
draw2d.InputDialog.prototype = new draw2d.Dialog;
draw2d.InputDialog.prototype.type = "draw2d.InputDialog";
draw2d.InputDialog.prototype.createHTMLElement = function() {
	var item = draw2d.Dialog.prototype.createHTMLElement.call(this);
	return item;
};
draw2d.InputDialog.prototype.onOk = function() {
	this.workflow.removeFigure(this);
};
draw2d.InputDialog.prototype.onCancel = function() {
	this.workflow.removeFigure(this);
};
draw2d.PropertyDialog = function(_5be1, _5be2, label) {
	this.figure = _5be1;
	this.propertyName = _5be2;
	this.label = label;
	draw2d.Dialog.call(this);
	this.setDimension(400, 120);
};
draw2d.PropertyDialog.prototype = new draw2d.Dialog;
draw2d.PropertyDialog.prototype.type = "draw2d.PropertyDialog";
draw2d.PropertyDialog.prototype.createHTMLElement = function() {
	var item = draw2d.Dialog.prototype.createHTMLElement.call(this);
	var _5be5 = document.createElement("form");
	_5be5.style.position = "absolute";
	_5be5.style.left = "10px";
	_5be5.style.top = "30px";
	_5be5.style.width = "375px";
	_5be5.style.font = "normal 10px verdana";
	item.appendChild(_5be5);
	this.labelDiv = document.createElement("div");
	this.labelDiv.innerHTML = this.label;
	this.disableTextSelection(this.labelDiv);
	_5be5.appendChild(this.labelDiv);
	this.input = document.createElement("input");
	this.input.style.border = "1px solid gray";
	this.input.style.font = "normal 10px verdana";
	this.input.type = "text";
	var value = this.figure.getProperty(this.propertyName);
	if (value) {
		this.input.value = value;
	} else {
		this.input.value = "";
	}
	this.input.style.width = "100%";
	_5be5.appendChild(this.input);
	this.input.focus();
	return item;
};
draw2d.PropertyDialog.prototype.onOk = function() {
	draw2d.Dialog.prototype.onOk.call(this);
	this.figure.setProperty(this.propertyName, this.input.value);
};
draw2d.AnnotationDialog = function(_4b51) {
	this.figure = _4b51;
	draw2d.Dialog.call(this);
	this.setDimension(400, 100);
};
draw2d.AnnotationDialog.prototype = new draw2d.Dialog;
draw2d.AnnotationDialog.prototype.type = "draw2d.AnnotationDialog";
draw2d.AnnotationDialog.prototype.createHTMLElement = function() {
	var item = draw2d.Dialog.prototype.createHTMLElement.call(this);
	var _4b53 = document.createElement("form");
	_4b53.style.position = "absolute";
	_4b53.style.left = "10px";
	_4b53.style.top = "30px";
	_4b53.style.width = "375px";
	_4b53.style.font = "normal 10px verdana";
	item.appendChild(_4b53);
	this.label = document.createTextNode("Text");
	_4b53.appendChild(this.label);
	this.input = document.createElement("input");
	this.input.style.border = "1px solid gray";
	this.input.style.font = "normal 10px verdana";
	this.input.type = "text";
	var value = this.figure.getText();
	if (value) {
		this.input.value = value;
	} else {
		this.input.value = "";
	}
	this.input.style.width = "100%";
	_4b53.appendChild(this.input);
	this.input.focus();
	return item;
};
draw2d.AnnotationDialog.prototype.onOk = function() {
	this.workflow.getCommandStack().execute(new draw2d.CommandSetText(
			this.figure, this.input.value));
	this.workflow.removeFigure(this);
};
draw2d.PropertyWindow = function() {
	this.currentSelection = null;
	draw2d.WindowFigure.call(this, "Property Window");
	this.setDimension(200, 100);
};
draw2d.PropertyWindow.prototype = new draw2d.WindowFigure;
draw2d.PropertyWindow.prototype.type = "draw2d.PropertyWindow";
draw2d.PropertyWindow.prototype.dispose = function() {
	draw2d.WindowFigure.prototype.dispose.call(this);
};
draw2d.PropertyWindow.prototype.createHTMLElement = function() {
	var item = draw2d.WindowFigure.prototype.createHTMLElement.call(this);
	item.appendChild(this.createLabel("Type:", 15, 25));
	item.appendChild(this.createLabel("X :", 15, 50));
	item.appendChild(this.createLabel("Y :", 15, 70));
	item.appendChild(this.createLabel("Width :", 85, 50));
	item.appendChild(this.createLabel("Height :", 85, 70));
	this.labelType = this.createLabel("", 50, 25);
	this.labelX = this.createLabel("", 40, 50);
	this.labelY = this.createLabel("", 40, 70);
	this.labelWidth = this.createLabel("", 135, 50);
	this.labelHeight = this.createLabel("", 135, 70);
	this.labelType.style.fontWeight = "normal";
	this.labelX.style.fontWeight = "normal";
	this.labelY.style.fontWeight = "normal";
	this.labelWidth.style.fontWeight = "normal";
	this.labelHeight.style.fontWeight = "normal";
	item.appendChild(this.labelType);
	item.appendChild(this.labelX);
	item.appendChild(this.labelY);
	item.appendChild(this.labelWidth);
	item.appendChild(this.labelHeight);
	return item;
};
draw2d.PropertyWindow.prototype.onSelectionChanged = function(_5a86) {
	draw2d.WindowFigure.prototype.onSelectionChanged.call(this, _5a86);
	if (this.currentSelection != null) {
		this.currentSelection.detachMoveListener(this);
	}
	this.currentSelection = _5a86;
	if (_5a86 != null && _5a86 != this) {
		this.labelType.innerHTML = _5a86.type;
		if (_5a86.getX) {
			this.labelX.innerHTML = _5a86.getX();
			this.labelY.innerHTML = _5a86.getY();
			this.labelWidth.innerHTML = _5a86.getWidth();
			this.labelHeight.innerHTML = _5a86.getHeight();
			this.currentSelection = _5a86;
			this.currentSelection.attachMoveListener(this);
		} else {
			this.labelX.innerHTML = "";
			this.labelY.innerHTML = "";
			this.labelWidth.innerHTML = "";
			this.labelHeight.innerHTML = "";
		}
	} else {
		this.labelType.innerHTML = "&lt;none&gt;";
		this.labelX.innerHTML = "";
		this.labelY.innerHTML = "";
		this.labelWidth.innerHTML = "";
		this.labelHeight.innerHTML = "";
	}
};
draw2d.PropertyWindow.prototype.getCurrentSelection = function() {
	return this.currentSelection;
};
draw2d.PropertyWindow.prototype.onOtherFigureMoved = function(_5a87) {
	if (_5a87 == this.currentSelection) {
		this.onSelectionChanged(_5a87);
	}
};
draw2d.PropertyWindow.prototype.createLabel = function(text, x, y) {
	var l = document.createElement("div");
	l.style.position = "absolute";
	l.style.left = x + "px";
	l.style.top = y + "px";
	l.style.font = "normal 10px verdana";
	l.style.whiteSpace = "nowrap";
	l.style.fontWeight = "bold";
	l.innerHTML = text;
	return l;
};
draw2d.ColorDialog = function() {
	this.maxValue = {
		"h" : "359",
		"s" : "100",
		"v" : "100"
	};
	this.HSV = {
		0 : 359,
		1 : 100,
		2 : 100
	};
	this.slideHSV = {
		0 : 359,
		1 : 100,
		2 : 100
	};
	this.SVHeight = 165;
	this.wSV = 162;
	this.wH = 162;
	draw2d.Dialog.call(this, "Color Chooser");
	this.loadSV();
	this.setColor(new draw2d.Color(255, 0, 0));
	this.setDimension(219, 244);
};
draw2d.ColorDialog.prototype = new draw2d.Dialog;
draw2d.ColorDialog.prototype.type = "draw2d.ColorDialog";
draw2d.ColorDialog.prototype.createHTMLElement = function() {
	var oThis = this;
	var item = draw2d.Dialog.prototype.createHTMLElement.call(this);
	this.outerDiv = document.createElement("div");
	this.outerDiv.id = "plugin";
	this.outerDiv.style.top = "15px";
	this.outerDiv.style.left = "0px";
	this.outerDiv.style.width = "201px";
	this.outerDiv.style.position = "absolute";
	this.outerDiv.style.padding = "9px";
	this.outerDiv.display = "block";
	this.outerDiv.style.background = "#0d0d0d";
	this.plugHEX = document.createElement("div");
	this.plugHEX.id = "plugHEX";
	this.plugHEX.innerHTML = "F1FFCC";
	this.plugHEX.style.color = "white";
	this.plugHEX.style.font = "normal 10px verdana";
	this.outerDiv.appendChild(this.plugHEX);
	this.SV = document.createElement("div");
	this.SV.onmousedown = function(event) {
		oThis.mouseDownSV(oThis.SVslide, event);
	};
	this.SV.id = "SV";
	this.SV.style.cursor = "crosshair";
	this.SV.style.background = "#FF0000 url(SatVal.png)";
	this.SV.style.position = "absolute";
	this.SV.style.height = "166px";
	this.SV.style.width = "167px";
	this.SV.style.marginRight = "10px";
	this.SV.style.filter = "progid:DXImageTransform.Microsoft.AlphaImageLoader(src='SatVal.png', sizingMethod='scale')";
	this.SV.style["float"] = "left";
	this.outerDiv.appendChild(this.SV);
	this.SVslide = document.createElement("div");
	this.SVslide.onmousedown = function(event) {
		oThis.mouseDownSV(event);
	};
	this.SVslide.style.top = "40px";
	this.SVslide.style.left = "40px";
	this.SVslide.style.position = "absolute";
	this.SVslide.style.cursor = "crosshair";
	this.SVslide.style.background = "url(slide.gif)";
	this.SVslide.style.height = "9px";
	this.SVslide.style.width = "9px";
	this.SVslide.style.lineHeight = "1px";
	this.outerDiv.appendChild(this.SVslide);
	this.H = document.createElement("form");
	this.H.id = "H";
	this.H.onmousedown = function(event) {
		oThis.mouseDownH(event);
	};
	this.H.style.border = "1px solid #000000";
	this.H.style.cursor = "crosshair";
	this.H.style.position = "absolute";
	this.H.style.width = "19px";
	this.H.style.top = "28px";
	this.H.style.left = "191px";
	this.outerDiv.appendChild(this.H);
	this.Hslide = document.createElement("div");
	this.Hslide.style.top = "-7px";
	this.Hslide.style.left = "-8px";
	this.Hslide.style.background = "url(slideHue.gif)";
	this.Hslide.style.height = "5px";
	this.Hslide.style.width = "33px";
	this.Hslide.style.position = "absolute";
	this.Hslide.style.lineHeight = "1px";
	this.H.appendChild(this.Hslide);
	this.Hmodel = document.createElement("div");
	this.Hmodel.style.height = "1px";
	this.Hmodel.style.width = "19px";
	this.Hmodel.style.lineHeight = "1px";
	this.Hmodel.style.margin = "0px";
	this.Hmodel.style.padding = "0px";
	this.Hmodel.style.fontSize = "1px";
	this.H.appendChild(this.Hmodel);
	item.appendChild(this.outerDiv);
	return item;
};
draw2d.ColorDialog.prototype.onOk = function() {
	draw2d.Dialog.prototype.onOk.call(this);
};
draw2d.browser = function(v) {
	return (Math.max(navigator.userAgent.toLowerCase().indexOf(v), 0));
};
draw2d.ColorDialog.prototype.showColor = function(c) {
	this.plugHEX.style.background = "#" + c;
	this.plugHEX.innerHTML = c;
};
draw2d.ColorDialog.prototype.getSelectedColor = function() {
	var rgb = this.hex2rgb(this.plugHEX.innerHTML);
	return new draw2d.Color(rgb[0], rgb[1], rgb[2]);
};
draw2d.ColorDialog.prototype.setColor = function(color) {
	if (color == null) {
		color = new draw2d.Color(100, 100, 100);
	}
	var hex = this.rgb2hex(Array(color.getRed(), color.getGreen(), color
					.getBlue()));
	this.updateH(hex);
};
draw2d.ColorDialog.prototype.XY = function(e, v) {
	var z = draw2d.browser("msie") ? Array(event.clientX
					+ document.body.scrollLeft, event.clientY
					+ document.body.scrollTop) : Array(e.pageX, e.pageY);
	return z[v];
};
draw2d.ColorDialog.prototype.mkHSV = function(a, b, c) {
	return (Math.min(a, Math.max(0, Math.ceil((parseInt(c) / b) * a))));
};
draw2d.ColorDialog.prototype.ckHSV = function(a, b) {
	if (a >= 0 && a <= b) {
		return (a);
	} else {
		if (a > b) {
			return (b);
		} else {
			if (a < 0) {
				return ("-" + oo);
			}
		}
	}
};
draw2d.ColorDialog.prototype.mouseDownH = function(e) {
	this.slideHSV[0] = this.HSV[0];
	var oThis = this;
	this.H.onmousemove = function(e) {
		oThis.dragH(e);
	};
	this.H.onmouseup = function(e) {
		oThis.H.onmousemove = "";
		oThis.H.onmouseup = "";
	};
	this.dragH(e);
};
draw2d.ColorDialog.prototype.dragH = function(e) {
	var y = this.XY(e, 1) - this.getY() - 40;
	this.Hslide.style.top = (this.ckHSV(y, this.wH) - 5) + "px";
	this.slideHSV[0] = this.mkHSV(359, this.wH, this.Hslide.style.top);
	this.updateSV();
	this.showColor(this.commit());
	this.SV.style.backgroundColor = "#"
			+ this.hsv2hex(Array(this.HSV[0], 100, 100));
};
draw2d.ColorDialog.prototype.mouseDownSV = function(o, e) {
	this.slideHSV[0] = this.HSV[0];
	var oThis = this;
	function reset() {
		oThis.SV.onmousemove = "";
		oThis.SV.onmouseup = "";
		oThis.SVslide.onmousemove = "";
		oThis.SVslide.onmouseup = "";
	}
	this.SV.onmousemove = function(e) {
		oThis.dragSV(e);
	};
	this.SV.onmouseup = reset;
	this.SVslide.onmousemove = function(e) {
		oThis.dragSV(e);
	};
	this.SVslide.onmouseup = reset;
	this.dragSV(e);
};
draw2d.ColorDialog.prototype.dragSV = function(e) {
	var x = this.XY(e, 0) - this.getX() - 1;
	var y = this.XY(e, 1) - this.getY() - 20;
	this.SVslide.style.left = this.ckHSV(x, this.wSV) + "px";
	this.SVslide.style.top = this.ckHSV(y, this.wSV) + "px";
	this.slideHSV[1] = this.mkHSV(100, this.wSV, this.SVslide.style.left);
	this.slideHSV[2] = 100 - this.mkHSV(100, this.wSV, this.SVslide.style.top);
	this.updateSV();
};
draw2d.ColorDialog.prototype.commit = function() {
	var r = "hsv";
	var z = {};
	var j = "";
	for (var i = 0; i <= r.length - 1; i++) {
		j = r.substr(i, 1);
		z[i] = (j == "h")
				? this.maxValue[j]
						- this.mkHSV(this.maxValue[j], this.wH,
								this.Hslide.style.top)
				: this.HSV[i];
	}
	return (this.updateSV(this.hsv2hex(z)));
};
draw2d.ColorDialog.prototype.updateSV = function(v) {
	this.HSV = v ? this.hex2hsv(v) : Array(this.slideHSV[0], this.slideHSV[1],
			this.slideHSV[2]);
	if (!v) {
		v = this.hsv2hex(Array(this.slideHSV[0], this.slideHSV[1],
				this.slideHSV[2]));
	}
	this.showColor(v);
	return v;
};
draw2d.ColorDialog.prototype.loadSV = function() {
	var z = "";
	for (var i = this.SVHeight; i >= 0; i--) {
		z += "<div style=\"background:#"
				+ this.hsv2hex(Array(Math.round((359 / this.SVHeight) * i),
						100, 100)) + ";\"><br/></div>";
	}
	this.Hmodel.innerHTML = z;
};
draw2d.ColorDialog.prototype.updateH = function(v) {
	this.plugHEX.innerHTML = v;
	this.HSV = this.hex2hsv(v);
	this.SV.style.backgroundColor = "#"
			+ this.hsv2hex(Array(this.HSV[0], 100, 100));
	this.SVslide.style.top = (parseInt(this.wSV - this.wSV
			* (this.HSV[1] / 100)) + 20)
			+ "px";
	this.SVslide.style.left = (parseInt(this.wSV * (this.HSV[1] / 100)) + 5)
			+ "px";
	this.Hslide.style.top = (parseInt(this.wH
			* ((this.maxValue["h"] - this.HSV[0]) / this.maxValue["h"])) - 7)
			+ "px";
};
draw2d.ColorDialog.prototype.toHex = function(v) {
	v = Math.round(Math.min(Math.max(0, v), 255));
	return ("0123456789ABCDEF".charAt((v - v % 16) / 16) + "0123456789ABCDEF"
			.charAt(v % 16));
};
draw2d.ColorDialog.prototype.hex2rgb = function(r) {
	return ({
		0 : parseInt(r.substr(0, 2), 16),
		1 : parseInt(r.substr(2, 2), 16),
		2 : parseInt(r.substr(4, 2), 16)
	});
};
draw2d.ColorDialog.prototype.rgb2hex = function(r) {
	return (this.toHex(r[0]) + this.toHex(r[1]) + this.toHex(r[2]));
};
draw2d.ColorDialog.prototype.hsv2hex = function(h) {
	return (this.rgb2hex(this.hsv2rgb(h)));
};
draw2d.ColorDialog.prototype.hex2hsv = function(v) {
	return (this.rgb2hsv(this.hex2rgb(v)));
};
draw2d.ColorDialog.prototype.rgb2hsv = function(r) {
	var max = Math.max(r[0], r[1], r[2]);
	var delta = max - Math.min(r[0], r[1], r[2]);
	var H;
	var S;
	var V;
	if (max != 0) {
		S = Math.round(delta / max * 100);
		if (r[0] == max) {
			H = (r[1] - r[2]) / delta;
		} else {
			if (r[1] == max) {
				H = 2 + (r[2] - r[0]) / delta;
			} else {
				if (r[2] == max) {
					H = 4 + (r[0] - r[1]) / delta;
				}
			}
		}
		var H = Math.min(Math.round(H * 60), 360);
		if (H < 0) {
			H += 360;
		}
	}
	return ({
		0 : H ? H : 0,
		1 : S ? S : 0,
		2 : Math.round((max / 255) * 100)
	});
};
draw2d.ColorDialog.prototype.hsv2rgb = function(r) {
	var R;
	var B;
	var G;
	var S = r[1] / 100;
	var V = r[2] / 100;
	var H = r[0] / 360;
	if (S > 0) {
		if (H >= 1) {
			H = 0;
		}
		H = 6 * H;
		F = H - Math.floor(H);
		A = Math.round(255 * V * (1 - S));
		B = Math.round(255 * V * (1 - (S * F)));
		C = Math.round(255 * V * (1 - (S * (1 - F))));
		V = Math.round(255 * V);
		switch (Math.floor(H)) {
			case 0 :
				R = V;
				G = C;
				B = A;
				break;
			case 1 :
				R = B;
				G = V;
				B = A;
				break;
			case 2 :
				R = A;
				G = V;
				B = C;
				break;
			case 3 :
				R = A;
				G = B;
				B = V;
				break;
			case 4 :
				R = C;
				G = A;
				B = V;
				break;
			case 5 :
				R = V;
				G = A;
				B = B;
				break;
		}
		return ({
			0 : R ? R : 0,
			1 : G ? G : 0,
			2 : B ? B : 0
		});
	} else {
		return ({
			0 : (V = Math.round(V * 255)),
			1 : V,
			2 : V
		});
	}
};
draw2d.LineColorDialog = function(_60b1) {
	draw2d.ColorDialog.call(this);
	this.figure = _60b1;
	var color = _60b1.getColor();
	this.updateH(this
			.rgb2hex(color.getRed(), color.getGreen(), color.getBlue()));
};
draw2d.LineColorDialog.prototype = new draw2d.ColorDialog;
draw2d.LineColorDialog.prototype.type = "draw2d.LineColorDialog";
draw2d.LineColorDialog.prototype.onOk = function() {
	var _60b3 = this.workflow;
	draw2d.ColorDialog.prototype.onOk.call(this);
	if (typeof this.figure.setColor == "function") {
		_60b3.getCommandStack().execute(new draw2d.CommandSetColor(this.figure,
				this.getSelectedColor()));
		if (_60b3.getCurrentSelection() == this.figure) {
			_60b3.setCurrentSelection(this.figure);
		}
	}
};
draw2d.BackgroundColorDialog = function(_4fe4) {
	draw2d.ColorDialog.call(this);
	this.figure = _4fe4;
	var color = _4fe4.getBackgroundColor();
	if (color != null) {
		this.updateH(this.rgb2hex(color.getRed(), color.getGreen(), color
						.getBlue()));
	}
};
draw2d.BackgroundColorDialog.prototype = new draw2d.ColorDialog;
draw2d.BackgroundColorDialog.prototype.type = "draw2d.BackgroundColorDialog";
draw2d.BackgroundColorDialog.prototype.onOk = function() {
	var _4fe6 = this.workflow;
	draw2d.ColorDialog.prototype.onOk.call(this);
	if (typeof this.figure.setBackgroundColor == "function") {
		_4fe6.getCommandStack().execute(new draw2d.CommandSetBackgroundColor(
				this.figure, this.getSelectedColor()));
		if (_4fe6.getCurrentSelection() == this.figure) {
			_4fe6.setCurrentSelection(this.figure);
		}
	}
};
draw2d.AnnotationDialog = function(_4b51) {
	this.figure = _4b51;
	draw2d.Dialog.call(this);
	this.setDimension(400, 100);
};
draw2d.AnnotationDialog.prototype = new draw2d.Dialog;
draw2d.AnnotationDialog.prototype.type = "draw2d.AnnotationDialog";
draw2d.AnnotationDialog.prototype.createHTMLElement = function() {
	var item = draw2d.Dialog.prototype.createHTMLElement.call(this);
	var _4b53 = document.createElement("form");
	_4b53.style.position = "absolute";
	_4b53.style.left = "10px";
	_4b53.style.top = "30px";
	_4b53.style.width = "375px";
	_4b53.style.font = "normal 10px verdana";
	item.appendChild(_4b53);
	this.label = document.createTextNode("Text");
	_4b53.appendChild(this.label);
	this.input = document.createElement("input");
	this.input.style.border = "1px solid gray";
	this.input.style.font = "normal 10px verdana";
	this.input.type = "text";
	var value = this.figure.getText();
	if (value) {
		this.input.value = value;
	} else {
		this.input.value = "";
	}
	this.input.style.width = "100%";
	_4b53.appendChild(this.input);
	this.input.focus();
	return item;
};
draw2d.AnnotationDialog.prototype.onOk = function() {
	this.workflow.getCommandStack().execute(new draw2d.CommandSetText(
			this.figure, this.input.value));
	this.workflow.removeFigure(this);
};
draw2d.Command = function(label) {
	this.label = label;
};
draw2d.Command.prototype.type = "draw2d.Command";
draw2d.Command.prototype.getLabel = function() {
	return this.label;
};
draw2d.Command.prototype.canExecute = function() {
	return true;
};
draw2d.Command.prototype.execute = function() {
};
draw2d.Command.prototype.cancel = function() {
};
draw2d.Command.prototype.undo = function() {
};
draw2d.Command.prototype.redo = function() {
};
draw2d.CommandStack = function() {
	this.undostack = new Array();
	this.redostack = new Array();
	this.maxundo = 50;
	this.eventListeners = new draw2d.ArrayList();
};
draw2d.CommandStack.PRE_EXECUTE = 1;
draw2d.CommandStack.PRE_REDO = 2;
draw2d.CommandStack.PRE_UNDO = 4;
draw2d.CommandStack.POST_EXECUTE = 8;
draw2d.CommandStack.POST_REDO = 16;
draw2d.CommandStack.POST_UNDO = 32;
draw2d.CommandStack.POST_MASK = draw2d.CommandStack.POST_EXECUTE
		| draw2d.CommandStack.POST_UNDO | draw2d.CommandStack.POST_REDO;
draw2d.CommandStack.PRE_MASK = draw2d.CommandStack.PRE_EXECUTE
		| draw2d.CommandStack.PRE_UNDO | draw2d.CommandStack.PRE_REDO;
draw2d.CommandStack.prototype.type = "draw2d.CommandStack";
draw2d.CommandStack.prototype.setUndoLimit = function(count) {
	this.maxundo = count;
};
draw2d.CommandStack.prototype.markSaveLocation = function() {
	this.undostack = new Array();
	this.redostack = new Array();
};
draw2d.CommandStack.prototype.execute = function(_4ef3) {
	if (_4ef3 == null) {
		return;
	}
	if (_4ef3.canExecute() == false) {
		return;
	}
	this.notifyListeners(_4ef3, draw2d.CommandStack.PRE_EXECUTE);
	this.undostack.push(_4ef3);
	_4ef3.execute();
	this.redostack = new Array();
	if (this.undostack.length > this.maxundo) {
		this.undostack = this.undostack.slice(this.undostack.length
				- this.maxundo);
	}
	this.notifyListeners(_4ef3, draw2d.CommandStack.POST_EXECUTE);
};
draw2d.CommandStack.prototype.undo = function() {
	var _4ef4 = this.undostack.pop();
	if (_4ef4) {
		this.notifyListeners(_4ef4, draw2d.CommandStack.PRE_UNDO);
		this.redostack.push(_4ef4);
		_4ef4.undo();
		this.notifyListeners(_4ef4, draw2d.CommandStack.POST_UNDO);
	}
};
draw2d.CommandStack.prototype.redo = function() {
	var _4ef5 = this.redostack.pop();
	if (_4ef5) {
		this.notifyListeners(_4ef5, draw2d.CommandStack.PRE_REDO);
		this.undostack.push(_4ef5);
		_4ef5.redo();
		this.notifyListeners(_4ef5, draw2d.CommandStack.POST_REDO);
	}
};
draw2d.CommandStack.prototype.canRedo = function() {
	return this.redostack.length > 0;
};
draw2d.CommandStack.prototype.canUndo = function() {
	return this.undostack.length > 0;
};
draw2d.CommandStack.prototype.addCommandStackEventListener = function(_4ef6) {
	this.eventListeners.add(_4ef6);
};
draw2d.CommandStack.prototype.removeCommandStackEventListener = function(_4ef7) {
	this.eventListeners.remove(_4ef7);
};
draw2d.CommandStack.prototype.notifyListeners = function(_4ef8, state) {
	var event = new draw2d.CommandStackEvent(_4ef8, state);
	var size = this.eventListeners.getSize();
	for (var i = 0; i < size; i++) {
		this.eventListeners.get(i).stackChanged(event);
	}
};
draw2d.CommandStackEvent = function(_48ed, _48ee) {
	this.command = _48ed;
	this.details = _48ee;
};
draw2d.CommandStackEvent.prototype.type = "draw2d.CommandStackEvent";
draw2d.CommandStackEvent.prototype.getCommand = function() {
	return this.command;
};
draw2d.CommandStackEvent.prototype.getDetails = function() {
	return this.details;
};
draw2d.CommandStackEvent.prototype.isPostChangeEvent = function() {
	return 0 != (this.getDetails() & draw2d.CommandStack.POST_MASK);
};
draw2d.CommandStackEvent.prototype.isPreChangeEvent = function() {
	return 0 != (this.getDetails() & draw2d.CommandStack.PRE_MASK);
};
draw2d.CommandStackEventListener = function() {
};
draw2d.CommandStackEventListener.prototype.type = "draw2d.CommandStackEventListener";
draw2d.CommandStackEventListener.prototype.stackChanged = function(event) {
};
draw2d.CommandAdd = function(_5abb, _5abc, x, y, _5abf) {
	draw2d.Command.call(this, "add figure");
	this.parent = _5abf;
	this.figure = _5abc;
	this.x = x;
	this.y = y;
	this.workflow = _5abb;
};
draw2d.CommandAdd.prototype = new draw2d.Command;
draw2d.CommandAdd.prototype.type = "draw2d.CommandAdd";
draw2d.CommandAdd.prototype.execute = function() {
	this.redo();
};
draw2d.CommandAdd.prototype.redo = function() {
	if (this.x && this.y) {
		this.workflow.addFigure(this.figure, this.x, this.y);
	} else {
		this.workflow.addFigure(this.figure);
	}
	this.workflow.setCurrentSelection(this.figure);
	if (this.parent != null) {
		this.parent.addChild(this.figure);
	}
};
draw2d.CommandAdd.prototype.undo = function() {
	this.workflow.removeFigure(this.figure);
	this.workflow.setCurrentSelection(null);
	if (this.parent != null) {
		this.parent.removeChild(this.figure);
	}
};
draw2d.CommandDelete = function(_4f05) {
	draw2d.Command.call(this, "delete figure");
	this.parent = _4f05.parent;
	this.figure = _4f05;
	this.workflow = _4f05.workflow;
	this.connections = null;
	this.compartmentDeleteCommands = null;
};
draw2d.CommandDelete.prototype = new draw2d.Command;
draw2d.CommandDelete.prototype.type = "draw2d.CommandDelete";
draw2d.CommandDelete.prototype.execute = function() {
	this.redo();
};
draw2d.CommandDelete.prototype.undo = function() {
	if (this.figure instanceof draw2d.CompartmentFigure) {
		for (var i = 0; i < this.compartmentDeleteCommands.getSize(); i++) {
			var _4f07 = this.compartmentDeleteCommands.get(i);
			this.figure.addChild(_4f07.figure);
			this.workflow.getCommandStack().undo();
		}
	}
	this.workflow.addFigure(this.figure);
	if (this.figure instanceof draw2d.Connection) {
		this.figure.reconnect();
	}
	this.workflow.setCurrentSelection(this.figure);
	if (this.parent != null) {
		this.parent.addChild(this.figure);
	}
	for (var i = 0; i < this.connections.getSize(); ++i) {
		this.workflow.addFigure(this.connections.get(i));
		this.connections.get(i).reconnect();
	}
};
draw2d.CommandDelete.prototype.redo = function() {
	if (this.figure instanceof draw2d.CompartmentFigure) {
		if (this.compartmentDeleteCommands == null) {
			this.compartmentDeleteCommands = new draw2d.ArrayList();
			var _4f08 = this.figure.getChildren().clone();
			for (var i = 0; i < _4f08.getSize(); i++) {
				var child = _4f08.get(i);
				this.figure.removeChild(child);
				var _4f0b = new draw2d.CommandDelete(child);
				this.compartmentDeleteCommands.add(_4f0b);
				this.workflow.getCommandStack().execute(_4f0b);
			}
		} else {
			for (var i = 0; i < this.compartmentDeleteCommands.getSize(); i++) {
				this.workflow.redo();
			}
		}
	}
	this.workflow.removeFigure(this.figure);
	this.workflow.setCurrentSelection(null);
	if (this.figure instanceof draw2d.Node && this.connections == null) {
		this.connections = new draw2d.ArrayList();
		var ports = this.figure.getPorts();
		for (var i = 0; i < ports.getSize(); i++) {
			if (ports.get(i).getConnections) {
				this.connections.addAll(ports.get(i).getConnections());
			}
		}
	}
	if (this.connections == null) {
		this.connections = new draw2d.ArrayList();
	}
	if (this.parent != null) {
		this.parent.removeChild(this.figure);
	}
	for (var i = 0; i < this.connections.getSize(); ++i) {
		this.workflow.removeFigure(this.connections.get(i));
	}
};
draw2d.CommandMove = function(_5ccf, x, y) {
	draw2d.Command.call(this, "move figure");
	this.figure = _5ccf;
	if (x == undefined) {
		this.oldX = _5ccf.getX();
		this.oldY = _5ccf.getY();
	} else {
		this.oldX = x;
		this.oldY = y;
	}
	this.oldCompartment = _5ccf.getParent();
};
draw2d.CommandMove.prototype = new draw2d.Command;
draw2d.CommandMove.prototype.type = "draw2d.CommandMove";
draw2d.CommandMove.prototype.setStartPosition = function(x, y) {
	this.oldX = x;
	this.oldY = y;
};
draw2d.CommandMove.prototype.setPosition = function(x, y) {
	this.newX = x;
	this.newY = y;
	this.newCompartment = this.figure.workflow.getBestCompartmentFigure(x, y,
			this.figure);
};
draw2d.CommandMove.prototype.canExecute = function() {
	return this.newX != this.oldX || this.newY != this.oldY;
};
draw2d.CommandMove.prototype.execute = function() {
	this.redo();
};
draw2d.CommandMove.prototype.undo = function() {
	this.figure.setPosition(this.oldX, this.oldY);
	if (this.newCompartment != null) {
		this.newCompartment.removeChild(this.figure);
	}
	if (this.oldCompartment != null) {
		this.oldCompartment.addChild(this.figure);
	}
	this.figure.workflow.moveResizeHandles(this.figure);
};
draw2d.CommandMove.prototype.redo = function() {
	this.figure.setPosition(this.newX, this.newY);
	if (this.oldCompartment != null) {
		this.oldCompartment.removeChild(this.figure);
	}
	if (this.newCompartment != null) {
		this.newCompartment.addChild(this.figure);
	}
	this.figure.workflow.moveResizeHandles(this.figure);
};
draw2d.CommandResize = function(_4ee0, width, _4ee2) {
	draw2d.Command.call(this, "resize figure");
	this.figure = _4ee0;
	if (width == undefined) {
		this.oldWidth = _4ee0.getWidth();
		this.oldHeight = _4ee0.getHeight();
	} else {
		this.oldWidth = width;
		this.oldHeight = _4ee2;
	}
};
draw2d.CommandResize.prototype = new draw2d.Command;
draw2d.CommandResize.prototype.type = "draw2d.CommandResize";
draw2d.CommandResize.prototype.setDimension = function(width, _4ee4) {
	this.newWidth = width;
	this.newHeight = _4ee4;
};
draw2d.CommandResize.prototype.canExecute = function() {
	return this.newWidth != this.oldWidth || this.newHeight != this.oldHeight;
};
draw2d.CommandResize.prototype.execute = function() {
	this.redo();
};
draw2d.CommandResize.prototype.undo = function() {
	this.figure.setDimension(this.oldWidth, this.oldHeight);
	this.figure.workflow.moveResizeHandles(this.figure);
};
draw2d.CommandResize.prototype.redo = function() {
	this.figure.setDimension(this.newWidth, this.newHeight);
	this.figure.workflow.moveResizeHandles(this.figure);
};
draw2d.CommandSetText = function(_5bb0, text) {
	draw2d.Command.call(this, "set text");
	this.figure = _5bb0;
	this.newText = text;
	this.oldText = _5bb0.getText();
};
draw2d.CommandSetText.prototype = new draw2d.Command;
draw2d.CommandSetText.prototype.type = "draw2d.CommandSetText";
draw2d.CommandSetText.prototype.execute = function() {
	this.redo();
};
draw2d.CommandSetText.prototype.redo = function() {
	this.figure.setText(this.newText);
};
draw2d.CommandSetText.prototype.undo = function() {
	this.figure.setText(this.oldText);
};
draw2d.CommandSetColor = function(_4dba, color) {
	draw2d.Command.call(this, "set color");
	this.figure = _4dba;
	this.newColor = color;
	this.oldColor = _4dba.getColor();
};
draw2d.CommandSetColor.prototype = new draw2d.Command;
draw2d.CommandSetColor.prototype.type = "draw2d.CommandSetColor";
draw2d.CommandSetColor.prototype.execute = function() {
	this.redo();
};
draw2d.CommandSetColor.prototype.undo = function() {
	this.figure.setColor(this.oldColor);
};
draw2d.CommandSetColor.prototype.redo = function() {
	this.figure.setColor(this.newColor);
};
draw2d.CommandSetBackgroundColor = function(_60da, color) {
	draw2d.Command.call(this, "set background color");
	this.figure = _60da;
	this.newColor = color;
	this.oldColor = _60da.getBackgroundColor();
};
draw2d.CommandSetBackgroundColor.prototype = new draw2d.Command;
draw2d.CommandSetBackgroundColor.prototype.type = "draw2d.CommandSetBackgroundColor";
draw2d.CommandSetBackgroundColor.prototype.execute = function() {
	this.redo();
};
draw2d.CommandSetBackgroundColor.prototype.undo = function() {
	this.figure.setBackgroundColor(this.oldColor);
};
draw2d.CommandSetBackgroundColor.prototype.redo = function() {
	this.figure.setBackgroundColor(this.newColor);
};
draw2d.CommandConnect = function(_5176, _5177, _5178) {
	draw2d.Command.call(this, "create connection");
	this.workflow = _5176;
	this.source = _5177;
	this.target = _5178;
	this.connection = null;
};
draw2d.CommandConnect.prototype = new draw2d.Command;
draw2d.CommandConnect.prototype.type = "draw2d.CommandConnect";
draw2d.CommandConnect.prototype.setConnection = function(_5179) {
	this.connection = _5179;
};
draw2d.CommandConnect.prototype.execute = function() {
	if (this.connection == null) {
		this.connection = new draw2d.Connection();
	}
	this.connection.setSource(this.source);
	this.connection.setTarget(this.target);
	this.workflow.addFigure(this.connection);
};
draw2d.CommandConnect.prototype.redo = function() {
	this.workflow.addFigure(this.connection);
	this.connection.reconnect();
};
draw2d.CommandConnect.prototype.undo = function() {
	this.workflow.removeFigure(this.connection);
};
draw2d.CommandReconnect = function(con) {
	draw2d.Command.call(this, "reconnect connection");
	this.con = con;
	this.oldSourcePort = con.getSource();
	this.oldTargetPort = con.getTarget();
	this.oldRouter = con.getRouter();
	this.con.setRouter(new draw2d.NullConnectionRouter());
};
draw2d.CommandReconnect.prototype = new draw2d.Command;
draw2d.CommandReconnect.prototype.type = "draw2d.CommandReconnect";
draw2d.CommandReconnect.prototype.canExecute = function() {
	return true;
};
draw2d.CommandReconnect.prototype.setNewPorts = function(_5ac1, _5ac2) {
	this.newSourcePort = _5ac1;
	this.newTargetPort = _5ac2;
};
draw2d.CommandReconnect.prototype.execute = function() {
	this.redo();
};
draw2d.CommandReconnect.prototype.cancel = function() {
	var start = this.con.sourceAnchor.getLocation(this.con.targetAnchor
			.getReferencePoint());
	var end = this.con.targetAnchor.getLocation(this.con.sourceAnchor
			.getReferencePoint());
	this.con.setStartPoint(start.x, start.y);
	this.con.setEndPoint(end.x, end.y);
	this.con.getWorkflow().showLineResizeHandles(this.con);
	this.con.setRouter(this.oldRouter);
};
draw2d.CommandReconnect.prototype.undo = function() {
	this.con.setSource(this.oldSourcePort);
	this.con.setTarget(this.oldTargetPort);
	this.con.setRouter(this.oldRouter);
	if (this.con.getWorkflow().getCurrentSelection() == this.con) {
		this.con.getWorkflow().showLineResizeHandles(this.con);
	}
};
draw2d.CommandReconnect.prototype.redo = function() {
	this.con.setSource(this.newSourcePort);
	this.con.setTarget(this.newTargetPort);
	this.con.setRouter(this.oldRouter);
	if (this.con.getWorkflow().getCurrentSelection() == this.con) {
		this.con.getWorkflow().showLineResizeHandles(this.con);
	}
};
draw2d.CommandMoveLine = function(line, _60d6, _60d7, endX, endY) {
	draw2d.Command.call(this, "move line");
	this.line = line;
	this.startX1 = _60d6;
	this.startY1 = _60d7;
	this.endX1 = endX;
	this.endY1 = endY;
};
draw2d.CommandMoveLine.prototype = new draw2d.Command;
draw2d.CommandMoveLine.prototype.type = "draw2d.CommandMoveLine";
draw2d.CommandMoveLine.prototype.canExecute = function() {
	return this.startX1 != this.startX2 || this.startY1 != this.startY2
			|| this.endX1 != this.endX2 || this.endY1 != this.endY2;
};
draw2d.CommandMoveLine.prototype.execute = function() {
	this.startX2 = this.line.getStartX();
	this.startY2 = this.line.getStartY();
	this.endX2 = this.line.getEndX();
	this.endY2 = this.line.getEndY();
	this.redo();
};
draw2d.CommandMoveLine.prototype.undo = function() {
	this.line.setStartPoint(this.startX1, this.startY1);
	this.line.setEndPoint(this.endX1, this.endY1);
	if (this.line.workflow.getCurrentSelection() == this.line) {
		this.line.workflow.showLineResizeHandles(this.line);
	}
};
draw2d.CommandMoveLine.prototype.redo = function() {
	this.line.setStartPoint(this.startX2, this.startY2);
	this.line.setEndPoint(this.endX2, this.endY2);
	if (this.line.workflow.getCurrentSelection() == this.line) {
		this.line.workflow.showLineResizeHandles(this.line);
	}
};
draw2d.CommandMovePort = function(port) {
	draw2d.Command.call(this, "move port");
	this.port = port;
};
draw2d.CommandMovePort.prototype = new draw2d.Command;
draw2d.CommandMovePort.prototype.type = "draw2d.CommandMovePort";
draw2d.CommandMovePort.prototype.execute = function() {
	this.port.setAlpha(1);
	this.port.setPosition(this.port.originX, this.port.originY);
	this.port.parentNode.workflow.hideConnectionLine();
};
draw2d.CommandMovePort.prototype.undo = function() {
};
draw2d.CommandMovePort.prototype.redo = function() {
};
draw2d.CommandMovePort.prototype.setPosition = function(x, y) {
};
draw2d.Menu = function() {
	this.menuItems = new draw2d.ArrayList();
	draw2d.Figure.call(this);
	this.setSelectable(false);
	this.setDeleteable(false);
	this.setCanDrag(false);
	this.setResizeable(false);
	this.setSelectable(false);
	this.setZOrder(10000);
	this.dirty = false;
};
draw2d.Menu.prototype = new draw2d.Figure;
draw2d.Menu.prototype.type = "draw2d.Menu";
draw2d.Menu.prototype.createHTMLElement = function() {
	var item = document.createElement("div");
	item.style.position = "absolute";
	item.style.left = this.x + "px";
	item.style.top = this.y + "px";
	item.style.margin = "0px";
	item.style.padding = "0px";
	item.style.zIndex = "" + draw2d.Figure.ZOrderBaseIndex;
	item.style.border = "1px solid gray";
	item.style.background = "lavender";
	item.style.cursor = "pointer";
	return item;
};
draw2d.Menu.prototype.setWorkflow = function(_4b9a) {
	this.workflow = _4b9a;
};
draw2d.Menu.prototype.appendMenuItem = function(item) {
	this.menuItems.add(item);
	item.parentMenu = this;
	this.dirty = true;
};
draw2d.Menu.prototype.getHTMLElement = function() {
	var html = draw2d.Figure.prototype.getHTMLElement.call(this);
	if (this.dirty) {
		this.createList();
	}
	return html;
};
draw2d.Menu.prototype.createList = function() {
	this.dirty = false;
	this.html.innerHTML = "";
	var oThis = this;
	for (var i = 0; i < this.menuItems.getSize(); i++) {
		var item = this.menuItems.get(i);
		var li = document.createElement("a");
		li.innerHTML = item.getLabel();
		li.style.display = "block";
		li.style.fontFamily = "Verdana, Arial, Helvetica, sans-serif";
		li.style.fontSize = "9pt";
		li.style.color = "dimgray";
		li.style.borderBottom = "1px solid silver";
		li.style.paddingLeft = "5px";
		li.style.paddingRight = "5px";
		li.style.cursor = "pointer";
		this.html.appendChild(li);
		li.menuItem = item;
		if (li.addEventListener) {
			li.addEventListener("click", function(event) {
						var _4ba2 = arguments[0] || window.event;
						_4ba2.cancelBubble = true;
						_4ba2.returnValue = false;
						var diffX = _4ba2.clientX;
						var diffY = _4ba2.clientY;
						var _4ba5 = document.body.parentNode.scrollLeft;
						var _4ba6 = document.body.parentNode.scrollTop;
						this.menuItem.execute(diffX + _4ba5, diffY + _4ba6);
					}, false);
			li.addEventListener("mouseup", function(event) {
						event.cancelBubble = true;
						event.returnValue = false;
					}, false);
			li.addEventListener("mousedown", function(event) {
						event.cancelBubble = true;
						event.returnValue = false;
					}, false);
			li.addEventListener("mouseover", function(event) {
						this.style.backgroundColor = "silver";
					}, false);
			li.addEventListener("mouseout", function(event) {
						this.style.backgroundColor = "transparent";
					}, false);
		} else {
			if (li.attachEvent) {
				li.attachEvent("onclick", function(event) {
							var _4bac = arguments[0] || window.event;
							_4bac.cancelBubble = true;
							_4bac.returnValue = false;
							var diffX = _4bac.clientX;
							var diffY = _4bac.clientY;
							var _4baf = document.body.parentNode.scrollLeft;
							var _4bb0 = document.body.parentNode.scrollTop;
							event.srcElement.menuItem.execute(diffX + _4baf,
									diffY + _4bb0);
						});
				li.attachEvent("onmousedown", function(event) {
							event.cancelBubble = true;
							event.returnValue = false;
						});
				li.attachEvent("onmouseup", function(event) {
							event.cancelBubble = true;
							event.returnValue = false;
						});
				li.attachEvent("onmouseover", function(event) {
							event.srcElement.style.backgroundColor = "silver";
						});
				li.attachEvent("onmouseout", function(event) {
							event.srcElement.style.backgroundColor = "transparent";
						});
			}
		}
	}
};
draw2d.MenuItem = function(label, _4d6f, _4d70) {
	this.label = label;
	this.iconUrl = _4d6f;
	this.parentMenu = null;
	this.action = _4d70;
};
draw2d.MenuItem.prototype.type = "draw2d.MenuItem";
draw2d.MenuItem.prototype.isEnabled = function() {
	return true;
};
draw2d.MenuItem.prototype.getLabel = function() {
	return this.label;
};
draw2d.MenuItem.prototype.execute = function(x, y) {
	this.parentMenu.workflow.showMenu(null);
	this.action(x, y);
};
draw2d.Locator = function() {
};
draw2d.Locator.prototype.type = "draw2d.Locator";
draw2d.Locator.prototype.relocate = function(_60b0) {
};
draw2d.ConnectionLocator = function(_528e) {
	draw2d.Locator.call(this);
	this.connection = _528e;
};
draw2d.ConnectionLocator.prototype = new draw2d.Locator;
draw2d.ConnectionLocator.prototype.type = "draw2d.ConnectionLocator";
draw2d.ConnectionLocator.prototype.getConnection = function() {
	return this.connection;
};
draw2d.ManhattanMidpointLocator = function(_5151) {
	draw2d.ConnectionLocator.call(this, _5151);
};
draw2d.ManhattanMidpointLocator.prototype = new draw2d.ConnectionLocator;
draw2d.ManhattanMidpointLocator.prototype.type = "draw2d.ManhattanMidpointLocator";
draw2d.ManhattanMidpointLocator.prototype.relocate = function(_5152) {
	var conn = this.getConnection();
	var p = new draw2d.Point();
	var _5155 = conn.getPoints();
	var index = Math.floor((_5155.getSize() - 2) / 2);
	var p1 = _5155.get(index);
	var p2 = _5155.get(index + 1);
	p.x = (p2.x - p1.x) / 2 + p1.x + 5;
	p.y = (p2.y - p1.y) / 2 + p1.y + 5;
	_5152.setPosition(p.x, p.y);
};
draw2d.EditPartFactory = function() {
};
draw2d.EditPartFactory.prototype.typet = "draw2d.EditPartFactory";
draw2d.EditPartFactory.prototype.createEditPart = function(model) {
};
draw2d.AbstractObjectModel = function() {
	this.listeners = new draw2d.ArrayList();
	this.id = draw2d.UUID.create();
};
draw2d.AbstractObjectModel.prototype.type = "draw2d.AbstractObjectModel";
draw2d.AbstractObjectModel.prototype.getModelChildren = function() {
	return new draw2d.ArrayList();
};
draw2d.AbstractObjectModel.prototype.getModelParent = function() {
	return this.modelParent;
};
draw2d.AbstractObjectModel.prototype.setModelParent = function(_5161) {
	this.modelParent = _5161;
};
draw2d.AbstractObjectModel.prototype.getId = function() {
	return this.id;
};
draw2d.AbstractObjectModel.prototype.firePropertyChange = function(_5162,
		_5163, _5164) {
	var count = this.listeners.getSize();
	if (count == 0) {
		return;
	}
	var event = new draw2d.PropertyChangeEvent(this, _5162, _5163, _5164);
	for (var i = 0; i < count; i++) {
		try {
			this.listeners.get(i).propertyChange(event);
		} catch (e) {
		}
	}
};
draw2d.AbstractObjectModel.prototype.addPropertyChangeListener = function(_5168) {
	if (_5168 != null) {
		this.listeners.add(_5168);
	}
};
draw2d.AbstractObjectModel.prototype.removePropertyChangeListener = function(
		_5169) {
	if (_5169 != null) {
		this.listeners.remove(_5169);
	}
};
draw2d.AbstractObjectModel.prototype.getPersistentAttributes = function() {
	return {
		id : this.id
	};
};
draw2d.AbstractConnectionModel = function() {
	draw2d.AbstractObjectModel.call(this);
};
draw2d.AbstractConnectionModel.prototype = new draw2d.AbstractObjectModel;
draw2d.AbstractConnectionModel.prototype.type = "draw2d.AbstractConnectionModel";
draw2d.AbstractConnectionModel.prototype.getSourceModel = function() {
	throw "you must override the method [AbstractConnectionModel.prototype.getSourceModel]";
};
draw2d.AbstractConnectionModel.prototype.getTargetModel = function() {
	throw "you must override the method [AbstractConnectionModel.prototype.getTargetModel]";
};
draw2d.AbstractConnectionModel.prototype.getSourcePortName = function() {
	throw "you must override the method [AbstractConnectionModel.prototype.getSourceModel]";
};
draw2d.AbstractConnectionModel.prototype.getTargetPortName = function() {
	throw "you must override the method [AbstractConnectionModel.prototype.getTargetModel]";
};
draw2d.PropertyChangeEvent = function(model, _4bc0, _4bc1, _4bc2) {
	this.model = model;
	this.property = _4bc0;
	this.oldValue = _4bc1;
	this.newValue = _4bc2;
};
draw2d.PropertyChangeEvent.prototype.type = "draw2d.PropertyChangeEvent";
draw2d.GraphicalViewer = function(id) {
	draw2d.Workflow.call(this, id);
	this.factory = null;
	this.model = null;
	this.initDone = false;
};
draw2d.GraphicalViewer.prototype = new draw2d.Workflow;
draw2d.GraphicalViewer.prototype.type = "draw2d.GraphicalViewer";
draw2d.GraphicalViewer.prototype.setEditPartFactory = function(_4d88) {
	this.factory = _4d88;
	this.checkInit();
};
draw2d.GraphicalViewer.prototype.setModel = function(model) {
	if (model instanceof draw2d.AbstractObjectModel) {
		this.model = model;
		this.checkInit();
	} else {
		alert("Invalid model class type:" + model.type);
	}
};
draw2d.GraphicalViewer.prototype.checkInit = function() {
	if (this.factory != null && this.model != null && this.initDone == false) {
		var _4d8a = this.model.getModelChildren();
		var count = _4d8a.getSize();
		for (var i = 0; i < count; i++) {
			var child = _4d8a.get(i);
			var _4d8e = this.factory.createEditPart(child);
			_4d8e.setId(child.getId());
			this.addFigure(_4d8e);
		}
		var _4d8f = this.getDocument().getFigures();
		var count = _4d8f.getSize();
		for (var i = 0; i < count; i++) {
			var _4d8e = _4d8f.get(i);
			if (_4d8e instanceof draw2d.Node) {
				var _4d90 = _4d8e.getModelSourceConnections();
			}
		}
	}
};
draw2d.GraphicalViewer.prototype.refreshConnections = function(node) {
	try {
		var _4d92 = node.getModelSourceConnections();
		var count = _4d92.getSize();
		for (var i = 0; i < count; i++) {
			var _4d95 = _4d92.get(i);
			var _4d96 = this.getLine(_4d95.getId());
			if (_4d96 == null) {
				_4d96 = this.factory.createEditPart(_4d95);
				var _4d97 = _4d95.getSourceModel();
				var _4d98 = _4d95.getTargetModel();
				var _4d99 = this.getFigure(_4d97.getId());
				var _4d9a = this.getFigure(_4d98.getId());
				var _4d9b = _4d99.getPort(_4d95.getSourcePortName());
				var _4d9c = _4d9a.getPort(_4d95.getTargetPortName());
				_4d96.setTarget(_4d9c);
				_4d96.setSource(_4d9b);
				this.addFigure(_4d96);
			}
		}
	} catch (e) {
		alert(e);
	}
};
draw2d.GraphicalEditor = function(id) {
	this.view = new draw2d.GraphicalViewer(id);
	this.initializeGraphicalViewer();
};
draw2d.GraphicalEditor.prototype.type = "draw2d.GraphicalEditor";
draw2d.GraphicalEditor.prototype.initializeGraphicalViewer = function() {
};
draw2d.GraphicalEditor.prototype.getGraphicalViewer = function() {
	return this.view;
};
var whitespace = "\n\r\t ";
XMLP = function(_5b4a) {
	_5b4a = SAXStrings.replace(_5b4a, null, null, "\r\n", "\n");
	_5b4a = SAXStrings.replace(_5b4a, null, null, "\r", "\n");
	this.m_xml = _5b4a;
	this.m_iP = 0;
	this.m_iState = XMLP._STATE_PROLOG;
	this.m_stack = new Stack();
	this._clearAttributes();
};
XMLP._NONE = 0;
XMLP._ELM_B = 1;
XMLP._ELM_E = 2;
XMLP._ELM_EMP = 3;
XMLP._ATT = 4;
XMLP._TEXT = 5;
XMLP._ENTITY = 6;
XMLP._PI = 7;
XMLP._CDATA = 8;
XMLP._COMMENT = 9;
XMLP._DTD = 10;
XMLP._ERROR = 11;
XMLP._CONT_XML = 0;
XMLP._CONT_ALT = 1;
XMLP._ATT_NAME = 0;
XMLP._ATT_VAL = 1;
XMLP._STATE_PROLOG = 1;
XMLP._STATE_DOCUMENT = 2;
XMLP._STATE_MISC = 3;
XMLP._errs = new Array();
XMLP._errs[XMLP.ERR_CLOSE_PI = 0] = "PI: missing closing sequence";
XMLP._errs[XMLP.ERR_CLOSE_DTD = 1] = "DTD: missing closing sequence";
XMLP._errs[XMLP.ERR_CLOSE_COMMENT = 2] = "Comment: missing closing sequence";
XMLP._errs[XMLP.ERR_CLOSE_CDATA = 3] = "CDATA: missing closing sequence";
XMLP._errs[XMLP.ERR_CLOSE_ELM = 4] = "Element: missing closing sequence";
XMLP._errs[XMLP.ERR_CLOSE_ENTITY = 5] = "Entity: missing closing sequence";
XMLP._errs[XMLP.ERR_PI_TARGET = 6] = "PI: target is required";
XMLP._errs[XMLP.ERR_ELM_EMPTY = 7] = "Element: cannot be both empty and closing";
XMLP._errs[XMLP.ERR_ELM_NAME = 8] = "Element: name must immediatly follow \"<\"";
XMLP._errs[XMLP.ERR_ELM_LT_NAME = 9] = "Element: \"<\" not allowed in element names";
XMLP._errs[XMLP.ERR_ATT_VALUES = 10] = "Attribute: values are required and must be in quotes";
XMLP._errs[XMLP.ERR_ATT_LT_NAME = 11] = "Element: \"<\" not allowed in attribute names";
XMLP._errs[XMLP.ERR_ATT_LT_VALUE = 12] = "Attribute: \"<\" not allowed in attribute values";
XMLP._errs[XMLP.ERR_ATT_DUP = 13] = "Attribute: duplicate attributes not allowed";
XMLP._errs[XMLP.ERR_ENTITY_UNKNOWN = 14] = "Entity: unknown entity";
XMLP._errs[XMLP.ERR_INFINITELOOP = 15] = "Infininte loop";
XMLP._errs[XMLP.ERR_DOC_STRUCTURE = 16] = "Document: only comments, processing instructions, or whitespace allowed outside of document element";
XMLP._errs[XMLP.ERR_ELM_NESTING = 17] = "Element: must be nested correctly";
XMLP.prototype._addAttribute = function(name, value) {
	this.m_atts[this.m_atts.length] = new Array(name, value);
};
XMLP.prototype._checkStructure = function(_5b4d) {
	if (XMLP._STATE_PROLOG == this.m_iState) {
		if ((XMLP._TEXT == _5b4d) || (XMLP._ENTITY == _5b4d)) {
			if (SAXStrings.indexOfNonWhitespace(this.getContent(), this
							.getContentBegin(), this.getContentEnd()) != -1) {
				return this._setErr(XMLP.ERR_DOC_STRUCTURE);
			}
		}
		if ((XMLP._ELM_B == _5b4d) || (XMLP._ELM_EMP == _5b4d)) {
			this.m_iState = XMLP._STATE_DOCUMENT;
		}
	}
	if (XMLP._STATE_DOCUMENT == this.m_iState) {
		if ((XMLP._ELM_B == _5b4d) || (XMLP._ELM_EMP == _5b4d)) {
			this.m_stack.push(this.getName());
		}
		if ((XMLP._ELM_E == _5b4d) || (XMLP._ELM_EMP == _5b4d)) {
			var _5b4e = this.m_stack.pop();
			if ((_5b4e == null) || (_5b4e != this.getName())) {
				return this._setErr(XMLP.ERR_ELM_NESTING);
			}
		}
		if (this.m_stack.count() == 0) {
			this.m_iState = XMLP._STATE_MISC;
			return _5b4d;
		}
	}
	if (XMLP._STATE_MISC == this.m_iState) {
		if ((XMLP._ELM_B == _5b4d) || (XMLP._ELM_E == _5b4d)
				|| (XMLP._ELM_EMP == _5b4d) || (XMLP.EVT_DTD == _5b4d)) {
			return this._setErr(XMLP.ERR_DOC_STRUCTURE);
		}
		if ((XMLP._TEXT == _5b4d) || (XMLP._ENTITY == _5b4d)) {
			if (SAXStrings.indexOfNonWhitespace(this.getContent(), this
							.getContentBegin(), this.getContentEnd()) != -1) {
				return this._setErr(XMLP.ERR_DOC_STRUCTURE);
			}
		}
	}
	return _5b4d;
};
XMLP.prototype._clearAttributes = function() {
	this.m_atts = new Array();
};
XMLP.prototype._findAttributeIndex = function(name) {
	for (var i = 0; i < this.m_atts.length; i++) {
		if (this.m_atts[i][XMLP._ATT_NAME] == name) {
			return i;
		}
	}
	return -1;
};
XMLP.prototype.getAttributeCount = function() {
	return this.m_atts ? this.m_atts.length : 0;
};
XMLP.prototype.getAttributeName = function(index) {
	return ((index < 0) || (index >= this.m_atts.length))
			? null
			: this.m_atts[index][XMLP._ATT_NAME];
};
XMLP.prototype.getAttributeValue = function(index) {
	return ((index < 0) || (index >= this.m_atts.length))
			? null
			: __unescapeString(this.m_atts[index][XMLP._ATT_VAL]);
};
XMLP.prototype.getAttributeValueByName = function(name) {
	return this.getAttributeValue(this._findAttributeIndex(name));
};
XMLP.prototype.getColumnNumber = function() {
	return SAXStrings.getColumnNumber(this.m_xml, this.m_iP);
};
XMLP.prototype.getContent = function() {
	return (this.m_cSrc == XMLP._CONT_XML) ? this.m_xml : this.m_cAlt;
};
XMLP.prototype.getContentBegin = function() {
	return this.m_cB;
};
XMLP.prototype.getContentEnd = function() {
	return this.m_cE;
};
XMLP.prototype.getLineNumber = function() {
	return SAXStrings.getLineNumber(this.m_xml, this.m_iP);
};
XMLP.prototype.getName = function() {
	return this.m_name;
};
XMLP.prototype.next = function() {
	return this._checkStructure(this._parse());
};
XMLP.prototype._parse = function() {
	if (this.m_iP == this.m_xml.length) {
		return XMLP._NONE;
	}
	if (this.m_iP == this.m_xml.indexOf("<?", this.m_iP)) {
		return this._parsePI(this.m_iP + 2);
	} else {
		if (this.m_iP == this.m_xml.indexOf("<!DOCTYPE", this.m_iP)) {
			return this._parseDTD(this.m_iP + 9);
		} else {
			if (this.m_iP == this.m_xml.indexOf("<!--", this.m_iP)) {
				return this._parseComment(this.m_iP + 4);
			} else {
				if (this.m_iP == this.m_xml.indexOf("<![CDATA[", this.m_iP)) {
					return this._parseCDATA(this.m_iP + 9);
				} else {
					if (this.m_iP == this.m_xml.indexOf("<", this.m_iP)) {
						return this._parseElement(this.m_iP + 1);
					} else {
						if (this.m_iP == this.m_xml.indexOf("&", this.m_iP)) {
							return this._parseEntity(this.m_iP + 1);
						} else {
							return this._parseText(this.m_iP);
						}
					}
				}
			}
		}
	}
};
XMLP.prototype._parseAttribute = function(iB, iE) {
	var iNB, iNE, iEq, iVB, iVE;
	var _5b57, strN, strV;
	this.m_cAlt = "";
	iNB = SAXStrings.indexOfNonWhitespace(this.m_xml, iB, iE);
	if ((iNB == -1) || (iNB >= iE)) {
		return iNB;
	}
	iEq = this.m_xml.indexOf("=", iNB);
	if ((iEq == -1) || (iEq > iE)) {
		return this._setErr(XMLP.ERR_ATT_VALUES);
	}
	iNE = SAXStrings.lastIndexOfNonWhitespace(this.m_xml, iNB, iEq);
	iVB = SAXStrings.indexOfNonWhitespace(this.m_xml, iEq + 1, iE);
	if ((iVB == -1) || (iVB > iE)) {
		return this._setErr(XMLP.ERR_ATT_VALUES);
	}
	_5b57 = this.m_xml.charAt(iVB);
	if (SAXStrings.QUOTES.indexOf(_5b57) == -1) {
		return this._setErr(XMLP.ERR_ATT_VALUES);
	}
	iVE = this.m_xml.indexOf(_5b57, iVB + 1);
	if ((iVE == -1) || (iVE > iE)) {
		return this._setErr(XMLP.ERR_ATT_VALUES);
	}
	strN = this.m_xml.substring(iNB, iNE + 1);
	strV = this.m_xml.substring(iVB + 1, iVE);
	if (strN.indexOf("<") != -1) {
		return this._setErr(XMLP.ERR_ATT_LT_NAME);
	}
	if (strV.indexOf("<") != -1) {
		return this._setErr(XMLP.ERR_ATT_LT_VALUE);
	}
	strV = SAXStrings.replace(strV, null, null, "\n", " ");
	strV = SAXStrings.replace(strV, null, null, "\t", " ");
	iRet = this._replaceEntities(strV);
	if (iRet == XMLP._ERROR) {
		return iRet;
	}
	strV = this.m_cAlt;
	if (this._findAttributeIndex(strN) == -1) {
		this._addAttribute(strN, strV);
	} else {
		return this._setErr(XMLP.ERR_ATT_DUP);
	}
	this.m_iP = iVE + 2;
	return XMLP._ATT;
};
XMLP.prototype._parseCDATA = function(iB) {
	var iE = this.m_xml.indexOf("]]>", iB);
	if (iE == -1) {
		return this._setErr(XMLP.ERR_CLOSE_CDATA);
	}
	this._setContent(XMLP._CONT_XML, iB, iE);
	this.m_iP = iE + 3;
	return XMLP._CDATA;
};
XMLP.prototype._parseComment = function(iB) {
	var iE = this.m_xml.indexOf("-" + "->", iB);
	if (iE == -1) {
		return this._setErr(XMLP.ERR_CLOSE_COMMENT);
	}
	this._setContent(XMLP._CONT_XML, iB, iE);
	this.m_iP = iE + 3;
	return XMLP._COMMENT;
};
XMLP.prototype._parseDTD = function(iB) {
	var iE, strClose, iInt, iLast;
	iE = this.m_xml.indexOf(">", iB);
	if (iE == -1) {
		return this._setErr(XMLP.ERR_CLOSE_DTD);
	}
	iInt = this.m_xml.indexOf("[", iB);
	strClose = ((iInt != -1) && (iInt < iE)) ? "]>" : ">";
	while (true) {
		if (iE == iLast) {
			return this._setErr(XMLP.ERR_INFINITELOOP);
		}
		iLast = iE;
		iE = this.m_xml.indexOf(strClose, iB);
		if (iE == -1) {
			return this._setErr(XMLP.ERR_CLOSE_DTD);
		}
		if (this.m_xml.substring(iE - 1, iE + 2) != "]]>") {
			break;
		}
	}
	this.m_iP = iE + strClose.length;
	return XMLP._DTD;
};
XMLP.prototype._parseElement = function(iB) {
	var iE, iDE, iNE, iRet;
	var iType, strN, iLast;
	iDE = iE = this.m_xml.indexOf(">", iB);
	if (iE == -1) {
		return this._setErr(XMLP.ERR_CLOSE_ELM);
	}
	if (this.m_xml.charAt(iB) == "/") {
		iType = XMLP._ELM_E;
		iB++;
	} else {
		iType = XMLP._ELM_B;
	}
	if (this.m_xml.charAt(iE - 1) == "/") {
		if (iType == XMLP._ELM_E) {
			return this._setErr(XMLP.ERR_ELM_EMPTY);
		}
		iType = XMLP._ELM_EMP;
		iDE--;
	}
	iDE = SAXStrings.lastIndexOfNonWhitespace(this.m_xml, iB, iDE);
	if (iE - iB != 1) {
		if (SAXStrings.indexOfNonWhitespace(this.m_xml, iB, iDE) != iB) {
			return this._setErr(XMLP.ERR_ELM_NAME);
		}
	}
	this._clearAttributes();
	iNE = SAXStrings.indexOfWhitespace(this.m_xml, iB, iDE);
	if (iNE == -1) {
		iNE = iDE + 1;
	} else {
		this.m_iP = iNE;
		while (this.m_iP < iDE) {
			if (this.m_iP == iLast) {
				return this._setErr(XMLP.ERR_INFINITELOOP);
			}
			iLast = this.m_iP;
			iRet = this._parseAttribute(this.m_iP, iDE);
			if (iRet == XMLP._ERROR) {
				return iRet;
			}
		}
	}
	strN = this.m_xml.substring(iB, iNE);
	if (strN.indexOf("<") != -1) {
		return this._setErr(XMLP.ERR_ELM_LT_NAME);
	}
	this.m_name = strN;
	this.m_iP = iE + 1;
	return iType;
};
XMLP.prototype._parseEntity = function(iB) {
	var iE = this.m_xml.indexOf(";", iB);
	if (iE == -1) {
		return this._setErr(XMLP.ERR_CLOSE_ENTITY);
	}
	this.m_iP = iE + 1;
	return this._replaceEntity(this.m_xml, iB, iE);
};
XMLP.prototype._parsePI = function(iB) {
	var iE, iTB, iTE, iCB, iCE;
	iE = this.m_xml.indexOf("?>", iB);
	if (iE == -1) {
		return this._setErr(XMLP.ERR_CLOSE_PI);
	}
	iTB = SAXStrings.indexOfNonWhitespace(this.m_xml, iB, iE);
	if (iTB == -1) {
		return this._setErr(XMLP.ERR_PI_TARGET);
	}
	iTE = SAXStrings.indexOfWhitespace(this.m_xml, iTB, iE);
	if (iTE == -1) {
		iTE = iE;
	}
	iCB = SAXStrings.indexOfNonWhitespace(this.m_xml, iTE, iE);
	if (iCB == -1) {
		iCB = iE;
	}
	iCE = SAXStrings.lastIndexOfNonWhitespace(this.m_xml, iCB, iE);
	if (iCE == -1) {
		iCE = iE - 1;
	}
	this.m_name = this.m_xml.substring(iTB, iTE);
	this._setContent(XMLP._CONT_XML, iCB, iCE + 1);
	this.m_iP = iE + 2;
	return XMLP._PI;
};
XMLP.prototype._parseText = function(iB) {
	var iE, iEE;
	iE = this.m_xml.indexOf("<", iB);
	if (iE == -1) {
		iE = this.m_xml.length;
	}
	iEE = this.m_xml.indexOf("&", iB);
	if ((iEE != -1) && (iEE <= iE)) {
		iE = iEE;
	}
	this._setContent(XMLP._CONT_XML, iB, iE);
	this.m_iP = iE;
	return XMLP._TEXT;
};
XMLP.prototype._replaceEntities = function(strD, iB, iE) {
	if (SAXStrings.isEmpty(strD)) {
		return "";
	}
	iB = iB || 0;
	iE = iE || strD.length;
	var iEB, iEE, strRet = "";
	iEB = strD.indexOf("&", iB);
	iEE = iB;
	while ((iEB > 0) && (iEB < iE)) {
		strRet += strD.substring(iEE, iEB);
		iEE = strD.indexOf(";", iEB) + 1;
		if ((iEE == 0) || (iEE > iE)) {
			return this._setErr(XMLP.ERR_CLOSE_ENTITY);
		}
		iRet = this._replaceEntity(strD, iEB + 1, iEE - 1);
		if (iRet == XMLP._ERROR) {
			return iRet;
		}
		strRet += this.m_cAlt;
		iEB = strD.indexOf("&", iEE);
	}
	if (iEE != iE) {
		strRet += strD.substring(iEE, iE);
	}
	this._setContent(XMLP._CONT_ALT, strRet);
	return XMLP._ENTITY;
};
XMLP.prototype._replaceEntity = function(strD, iB, iE) {
	if (SAXStrings.isEmpty(strD)) {
		return -1;
	}
	iB = iB || 0;
	iE = iE || strD.length;
	switch (strD.substring(iB, iE)) {
		case "amp" :
			strEnt = "&";
			break;
		case "lt" :
			strEnt = "<";
			break;
		case "gt" :
			strEnt = ">";
			break;
		case "apos" :
			strEnt = "'";
			break;
		case "quot" :
			strEnt = "\"";
			break;
		default :
			if (strD.charAt(iB) == "#") {
				strEnt = String.fromCharCode(parseInt(strD
						.substring(iB + 1, iE)));
			} else {
				return this._setErr(XMLP.ERR_ENTITY_UNKNOWN);
			}
			break;
	}
	this._setContent(XMLP._CONT_ALT, strEnt);
	return XMLP._ENTITY;
};
XMLP.prototype._setContent = function(iSrc) {
	var args = arguments;
	if (XMLP._CONT_XML == iSrc) {
		this.m_cAlt = null;
		this.m_cB = args[1];
		this.m_cE = args[2];
	} else {
		this.m_cAlt = args[1];
		this.m_cB = 0;
		this.m_cE = args[1].length;
	}
	this.m_cSrc = iSrc;
};
XMLP.prototype._setErr = function(iErr) {
	var _5b71 = XMLP._errs[iErr];
	this.m_cAlt = _5b71;
	this.m_cB = 0;
	this.m_cE = _5b71.length;
	this.m_cSrc = XMLP._CONT_ALT;
	return XMLP._ERROR;
};
SAXDriver = function() {
	this.m_hndDoc = null;
	this.m_hndErr = null;
	this.m_hndLex = null;
};
SAXDriver.DOC_B = 1;
SAXDriver.DOC_E = 2;
SAXDriver.ELM_B = 3;
SAXDriver.ELM_E = 4;
SAXDriver.CHARS = 5;
SAXDriver.PI = 6;
SAXDriver.CD_B = 7;
SAXDriver.CD_E = 8;
SAXDriver.CMNT = 9;
SAXDriver.DTD_B = 10;
SAXDriver.DTD_E = 11;
SAXDriver.prototype.parse = function(strD) {
	var _5b73 = new XMLP(strD);
	if (this.m_hndDoc && this.m_hndDoc.setDocumentLocator) {
		this.m_hndDoc.setDocumentLocator(this);
	}
	this.m_parser = _5b73;
	this.m_bErr = false;
	if (!this.m_bErr) {
		this._fireEvent(SAXDriver.DOC_B);
	}
	this._parseLoop();
	if (!this.m_bErr) {
		this._fireEvent(SAXDriver.DOC_E);
	}
	this.m_xml = null;
	this.m_iP = 0;
};
SAXDriver.prototype.setDocumentHandler = function(hnd) {
	this.m_hndDoc = hnd;
};
SAXDriver.prototype.setErrorHandler = function(hnd) {
	this.m_hndErr = hnd;
};
SAXDriver.prototype.setLexicalHandler = function(hnd) {
	this.m_hndLex = hnd;
};
SAXDriver.prototype.getColumnNumber = function() {
	return this.m_parser.getColumnNumber();
};
SAXDriver.prototype.getLineNumber = function() {
	return this.m_parser.getLineNumber();
};
SAXDriver.prototype.getMessage = function() {
	return this.m_strErrMsg;
};
SAXDriver.prototype.getPublicId = function() {
	return null;
};
SAXDriver.prototype.getSystemId = function() {
	return null;
};
SAXDriver.prototype.getLength = function() {
	return this.m_parser.getAttributeCount();
};
SAXDriver.prototype.getName = function(index) {
	return this.m_parser.getAttributeName(index);
};
SAXDriver.prototype.getValue = function(index) {
	return this.m_parser.getAttributeValue(index);
};
SAXDriver.prototype.getValueByName = function(name) {
	return this.m_parser.getAttributeValueByName(name);
};
SAXDriver.prototype._fireError = function(_5b7a) {
	this.m_strErrMsg = _5b7a;
	this.m_bErr = true;
	if (this.m_hndErr && this.m_hndErr.fatalError) {
		this.m_hndErr.fatalError(this);
	}
};
SAXDriver.prototype._fireEvent = function(iEvt) {
	var hnd, func, args = arguments, iLen = args.length - 1;
	if (this.m_bErr) {
		return;
	}
	if (SAXDriver.DOC_B == iEvt) {
		func = "startDocument";
		hnd = this.m_hndDoc;
	} else {
		if (SAXDriver.DOC_E == iEvt) {
			func = "endDocument";
			hnd = this.m_hndDoc;
		} else {
			if (SAXDriver.ELM_B == iEvt) {
				func = "startElement";
				hnd = this.m_hndDoc;
			} else {
				if (SAXDriver.ELM_E == iEvt) {
					func = "endElement";
					hnd = this.m_hndDoc;
				} else {
					if (SAXDriver.CHARS == iEvt) {
						func = "characters";
						hnd = this.m_hndDoc;
					} else {
						if (SAXDriver.PI == iEvt) {
							func = "processingInstruction";
							hnd = this.m_hndDoc;
						} else {
							if (SAXDriver.CD_B == iEvt) {
								func = "startCDATA";
								hnd = this.m_hndLex;
							} else {
								if (SAXDriver.CD_E == iEvt) {
									func = "endCDATA";
									hnd = this.m_hndLex;
								} else {
									if (SAXDriver.CMNT == iEvt) {
										func = "comment";
										hnd = this.m_hndLex;
									}
								}
							}
						}
					}
				}
			}
		}
	}
	if (hnd && hnd[func]) {
		if (0 == iLen) {
			hnd[func]();
		} else {
			if (1 == iLen) {
				hnd[func](args[1]);
			} else {
				if (2 == iLen) {
					hnd[func](args[1], args[2]);
				} else {
					if (3 == iLen) {
						hnd[func](args[1], args[2], args[3]);
					}
				}
			}
		}
	}
};
SAXDriver.prototype._parseLoop = function(_5b7d) {
	var _5b7e, _5b7d;
	_5b7d = this.m_parser;
	while (!this.m_bErr) {
		_5b7e = _5b7d.next();
		if (_5b7e == XMLP._ELM_B) {
			this._fireEvent(SAXDriver.ELM_B, _5b7d.getName(), this);
		} else {
			if (_5b7e == XMLP._ELM_E) {
				this._fireEvent(SAXDriver.ELM_E, _5b7d.getName());
			} else {
				if (_5b7e == XMLP._ELM_EMP) {
					this._fireEvent(SAXDriver.ELM_B, _5b7d.getName(), this);
					this._fireEvent(SAXDriver.ELM_E, _5b7d.getName());
				} else {
					if (_5b7e == XMLP._TEXT) {
						this._fireEvent(SAXDriver.CHARS, _5b7d.getContent(),
								_5b7d.getContentBegin(), _5b7d.getContentEnd()
										- _5b7d.getContentBegin());
					} else {
						if (_5b7e == XMLP._ENTITY) {
							this._fireEvent(SAXDriver.CHARS,
									_5b7d.getContent(),
									_5b7d.getContentBegin(), _5b7d
											.getContentEnd()
											- _5b7d.getContentBegin());
						} else {
							if (_5b7e == XMLP._PI) {
								this._fireEvent(SAXDriver.PI, _5b7d.getName(),
										_5b7d.getContent().substring(
												_5b7d.getContentBegin(),
												_5b7d.getContentEnd()));
							} else {
								if (_5b7e == XMLP._CDATA) {
									this._fireEvent(SAXDriver.CD_B);
									this._fireEvent(SAXDriver.CHARS, _5b7d
													.getContent(), _5b7d
													.getContentBegin(), _5b7d
													.getContentEnd()
													- _5b7d.getContentBegin());
									this._fireEvent(SAXDriver.CD_E);
								} else {
									if (_5b7e == XMLP._COMMENT) {
										this
												._fireEvent(
														SAXDriver.CMNT,
														_5b7d.getContent(),
														_5b7d.getContentBegin(),
														_5b7d.getContentEnd()
																- _5b7d
																		.getContentBegin());
									} else {
										if (_5b7e == XMLP._DTD) {
										} else {
											if (_5b7e == XMLP._ERROR) {
												this._fireError(_5b7d
														.getContent());
											} else {
												if (_5b7e == XMLP._NONE) {
													return;
												}
											}
										}
									}
								}
							}
						}
					}
				}
			}
		}
	}
};
SAXStrings = function() {
};
SAXStrings.WHITESPACE = " \t\n\r";
SAXStrings.QUOTES = "\"'";
SAXStrings.getColumnNumber = function(strD, iP) {
	if (SAXStrings.isEmpty(strD)) {
		return -1;
	}
	iP = iP || strD.length;
	var arrD = strD.substring(0, iP).split("\n");
	var _5b82 = arrD[arrD.length - 1];
	arrD.length--;
	var _5b83 = arrD.join("\n").length;
	return iP - _5b83;
};
SAXStrings.getLineNumber = function(strD, iP) {
	if (SAXStrings.isEmpty(strD)) {
		return -1;
	}
	iP = iP || strD.length;
	return strD.substring(0, iP).split("\n").length;
};
SAXStrings.indexOfNonWhitespace = function(strD, iB, iE) {
	if (SAXStrings.isEmpty(strD)) {
		return -1;
	}
	iB = iB || 0;
	iE = iE || strD.length;
	for (var i = iB; i < iE; i++) {
		if (SAXStrings.WHITESPACE.indexOf(strD.charAt(i)) == -1) {
			return i;
		}
	}
	return -1;
};
SAXStrings.indexOfWhitespace = function(strD, iB, iE) {
	if (SAXStrings.isEmpty(strD)) {
		return -1;
	}
	iB = iB || 0;
	iE = iE || strD.length;
	for (var i = iB; i < iE; i++) {
		if (SAXStrings.WHITESPACE.indexOf(strD.charAt(i)) != -1) {
			return i;
		}
	}
	return -1;
};
SAXStrings.isEmpty = function(strD) {
	return (strD == null) || (strD.length == 0);
};
SAXStrings.lastIndexOfNonWhitespace = function(strD, iB, iE) {
	if (SAXStrings.isEmpty(strD)) {
		return -1;
	}
	iB = iB || 0;
	iE = iE || strD.length;
	for (var i = iE - 1; i >= iB; i--) {
		if (SAXStrings.WHITESPACE.indexOf(strD.charAt(i)) == -1) {
			return i;
		}
	}
	return -1;
};
SAXStrings.replace = function(strD, iB, iE, strF, strR) {
	if (SAXStrings.isEmpty(strD)) {
		return "";
	}
	iB = iB || 0;
	iE = iE || strD.length;
	return strD.substring(iB, iE).split(strF).join(strR);
};
Stack = function() {
	this.m_arr = new Array();
};
Stack.prototype.clear = function() {
	this.m_arr = new Array();
};
Stack.prototype.count = function() {
	return this.m_arr.length;
};
Stack.prototype.destroy = function() {
	this.m_arr = null;
};
Stack.prototype.peek = function() {
	if (this.m_arr.length == 0) {
		return null;
	}
	return this.m_arr[this.m_arr.length - 1];
};
Stack.prototype.pop = function() {
	if (this.m_arr.length == 0) {
		return null;
	}
	var o = this.m_arr[this.m_arr.length - 1];
	this.m_arr.length--;
	return o;
};
Stack.prototype.push = function(o) {
	this.m_arr[this.m_arr.length] = o;
};
function isEmpty(str) {
	return (str == null) || (str.length == 0);
}
function trim(_5b9b, _5b9c, _5b9d) {
	if (isEmpty(_5b9b)) {
		return "";
	}
	if (_5b9c == null) {
		_5b9c = true;
	}
	if (_5b9d == null) {
		_5b9d = true;
	}
	var left = 0;
	var right = 0;
	var i = 0;
	var k = 0;
	if (_5b9c == true) {
		while ((i < _5b9b.length)
				&& (whitespace.indexOf(_5b9b.charAt(i++)) != -1)) {
			left++;
		}
	}
	if (_5b9d == true) {
		k = _5b9b.length - 1;
		while ((k >= left) && (whitespace.indexOf(_5b9b.charAt(k--)) != -1)) {
			right++;
		}
	}
	return _5b9b.substring(left, _5b9b.length - right);
}
function __escapeString(str) {
	var _5ba3 = /&/g;
	var _5ba4 = /</g;
	var _5ba5 = />/g;
	var _5ba6 = /"/g;
	var _5ba7 = /'/g;
	str = str.replace(_5ba3, "&amp;");
	str = str.replace(_5ba4, "&lt;");
	str = str.replace(_5ba5, "&gt;");
	str = str.replace(_5ba6, "&quot;");
	str = str.replace(_5ba7, "&apos;");
	return str;
}
function __unescapeString(str) {
	var _5ba9 = /&amp;/g;
	var _5baa = /&lt;/g;
	var _5bab = /&gt;/g;
	var _5bac = /&quot;/g;
	var _5bad = /&apos;/g;
	str = str.replace(_5ba9, "&");
	str = str.replace(_5baa, "<");
	str = str.replace(_5bab, ">");
	str = str.replace(_5bac, "\"");
	str = str.replace(_5bad, "'");
	return str;
}
function addClass(_4c01, _4c02) {
	if (_4c01) {
		if (_4c01.indexOf("|" + _4c02 + "|") < 0) {
			_4c01 += _4c02 + "|";
		}
	} else {
		_4c01 = "|" + _4c02 + "|";
	}
	return _4c01;
}
DOMException = function(code) {
	this._class = addClass(this._class, "DOMException");
	this.code = code;
};
DOMException.INDEX_SIZE_ERR = 1;
DOMException.DOMSTRING_SIZE_ERR = 2;
DOMException.HIERARCHY_REQUEST_ERR = 3;
DOMException.WRONG_DOCUMENT_ERR = 4;
DOMException.INVALID_CHARACTER_ERR = 5;
DOMException.NO_DATA_ALLOWED_ERR = 6;
DOMException.NO_MODIFICATION_ALLOWED_ERR = 7;
DOMException.NOT_FOUND_ERR = 8;
DOMException.NOT_SUPPORTED_ERR = 9;
DOMException.INUSE_ATTRIBUTE_ERR = 10;
DOMException.INVALID_STATE_ERR = 11;
DOMException.SYNTAX_ERR = 12;
DOMException.INVALID_MODIFICATION_ERR = 13;
DOMException.NAMESPACE_ERR = 14;
DOMException.INVALID_ACCESS_ERR = 15;
DOMImplementation = function() {
	this._class = addClass(this._class, "DOMImplementation");
	this._p = null;
	this.preserveWhiteSpace = false;
	this.namespaceAware = true;
	this.errorChecking = true;
};
DOMImplementation.prototype.escapeString = function DOMNode__escapeString(str) {
	return __escapeString(str);
};
DOMImplementation.prototype.unescapeString = function DOMNode__unescapeString(
		str) {
	return __unescapeString(str);
};
DOMImplementation.prototype.hasFeature = function DOMImplementation_hasFeature(
		_4c06, _4c07) {
	var ret = false;
	if (_4c06.toLowerCase() == "xml") {
		ret = (!_4c07 || (_4c07 == "1.0") || (_4c07 == "2.0"));
	} else {
		if (_4c06.toLowerCase() == "core") {
			ret = (!_4c07 || (_4c07 == "2.0"));
		}
	}
	return ret;
};
DOMImplementation.prototype.loadXML = function DOMImplementation_loadXML(_4c09) {
	var _4c0a;
	try {
		_4c0a = new XMLP(_4c09);
	} catch (e) {
		alert("Error Creating the SAX Parser. Did you include xmlsax.js or tinyxmlsax.js in your web page?\nThe SAX parser is needed to populate XML for <SCRIPT>'s W3C DOM Parser with data.");
	}
	var doc = new DOMDocument(this);
	this._parseLoop(doc, _4c0a);
	doc._parseComplete = true;
	return doc;
};
DOMImplementation.prototype.translateErrCode = function DOMImplementation_translateErrCode(
		code) {
	var msg = "";
	switch (code) {
		case DOMException.INDEX_SIZE_ERR :
			msg = "INDEX_SIZE_ERR: Index out of bounds";
			break;
		case DOMException.DOMSTRING_SIZE_ERR :
			msg = "DOMSTRING_SIZE_ERR: The resulting string is too long to fit in a DOMString";
			break;
		case DOMException.HIERARCHY_REQUEST_ERR :
			msg = "HIERARCHY_REQUEST_ERR: The Node can not be inserted at this location";
			break;
		case DOMException.WRONG_DOCUMENT_ERR :
			msg = "WRONG_DOCUMENT_ERR: The source and the destination Documents are not the same";
			break;
		case DOMException.INVALID_CHARACTER_ERR :
			msg = "INVALID_CHARACTER_ERR: The string contains an invalid character";
			break;
		case DOMException.NO_DATA_ALLOWED_ERR :
			msg = "NO_DATA_ALLOWED_ERR: This Node / NodeList does not support data";
			break;
		case DOMException.NO_MODIFICATION_ALLOWED_ERR :
			msg = "NO_MODIFICATION_ALLOWED_ERR: This object cannot be modified";
			break;
		case DOMException.NOT_FOUND_ERR :
			msg = "NOT_FOUND_ERR: The item cannot be found";
			break;
		case DOMException.NOT_SUPPORTED_ERR :
			msg = "NOT_SUPPORTED_ERR: This implementation does not support function";
			break;
		case DOMException.INUSE_ATTRIBUTE_ERR :
			msg = "INUSE_ATTRIBUTE_ERR: The Attribute has already been assigned to another Element";
			break;
		case DOMException.INVALID_STATE_ERR :
			msg = "INVALID_STATE_ERR: The object is no longer usable";
			break;
		case DOMException.SYNTAX_ERR :
			msg = "SYNTAX_ERR: Syntax error";
			break;
		case DOMException.INVALID_MODIFICATION_ERR :
			msg = "INVALID_MODIFICATION_ERR: Cannot change the type of the object";
			break;
		case DOMException.NAMESPACE_ERR :
			msg = "NAMESPACE_ERR: The namespace declaration is incorrect";
			break;
		case DOMException.INVALID_ACCESS_ERR :
			msg = "INVALID_ACCESS_ERR: The object does not support this function";
			break;
		default :
			msg = "UNKNOWN: Unknown Exception Code (" + code + ")";
	}
	return msg;
};
DOMImplementation.prototype._parseLoop = function DOMImplementation__parseLoop(
		doc, p) {
	var iEvt, iNode, iAttr, strName;
	iNodeParent = doc;
	var _4c11 = 0;
	var _4c12 = new Array();
	var _4c13 = new Array();
	if (this.namespaceAware) {
		var iNS = doc.createNamespace("");
		iNS.setValue("http://www.w3.org/2000/xmlns/");
		doc._namespaces.setNamedItem(iNS);
	}
	while (true) {
		iEvt = p.next();
		if (iEvt == XMLP._ELM_B) {
			var pName = p.getName();
			pName = trim(pName, true, true);
			if (!this.namespaceAware) {
				iNode = doc.createElement(p.getName());
				for (var i = 0; i < p.getAttributeCount(); i++) {
					strName = p.getAttributeName(i);
					iAttr = iNode.getAttributeNode(strName);
					if (!iAttr) {
						iAttr = doc.createAttribute(strName);
					}
					iAttr.setValue(p.getAttributeValue(i));
					iNode.setAttributeNode(iAttr);
				}
			} else {
				iNode = doc.createElementNS("", p.getName());
				iNode._namespaces = iNodeParent._namespaces._cloneNodes(iNode);
				for (var i = 0; i < p.getAttributeCount(); i++) {
					strName = p.getAttributeName(i);
					if (this._isNamespaceDeclaration(strName)) {
						var _4c17 = this._parseNSName(strName);
						if (strName != "xmlns") {
							iNS = doc.createNamespace(strName);
						} else {
							iNS = doc.createNamespace("");
						}
						iNS.setValue(p.getAttributeValue(i));
						iNode._namespaces.setNamedItem(iNS);
					} else {
						iAttr = iNode.getAttributeNode(strName);
						if (!iAttr) {
							iAttr = doc.createAttributeNS("", strName);
						}
						iAttr.setValue(p.getAttributeValue(i));
						iNode.setAttributeNodeNS(iAttr);
						if (this._isIdDeclaration(strName)) {
							iNode.id = p.getAttributeValue(i);
						}
					}
				}
				if (iNode._namespaces.getNamedItem(iNode.prefix)) {
					iNode.namespaceURI = iNode._namespaces
							.getNamedItem(iNode.prefix).value;
				}
				for (var i = 0; i < iNode.attributes.length; i++) {
					if (iNode.attributes.item(i).prefix != "") {
						if (iNode._namespaces.getNamedItem(iNode.attributes
								.item(i).prefix)) {
							iNode.attributes.item(i).namespaceURI = iNode._namespaces
									.getNamedItem(iNode.attributes.item(i).prefix).value;
						}
					}
				}
			}
			if (iNodeParent.nodeType == DOMNode.DOCUMENT_NODE) {
				iNodeParent.documentElement = iNode;
			}
			iNodeParent.appendChild(iNode);
			iNodeParent = iNode;
		} else {
			if (iEvt == XMLP._ELM_E) {
				iNodeParent = iNodeParent.parentNode;
			} else {
				if (iEvt == XMLP._ELM_EMP) {
					pName = p.getName();
					pName = trim(pName, true, true);
					if (!this.namespaceAware) {
						iNode = doc.createElement(pName);
						for (var i = 0; i < p.getAttributeCount(); i++) {
							strName = p.getAttributeName(i);
							iAttr = iNode.getAttributeNode(strName);
							if (!iAttr) {
								iAttr = doc.createAttribute(strName);
							}
							iAttr.setValue(p.getAttributeValue(i));
							iNode.setAttributeNode(iAttr);
						}
					} else {
						iNode = doc.createElementNS("", p.getName());
						iNode._namespaces = iNodeParent._namespaces
								._cloneNodes(iNode);
						for (var i = 0; i < p.getAttributeCount(); i++) {
							strName = p.getAttributeName(i);
							if (this._isNamespaceDeclaration(strName)) {
								var _4c17 = this._parseNSName(strName);
								if (strName != "xmlns") {
									iNS = doc.createNamespace(strName);
								} else {
									iNS = doc.createNamespace("");
								}
								iNS.setValue(p.getAttributeValue(i));
								iNode._namespaces.setNamedItem(iNS);
							} else {
								iAttr = iNode.getAttributeNode(strName);
								if (!iAttr) {
									iAttr = doc.createAttributeNS("", strName);
								}
								iAttr.setValue(p.getAttributeValue(i));
								iNode.setAttributeNodeNS(iAttr);
								if (this._isIdDeclaration(strName)) {
									iNode.id = p.getAttributeValue(i);
								}
							}
						}
						if (iNode._namespaces.getNamedItem(iNode.prefix)) {
							iNode.namespaceURI = iNode._namespaces
									.getNamedItem(iNode.prefix).value;
						}
						for (var i = 0; i < iNode.attributes.length; i++) {
							if (iNode.attributes.item(i).prefix != "") {
								if (iNode._namespaces
										.getNamedItem(iNode.attributes.item(i).prefix)) {
									iNode.attributes.item(i).namespaceURI = iNode._namespaces
											.getNamedItem(iNode.attributes
													.item(i).prefix).value;
								}
							}
						}
					}
					if (iNodeParent.nodeType == DOMNode.DOCUMENT_NODE) {
						iNodeParent.documentElement = iNode;
					}
					iNodeParent.appendChild(iNode);
				} else {
					if (iEvt == XMLP._TEXT || iEvt == XMLP._ENTITY) {
						var _4c18 = p.getContent().substring(
								p.getContentBegin(), p.getContentEnd());
						if (!this.preserveWhiteSpace) {
							if (trim(_4c18, true, true) == "") {
								_4c18 = "";
							}
						}
						if (_4c18.length > 0) {
							var _4c19 = doc.createTextNode(_4c18);
							iNodeParent.appendChild(_4c19);
							if (iEvt == XMLP._ENTITY) {
								_4c12[_4c12.length] = _4c19;
							} else {
								_4c13[_4c13.length] = _4c19;
							}
						}
					} else {
						if (iEvt == XMLP._PI) {
							iNodeParent.appendChild(doc
									.createProcessingInstruction(p.getName(),
											p.getContent().substring(
													p.getContentBegin(),
													p.getContentEnd())));
						} else {
							if (iEvt == XMLP._CDATA) {
								_4c18 = p.getContent().substring(
										p.getContentBegin(), p.getContentEnd());
								if (!this.preserveWhiteSpace) {
									_4c18 = trim(_4c18, true, true);
									_4c18.replace(/ +/g, " ");
								}
								if (_4c18.length > 0) {
									iNodeParent.appendChild(doc
											.createCDATASection(_4c18));
								}
							} else {
								if (iEvt == XMLP._COMMENT) {
									var _4c18 = p.getContent().substring(
											p.getContentBegin(),
											p.getContentEnd());
									if (!this.preserveWhiteSpace) {
										_4c18 = trim(_4c18, true, true);
										_4c18.replace(/ +/g, " ");
									}
									if (_4c18.length > 0) {
										iNodeParent.appendChild(doc
												.createComment(_4c18));
									}
								} else {
									if (iEvt == XMLP._DTD) {
									} else {
										if (iEvt == XMLP._ERROR) {
											throw (new DOMException(DOMException.SYNTAX_ERR));
										} else {
											if (iEvt == XMLP._NONE) {
												if (iNodeParent == doc) {
													break;
												} else {
													throw (new DOMException(DOMException.SYNTAX_ERR));
												}
											}
										}
									}
								}
							}
						}
					}
				}
			}
		}
	}
	var _4c1a = _4c12.length;
	for (intLoop = 0; intLoop < _4c1a; intLoop++) {
		var _4c1b = _4c12[intLoop];
		var _4c1c = _4c1b.getParentNode();
		if (_4c1c) {
			_4c1c.normalize();
			if (!this.preserveWhiteSpace) {
				var _4c1d = _4c1c.getChildNodes();
				var _4c1e = _4c1d.getLength();
				for (intLoop2 = 0; intLoop2 < _4c1e; intLoop2++) {
					var child = _4c1d.item(intLoop2);
					if (child.getNodeType() == DOMNode.TEXT_NODE) {
						var _4c20 = child.getData();
						_4c20 = trim(_4c20, true, true);
						_4c20.replace(/ +/g, " ");
						child.setData(_4c20);
					}
				}
			}
		}
	}
	if (!this.preserveWhiteSpace) {
		var _4c1a = _4c13.length;
		for (intLoop = 0; intLoop < _4c1a; intLoop++) {
			var node = _4c13[intLoop];
			if (node.getParentNode() != null) {
				var _4c22 = node.getData();
				_4c22 = trim(_4c22, true, true);
				_4c22.replace(/ +/g, " ");
				node.setData(_4c22);
			}
		}
	}
};
DOMImplementation.prototype._isNamespaceDeclaration = function DOMImplementation__isNamespaceDeclaration(
		_4c23) {
	return (_4c23.indexOf("xmlns") > -1);
};
DOMImplementation.prototype._isIdDeclaration = function DOMImplementation__isIdDeclaration(
		_4c24) {
	return (_4c24.toLowerCase() == "id");
};
DOMImplementation.prototype._isValidName = function DOMImplementation__isValidName(
		name) {
	return name.match(re_validName);
};
re_validName = /^[a-zA-Z_:][a-zA-Z0-9\.\-_:]*$/;
DOMImplementation.prototype._isValidString = function DOMImplementation__isValidString(
		name) {
	return (name.search(re_invalidStringChars) < 0);
};
re_invalidStringChars = /\x01|\x02|\x03|\x04|\x05|\x06|\x07|\x08|\x0B|\x0C|\x0E|\x0F|\x10|\x11|\x12|\x13|\x14|\x15|\x16|\x17|\x18|\x19|\x1A|\x1B|\x1C|\x1D|\x1E|\x1F|\x7F/;
DOMImplementation.prototype._parseNSName = function DOMImplementation__parseNSName(
		_4c27) {
	var _4c28 = new Object();
	_4c28.prefix = _4c27;
	_4c28.namespaceName = "";
	delimPos = _4c27.indexOf(":");
	if (delimPos > -1) {
		_4c28.prefix = _4c27.substring(0, delimPos);
		_4c28.namespaceName = _4c27.substring(delimPos + 1, _4c27.length);
	}
	return _4c28;
};
DOMImplementation.prototype._parseQName = function DOMImplementation__parseQName(
		_4c29) {
	var _4c2a = new Object();
	_4c2a.localName = _4c29;
	_4c2a.prefix = "";
	delimPos = _4c29.indexOf(":");
	if (delimPos > -1) {
		_4c2a.prefix = _4c29.substring(0, delimPos);
		_4c2a.localName = _4c29.substring(delimPos + 1, _4c29.length);
	}
	return _4c2a;
};
DOMNodeList = function(_4c2b, _4c2c) {
	this._class = addClass(this._class, "DOMNodeList");
	this._nodes = new Array();
	this.length = 0;
	this.parentNode = _4c2c;
	this.ownerDocument = _4c2b;
	this._readonly = false;
};
DOMNodeList.prototype.getLength = function DOMNodeList_getLength() {
	return this.length;
};
DOMNodeList.prototype.item = function DOMNodeList_item(index) {
	var ret = null;
	if ((index >= 0) && (index < this._nodes.length)) {
		ret = this._nodes[index];
	}
	return ret;
};
DOMNodeList.prototype._findItemIndex = function DOMNodeList__findItemIndex(id) {
	var ret = -1;
	if (id > -1) {
		for (var i = 0; i < this._nodes.length; i++) {
			if (this._nodes[i]._id == id) {
				ret = i;
				break;
			}
		}
	}
	return ret;
};
DOMNodeList.prototype._insertBefore = function DOMNodeList__insertBefore(_4c32,
		_4c33) {
	if ((_4c33 >= 0) && (_4c33 < this._nodes.length)) {
		var _4c34 = new Array();
		_4c34 = this._nodes.slice(0, _4c33);
		if (_4c32.nodeType == DOMNode.DOCUMENT_FRAGMENT_NODE) {
			_4c34 = _4c34.concat(_4c32.childNodes._nodes);
		} else {
			_4c34[_4c34.length] = _4c32;
		}
		this._nodes = _4c34.concat(this._nodes.slice(_4c33));
		this.length = this._nodes.length;
	}
};
DOMNodeList.prototype._replaceChild = function DOMNodeList__replaceChild(_4c35,
		_4c36) {
	var ret = null;
	if ((_4c36 >= 0) && (_4c36 < this._nodes.length)) {
		ret = this._nodes[_4c36];
		if (_4c35.nodeType == DOMNode.DOCUMENT_FRAGMENT_NODE) {
			var _4c38 = new Array();
			_4c38 = this._nodes.slice(0, _4c36);
			_4c38 = _4c38.concat(_4c35.childNodes._nodes);
			this._nodes = _4c38.concat(this._nodes.slice(_4c36 + 1));
		} else {
			this._nodes[_4c36] = _4c35;
		}
	}
	return ret;
};
DOMNodeList.prototype._removeChild = function DOMNodeList__removeChild(_4c39) {
	var ret = null;
	if (_4c39 > -1) {
		ret = this._nodes[_4c39];
		var _4c3b = new Array();
		_4c3b = this._nodes.slice(0, _4c39);
		this._nodes = _4c3b.concat(this._nodes.slice(_4c39 + 1));
		this.length = this._nodes.length;
	}
	return ret;
};
DOMNodeList.prototype._appendChild = function DOMNodeList__appendChild(_4c3c) {
	if (_4c3c.nodeType == DOMNode.DOCUMENT_FRAGMENT_NODE) {
		this._nodes = this._nodes.concat(_4c3c.childNodes._nodes);
	} else {
		this._nodes[this._nodes.length] = _4c3c;
	}
	this.length = this._nodes.length;
};
DOMNodeList.prototype._cloneNodes = function DOMNodeList__cloneNodes(deep,
		_4c3e) {
	var _4c3f = new DOMNodeList(this.ownerDocument, _4c3e);
	for (var i = 0; i < this._nodes.length; i++) {
		_4c3f._appendChild(this._nodes[i].cloneNode(deep));
	}
	return _4c3f;
};
DOMNodeList.prototype.toString = function DOMNodeList_toString() {
	var ret = "";
	for (var i = 0; i < this.length; i++) {
		ret += this._nodes[i].toString();
	}
	return ret;
};
DOMNamedNodeMap = function(_4c43, _4c44) {
	this._class = addClass(this._class, "DOMNamedNodeMap");
	this.DOMNodeList = DOMNodeList;
	this.DOMNodeList(_4c43, _4c44);
};
DOMNamedNodeMap.prototype = new DOMNodeList;
DOMNamedNodeMap.prototype.getNamedItem = function DOMNamedNodeMap_getNamedItem(
		name) {
	var ret = null;
	var _4c47 = this._findNamedItemIndex(name);
	if (_4c47 > -1) {
		ret = this._nodes[_4c47];
	}
	return ret;
};
DOMNamedNodeMap.prototype.setNamedItem = function DOMNamedNodeMap_setNamedItem(
		arg) {
	if (this.ownerDocument.implementation.errorChecking) {
		if (this.ownerDocument != arg.ownerDocument) {
			throw (new DOMException(DOMException.WRONG_DOCUMENT_ERR));
		}
		if (this._readonly || (this.parentNode && this.parentNode._readonly)) {
			throw (new DOMException(DOMException.NO_MODIFICATION_ALLOWED_ERR));
		}
		if (arg.ownerElement && (arg.ownerElement != this.parentNode)) {
			throw (new DOMException(DOMException.INUSE_ATTRIBUTE_ERR));
		}
	}
	var _4c49 = this._findNamedItemIndex(arg.name);
	var ret = null;
	if (_4c49 > -1) {
		ret = this._nodes[_4c49];
		if (this.ownerDocument.implementation.errorChecking && ret._readonly) {
			throw (new DOMException(DOMException.NO_MODIFICATION_ALLOWED_ERR));
		} else {
			this._nodes[_4c49] = arg;
		}
	} else {
		this._nodes[this.length] = arg;
	}
	this.length = this._nodes.length;
	arg.ownerElement = this.parentNode;
	return ret;
};
DOMNamedNodeMap.prototype.removeNamedItem = function DOMNamedNodeMap_removeNamedItem(
		name) {
	var ret = null;
	if (this.ownerDocument.implementation.errorChecking
			&& (this._readonly || (this.parentNode && this.parentNode._readonly))) {
		throw (new DOMException(DOMException.NO_MODIFICATION_ALLOWED_ERR));
	}
	var _4c4d = this._findNamedItemIndex(name);
	if (this.ownerDocument.implementation.errorChecking && (_4c4d < 0)) {
		throw (new DOMException(DOMException.NOT_FOUND_ERR));
	}
	var _4c4e = this._nodes[_4c4d];
	if (this.ownerDocument.implementation.errorChecking && _4c4e._readonly) {
		throw (new DOMException(DOMException.NO_MODIFICATION_ALLOWED_ERR));
	}
	return this._removeChild(_4c4d);
};
DOMNamedNodeMap.prototype.getNamedItemNS = function DOMNamedNodeMap_getNamedItemNS(
		_4c4f, _4c50) {
	var ret = null;
	var _4c52 = this._findNamedItemNSIndex(_4c4f, _4c50);
	if (_4c52 > -1) {
		ret = this._nodes[_4c52];
	}
	return ret;
};
DOMNamedNodeMap.prototype.setNamedItemNS = function DOMNamedNodeMap_setNamedItemNS(
		arg) {
	if (this.ownerDocument.implementation.errorChecking) {
		if (this._readonly || (this.parentNode && this.parentNode._readonly)) {
			throw (new DOMException(DOMException.NO_MODIFICATION_ALLOWED_ERR));
		}
		if (this.ownerDocument != arg.ownerDocument) {
			throw (new DOMException(DOMException.WRONG_DOCUMENT_ERR));
		}
		if (arg.ownerElement && (arg.ownerElement != this.parentNode)) {
			throw (new DOMException(DOMException.INUSE_ATTRIBUTE_ERR));
		}
	}
	var _4c54 = this._findNamedItemNSIndex(arg.namespaceURI, arg.localName);
	var ret = null;
	if (_4c54 > -1) {
		ret = this._nodes[_4c54];
		if (this.ownerDocument.implementation.errorChecking && ret._readonly) {
			throw (new DOMException(DOMException.NO_MODIFICATION_ALLOWED_ERR));
		} else {
			this._nodes[_4c54] = arg;
		}
	} else {
		this._nodes[this.length] = arg;
	}
	this.length = this._nodes.length;
	arg.ownerElement = this.parentNode;
	return ret;
};
DOMNamedNodeMap.prototype.removeNamedItemNS = function DOMNamedNodeMap_removeNamedItemNS(
		_4c56, _4c57) {
	var ret = null;
	if (this.ownerDocument.implementation.errorChecking
			&& (this._readonly || (this.parentNode && this.parentNode._readonly))) {
		throw (new DOMException(DOMException.NO_MODIFICATION_ALLOWED_ERR));
	}
	var _4c59 = this._findNamedItemNSIndex(_4c56, _4c57);
	if (this.ownerDocument.implementation.errorChecking && (_4c59 < 0)) {
		throw (new DOMException(DOMException.NOT_FOUND_ERR));
	}
	var _4c5a = this._nodes[_4c59];
	if (this.ownerDocument.implementation.errorChecking && _4c5a._readonly) {
		throw (new DOMException(DOMException.NO_MODIFICATION_ALLOWED_ERR));
	}
	return this._removeChild(_4c59);
};
DOMNamedNodeMap.prototype._findNamedItemIndex = function DOMNamedNodeMap__findNamedItemIndex(
		name) {
	var ret = -1;
	for (var i = 0; i < this._nodes.length; i++) {
		if (this._nodes[i].name == name) {
			ret = i;
			break;
		}
	}
	return ret;
};
DOMNamedNodeMap.prototype._findNamedItemNSIndex = function DOMNamedNodeMap__findNamedItemNSIndex(
		_4c5e, _4c5f) {
	var ret = -1;
	if (_4c5f) {
		for (var i = 0; i < this._nodes.length; i++) {
			if ((this._nodes[i].namespaceURI == _4c5e)
					&& (this._nodes[i].localName == _4c5f)) {
				ret = i;
				break;
			}
		}
	}
	return ret;
};
DOMNamedNodeMap.prototype._hasAttribute = function DOMNamedNodeMap__hasAttribute(
		name) {
	var ret = false;
	var _4c64 = this._findNamedItemIndex(name);
	if (_4c64 > -1) {
		ret = true;
	}
	return ret;
};
DOMNamedNodeMap.prototype._hasAttributeNS = function DOMNamedNodeMap__hasAttributeNS(
		_4c65, _4c66) {
	var ret = false;
	var _4c68 = this._findNamedItemNSIndex(_4c65, _4c66);
	if (_4c68 > -1) {
		ret = true;
	}
	return ret;
};
DOMNamedNodeMap.prototype._cloneNodes = function DOMNamedNodeMap__cloneNodes(
		_4c69) {
	var _4c6a = new DOMNamedNodeMap(this.ownerDocument, _4c69);
	for (var i = 0; i < this._nodes.length; i++) {
		_4c6a._appendChild(this._nodes[i].cloneNode(false));
	}
	return _4c6a;
};
DOMNamedNodeMap.prototype.toString = function DOMNamedNodeMap_toString() {
	var ret = "";
	for (var i = 0; i < this.length - 1; i++) {
		ret += this._nodes[i].toString() + " ";
	}
	if (this.length > 0) {
		ret += this._nodes[this.length - 1].toString();
	}
	return ret;
};
DOMNamespaceNodeMap = function(_4c6e, _4c6f) {
	this._class = addClass(this._class, "DOMNamespaceNodeMap");
	this.DOMNamedNodeMap = DOMNamedNodeMap;
	this.DOMNamedNodeMap(_4c6e, _4c6f);
};
DOMNamespaceNodeMap.prototype = new DOMNamedNodeMap;
DOMNamespaceNodeMap.prototype._findNamedItemIndex = function DOMNamespaceNodeMap__findNamedItemIndex(
		_4c70) {
	var ret = -1;
	for (var i = 0; i < this._nodes.length; i++) {
		if (this._nodes[i].localName == _4c70) {
			ret = i;
			break;
		}
	}
	return ret;
};
DOMNamespaceNodeMap.prototype._cloneNodes = function DOMNamespaceNodeMap__cloneNodes(
		_4c73) {
	var _4c74 = new DOMNamespaceNodeMap(this.ownerDocument, _4c73);
	for (var i = 0; i < this._nodes.length; i++) {
		_4c74._appendChild(this._nodes[i].cloneNode(false));
	}
	return _4c74;
};
DOMNamespaceNodeMap.prototype.toString = function DOMNamespaceNodeMap_toString() {
	var ret = "";
	for (var ind = 0; ind < this._nodes.length; ind++) {
		var ns = null;
		try {
			var ns = this.parentNode.parentNode._namespaces
					.getNamedItem(this._nodes[ind].localName);
		} catch (e) {
			break;
		}
		if (!(ns && ("" + ns.nodeValue == "" + this._nodes[ind].nodeValue))) {
			ret += this._nodes[ind].toString() + " ";
		}
	}
	return ret;
};
DOMNode = function(_4c79) {
	this._class = addClass(this._class, "DOMNode");
	if (_4c79) {
		this._id = _4c79._genId();
	}
	this.namespaceURI = "";
	this.prefix = "";
	this.localName = "";
	this.nodeName = "";
	this.nodeValue = "";
	this.nodeType = 0;
	this.parentNode = null;
	this.childNodes = new DOMNodeList(_4c79, this);
	this.firstChild = null;
	this.lastChild = null;
	this.previousSibling = null;
	this.nextSibling = null;
	this.attributes = new DOMNamedNodeMap(_4c79, this);
	this.ownerDocument = _4c79;
	this._namespaces = new DOMNamespaceNodeMap(_4c79, this);
	this._readonly = false;
};
DOMNode.ELEMENT_NODE = 1;
DOMNode.ATTRIBUTE_NODE = 2;
DOMNode.TEXT_NODE = 3;
DOMNode.CDATA_SECTION_NODE = 4;
DOMNode.ENTITY_REFERENCE_NODE = 5;
DOMNode.ENTITY_NODE = 6;
DOMNode.PROCESSING_INSTRUCTION_NODE = 7;
DOMNode.COMMENT_NODE = 8;
DOMNode.DOCUMENT_NODE = 9;
DOMNode.DOCUMENT_TYPE_NODE = 10;
DOMNode.DOCUMENT_FRAGMENT_NODE = 11;
DOMNode.NOTATION_NODE = 12;
DOMNode.NAMESPACE_NODE = 13;
DOMNode.prototype.hasAttributes = function DOMNode_hasAttributes() {
	if (this.attributes.length == 0) {
		return false;
	} else {
		return true;
	}
};
DOMNode.prototype.getNodeName = function DOMNode_getNodeName() {
	return this.nodeName;
};
DOMNode.prototype.getNodeValue = function DOMNode_getNodeValue() {
	return this.nodeValue;
};
DOMNode.prototype.setNodeValue = function DOMNode_setNodeValue(_4c7a) {
	if (this.ownerDocument.implementation.errorChecking && this._readonly) {
		throw (new DOMException(DOMException.NO_MODIFICATION_ALLOWED_ERR));
	}
	this.nodeValue = _4c7a;
};
DOMNode.prototype.getNodeType = function DOMNode_getNodeType() {
	return this.nodeType;
};
DOMNode.prototype.getParentNode = function DOMNode_getParentNode() {
	return this.parentNode;
};
DOMNode.prototype.getChildNodes = function DOMNode_getChildNodes() {
	return this.childNodes;
};
DOMNode.prototype.getFirstChild = function DOMNode_getFirstChild() {
	return this.firstChild;
};
DOMNode.prototype.getLastChild = function DOMNode_getLastChild() {
	return this.lastChild;
};
DOMNode.prototype.getPreviousSibling = function DOMNode_getPreviousSibling() {
	return this.previousSibling;
};
DOMNode.prototype.getNextSibling = function DOMNode_getNextSibling() {
	return this.nextSibling;
};
DOMNode.prototype.getAttributes = function DOMNode_getAttributes() {
	return this.attributes;
};
DOMNode.prototype.getOwnerDocument = function DOMNode_getOwnerDocument() {
	return this.ownerDocument;
};
DOMNode.prototype.getNamespaceURI = function DOMNode_getNamespaceURI() {
	return this.namespaceURI;
};
DOMNode.prototype.getPrefix = function DOMNode_getPrefix() {
	return this.prefix;
};
DOMNode.prototype.setPrefix = function DOMNode_setPrefix(_4c7b) {
	if (this.ownerDocument.implementation.errorChecking) {
		if (this._readonly) {
			throw (new DOMException(DOMException.NO_MODIFICATION_ALLOWED_ERR));
		}
		if (!this.ownerDocument.implementation._isValidName(_4c7b)) {
			throw (new DOMException(DOMException.INVALID_CHARACTER_ERR));
		}
		if (!this.ownerDocument._isValidNamespace(this.namespaceURI, _4c7b
						+ ":" + this.localName)) {
			throw (new DOMException(DOMException.NAMESPACE_ERR));
		}
		if ((_4c7b == "xmlns")
				&& (this.namespaceURI != "http://www.w3.org/2000/xmlns/")) {
			throw (new DOMException(DOMException.NAMESPACE_ERR));
		}
		if ((_4c7b == "") && (this.localName == "xmlns")) {
			throw (new DOMException(DOMException.NAMESPACE_ERR));
		}
	}
	this.prefix = _4c7b;
	if (this.prefix != "") {
		this.nodeName = this.prefix + ":" + this.localName;
	} else {
		this.nodeName = this.localName;
	}
};
DOMNode.prototype.getLocalName = function DOMNode_getLocalName() {
	return this.localName;
};
DOMNode.prototype.insertBefore = function DOMNode_insertBefore(_4c7c, _4c7d) {
	var _4c7e;
	if (this.ownerDocument.implementation.errorChecking) {
		if (this._readonly) {
			throw (new DOMException(DOMException.NO_MODIFICATION_ALLOWED_ERR));
		}
		if (this.ownerDocument != _4c7c.ownerDocument) {
			throw (new DOMException(DOMException.WRONG_DOCUMENT_ERR));
		}
		if (this._isAncestor(_4c7c)) {
			throw (new DOMException(DOMException.HIERARCHY_REQUEST_ERR));
		}
	}
	if (_4c7d) {
		var _4c7f = this.childNodes._findItemIndex(_4c7d._id);
		if (this.ownerDocument.implementation.errorChecking && (_4c7f < 0)) {
			throw (new DOMException(DOMException.NOT_FOUND_ERR));
		}
		var _4c80 = _4c7c.parentNode;
		if (_4c80) {
			_4c80.removeChild(_4c7c);
		}
		this.childNodes._insertBefore(_4c7c, this.childNodes
						._findItemIndex(_4c7d._id));
		_4c7e = _4c7d.previousSibling;
		if (_4c7c.nodeType == DOMNode.DOCUMENT_FRAGMENT_NODE) {
			if (_4c7c.childNodes._nodes.length > 0) {
				for (var ind = 0; ind < _4c7c.childNodes._nodes.length; ind++) {
					_4c7c.childNodes._nodes[ind].parentNode = this;
				}
				_4c7d.previousSibling = _4c7c.childNodes._nodes[_4c7c.childNodes._nodes.length
						- 1];
			}
		} else {
			_4c7c.parentNode = this;
			_4c7d.previousSibling = _4c7c;
		}
	} else {
		_4c7e = this.lastChild;
		this.appendChild(_4c7c);
	}
	if (_4c7c.nodeType == DOMNode.DOCUMENT_FRAGMENT_NODE) {
		if (_4c7c.childNodes._nodes.length > 0) {
			if (_4c7e) {
				_4c7e.nextSibling = _4c7c.childNodes._nodes[0];
			} else {
				this.firstChild = _4c7c.childNodes._nodes[0];
			}
			_4c7c.childNodes._nodes[0].previousSibling = _4c7e;
			_4c7c.childNodes._nodes[_4c7c.childNodes._nodes.length - 1].nextSibling = _4c7d;
		}
	} else {
		if (_4c7e) {
			_4c7e.nextSibling = _4c7c;
		} else {
			this.firstChild = _4c7c;
		}
		_4c7c.previousSibling = _4c7e;
		_4c7c.nextSibling = _4c7d;
	}
	return _4c7c;
};
DOMNode.prototype.replaceChild = function DOMNode_replaceChild(_4c82, _4c83) {
	var ret = null;
	if (this.ownerDocument.implementation.errorChecking) {
		if (this._readonly) {
			throw (new DOMException(DOMException.NO_MODIFICATION_ALLOWED_ERR));
		}
		if (this.ownerDocument != _4c82.ownerDocument) {
			throw (new DOMException(DOMException.WRONG_DOCUMENT_ERR));
		}
		if (this._isAncestor(_4c82)) {
			throw (new DOMException(DOMException.HIERARCHY_REQUEST_ERR));
		}
	}
	var index = this.childNodes._findItemIndex(_4c83._id);
	if (this.ownerDocument.implementation.errorChecking && (index < 0)) {
		throw (new DOMException(DOMException.NOT_FOUND_ERR));
	}
	var _4c86 = _4c82.parentNode;
	if (_4c86) {
		_4c86.removeChild(_4c82);
	}
	ret = this.childNodes._replaceChild(_4c82, index);
	if (_4c82.nodeType == DOMNode.DOCUMENT_FRAGMENT_NODE) {
		if (_4c82.childNodes._nodes.length > 0) {
			for (var ind = 0; ind < _4c82.childNodes._nodes.length; ind++) {
				_4c82.childNodes._nodes[ind].parentNode = this;
			}
			if (_4c83.previousSibling) {
				_4c83.previousSibling.nextSibling = _4c82.childNodes._nodes[0];
			} else {
				this.firstChild = _4c82.childNodes._nodes[0];
			}
			if (_4c83.nextSibling) {
				_4c83.nextSibling.previousSibling = _4c82;
			} else {
				this.lastChild = _4c82.childNodes._nodes[_4c82.childNodes._nodes.length
						- 1];
			}
			_4c82.childNodes._nodes[0].previousSibling = _4c83.previousSibling;
			_4c82.childNodes._nodes[_4c82.childNodes._nodes.length - 1].nextSibling = _4c83.nextSibling;
		}
	} else {
		_4c82.parentNode = this;
		if (_4c83.previousSibling) {
			_4c83.previousSibling.nextSibling = _4c82;
		} else {
			this.firstChild = _4c82;
		}
		if (_4c83.nextSibling) {
			_4c83.nextSibling.previousSibling = _4c82;
		} else {
			this.lastChild = _4c82;
		}
		_4c82.previousSibling = _4c83.previousSibling;
		_4c82.nextSibling = _4c83.nextSibling;
	}
	return ret;
};
DOMNode.prototype.removeChild = function DOMNode_removeChild(_4c88) {
	if (this.ownerDocument.implementation.errorChecking
			&& (this._readonly || _4c88._readonly)) {
		throw (new DOMException(DOMException.NO_MODIFICATION_ALLOWED_ERR));
	}
	var _4c89 = this.childNodes._findItemIndex(_4c88._id);
	if (this.ownerDocument.implementation.errorChecking && (_4c89 < 0)) {
		throw (new DOMException(DOMException.NOT_FOUND_ERR));
	}
	this.childNodes._removeChild(_4c89);
	_4c88.parentNode = null;
	if (_4c88.previousSibling) {
		_4c88.previousSibling.nextSibling = _4c88.nextSibling;
	} else {
		this.firstChild = _4c88.nextSibling;
	}
	if (_4c88.nextSibling) {
		_4c88.nextSibling.previousSibling = _4c88.previousSibling;
	} else {
		this.lastChild = _4c88.previousSibling;
	}
	_4c88.previousSibling = null;
	_4c88.nextSibling = null;
	return _4c88;
};
DOMNode.prototype.appendChild = function DOMNode_appendChild(_4c8a) {
	if (this.ownerDocument.implementation.errorChecking) {
		if (this._readonly) {
			throw (new DOMException(DOMException.NO_MODIFICATION_ALLOWED_ERR));
		}
		if (this.ownerDocument != _4c8a.ownerDocument) {
			throw (new DOMException(DOMException.WRONG_DOCUMENT_ERR));
		}
		if (this._isAncestor(_4c8a)) {
			throw (new DOMException(DOMException.HIERARCHY_REQUEST_ERR));
		}
	}
	var _4c8b = _4c8a.parentNode;
	if (_4c8b) {
		_4c8b.removeChild(_4c8a);
	}
	this.childNodes._appendChild(_4c8a);
	if (_4c8a.nodeType == DOMNode.DOCUMENT_FRAGMENT_NODE) {
		if (_4c8a.childNodes._nodes.length > 0) {
			for (var ind = 0; ind < _4c8a.childNodes._nodes.length; ind++) {
				_4c8a.childNodes._nodes[ind].parentNode = this;
			}
			if (this.lastChild) {
				this.lastChild.nextSibling = _4c8a.childNodes._nodes[0];
				_4c8a.childNodes._nodes[0].previousSibling = this.lastChild;
				this.lastChild = _4c8a.childNodes._nodes[_4c8a.childNodes._nodes.length
						- 1];
			} else {
				this.lastChild = _4c8a.childNodes._nodes[_4c8a.childNodes._nodes.length
						- 1];
				this.firstChild = _4c8a.childNodes._nodes[0];
			}
		}
	} else {
		_4c8a.parentNode = this;
		if (this.lastChild) {
			this.lastChild.nextSibling = _4c8a;
			_4c8a.previousSibling = this.lastChild;
			this.lastChild = _4c8a;
		} else {
			this.lastChild = _4c8a;
			this.firstChild = _4c8a;
		}
	}
	return _4c8a;
};
DOMNode.prototype.hasChildNodes = function DOMNode_hasChildNodes() {
	return (this.childNodes.length > 0);
};
DOMNode.prototype.cloneNode = function DOMNode_cloneNode(deep) {
	try {
		return this.ownerDocument.importNode(this, deep);
	} catch (e) {
		return null;
	}
};
DOMNode.prototype.normalize = function DOMNode_normalize() {
	var inode;
	var _4c8f = new DOMNodeList();
	if (this.nodeType == DOMNode.ELEMENT_NODE
			|| this.nodeType == DOMNode.DOCUMENT_NODE) {
		var _4c90 = null;
		for (var i = 0; i < this.childNodes.length; i++) {
			inode = this.childNodes.item(i);
			if (inode.nodeType == DOMNode.TEXT_NODE) {
				if (inode.length < 1) {
					_4c8f._appendChild(inode);
				} else {
					if (_4c90) {
						_4c90.appendData(inode.data);
						_4c8f._appendChild(inode);
					} else {
						_4c90 = inode;
					}
				}
			} else {
				_4c90 = null;
				inode.normalize();
			}
		}
		for (var i = 0; i < _4c8f.length; i++) {
			inode = _4c8f.item(i);
			inode.parentNode.removeChild(inode);
		}
	}
};
DOMNode.prototype.isSupported = function DOMNode_isSupported(_4c92, _4c93) {
	return this.ownerDocument.implementation.hasFeature(_4c92, _4c93);
};
DOMNode.prototype.getElementsByTagName = function DOMNode_getElementsByTagName(
		_4c94) {
	return this._getElementsByTagNameRecursive(_4c94,
			new DOMNodeList(this.ownerDocument));
};
DOMNode.prototype._getElementsByTagNameRecursive = function DOMNode__getElementsByTagNameRecursive(
		_4c95, _4c96) {
	if (this.nodeType == DOMNode.ELEMENT_NODE
			|| this.nodeType == DOMNode.DOCUMENT_NODE) {
		if ((this.nodeName == _4c95) || (_4c95 == "*")) {
			_4c96._appendChild(this);
		}
		for (var i = 0; i < this.childNodes.length; i++) {
			_4c96 = this.childNodes.item(i)._getElementsByTagNameRecursive(
					_4c95, _4c96);
		}
	}
	return _4c96;
};
DOMNode.prototype.getXML = function DOMNode_getXML() {
	return this.toString();
};
DOMNode.prototype.getElementsByTagNameNS = function DOMNode_getElementsByTagNameNS(
		_4c98, _4c99) {
	return this._getElementsByTagNameNSRecursive(_4c98, _4c99,
			new DOMNodeList(this.ownerDocument));
};
DOMNode.prototype._getElementsByTagNameNSRecursive = function DOMNode__getElementsByTagNameNSRecursive(
		_4c9a, _4c9b, _4c9c) {
	if (this.nodeType == DOMNode.ELEMENT_NODE
			|| this.nodeType == DOMNode.DOCUMENT_NODE) {
		if (((this.namespaceURI == _4c9a) || (_4c9a == "*"))
				&& ((this.localName == _4c9b) || (_4c9b == "*"))) {
			_4c9c._appendChild(this);
		}
		for (var i = 0; i < this.childNodes.length; i++) {
			_4c9c = this.childNodes.item(i)._getElementsByTagNameNSRecursive(
					_4c9a, _4c9b, _4c9c);
		}
	}
	return _4c9c;
};
DOMNode.prototype._isAncestor = function DOMNode__isAncestor(node) {
	return ((this == node) || ((this.parentNode) && (this.parentNode
			._isAncestor(node))));
};
DOMNode.prototype.importNode = function DOMNode_importNode(_4c9f, deep) {
	var _4ca1;
	this.getOwnerDocument()._performingImportNodeOperation = true;
	try {
		if (_4c9f.nodeType == DOMNode.ELEMENT_NODE) {
			if (!this.ownerDocument.implementation.namespaceAware) {
				_4ca1 = this.ownerDocument.createElement(_4c9f.tagName);
				for (var i = 0; i < _4c9f.attributes.length; i++) {
					_4ca1.setAttribute(_4c9f.attributes.item(i).name,
							_4c9f.attributes.item(i).value);
				}
			} else {
				_4ca1 = this.ownerDocument.createElementNS(_4c9f.namespaceURI,
						_4c9f.nodeName);
				for (var i = 0; i < _4c9f.attributes.length; i++) {
					_4ca1.setAttributeNS(_4c9f.attributes.item(i).namespaceURI,
							_4c9f.attributes.item(i).name, _4c9f.attributes
									.item(i).value);
				}
				for (var i = 0; i < _4c9f._namespaces.length; i++) {
					_4ca1._namespaces._nodes[i] = this.ownerDocument
							.createNamespace(_4c9f._namespaces.item(i).localName);
					_4ca1._namespaces._nodes[i].setValue(_4c9f._namespaces
							.item(i).value);
				}
			}
		} else {
			if (_4c9f.nodeType == DOMNode.ATTRIBUTE_NODE) {
				if (!this.ownerDocument.implementation.namespaceAware) {
					_4ca1 = this.ownerDocument.createAttribute(_4c9f.name);
				} else {
					_4ca1 = this.ownerDocument.createAttributeNS(
							_4c9f.namespaceURI, _4c9f.nodeName);
					for (var i = 0; i < _4c9f._namespaces.length; i++) {
						_4ca1._namespaces._nodes[i] = this.ownerDocument
								.createNamespace(_4c9f._namespaces.item(i).localName);
						_4ca1._namespaces._nodes[i].setValue(_4c9f._namespaces
								.item(i).value);
					}
				}
				_4ca1.setValue(_4c9f.value);
			} else {
				if (_4c9f.nodeType == DOMNode.DOCUMENT_FRAGMENT) {
					_4ca1 = this.ownerDocument.createDocumentFragment();
				} else {
					if (_4c9f.nodeType == DOMNode.NAMESPACE_NODE) {
						_4ca1 = this.ownerDocument
								.createNamespace(_4c9f.nodeName);
						_4ca1.setValue(_4c9f.value);
					} else {
						if (_4c9f.nodeType == DOMNode.TEXT_NODE) {
							_4ca1 = this.ownerDocument
									.createTextNode(_4c9f.data);
						} else {
							if (_4c9f.nodeType == DOMNode.CDATA_SECTION_NODE) {
								_4ca1 = this.ownerDocument
										.createCDATASection(_4c9f.data);
							} else {
								if (_4c9f.nodeType == DOMNode.PROCESSING_INSTRUCTION_NODE) {
									_4ca1 = this.ownerDocument
											.createProcessingInstruction(
													_4c9f.target, _4c9f.data);
								} else {
									if (_4c9f.nodeType == DOMNode.COMMENT_NODE) {
										_4ca1 = this.ownerDocument
												.createComment(_4c9f.data);
									} else {
										throw (new DOMException(DOMException.NOT_SUPPORTED_ERR));
									}
								}
							}
						}
					}
				}
			}
		}
		if (deep) {
			for (var i = 0; i < _4c9f.childNodes.length; i++) {
				_4ca1.appendChild(this.ownerDocument.importNode(
						_4c9f.childNodes.item(i), true));
			}
		}
		this.getOwnerDocument()._performingImportNodeOperation = false;
		return _4ca1;
	} catch (eAny) {
		this.getOwnerDocument()._performingImportNodeOperation = false;
		throw eAny;
	}
};
DOMNode.prototype.__escapeString = function DOMNode__escapeString(str) {
	return __escapeString(str);
};
DOMNode.prototype.__unescapeString = function DOMNode__unescapeString(str) {
	return __unescapeString(str);
};
DOMDocument = function(_4ca5) {
	this._class = addClass(this._class, "DOMDocument");
	this.DOMNode = DOMNode;
	this.DOMNode(this);
	this.doctype = null;
	this.implementation = _4ca5;
	this.documentElement = null;
	this.all = new Array();
	this.nodeName = "#document";
	this.nodeType = DOMNode.DOCUMENT_NODE;
	this._id = 0;
	this._lastId = 0;
	this._parseComplete = false;
	this.ownerDocument = this;
	this._performingImportNodeOperation = false;
};
DOMDocument.prototype = new DOMNode;
DOMDocument.prototype.getDoctype = function DOMDocument_getDoctype() {
	return this.doctype;
};
DOMDocument.prototype.getImplementation = function DOMDocument_implementation() {
	return this.implementation;
};
DOMDocument.prototype.getDocumentElement = function DOMDocument_getDocumentElement() {
	return this.documentElement;
};
DOMDocument.prototype.createElement = function DOMDocument_createElement(_4ca6) {
	if (this.ownerDocument.implementation.errorChecking
			&& (!this.ownerDocument.implementation._isValidName(_4ca6))) {
		throw (new DOMException(DOMException.INVALID_CHARACTER_ERR));
	}
	var node = new DOMElement(this);
	node.tagName = _4ca6;
	node.nodeName = _4ca6;
	this.all[this.all.length] = node;
	return node;
};
DOMDocument.prototype.createDocumentFragment = function DOMDocument_createDocumentFragment() {
	var node = new DOMDocumentFragment(this);
	return node;
};
DOMDocument.prototype.createTextNode = function DOMDocument_createTextNode(data) {
	var node = new DOMText(this);
	node.data = data;
	node.nodeValue = data;
	node.length = data.length;
	return node;
};
DOMDocument.prototype.createComment = function DOMDocument_createComment(data) {
	var node = new DOMComment(this);
	node.data = data;
	node.nodeValue = data;
	node.length = data.length;
	return node;
};
DOMDocument.prototype.createCDATASection = function DOMDocument_createCDATASection(
		data) {
	var node = new DOMCDATASection(this);
	node.data = data;
	node.nodeValue = data;
	node.length = data.length;
	return node;
};
DOMDocument.prototype.createProcessingInstruction = function DOMDocument_createProcessingInstruction(
		_4caf, data) {
	if (this.ownerDocument.implementation.errorChecking
			&& (!this.implementation._isValidName(_4caf))) {
		throw (new DOMException(DOMException.INVALID_CHARACTER_ERR));
	}
	var node = new DOMProcessingInstruction(this);
	node.target = _4caf;
	node.nodeName = _4caf;
	node.data = data;
	node.nodeValue = data;
	node.length = data.length;
	return node;
};
DOMDocument.prototype.createAttribute = function DOMDocument_createAttribute(
		name) {
	if (this.ownerDocument.implementation.errorChecking
			&& (!this.ownerDocument.implementation._isValidName(name))) {
		throw (new DOMException(DOMException.INVALID_CHARACTER_ERR));
	}
	var node = new DOMAttr(this);
	node.name = name;
	node.nodeName = name;
	return node;
};
DOMDocument.prototype.createElementNS = function DOMDocument_createElementNS(
		_4cb4, _4cb5) {
	if (this.ownerDocument.implementation.errorChecking) {
		if (!this.ownerDocument._isValidNamespace(_4cb4, _4cb5)) {
			throw (new DOMException(DOMException.NAMESPACE_ERR));
		}
		if (!this.ownerDocument.implementation._isValidName(_4cb5)) {
			throw (new DOMException(DOMException.INVALID_CHARACTER_ERR));
		}
	}
	var node = new DOMElement(this);
	var qname = this.implementation._parseQName(_4cb5);
	node.nodeName = _4cb5;
	node.namespaceURI = _4cb4;
	node.prefix = qname.prefix;
	node.localName = qname.localName;
	node.tagName = _4cb5;
	this.all[this.all.length] = node;
	return node;
};
DOMDocument.prototype.createAttributeNS = function DOMDocument_createAttributeNS(
		_4cb8, _4cb9) {
	if (this.ownerDocument.implementation.errorChecking) {
		if (!this.ownerDocument._isValidNamespace(_4cb8, _4cb9, true)) {
			throw (new DOMException(DOMException.NAMESPACE_ERR));
		}
		if (!this.ownerDocument.implementation._isValidName(_4cb9)) {
			throw (new DOMException(DOMException.INVALID_CHARACTER_ERR));
		}
	}
	var node = new DOMAttr(this);
	var qname = this.implementation._parseQName(_4cb9);
	node.nodeName = _4cb9;
	node.namespaceURI = _4cb8;
	node.prefix = qname.prefix;
	node.localName = qname.localName;
	node.name = _4cb9;
	node.nodeValue = "";
	return node;
};
DOMDocument.prototype.createNamespace = function DOMDocument_createNamespace(
		_4cbc) {
	var node = new DOMNamespace(this);
	var qname = this.implementation._parseQName(_4cbc);
	node.nodeName = _4cbc;
	node.prefix = qname.prefix;
	node.localName = qname.localName;
	node.name = _4cbc;
	node.nodeValue = "";
	return node;
};
DOMDocument.prototype.getElementById = function DOMDocument_getElementById(
		_4cbf) {
	retNode = null;
	for (var i = 0; i < this.all.length; i++) {
		var node = this.all[i];
		if ((node.id == _4cbf)
				&& (node._isAncestor(node.ownerDocument.documentElement))) {
			retNode = node;
			break;
		}
	}
	return retNode;
};
DOMDocument.prototype._genId = function DOMDocument__genId() {
	this._lastId += 1;
	return this._lastId;
};
DOMDocument.prototype._isValidNamespace = function DOMDocument__isValidNamespace(
		_4cc2, _4cc3, _4cc4) {
	if (this._performingImportNodeOperation == true) {
		return true;
	}
	var valid = true;
	var qName = this.implementation._parseQName(_4cc3);
	if (this._parseComplete == true) {
		if (qName.localName.indexOf(":") > -1) {
			valid = false;
		}
		if ((valid) && (!_4cc4)) {
			if (!_4cc2) {
				valid = false;
			}
		}
		if ((valid) && (qName.prefix == "")) {
			valid = false;
		}
	}
	if ((valid) && (qName.prefix == "xml")
			&& (_4cc2 != "http://www.w3.org/XML/1998/namespace")) {
		valid = false;
	}
	return valid;
};
DOMDocument.prototype.toString = function DOMDocument_toString() {
	return "" + this.childNodes;
};
DOMElement = function(_4cc7) {
	this._class = addClass(this._class, "DOMElement");
	this.DOMNode = DOMNode;
	this.DOMNode(_4cc7);
	this.tagName = "";
	this.id = "";
	this.nodeType = DOMNode.ELEMENT_NODE;
};
DOMElement.prototype = new DOMNode;
DOMElement.prototype.getTagName = function DOMElement_getTagName() {
	return this.tagName;
};
DOMElement.prototype.getAttribute = function DOMElement_getAttribute(name) {
	var ret = "";
	var attr = this.attributes.getNamedItem(name);
	if (attr) {
		ret = attr.value;
	}
	return ret;
};
DOMElement.prototype.setAttribute = function DOMElement_setAttribute(name,
		value) {
	var attr = this.attributes.getNamedItem(name);
	if (!attr) {
		attr = this.ownerDocument.createAttribute(name);
	}
	var value = new String(value);
	if (this.ownerDocument.implementation.errorChecking) {
		if (attr._readonly) {
			throw (new DOMException(DOMException.NO_MODIFICATION_ALLOWED_ERR));
		}
		if (!this.ownerDocument.implementation._isValidString(value)) {
			throw (new DOMException(DOMException.INVALID_CHARACTER_ERR));
		}
	}
	if (this.ownerDocument.implementation._isIdDeclaration(name)) {
		this.id = value;
	}
	attr.value = value;
	attr.nodeValue = value;
	if (value.length > 0) {
		attr.specified = true;
	} else {
		attr.specified = false;
	}
	this.attributes.setNamedItem(attr);
};
DOMElement.prototype.removeAttribute = function DOMElement_removeAttribute(name) {
	return this.attributes.removeNamedItem(name);
};
DOMElement.prototype.getAttributeNode = function DOMElement_getAttributeNode(
		name) {
	return this.attributes.getNamedItem(name);
};
DOMElement.prototype.setAttributeNode = function DOMElement_setAttributeNode(
		_4cd0) {
	if (this.ownerDocument.implementation._isIdDeclaration(_4cd0.name)) {
		this.id = _4cd0.value;
	}
	return this.attributes.setNamedItem(_4cd0);
};
DOMElement.prototype.removeAttributeNode = function DOMElement_removeAttributeNode(
		_4cd1) {
	if (this.ownerDocument.implementation.errorChecking && _4cd1._readonly) {
		throw (new DOMException(DOMException.NO_MODIFICATION_ALLOWED_ERR));
	}
	var _4cd2 = this.attributes._findItemIndex(_4cd1._id);
	if (this.ownerDocument.implementation.errorChecking && (_4cd2 < 0)) {
		throw (new DOMException(DOMException.NOT_FOUND_ERR));
	}
	return this.attributes._removeChild(_4cd2);
};
DOMElement.prototype.getAttributeNS = function DOMElement_getAttributeNS(_4cd3,
		_4cd4) {
	var ret = "";
	var attr = this.attributes.getNamedItemNS(_4cd3, _4cd4);
	if (attr) {
		ret = attr.value;
	}
	return ret;
};
DOMElement.prototype.setAttributeNS = function DOMElement_setAttributeNS(_4cd7,
		_4cd8, value) {
	var attr = this.attributes.getNamedItem(_4cd7, _4cd8);
	if (!attr) {
		attr = this.ownerDocument.createAttributeNS(_4cd7, _4cd8);
	}
	var value = new String(value);
	if (this.ownerDocument.implementation.errorChecking) {
		if (attr._readonly) {
			throw (new DOMException(DOMException.NO_MODIFICATION_ALLOWED_ERR));
		}
		if (!this.ownerDocument._isValidNamespace(_4cd7, _4cd8)) {
			throw (new DOMException(DOMException.NAMESPACE_ERR));
		}
		if (!this.ownerDocument.implementation._isValidString(value)) {
			throw (new DOMException(DOMException.INVALID_CHARACTER_ERR));
		}
	}
	if (this.ownerDocument.implementation._isIdDeclaration(name)) {
		this.id = value;
	}
	attr.value = value;
	attr.nodeValue = value;
	if (value.length > 0) {
		attr.specified = true;
	} else {
		attr.specified = false;
	}
	this.attributes.setNamedItemNS(attr);
};
DOMElement.prototype.removeAttributeNS = function DOMElement_removeAttributeNS(
		_4cdb, _4cdc) {
	return this.attributes.removeNamedItemNS(_4cdb, _4cdc);
};
DOMElement.prototype.getAttributeNodeNS = function DOMElement_getAttributeNodeNS(
		_4cdd, _4cde) {
	return this.attributes.getNamedItemNS(_4cdd, _4cde);
};
DOMElement.prototype.setAttributeNodeNS = function DOMElement_setAttributeNodeNS(
		_4cdf) {
	if ((_4cdf.prefix == "")
			&& this.ownerDocument.implementation._isIdDeclaration(_4cdf.name)) {
		this.id = _4cdf.value;
	}
	return this.attributes.setNamedItemNS(_4cdf);
};
DOMElement.prototype.hasAttribute = function DOMElement_hasAttribute(name) {
	return this.attributes._hasAttribute(name);
};
DOMElement.prototype.hasAttributeNS = function DOMElement_hasAttributeNS(_4ce1,
		_4ce2) {
	return this.attributes._hasAttributeNS(_4ce1, _4ce2);
};
DOMElement.prototype.toString = function DOMElement_toString() {
	var ret = "";
	var ns = this._namespaces.toString();
	if (ns.length > 0) {
		ns = " " + ns;
	}
	var attrs = this.attributes.toString();
	if (attrs.length > 0) {
		attrs = " " + attrs;
	}
	ret += "<" + this.nodeName + ns + attrs + ">";
	ret += this.childNodes.toString();
	ret += "</" + this.nodeName + ">";
	return ret;
};
DOMAttr = function(_4ce6) {
	this._class = addClass(this._class, "DOMAttr");
	this.DOMNode = DOMNode;
	this.DOMNode(_4ce6);
	this.name = "";
	this.specified = false;
	this.value = "";
	this.nodeType = DOMNode.ATTRIBUTE_NODE;
	this.ownerElement = null;
	this.childNodes = null;
	this.attributes = null;
};
DOMAttr.prototype = new DOMNode;
DOMAttr.prototype.getName = function DOMAttr_getName() {
	return this.nodeName;
};
DOMAttr.prototype.getSpecified = function DOMAttr_getSpecified() {
	return this.specified;
};
DOMAttr.prototype.getValue = function DOMAttr_getValue() {
	return this.nodeValue;
};
DOMAttr.prototype.setValue = function DOMAttr_setValue(value) {
	if (this.ownerDocument.implementation.errorChecking && this._readonly) {
		throw (new DOMException(DOMException.NO_MODIFICATION_ALLOWED_ERR));
	}
	this.setNodeValue(value);
};
DOMAttr.prototype.setNodeValue = function DOMAttr_setNodeValue(value) {
	this.nodeValue = new String(value);
	this.value = this.nodeValue;
	this.specified = (this.value.length > 0);
};
DOMAttr.prototype.toString = function DOMAttr_toString() {
	var ret = "";
	ret += this.nodeName + "=\"" + this.__escapeString(this.nodeValue) + "\"";
	return ret;
};
DOMAttr.prototype.getOwnerElement = function() {
	return this.ownerElement;
};
DOMNamespace = function(_4cea) {
	this._class = addClass(this._class, "DOMNamespace");
	this.DOMNode = DOMNode;
	this.DOMNode(_4cea);
	this.name = "";
	this.specified = false;
	this.value = "";
	this.nodeType = DOMNode.NAMESPACE_NODE;
};
DOMNamespace.prototype = new DOMNode;
DOMNamespace.prototype.getValue = function DOMNamespace_getValue() {
	return this.nodeValue;
};
DOMNamespace.prototype.setValue = function DOMNamespace_setValue(value) {
	this.nodeValue = new String(value);
	this.value = this.nodeValue;
};
DOMNamespace.prototype.toString = function DOMNamespace_toString() {
	var ret = "";
	if (this.nodeName != "") {
		ret += this.nodeName + "=\"" + this.__escapeString(this.nodeValue)
				+ "\"";
	} else {
		ret += "xmlns=\"" + this.__escapeString(this.nodeValue) + "\"";
	}
	return ret;
};
DOMCharacterData = function(_4ced) {
	this._class = addClass(this._class, "DOMCharacterData");
	this.DOMNode = DOMNode;
	this.DOMNode(_4ced);
	this.data = "";
	this.length = 0;
};
DOMCharacterData.prototype = new DOMNode;
DOMCharacterData.prototype.getData = function DOMCharacterData_getData() {
	return this.nodeValue;
};
DOMCharacterData.prototype.setData = function DOMCharacterData_setData(data) {
	this.setNodeValue(data);
};
DOMCharacterData.prototype.setNodeValue = function DOMCharacterData_setNodeValue(
		data) {
	if (this.ownerDocument.implementation.errorChecking && this._readonly) {
		throw (new DOMException(DOMException.NO_MODIFICATION_ALLOWED_ERR));
	}
	this.nodeValue = new String(data);
	this.data = this.nodeValue;
	this.length = this.nodeValue.length;
};
DOMCharacterData.prototype.getLength = function DOMCharacterData_getLength() {
	return this.nodeValue.length;
};
DOMCharacterData.prototype.substringData = function DOMCharacterData_substringData(
		_4cf0, count) {
	var ret = null;
	if (this.data) {
		if (this.ownerDocument.implementation.errorChecking
				&& ((_4cf0 < 0) || (_4cf0 > this.data.length) || (count < 0))) {
			throw (new DOMException(DOMException.INDEX_SIZE_ERR));
		}
		if (!count) {
			ret = this.data.substring(_4cf0);
		} else {
			ret = this.data.substring(_4cf0, _4cf0 + count);
		}
	}
	return ret;
};
DOMCharacterData.prototype.appendData = function DOMCharacterData_appendData(
		arg) {
	if (this.ownerDocument.implementation.errorChecking && this._readonly) {
		throw (new DOMException(DOMException.NO_MODIFICATION_ALLOWED_ERR));
	}
	this.setData("" + this.data + arg);
};
DOMCharacterData.prototype.insertData = function DOMCharacterData_insertData(
		_4cf4, arg) {
	if (this.ownerDocument.implementation.errorChecking && this._readonly) {
		throw (new DOMException(DOMException.NO_MODIFICATION_ALLOWED_ERR));
	}
	if (this.data) {
		if (this.ownerDocument.implementation.errorChecking
				&& ((_4cf4 < 0) || (_4cf4 > this.data.length))) {
			throw (new DOMException(DOMException.INDEX_SIZE_ERR));
		}
		this.setData(this.data.substring(0, _4cf4).concat(arg,
				this.data.substring(_4cf4)));
	} else {
		if (this.ownerDocument.implementation.errorChecking && (_4cf4 != 0)) {
			throw (new DOMException(DOMException.INDEX_SIZE_ERR));
		}
		this.setData(arg);
	}
};
DOMCharacterData.prototype.deleteData = function DOMCharacterData_deleteData(
		_4cf6, count) {
	if (this.ownerDocument.implementation.errorChecking && this._readonly) {
		throw (new DOMException(DOMException.NO_MODIFICATION_ALLOWED_ERR));
	}
	if (this.data) {
		if (this.ownerDocument.implementation.errorChecking
				&& ((_4cf6 < 0) || (_4cf6 > this.data.length) || (count < 0))) {
			throw (new DOMException(DOMException.INDEX_SIZE_ERR));
		}
		if (!count || (_4cf6 + count) > this.data.length) {
			this.setData(this.data.substring(0, _4cf6));
		} else {
			this.setData(this.data.substring(0, _4cf6).concat(this.data
					.substring(_4cf6 + count)));
		}
	}
};
DOMCharacterData.prototype.replaceData = function DOMCharacterData_replaceData(
		_4cf8, count, arg) {
	if (this.ownerDocument.implementation.errorChecking && this._readonly) {
		throw (new DOMException(DOMException.NO_MODIFICATION_ALLOWED_ERR));
	}
	if (this.data) {
		if (this.ownerDocument.implementation.errorChecking
				&& ((_4cf8 < 0) || (_4cf8 > this.data.length) || (count < 0))) {
			throw (new DOMException(DOMException.INDEX_SIZE_ERR));
		}
		this.setData(this.data.substring(0, _4cf8).concat(arg,
				this.data.substring(_4cf8 + count)));
	} else {
		this.setData(arg);
	}
};
DOMText = function(_4cfb) {
	this._class = addClass(this._class, "DOMText");
	this.DOMCharacterData = DOMCharacterData;
	this.DOMCharacterData(_4cfb);
	this.nodeName = "#text";
	this.nodeType = DOMNode.TEXT_NODE;
};
DOMText.prototype = new DOMCharacterData;
DOMText.prototype.splitText = function DOMText_splitText(_4cfc) {
	var data, inode;
	if (this.ownerDocument.implementation.errorChecking) {
		if (this._readonly) {
			throw (new DOMException(DOMException.NO_MODIFICATION_ALLOWED_ERR));
		}
		if ((_4cfc < 0) || (_4cfc > this.data.length)) {
			throw (new DOMException(DOMException.INDEX_SIZE_ERR));
		}
	}
	if (this.parentNode) {
		data = this.substringData(_4cfc);
		inode = this.ownerDocument.createTextNode(data);
		if (this.nextSibling) {
			this.parentNode.insertBefore(inode, this.nextSibling);
		} else {
			this.parentNode.appendChild(inode);
		}
		this.deleteData(_4cfc);
	}
	return inode;
};
DOMText.prototype.toString = function DOMText_toString() {
	return this.__escapeString("" + this.nodeValue);
};
DOMCDATASection = function(_4cfe) {
	this._class = addClass(this._class, "DOMCDATASection");
	this.DOMCharacterData = DOMCharacterData;
	this.DOMCharacterData(_4cfe);
	this.nodeName = "#cdata-section";
	this.nodeType = DOMNode.CDATA_SECTION_NODE;
};
DOMCDATASection.prototype = new DOMCharacterData;
DOMCDATASection.prototype.splitText = function DOMCDATASection_splitText(_4cff) {
	var data, inode;
	if (this.ownerDocument.implementation.errorChecking) {
		if (this._readonly) {
			throw (new DOMException(DOMException.NO_MODIFICATION_ALLOWED_ERR));
		}
		if ((_4cff < 0) || (_4cff > this.data.length)) {
			throw (new DOMException(DOMException.INDEX_SIZE_ERR));
		}
	}
	if (this.parentNode) {
		data = this.substringData(_4cff);
		inode = this.ownerDocument.createCDATASection(data);
		if (this.nextSibling) {
			this.parentNode.insertBefore(inode, this.nextSibling);
		} else {
			this.parentNode.appendChild(inode);
		}
		this.deleteData(_4cff);
	}
	return inode;
};
DOMCDATASection.prototype.toString = function DOMCDATASection_toString() {
	var ret = "";
	ret += "<![CDATA[" + this.nodeValue + "]]>";
	return ret;
};
DOMComment = function(_4d02) {
	this._class = addClass(this._class, "DOMComment");
	this.DOMCharacterData = DOMCharacterData;
	this.DOMCharacterData(_4d02);
	this.nodeName = "#comment";
	this.nodeType = DOMNode.COMMENT_NODE;
};
DOMComment.prototype = new DOMCharacterData;
DOMComment.prototype.toString = function DOMComment_toString() {
	var ret = "";
	ret += "<!--" + this.nodeValue + "-->";
	return ret;
};
DOMProcessingInstruction = function(_4d04) {
	this._class = addClass(this._class, "DOMProcessingInstruction");
	this.DOMNode = DOMNode;
	this.DOMNode(_4d04);
	this.target = "";
	this.data = "";
	this.nodeType = DOMNode.PROCESSING_INSTRUCTION_NODE;
};
DOMProcessingInstruction.prototype = new DOMNode;
DOMProcessingInstruction.prototype.getTarget = function DOMProcessingInstruction_getTarget() {
	return this.nodeName;
};
DOMProcessingInstruction.prototype.getData = function DOMProcessingInstruction_getData() {
	return this.nodeValue;
};
DOMProcessingInstruction.prototype.setData = function DOMProcessingInstruction_setData(
		data) {
	this.setNodeValue(data);
};
DOMProcessingInstruction.prototype.setNodeValue = function DOMProcessingInstruction_setNodeValue(
		data) {
	if (this.ownerDocument.implementation.errorChecking && this._readonly) {
		throw (new DOMException(DOMException.NO_MODIFICATION_ALLOWED_ERR));
	}
	this.nodeValue = new String(data);
	this.data = this.nodeValue;
};
DOMProcessingInstruction.prototype.toString = function DOMProcessingInstruction_toString() {
	var ret = "";
	ret += "<?" + this.nodeName + " " + this.nodeValue + " ?>";
	return ret;
};
DOMDocumentFragment = function(_4d08) {
	this._class = addClass(this._class, "DOMDocumentFragment");
	this.DOMNode = DOMNode;
	this.DOMNode(_4d08);
	this.nodeName = "#document-fragment";
	this.nodeType = DOMNode.DOCUMENT_FRAGMENT_NODE;
};
DOMDocumentFragment.prototype = new DOMNode;
DOMDocumentFragment.prototype.toString = function DOMDocumentFragment_toString() {
	var xml = "";
	var _4d0a = this.getChildNodes().getLength();
	for (intLoop = 0; intLoop < _4d0a; intLoop++) {
		xml += this.getChildNodes().item(intLoop).toString();
	}
	return xml;
};
DOMDocumentType = function() {
	alert("DOMDocumentType.constructor(): Not Implemented");
};
DOMEntity = function() {
	alert("DOMEntity.constructor(): Not Implemented");
};
DOMEntityReference = function() {
	alert("DOMEntityReference.constructor(): Not Implemented");
};
DOMNotation = function() {
	alert("DOMNotation.constructor(): Not Implemented");
};
Strings = new Object();
Strings.WHITESPACE = " \t\n\r";
Strings.QUOTES = "\"'";
Strings.isEmpty = function Strings_isEmpty(strD) {
	return (strD == null) || (strD.length == 0);
};
Strings.indexOfNonWhitespace = function Strings_indexOfNonWhitespace(strD, iB,
		iE) {
	if (Strings.isEmpty(strD)) {
		return -1;
	}
	iB = iB || 0;
	iE = iE || strD.length;
	for (var i = iB; i < iE; i++) {
		if (Strings.WHITESPACE.indexOf(strD.charAt(i)) == -1) {
			return i;
		}
	}
	return -1;
};
Strings.lastIndexOfNonWhitespace = function Strings_lastIndexOfNonWhitespace(
		strD, iB, iE) {
	if (Strings.isEmpty(strD)) {
		return -1;
	}
	iB = iB || 0;
	iE = iE || strD.length;
	for (var i = iE - 1; i >= iB; i--) {
		if (Strings.WHITESPACE.indexOf(strD.charAt(i)) == -1) {
			return i;
		}
	}
	return -1;
};
Strings.indexOfWhitespace = function Strings_indexOfWhitespace(strD, iB, iE) {
	if (Strings.isEmpty(strD)) {
		return -1;
	}
	iB = iB || 0;
	iE = iE || strD.length;
	for (var i = iB; i < iE; i++) {
		if (Strings.WHITESPACE.indexOf(strD.charAt(i)) != -1) {
			return i;
		}
	}
	return -1;
};
Strings.replace = function Strings_replace(strD, iB, iE, strF, strR) {
	if (Strings.isEmpty(strD)) {
		return "";
	}
	iB = iB || 0;
	iE = iE || strD.length;
	return strD.substring(iB, iE).split(strF).join(strR);
};
Strings.getLineNumber = function Strings_getLineNumber(strD, iP) {
	if (Strings.isEmpty(strD)) {
		return -1;
	}
	iP = iP || strD.length;
	return strD.substring(0, iP).split("\n").length;
};
Strings.getColumnNumber = function Strings_getColumnNumber(strD, iP) {
	if (Strings.isEmpty(strD)) {
		return -1;
	}
	iP = iP || strD.length;
	var arrD = strD.substring(0, iP).split("\n");
	var _4d22 = arrD[arrD.length - 1];
	arrD.length--;
	var _4d23 = arrD.join("\n").length;
	return iP - _4d23;
};
StringBuffer = function() {
	this._a = new Array();
};
StringBuffer.prototype.append = function StringBuffer_append(d) {
	this._a[this._a.length] = d;
};
StringBuffer.prototype.toString = function StringBuffer_toString() {
	return this._a.join("");
};
draw2d.XMLSerializer = function() {
	alert("do not init this class. Use the static methods instead");
};
draw2d.XMLSerializer.toXML = function(obj, _48e3, _48e4) {
	if (_48e3 == undefined) {
		_48e3 = "model";
	}
	_48e4 = _48e4 ? _48e4 : "";
	var t = draw2d.XMLSerializer.getTypeName(obj);
	var s = _48e4 + "<" + _48e3 + " type=\"" + t + "\">";
	switch (t) {
		case "int" :
		case "number" :
		case "string" :
		case "boolean" :
			s += obj;
			break;
		case "date" :
			s += obj.toLocaleString();
			break;
		case "Array" :
		case "array" :
			s += "\n";
			for (var i = 0; i < obj.length; i++) {
				s += draw2d.XMLSerializer.toXML(obj[i], ("index" + i), _48e4
								+ "   ");
			}
			s += _48e4;
			break;
		default :
			if (obj != null) {
				s += "\n";
				if (obj instanceof draw2d.ArrayList) {
					obj.trimToSize();
				}
				var _48e8 = obj.getPersistentAttributes();
				for (var name in _48e8) {
					s += draw2d.XMLSerializer.toXML(_48e8[name], name, _48e4
									+ "   ");
				}
				s += _48e4;
			}
			break;
	}
	s += "</" + _48e3 + ">\n";
	return s;
};
draw2d.XMLSerializer.isSimpleVar = function(t) {
	switch (t) {
		case "int" :
		case "string" :
		case "String" :
		case "Number" :
		case "number" :
		case "Boolean" :
		case "boolean" :
		case "bool" :
		case "dateTime" :
		case "Date" :
		case "date" :
		case "float" :
			return true;
	}
	return false;
};
draw2d.XMLSerializer.getTypeName = function(obj) {
	if (obj == null) {
		return "undefined";
	}
	if (obj instanceof Array) {
		return "Array";
	}
	if (obj instanceof Date) {
		return "Date";
	}
	var t = typeof(obj);
	if (t == "number") {
		return (parseInt(obj).toString() == obj) ? "int" : "number";
	}
	if (draw2d.XMLSerializer.isSimpleVar(t)) {
		return t;
	}
	return obj.type.replace("@" + "NAMESPACE" + "@", "");
};
draw2d.XMLDeserializer = function() {
	alert("do not init this class. Use the static methods instead");
};
draw2d.XMLDeserializer.fromXML = function(node, _4d75) {
	var _4d76 = "" + node.getAttributes().getNamedItem("type").getNodeValue();
	var value = node.getNodeValue();
	switch (_4d76) {
		case "int" :
			return parseInt("" + node.getChildNodes().item(0).getNodeValue());
		case "string" :
		case "String" :
			return "" + node.getChildNodes().item(0).getNodeValue();
		case "Number" :
		case "number" :
			return parseFloat("" + node.getChildNodes().item(0).getNodeValue());
		case "Boolean" :
		case "boolean" :
		case "bool" :
			return parseBool("" + node.getChildNodes().item(0).getNodeValue());
		case "dateTime" :
		case "Date" :
		case "date" :
			return new Date("" + node.getChildNodes().item(0).getNodeValue());
		case "float" :
			return parseFloat("" + node.getChildNodes().item(0).getNodeValue());
			break;
	}
	_4d76 = _4d76.replace("@NAMESPACE" + "@", "");
	var obj = eval("new " + _4d76 + "()");
	if (_4d75 != undefined && obj.setModelParent != undefined) {
		obj.setModelParent(_4d75);
	}
	var _4d79 = node.getChildNodes();
	for (var i = 0; i < _4d79.length; i++) {
		var child = _4d79.item(i);
		var _4d7c = child.getNodeName();
		if (obj instanceof Array) {
			_4d7c = parseInt(_4d7c.replace("index", ""));
		}
		obj[_4d7c] = draw2d.XMLDeserializer.fromXML(child,
				obj instanceof draw2d.AbstractObjectModel ? obj : _4d75);
	}
	return obj;
};
draw2d.EditPolicy = function(_5a2d) {
	this.policy = _5a2d;
};
draw2d.EditPolicy.DELETE = "DELETE";
draw2d.EditPolicy.MOVE = "MOVE";
draw2d.EditPolicy.CONNECT = "CONNECT";
draw2d.EditPolicy.RESIZE = "RESIZE";
draw2d.EditPolicy.prototype.type = "draw2d.EditPolicy";
draw2d.EditPolicy.prototype.getPolicy = function() {
	return this.policy;
};