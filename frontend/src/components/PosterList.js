import {useState, useEffect} from "react";
import 'bootstrap/dist/css/bootstrap.min.css';
import {ItemSpace} from "./ItemSpace";

export const PosterList = ({itemData, itemColors}) => {
    const [recommendedItems, setRecommendedItems] = useState([]);
    const [hoveredPoster, setHoveredPoster] = useState(null);
    useEffect(() => {
        if (itemData) {
            const recommendedMovies = itemData.filter(item =>
                item.color === itemColors["user_recommended"] || item.color === itemColors["item_recommended"]);
            setRecommendedItems(recommendedMovies);
        }
    }, [itemData]);
    return (
        <>
            <p id="app-header">MFExplain</p>
            <p id="recommendation-title">Recommended Movies:</p>
            <div className="d-flex justify-content-start m-3">
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