from surprise import Dataset, Reader, SVD
import numpy as np
class Recommender(SVD):
    def __init__(self, ratings_dataset:object, **kwargs):
        super().__init__(**kwargs)
        self.reader = Reader(rating_scale=(0.5, 5.0))
        self.data = Dataset.load_from_df(ratings_dataset.data[["userId", "movieId", "rating"]], self.reader)
        self.recommendations = {}
        self.trainset = None

    def train_model(self):
        """
        Train the recommendation model using the entire data without splitting it.
        For the purposes of this project, we are primarily interested in generating
        user and item embeddings and not testing and improving the model performance.

        :return:
        """
        self.trainset = self.data.build_full_trainset()
        self.fit(self.trainset)
    def generate_recommendations(self, movies_dataset:object, profile:list, userID=0, n_recs=100):
        # TODO: replace n_recs by a minimum rating
        """
        Find the top n recommendations.

        :param movies_dataset:
        :param userID:
        :param n_recs:
        :return:
        """
        predictions = movies_dataset.data.movieId.apply(lambda x: self.predict(userID, x).est).sort_values(
            ascending=False).reset_index().rename(columns={"index": "movieId", "movieId": "rating"})
        recs = list(predictions[:n_recs].itertuples(index=False))
        profile_innerIds = [self.trainset.to_inner_iid(x) for x in profile["movie_ids"]]
        self.recommendations["movieIds"] = [int(i.movieId) for i in recs if i.movieId not in profile_innerIds]
        self.recommendations["ratings"] = [float(i.rating) for i in recs if i.movieId not in profile_innerIds]
        recs_rawIds = [self.trainset.to_raw_iid(x) for x in self.recommendations["movieIds"]]
        movie_dict = dict(zip(movies_dataset.data.movieId, movies_dataset.data.title))
        rec_movie_titles = [movie_dict[x] for x in recs_rawIds]
        self.recommendations["titles"] = rec_movie_titles
        return self.recommendations
