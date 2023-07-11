import pandas as pd
from .recommender import Recommender
from .user import UserProfile
class ReducedSpace:

    def __init__(self, data, type:str):
        if type != "item" or type != "user":
            raise ValueError("The type must be either 'item' or 'user'")
        self.type = type
        self.data = data
        self.profile_innerIDs = None

    def store_user_item_data(self, model:object, user:object, ratings_dataset:object):
        """
        Store relevant data to be used later on for preprocessing.

        :param model:
        :param user:
        :param ratings_dataset:
        :return:
        """
        if type(model) is not Recommender:
            raise ValueError("Please input a Recommender object for the model argument")
        if type(user) is not UserProfile:
            raise ValueError("Please input a UserProfile object for the user argument")
        user_ids = list(ratings_dataset.data.userId.unique())
        self.movie_innerIDs = [model.trainset.to_inner_iid(x) for x in user.profile["movie_ids"]]
        self.user_innerIDs = [model.trainset.to_inner_uid(x) for x in user_ids]
        self.recommended_movieIDs = model.recommendations["movieID"]

    def preprocess(self, dataset:object):
        """
        Create dataframes for user/item data and perform preprocessing to create
        user and item spaces with reduced dimensions.

        :param dataset:
        :return:
        """
        if self.type == "item"
            self.data = pd.DataFrame(columns=['x', 'y'], data=self.data)
            self.data["title"] = dataset.data["title"]
            self.data["movieId"] = dataset.data['innerId']
            self.data["status"] = self.data["movieId"].apply(lambda x: "rated movie" if x in self.movie_innerIDs else (
                "recommended" if x in self.recommended_movieIDs else "other")
        elif self.type == "user":
            user_ids = list(dataset.data.userId.unique())
            inner_ids = [trainset.to_inner_uid(x) for x in user_ids]
            self.data = pd.DataFrame(columns=['x', 'y'], data=self.data)
            self.data["userId"] = self.user_innerIDs
            self.data["user"] = ["self" if x == 0 else "other" for x in self.user_innerIDs]
        else:
            raise ValueError("This method should be applied to an instance of type 'ratings' only")

    def find_nearest_neighbours(self, rating_dataset: object, k):
        """
        TODO: implement a method to find the k nearest neighbours.
        """
        pass