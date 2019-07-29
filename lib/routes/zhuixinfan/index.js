const got = require('@/utils/got');
const cheerio = require('cheerio');

const host = 'http://www.zhuixinfan.com/main.php';

module.exports = async (ctx) => {
    const { id = 0 } = ctx.params;
    const url = `${host}?mod=rss&pid=${id}`;
    const response = await got.get(url);
    const $ = cheerio.load(response.body);
    const title = $('rss channel title').text();
    const description = $('rss channel item description').html();
    const $$ = cheerio.load(description);
    const items = $$('a')
        .filter(function() {
            return $(this)
                .attr('href')
                .startsWith('magnet');
        })
        .map(function() {
            const titleElement = $(this)[0].prev.prev.prev;
            const title = titleElement.data;
            return {
                title,
                link: $(this).attr('href'),
            };
        })
        .get();

    ctx.state.data = {
        title: `${title} - 追新番`,
        link: url,
        item: items,
    };
};
