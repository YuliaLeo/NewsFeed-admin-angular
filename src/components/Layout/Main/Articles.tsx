import React, {useContext, useEffect, useLayoutEffect, useRef, useState} from "react";
import {IArticle} from "../../../types/IArticle";
import Article from "../Articles/Article";
import {userContext} from "../../../Context/UserContext";
import NewsFilter from "../../../lib/NewsFilter";
import {siteContext} from "../../../Context/SiteContext";
import Spinner from "../../common/Spinner";
import InfinityScroll from "../../common/InfinityScroll";
import {apiContext} from "../../../Context/ApiContext";

const Articles = () => {
    const ARTICLES_TO_LOAD = 5

    const loadingIsAllowed = useContext(userContext).loadingIsAllowed
    const user = useContext(userContext).user;
    const siteState = useContext(siteContext).siteState
    const currentPage = useContext(siteContext).currentPage
    const setCurrentPage = useContext(siteContext).setCurrentPage
    const fetchOneArticle = useContext(apiContext).fetchOneArticle
    const fetchPagedArticles = useContext(apiContext).fetchPagedArticles

    // Из-за того что нет бэкенда дальше будет жесть, всю бэковую работу будет делать фронт
    const [articles, setArticles] = useState<IArticle[]>([]);
    const [articleToShow, setArticleToShow] = useState<IArticle>(Object)
    const [articleToShowIsReady, setArticleToShowIsReady] = useState(false)
    const [needToLoad, setNeedToLoad] = useState(false)
    const [loading, setLoading] = useState(true);
    const [loadingSuggested, setLoadingSuggested] = useState(true);

    let pageIsLoading = useRef(false)
    let dataIsMissing = useRef(false)

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true)
            const result = await fetchPagedArticles(currentPage.current, ARTICLES_TO_LOAD, siteState?.search)
            const filteredArray = NewsFilter(
                result,
                user?.ignoredCategories,
                user?.ignoredTags,
                siteState?.category,
                siteState?.tag)
            dataIsMissing.current = !filteredArray.length
            if (!dataIsMissing.current) {
                const newArray = [...articles, ...filteredArray]
                setArticles(newArray);
            }
            setNeedToLoad(false)
            setCurrentPage(currentPage.current + 1)
            setLoading(false)
        };
        if (loadingIsAllowed && !pageIsLoading.current && needToLoad) {
            pageIsLoading.current = true
            fetchData();
            pageIsLoading.current = false
        }
        // eslint-disable-next-line
    }, [needToLoad]);

    useLayoutEffect(() => {
            if (loadingIsAllowed) {
                setArticles([]) // понять почему не работает
                pageIsLoading.current = false
                setNeedToLoad(true)
                currentPage.current = 1
            }
        }, [
            loadingIsAllowed,
            currentPage,
            siteState?.category,
            siteState?.tag,
            siteState?.search,
            user?.ignoredCategories,
            user?.ignoredTags,
        ]
    );

    useEffect(() => {
        setArticleToShowIsReady(false)
    }, [siteState?.article]);

    useEffect(() => {
        const fetchData = async () => {
            setLoadingSuggested(true)
            const article = await fetchOneArticle(siteState?.article)
            setArticleToShowIsReady(true)
            setArticleToShow(article);
            setLoadingSuggested(false)
        };
        if (siteState?.article) fetchData();
        // eslint-disable-next-line
    }, [siteState?.article]);

    const LoadMoreHandle = () => {
        setNeedToLoad(true)
    }

    return (
        <>
            {!!siteState?.article &&
                <>
                    {loadingSuggested && <Spinner color={"#000000"} size={20}/>}
                    {articleToShowIsReady && <Article article={articleToShow}/>}
                </>
            }

            {!!siteState?.article ||
                <InfinityScroll
                    action={LoadMoreHandle}
                    loading={loading}
                    noResults={dataIsMissing.current && !loading}>
                    {articles.map((article: IArticle) => <Article key={article.id} article={article}/>)}
                </InfinityScroll>}

        </>
    )
}

export default Articles