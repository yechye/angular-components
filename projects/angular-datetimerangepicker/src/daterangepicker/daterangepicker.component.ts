/* eslint-disable @angular-eslint/no-conflicting-lifecycle */
import {
  Component,
  DoCheck,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  OnChanges,
  OnInit,
  Output,
} from '@angular/core';
import { DateTime } from 'luxon';
import defaults from '../defaults';
import { isLargeDesktop, isTouch } from '../helper';
import { DefinedDateRange, Options } from '../types';

declare var window: any;

@Component({
  selector: 'lib-daterangepicker',
  templateUrl: './daterangepicker.component.html',
})
export class DaterangepickerComponent implements OnInit, DoCheck, OnChanges {
  // #region Inputs to component
  @Input() options: Options;
  @Input() class: string;
  // #endregion

  // #region output events from component
  @Output() rangeSelected = new EventEmitter();
  // #endregion

  // #region all component variables
  showCalendars: boolean;
  range = '';
  enableApplyButton = false;
  areOldDatesStored = false;
  fromDate: DateTime;
  toDate: DateTime;
  tempFromDate: DateTime;
  tempToDate: DateTime;
  oldFromDate: DateTime;
  oldToDate: DateTime;
  fromMonth: number;
  toMonth: number;
  fromYear: number;
  toYear: number;
  format: string;
  derivedOptions: Options;
  isLargeDesktop = false;
  // #endregion

  // #region inside out side click handler
  @HostListener('document:mousedown', ['$event'])
  @HostListener('document:mouseup', ['$event'])
  @HostListener('document:keyup', ['$event'])
  handleOutsideClick(event: { target: any; key: string; }) {
    if (!this.derivedOptions.disabled) {
      const current: any = event.target;
      const host: any = this.elem.nativeElement;
      if (
        host.compareDocumentPosition(current) &
        window.Node.DOCUMENT_POSITION_CONTAINED_BY
      ) {
        if (event.key === 'Escape') {
          return this.toggleCalendars(false);
        }
        this.storeOldDates();
        return this.toggleCalendars(true);
      }
      if (this.showCalendars) {
        if (!this.derivedOptions.autoApply) {
          this.restoreOldDates();
        }
        return this.toggleCalendars(false);
      }
    }
  }
  // #endregion

  // #region constructor
  constructor(private elem: ElementRef<HTMLElement>) { }
  // #endregion

  // #region Component Life cycle handlers
  ngDoCheck() {
    this.deriveOptions(true);
  }
  ngOnChanges() {
    this.initialize();
  }
  ngOnInit(): void {
    this.initialize();
    window.onresize = () => {
      this.isLargeDesktop = isLargeDesktop();
    };
    this.elem.nativeElement.setAttribute('class', '');
  }
  // #endregion

  // #region Initilizers / configuration handlers
  initialize() {
    // get default options provided by user
    this.deriveOptions();
    this.validateMinMaxDates();
    this.setFromDate(this.derivedOptions.startDate);
    this.setToDate(this.derivedOptions.endDate);
    // update calendar grid
    this.updateCalendar();
  }
  deriveOptions(isUpdate: boolean = false) {
    if (isUpdate) {
      const {
        startDate,
        endDate,
        minDate,
        maxDate,
        ...restOptions
      } = this.options;
      this.derivedOptions = {
        ...new Options(),
        ...this.derivedOptions,
        ...restOptions,
      };
    } else {
      this.derivedOptions = {
        ...new Options(),
        ...this.options,
      };
    }
    this.isLargeDesktop = isLargeDesktop();
    if (isNaN(this.fromMonth)) {
      this.fromMonth = DateTime.now().get('month');
    }
    if (isNaN(this.fromYear)) {
      this.fromYear = DateTime.now().get('year');
    }
    if (isNaN(this.toMonth)) {
      this.toMonth = DateTime.now().get('month');
    }
    if (isNaN(this.toYear)) {
      this.toYear = DateTime.now().get('year');
    }
    this.derivedOptions.weekStartsOn =
      Math.abs(this.derivedOptions.weekStartsOn) % 7;
    if (this.derivedOptions.noDefaultRangeSelected) {
      this.derivedOptions.startDate = null;
      this.derivedOptions.endDate = null;
    }
    if (this.derivedOptions.singleCalendar) {
      this.derivedOptions.autoApply = true;
      this.derivedOptions.endDate = null;
    }
    if (this.derivedOptions.timePicker) {
      this.derivedOptions.autoApply = false;
    }
    if (this.derivedOptions.alwaysOpen) {
      this.derivedOptions.position = null;
    }
    if (!this.derivedOptions.displayFormat) {
      this.derivedOptions.displayFormat = this.derivedOptions.format;
    }
    if (this.derivedOptions.addTouchSupport && isTouch) {
      this.derivedOptions.alwaysOpen = false;
    }
    if (
      this.derivedOptions.showRanges &&
      !this.derivedOptions.preDefinedRanges
    ) {
      this.derivedOptions.preDefinedRanges = defaults.ranges;
    }
    if (window.innerWidth > 600) {
      if (this.derivedOptions.position === 'left') {
        const spaceToRight =
          window.innerWidth -
          this.elem.nativeElement.getBoundingClientRect().left;
        if (spaceToRight < 500) {
          this.derivedOptions.position = 'right';
        }
      } else if (this.derivedOptions.position === 'right') {
        if (this.elem.nativeElement.getBoundingClientRect().right < 500) {
          this.derivedOptions.position = 'left';
        }
      }
    }
  }
  // #endregion

  // #region date setters and getters
  setFromDate(value: DateTime) {
    if (this.derivedOptions.noDefaultRangeSelected && !value) {
      this.fromDate = null;
      this.tempFromDate = this.getActualFromDate(value);
    } else {
      this.fromDate = this.getActualFromDate(value);
    }
  }
  getActualFromDate(value: DateTime) {
    let temp;
    if ((temp = this.getValidateDateTime(value))) {
      return this.getValidateFromDate(temp);
    }
    return this.getValidateFromDate(DateTime.now());
  }
  setToDate(value: DateTime) {
    if (this.derivedOptions.noDefaultRangeSelected && !value) {
      this.toDate = null;
      this.tempToDate = this.getActualToDate(value);
    } else {
      this.toDate = this.getActualToDate(value);
    }
  }
  getActualToDate(value: DateTime) {
    let temp: DateTime;
    if ((temp = this.getValidateDateTime(value))) {
      return this.getValidateToDate(temp);
    }
    return this.getValidateToDate(DateTime.now());
  }
  // #endregion

  // #region Validators
  validateMinMaxDates() {
    if (this.derivedOptions) {
      // only mindate is suppplied
      if (this.derivedOptions.minDate && !this.derivedOptions.maxDate) {
        this.derivedOptions.minDate = this.getDateTime(
          this.derivedOptions.minDate
        );
      }
      // only maxdate is supplied
      if (!this.derivedOptions.minDate && this.derivedOptions.maxDate) {
        this.derivedOptions.maxDate = this.getDateTime(
          this.derivedOptions.maxDate
        );
      }
      // both min and max dates are supplied
      if (this.derivedOptions.minDate && this.derivedOptions.maxDate) {
        this.derivedOptions.minDate = this.getDateTime(
          this.derivedOptions.minDate
        );
        this.derivedOptions.maxDate = this.getDateTime(
          this.derivedOptions.maxDate
        );
        if (
          this.derivedOptions.maxDate < this.derivedOptions.minDate.startOf('day')
        ) {
          this.derivedOptions.minDate = null;
          this.derivedOptions.maxDate = null;
          console.warn(
            'supplied minDate is after maxDate. Discarding options for minDate and maxDate'
          );
        }
      }
      if (
        this.derivedOptions.minDate &&
        this.derivedOptions.minDate.toFormat('HH:mm') === '00:00'
      ) {
        this.derivedOptions.minDate.set({ hour: 0, minute: 0, second: 0 });
      }
      if (
        this.derivedOptions.maxDate &&
        this.derivedOptions.maxDate.toFormat('HH:mm') === '00:00'
      ) {
        this.derivedOptions.minDate.set({ hour: 23, minute: 59, second: 59 });
      }
    }
  }
  getValidateFromDate(value: DateTime) {
    if (!this.derivedOptions.timePicker) {
      if (
        this.derivedOptions.minDate &&
        this.derivedOptions.maxDate &&
        value >= this.derivedOptions.minDate.startOf('day') &&
        value <= this.derivedOptions.maxDate.startOf('day')
      ) {
        return value;
      }
      if (
        this.derivedOptions.minDate &&
        !this.derivedOptions.maxDate &&
        value > this.derivedOptions.minDate.startOf('day')
      ) {
        return value;
      }
      if (this.derivedOptions.minDate) {
        return DateTime.fromMillis(this.derivedOptions.minDate.valueOf());
      }
      return DateTime.now();
    } else {
      if (
        this.derivedOptions.minDate &&
        this.derivedOptions.maxDate &&
        value >= this.derivedOptions.minDate.startOf('day') &&
        value <= this.derivedOptions.maxDate.startOf('day')
      ) {
        return value;
      }
      if (
        this.derivedOptions.minDate &&
        !this.derivedOptions.maxDate &&
        value > this.derivedOptions.minDate.startOf('day')
      ) {
        return value;
      }
      if (this.derivedOptions.minDate) {
        return DateTime.fromMillis(this.derivedOptions.minDate.valueOf());
      }
      return DateTime.now();
    }
  }
  getValidateToDate(value: DateTime) {
    if (!this.derivedOptions.timePicker) {
      if (
        (this.derivedOptions.maxDate &&
          value >= this.fromDate.startOf('day') &&
          value <= this.derivedOptions.maxDate.startOf('day'))
      ) {
        return value; 
      }
      if (this.derivedOptions.maxDate) {
        return DateTime.fromMillis(this.derivedOptions.maxDate.valueOf());
      }
      return DateTime.now();
    } else {
      if (
        (this.derivedOptions.maxDate &&
          value >= this.fromDate.startOf('day') &&
          value <= this.derivedOptions.maxDate.startOf('day'))
      ) {
        return value;
      }
      if (this.derivedOptions.maxDate) {
        return DateTime.fromMillis(this.derivedOptions.maxDate.valueOf());
      }
      return DateTime.now();
    }
  }
  // #endregion

  // #region util functions
  getDateTime(value: string | DateTime) {
    if (typeof value === 'string') {
      return DateTime.fromFormat(value, this.derivedOptions.format);
    }

    return DateTime.fromMillis(value.valueOf());
  }
  getValidateDateTime(value: string | DateTime) {
    if (!value) {
      return null;
    }
    
    const DateTimeValue = typeof value === 'string' ?
      DateTime.fromFormat(value, this.derivedOptions.format) :
      DateTime.fromMillis(value?.valueOf());
    return DateTimeValue.isValid ? DateTimeValue : null;
  }
  // #endregion

  // #region date formatters
  formatFromDate(event) {
    if (
      event.target.value !== this.fromDate.toFormat(this.derivedOptions.format)
    ) {
      this.dateChanged({
        day: event.target.value ? this.getDateTime(event.target.value) : DateTime.now(),
        isLeft: true,
      });
    }
  }
  formatToDate(event) {
    if (event.target.value !== this.toDate.toFormat(this.derivedOptions.format)) {
      this.dateChanged({
        day: event.target.value ? this.getDateTime(event.target.value) : DateTime.now(),
        isLeft: false,
      });
    }
  }
  // #endregion

  // #region Child component event handlers
  scrollTop() {
    const flyout = this.elem.nativeElement.querySelector('.drp-flyout');
    flyout.scrollBy(0, 300);
  }
  dateChanged(data: { day: DateTime; isLeft: boolean }) {
    let value = data.day;
    const isLeft = data.isLeft;
    if (isLeft) {
      if (!this.derivedOptions.timePicker) {
        value = value.set({ hour: 0, minute: 0, second: 0 });
      }
      this.fromDate = value;
      if (!this.derivedOptions.timePicker) {
        if (value.get('day') < this.toDate.get('day')) {
          this.toDate = DateTime.fromMillis(this.fromDate.valueOf());
        }
      } else {
        if (value > this.toDate) {
          this.toDate = DateTime.fromMillis(this.fromDate.valueOf());
        }
      }
    } else {
      if (!this.derivedOptions.timePicker) {
        value = value.set({ hour: 23, minute: 59, second: 59 });
      }
      this.toDate = value;
      this.toYear = this.toDate.get('year');
      if (!this.derivedOptions.timePicker) {
        if (value < this.fromDate.startOf('day')) {
          this.fromDate = DateTime.fromMillis(this.toDate.valueOf());
        }
      } else {
        if (value < DateTime.fromFormat(this.fromDate.toFormat(this.derivedOptions.format), this.derivedOptions.format)) {
          this.fromDate = DateTime.fromMillis(this.toDate.valueOf());
        }
      }
    }
    if (this.derivedOptions.autoApply) {
      if (this.derivedOptions.singleCalendar || !isLeft) {
        this.toggleCalendars(false);
        this.setRange();
        this.emitRangeSelected();
      }
    } else if (
      !this.derivedOptions.singleCalendar &&
      this.fromDate &&
      this.fromDate.isValid &&
      this.toDate &&
      this.toDate.isValid
    ) {
      this.enableApplyButton = true;
    } else if (this.derivedOptions.singleCalendar) {
      this.enableApplyButton = true;
    }
    this.fromMonth = this.fromDate
      ? this.fromDate.get('month')
      : this.fromMonth;
    this.toMonth = this.toDate ? this.toDate.get('month') : this.toMonth;
    this.fromYear = this.fromDate ? this.fromDate.get('year') : this.fromYear;
    if (!this.toDate && this.fromDate) {
      this.toYear = this.fromYear;
      this.toMonth = this.fromMonth;
    }
    if (this.toYear < this.fromYear) {
      this.toYear = this.fromYear;
    }
  }
  monthChanged(data) {
    let temp;
    if (!isTouch) {
      if (data.isLeft) {
        temp = DateTime.now()
          .set({ year: this.fromYear, month: this.fromMonth })
          .plus({ month: data.value });
        this.fromMonth = temp.get('month');
        this.fromYear = temp.get('year');
      } else {
        temp = DateTime.now()
          .set({ year: this.toYear, month: this.toMonth })
          .plus({ month: data.value });
        this.toMonth = temp.get('month');
        this.toYear = temp.get('year');
      }
    } else {
      if (data.isLeft) {
        this.fromMonth = data.value;
      } else {
        this.toMonth = data.value;
      }
    }
  }
  yearChanged(data) {
    if (data.isLeft) {
      this.fromYear = data.value;
    } else {
      this.toYear = data.value;
    }
  }
  // #endregion

  // #region side effect handlers of user actions
  emitRangeSelected() {
    let data = {};
    if (this.derivedOptions.singleCalendar) {
      data = {
        start: this.getDateTime(this.fromDate),
      };
    } else {
      data = {
        start: this.getDateTime(this.fromDate),
        end: this.getDateTime(this.toDate),
      };
    }
    this.enableApplyButton = false;
    this.rangeSelected.emit(data);
  }
  storeOldDates() {
    if (!this.areOldDatesStored) {
      this.oldFromDate = this.fromDate;
      this.oldToDate = this.toDate;
      this.areOldDatesStored = true;
    }
  }
  restoreOldDates() {
    this.fromDate = this.oldFromDate;
    this.toDate = this.oldToDate;
  }
  setRange() {
    if (this.derivedOptions.singleCalendar && this.fromDate) {
      this.range = this.fromDate.toFormat(this.derivedOptions.displayFormat);
    } else if (this.fromDate && this.toDate) {
      this.range =
        this.fromDate.toFormat(this.derivedOptions.displayFormat) +
        ' - ' +
        this.toDate.toFormat(this.derivedOptions.displayFormat);
    } else {
      this.range = '';
    }
  }
  // #endregion

  // #region all control button handlers
  apply() {
    this.toggleCalendars(false);
    this.setRange();
    this.emitRangeSelected();
  }
  cancel() {
    this.restoreOldDates();
    this.toggleCalendars(false);
  }
  clear() {
    this.fromDate = this.toDate = null;
    this.apply();
    this.enableApplyButton = false;
  }
  applyPredefinedRange(data: DefinedDateRange) {
    this.setFromDate(data.value.start);
    this.setToDate(data.value.end);
    this.toggleCalendars(false);
    this.emitRangeSelected();
  }
  // #endregion

  // #region view manipulations and condition providers
  toggleCalendars(value: boolean) {
    this.showCalendars = value;
    if (!value) {
      this.areOldDatesStored = false;
      this.updateCalendar();
    }
  }
  updateCalendar() {
    // get month and year to show calendar
    const fromDate = this.fromDate?.isValid
      ? this.fromDate
      : this.tempFromDate;
    const toDate = this.toDate?.isValid ? this.toDate : this.tempToDate;
    let tDate = DateTime.fromMillis(fromDate.valueOf());
    this.fromMonth = tDate.get('month');
    this.fromYear = tDate.get('year');
    tDate = DateTime.fromMillis(toDate.valueOf());
    this.toMonth = tDate.get('month');
    this.toYear = tDate.get('year');
    this.setRange();
  }
  getAriaLabel() {
    if (this.fromDate && this.toDate) {
      return (
        this.fromDate.toFormat(this.derivedOptions.displayFormat) +
        ' to ' +
        this.toDate.toFormat(this.derivedOptions.displayFormat)
      );
    }
    return 'Please select a date range';
  }
  // #endregion
}
