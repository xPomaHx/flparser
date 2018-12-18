"use strict";
process.setMaxListeners(0);
process.on('unhandledRejection', (reason, p) => {
    console.log('Unhandled Rejection at: Promise', p, 'reason:', reason);
});

var puppeteer = require('puppeteer');
var mongoose = require('mongoose');
var axios = require('axios');
var cheerio = require('cheerio');
var Word = require(__dirname + '/models/Word.js');
var Post = require(__dirname + '/models/Post.js');
//mongoose.set('debug', true);
let mongooseconnection = mongoose.connect("mongodb://localhost/flparser");
//let mongooseconnection = mongoose.connect("mongodb+srv://admin:admin@cluster0-ltqg3.gcp.mongodb.net/test?retryWrites=true");

let getDataFromProjectPage = async (id) => {
    let url = 'https://www.fl.ru/projects/' + id;
    let html = (await axios.get(url)).data;
    let $ = cheerio.load(html, { decodeEntities: false });
    return {
        url,
        title: $(".b-page__title").html().trim(),
        amount: $(".b-layout__txt_fontsize_18>.b-layout__bold").text().trim(),
        content: $("[id^='projectp']").html().trim() + "\n" + $("[id^='project_info']>div>div:nth-child(3)").text().trim(),
        date: Date.now(),
    }
};
let getActualId = async () => {
    let url = 'https://www.fl.ru/projects';
    let html = (await axios.get(url)).data;
    let $ = cheerio.load(html, { decodeEntities: false });
    let projectslist = $("#projects-list .b-post");
    let id = 0;
    projectslist.each((i, el) => {
        if (id) return;
        if ($(el).hasClass("topprjpay")) {
            id = $(el).attr("id").replace("project-item", "");
        }
    })
    return id;
};

let getMetaData = (txt) => {
    txt = txt.replace("&#8211", "")
    txt = txt.replace("&nbsp", "")
    txt = txt.replace("&quot", "")
    txt = txt.toLowerCase();
    let reg = {
        telegram: /(telegram|телеграмм|телеграм)+[\s:\.,\n@]*([a-zA-z-0-9]{2,})|t\.me/mgi,
        vk: /vk.com\/[A-Za-z0-9]+/mgi,
        email: /([A-Za-z0-9_\-]+\.*[A-Za-z0-9_\-]+@[A-Za-z0-9][A-Za-z0-9\-]*[A-Za-z0-9]\.+[A-Za-z]{2,4})/mgi,
        skype: /(skype|скайп|скайпе|скайпу)+[\s:\(\)\-–\.,\n@]*?([a-zA-z0-9\.\-_+!@#$%^?>:<&*=]{3,})/mgi,
    };
    for (let regt in reg) {
        reg[regt] = (txt.match(reg[regt]));
    }
    return reg
};
(async () => {
    //return;
    console.dir("start")
    console.time("start")
    await mongooseconnection;
    let aid = await getActualId();
    let t = await getDataFromProjectPage(2170753);
    console.dir(getMetaData(t.content));
    // var bulk = Word.collection.initializeUnorderedBulkOp();
    // for (let w of t.content.match(/[A-Za-zА-Яа-я]*/gim)) {
    //     if (w && w.length > 1) {
    //         bulk.find({
    //             word: w,
    //         }).upsert().updateOne({
    //             $inc: { number: 1 }
    //         });
    //     }
    // }
    // await bulk.execute()

    console.timeEnd("start")
})();


/*


*/
/*
https://freelancehunt.com/projects
https://freelance.ru/projects
https://www.fl.ru
https://www.weblancer.net
*/