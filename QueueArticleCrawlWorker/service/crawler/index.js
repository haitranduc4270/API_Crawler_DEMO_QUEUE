/* eslint-disable no-undef */
const axios = require('axios').default
const { cusLogger } =  require('../../log/logger');
const { extractArticle } = require('./article');
const { getPublicDate } = require('../../utils/date');

let now = new Date();
let success = 0;
let pre = new Date();

const timeStamp = `-${now.getDate()}-${now.getHours()}-${now.getMinutes()}-${now.getSeconds()}`;

async function crawlArticle(articleInfo) {

	const configuration = await axios.post(process.env.CONFIG_SERVICE_BASE_URL + '/article-config', articleInfo);
	const { title, link, publicDate, category, website } = articleInfo;
	try {
		
		if(success % 100 === 0) {	
			now = new Date(); 
			let spend = now - pre;
			pre = now;
			const logger = cusLogger(`log/demo/history${timeStamp}/successtime.json`, 'info');
			logger.info({
				now: now,
				spend: spend,
				cur: success,
				
			});

		}

		const { error, article } = await extractArticle(link, configuration.data[0].article);
		if (error) throw error;
		
		const res ={
			article: {
			link,
			title,
			sapo: article.sapo,
			publicDate: await getPublicDate(publicDate, article.publicDate),
			thumbnail: article.thumbnail,
			category,
			website,
			sourceCode: article.sourceCode,
			text: article.text,
			tags: article.tags || [],
			numberOfWords: article.text.split(' ').length,
			images: article.images,
			},
		};

		if(res.article.sapo && res.article.sapo !== ''){
			++success;
		}
	
		console.log('success : ' + success );
		return res;
		

	} catch (error) {
		
		const logger = cusLogger(`log/demo/history${timeStamp}/fail.json`, 'info');
			logger.info({
				website: website,
				category: category,
				code: error.code,
				message : error.message
				
			});

		return { error };
	}
	
}

module.exports = {
	crawlArticle
};
