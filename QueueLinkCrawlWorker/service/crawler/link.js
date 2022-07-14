/* eslint-disable func-names */
const axios = require('axios');
const cheerio = require('cheerio');
const https = require('https');
const HttpsProxyAgent = require('https-proxy-agent');
// eslint-disable-next-line global-require

const entities = require('html-entities');

const { getLink } = require('../../utils/link');

const defaultRedundancySelectors = ['script'];
//const { PROXY_HOST, PROXY_PORT } = process.env;

async function extractRss(url, configuration, version) {
  try {
    const articles = [];
    const { origin } = new URL(url);
    const {
      itemSelector,
      titleSelector,
      linkSelector,
      // sapoSelector,
      publicDateSelector,
    } = configuration;

    let agent;
    // eslint-disable-next-line global-require
    /*
    if (require('./index').isRequireProxy(url)) {           
      agent = new HttpsProxyAgent(`http://${PROXY_HOST}:${PROXY_PORT}`);    
    }
    */

    const { data } = await axios.get(url, {
      httpsAgent:
        agent ||
        new https.Agent({
          rejectUnauthorized: false,
        }),
      timeout: 30 * 1000,
    });

    const $ = cheerio.load(data, { xmlMode: true, normalizeWhitespace: true });
    $(itemSelector).each(function() {
      const title = $(this)
        .children(titleSelector)
        .text()
        .trim();
      let link;
      if (version === 1) {
        link = $(this)
          .children(linkSelector)
          .attr('href')
          .trim();
      } else {
        link = $(this)
          .children(linkSelector)
          .text()
          .trim();
      }
      // const sapo = $(this)
      //   .children(sapoSelector)
      //   .text();
      let publicDate = $(this)
        .children(publicDateSelector)
        .text()
        .trim();

      // HOTFIX: bongda24h
      if (!publicDate.match(/0700/)) publicDate += ' +0700';

      articles.push({
        title: entities.decode(title),        
        link: getLink(origin, link),
        // sapo: entities.decode(sapo),
        publicDate,
      });
    });
    //console.log(articles);
    return { articles };
  } catch (error) {
    return { error };
  }
}

async function extractHtml(
  url,
  contentRedundancySelectors,
  blocksConfiguration,
) {
  try {
    const articles = [];
    const { origin } = new URL(url);

    let agent;
    // eslint-disable-next-line global-require
    /*
    if (require('./index').isRequireProxy(url)) {
      agent = new HttpsProxyAgent(`http://${PROXY_HOST}:${PROXY_PORT}`);
    }
    */

    const { data } = await axios.get(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (iPhone; CPU iPhone OS 10_3_1 like Mac OS X) AppleWebKit/603.1.30 (KHTML, like Gecko) Version/10.0 Mobile/14E304 Safari/602.1',
      },
      httpsAgent:
        agent ||
        new https.Agent({
          rejectUnauthorized: false,
        }),
      timeout: 30 * 1000,
    });

    const $ = cheerio.load(data, { normalizeWhitespace: true });
    [...defaultRedundancySelectors, ...contentRedundancySelectors].forEach(
      contentRedundancySelector => $(contentRedundancySelector).remove(),
    );

    blocksConfiguration.forEach(blockConfiguration => {
      const {
        blockSelector,
        configuration: {
          itemSelector,
          linkSelector,
          publicDateSelector,
          titleSelector,
          redundancySelectors,
        },
      } = blockConfiguration;

      const $block = cheerio.load($.html($(blockSelector)));
      redundancySelectors.forEach(contentRedundancySelector =>
        $block(contentRedundancySelector).remove(),
      );

      // console.log(entities.decode($block.html()));

      $block(itemSelector).each(function() {
        const link = $block(this)
          .find(linkSelector)
          .attr('href');
        const title = $block(this)
          .find(titleSelector)
          .text();
        if (link) {
          articles.push({
            title: entities.decode(title.trim()),  
            //stitle: decode(title.trim()),
            link: getLink(origin, link),
          });
        }
      });
    });

    return { articles };
  } catch (error) {
    return { error };
  }
}


async function extractMultiRss(multiRss) {
  try {
    let listArticles = [];
    await Promise.all(
      multiRss.map(async rss => {
        const { url, configuration, version } = rss;
        const { articles, error } = await extractRss(
          url,
          configuration,
          version,
        );
        if (error) {
          // TODO: Handle error
        } else {
          listArticles = [...listArticles, ...articles];
        }
      }),
    );

    return { listArticles };
  } catch (error) {
    return { error };
  }
}

async function extractMultiHtml(multiHtml) {
  try {
    let listArticles = [];
    await Promise.all(
      multiHtml.map(async html => {
        const { url, contentRedundancySelectors, blocksConfiguration } = html;
        const { articles, error } = await extractHtml(
          url,
          contentRedundancySelectors,
          blocksConfiguration,
        );
        if (error) {
          // TODO: Handle error
        } else {
          listArticles = [...listArticles, ...articles];
        }
      }),
    );
    return { listArticles };
  } catch (error) {
    return { error };
  }
}



function extractLinks(type, multi) {
 
  if (type === 'RSS') {
    return extractMultiRss(multi);
  }
  return extractMultiHtml(multi);
}

module.exports = {
  extractRss,
  extractHtml,
  extractLinks,
};
