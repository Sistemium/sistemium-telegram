import http from 'axios';
import { DataStore } from 'js-data';
import { HttpAdapter } from 'js-data-http';

import queryTransform from './httpAdapter';

const store = new DataStore();

export default store;

const { API_URL } = process.env;

export function authorize(token, org) {

  const httpOptions = {

    basePath: `${API_URL || '/api'}/${org}`,

    httpConfig: {
      headers: {
        authorization: token,
        'x-page-size': 1000,
      },
    },


    deserialize(resource, response, options) {
      Object.assign(options, { xOffset: response.headers['x-offset'] });
      return response.data;
    },

    queryTransform(mapper, params, options) {
      return queryTransform(params, options);
    },

    // fix for https://github.com/js-data/js-data/issues/503
    afterFindAll({ name }, query, options, response) {

      const { _activeWith: activeWith, afterFindAllFn } = options;

      if (afterFindAllFn) {
        return afterFindAllFn(options, response);
      }

      if (response.length && activeWith) {
        store.addToCache(name, response, {});
      }

      return response || [];

    },

    afterFind({ name }, query, { _activeWith: activeWith }, response) {

      if (response && activeWith) {
        // console.info('afterFind activeWith', name, response); // eslint-disable-line
        store.addToCache(name, response, {});
      }

      return response;
    },

  };

  httpOptions.http = http;

  const httpAdapter = new HttpAdapter(httpOptions);

  store.clear();
  store.registerAdapter('http', httpAdapter, { default: true });

}
