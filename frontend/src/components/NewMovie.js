import React from 'react';
import Select from 'react-select';
import { useEffect } from "react";

export const NewMovie =
    ({
         newMovie,
         setNewMovie,
         newRating,
         movieTitles,
         selectedTitle,
         selectedRating,
         handleTitleSelect,
         handleRatingSelect,
    }) => {

        useEffect(() => {
            // Update newMovie state with the current newRating whenever newRating changes
            setNewMovie((prev) => ({
                ...prev,
                rating: newRating,
            }));
        }, [newRating, setNewMovie]);

        // Create an options array for the Select component
        const titleOptions = movieTitles.map((title) => ({
            value: title,
            label: title,
        }));

        // Create options for ratings
        const ratingOptions = Array.from({ length: 10 }, (_, index) => ({
            value: (index + 1) * 0.5,
            label: `${(index + 1) * 0.5}`,
        }));

        const customStyles = {
            control: (baseStyles, state) => ({
                ...baseStyles,
                borderRadius: '20px',
            }),
            menu: (baseStyles, state) => ({
                ...baseStyles,
                borderRadius: '10px', position: 'relative', top: '-7px',
            }),
            option: (baseStyles, state) => ({
                ...baseStyles,
                borderRadius: '50px', width: '225px', position: 'relative', left: '7.5px',
                backgroundColor: state.isFocused ? '#bee3db' : 'white',
            }),
        };

        return (
            <div className="dropdown-menus-container">
                <div className="movie-select">
                    <Select
                        options={titleOptions}
                        value={selectedTitle}
                        onChange={handleTitleSelect}
                        placeholder="Search for a movie title"
                        isClearable={true}
                        styles={customStyles}
                    />
                </div>
                {!newMovie.title ? null : (
                    <>
                        <div className="rating-select">
                            <Select
                                options={ratingOptions}
                                value={selectedRating}
                                onChange={handleRatingSelect}
                                placeholder="Rate the movie"
                                isClearable={true}
                                styles={customStyles}
                            />
                        </div>
                    </>
                )}
            </div>
        );
};