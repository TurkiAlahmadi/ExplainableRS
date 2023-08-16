import pandas as pd
from .recommender import Recommender
class Dataset:
    def __init__(self, type):
        self.type = type
        self.data = None
    def csv_to_df(self, dataset):
        """
        Convert a CSV file to pandas dataframe.
        """
        self.data = pd.read_csv('./data/{}/{}.csv'.format(dataset,self.type))
    def drop_column(self, col:str):
        """
        Drop a column from the dataset.

        :param col:
        :return:
        """

        self.data = self.data.drop("{}".format(col), axis='columns')
    def filter_by_ratings(self, other, min_mov_ratings=10, min_user_ratings=10):
        """
        Filter users and movies by some minimum number of ratings.
        Movies with less than 30 ratings and users with less than 20
        ratings are filtered out.

        :param other:
        :param min_mov_ratings:
        :param min_user_ratings:
        :return:
        """

        if self.type != "ratings":
            raise ValueError("This method should be applied to an instance of type 'ratings' only")
        if other.type != "movies":
            raise ValueError("The instance argument of this method should be of type 'movies' only")
        self.data = self.data[
            self.data.groupby("movieId")['movieId'].transform('size') >= min_mov_ratings]
        self.data = self.data[
            self.data.groupby("userId")['userId'].transform('size') >= min_user_ratings]
        other.data = other.data[other.data.movieId.isin(self.data.movieId)].reset_index(drop=True)
    def add_genre_columns(self):
        """
        Add genre columns in the movie dataframe for ease of
        calculation of genre distribution for each user.
        """
        if self.type != "movies":
            raise ValueError("This method should be applied to an instance of type 'movies' only")
        dataset = self.data.copy()
        # find unique genres and store them
        genres = []
        for i in list(dataset.genres.unique()):
            for g in i.split("|"):
                if g not in genres:
                    genres.append(g)
        # add genre columns
        for i in genres:
            dataset[i] = dataset.genres.apply(lambda x: 1 if i in x else 0)
        self.data = dataset
    def get_titles(self):
        """
        Get all movie titles.
        """
        if self.type != "movies":
            raise ValueError("This method should be applied to an instance of type 'movies' only")
        dataset = self.data.copy()
        return dataset['title'].to_list()
    def add_user_profile(self, df):
        """
        Add new user ratings to the ratings dataset.

        :param df:
        :return:
        """
        if self.type != "ratings":
            raise ValueError("This method should be applied to an instance of type 'ratings' only")
        self.data = pd.concat([df, self.data]).reset_index(drop=True)
    def add_internal_movieID(self, model: object):
        """
        Add internal movie IDs produced by the model.

        :param model:
        :return:
        """
        if type(model) is not Recommender:
            raise ValueError("Please input a Recommender object")
        if self.type != "movies":
            raise ValueError("This method should be applied to an instance of type 'movies' only")
        innerIds = self.data['movieId'].apply(lambda x: model.trainset.to_inner_iid(x))
        self.data.insert(loc=1, column='innerId', value=innerIds)

    def edit_movie_title(self):
        if self.type != "movies":
            raise ValueError("The instance argument of this method should be of type 'movies' only")
        def edit_title(movie_title):
            if ", The" in movie_title:
                title = movie_title.split(", The")
                title = "The " + title[0] + title[1]
                return title
            else:
                return movie_title
        self.data.title = self.data.title.apply(edit_title)