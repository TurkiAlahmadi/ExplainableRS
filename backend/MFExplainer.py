from custom_modules import Dataset, UserProfile, Recommender, ReducedSpace
from sklearn.manifold import TSNE
import umap.umap_ as umap
import pandas as pd

class MFExplainer:
    """
    A layer to explain MF algorithms.
    """

    def __init__(self):
        # define datasets
        self.ratings = Dataset("ratings")
        self.movies = Dataset("movies")
        # add active user
        self.user = UserProfile(active=True)
        # define other properties
        self.model = None
        self.recommendations = None
        self.item_space = None
        self.user_space = None

        # convert data in CSV files into dataframes and store them into the "data" attribute
        self.ratings.csv_to_df("ml-latest-small")
        self.movies.csv_to_df("ml-latest-small")
        # drop timestamp column
        self.ratings.drop_column("timestamp")
        # edit movie titles
        self.movies.edit_movie_title()
        # filter out users and movies based on a preset minimum number of ratings
        self.ratings.filter_by_ratings(self.movies)
        # add a column for each genre in the movie dataframe
        self.movies.add_genre_columns()

    def get_recommendation_data(self, movie_titles, movie_ratings):
        # add movies to user profile
        profile = self.user.add_movies(movie_titles, movie_ratings, self.movies)
        # add active user profile to ratings dataset
        self.ratings.add_user_profile(profile)
        # add recommendation model and train data
        self.model = Recommender(ratings_dataset=self.ratings, random_state=36)
        self.model.train_model()
        # add movie internal IDs to the movie dataset
        self.movies.add_internal_movieID(self.model)
        # generate recommendations
        self.recommendations = self.model.generate_recommendations(self.movies, self.user.profile)
        return self.recommendations

    def get_user_and_item_data(self):
        # perform dimensionality reduction to user and item factors
        item_umap_model = umap.UMAP(n_components=2, n_neighbors=2, min_dist=0.9, metric='cosine', random_state=36)
        user_umap_model = umap.UMAP(n_components=2, n_neighbors=5, min_dist=0.0, metric='cosine', random_state=36)
        item_embeddings = item_umap_model.fit_transform(self.model.qi)
        user_embeddings = user_umap_model.fit_transform(self.model.pu)
        # create item & user spaces
        self.item_space = ReducedSpace(item_embeddings, "item")
        self.user_space = ReducedSpace(user_embeddings, "user")
        # find k nearest neighbors to the active user
        neighbors = self.user_space.find_KNN()
        # perform some preprocessing
        self.item_space.preprocess(self.model, self.user, self.movies, self.ratings)
        self.user_space.preprocess(self.model, self.user, self.movies, self.ratings)
        # add active user tag and genre info for rated movies
        self.user_space.add_active_user_tags_and_genres()
        # add liked movies by the active user
        self.item_space.add_liked_movies_by_active_user()
        # generate item-based recommendations
        self.item_space.find_item_based_recommendations()
        # create item and user space dataframes
        self.item_space.create_space_df()
        self.user_space.create_space_df()
        # label recommended movies based on neighbors
        self.item_space.label_neighbor_recommendations(neighbors)
        # retrieve liked movies by each user
        user_movies = self.user_space.retrieve_movies_per_user()
        # retrieve users who liked each movie
        movie_users = self.item_space.retrieve_users_per_movie()
        # retrieve user data
        user_data = self.user_space.retrieve_user_space_data()
        # retrieve item data
        item_data = self.item_space.retrieve_item_space_data()
        return user_movies, movie_users, user_data, item_data
