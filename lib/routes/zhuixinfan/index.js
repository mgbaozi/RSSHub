const got = require('@/utils/got');
const cheerio = require('cheerio');

const host = 'http://www.zhuixinfan.com/main.php';

module.exports = async (ctx) => {
    console.log(ctx);
    const { id = 0 } = ctx.params;
    const url = `${host}?mod=rss&pid=${id}`;
    const response = await got.get(url);
    const $ = cheerio.load(response.body);
    const title = $('rss channel title').text();
    const description = $('rss channel item description').html();
    const $$ = cheerio.load(description);
    const titles = $$('a')
        .parent()
        .contents()
        .filter(function() {
            return this.nodeType === 3;
        })
        .map(function(i, el) {
            const $el = $(el);
            $el.wrap('<span></span>');
            $el.replaceWith($el.contents);
            return $(el).text();
        });
    console.log(titles);
    const items = $$('a')
        .filter(function() {
            return $(this)
                .attr('href')
                .startsWith('magnet');
        })
        .map(function() {
            return {
                title: $(this).text(),
                link: $(this).attr('href'),
            };
        })
        .get();

    ctx.state.data = {
        title: `${title}`,
        link: url,
        item: items,
    };
};
