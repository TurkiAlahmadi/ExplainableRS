import React, { useState } from "react";
import Multiselect from "multiselect-react-dropdown";

export const UserGenreSelectFilter = ({selectedGenres, handleGenreSelect}) => {

    // Define options
    const options = [
        "Action", "Adventure", "Animation", "Children", "Comedy", "Crime", "Documentary", "Drama",
        "Fantasy", "Horror", "IMAX", "Musical", "Mystery", "Romance", "Sci-Fi", "Thriller", "War", "Western"
    ].map(genre => ({ key: genre, value: genre }));

    return (
        <div>
            <Multiselect
                options={options}
                onSelect={handleGenreSelect}
                onRemove={handleGenreSelect}
                displayValue="key"
                selectedValues={selectedGenres}
                placeholder="Filter space by genre..."
                style={{
                    chips: { background: '#466995', color: 'white' },
                    option: { color: 'black' },
                    searchBox: { border: '1px solid #ccc', borderRadius: '8px', width: '456px', height: '45px'},
                    multiselectContainer: { "background-color": 'white', borderRadius: '8px', width: '456px',
                        height: '45px', position: 'absolute', left: '7px', top: '112px' },
                    optionContainer: {"background-color": 'white', width: '456px', height: '125px', position: 'absolute', left: '0px', top: '0px' },
                }}
            />
        </div>
    );
};