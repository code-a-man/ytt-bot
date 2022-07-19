process.env.NTBA_FIX_319 = 1;
const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');
const { QuickDB } = require('quick.db');
const cron = require('node-cron');
require('dotenv').config();

const bot = new TelegramBot(process.env.TOKEN, { polling: true });
const db = new QuickDB();

const url = 'https://raw.githubusercontent.com/eserozvataf/telegram/master/README.md';
const channelId = '-1001674741850';


bot.onText(/\/topluluklar/, async (msg) => {
	const data = await db.get('lastcommit') || 'HATA';
	const chatId = msg.chat.id;
	bot.sendMessage(chatId, data.join('\n'), { disable_web_page_preview: true, parse_mode: 'Markdown' });
});

const checkDiff = (lastcommit, newcommit) => newcommit.filter(item => !lastcommit.includes(item));


cron.schedule('*/1 * * * *', () => {
	axios.get(url)
		.then(async response => {
			const savedData = await db.get('lastcommit') || await db.set('lastcommit', response.data.split('\n'));
			const newData = response.data.split('\n');
			const diff = checkDiff(savedData, newData);
			if (diff.length == 0) return;
			bot.sendMessage(channelId, `*Yeni Topluluklar*\n\n${diff.join('\n')}`, { disable_web_page_preview: true, parse_mode: 'Markdown' });
			await db.set('lastcommit', newData);
		},
		).catch(error => {
			console.log(error);
		});
},
);