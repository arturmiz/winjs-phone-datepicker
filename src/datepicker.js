define(['winjs', 'windows', './scrollHandler'], function (WinJS, Windows, ScrollHandler) {
    "use strict";

    var PhoneDatePicker,
        datepickerClassName = "winjs-phone-datepicker",
        containerClassName = "container",
        doubleColsLayoutClassName = "l-container2",
        tripleColsLayoutClassName = "l-container3";

    PhoneDatePicker = WinJS.Class.define(function (element, options) {
        var calendar;

        options = options || {};
        this.isDayOn = !!options.day;

        this.element = element || document.createElement("div");
        this.element.className = datepickerClassName;
        this.element.winControl = this;
        
        WinJS.Utilities.markDisposable(this.element, this.dispose.bind(this));

        calendar = new Windows.Globalization.Calendar();

        if (options.date) {
            calendar.setDateTime(options.date);
        }

        this.context = {
            day: calendar.day,
            month: calendar.month - 1,
            year: calendar.year
        };

        this.buildMarkup();
    }, {
        buildMarkup: function () {
            this.buildLayoutMarkup();
            this.buildDayMarkup();
            this.buildMonthMarkup();
            this.buildYearMarkup();

            this.enableYearSelect();
            this.enableMonthSelect();
            this.enableDaySelect();
        },

        generateDays: function () {
            var days = [],
                calendar, d, numberOfDaysInThisMonth;

            calendar = new Windows.Globalization.Calendar();
            calendar.setDateTime(new Date(this.context.year, this.context.month, 1, 0, 0, 0, 0));
            numberOfDaysInThisMonth = calendar.numberOfDaysInThisMonth;

            for (d = 0; d < numberOfDaysInThisMonth; d++) {
                days.push({
                    value: d+1,
                    label: calendar.dayOfWeekAsSoloString(),
                    labelNumber: calendar.dayAsPaddedString(2)
                });

                calendar.addDays(1);
            }

            return days;
        },

        generateMonths: function () {
            var months = [],
                calendar, m;

            calendar = new Windows.Globalization.Calendar();
            calendar.setDateTime(new Date(this.context.year, 0, 1, 0, 0, 0, 0));
            
            for (m = 0; m < 12; m++) {
                months.push({
                    value: m,
                    label: calendar.monthAsSoloString(),
                    labelNumber: calendar.monthAsPaddedNumericString(2)
                });

                calendar.addMonths(1);
            }

            return months;
        },

        generateYears: function () {
            var years = [],
                calendar = new Windows.Globalization.Calendar(),
                baseYear = this.context.year - 5,
                y;

            for (y = baseYear; y < calendar.year + 1; y++) {
                years.push({
                    value: y,
                    labelNumber: y
                });
            }

            return years;
        },

        buildLayoutMarkup: function () {
            var containerElement = document.createElement("div");
            var layoutClass = (this.isDayOn) ? tripleColsLayoutClassName : doubleColsLayoutClassName;
            containerElement.className = containerClassName + " " + layoutClass;
            this._body = containerElement;
            this.element.appendChild(this._body);
        },

        buildDayMarkup: function(){
            if (!this.isDayOn) { return; }

            var scrollableElement = this._buildScrollableElement();
            var selectorElement = this._buildSelectorElement(scrollableElement);
            this._body.appendChild(scrollableElement);

            this.dayScrollableElement = scrollableElement;
            this.daySelectorElement = selectorElement;
        },

        enableDaySelect: function () {
            var self = this,
                days, repeaterList, repeater, yearIndexSub, monthIndexSub;

            if (!this.isDayOn) { return; }

            days = this.generateDays();
            repeaterList = new WinJS.Binding.List(days, { proxy: true });
            repeater = new WinJS.UI.Repeater(this.daySelectorElement, {
                data: repeaterList,
                template: this._optionTemplate
            });

            this.days = days;
            this.daysScroll = new ScrollHandler(repeater, this.dayScrollableElement, this.context.day - 1);

            function updateList(list, arr) {
                while (list.length !== 0) {
                    list.pop();
                }

                arr.forEach(function (item) {
                    list.push(item);
                });
            }

            function refresh() {
                var oldIndex = self.daysScroll.getIndex();                
                var newDays = self.generateDays();
                var newLastIndex = newDays.length - 1;
                var newIndex = (oldIndex > newLastIndex) ? newLastIndex : oldIndex;

                updateList(repeaterList, newDays);
                self.daysScroll.moveToItem(newIndex);
            }

            yearIndexSub = WinJS.Binding.bind(this.yearScroll.value, {
                index: function (newValue, oldValue) {
                    if (!oldValue) { return; }
                    var year = self.getYear();
                    self.context.year = year.value;
                    refresh();
               }
            });

            monthIndexSub = WinJS.Binding.bind(this.monthScroll.value, {
                index: function (newValue, oldValue) {
                    if (!oldValue) { return; }
                    var month = self.getMonth();
                    self.context.month = month.value;
                    refresh();
                }
            });
            
        },

        buildMonthMarkup: function(){
            var scrollableElement = this._buildScrollableElement();
            var selectorElement = this._buildSelectorElement(scrollableElement);
            this._body.appendChild(scrollableElement);

            this.monthScrollableElement = scrollableElement;
            this.monthSelectorElement = selectorElement;
        },

        enableMonthSelect: function () {
            var months = this.generateMonths();
            var repeaterList = new WinJS.Binding.List(months, { proxy: true });
            var repeater = new WinJS.UI.Repeater(this.monthSelectorElement, {
                data: repeaterList,
                template: this._optionTemplate
            });

            this.months = months;
            this.monthScroll = new ScrollHandler(repeater, this.monthScrollableElement, this.context.month);
        },

        buildYearMarkup: function(){
            var scrollableElement = this._buildScrollableElement();
            var selectorElement = this._buildSelectorElement(scrollableElement);
            this._body.appendChild(scrollableElement);

            this.yearScrollableElement = scrollableElement;
            this.yearSelectorElement = selectorElement;
        },

        enableYearSelect: function () {
            var self = this,
                defaultYear, years, repeater, repeaterList,
                defaultYearIndex = 0;

            years = this.generateYears();
            defaultYear = years.filter(function (year) {
                return year.value === self.context.year;
            });

            if (defaultYear.length > 0) {
                defaultYearIndex = years.indexOf(defaultYear[0]);
            }

            repeaterList = new WinJS.Binding.List(years, { proxy: true });
            repeater = new WinJS.UI.Repeater(this.yearSelectorElement, {
                data: repeaterList,
                template: this._optionTemplate
            });

            this.years = years;
            this.yearScroll = new ScrollHandler(repeater, this.yearScrollableElement, defaultYearIndex);
        },

        _buildScrollableElement: function () {
            var element = document.createElement("div");
            element.className = "scrollable";
            return element;
        },

        _buildSelectorElement: function (scrollableElement) {
            var element = document.createElement("div");
            element.className = "list";
            scrollableElement.appendChild(element);
            return element;
        },

        _optionTemplate: function (data) {
            var option, number, label;

            option = document.createElement("article");
            number = document.createElement("h2");
            number.innerText = data.labelNumber;
            option.appendChild(number);

            label = document.createElement("h4");
            if (data.label !== undefined && data.label !== null) {
                label.innerText = data.label;
            }
            option.appendChild(label);

            return option;
        },

        getDay: function(){
            if (!this.isDayOn) {
                return null;
            }

            return this.days[this.daysScroll.getIndex()];
        },
    
        getYear: function () {
            return this.years[this.yearScroll.getIndex()];
        },

        getMonth: function () {
            return this.months[this.monthScroll.getIndex()];
        },

        getDate: function () {
            var chosenYear = this.getYear().value,
                chosenMonth = this.getMonth().value,
                chosenDay = (this.isDayOn) ? this.getDay().value : 1;
            return new Date(Date.UTC(chosenYear, chosenMonth, chosenDay, 0, 0, 0, 0));
        },

        dispose: function () {
            if (this.daysScroll) {
                this.daysScroll.dispose();
                this.daysScroll = null;
                this.days = null;
                this.daySelectorElement = null;
                this.dayScrollableElement = null;
            }
            
            this.monthScroll.dispose();
            this.monthScroll = null;
            this.months = null;
            this.monthSelectorElement = null;
            this.monthScrollableElement = null;

            this.yearScroll.dispose();
            this.yearScroll = null;
            this.years = null;
            this.yearSelectorElement = null;
            this.yearScrollableElement = null;
            
            this.element.removeChild(this._body);
            this._body = null;
        }

    });

    WinJS.Class.mix(PhoneDatePicker, WinJS.UI.DOMEventMixin);

    return PhoneDatePicker;
});