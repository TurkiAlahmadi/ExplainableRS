from surprise import Dataset, Reader, SVD, accuracy
from surprise.model_selection import train_test_split, cross_validate
import pandas as pd

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
    def generate_recommendations(self, movies_dataset:object, userID=0, n_recs=100):
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
        self.recommendations["movieID"] = [recs[x][0] for x in range(len(recs))]
        self.recommendations["ratings"] = [recs[x][1] for x in range(len(recs))]
        return self.recommendations
