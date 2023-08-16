from custom_modules import Dataset
import numpy as np
from collections import Counter
from functools import reduce
import os

##### Define Preprocessing Functions #####

def edit_title(movie_title):
    """
    Edit some movie titles by replacing "The" at the beginning of the title.

    :param: a movie title
    :return: a modified movie title, if applicable
    """
    if ", The" in movie_title:
        title = movie_title.split(", The")
        title = "The " + title[0] + title[1]
        return title
    else:
        return movie_title

def create_titles_col(lst, movies_df):
    """
    convert list of movie ids to list of movie titles
    :param lst: a list of movie IDs
    :param movies_df: movies dataframe
    :return: a list of movie titles corresponding to the ids in the input
    """
    title_lst = []
    for iid in lst:
        title_lst.append(movies_df[(movies_df.movieId == iid)]['title'].values[0])
    return title_lst

def movie_tag_count(lst):
    """
    count tag frequency for a movie.

    :param lst: a list of tags
    :return: a list of tuples containing tags and tag frequencies for a movie
    """
    tag_count = Counter(lst).most_common()
    return tag_count

def movie_top_5_tags(lst):
    """
    find the 5 most frequent tags for a movie.

    :param lst: a list of tuples containing tags and tag frequencies
    :return: a string of the top 5 tags for a movie
    """
    top_five = lst[:5]
    top_five = ["{}".format(x[0]) for x in top_five]
    top_five = ", ".join(top_five)
    return top_five

def user_tag_count(uid):
    """
    find all tags associated with users based on movies they rated.

    :param uid: user id
    :return: a list of tuples containing tags and tag frequencies for a user
    """
    lst = df_user_tags[(df_user_tags.userId == uid)].reset_index()['movieId'][0]
    counters_lst = [df_movie_tags[(df_movie_tags.movieId == x)].reset_index()['tag'][0] for x in lst]
    merged_dict = reduce(lambda x,y: x+y, counters_lst)
    merged_dict = sorted(merged_dict, key = lambda x: x[1], reverse = True)
    return merged_dict

def user_top_5(lst):
    """
    find the 5 most frequent tags for a movie.

    :param lst: a list of tuples containing tags and tag frequencies
    :return: a string of the top 5 tags for a user
    """
    top_five = lst[:5]
    top_five = ["{} ({} movies)".format(x[0], x[1]) for x in top_five]
    top_five = ", ".join(top_five)
    return top_five

def add_genre_columns(movie_dataset):
    """

    :param movie_dataset: the MovieLens movies dataframe
    :return: a dataframe with movies, their genres collected, and columns for each genre
    """
    dataset = movie_dataset.copy()
    # find unique genres and store them
    genres = []
    for i in list(dataset.genres.unique()):
        for g in i.split("|"):
            if g not in genres:
                genres.append(g)
    # Add genre columns
    for i in genres:
        dataset[i] = dataset.genres.apply(lambda x: 1 if i in x else 0)
    return dataset

def count_user_genres(uid):
    user_df = df_user_genres[(df_user_genres.userId == uid)]
    merged_df = user_df.merge(df_movie_genres, left_on='movieId', right_on='movieId')
    genre_count = merged_df.iloc[:,4:].sum().sort_values(ascending=False)
    return list(zip(genre_count.index, genre_count))

##### Data Loading and Basic Preprocessing #####

ratings = Dataset("ratings")
movies = Dataset("movies")
tags = Dataset("tags")
# convert data in CSV files into dataframes and store them into the "data" attribute
ratings.csv_to_df("ml-latest-small")
movies.csv_to_df("ml-latest-small")
tags.csv_to_df("ml-latest-small")
# drop timestamp columns
ratings.drop_column("timestamp")
tags.drop_column("timestamp")
# edit movie titles
movies.data.title = movies.data.title.apply(edit_title)

##### Find Movie Tags #####

# find tags for each movie
df_movie_tags = tags.data.iloc[:,1:3]
df_movie_tags = df_movie_tags.groupby('movieId').agg(lambda x: x.tolist()).reset_index()
# store only movies that have tags
movies_with_tags = df_movie_tags.movieId.tolist()
# find frequency of tags for each movie
df_movie_tags['tag'] = df_movie_tags['tag'].apply(movie_tag_count)
# find top five tags for each movie
df_movie_tags['top_5_tags'] = df_movie_tags['tag'].apply(movie_top_5_tags)

##### Find Movie Tags Associated with Users #####

# create a dataframe to eventually store movie tags for users and create a list
# of movies for each user
df_user_tags = ratings.data.iloc[:,:2]
df_user_tags.movieId = df_user_tags.movieId.map(lambda x: x if x in movies_with_tags else np.nan)
df_user_tags.dropna(how='any', inplace=True)
df_user_tags.movieId = df_user_tags.movieId.astype(int)
df_user_tags = df_user_tags.groupby('userId').agg(lambda x: x.tolist()).reset_index()
# add movie titles
df_user_tags['titles'] = df_user_tags['movieId'].apply(create_titles_col, args=(movies.data,))
# find tags associated with users based on movies they rated
df_user_tags['favorite_tags'] = df_user_tags.userId.apply(user_tag_count)
# find top five tags for each user
df_user_tags['top_5_tags'] = df_user_tags['favorite_tags'].apply(user_top_5)

##### Find Movie Genres and Top Genres for Each User #####

# create a new dataframe for movie genres and create a column for
# each genre to find top genes for users later on
df_movie_genres = add_genre_columns(movies.data)
# seperate movie genres with commas
df_movie_genres['genres'] = df_movie_genres['genres'].map(lambda x: x.replace("|", ", "))
# create a final dataframe including all information about genres and tags
df_movie_info = df_movie_genres[['movieId', 'title', 'genres']]
df_movie_info = df_movie_info.merge(df_movie_tags, left_on='movieId', right_on='movieId')

# find rated movies for each user
df_user_genres = ratings.data.iloc[:,:2]
# create a new dataframe for user info
df_user_info = df_user_tags[['userId', 'movieId', 'titles','favorite_tags','top_5_tags']]
df_user_info = df_user_info.rename(columns={"movieId": "rated_movies"})
# find count of genres for each user
df_user_info['favorite_genres'] = df_user_info['userId'].apply(count_user_genres)
df_user_info['top_5_genres'] = df_user_info['favorite_genres'].apply(user_top_5)

##### Store Preprocessed Data #####

os.makedirs('./data/preprocessed_data', exist_ok=True)
df_movie_info.to_csv('./data/preprocessed_data/movie_tags_and_genres.csv')
df_user_info.to_csv('./data/preprocessed_data/user_tags_and_genres.csv')
