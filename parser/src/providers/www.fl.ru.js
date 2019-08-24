module.exports = {
  baseUrl: 'https://www.fl.ru',
  catUrl: 'projects/?page=',
  catListSel: '#projects-list .b-post',
  catLink: '.b-post__link',
  title: '.b-page__title',
  amount: '.b-layout__txt_fontsize_18>.b-layout__bold',
  contentHtml1: "[id^='projectp']",
  contentText1: "[id^='project_info']>div>div:nth-child(3)",
  contentHtml2: '.contest-project-view > .contest-body > div:nth-child(1)',
  contentText2: '.contest-project-view > .contest-body > div:nth-child(3) ',
  ...require('./base')
}
