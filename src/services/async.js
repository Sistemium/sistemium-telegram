import eachSeries from 'async/eachSeries';
import whilst from 'async/whilst';
import filterSeries from 'async/filterSeries';

export async function eachSeriesAsync(arr, iterator) {
  return applyAsync(eachSeries, arr, iterator);
}

export async function whilstAsync(filter, iterator) {
  return applyAsync(whilst, filter, iterator);
}


export async function filterSeriesAsync(arr, iterator) {
  return applyAsync(filterSeries, arr, iterator);
}

function applyAsync(asyncFn, arg1, arg2) {

  return new Promise((resolve, reject) => {

    asyncFn(arg1, arg2, (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });

  });

}
