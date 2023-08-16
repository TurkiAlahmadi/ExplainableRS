import { useState, useEffect } from "react";
import {NewMovie} from "./NewMovie";
import {MovieList} from "./MovieList";
import {Figures} from "./Figures";
import styles from "../stylings/UserProfile.module.css";

export const UserProfile = () => {
    const [newMovie, setNewMovie] = useState({});
    const [newRating, setNewRating] = useState(0);

    let [userData, setUserData] = useState([]);
    let [itemData, setItemData] = useState([]);
    const [userRatedMovies, setUserRatedMovies] = useState([]);
    const [recommendedItems, setRecommendedItems] = useState([]);
    const [isLoadingData, setIsLoadingData] = useState(true);

    // State to store the fetched movie titles
    const [movieTitles, setMovieTitles] = useState([]);

    // Fetch movie titles from the Flask backend
    useEffect(() => {
        const fetchMovieTitles = async () => {
            try {
                const response = await fetch("http://localhost:5000/data");
                if (response.ok) {
                    const data = await response.json();
                    setMovieTitles(data.movieTitles);
                }
            } catch (error) {
                console.log(error);
            }
        };
        fetchMovieTitles();
    }, []);

    const handleMenuChange = ({ target }) => {
        setNewRating(target.value);
    };

    const [allMovies, setAllMovies] = useState([]);
    const handleAddMovie = (event) => {
        event.preventDefault();

        // Check if the selected title is valid and exists in the movieTitles list
        if (!newMovie.title || newMovie.rating === "Movie Rating") return;
        // Check if the selected title is in the list of movie titles
        if (!movieTitles.includes(newMovie.title)) {
            alert("Please select a valid movie title from the list.");
            return;
        }
        // Assign a unique id to the new movie
        const newMovieWithId = {
            ...newMovie,
            id: Date.now(),
        };

        setAllMovies((prev) => [newMovieWithId, ...prev]);
        setNewMovie({});
        setNewRating(0);
        };

    const handleDelete = (movieIdToRemove) => {
        setAllMovies((prev) => prev.filter(
            (movie) => movie.id !== movieIdToRemove
        ));
    };

    const sendProfile = async (url) => {
        const data = JSON.stringify(allMovies);
        try {
            const response = await fetch(url, {
                method: 'POST',
                body: data,
                headers: {
                    'Content-type': 'application/json',
                },
            });
            if(response.ok) {
                const jsonResponse = await response.json();
                    setUserData(jsonResponse.userData);
                    setItemData(jsonResponse.itemData);
                    setUserRatedMovies(JSON.parse(jsonResponse.userRatedMovies));
                    setRecommendedItems(jsonResponse.recommendedItems);
                    setIsLoadingData(false);
                };
        } catch (error) {
            console.log(error);
            setIsLoadingData(false);
        };
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        const url = "http://localhost:5000/data";
        setIsLoadingData(true);
        sendProfile(url);
    };

    return (
        <>
            <div className={styles.UserProfile}>
                <h1 id="userprofile">Create a Movie Profile</h1>
                <NewMovie
                    newMovie={newMovie}
                    setNewMovie={setNewMovie}
                    newRating={newRating}
                    handleMenuChange={handleMenuChange}
                    handleAddMovie={handleAddMovie}
                    movieTitles={movieTitles}
                />
                <MovieList allMovies={allMovies} handleDelete={handleDelete} />
                <form onSubmit={handleSubmit}>
                    <button type="submit">Generate Recommendations</button>
                </form>
            </div>
            {!isLoadingData && (
                <Figures
                    initUserData={userData}
                    initItemData={itemData}
                    userRatedMovies={userRatedMovies}
                    recommendedItems={recommendedItems}
                />
            )};
        </>
    );
};