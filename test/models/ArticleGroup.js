import Model from '../../src/jsdata/Model';

export default new Model({

  name: 'ArticleGroup',

  relations: {
    belongsTo: {
      ArticleGroup: {
        localField: 'parent',
        localKey: 'articleGroupId',
      },
    },
    hasMany: {
      ArticleGroup: {
        localField: 'children',
        foreignKey: 'articleGroupId',
      },
      Article: {
        localField: 'articles',
        foreignKey: 'articleGroupId',
      },
    },
  },

  methods: {},

});
