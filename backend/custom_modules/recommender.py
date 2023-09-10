from surprise import Dataset, Reader, SVD


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

    def generate_recommendations(self, movies_dataset:object, profile:list, userID=0):
        """
        Find all recommendations with predicted ratings >= 4.

        :param movies_dataset:
        :param userID:
        :param n_recs:
        :return:
        """
        predictions = movies_dataset.data.movieId.apply(lambda x: self.predict(userID, x).est).sort_values(
            ascending=False).reset_index().rename(columns={"index": "movieId", "movieId": "rating"})
        recs = predictions[(predictions.rating >= 4)].sort_values(by='rating', ascending=False)
        profile_innerIds = [self.trainset.to_inner_iid(x) for x in profile["movie_ids"]]
        recs = recs[~recs['movieId'].isin(profile_innerIds)]
        recs = recs.merge(movies_dataset.data, how='left', left_on='movieId', right_on='innerId')
        recs = recs[['innerId', 'rating', 'title']]
        self.recommendations["movieIds"] = recs.innerId.to_list()
        self.recommendations["ratings"] = recs.rating.to_list()
        self.recommendations["titles"] = recs.title.to_list()
        return self.recommendations
