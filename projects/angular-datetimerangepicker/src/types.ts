import { Dayjs } from "dayjs";

type Theme = "dark" | "light";
type Position = "left" | "right" | "center";

class DateRange {
  start: Dayjs;
  end: Dayjs;
}

export class DateChanged {
  day: Dayjs;
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
  minuteInterval: number = 1;
  twentyFourHourFormat: boolean = true;
}

export class YearsGrid {
  startYear: number;
  numberOfYearsInOneView: number;
  yearsPerRow: number;
  yearsList: number[][];
  currentYear: number;
}

export class Options {
  startDate?: Dayjs = null;
  endDate?: Dayjs = null;
  minDate?: Dayjs = null;
  maxDate?: Dayjs = null;
  format?: string = "YYYY-MM-DD";
  displayFormat?: string;
  inactiveBeforeStart?: boolean = false;
  autoApply?: boolean = false;
  singleCalendar?: boolean = false;
  preDefinedRanges?: DefinedDateRange[];
  noDefaultRangeSelected?: boolean = false;
  showRanges?: boolean = false;
  position?: Position = "left";
  disabled?: boolean = false;
  timePicker?: Timepicker = null;
  disableBeforeStart?: boolean = false;
  alwaysOpen?: boolean = false;
  theme?: Theme = "light";
  required?: boolean = false;
  DOB?: boolean = false;
  weekStartsOn?: number = 0;
  addTouchSupport?: boolean = false;
  placeholder?: string = "";
  hideControls?: boolean = false;
  readOnly?: boolean = false;
}
