import each from 'lodash/each';
import { DataStore } from 'js-data';


export default class STMStore extends DataStore {

  constructor(config) {
    super(config);
  }

  clear() {
    super.clear();
    each(this._mappers, mapper => {
      mapper.clear();
    });
  }

}
