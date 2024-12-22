import { Component, OnInit } from '@angular/core';
import { Options } from '../../projects/angular-datetimerangepicker/src/types';
import { DateTime } from 'luxon'; 

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
  isTimePickerEnabled = true;
  format = 'dd.MM.yyyy HH:mm';
  themeObject = {
    '--drp-bg': null,
    '--drp-fg': null,
    '--drp-hover-bg': null,
    '--drp-hover-fg': null,
    '--drp-shadow-color': null,
    '--drp-outline-color': null,
    '--drp-input-border-color': null,
    '--drp-input-disabled-color': null,
  };
  initialConfigDatePickerOptions: any = {
    format: this.format,
    singleCalendar: true,
    displayFormat: this.format,
    position: 'left',
    noDefaultRangeSelected: true,
    timePicker: {
      minuteInterval: 1,
      twentyFourHourFormat: true,
    },
  };
  startDateConfigDatePickerOptions: any = {
    ...this.initialConfigDatePickerOptions,
  };
  endDateConfigDatePickerOptions: any = {
    ...this.initialConfigDatePickerOptions,
  };
  minDateConfigDatePickerOptions: any = {
    ...this.initialConfigDatePickerOptions,
  };
  maxDateConfigDatePickerOptions: any = {
    ...this.initialConfigDatePickerOptions,
  };
  daterangepickerOptions: Options = {
    startDate: DateTime.now(),
    endDate: DateTime.now().plus({days: 10}),
    minDate: DateTime.now().minus({ months: 12 }),
    maxDate: DateTime.now().plus( { months: 12 }),
    format: this.format,
    displayFormat: 'dd.MM.yyyy hh:mm a',
    autoApply: true,
    theme: 'dark',
    weekStartsOn: 0,
    placeholder: 'demo placeholder',
    hideControls: false,
    singleCalendar: false,
    position: 'left',
    required: false,
    readOnly: true,
    disabled: false,
    disableWeekEnds: true,
    disabledDays: [3],
    disabledDates: [
      DateTime.now().plus({ days: 10 }),
      DateTime.now().plus({ days: 11 }),
      DateTime.now().plus({ days: 12 }),
      DateTime.now().plus({ days: 13 }),
      DateTime.now().plus({ days: 14 }),
    ],
    disableBeforeStart: false,
    inactiveBeforeStart: true,
    noDefaultRangeSelected: false,
    alwaysOpen: false,
    addTouchSupport: true,
    showRanges: true,
    timePicker: {
      minuteInterval: 5,
      twentyFourHourFormat: false,
    },
    preDefinedRanges: [
      {
        name: 'Day After tomorrow',
        value: {
          start: DateTime.now().plus({ days: 2}),
          end: DateTime.now().plus({ days: 2 }),
        },
      },
      {
        name: 'Today',
        value: {
          start: DateTime.now().startOf('day'),
          end: DateTime.now().endOf('day'),
        },
      },
      {
        name: 'Tomorrow',
        value: {
          start: DateTime.now().plus({ days: 1 }).startOf('day'),
          end: DateTime.now().plus({ days: 1 }).endOf('day'),
        },
      },
      {
        name: 'This week',
        value: {
          start: DateTime.now().startOf('week'),
          end: DateTime.now().endOf('week'),
        },
      },
      {
        name: 'This month',
        value: {
          start: DateTime.now().startOf('month'),
          end: DateTime.now().endOf('month'),
        },
      },
      {
        name: 'Next 2 months',
        value: {
          start: DateTime.now(),
          end: DateTime.now().plus({ months: 2 }),
        },
      },
    ],
  };
  selectedRange = {
    start: null,
    end: null,
  };
  ngOnInit() {
    for (const prop in this.themeObject) {
      this.themeObject[prop] = getComputedStyle(document.documentElement)
        .getPropertyValue(prop)
        .trim();
    }
  }
  rangeSelected(data) {
    this.selectedRange = data;
  }
  singleCalendar(event) {
    this.daterangepickerOptions.singleCalendar = event.target.checked;
  }
  autoApply(event) {
    this.daterangepickerOptions.autoApply = event.target.checked;
  }
  inactiveBeforeStart(event) {
    this.daterangepickerOptions.inactiveBeforeStart = event.target.checked;
  }
  showRanges(event) {
    this.daterangepickerOptions.showRanges = event.target.checked;
  }
  setTimePicker(event) {
    this.isTimePickerEnabled = event.target.checked;
    this.daterangepickerOptions.timePicker = event.target.checked
      ? {
          minuteInterval: 5,
          twentyFourHourFormat: true,
        }
      : null;
  }
  prettyPrintJSON(object) {
    return JSON.stringify(object, null, 2);
  }
  colorChange(e) {
    this.daterangepickerOptions.theme = 'light';
    this.themeObject[e.target.dataset.cssPropName] = e.target.value;
    document.documentElement.style.setProperty(
      e.target.dataset.cssPropName,
      e.target.value
    );
  }
  optionChanged(propValue: string, event: { start: DateTime; target: { checked: any; }; }) {
    this.daterangepickerOptions = {
      ...this.daterangepickerOptions,
      [propValue]: event.start
        ? event.start.toFormat(this.format)
        : event.target.checked,
    };
    if (['minDate', 'maxDate'].includes(propValue)) {
      this.endDateConfigDatePickerOptions = {
        ...this.endDateConfigDatePickerOptions,
        noDefaultRangeSelected: false,
        minDate: this.daterangepickerOptions.minDate,
        maxDate: this.daterangepickerOptions.maxDate,
      };
      this.startDateConfigDatePickerOptions = {
        ...this.startDateConfigDatePickerOptions,
        noDefaultRangeSelected: false,
        minDate: this.daterangepickerOptions.minDate,
        maxDate: this.daterangepickerOptions.maxDate,
      };
    }
  }
  formatChanged(propValue, event) {
    this.daterangepickerOptions = {
      ...this.daterangepickerOptions,
      [propValue]: event.target.value,
    };
  }
  disabledDaysChanged(event) {
    this.daterangepickerOptions.disabledDays = event.target.value
      ? event.target.value.split(',').map((x) => +x)
      : null;
  }
}
