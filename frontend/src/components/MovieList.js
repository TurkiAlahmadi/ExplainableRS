import React from 'react';
import ListGroup from 'react-bootstrap/ListGroup';
import Rating from 'react-rating-stars-component';

export const MovieList = ({ allMovies, handleDelete }) => {
    return (
        <div className="list-container">
            <ListGroup>
                {allMovies.map(({ title, rating, id }) => (
                    <ListGroup.Item key={id} className="d-flex justify-content-between align-items-center">
                        <div>
                            <h2 id="movieTitle">{title}</h2>
                            <Rating
                                id="movieRating"
                                count={5}
                                value={rating}
                                size={10}
                                isHalf={true}
                                edit={false}
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
    );
};