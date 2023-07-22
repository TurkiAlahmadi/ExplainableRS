
export const NewMovie = ({ newMovie, newRating, handleMenuChange, handleChange, handleSubmit }) => {

    return (
        <form onSubmit={handleSubmit}>
            <input
                name="title"
                placeholder="Type a Movie Title"
                value={newMovie.title || ""}
                onChange={handleChange}
            />
            {!newMovie.title ? null : (
                <>
                    {/*
                    <textarea
                    name="description"
                    placeholder="Details..."
                    value={newMovie.description || ""}
                    onChange={handleChange}
                    />
                    */}

                    <select id="rating"
                            name="rating"
                            value={newRating}
                            onChange={handleMenuChange}
                    >
                        <option defaultValue>Movie Rating</option>
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

                    <button type="submit">Add Movie</button>
                </>
            )}
        </form>
    );
}