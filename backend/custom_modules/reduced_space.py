import pandas as pd
import numpy as np
from itertools import chain
from collections import Counter
from sklearn.neighbors import NearestNeighbors
from .recommender import Recommender
from .user import UserProfile
from .dataset import Dataset
from .neighbor_labeling import label_neighbor_rated, find_final_recommendations
from .preprocessing_functions import create_titles_col
from .distance_functions import euclidean_similarity_matrix

class ReducedSpace:

    def __init__(self, data, type):
        if type != "item" and type != "user":
            raise ValueError("The space type must be either 'item' or 'user'")
        self.type = type
        self.data = data
        self.movie_info = pd.read_json('./data/preprocessed_data/movie_tags_and_genres.json')
        self.user_info = pd.read_json('./data/preprocessed_data/user_tags_and_genres.json')
        self.tags = Dataset("tags")
        self.tags.csv_to_df("ml-latest-small")
        self.profile = None
        self.profile_innerIDs = None
        self.liked_movies = None
        self.liked_movies_innerIDs = None
        self.movie_innerIDs = None
        self.user_innerIDs = None
        self.recommended_movieIDs = None
        self.movies_dataset = None
        self.ratings_dataset = None
        self.trainset = None
        self.neighbors = None
        self.item_based_recs = None

    def preprocess(self, model: object, user: object, movies_dataset: object, ratings_dataset: object):
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
        self.liked_movies = user.liked_movies
        self.liked_movies_innerIDs = [self.trainset.to_inner_iid(x) for x in self.liked_movies]
        self.movie_innerIDs = list(self.trainset.all_items())
        self.user_innerIDs = list(self.trainset.all_users())
        self.recommended_movieIDs = model.recommendations["movieIds"]
        self.movies_dataset = movies_dataset.data
        self.ratings_dataset = ratings_dataset.data

    def find_item_based_recommendations(self):
        if self.type != "item":
            raise ValueError("This method works only on item data")
        euc_sim = euclidean_similarity_matrix(self.data)
        similar_items = np.argsort(euc_sim, axis=1)[:, 1:3]
        similar_to_liked = similar_items[self.liked_movies_innerIDs]
        item_based_recs = []
        for i in similar_to_liked:
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

    def add_liked_movies_by_active_user(self):
        if self.type != "item":
            raise ValueError("This method works only on item data")
        # add the active user to the liked_by column in movie_info
        for iid in self.liked_movies:
            ind = self.movie_info[(self.movie_info.movieId == iid)].index[0]
            lst = self.movie_info.at[ind, 'liked_by']
            lst.append(0)
            self.movie_info.at[ind, 'liked_by'] = lst

    def add_active_user_tags_and_genres(self):
        if self.type != "user":
            raise ValueError("this method works only on user data")

        # Find Movie Tags Associated with the Active User

        # find movies with tags
        movies_with_tags = self.tags.data.movieId.sort_values().unique().tolist()

        # create a dataframe to eventually store tags, genres, and liked movies for the active user
        active_user_df = pd.DataFrame(data={'userId': [0],
                                            'liked_movies': np.nan,
                                            'titles': np.nan,
                                            'favorite_tags': np.nan,
                                            'top_5_tags': np.nan,
                                            'favorite_genres': np.nan,
                                            'top_5_genres': np.nan})
        active_user_df = active_user_df.astype('object')
        # store liked movies
        active_user_df.at[0, 'liked_movies'] = self.liked_movies
        # filter ratings to find liked movies for active user
        df = self.ratings_dataset[(self.ratings_dataset.rating >= 4) & (self.ratings_dataset.userId == 0)].iloc[:, :2]
        #  find liked movies with tags
        df.movieId = df.movieId.map(lambda x: x if x in movies_with_tags else np.nan)
        df.dropna(how='any', inplace=True)
        df.movieId = df.movieId.astype(int)
        movie_lst = df.movieId.tolist()
        # find tags associated with the active user based on liked movies
        all_tags = []
        for x in movie_lst:
            movie_tags = self.movie_info[(self.movie_info.movieId == x)]['tag'].values[0]
            for tag in movie_tags:
                all_tags.append([tag[0]])
        all_tags = list(chain.from_iterable(all_tags))
        tag_count = Counter(all_tags).most_common()
        # store info in active user dataframe
        active_user_df.at[0, 'favorite_tags'] = tag_count
        # find top five tags for the active user and store it
        top_five = tag_count[:5]
        top_five = ["{} ({} movies)".format(x[0], x[1]) for x in top_five]
        top_five = ", ".join(top_five)
        active_user_df.at[0, 'top_5_tags'] = top_five

        # Find Movie Genres and Top Genres for the Active User

        # find count of genres for the active user
        df_genre = self.movies_dataset.copy()
        df_profile = df_genre[df_genre['movieId'].isin(self.liked_movies)]
        genres = df_profile.iloc[:, 4:].sum(axis=0).sort_values(ascending=False)
        genres = list(zip(genres.index, genres.values))
        active_user_df.at[0, 'favorite_genres'] = genres
        # find the top 5 genres for the active user and store it
        top_five = genres[:5]
        top_five = ["{} ({} movies)".format(x[0], x[1]) for x in top_five]
        top_five = ", ".join(top_five)
        active_user_df.at[0, 'top_5_genres'] = top_five
        # add movie titles
        active_user_df.at[0, 'titles'] = \
            active_user_df['liked_movies'].apply(create_titles_col, args=(self.movies_dataset,)).values[0]
        # add active user to other users
        new_user_info = pd.concat([active_user_df, self.user_info]).reset_index(drop=True)
        self.user_info = new_user_info

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
            self.data = self.data.merge(self.movie_info[['movieId', 'top_5_tags']], how='left', left_on='movieId',
                                        right_on='movieId')
            self.data['top_5_tags'] = self.data['top_5_tags'].fillna(value="no tags available")
            self.data["type"] = self.data["innerId"].apply(lambda x: "rated" if x in self.profile_innerIDs
                                                        else ("item_recommended" if x in self.item_based_recs
                                                        else ("MF recommendation" if x in self.recommended_movieIDs
                                                        else "other")))
        elif self.type == "user":
            self.data = pd.DataFrame(columns=['x', 'y'], data=self.data)
            self.data["innerId"] = self.user_innerIDs
            self.data["userId"] = self.data["innerId"].apply(lambda x: self.trainset.to_raw_uid(x))
            self.data = self.data.merge(self.user_info[['userId', 'top_5_tags', 'top_5_genres']], how='left',
                                          left_on='userId', right_on='userId')
            self.data["type"] = self.data["innerId"].apply(
                lambda x: "self" if x == 0 else ("similar" if x in self.neighbors else "other"))
        else:
            raise ValueError("This method should be applied to an instance of type 'user' or 'item' only")

    def label_neighbor_recommendations(self, neighbors: list):
        if self.type != "item":
            raise ValueError("This method works only on item data")
        self.data = label_neighbor_rated(self.ratings_dataset, self.data, self.trainset, neighbors)
        self.data = find_final_recommendations(self.recommended_movieIDs, self.data)

    def retrieve_movies_per_user(self):
        if self.type != "user":
            raise ValueError("This method works only on user data")
        df = self.user_info[['userId', 'titles']].copy()
        df.rename(columns={"userId": "id", "titles": "movies"}, inplace=True)
        df = df.convert_dtypes()
        df.id = df.id.astype('int32')
        json = df.to_json(orient='records')
        return json

    def retrieve_users_per_movie(self):
        if self.type != "item":
            raise ValueError("This method works only on item data")
        df = self.movie_info[['movieId', 'title', 'liked_by']].copy()
        df.rename(columns={"movieId": "id"}, inplace=True)
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
        poster_df = pd.read_csv('./data/preprocessed_data/movie_poster_links.csv')
        poster_df = poster_df[["title", "poster"]]
        df = df.merge(poster_df, how="left", left_on="title", right_on="title")
        df = df.convert_dtypes()
        df.id = df.id.astype('int32')
        dict = df.to_dict(orient='records')
        return dict
