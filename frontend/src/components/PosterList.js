import {useState, useEffect} from "react";
import 'bootstrap/dist/css/bootstrap.min.css';
import {ItemSpace} from "./ItemSpace";

export const PosterList = ({itemData, itemColors, setIsLoadingPosters}) => {
    const [recommendedItems, setRecommendedItems] = useState([]);
    const [hoveredPoster, setHoveredPoster] = useState(null);
    useEffect(() => {
        if (itemData) {
            const recommendedMovies = itemData.filter(item =>
                item.color === itemColors["user_recommended"] || item.color === itemColors["item_recommended"]);
            setRecommendedItems(recommendedMovies);
        }
    }, [itemData]);
    setIsLoadingPosters(false);
    return (
        <>
            <p id="recommendation-title">Recommended Movies:</p>
            <div id='poster-container' className="d-flex justify-content-start m-3">
                {recommendedItems.map((movie) => (
                    <div className="poster-border">
                        <img id="poster-image" src={movie.poster} alt={movie.title}/>
                        <div id ="poster-title">{movie.title}</div>
                    </div>
                ))}
            </div>
        </>
    );
};