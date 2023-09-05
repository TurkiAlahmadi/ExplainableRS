import { useEffect } from "react";
import Select from 'react-select';

export const NewMovie = ({
                             movieTitles,
                             newMovie,
                             setNewMovie,
                             newRating,
                             selectedTitle,
                             selectedRating,
                             handleTitleChange,
                             handleRatingChange,
                         }) => {

    useEffect(() => {
        // Update newMovie state with the current newRating whenever newRating changes
        setNewMovie((prev) => ({
            ...prev,
            rating: newRating,
        }));
    }, [newRating, setNewMovie]);

    // Create an options array for the Select component
    const options = movieTitles.map((title) => ({
        value: title,
        label: title,
    }));

    // Create options for ratings
    const ratingOptions = Array.from({ length: 10 }, (_, index) => ({
        value: (index + 1) * 0.5,
        label: `${(index + 1) * 0.5}`,
    }));

    return (
        <>
            <div>
                <Select
                    options={options}
                    value={selectedTitle}
                    onChange={handleTitleChange}
                    placeholder="Search for a Movie Title"
                    isClearable={true}
                />
            </div>
            {!newMovie.title ? null : (
                <div>
                    <Select
                        options={ratingOptions}
                        value={selectedRating}
                        onChange={handleRatingChange}
                        placeholder="Rate the Movie"
                        isClearable={true}
                    />
                </div>
            )}
        </>
    );
};