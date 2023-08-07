import { useState, useEffect } from "react";
import styles from "../stylings/NewMovie.module.css";

export const NewMovie = ({ movieTitles, newMovie, setNewMovie, newRating, handleMenuChange, handleAddMovie }) => {
    const [selectedTitle, setSelectedTitle] = useState("");

    useEffect(() => {
        // Update newMovie state with the current newRating whenever newRating changes
        setNewMovie((prev) => ({
            ...prev,
            rating: newRating,
        }));
    }, [newRating, setNewMovie]);

    const handleTypeChange = ({ target }) => {
        const { name, value } = target;
        setSelectedTitle(value);
        setNewMovie((prev) => ({
            ...prev,
            title: value,
        }));
    };

    return (
        <form onSubmit={handleAddMovie} className={styles["movie-form"]}>
            <div className={styles["input-container"]}>
                <input
                    type="text"
                    list="movieTitles"
                    id="movieTitleInput"
                    name="title"
                    placeholder="Type a Movie Title"
                    value={selectedTitle}
                    onChange={handleTypeChange}
                />
                <datalist id="movieTitles">
                    {movieTitles.map((title) => (
                        <option key={title} value={title} />
                    ))}
                </datalist>
            </div>
            {!newMovie.title ? null : (
                <div className={styles["dropdown-menu"]}>
                    <select
                        id="rating"
                        name="rating"
                        value={newRating}
                        onChange={handleMenuChange}
                    >
                        <option value="" disabled>
                            Rate the movie
                        </option>
                        <option value={0.5}>0.5</option>
                        <option value={1.0}>1.0</option>
                        <option value={1.5}>1.5</option>
                        <option value={2.0}>2.0</option>
                        <option value={2.5}>2.5</option>
                        <option value={3.0}>3.0</option>
                        <option value={3.5}>3.5</option>
                        <option value={4.0}>4.0</option>
                        <option value={4.5}>4.5</option>
                        <option value={5.0}>5.0</option>
                    </select>
                </div>
            )}
            <button type="submit">Add Movie</button>
        </form>
    );
};