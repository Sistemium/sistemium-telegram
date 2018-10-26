import filter from 'lodash/filter';
import each from 'lodash/each';
import groupBy from 'lodash/groupBy';

import log from '../services/log';
import { serverDateTimeFormat } from '../services/moments';
import store from './store';
import { whilstAsync } from '../services/async';

const { debug } = log('model');

export default class Model {

  constructor(config) {

    const { name, methods = {} } = config;

    methods.refreshData = refreshData;

    this.savingIds = {};
    this.name = name;
    this.store = store;
    this.lastFetchOffset = '*';
    this.indexes = config.indexes;
    this.indexed = {};
    this.mapper = store.defineMapper(name, {
      notify: false,
      ...config,
      methods,
      safeInject: data => this.safeInject(data),
      clear: () => {
        this.lastFetchOffset = '*';
        this.reindex();
      },
      // TODO: find out how to get this working
      // afterLoadRelations(query, options, response) {
      //   debug('afterLoadRelations', query, options, response);
      // },
    });

    function refreshData() {
      const { id } = this;
      return id ? store.find(name, id, { force: true }) : Promise.reject(Error('No id attribute'));
    }

  }

  reindex() {
    const { indexes } = this;
    each(indexes, prop => {
      this.indexed[prop] = groupBy(this.getAll(), prop);
    });
  }

  create(params) {

    if (!params.deviceCts) {
      Object.assign(params, { deviceCts: serverDateTimeFormat() });
    }

    return this.store.create(this.name, params);
  }

  async update(record, props) {
    const res = this.store.update(this.name, record.id, props, { method: 'PATCH' });
    this.reindex();
    return res;
  }

  /**
   * Does pending save that helps subscription manager to resolve conflicts with server data
   * @param {Record} record
   * @param {Boolean} [immediate=false]
   * @returns {Promise<void>}
   */
  async safeSave(record, immediate = false) {

    try {
      const { id } = record;
      if (!immediate) {
        await new Promise((resolve, reject) => {
          const saving = this.savingIds[id];
          if (saving) {
            saving.reject('canceled');
            clearTimeout(saving.timeout);
          }
          this.savingIds[id] = {
            timeout: setTimeout(resolve, 700),
            reject,
          };
        });
      }
      delete this.savingIds[id];
      await record.save();
      this.reindex();
    } catch (e) {
      debug('safeSave:ignore', e);
    }

  }

  /**
   * Puts the data into the store if there's no safeSave() pending saves for the matching record
   * @param data
   */
  safeInject(data) {

    const saving = this.savingIds[data.id];

    if (!saving) {
      this.store.addToCache(this.name, data, {});
    } else {
      debug('safeInject:ignore', this.name, data.id);
    }

  }

  async destroy({ id }) {
    const res = this.store.destroy(this.name, id);
    this.reindex();
    return res;
  }

  get(id) {
    return this.store.get(this.name, id);
  }

  getAll() {
    // eslint-disable-next-line
    return this.store.getAll(this.name, ...arguments);
  }

  /**
   * Returns an array of records with matching ids
   * @param {array} ids
   * @returns {Array}
   */
  getMany(ids) {
    return filter(ids.map(id => this.get(id)));
  }

  find(id, options) {
    const { name } = this;
    return this.store.find(name, id, options)
      .then(res => {
        debug('find:success', name, id);
        this.reindex();
        return res;
      })
      .catch(err => {
        debug('find:error', name, id, err.message || err);
        return Promise.reject(err);
      });
  }

  fetchAll(query, options) {

    const { name } = this;

    let { lastFetchOffset: offset } = this;

    return new Promise(async (resolve, reject) => {

      try {

        const result = [];
        let lastResultLength = query.limit;

        await whilstAsync(
          () => lastResultLength >= query.limit,
          async () => {
            const opts = { ...options };
            const fetched = await this.store.findAll(name, {
              'x-offset:': offset,
              ...query,
            }, opts);
            lastResultLength = fetched.length;
            offset = opts.xOffset;
            debug('fetchAll', name, offset, `${lastResultLength}`);
            Array.prototype.push.apply(result, fetched);
          },
        );

        this.lastFetchOffset = offset;
        this.reindex();
        resolve(result);

      } catch (e) {
        reject(e);
      }

    });

  }

  findAll(query, options) {
    const { name } = this;
    return this.store.findAll(name, query, options)
      .then(res => {
        debug('findAll:success', name, `(${res.length})`, query);
        this.reindex();
        return res;
      })
      .catch(err => {
        debug('findAll:error', name, query, err.message || err);
        return Promise.reject(err);
      });
  }

  /**
   * Does non-cached request with groupBy option
   * @param {Object} query
   * @param {Array} fields
   * @returns {*}
   */
  groupBy(query, fields) {

    const { name } = this;

    return new Promise((resolve, reject) => {

      const options = {
        force: true,
        groupBy: fields,
        usePendingFindAll: false,
        afterFindAllFn: (o, res) => {
          debug('groupBy:success', name, `(${res.length})`, query);
          resolve(res);
          this.store.emit('groupBy', name, query);
          return [];
        },
      };

      // fix for js-data bug
      const groupByParams = { _: true, ...query };

      this.store.findAll(name, groupByParams, options)
        .catch(err => {
          debug('groupBy:error', name, query, err.message || err);
          reject(err);
        });

    });

  }

  filter(query) {
    return this.store.filter(this.name, query);
  }

  remove(item) {
    return this.store.remove(this.name, item[this.mapper.idAttribute]);
  }

}
