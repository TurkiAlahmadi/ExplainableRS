export const MovieList = ({ allMovies, handleDelete }) => {
    return (
        <ul>
            {allMovies.map(({ title, rating, id }) => (
                <li key={id}>
                    <div>
                        <h2 id="movieTitle">{title}</h2>
                        <h2 id="movieRating">({rating}/5)</h2>
                        <button id="delMovButton" onClick={() => handleDelete(id)}>x</button>
                    </div>
                </li>
            ))}
        </ul>
    );
}
