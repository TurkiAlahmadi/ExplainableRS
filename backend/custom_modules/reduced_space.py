import pandas as pd
import numpy as np
import ast
import itertools
from collections import Counter
from sklearn.neighbors import NearestNeighbors
from .recommender import Recommender
from .user import UserProfile
from .neighbor_labeling import label_neighbor_rated, find_final_recommendations
from data_preprocessing_script import create_titles_col
from .distance_functions import euclidean_similarity_matrix

class ReducedSpace:

    def __init__(self, data, type):
        if type != "item" and type != "user":
            raise ValueError("The space type must be either 'item' or 'user'")
        self.type = type
        self.data = data
        self.movie_tags = pd.read_csv('./data/preprocessed_data/movie_tags_and_genres.csv')
        self.user_tags = pd.read_csv('./data/preprocessed_data/user_tags_and_genres.csv')
        self.profile = None
        self.profile_innerIDs = None
        self.movie_innerIDs = None
        self.user_innerIDs = None
        self.recommended_movieIDs = None
        self.movies_dataset = None
        self.trainset = None
        self.neighbors = None
        self.item_based_recs = None

    def preprocess(self, model: object, user: object, movies_dataset: object):
        """
        Store relevant data to be used later on to create user or item space dataframes.

        :param model:
        :param user:
        :param ratings_dataset:
        :return:
        """
        if type(model) is not Recommender:
            raise ValueError("Please input a Recommender object for the model argument")
        if type(user) is not UserProfile:
            raise ValueError("Please input a UserProfile object for the user argument")
        self.trainset = model.trainset
        self.profile = user.profile["movie_ids"]
        self.profile_innerIDs = [self.trainset.to_inner_iid(x) for x in self.profile]
        self.movie_innerIDs = list(self.trainset.all_items())
        self.user_innerIDs = list(self.trainset.all_users())
        self.recommended_movieIDs = model.recommendations["movieIds"]
        self.movies_dataset = movies_dataset.data

    def find_item_based_recommendations(self):
        if self.type != "item":
            raise ValueError("This method works only on item data")
        euc_sim = euclidean_similarity_matrix(self.data)
        similar_items = np.argsort(euc_sim, axis=1)[:, 1:3]
        similar_to_rated = similar_items[self.profile_innerIDs]
        item_based_recs = []
        for i in similar_to_rated:
            for j in i:
                if j not in item_based_recs:
                    item_based_recs.append(j)
        self.item_based_recs = item_based_recs
    def find_KNN(self):
        if self.type != "user":
            raise ValueError("this method works only on user data")
        KNN_model = NearestNeighbors(n_neighbors=5, metric='euclidean')
        KNN_model.fit(self.data)
        self.neighbors = KNN_model.kneighbors([self.data[0]], 6, return_distance=False).tolist()[0][1:]
        return self.neighbors

    def add_active_user_tags_and_genres(self):
        # find active user tags
        active_user_df = pd.DataFrame(data={'userId': [0],
                                            'rated_movies': [self.profile],
                                            'titles': np.nan,
                                            'favorite_tags': np.nan,
                                            'top_5_tags': np.nan,
                                            'favorite_genres': np.nan,
                                            'top_5_genres': np.nan})
        active_user_df = active_user_df.astype('object')
        lst = active_user_df['rated_movies'][0]
        active_user_df.at[0, 'titles'] = create_titles_col(lst, self.movies_dataset)
        movie_tag_lst = [self.movie_tags[(self.movie_tags.movieId == x)].reset_index()['tag'][0] for x in lst if
                         x in self.movie_tags.movieId.tolist()]
        movie_tag_lst = [ast.literal_eval(x) for x in movie_tag_lst]
        movie_tag_lst = list(itertools.chain.from_iterable(movie_tag_lst))
        tags = [[x[0]] * x[1] for x in movie_tag_lst]
        tags = list(itertools.chain.from_iterable(tags))
        tags = Counter(tags).most_common()
        active_user_df.at[0, 'favorite_tags'] = tags
        top_five = tags[:5]
        top_five = ["{} ({} movies)".format(x[0], x[1]) for x in top_five]
        top_five = ", ".join(top_five)
        active_user_df['top_5_tags'] = top_five

        # find active user genres
        genre_df = self.movies_dataset.copy()
        profile_df = genre_df[genre_df['movieId'].isin(self.profile)]
        genres = profile_df.iloc[:, 4:].sum(axis=0).sort_values(ascending=False)
        genres = list(zip(genres.index, genres.values))
        top_five = genres[:5]
        top_five = ["{} ({} movies)".format(x[0], x[1]) for x in top_five]
        top_five = ", ".join(top_five)
        active_user_df.at[0, 'favorite_genres'] = genres
        active_user_df['top_5_genres'] = top_five

        # add active user to other users
        new_user_tags = pd.concat([active_user_df, self.user_tags]).reset_index(drop=True)
        self.user_tags = new_user_tags

    def create_space_df(self):
        """
        Create dataframes for user/item data and perform preprocessing to create
        user and item spaces with reduced dimensions.

        :param dataset:
        :return:
        """
        if self.type == "item":
            self.data = pd.DataFrame(columns=['x', 'y'], data=self.data)
            self.data["innerId"] = self.movie_innerIDs
            self.data = self.data.merge(self.movies_dataset, how='left', left_on='innerId', right_on='innerId')
            self.data = self.data[["x", "y", "innerId", "movieId", "title", "genres"]]
            self.data["genres"] = self.data["genres"].apply(lambda x: x.replace("|", ", "))
            self.data = self.data.merge(self.movie_tags[['movieId', 'top_5_tags']], how='left', left_on='movieId',
                                        right_on='movieId')
            self.data[['top_5_tags']] = self.data[['top_5_tags']].fillna(value="no tags available")
            self.data["type"] = self.data["innerId"].apply(lambda x: "rated" if x in self.profile_innerIDs
                                                        else ("MF recommendation" if x in self.recommended_movieIDs
                                                        else ("item_recommended" if x in self.item_based_recs
                                                        else "other")))
        elif self.type == "user":
            self.data = pd.DataFrame(columns=['x', 'y'], data=self.data)
            self.data["innerId"] = self.user_innerIDs
            self.data["userId"] = self.data["innerId"].apply(lambda x: self.trainset.to_raw_uid(x))
            self.data = self.data.merge(self.user_tags[['userId', 'top_5_tags', 'top_5_genres']], how='left',
                                          left_on='userId', right_on='userId')
            self.data["type"] = self.data["innerId"].apply(
                lambda x: "self" if x == 0 else ("similar" if x in self.neighbors else "other"))
        else:
            raise ValueError("This method should be applied to an instance of type 'user' or 'item' only")

    def label_neighbor_recommendations(self, neighbors: list, ratings_dataset: object):
        if self.type != "item":
            raise ValueError("This method works only on item data")
        self.data = label_neighbor_rated(ratings_dataset.data, self.data, self.trainset, neighbors)
        self.data = find_final_recommendations(self.recommended_movieIDs, self.data)
    def retrieve_user_rated_movies(self):
        # TODO: find movies liked by each user instead of merely rated by a user
        df = self.user_tags[['userId', 'titles']].copy()
        df['titles'] = df['titles'].apply(lambda x: ast.literal_eval(x) if type(x) == str else x)
        df.rename(columns={"userId": "id", "titles": "movies"}, inplace=True)
        df = df.convert_dtypes()
        df.id = df.id.astype('int32')
        json = df.to_json(orient='records')
        return json

    def retrieve_user_space_data(self):
        if self.type != "user":
            raise ValueError("This method works only on user data")
        df = self.data[['userId', 'x', 'y', 'top_5_genres', 'top_5_tags', 'type']].copy()
        df.rename(columns={"userId":"id", "top_5_genres":"favoriteGenres", "top_5_tags":"favoriteTags"}, inplace=True)
        df = df.convert_dtypes()
        df.id = df.id.astype('int32')
        dict = df.to_dict(orient='records')
        return dict
    def retrieve_item_space_data(self):
        if self.type != "item":
            raise ValueError("This method works only on item data")
        df = self.data[['innerId', 'x', 'y', 'title', 'genres', 'top_5_tags', 'type']].copy()
        df.rename(columns={"innerId":"id", "top_5_tags":"tags"}, inplace=True)
        filtered = df[(df.type == "item_recommended")]["title"]
        print(filtered)
        poster_df = pd.read_csv('./data/preprocessed_data/movie_poster_links.csv')
        poster_df = poster_df[["title", "poster"]]
        df = df.merge(poster_df, how="left", left_on="title", right_on="title")
        df = df.convert_dtypes()
        df.id = df.id.astype('int32')
        dict = df.to_dict(orient='records')
        return dict
