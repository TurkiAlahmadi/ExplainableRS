from custom_modules import Dataset, UserProfile, Recommender, ReducedSpace
from sklearn.manifold import TSNE
import umap.umap_ as umap

##################### Data Preprocessing #####################
# define datasets
ratings = Dataset("ratings")
movies = Dataset("movies")
#tags = Dataset("tags")
# convert data in CSV files into dataframes and store them into the "data" attribute
ratings.csv_to_df("ml-latest-small")
movies.csv_to_df("ml-latest-small")
# drop timestamp columns
ratings.drop_column("timestamp")
# edit movie titles
movies.edit_movie_title()
# find movie and user tags
#tags.preprocess_movie_tags()
#tags.preprocess_user_tags(ratings)
# filter out users and movies based on a preset minimum number of ratings
ratings.filter_by_ratings(movies)
# add a column for each genre in the movie dataframe
movies.add_genre_columns()

############## Active User Profile Interactions ##############
# add active user
active_user = UserProfile(active=True)
# mock data
movie_titles = ["Toy Story (1995)", "Sucker Punch (2011)"]
movie_ratings = [4.0, 4.5]
# add movies
df_profile = active_user.add_movies(movie_titles, movie_ratings, movies)
# add active user profile to ratings dataset
ratings.add_user_profile(df_profile)

#################### Generate Recommendations ####################
# add recommendation model and train data
model = Recommender(ratings_dataset=ratings, random_state=36)
model.train_model()
# add movie internal IDs to the movie dataset
movies.add_internal_movieID(model)
# generate recommendations
recommendations = model.generate_recommendations(movies, active_user.profile)

#################### Item & User Space Functionalities ####################
# dimensionality reduction
tsne = TSNE(n_components=2, n_iter=1000, verbose=0, random_state=36)
umap_model = umap.UMAP(n_components=2, n_neighbors=2, min_dist=0.9, metric='cosine')

item_embeddings = umap_model.fit_transform(model.qi)
user_embeddings = tsne.fit_transform(model.pu)

# create item & user space
item_space = ReducedSpace(item_embeddings, "item")
user_space = ReducedSpace(user_embeddings, "user")

# find k nearest neighbors to the active user
neighbors = user_space.find_KNN()

# perform some preprocessing
item_space.preprocess(model, active_user, movies)
user_space.preprocess(model, active_user, movies)

# add active user tag and genre info for rated movies
user_space.add_active_user_tags_and_genres()

# generate item-based recommendations
item_space.find_item_based_recommendations()

# create item and user space dataframes
item_space.create_space_df()
user_space.create_space_df()

# label recommended movies based on neighbors
item_space.label_neighbor_recommendations(neighbors, ratings)

# retrieve rated movies for each user
user_movies = user_space.retrieve_user_rated_movies()

# retrieve user data
user_data = user_space.retrieve_user_space_data()

# retrieve item data
item_data = item_space.retrieve_item_space_data()

#print("ratings dataset size: ", ratings.data.shape)
#print(item_data)
#print(type(user_movies))