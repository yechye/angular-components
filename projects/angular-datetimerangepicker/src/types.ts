import { DateTime } from 'luxon';

export type Theme = 'dark' | 'light';
export type Position = 'left' | 'right' | 'center';
export class DateRange {
  start: DateTime;
  end: DateTime;
}

export class DateChanged {
  day: DateTime;
  isLeft: boolean;
}

export class YearMonthChanged {
  value: number;
  isLeft: boolean;
}

export class MonthNameValue {
  name: string;
  value: number;
}

export class DefinedDateRange {
  name: string;
  value: DateRange;
}

export class Timepicker {
  minuteInterval = 1;
  twentyFourHourFormat = true;
}

export class YearsGrid {
  startYear: number;
  numberOfYearsInOneView: number;
  yearsPerRow: number;
  yearsList: number[][];
  currentYear: number;
}

export class Options {
  startDate?: DateTime = null;
  endDate?: DateTime = null;
  minDate?: DateTime = null;
  maxDate?: DateTime = null;
  format?: string = 'YYYY-MM-DD';
  displayFormat?: string;
  inactiveBeforeStart?: boolean = false;
  autoApply?: boolean = false;
  singleCalendar?: boolean = false;
  preDefinedRanges?: DefinedDateRange[];
  noDefaultRangeSelected?: boolean = false;
  showRanges?: boolean = false;
  position?: Position = 'left';
  disabled?: boolean = false;
  timePicker?: Timepicker = null;
  disableBeforeStart?: boolean = false;
  alwaysOpen?: boolean = false;
  theme?: Theme = 'light';
  required?: boolean = false;
  DOB?: boolean = false;
  weekStartsOn?: number = 0;
  addTouchSupport?: boolean = false;
  placeholder?: string = '';
  hideControls?: boolean = false;
  readOnly?: boolean = false;
  disableWeekEnds: boolean = false;
  disabledDays: number[] = null;
  disabledDates: DateTime[] = null;
}
