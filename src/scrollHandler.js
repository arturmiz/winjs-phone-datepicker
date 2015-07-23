define(['winjs'], function (WinJS) {
    "use strict";

    var itemHeight = 130;

    function ScrollHandler(repeater, scrollableElement, defaultValueIndex) {
        this.repeater = repeater;
        this.value = WinJS.Binding.as({
            index: defaultValueIndex
        });
        this.scrollableElement = scrollableElement;

        this.init();
    }

    ScrollHandler.prototype.init = function () {
        var self = this;

        self.moveToItem(self.value.index);

        self.scrollableElement.onfocus = self.onfocus.bind(self);
        self.scrollableElement.onblur = self.onblur.bind(self);
        self.scrollableElement.onscroll = self.onScroll.bind(self);
        self.scrollableElement.onclick = self.onClickItem.bind(self);
    };

    ScrollHandler.prototype.dispose = function () {
        this.scrollableElement.onfocus = null;
        this.scrollableElement.onblur = null;
        this.scrollableElement.onclick = null;
        this.scrollableElement.onscroll = null;
        this.scrollableElement = null;
        this.repeater = null;
    };

    ScrollHandler.prototype.onfocus = function () {
        if (!WinJS.Utilities.hasClass(this.scrollableElement, "active")) {
            WinJS.Utilities.addClass(this.scrollableElement, "active");
        }
    };

    ScrollHandler.prototype.onblur = function () {
        if (WinJS.Utilities.hasClass(this.scrollableElement, "active")) {
            WinJS.Utilities.removeClass(this.scrollableElement, "active");
        }
    };

    ScrollHandler.prototype.moveToItem = function (itemIndex) {
        var self = this,
            itemElement = self.repeater.elementFromIndex(itemIndex),
            newPosition;

        if (!itemElement) {
            return;
        }

        newPosition = itemIndex * itemHeight;
        self.scrollableElement.scrollTop = newPosition;
        self.selectItem(itemIndex);
    };

    ScrollHandler.prototype.selectItem = function (itemIndex) {
        var self = this,
            itemElement = self.repeater.elementFromIndex(itemIndex),
            oldItemElement;

        if (!itemElement) {
            return;
        }

        oldItemElement = self.repeater.elementFromIndex(self.value.index);
        if (oldItemElement) {
            WinJS.Utilities.removeClass(oldItemElement, "selected");
        }

        WinJS.Utilities.addClass(itemElement, "selected");
        self.value.index = itemIndex;
    };

    ScrollHandler.prototype.onScroll = function (/*ev*/) {
        var self = this,
            scrollDistance = self.scrollableElement.scrollTop,
            itemIndex = Math.round(scrollDistance / itemHeight);

        self.selectItem(itemIndex);
    };

    ScrollHandler.prototype.onClickItem = function (ev) {
        var clickElement = ev.target,
            clickParentElement = clickElement.parentElement,
            repeaterItems = this.repeater.element.children,
            clickItemIndex = null,
            i, childNode;

        for (i = 0; i < repeaterItems.length; i++) {
            childNode = repeaterItems[i];

            if (clickItemIndex === null && (childNode === clickElement || childNode === clickParentElement)) {
                clickItemIndex = i;
            }
        }

        this.moveToItem(clickItemIndex);
    };

    ScrollHandler.prototype.getIndex = function () {
        return this.value.index;
    };

    return ScrollHandler;
});