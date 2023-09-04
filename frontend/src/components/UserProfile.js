import {NewMovie} from "./NewMovie";
import {MovieList} from "./MovieList";
import {Figures} from "./Figures";
import {InitialPage} from "./InitialPage";
import { useState, useEffect } from "react";
import Button from "react-bootstrap/Button";

export const UserProfile = () => {
    const [newMovie, setNewMovie] = useState({});
    const [newRating, setNewRating] = useState(0);

    const [userData, setUserData] = useState([]);
    const [itemData, setItemData] = useState([]);
    const [userMovies, setUserMovies] = useState([]);
    const [movieUsers, setMovieUsers] = useState([]);
    const [recommendedItems, setRecommendedItems] = useState([]);

    const [movieTitles, setMovieTitles] = useState([]);
    const [allMovies, setAllMovies] = useState([]);

    const [selectedTitle, setSelectedTitle] = useState(null);
    const [selectedRating, setSelectedRating] = useState(null);

    const [isLoadingData, setIsLoadingData] = useState(true);
    const [isLoadingPosters, setIsLoadingPosters] = useState(false);
    const [isGeneratingRecs, setIsGeneratingRecs] = useState(false);



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

    const handleTitleChange = (selectedOption) => {
        setSelectedTitle(selectedOption);
        setNewMovie((prev) => ({
            ...prev,
            title: selectedOption ? selectedOption.value : null,
        }));
    };

    const handleRatingChange = (selectedOption) => {
        setSelectedRating(selectedOption);
        setNewMovie((prev) => ({
            ...prev,
            rating: selectedOption ? selectedOption.value : null,
        }));
    };

    const handleAddMovie = (event) => {
        event.preventDefault();
        let terminate = false

        // Check if the selected title is in the list of rated movie
        allMovies.forEach(movie => {
            if (movie.title === newMovie.title) {
                alert("You already rated this movie! Delete it from the list to rate it again.");
                terminate = true;
            }
        });
        if (!terminate && newMovie.title && newMovie.rating) {
            // Assign a unique id to the new movie
            const newMovieWithId = {
                ...newMovie,
                id: Date.now(),
            };

            setAllMovies((prev) => [newMovieWithId, ...prev]);
            setNewMovie({});
            setNewRating(0);
            setSelectedTitle(null);
            setSelectedRating(null);
        } else {
            alert("Please add a movie and rate it");
        }
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
                    setUserMovies(JSON.parse(jsonResponse.userMovies));
                    setMovieUsers(JSON.parse(jsonResponse.movieUsers));
                    setRecommendedItems(jsonResponse.recommendedItems);
                    setIsLoadingData(false);
                };
        } catch (error) {
            console.log(error);
            setIsLoadingData(false);
        };
    };

    const handleSubmit = (event) => {
        if (allMovies.length == 0){
            alert("Add movies to generate recommendations.");
        } else {
            event.preventDefault();
            const url = "http://localhost:5000/data";
            setIsGeneratingRecs(true);
            setIsLoadingPosters(true);
            setIsLoadingData(true);
            sendProfile(url);
        }
    };
    return (
        <>
            <div className='UserProfile' style={{top: isGeneratingRecs ? '250px' : '30px'}} >
                <h1 id="userprofile">Create a Movie Profile</h1>
                <NewMovie
                    newMovie={newMovie}
                    setNewMovie={setNewMovie}
                    newRating={newRating}
                    handleAddMovie={handleAddMovie}
                    movieTitles={movieTitles}
                    selectedTitle={selectedTitle}
                    selectedRating={selectedRating}
                    handleTitleChange={handleTitleChange}
                    handleRatingChange={handleRatingChange}
                />
                <div id='buttonGroup' className="d-flex justify-content-between align-items-center mb-4">
                    <Button id='addMovieButton' variant="primary" onClick={handleAddMovie} size="sm">
                        Add Movie
                    </Button>
                    <Button id='submitButton' variant="success" onClick={handleSubmit} size="sm">
                        Generate Recommendations
                    </Button>
                </div>
                <MovieList allMovies={allMovies} handleDelete={handleDelete} />
            </div>

            <InitialPage
                isLoadingData={isLoadingData}
                isGeneratingRecs={isGeneratingRecs}
            />
            {isLoadingPosters && (
            <div className='loading-background'>
            <p id='loading-text'>Loading Data ...</p>
            </div>
            )}
            {!isLoadingData && (
                <Figures
                    initUserData={userData}
                    initItemData={itemData}
                    userMovies={userMovies}
                    movieUsers={movieUsers}
                    recommendedItems={recommendedItems}
                    isGeneratingRecs={isGeneratingRecs}
                    setIsLoadingPosters={setIsLoadingPosters}
                />
            )};
        </>
    );
};