const express = require("express");
const router = express.Router();

const { verifyAuthenticated } = require("../middleware/auth-middleware.js");
const upload = require("../middleware/multer-uploader.js");
const fs = require("fs");

const articleDao = require("../modules/article-dao.js");
const user_articleDao = require("../modules/user_article-dao.js");
const imageDao = require("../modules/image-dao.js");
const article = require("../modules/article-module.js");
const commentDao = require("../modules/comment-dao.js");

//TODO add verifyAuthenticated
router.get("/yourFavorites", async function (req, res) {
    res.locals.favoritePage = true;
    const user = {
        id: 3,
        username: "I am a test string"
    };
    const sortby = req.query.sortby;
    const params = {
        sortby : sortby,
        userid: user.id
    };
    let allArticles = [];
    if (sortby == "asc") {
        res.locals.asc = true;
        allArticles = await articleDao.retrieveUserFavoritesAsc(user.id);
    } else {
        res.locals.desc = true;
        allArticles = await articleDao.retrieveUserFavoritesDesc(user.id);
    }
    await article.fetchAllArticleDetails(allArticles, user.id);
    
    //const allArticles = await article.fetchYourArticles(params);
    //console.log(allArticles);
    res.locals.allArticles = allArticles;
    res.render("home");

});

//TO-DO add verifyAuthenticated
router.get("/yourArticles", async function (req, res) {
    res.locals.postPage = true;
    const user = {
        id: 3,
        username: "I am a test string"
    };
    const sortby = req.query.sortby;
    let allArticles = [];
    if (sortby == "asc") {
        res.locals.asc = true;
        allArticles = await articleDao.retrieveAllArticlesByUserIdAsc(user.id);
    } else {
        res.locals.desc = true;
        allArticles = await articleDao.retrieveAllArticlesByUserIdDesc(user.id);
    }
    await article.fetchAllArticleDetails(allArticles, user.id);
   
    //console.log(allArticles);
    res.locals.allArticles = allArticles;
    res.render("home");

});

//TO-DO add verifyAuthenticated
router.get("/addArticle", async function (req, res) {
    res.locals.action = "ADD";
    res.locals.themeOptions = await article.getThemeOptions();
    res.render("edit-article");
});

//TO-DO add verifyAuthenticated
router.post("/saveArticle", upload.array("imageFiles", 15), async function (req, res) {
    const pageAction = req.body.inpaction;
    const user = {
        id: 3,
        username: "TEST1"
    };//res.locals.user;//TO-DO merge log in function, get user data
    const themeId = (req.body.theme == '0') ? 999 : req.body.theme;
    const article = {
        title: req.body.title,
        content: req.body.article,
        themeId: themeId,
        userId: user.id
    }
    try {
        let articleId;
        if (pageAction == "ADD") {
            //insert article data to db
            console.log(article);
            articleId = await articleDao.addArticle(article);

        } else if (pageAction == "EDIT") {
            articleId = req.body.articleId;
            article.id = articleId;
            //update article table
            await articleDao.updateArticleByArticleId(article);

            //delete image
            let deleteImages = req.body.deleteImgs;
            deleteImages = deleteImages.slice(0, deleteImages.lastIndexOf(","));
            const deleteArray = deleteImages.split(",");
            for (let id of deleteArray) {
                await imageDao.deleteImageById(id);
            }
        }

        //save imageFiles to server and insert image data to db
        const fileInfoArray = req.files;
        for (let fileInfo of fileInfoArray) {
            // Move the image into the images folder
            const oldFileName = fileInfo.path;
            const newFileName = `./public/images/${articleId}-${fileInfo.originalname}`;
            fs.renameSync(oldFileName, newFileName);
            //insert db
            const image = {
                path: `./images/${articleId}-${fileInfo.originalname}`,
                articleId: articleId
            }
            await imageDao.addImage(image);
            //console.log(addImageResult);
        }

        res.setToastMessage(`${pageAction} article successsfully!`)

    } catch (error) {

        res.setToastMessage(`${pageAction} new article failed! ${error}`);
    }
    res.redirect("/yourArticles");
});

//TO-DO add verifyAuthenticated
router.get("/backToYours", function (req, res) {
    res.redirect("/yourArticles");
});

//TO-DO add verifyAuthenticated
router.post("/editArticle", async function (req, res) {
    res.locals.action = "EDIT";
    res.locals.edit = true;
    const articleId = req.body.articleInfo;
    res.locals.articleId = articleId;
    res.locals.themeOptions = await article.getThemeOptions();
    res.locals.uploadedImages = await imageDao.retrieveAllImagesByArticleId(articleId);
    res.render("edit-article");
});

//TO-DO add verifyAuthenticated
router.post("/deleteArticle", async function (req, res) {
    const articleId = req.body.articleId;
    console.log(articleId);
    try {
        await articleDao.deleteArticleByArticleId(articleId);
        res.setToastMessage(`DELETE article(id:${articleId}) successfully!`);
    } catch (error) {
        res.setToastMessage(`DELETE article(id:${articleId}) failed! ${error}`);
    }
    res.redirect("/yourArticles");
});

//TO-DO add verifyAuthenticated
router.get("/getArticleInfo/:articleId", async function (req, res) {
    const articleId = req.params.articleId;
    let articleInfo = await articleDao.retrieveArticlebyArticleId(articleId);
    //console.log(articleInfo);
    //await retrieveArticleDetails(articleInfo);
    if (articleInfo) {
        return res.status(200).json(articleInfo);
    } else {
        //res.sendStatus(404);
        return res.status(404).send({ result: `article (id:${articleId}) not Found!` });
    }
});

router.get("/addUserLike/:articleId", async function(req, res) {
    try {
        
        const userId = 3;//TO DO res.locals.user.id;
        const articleId = req.params.articleId;
        
        await user_articleDao.userAddLike(userId, articleId);
        return res.status(200).send({result:"user add favorite successfully!"});
    } catch (error) {
        console.log(error);
        return res.status(404).send({result:`${error}`});
    }

});

router.get("/deleteUserLike/:articleId", async function(req, res) {
    try {
        const userId = 3;//TO DO res.locals.user.id;
        const articleId = req.params.articleId;
        await user_articleDao.userDeleteLike(userId, articleId);
        return res.status(200).send({result:"user delete favorite successfully!"});
    } catch (error) {
        console.log(error);
        return res.status(404).send({result:`${error}`});
    }

});

router.get("/addComment", async function(req, res) {
    const pageIndex = req.query.InpPageIndex;
    try {
        const userId = 1;//TO DO res.locals.user.id;
        const articleId = req.query.inpArticleId;
        const content = req.query.inpComment;
        
        console.log(pageIndex);
        const comment = {
            content : content,
            articleId: articleId,
            userId: userId
        };
        console.log(comment);
        await commentDao.addNewComment(comment);
    } catch (error) {
        console.log(error);
        res.setToastMessage(`Leave a comment failed : ${error}`);
    }
    if(pageIndex == "H"){
        res.redirect("/");
    }else if(pageIndex == "P"){
        res.redirect("/yourArticles")
    }else{
        res.redirect("/yourFavorites")
    }
    
});

module.exports = router;