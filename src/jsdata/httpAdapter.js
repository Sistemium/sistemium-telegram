export default function queryTransform(params, options = {}) {

  const parsed = { ...params };

  // eslint-disable-next-line
  if (options._activeWith) {
    delete parsed['x-page-size:'];
    delete parsed['x-start-page:'];
    delete parsed['x-order-by:'];
  }

  let { orderBy } = params;

  if (orderBy && orderBy.length) {

    if (!Array.isArray(orderBy)) {
      orderBy = [[orderBy]];
    } else if (!Array.isArray(orderBy[0])) {
      orderBy = [orderBy];
    }

    parsed['x-order-by:'] = orderBy.map(order => {
      const [col, dir] = order;
      return `${dir.match(/desc/i) ? '-' : ''}${col}`;
    }).join(',');

  }

  if (params.limit) {
    parsed['x-page-size:'] = params.limit;
  }

  if (params.offset) {
    parsed['x-start-page:'] = Math.ceil(params.offset / (params.limit || 1)) + 1;
  }

  if (params.where) {
    parsed['where:'] = JSON.stringify(params.where);
  }

  if (Array.isArray(options.groupBy)) {
    parsed['groupBy:'] = options.groupBy.join(',');
  }

  delete parsed.where;
  delete parsed.offset;
  delete parsed.limit;
  delete parsed._;
  delete parsed.orderBy;

  return parsed;

}
