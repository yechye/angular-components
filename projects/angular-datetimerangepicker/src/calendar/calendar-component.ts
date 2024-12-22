import {
  Component,
  EventEmitter,
  Inject,
  Input,
  LOCALE_ID,
  OnChanges,
  Output,
} from '@angular/core';
import calendarize from 'calendarize';

import {
  DateChanged,
  MonthNameValue,
  Timepicker,
  YearMonthChanged,
} from '../types';
import { DateTime, Info } from 'luxon';

@Component({
  selector: 'lib-calendar',
  templateUrl: './calendar-component.html',
})
export class CalendarComponent implements OnChanges {
  // #region Components inputs
  @Input() month: number;
  @Input() year: number;
  @Input() selectedFromDate: DateTime;
  @Input() selectedToDate: DateTime;
  @Input() isLeft: boolean;
  @Input() format: string;
  @Input() minDate: DateTime;
  @Input() maxDate: DateTime;
  @Input() inactiveBeforeStart: boolean;
  @Input() disableBeforeStart: boolean;
  @Input() timePicker: Timepicker;
  @Input() singleCalendar: boolean;
  @Input() weekStartsOn: number;
  @Input() addTouchSupport: boolean;
  @Input() disabledDates: DateTime[];
  @Input() disabledDays: number[];
  @Input() disableWeekEnds: boolean;
  // #endregion

  maxMonth = 0;
  maxYear = 0;
  minYear = 0;
  minMonth = 0;
  srFormat = 'DD MMMM YYYY hh:mm a';
  // #region component outputs
  @Output() dateChanged: EventEmitter<DateChanged> = new EventEmitter();
  @Output() monthChanged: EventEmitter<YearMonthChanged> = new EventEmitter();
  @Output() yearChanged: EventEmitter<YearMonthChanged> = new EventEmitter();
  @Output() scrollTop: EventEmitter<void> = new EventEmitter();
  // #endregion

  // #region all component variables
  isTouch = false;
  weekList: DateTime[][];
  weekDays: string[];
  monthsList: MonthNameValue[] = [];
  yearsList: number[] = [];
  weekEndOn: number[];
  // #endregion

  constructor(@Inject(LOCALE_ID) public locale: string) { }
  // #region setters and getters
  get monthText() {
    return DateTime.now()
      .set({ month: this.month, year: this.year })
      .toFormat('LLL');
  }
  // #endregion

  // #region Component Life cycle handlers
  ngOnChanges(): void {
    this.isTouch =
      this.addTouchSupport && !window.matchMedia('(hover: hover)').matches;
    this.maxYear = this.maxDate ? this.maxDate.get('year') : 100000;
    this.maxMonth = this.maxDate ? this.maxDate.get('month') : 12;
    this.minYear = this.minDate ? this.minDate.get('year') : 0;
    this.minMonth = this.minDate ? this.minDate.get('month') : -1;
    this.createCalendarGridData();
  }
  // #endregion

  // #region view manipulations and condition providers
  getNextMonthFirstWeek(): DateTime[] {
    const thisMonthStartDate = DateTime.now()
      .set({ year: this.year, month: this.month })
      .startOf('month');
    const nextMonthStartDate = thisMonthStartDate
      .plus({ month: 1 })
      .startOf('month');
    const year = nextMonthStartDate.get('year');
    const month = nextMonthStartDate.get('month');
    return calendarize(nextMonthStartDate.toJSDate(), this.weekStartsOn)
      .shift()
      .filter(Boolean)
      .map((day) => {
        return DateTime.now()
          .set({
            year,
            month,
            day,
            hour: 0,
            minute: 0,
            second: 0,
            millisecond: 0,
          });
      });
  }
  getPreviousMonthNthLastWeek(nthLastCount): DateTime[] {
    const thisMonthStartDate = DateTime.now()
      .set({ year: this.year, month: this.month })
      .startOf('month');
    const previousMonthStartDate = thisMonthStartDate
      .minus({ month: 1 })
      .startOf('month');
    const year = previousMonthStartDate.get('year');
    const month = previousMonthStartDate.get('month');
    return calendarize(previousMonthStartDate.toJSDate(), this.weekStartsOn)
      .slice(-nthLastCount)[0]
      .filter(Boolean)
      .map((day) => {
        return DateTime.now()
          .set({
            year,
            month,
            day,
            hour: 0,
            minute: 0,
            second: 0,
            millisecond: 0,
          });
      });
  }
  createTouchCalendarGridData(): void {
    const monthsList = Info.months('short', { locale: this.locale });
    this.yearsList = [];
    this.monthsList = [];
    for (let i = 1900; i <= +DateTime.now().plus({ year: 100 }).get('year'); i++) {
      if (i < this.minYear || i > this.maxYear) {
        continue;
      }
      this.yearsList.push(i);
    }
    for (let i = 0; i < monthsList.length; i++) {
      if (this.year === this.minYear && i < this.minMonth) {
        continue;
      }
      if (this.year === this.maxYear && i > this.maxMonth) {
        continue;
      }
      this.monthsList.push({
        name: monthsList[i],
        value: i,
      });
    }
  }
  createCalendarGridData(): void {
    if (this.year <= this.minYear && this.month < this.minMonth) {
      this.year = this.minYear;
      this.month = this.minMonth;
    }
    if (this.year >= this.maxYear && this.month > this.maxMonth) {
      this.year = this.maxYear;
      this.month = this.maxMonth;
    }
    let year = null;
    let month = null;
    this.setWeekDays();
    this.setWeekEnd();
    const thisMonthStartDate = DateTime.now()
      .set({ year: this.year, month: this.month })
      .startOf('month');
    year = thisMonthStartDate.get('year');
    month = thisMonthStartDate.get('month');
    const thisMonthWeekList = calendarize(
      thisMonthStartDate.toJSDate(),
      this.weekStartsOn
    ).map((week) => {
      return week.filter(Boolean).map((day) => {
        if (day === 0) {
          return null;
        }
        return DateTime.now()
          .set({
            year,
            month,
            day,
            hour: 0,
            minute: 0,
            second: 0,
            millisecond: 0,
          });
      });
    });
    // if this months first week has less than 7 days then take previous month's last week and merge them
    // This should be done only for grid view which is shown only on non touch devices
    if (!this.isTouch) {
      if (thisMonthWeekList[0].length < 7) {
        thisMonthWeekList[0] = this.getPreviousMonthNthLastWeek(1).concat(
          thisMonthWeekList[0]
        );
      }
      // if this months last week has less than 7 days then take next month's first week and merge them
      if (thisMonthWeekList.slice(-1)[0].length < 7) {
        thisMonthWeekList[thisMonthWeekList.length - 1] = thisMonthWeekList
          .slice(-1)[0]
          .concat(this.getNextMonthFirstWeek());
      }
      // if total number of weeks is less than 6 then we need to add one more week
      // Here we add previous months second last week
      if (thisMonthWeekList.length < 6) {
        thisMonthWeekList.unshift(this.getPreviousMonthNthLastWeek(2));
      }
    } else {
      this.createTouchCalendarGridData();
    }
    this.weekList = thisMonthWeekList;
  }
  setWeekEnd() {
    this.weekEndOn = [this.weekStartsOn, this.weekStartsOn + 6];
  }
  setWeekDays() {
    let weekDays: string[] = Info.weekdays('short', { locale: this.locale })
      .map((x) => x.replace(/[a-zA-Z]{1}$/, ''));
    weekDays = [
      ...weekDays.slice(this.weekStartsOn, 7),
      ...weekDays.slice(0, this.weekStartsOn),
    ];
    this.weekDays = weekDays;
  }
  isDisabled(day: DateTime) {
    if (this.disableWeekEnds && this.weekEndOn.includes(day.get('day'))) {
      console.log('disabled by disableWeekEnds', day.get('day'));
      return true;
    }
    if (this.disabledDays && this.disabledDays.includes(day.get('day'))) {
      console.log('disabled by disabledDays', day.get('day'));
      return true;
    }
    if (
      this.disabledDates &&
      this.disabledDates.find((x) => x.get('day') === day.get('day'))
    ) {
      console.log('disabled by disabledDates', day.get('day'));
      return true;
    }
    if (this.disableBeforeStart && !this.isLeft) {
      console.log('disabled by disableBeforeStart', day.get('day'));
      return day < this.selectedFromDate;
    }
    return (this.minDate && day < this.minDate) || (this.maxDate && day > this.maxDate);
  }
  isDateAvailable(day: DateTime) {
    if (day.get('month') !== this.month) {
      return false;
    }
    if (
      !this.singleCalendar &&
      this.inactiveBeforeStart &&
      day < this.selectedFromDate
    ) {
      return false;
    }
    return true;
  }
  isSelectedDate(day: DateTime) {
    if (
      day.get('month') === this.month &&
      day === this.selectedFromDate?.startOf('day')
    ) {
      return true;
    }
    if (
      !this.singleCalendar &&
      day.get('month') === this.month &&
      day >= this.selectedFromDate?.startOf('day') &&
      day <= this.selectedToDate?.startOf('day')
    ) {
      return true;
    }
  }
  getFormattedDate(day: DateTime) {
    return day.toFormat(this.format);
  }
  // #endregion

  // #region self event handlers
  scrollMeOutTop() {
    this.scrollTop.emit();
  }
  dateSelected(day) {
    this.dateChanged.emit({
      day: day,
      isLeft: this.isLeft,
    });
  }
  monthSelected(value) {
    this.monthChanged.emit({
      value: value,
      isLeft: this.isLeft,
    });
  }
  yearSelected(value) {
    if (value) {
      this.yearChanged.emit({
        value: value,
        isLeft: this.isLeft,
      });
    }
  }
  // #endregion
}
