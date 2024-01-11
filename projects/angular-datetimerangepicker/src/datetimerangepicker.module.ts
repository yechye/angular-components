import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CalendarComponent } from './calendar/calendar-component';
import { DaterangepickerComponent } from './daterangepicker/daterangepicker.component';
import { FormatDatePipe } from './format-date-pipe';
import { ChevronLeftComponent } from './img/chevron-left';
import { DoubleChevronLeftComponent } from './img/double-chevron-left';
import { TimePickerComponent } from './time/time-component';
@NgModule({
  imports: [FormsModule, CommonModule],
  declarations: [
    DaterangepickerComponent,
    CalendarComponent,
    TimePickerComponent,
    FormatDatePipe,
    DoubleChevronLeftComponent,
    ChevronLeftComponent,
  ],
  exports: [DaterangepickerComponent],
})
export class DatetimerangepickerModule {}
