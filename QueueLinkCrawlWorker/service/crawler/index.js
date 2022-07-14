/* eslint-disable no-undef */

const scheduler = require('node-schedule');
const { URL } = require('url');
const axios = require('axios').default;

//////////
const { addToTaskQueue } = require('../queue/index');
const { extractLinks } = require('./link');


let i = 0;
let j = 0;

let allArticlesWithConfiguration = [];

async function crawlLinks(
	type,
	multi,
	website,
	category,
	) {
	try {
		console.log('Running', website, category);
		
		const listArticlesPlaceholder = [];
		const { error, listArticles } = await extractLinks(type, multi);
		if (error) throw error;

		if(listArticles.length > 0) {
			console.log("config active usefull : " + i++);
			i+=listArticles.length
			//console.log("crawl request: " + i);
		}

		for(const article of listArticles) {
			if(article.link && article.link !== ''){
				listArticlesPlaceholder.push(article);
			}
		}

		// Add configuration
		
		const listArticlesWithConfiguration = listArticlesPlaceholder.map(
			article => ({
				...article,
				website,
				category,
			}),
		);
		
		allArticlesWithConfiguration = [
			...allArticlesWithConfiguration,
			...listArticlesWithConfiguration,
		]

	// Add request to task queue
	addToTaskQueue(listArticlesWithConfiguration);

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
					console.log("config active : " + j++);
					crawlLinks(
						crawlType,
						crawlType === 'RSS' ? rss : html,
						website,
						category,
					);

			});
			
		});
		
		return { status: 1 };

	} catch (error) {
		return { error };
	}
}

module.exports = {
	scrapeAll,

};
