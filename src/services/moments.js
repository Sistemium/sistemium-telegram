import { format, addDays, addMonths } from 'date-fns';
import { range } from 'lodash';

// import { ru } from 'date-fns/esm/locale';


export function dateFormat(date) {

  return format(date, 'dd.MM.y');

}

export function dateTimeFormat(utcDate) {

  const date = utcDate instanceof Date ? utcDate : `${utcDate}Z`;
  return format(date, 'dd.MM.y в HH:mm');

}

export function serverDateFormat(date = new Date()) {

  return format(utcTimeString(date), 'YYYY-MM-dd');

}

export function serverDateTimeFormat(date = new Date()) {

  return format(utcTimeString(date), 'YYYY-MM-dd HH:mm:ss.SSS');

}

export function tomorrow(date = new Date()) {
  return addDays(date, 1);
}

export function monthGenerator(num, date = new Date()) {

  return range(num).map(i => {

    const month = addMonths(date, 1 - i);

    return format(month, 'YYYY/MM');

  });

}

function utcTimeString(localDate = new Date()) {
  return localDate.toUTCString().replace(' GMT', '');
}
