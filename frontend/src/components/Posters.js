import {PosterList} from "./PosterList";
import 'bootstrap/dist/css/bootstrap.min.css';

export const Posters = () => {
    return (
        <div className="container-fluid movie-app">
            <div className="row">
                <PosterList/>
            </div>
        </div>
    );
};
