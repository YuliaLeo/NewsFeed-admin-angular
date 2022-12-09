import React, {useContext, useEffect, useRef, useState} from "react";
import {IArticle} from "../../../types/IArticle";
import Article from "../Articles/Article";
import axios from "axios";
import {userContext} from "../../../Context/UserContext";
import PulseLoader from "react-spinners/PulseLoader";
import NewsFilter from "../../../lib/NewsFilter";
import {siteContext} from "../../../Context/SiteContext";
import styles from "./Articles.module.scss";

const Articles = () => {
    const ARTICLES_TO_LOAD = 5
    const LOAD_ON_POSITION = 2000

    const user = useContext(userContext).user;
    const siteState = useContext(siteContext).siteState
    const currentPage = useContext(siteContext).currentPage
    const setCurrentPage = useContext(siteContext).setCurrentPage

    // Из-за того что нет бэкенда дальше будет жесть, всю бэковую работу будет делать фронт
    const [articles, setArticles] = useState<IArticle[]>([]);
    const [articleToShow, setArticleToShow] = useState<IArticle>(Object)
    const [articleToShowIsReady, setArticleToShowIsReady] = useState(false)
    const [needToLoad, setNeedToLoad] = useState(true)
    const [loading, setLoading] = useState(true);
    const [loadingSuggested, setLoadingSuggested] = useState(true);

    let pageIsLoading = useRef(false)
    let wasLoading = useRef(false)
    let dataIsMissing = useRef(false)
    let loadMoreDOM = useRef<HTMLDivElement>(null)

    useEffect(() => {
        let url = 'http://localhost:3030/articles?'
        if (siteState?.category) {
            url += `category=${siteState?.category.toLowerCase()}&`
        }
        if (siteState?.search) {
            url += `q=${siteState?.search.replace(/ /g, '+')}&`
        }
        url += `_page=${currentPage.current}&_limit=${ARTICLES_TO_LOAD}`

        const fetchData = async () => {
            setLoading(true)
            const result = await axios(url);
            const filteredArray = NewsFilter(result.data, user?.ignoredCategories, user?.ignoredTags, siteState?.tag)
            dataIsMissing.current = !filteredArray.length
            if (!dataIsMissing.current) {
                const newArray = [...articles, ...filteredArray]
                setArticles(newArray);
            }
            setNeedToLoad(false)
            setCurrentPage(currentPage.current + 1)
            setLoading(false)
        };
        if (!pageIsLoading.current && needToLoad) {
            pageIsLoading.current = true
            fetchData();
            pageIsLoading.current = false
        }
        // eslint-disable-next-line
    }, [needToLoad]);

    useEffect(() => {
            setArticles([])
            pageIsLoading.current = false
            setNeedToLoad(true)
            currentPage.current = 1
        }, [
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
            const result = await axios(`http://localhost:3030/articles/${siteState?.article}`);
            setArticleToShowIsReady(true)
            setArticleToShow(result.data);
            setLoadingSuggested(false)
        };
        if (siteState?.article) fetchData();
    }, [siteState?.article]);

    useEffect(() => {
        window.addEventListener('scroll', ScrollHandle);
    });

    const ScrollHandle = () => {
        if (loadMoreDOM.current) {

            if (loadMoreDOM.current.getBoundingClientRect().bottom < LOAD_ON_POSITION) {
                if (!wasLoading.current) {
                    LoadMoreHandle()
                }
            } else {
                wasLoading.current = false
            }
        }
    }

    const LoadMoreHandle = () => {
        setNeedToLoad(true)
    }

    return (
        <>
            {!!siteState?.article &&
                <div className={styles.spinner}>
                    <PulseLoader
                        color="#000000"
                        loading={loadingSuggested}
                        size={20}
                    />
                </div>
            }
            {!!siteState?.article && articleToShowIsReady && <Article article={articleToShow}/>}
            {!!siteState?.article ||
                <>
                    {articles.map((article: IArticle) => <Article key={article.id} article={article}/>)}
                    <div ref={loadMoreDOM} onClick={LoadMoreHandle}>
                        <div className={styles.spinner}>
                            <PulseLoader
                                color="#000000"
                                loading={loading}
                                size={20}
                            />
                        </div>
                    </div>
                </>}
            {!siteState?.article && dataIsMissing.current && !loading &&
                <div className={styles.noResults}>
                    No results :(
                </div>}
        </>
    )
}

export default Articles