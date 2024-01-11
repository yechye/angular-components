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
import dayjs, { Dayjs } from 'dayjs';
import customParser from 'dayjs/plugin/customParseFormat';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import defaults from '../defaults';
import { isLargeDesktop, isTouch } from '../helper';
import { DefinedDateRange, Options } from '../types';

dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);
dayjs.extend(customParser);

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
  fromDate: Dayjs;
  toDate: Dayjs;
  tempFromDate: Dayjs;
  tempToDate: Dayjs;
  oldFromDate: Dayjs;
  oldToDate: Dayjs;
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
  handleOutsideClick(event) {
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
  constructor(private elem: ElementRef<HTMLElement>) {}
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
      this.fromMonth = dayjs().get('month');
    }
    if (isNaN(this.fromYear)) {
      this.fromYear = dayjs().get('year');
    }
    if (isNaN(this.toMonth)) {
      this.toMonth = dayjs().get('month');
    }
    if (isNaN(this.toYear)) {
      this.toYear = dayjs().get('year');
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
  setFromDate(value: Dayjs) {
    if (this.derivedOptions.noDefaultRangeSelected && !value) {
      this.fromDate = null;
      this.tempFromDate = this.getActualFromDate(value);
    } else {
      this.fromDate = this.getActualFromDate(value);
    }
  }
  getActualFromDate(value: Dayjs) {
    let temp;
    if ((temp = this.getValidateDayjs(value))) {
      return this.getValidateFromDate(temp);
    }
    return this.getValidateFromDate(dayjs());
  }
  setToDate(value: Dayjs) {
    if (this.derivedOptions.noDefaultRangeSelected && !value) {
      this.toDate = null;
      this.tempToDate = this.getActualToDate(value);
    } else {
      this.toDate = this.getActualToDate(value);
    }
  }
  getActualToDate(value: Dayjs) {
    let temp;
    if ((temp = this.getValidateDayjs(value))) {
      return this.getValidateToDate(temp);
    }
    return this.getValidateToDate(dayjs());
  }
  // #endregion

  // #region Validators
  validateMinMaxDates() {
    if (this.derivedOptions) {
      // only mindate is suppplied
      if (this.derivedOptions.minDate && !this.derivedOptions.maxDate) {
        this.derivedOptions.minDate = this.getDayjs(
          this.derivedOptions.minDate
        );
      }
      // only maxdate is supplied
      if (!this.derivedOptions.minDate && this.derivedOptions.maxDate) {
        this.derivedOptions.maxDate = this.getDayjs(
          this.derivedOptions.maxDate
        );
      }
      // both min and max dates are supplied
      if (this.derivedOptions.minDate && this.derivedOptions.maxDate) {
        this.derivedOptions.minDate = this.getDayjs(
          this.derivedOptions.minDate
        );
        this.derivedOptions.maxDate = this.getDayjs(
          this.derivedOptions.maxDate
        );
        if (
          this.derivedOptions.maxDate.isBefore(
            this.derivedOptions.minDate,
            'date'
          )
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
        this.derivedOptions.minDate.format('HH:mm') === '00:00'
      ) {
        this.derivedOptions.minDate.set('hour', 0);
        this.derivedOptions.minDate.set('minute', 0);
        this.derivedOptions.minDate.set('second', 0);
      }
      if (
        this.derivedOptions.maxDate &&
        this.derivedOptions.maxDate.format('HH:mm') === '00:00'
      ) {
        this.derivedOptions.minDate.set('hour', 23);
        this.derivedOptions.minDate.set('minute', 59);
        this.derivedOptions.minDate.set('second', 59);
      }
    }
  }
  getValidateFromDate(value: Dayjs) {
    if (!this.derivedOptions.timePicker) {
      if (
        this.derivedOptions.minDate &&
        this.derivedOptions.maxDate &&
        value.isSameOrAfter(this.derivedOptions.minDate, 'date') &&
        value.isSameOrBefore(this.derivedOptions.maxDate, 'date')
      ) {
        return value;
      }
      if (
        this.derivedOptions.minDate &&
        !this.derivedOptions.maxDate &&
        value.isAfter(this.derivedOptions.minDate, 'date')
      ) {
        return value;
      }
      if (this.derivedOptions.minDate) {
        return this.derivedOptions.minDate.clone();
      }
      return dayjs();
    } else {
      if (
        this.derivedOptions.minDate &&
        this.derivedOptions.maxDate &&
        value.isSameOrAfter(this.derivedOptions.minDate, 'date') &&
        value.isSameOrBefore(this.derivedOptions.maxDate, 'date')
      ) {
        return value;
      }
      if (
        this.derivedOptions.minDate &&
        !this.derivedOptions.maxDate &&
        value.isAfter(this.derivedOptions.minDate, 'date')
      ) {
        return value;
      }
      if (this.derivedOptions.minDate) {
        return this.derivedOptions.minDate.clone();
      }
      return dayjs();
    }
  }
  getValidateToDate(value: Dayjs) {
    if (!this.derivedOptions.timePicker) {
      if (
        (this.derivedOptions.maxDate &&
          value.isSameOrAfter(this.fromDate, 'date'),
        value.isSameOrBefore(this.derivedOptions.maxDate, 'date'))
      ) {
        return value;
      }
      if (this.derivedOptions.maxDate) {
        return this.derivedOptions.maxDate.clone();
      }
      return dayjs();
    } else {
      if (
        (this.derivedOptions.maxDate &&
          value.isSameOrAfter(this.fromDate, 'date'),
        value.isSameOrBefore(this.derivedOptions.maxDate, 'date'))
      ) {
        return value;
      }
      if (this.derivedOptions.maxDate) {
        return this.derivedOptions.maxDate.clone();
      }
      return dayjs();
    }
  }
  // #endregion

  // #region util functions
  getDayjs(value: string | Dayjs) {
    return dayjs(value, this.derivedOptions.format);
  }
  getValidateDayjs(value: string | Dayjs) {
    let dayjsValue = null;
    if (dayjs(value, this.derivedOptions.format, true).isValid()) {
      dayjsValue = dayjs(value, this.derivedOptions.format, true);
    }
    return dayjsValue;
  }
  // #endregion

  // #region date formatters
  formatFromDate(event) {
    if (
      event.target.value !== this.fromDate.format(this.derivedOptions.format)
    ) {
      this.dateChanged({
        day: event.target.value ? this.getDayjs(event.target.value) : dayjs(),
        isLeft: true,
      });
    }
  }
  formatToDate(event) {
    if (event.target.value !== this.toDate.format(this.derivedOptions.format)) {
      this.dateChanged({
        day: event.target.value ? this.getDayjs(event.target.value) : dayjs(),
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
  dateChanged(data) {
    let value = data.day;
    const isLeft = data.isLeft;
    if (isLeft) {
      if (!this.derivedOptions.timePicker) {
        value = value.hour(0);
        value = value.minute(0);
        value = value.second(0);
      }
      this.fromDate = value;
      if (!this.derivedOptions.timePicker) {
        if (value.isAfter(this.toDate, 'date')) {
          this.toDate = this.fromDate.clone();
        }
      } else {
        if (value.isAfter(this.toDate, this.derivedOptions.format)) {
          this.toDate = this.fromDate.clone();
        }
      }
    } else {
      if (!this.derivedOptions.timePicker) {
        value = value.hour(23);
        value = value.minute(59);
        value = value.second(59);
      }
      this.toDate = value;
      this.toYear = this.toDate.get('year');
      if (!this.derivedOptions.timePicker) {
        if (value.isBefore(this.fromDate, 'date')) {
          this.fromDate = this.toDate.clone();
        }
      } else {
        if (value.isBefore(this.fromDate, this.derivedOptions.format)) {
          this.fromDate = this.toDate.clone();
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
      this.fromDate.isValid() &&
      this.toDate &&
      this.toDate.isValid()
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
        temp = dayjs()
          .set('year', this.fromYear)
          .set('month', this.fromMonth)
          .add(data.value, 'month');
        this.fromMonth = temp.get('month');
        this.fromYear = temp.get('year');
      } else {
        temp = dayjs()
          .set('year', this.toYear)
          .set('month', this.toMonth)
          .add(data.value, 'month');
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
        start: this.getDayjs(this.fromDate),
      };
    } else {
      data = {
        start: this.getDayjs(this.fromDate),
        end: this.getDayjs(this.toDate),
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
      this.range = this.fromDate.format(this.derivedOptions.displayFormat);
    } else if (this.fromDate && this.toDate) {
      this.range =
        this.fromDate.format(this.derivedOptions.displayFormat) +
        ' - ' +
        this.toDate.format(this.derivedOptions.displayFormat);
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
    const fromDate = dayjs(this.fromDate).isValid()
      ? this.fromDate
      : this.tempFromDate;
    const toDate = dayjs(this.toDate).isValid() ? this.toDate : this.tempToDate;
    let tDate = dayjs(fromDate, this.derivedOptions.format);
    this.fromMonth = tDate.get('month');
    this.fromYear = tDate.get('year');
    tDate = dayjs(toDate, this.derivedOptions.format);
    this.toMonth = tDate.get('month');
    this.toYear = tDate.get('year');
    this.setRange();
  }
  getAriaLabel() {
    if (this.fromDate && this.toDate) {
      return (
        this.fromDate.format(this.derivedOptions.displayFormat) +
        ' to ' +
        this.toDate.format(this.derivedOptions.displayFormat)
      );
    }
    return 'Please select a date range';
  }
  // #endregion
}
