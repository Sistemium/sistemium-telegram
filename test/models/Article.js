import Model from '../../src/jsdata/Model';

import './ArticleGroup';
import './ArticlePicture';

export default new Model({

  name: 'Article',

  relations: {
    belongsTo: {
      ArticleGroup: {
        localField: 'parent',
        localKey: 'articleGroupId',
      },
      ArticlePicture: {
        localField: 'avatarPicture',
        localKey: 'avatarPictureId',
      },
    },
  },

  methods: {},

});
