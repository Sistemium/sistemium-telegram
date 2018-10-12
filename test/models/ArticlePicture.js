import Model from '../../src/jsdata/Model';

export default new Model({

  name: 'ArticlePicture',

  relations: {
    belongsTo: {
      Article: {
        localField: 'article',
        localKey: 'articleId',
      },
    },
  },

  methods: {},

});
