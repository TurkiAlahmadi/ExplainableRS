from custom_modules import Dataset, UserProfile, Recommender, ReducedSpace
from sklearn.manifold import TSNE

#################### Data Preprocessing ####################
# define datasets
ratings = Dataset("ratings")
movies = Dataset("movies")
# convert data in CSV files into dataframes and store them into the "data" attribute
ratings.csv_to_df("ml-latest-small")
movies.csv_to_df("ml-latest-small")
# drop timestamp column
ratings.drop_column("timestamp")
# filter out users and movies based on a preset minimum number of ratings
ratings.filter_by_ratings(movies)
# add a column for each genre in the movie dataframe
movies.add_genre_columns()

#################### Active User Profile Interactions ####################
# add active user
active_user = UserProfile(active=True)
# mock data
movie_titles = ["Toy Story (1995)", "Grumpier Old Men (1995)"]
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
recommendations = model.generate_recommendations(movies, n_recs=100)

#################### Item & User Space Functionalities ####################
# dimensionality reduction
tsne = TSNE(n_components=2, n_iter=1000, verbose=0, random_state=36)
item_embeddings = tsne.fit_transform(model.qi)
user_embeddings = tsne.fit_transform(model.pu)

# create item & user space
item_space = ReducedSpace(item_embeddings, "item")
user_space = ReducedSpace(user_embeddings, "user")

# perform some preprocessing
item_space.store_user_item_data(model=model, user=active_user, ratings)
item_space.preprocess(movies)

#print("ratings dataset size: ", ratings.data.shape)
#print("movies dataset size: ", movies.data.shape)
print(movies.data.head())