/* eslint-disable func-names */
const axios = require('axios');
const cheerio = require('cheerio');
const https = require('https');
const HttpsProxyAgent = require('https-proxy-agent');
// eslint-disable-next-line global-require
//const entities = new (require('html-entities')).AllHtmlEntities();
const entities = require('html-entities');

const { getLink } = require('../../utils/link');

const defaultRedundancySelectors = ['script', 'iframe'];

function getContent($) {
  try {
    let content;
    if ($('head').children().length) {
      const { tagName } = $('head')
        .children()
        .get(0);
      if (tagName === 'meta') {
        content = $('head')
          .children()
          .eq(0)
          .attr('content');
      } else {
        content = $('head')
          .children()
          .eq(0)
          .text();
      }
    } else {
      const { tagName } = $('body')
        .children()
        .get(0);
      if (tagName === 'img') {
        content = $('body')
          .children()
          .eq(0)
          .attr('src');
      } else {
        content = $('body')
          .children()
          .eq(0)
          .text();
      }
    }
    return content;
  } catch (error) {
    // TODO: Notification, write log
    return undefined;
  }
}

async function extractArticle(link, configuration, html) {
    const TIMEOUT = 30 * 1000;
    try {
    const {
      sapoSelector,
      sapoRedundancySelectors = [],
      titleSelector,
      titleRedundancySelectors = [],
      thumbnailSelector,
      thumbnailRedundancySelectors = [],
      tagsSelector,
      tagsRedundancySelectors = [],
      contentSelector,
      contentRedundancySelectors = [],
      textRedundancySelectors = [],
    } = configuration;
    let data = html;
    if (link) {
      //const { PROXY_HOST, PROXY_PORT } = process.env;
      let agent;
      /*        // tam bo qua agent nhe
      // eslint-disable-next-line global-require
      if (require('./index').isRequireProxy(link)) {
        agent = new HttpsProxyAgent(`http://${PROXY_HOST}:${PROXY_PORT}`);
      }
      */
      // HOTFIX: Replace Vietnamnet protocol
      // eslint-disable-next-line no-param-reassign
      link = link.replace('http://vietnamnet.vn', 'https://vietnamnet.vn');

      ({ data } = await axios.get(link, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (iPhone; CPU iPhone OS 10_3_1 like Mac OS X) AppleWebKit/603.1.30 (KHTML, like Gecko) Version/10.0 Mobile/14E304 Safari/602.1',
        },
        httpsAgent:
          agent ||
          new https.Agent({
            rejectUnauthorized: false,
          }),
        timeout: TIMEOUT,
      }));
    }
    const $ = cheerio.load(data, { normalizeWhitespace: true });

    /* Title */
    let title;
    if (titleSelector && $(titleSelector).length) {
      const $title = cheerio.load($.html($(titleSelector).get(0)));
      titleRedundancySelectors.forEach(titleRedundancySelector =>
        $title(titleRedundancySelector).remove(),
      );
      title = getContent($title);
    } else {
      const defaultTitleSelectors = ['title'];
      for (let i = 0; i < defaultTitleSelectors.length; i++) {
        if ($(defaultTitleSelectors[i].length)) {
          const $title = cheerio.load($.html($(defaultTitleSelectors[i])));
          const defaultTitle = getContent($title);
          if (defaultTitle) {
            title = defaultTitle;
            break;
          }
        }
      }
    }

    /* Sapo */
    let sapo;
    if (sapoSelector) {
      const $sapo = cheerio.load($.html($(sapoSelector)));
      sapoRedundancySelectors.forEach(sapoRedundancySelector =>
        $sapo(sapoRedundancySelector).remove(),
      );
      sapo = getContent($sapo);
    } else {
      const defaultSapoSelectors = [
        'meta[name="description"]',
        'meta[property="og:description"]',
      ];
      for (let i = 0; i < defaultSapoSelectors.length; i++) {
        if ($(defaultSapoSelectors[i].length)) {
          const $sapo = cheerio.load($.html($(defaultSapoSelectors[i])));
          const defaultSapo = getContent($sapo);
          if (defaultSapo) {
            sapo = defaultSapo;
            break;
          }
        }
      }
    }

    /* Thumbnail */
    let thumbnail;
    let origin;
    const imagesSelector = $(contentSelector).find('img');
    let images = [];
    if (link) {
      ({ origin } = new URL(link));
      if (thumbnailSelector) {
        const $thumbnail = cheerio.load($.html($(thumbnailSelector)));
        thumbnailRedundancySelectors.forEach(thumbnailRedundancySelector =>
          $thumbnail(thumbnailRedundancySelector).remove(),
        );
        thumbnail = getContent($thumbnail);
        thumbnail = getLink(origin, thumbnail);
        images.push(thumbnail);
      } else {
        thumbnail = imagesSelector.length
          ? imagesSelector.eq(0).attr('src')
          : null;
        thumbnail = thumbnail ? getLink(origin, thumbnail) : undefined;
      }

      // Images
      imagesSelector.each(function() {
        const image = $(this).attr('src');
        images.push(getLink(origin, image));
      });
      images = images.filter(image => image);
    }

    /* Tags */
    let tags;
    if (tagsSelector) {
      const $tags = cheerio.load($.html($(tagsSelector)));
      tagsRedundancySelectors.forEach(tagsRedundancySelector =>
        $tags(tagsRedundancySelector).remove(),
      );
      tags = getContent($tags);
    } else {
      const defaultTagsSelectors = [
        'meta[name="new_keywords"]',
        'meta[name="keywords"]',
      ];
      for (let i = 0; i < defaultTagsSelectors.length; i++) {
        if ($(defaultTagsSelectors[i].length)) {
          const $tags = cheerio.load($.html($(defaultTagsSelectors[i])));
          const defaultTags = getContent($tags);
          if (defaultTags) {
            tags = defaultTags;
            break;
          }
        }
      }
    }

    /* Content */
    [...defaultRedundancySelectors, ...contentRedundancySelectors].forEach(
      contentRedundancySelector => $(contentRedundancySelector).remove(),
    );
    // Prevent user click link
    $('a').each(function() {
      $(this).replaceWith(`<span>${$(this).html()}</span>`);
    });
    if (origin) {
      $('img').each(function() {
        let src = $(this).attr('src');
        if (src) {
          src = getLink(origin, src);
          $(this).attr('src', src);
        }
      });
      $('video').each(function() {
        let src = $(this).attr('poster');
        if (src) {
          src = getLink(origin, src);
          $(this).attr('poster', src);
        }
      });
      $('source').each(function() {
        let src = $(this).attr('src');
        if (src) {
          src = getLink(origin, src);
          $(this).attr('src', src);
        }
      });
    }
    // Temporary hard code to fix Website baodatviet.vn has image is limited width = 1
    $('.tblImage').each(function() {
      $(this).removeAttr('width');
    });

    let content = $.html($(contentSelector)) || $.html($('body'));
    // Remove multi space by a space
    content = content.replace(/\s+/g, ' ');
    // Remove own font-family
    content = content.replace(/font-family[^";]+("|;)/g, '');
    // Remove background
    content = content.replace(/background[^";]+("|;)/g, '');

    /* Text */
    const $content = cheerio.load(content);
    textRedundancySelectors.forEach(textRedundancySelector =>
      $content(textRedundancySelector).remove(),
    );
    $content('body')
      .find('*')
      .each(function() {
        const { tagName } = $content(this).get(0);
        switch (tagName) {
          case 'p':
          case 'br':
          case 'h1':
          case 'h2':
          case 'h3':
          case 'h4':
          case 'h5':
          case 'h6':
            $content(this).replaceWith(`${$(this).html()}\n\n`);
            break;
          default:
            break;
        }
      });
    const text = $content('body')
      .text()
      .trim()
      .replace(/\n+\s+\n/g, '\n')
      .replace(/\n+/g, '\n')
      .replace(/\n/g, '\n\n')
      .replace(/\.\//g, '');
    // .replace(/<|>/g, '')

    const article = {
      title: title ? entities.decode(title.trim()) : undefined,
      sapo: sapo ? entities.decode(sapo.trim()) : undefined,
      tags: tags
        ? entities
            .decode(tags.trim())
            .split(/[,|\n|;]/)
            .map(tag => tag.trim())
            .filter(tag => tag.length)
        : undefined,
      thumbnail: thumbnail ? thumbnail.trim() : undefined,
      sourceCode: content ? entities.decode(content.trim()) : undefined,
      text: text ? entities.decode(text.trim()) : undefined,
      images,
    };
    return { article };
  } catch (error) {
    return { error };
  }
}

module.exports = {
  extractArticle,
};
