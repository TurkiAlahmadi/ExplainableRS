import React, {useState} from 'react';
import { ListGroup } from "react-bootstrap";
import Rating from 'react-rating-stars-component';
import {Steps} from "intro.js-react";

export const MovieList = ({ allMovies, handleDelete, handleRatingChange }) => {

    return (
        <>
            {allMovies.length > 0 &&
                <p id="list-header">Your Movie Profile:</p>
            }
            <div className="list-container">
                <ListGroup className="group-container">
                    {allMovies.map(({ title, rating, id }) => (
                        <ListGroup.Item
                            key={id}
                            className="d-flex justify-content-between align-items-center"
                        >
                            <div>
                                <h2 id="movieTitle">{title}</h2>
                                <Rating
                                    count={5}
                                    value={rating}
                                    size={14}
                                    isHalf={true}
                                    edit={true}
                                    onChange={(newRating) => handleRatingChange(id, newRating)}
                                />
                            </div>
                            <button
                                className="delButton"
                                onClick={() => handleDelete(id)}
                            >
                                X
                            </button>
                        </ListGroup.Item>
                    ))}
                </ListGroup>
            </div>
        </>
    );
};