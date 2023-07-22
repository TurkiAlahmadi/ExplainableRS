export const PosterList = ({movies}) => {
    return (
        <>
            {movies.map(movie => (
                <div id= "postercontainer" className="d-flex justify-content-start m-3">
                    <img id="posters" src={movie.Poster} alt={"poster"}></img>
                </div>
            ))}
        </>
    );
};