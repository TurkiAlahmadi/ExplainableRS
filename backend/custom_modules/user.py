import pandas as pd
from .dataset import Dataset

class UserProfile:

    def __init__(self, active=True, userID=None):
        if active:
            self.userID = 0
        else:
            self.userID = userID
        self.profile = {}

    def add_movies(self, movie_titles: list, movie_ratings: list, movie_dataset:object):
        """
        Add movies to the user profile.

        :param movie_titles:
        :param movie_ratings:
        :param movie_dataset:
        :return:
        """
        if type(movie_dataset) is not Dataset:
            raise ValueError("Please input a Dataset object with type 'movies'")
        if movie_dataset.type != "movies":
            raise ValueError("This method works for Dataset object with with type 'movies' only!")
        self.profile["titles"] = movie_titles
        self.profile["ratings"] = movie_ratings
        self.profile["movie_ids"] = []
        newrows = []
        for i in range(len(movie_titles)):
            movieID = movie_dataset.data.loc[movie_dataset.data['title'] == movie_titles[i]]['movieId'].values[0]
            self.profile["movie_ids"].append(movieID)
            newrows.append(pd.DataFrame(
                {'userId': self.userID, 'movieId': movieID, 'rating': movie_ratings[i]},
                index=[0])) # assuming that timestamp column is dropped
        profile_df = pd.concat(newrows).reset_index(drop=True)
        return profile_df
    def find_genre_distribution(self, movie_dataset:object, rating_dataset:object):
        """
        Create a distribution of genres watched by the user.

        :param movie_dataset:
        :param rating_dataset:
        :return:
        """
        merged_df = pd.merge(rating_dataset.data, movie_dataset.data, on="movieId")
        genre_distribution = list(merged_df[(merged_df.userId == self.userId)].iloc[:, 3:].sum(axis=0))
        genre_distribution = list(zip(genres, genre_distribution))
        return genre_distribution