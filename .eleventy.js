require('dotenv').config();

const PrismicDOM = require('prismic-dom');
const getYoutubeIDHelper = require('get-youtube-id');
const moment = require('moment');

const imageOptimisation = require('./src/utils/imageOptimisation.js');
const filterContentByProductGroup = require('./src/utils/filterContentByProductGroup.js');

module.exports = function(config) {

  let env = process.env.ELEVENTY_ENV;

  config.setQuietMode(true);

  config.addNunjucksAsyncShortcode('image', async (image) => {
    return imageOptimisation(image.src, image.alt, image.attributes);
  });

  config.addFilter('renderAsHTML', (value) => PrismicDOM.RichText.asHtml(value));
  config.addFilter('renderAsText', (value) => PrismicDOM.RichText.asText(value));
  config.addFilter('htmlDate', (value) => {
    return new Date(value).toISOString().split('T')[0];
  });
  config.addFilter('toLocaleString', (date, lang) => {
    return moment(date).locale(lang).format('llll');
  })
  config.addFilter('convertMs', (value) => {
    var ms = value % 1000;
    value = (value - ms) / 1000;
    var secs = value % 60;
    value = (value - secs) / 60;
    var mins = value % 60;

    return `${mins}.${secs}`
  })
  config.addFilter('getYoutubeID', (value) => getYoutubeIDHelper(value));
  config.addFilter('contentFilter', (prismicInput, airtableInput) => {
    return filterContentByProductGroup(prismicInput, airtableInput)
  });

  config.addWatchTarget('./src/scss/');
  config.addPassthroughCopy('./src/fonts');
  config.addPassthroughCopy('./src/static');
  config.addPassthroughCopy({'./src/unregister-sw.js': './sw.js'});

  config.setTemplateFormats([
    'njk',
    '11ty.js'
  ]);

  env = (env=='seed') ? 'prod' : env

  return {
    dir: {
      input: 'src',
      output: 'dist',
      data: `_data/${env}`
    }
  };
};
