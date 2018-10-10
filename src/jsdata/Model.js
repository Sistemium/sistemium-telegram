import log from '../services/log';
import { serverDateTimeFormat } from '../services/moments';
import store from './store';

const { debug } = log('model');

export default class Model {

  constructor(config) {

    const { name, methods = {} } = config;

    methods.refreshData = refreshData;

    this.savingIds = {};
    this.name = name;
    this.store = store;
    this.mapper = store.defineMapper(name, {
      notify: false,
      methods,
      safeInject: data => this.safeInject(data),
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

  create(params) {

    if (!params.deviceCts) {
      Object.assign(params, { deviceCts: serverDateTimeFormat() });
    }

    return this.store.create(this.name, params);
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

  destroy({ id }) {
    return this.store.destroy(this.name, id);
  }

  get(id) {
    return this.store.get(this.name, id);
  }

  find(id, options) {
    const { name } = this;
    return this.store.find(name, id, options)
      .then(res => {
        debug('find:success', name, id);
        return res;
      })
      .catch(err => {
        debug('find:error', name, id, err.message || err);
        return Promise.reject(err);
      });
  }

  findAll(query, options) {
    const { name } = this;
    return this.store.findAll(name, query, options)
      .then(res => {
        debug('findAll:success', name, `(${res.length})`, query);
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
