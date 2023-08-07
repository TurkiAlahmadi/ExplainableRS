import {useState, useEffect} from "react";

export const PosterList = ({itemData}) => {
    const [recommendedItems, setRecommendedItems] = useState([]);

    useEffect(() => {
        if (itemData) {
            const recommendedMovies = itemData.filter(item => item.color === "limegreen");
            setRecommendedItems(recommendedMovies);
        }
    }, [itemData]);
    return (
        <div className="d-flex justify-content-start m-3">
            {recommendedItems.map((movie) => (
                <>
                    <div className="flex-row">
                        <img id="poster-image" src={movie.poster} alt={movie.title}/>
                    </div>
                    <div className="flex-row">
                        <p id ="poster-title">{movie.title}</p>
                    </div>
                </>
            ))}
        </div>

    );
};