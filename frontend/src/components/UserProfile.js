import React, { useState, useEffect, useRef } from "react";
import { MovieList } from "./MovieList";
import { NewMovie } from "./NewMovie";
import { Figures } from "./Figures";
import { InitialPage } from "./InitialPage";
import Button from "react-bootstrap/Button";
import { Steps } from 'intro.js-react';
import "intro.js/introjs.css";

export const UserProfile = () => {
    const [userData, setUserData] = useState([]);
    const [itemData, setItemData] = useState([]);
    const [userMovies, setUserMovies] = useState([]);
    const [movieUsers, setMovieUsers] = useState([]);
    const [recommendedItems, setRecommendedItems] = useState([]);
    const [movieTitles, setMovieTitles] = useState([]);

    const [newMovie, setNewMovie] = useState({});
    const [newRating, setNewRating] = useState(0);
    const [selectedTitle, setSelectedTitle] = useState(null);
    const [selectedRating, setSelectedRating] = useState(null);
    const [allMovies, setAllMovies] = useState([]);

    const [isLoadingData, setIsLoadingData] = useState(true);
    const [isLoadingPosters, setIsLoadingPosters] = useState(false);
    const [isGeneratingRecs, setIsGeneratingRecs] = useState(false);
    const [showSteps, setShowSteps] = useState(true);
    const [recsStepsEnabled, setRecsStepsEnabled] = useState(true);

    // Use a ref to track the "Add Movie" button element
    const addMovieButtonRef = useRef(null);

    useEffect(() => {
        // Ensure the ref is populated with the button element
        addMovieButtonRef.current = document.getElementById('addMovieButton');
    }, []);

    // Define steps
    const recsSteps = [
        {
            element: '.recommendations-posters',
            intro: 'These are the your recommended movies either because of their ' +
                'similarity to movies you liked or because similar users liked them. ',
            position: 'right',
        },
        {
            element: '.item-space',
            intro: 'In this space, you can see all movies and interact with them.',
            position: 'right',
        },
        {
            element: '.user-space',
            intro: 'In this space, you can see all users and interact with them.',
            position: 'left',
        },
    ];

    useEffect(() => {
        // Fetch movie titles from the Flask backend
        const fetchMovieTitles = async () => {
            try {
                const response = await fetch("https://mfexplain-server.onrender.com/data");
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

    const handleTitleSelect = (selectedOption) => {
        setSelectedTitle(selectedOption);
        setNewMovie((prev) => ({
            ...prev,
            title: selectedOption ? selectedOption.value : null,
        }));
    };

    const handleRatingSelect = (selectedOption) => {
        setSelectedRating(selectedOption);
        setNewMovie((prev) => ({
            ...prev,
            rating: selectedOption ? selectedOption.value : null,
        }));
    };

    const handleAddMovie = (event) => {
        event.preventDefault();
        let terminate = false

        if (Object.keys(newMovie).length === 0 || newMovie.rating == 0) {
            alert("Please add a movie and rate it");
        }

        // Check if the selected title is in the list of rated movie
        allMovies.forEach(movie => {
            if (movie.title === newMovie.title) {
                alert("You already added this movie!");
                terminate = true;
            };
        });

        if (!terminate && newMovie.title && newMovie.rating) {
            // Assign a unique id to the new movie
            const selectedMovieWithId = {
                ...newMovie,
                id: Date.now(),
            };

            setAllMovies((prev) => [selectedMovieWithId, ...prev]);
            setNewMovie({});
            setNewRating(0);
            setSelectedTitle(null);
            setSelectedRating(null);
        }
    };

    const handleRatingChange = (movieId, newRating) => {
        const updatedMovies = allMovies.map((movie) =>
            movie.id === movieId ? { ...movie, rating: newRating } : movie
        );
        setAllMovies(updatedMovies);
    };

    const handleDelete = (movieIdToRemove) => {
        setAllMovies((prev) =>
            prev.filter((movie) => movie.id !== movieIdToRemove)
        );
    };

    const sendProfile = async (url) => {
        const data = JSON.stringify(allMovies);
        try {
            const response = await fetch(url, {
                method: "POST",
                body: data,
                headers: {
                    "Content-type": "application/json",
                },
            });
            if (response.ok) {
                const jsonResponse = await response.json();
                setUserData(jsonResponse.userData);
                setItemData(jsonResponse.itemData);
                setUserMovies(JSON.parse(jsonResponse.userMovies));
                setMovieUsers(JSON.parse(jsonResponse.movieUsers));
                setRecommendedItems(jsonResponse.recommendedItems);
                setIsLoadingData(false);
            }
        } catch (error) {
            console.log(error);
            setIsLoadingData(false);
        }
    };

    const handleSubmit = (event) => {
        if (allMovies.length === 0) {
            alert("Add movies to your profile to generate recommendations.");
        } else {
            event.preventDefault();
            const url = "https://mfexplain-server.onrender.com/data";
            setIsGeneratingRecs(true);
            setIsLoadingPosters(true);
            setIsLoadingData(true);
            sendProfile(url);
        }
    };

    return (
        <>
            <div
                className="UserProfile"
                style={{ top: isGeneratingRecs ? "250px" : "30px" }}
            >
                <h1 id="user-profile-header">Create a Movie Profile</h1>
                <NewMovie
                    newMovie={newMovie}
                    setNewMovie={setNewMovie}
                    newRating={newRating}
                    movieTitles={movieTitles}
                    selectedTitle={selectedTitle}
                    selectedRating={selectedRating}
                    handleTitleSelect={handleTitleSelect}
                    handleRatingSelect={handleRatingSelect}
                />
                <div id='buttonGroup' className="d-flex justify-content-between align-items-center mb-4">
                    <Button id='addMovieButton' variant="primary" onClick={handleAddMovie} size="sm">
                        Add Movie
                    </Button>
                    <Button id='submitButton' variant="success" onClick={handleSubmit} size="sm">
                        Generate Recommendations
                    </Button>
                </div>
                <MovieList
                    allMovies={allMovies}
                    handleDelete={handleDelete}
                    handleRatingChange={handleRatingChange}
                />
            </div>

            <InitialPage
                isLoadingData={isLoadingData}
                isGeneratingRecs={isGeneratingRecs}
            />
            {isLoadingPosters && (
                <div className="loading-background">
                    <p id="loading-text">Loading Data ...</p>
                </div>
            )}
            {!isLoadingData && (
                <>
                    <Figures
                        initUserData={userData}
                        initItemData={itemData}
                        userMovies={userMovies}
                        movieUsers={movieUsers}
                        recommendedItems={recommendedItems}
                        isGeneratingRecs={isGeneratingRecs}
                        setIsLoadingPosters={setIsLoadingPosters}
                    />
                    <Steps
                            enabled={showSteps}
                            steps={recsSteps}
                            initialStep={0}
                            onExit={() => setRecsStepsEnabled(false)}
                            onComplete={() => setShowSteps(false)}
                    />
                </>
            )}
        </>
    );
};
