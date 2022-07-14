/* eslint-disable no-undef */
const scheduler = require('node-schedule');
const { URL } = require('url');
const { default: axios } = require("axios");

const ArticleConfiguration = require('../../model/ArticleConfig');
const { extractLinks } = require('./link');
const { extractArticle } = require('./article');
const { getPublicDate } = require('../../utils/date');
const { cusLogger } = require('../log/logger');

const now = new Date();
const timeStamp = `-${now.getDate()}-${now.getHours()}-${now.getMinutes()}-${now.getSeconds()}`;


let allArticlesWithConfiguration = [];
const errMessage = 'service/log/history';
async function crawlLinks(
	type,
	multi,
	website,
	category,
	) {

		if(website.name == 'Cafebiz' || website.name == 'Cafef') {
			return { status : 1};
		}

	try {
		
		
		const listArticlesPlaceholder = [];
		const { error, listArticles } = await extractLinks(type, multi);
		console.log('Running', website, category, listArticles.length);
		if (error) throw error;

		if(listArticles.length > 0) {
		}

		for(const article of listArticles) {
			if(article.link && article.link !== ''){
				listArticlesPlaceholder.push(article);
				
			}
		}


		// Add configuration
		const configuration = await ArticleConfiguration.find({ website, category });
		const listArticlesWithConfiguration = listArticlesPlaceholder.map(
			article => {
				return ({
					...article,
					website,
					category,
					configuration
				})
			}
		);
		
		allArticlesWithConfiguration = [
			...allArticlesWithConfiguration,
			...listArticlesWithConfiguration,
		]

		// logger
		if(listArticlesWithConfiguration.length > 0){
			const today = new Date();
			const time = `-${today.getDate()}-${today.getHours()}-${today.getMinutes()}-${today.getSeconds()}`;
			const logger = cusLogger(`${errMessage}${timeStamp}/${website.name}.json`, 'info');
			logger.info('Running : ' + listArticlesWithConfiguration.length + ' ' + website.name + ' ' +  category.name + ' ' + time);
		}
		
		return { status : 1};
	} catch (error) {
		return { error };
	}
}

async function scrapeAll() {
	try {
		
		const LinkConfigurations = await axios.get(process.env.CONFIG_SERVICE_BASE_URL + '/link-config');
		const activateLinkConfigurations = [];
		LinkConfigurations.data.map(configuration => {
			if(configuration.status == "01") 
				activateLinkConfigurations.push(configuration);
		});
		
		const promises = [];
		activateLinkConfigurations.forEach(configuration => {
			const {
				_id,
				crawlType,
				schedules,
				rss,
				html,
				website,
				category,
			} = configuration;
			
			
			schedules.forEach(schedule => {
					promises.push(crawlLinks(
						crawlType,
						crawlType === 'RSS' ? rss : html,
						website,
						category,
					));
			});
			
		});


		// start crawl news
		Promise.all(promises).then(function(res) {
			console.log('<<-----------------start-------------------------->>');
			console.log('size: ' + allArticlesWithConfiguration.length);
			crawlAllArticle(allArticlesWithConfiguration);
		});
		
		return { status: 1 };

	} catch (error) {
		return { error };
	}
}

let i = 0;

let sync = 0;
const maxsync = 25;

const delay = t => new Promise(resolve => setTimeout(resolve, t));
async function crawlAllArticle (requests) {

	for(i = 0; i < requests.length; i++) {
		if(requests[i].link && requests[i].link !== ''){
			// if(sync < maxsync) {
			// 	crawlArticle(requests[i]);
			// 	sync++;
			// }
			// else {
			// 	await delay(3000);
			// 	sync = 0;
			// 	crawlArticle(requests[i]);
			// }
			await crawlArticle(requests[i]);
			
		}
	}
}

let cur = 0;
async function crawlArticle(articleInfo) {
	const { title, link, publicDate, category, website, configuration } = articleInfo;
	const myCur = cur++;
	try {
		const { error, article, send: curSend , recv: curRecv } = await extractArticle(link, myCur, configuration[0].article);
		
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

		if(res.article.sapo && res.article.sapo != ''){
			console.log('success : ' + myCur);
			const logger = cusLogger(`${errMessage}${timeStamp}/${articleInfo.website.name} - success.json`, 'info');
			logger.info({
				sapo: res.article.sapo,
				link: res.article.link,
				cur: myCur,
				atime:{
					pending: curSend - curRecv,
					send: curSend,
					recv: curRecv,
				}
			});
		}

		return res;
		

	} catch (error) {
		
		console.log(myCur);
		articleInfo.err = error.error;
		articleInfo.cur = myCur;
		
		const logger = cusLogger(`${errMessage}${timeStamp}/fail.json`, 'info');
		
		logger.info({
			website: articleInfo.website,
			category: articleInfo.category,
			errCode: articleInfo.err.code,
			errMessage: articleInfo.err.message,
			cur: myCur,
			atime:{
				pending: error.send - error.recv,
				send: error.send,
				recv: error.recv,
			}
		});
	
		

		return { error };
	}
}


module.exports = {
	scrapeAll,
	allArticlesWithConfiguration,


};
