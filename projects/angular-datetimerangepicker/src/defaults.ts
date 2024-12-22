import { DateTime } from 'luxon';

const defaults = {
  ranges: [
    {
      name: 'Today',
      value: {
        start: DateTime.now().startOf('day'),
        end: DateTime.now().endOf('day'),
      },
    },
    {
      name: 'Yesterday',
      value: {
        start: DateTime.now().minus({ days: 1 }).startOf('day'),
        end: DateTime.now().minus({ days: 1 }).endOf('day'),
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
      name: 'Last Month',
      value: {
        start: DateTime.now().minus({ month: 1 }).startOf('month'),
        end: DateTime.now().minus({ month: 1 }).endOf('month'),
      },
    },
  ],
};

export default defaults;
