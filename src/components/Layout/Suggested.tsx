import React, {useContext, useEffect, useState} from "react";
import News from "./Suggested/News";
import styles from "./Suggested.module.scss"
import NewsFilter from "../../lib/NewsFilter";
import {userContext} from "../../Context/UserContext";
import {IArticle} from "../../types/IArticle";
import Spinner from "../common/Spinner";
import NoResult from "../common/NoResult";
import {apiContext} from "../../Context/ApiContext";
import {siteContext} from "../../Context/SiteContext";
import {Link} from "react-router-dom";

const Suggested = () => {
    const loadingIsAllowed = useContext(userContext).loadingIsAllowed
    const user = useContext(userContext).user;
    const fetchAllArticles = useContext(apiContext).fetchAllArticles
    const suggestedNews = useContext(siteContext).suggestedNews

    const [articles, setArticles] = useState<IArticle[]>([]);
    const [news, setNews] = useState<IArticle[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (suggestedNews) {
            setLoading(false)
        }
    }, [suggestedNews])

    useEffect(() => {
        const fetch = async () => {
            setLoading(true)
            const articles = await fetchAllArticles()
            const filteredArticles = NewsFilter(articles, user?.ignoredCategories, user?.ignoredTags)
            setArticles(filteredArticles)
            setLoading(false)
        }
        if (loadingIsAllowed) fetch()
        // eslint-disable-next-line
    }, [user?.ignoredCategories, user?.ignoredTags, loadingIsAllowed]);

    useEffect(() => {
        const newsArray = articles.filter((article) => {
            let articleIsSuggested = false
            suggestedNews?.every((ID: number) => {
                if (article.id === ID) {
                    articleIsSuggested = true
                    return false
                }
                return true
            })
            return articleIsSuggested
        })
        setNews(newsArray)
    }, [suggestedNews, articles]);

    return (
        <div className="layout__suggested">
            <div className={styles.suggestedContainer}>
                {loading && <Spinner color={"#000000"} size={20}/>}
                {!!news.length || loading || <NoResult/>}
                {news.map(news =>
                    <Link key={news.id} className={styles.suggestedNews} to={`/articles/${news.id}`}>
                        <News news={news}/>
                    </Link>)}
            </div>
        </div>
    )
}

export default Suggested