import { useState } from "react";
import {NewMovie} from "./NewMovie";
import {MovieList} from "./MovieList";

export const UserProfile = () => {
    // TODO: improve section styling
    const [newMovie, setNewMovie] = useState({});
    const handleChange = ({ target }) => {
        const { name, value } = target;
        setNewMovie((prev) => ({ ...prev, id: Date.now(), [name]: value, rating: newRating}));
    };
    const [newRating, setNewRating] = useState();
    // TODO: fix initial rating error
    const handleMenuChange = (event) => setNewRating(event.target.value);

    const [allMovies, setAllMovies] = useState([]);
    const handleSubmit = (event) => {
        event.preventDefault();
        if (!newMovie.title || newMovie.rating === "Movie Rating") return;
        setAllMovies((prev) => [newMovie, ...prev]);
        setNewMovie({});
    };
    const handleDelete = (movieIdToRemove) => {
        setAllMovies((prev) => prev.filter(
            (movie) => movie.id !== movieIdToRemove
        ));
    };

    return (
        <div className="UserProfile">
            <h1 id="userprofile">Create a Movie Profile</h1>
            <NewMovie
                newMovie={newMovie}
                handleChange={handleChange}
                handleMenuChange={handleMenuChange}
                handleSubmit={handleSubmit}
            />
            <MovieList allMovies={allMovies} handleDelete={handleDelete} />
        </div>
    );
};