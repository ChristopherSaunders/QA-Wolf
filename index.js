// EDIT THIS FILE TO COMPLETE ASSIGNMENT QUESTION 1
const { chromium } = require("playwright");
const { expect } = require("playwright/test");
const ARTICLE_LIMIT = 100;

async function sortHackerNewsArticles() {
  // launch browser
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  const pagelink = "https://news.ycombinator.com/newest";

  // go to Hacker News
  let articles = [];
  await page.goto(pagelink);
  await checkArticles(page, articles);
  await finishTest(browser,articles); 
}

(async () => {
  await sortHackerNewsArticles();
})();

//If all articles on page is sorted && Not at limit->
//click more link
async function checkArticles(page, articles){
  const bigbox = await page.locator("#bigbox");
  const ranks = await bigbox.locator(".rank").allInnerTexts();
  const titles = await bigbox.locator(".athing").locator(".titleline").allInnerTexts();
  const ages = await bigbox.locator(".age").all();

  if(!await compareArticles({ranks: ranks,titles: titles,ages: ages}, articles)) 
    return;

  if(articles.length < ARTICLE_LIMIT){
    await bigbox.locator(".morelink").click();
    await checkArticles(page,articles);
  }
}


// Print data
// Close Brower
async function finishTest(browser, data=[]){
  console.log(data);
  await browser.close();
}

//Verifies page data loads as expected
//throws error if not
async function checkLength(articleInfo){
  try{
    await expect(articleInfo.titles.length === articleInfo.ages.length
              && articleInfo.titles.length === articleInfo.ranks.length)
       .toBeTruthy();
    return true;
  }
  catch{
    console.error({
      Error: "Articles did not load as expected",
      titles_length: articleInfo.titles.length,
      rank_length: articleInfo.ranks.length,
      ages_length: articleInfo.ages.length,
      expected: "Elements to be the should be the same length"
    });
    return false;
  }
}

//Goes thru Articles on page
//Compares Current Articles to Articles verified to be sort
//if sorted->
//Push article to saved SortedArticles
//Else throw error
async function compareArticles(articlesInfo, sortedArticles){
   if(!await checkLength(articlesInfo))
    return false;

  let index = 0;
  for(let item of articlesInfo.ages){
    let time = await item.getAttribute('title');
    let art_time = time.split(" ")[0];
    let secs = parseInt(time.split(" ")[1]);

    if(sortedArticles.length < ARTICLE_LIMIT){
      if(sortedArticles.length > 0){
        try{
          await expect(sortedArticles[sortedArticles.length-1].age >= secs).toBeTruthy();
        }
        catch{
          console.error({
            Error: "Articles out of Order",
              Current_Article: {
             title: articlesInfo.titles[index], 
             rank: articlesInfo.ranks[index], 
             article_time: art_time, 
             age: secs
            },
            Previous_Article: sortedArticles[sortedArticles.length-1],
            expected: `"${sortedArticles[sortedArticles.length-1].rank} ${sortedArticles[sortedArticles.length-1].title}" needs to occur (AFTER/SAME TIME) as "${articlesInfo.ranks[index]} ${articlesInfo.titles[index]}"`
          });
          return false;
        }
      }
       sortedArticles.push({
          title: articlesInfo.titles[index], 
          rank: articlesInfo.ranks[index], 
          article_time: art_time, 
          age: secs
        });
        index++;
      }
      else {break;}
    }
    return true;
  }
    
