import { DateTime } from 'luxon';
import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';
import { Timepicker } from '../types';

@Component({
  selector: 'lib-timepicker',
  templateUrl: './time-component.html',
})
export class TimePickerComponent implements OnInit, OnChanges {
  // #region all component inputs
  @Input()
  options: Timepicker = new Timepicker();
  @Input()
  selectedFromDate: DateTime;
  @Input()
  selectedToDate: DateTime;
  @Input()
  minDate: DateTime;
  @Input()
  maxDate: DateTime;
  @Input()
  format: string;
  @Input()
  isLeft: boolean;
  // #endregion

  // #region all components outputs
  @Output()
  timeChanged: EventEmitter<DateTime> = new EventEmitter();
  // #endregion

  meridiem: string;

  // #region Component Life cycle handlers
  ngOnInit(): void {
    this.meridiem = this.isLeft
      ? this.selectedFromDate?.toFormat('a')
      : this.selectedToDate?.toFormat('a');
    if (
      !this.options.minuteInterval ||
      this.options.minuteInterval % 60 === 0
    ) {
      this.options.minuteInterval = 1;
    }
    this.options.minuteInterval = this.options.minuteInterval % 60;
  }
  ngOnChanges(changes: SimpleChanges): void {
    this.selectedFromDate = changes.selectedFromDate?.currentValue
      ? DateTime.fromMillis(changes.selectedFromDate.currentValue.valueOf())
      : this.selectedFromDate;
    this.selectedToDate = changes.selectedToDate?.currentValue
      ? DateTime.fromMillis(changes.selectedToDate.currentValue.valueOf())
      : this.selectedToDate;
    this.maxDate = changes.maxDate?.currentValue
      ? DateTime.fromMillis(changes.maxDate.currentValue.valueOf())
      : this.maxDate;
    this.minDate = changes.minDate?.currentValue
      ? DateTime.fromMillis(changes.minDate.currentValue.valueOf())
      : this.minDate;
    this.meridiem = this.isLeft
      ? this.selectedFromDate?.toFormat('a')
      : this.selectedToDate?.toFormat('a');
  }
  // #endregion

  // #region view manipulations and condition providers
  getCurrentHour() {
    const modFactor: number = this.options.twentyFourHourFormat ? 24 : 12;
    let currentHour =
      (this.isLeft
        ? this.selectedFromDate?.get('hour')
        : this.selectedToDate?.get('hour')) % modFactor;
    if (currentHour === 0 && !this.options.twentyFourHourFormat) {
      currentHour = 12;
    }
    return isNaN(currentHour)
      ? '&mdash;'
      : currentHour > 9
        ? currentHour
        : '0' + currentHour;
  }
  getCurrentMinute() {
    const currentMinute = this.isLeft
      ? this.selectedFromDate?.get('minute')
      : this.selectedToDate?.get('minute');
    return isNaN(currentMinute)
      ? '&mdash;'
      : currentMinute > 9
        ? currentMinute
        : '0' + currentMinute;
  }
  isValidToAddMinute(value: number) {
    let possibleNewValue: number, possibleSelectedDate: DateTime;
    if (this.isLeft) {
      possibleNewValue = this.selectedFromDate?.get('minute') + value;
      possibleSelectedDate = this.selectedFromDate ? DateTime.fromMillis(this.selectedFromDate.valueOf()).plus({ minute: value }) : null;
    } else {
      possibleNewValue = this.selectedToDate?.get('minute') + value;
      possibleSelectedDate = this.selectedToDate ? DateTime.fromMillis(this.selectedToDate.valueOf()).plus({ minute: value }) : null;
    }
    let retValue = possibleNewValue < 60 && possibleNewValue >= 0;
    if (this.minDate?.isValid) {
      retValue = retValue && possibleSelectedDate >= this.minDate;
    }
    if (this.maxDate?.isValid) {
      retValue = retValue && possibleSelectedDate <= this.maxDate;
    }
    return retValue;
  }
  isValidToAddHour(value: number) {
    let possibleNewValue: number, possibleSelectedDate: DateTime;
    if (this.isLeft) {
      possibleNewValue = this.selectedFromDate?.get('hour') + value;
      possibleSelectedDate = this.selectedFromDate ? DateTime.fromMillis(this.selectedFromDate.valueOf()).plus({ hour: value }) : null;
    } else {
      possibleNewValue = this.selectedToDate?.get('hour') + value;
      possibleSelectedDate = this.selectedToDate ? DateTime.fromMillis(this.selectedToDate.valueOf()).plus({ hour: value }) : null;
    }
    let retValue = possibleNewValue < 24 && possibleNewValue >= 0;
    if (this.minDate?.isValid) {
      retValue = retValue && possibleSelectedDate >= this.minDate;
    }
    if (this.maxDate?.isValid) {
      retValue = retValue && possibleSelectedDate <= this.maxDate;
    }
    return retValue;
  }
  // #endregion

  // #region self event handlers
  addHour(value: number) {
    if (this.isLeft) {
      this.selectedFromDate = this.selectedFromDate.set(
        { hour: (this.selectedFromDate.get('hour') + value) % 60 }
      );
    } else {
      this.selectedToDate = this.selectedToDate.set(
        { hour: (this.selectedToDate.get('hour') + value) % 60 }
      );
    }
    this.triggerTimeChanged();
  }
  addMinute(value: number) {
    if (this.isLeft) {
      this.selectedFromDate = this.selectedFromDate.set(
        { minute: (this.selectedFromDate.get('minute') + value) % 60 }
      );
    } else {
      this.selectedToDate = this.selectedToDate.set(
        { minute: (this.selectedToDate.get('minute') + value) % 60 }
      );
    }
    this.triggerTimeChanged();
  }
  triggerTimeChanged() {
    this.isLeft
      ? this.timeChanged.emit(this.selectedFromDate)
      : this.timeChanged.emit(this.selectedToDate);
  }
  toggleAMPM() {
    if (this.meridiem === 'AM') {
      this.meridiem = 'PM';
      if (this.isLeft) {
        this.selectedFromDate = this.selectedFromDate.set(
          { hour: (this.selectedFromDate.get('hour') - 12) % 24 }
        );
      } else {
        this.selectedToDate = this.selectedToDate.set({
          hour: (this.selectedToDate.get('hour') - 12) % 24
        });
      }
    } else if (this.meridiem === 'PM') {
      this.meridiem = 'AM';
      if (this.isLeft) {
        this.selectedFromDate = this.selectedFromDate.set(
          { hour: (this.selectedFromDate.get('hour') - 12) % 24 }
        );
      } else {
        this.selectedToDate = this.selectedToDate.set({
          hour: (this.selectedToDate.get('hour') - 12) % 24
        });
      }
    }
    this.addHour(0);
  }
  // #endregion
}
