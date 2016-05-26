
module.exports = Object.freeze({
	APP_NAME: 'Garminello',
	VERSION: '1.0',
	DEBUG: process.env.DEBUG || false,
	ENVIRONMENT: process.env.ENVIRONMENT || 'production', // development|staging|production

	DATABASE_URL: process.env.DATABASE_URL,

	TRELLO_API_KEY: process.env.TRELLO_API_KEY,
	TRELLO_OAUTH_SECRET: process.env.TRELLO_OAUTH_SECRET,
	// max card title length
	TRELLO_CARD_NAME_SIZE: process.env.TRELLO_CARD_NAME_SIZE || 50,
	// max number of cards
	TRELLO_CARD_COUNT: process.env.TRELLO_CARD_COUNT || 80
});
