from custom_modules import Dataset
import numpy as np
from collections import Counter
from itertools import chain
import ast
import os


##### Define Preprocessing Functions #####

def edit_title(movie_title):
    """
    Edit some movie titles by removing "A", "An", and "The" from the end
    of a title and adding them at the beginning of the title.

    :param: a movie title
    :return: a modified movie title, if applicable
    """
    if ", The" in movie_title:
        title = movie_title.split(", The")
        title = "The " + title[0] + title[1]
        return title
    elif ", An" in movie_title:
        title = movie_title.split(", An")
        title = "An " + title[0] + title[1]
        return title
    elif ", A" in movie_title:
        title = movie_title.split(", A")
        title = "A " + title[0] + title[1]
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

def reset_tag_count(lst):
    """
    reset tag frequency to aggregate movie tags for each user.

    :param lst: a list of tags
    :return: a list of tuples containing tags and tag frequencies of 1 for a movie
    """
    tags = [x[0] for x in lst]
    counts = [1]*len(tags)
    return list(zip(tags, counts))

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
    lst = df_user_tags[(df_user_tags.userId == uid)]['movieId'].values[0]
    aggregated_user_tags = [df_movie_tags[(df_movie_tags.movieId == x)].reset_index()['user_tags'][0] for x in lst]
    aggregated_user_tags = list(chain.from_iterable(aggregated_user_tags))
    user_tags = Counter(i[0] for i in aggregated_user_tags).most_common()
    return user_tags

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
    user_df = df_user_liked[(df_user_liked.userId == uid)]
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
# store movies that have tags
movies_with_tags = df_movie_tags.movieId.tolist()
# find frequency of tags for each movie
df_movie_tags['tag'] = df_movie_tags['tag'].apply(movie_tag_count)
# find top five tags for each movie
df_movie_tags['top_5_tags'] = df_movie_tags['tag'].apply(movie_top_5_tags)
# resert each tag frequency to 1 to find aggregate user tags
df_movie_tags['user_tags'] = df_movie_tags['tag'].apply(reset_tag_count)

##### Find Movie Tags Associated with Users #####

# create a dataframe to eventually store movie tags for users and create a list of liked movies for each user
df_user_tags = ratings.data[(ratings.data.rating >= 4)]
df_user_tags = df_user_tags.iloc[:,:2]
df_user_tags.movieId = df_user_tags.movieId.map(lambda x: x if x in movies_with_tags else np.nan)
df_user_tags.dropna(how='any', inplace=True)
df_user_tags.movieId = df_user_tags.movieId.astype(int)
df_user_tags = df_user_tags.groupby('userId').agg(lambda x: x.tolist()).reset_index()
# find tags associated with users based on movies they liked
df_user_tags['favorite_tags'] = df_user_tags.userId.apply(user_tag_count)
# find top five tags for each user
df_user_tags['top_5_tags'] = df_user_tags['favorite_tags'].apply(user_top_5)

##### Find Movie Genres and Top Genres for Each User #####

# create a new dataframe for movie genres and create a column for each genre to find top genes for users later on
df_movie_genres = add_genre_columns(movies.data)
# seperate movie genres with commas
df_movie_genres['genres'] = df_movie_genres['genres'].map(lambda x: x.replace("|", ", "))
# create a final dataframe including all information about genres and tags
df_movie_info = df_movie_genres[['movieId', 'title', 'genres']]
df_movie_info = df_movie_info.merge(df_movie_tags, left_on='movieId', right_on='movieId', how='left')
df_movie_info.fillna("", inplace=True)

# find liked movies for each user
df_user_liked = ratings.data[(ratings.data.rating >= 4)]
df_user_liked = df_user_liked.iloc[:,:2]
# find count of genres for each user
df_user_genres = df_user_liked.groupby('userId').agg(lambda x: x.tolist()).reset_index()
df_user_genres['favorite_genres'] = df_user_genres['userId'].apply(count_user_genres)
df_user_genres['top_5_genres'] = df_user_genres['favorite_genres'].apply(user_top_5)
# add movie titles
df_user_genres['titles'] = df_user_genres['movieId'].apply(create_titles_col, args=(movies.data,))
# create a new dataframe for user info
df_user_info = df_user_genres.copy()
df_user_info = df_user_info.merge(df_user_tags, left_on='userId', right_on='userId', how='left',
                                  suffixes=('_genres', '_tags'))
df_user_info = df_user_info[['userId', 'movieId_genres', 'titles', 'favorite_tags', 'top_5_tags', 'favorite_genres',
                             'top_5_genres']]
df_user_info = df_user_info.rename(columns={"movieId_genres": "liked_movies"})
df_user_info.fillna("", inplace=True)

##### Find Users Who Liked Each Movie #####

# find liked movies for each user
df_movie_users = ratings.data[(ratings.data.rating >= 4)]
df_movie_users = df_movie_users.iloc[:,:2]
# find users who liked each movie
df_movie_users = df_movie_users.groupby('movieId').agg(lambda x: x.tolist()).reset_index()
df_movie_users = df_movie_users.rename(columns={"userId": "liked_by"})
# add the users as a column to the movie info dataframe
df_movie_info = df_movie_info.merge(df_movie_users, left_on='movieId', right_on='movieId', how='left')
# fill nans with empty lists
mask = df_movie_info['liked_by'].isna()
df_movie_info.loc[mask, 'liked_by'] = df_movie_info.loc[mask, 'liked_by'].fillna('[]').apply(ast.literal_eval)

##### Store Preprocessed Data #####

os.makedirs('./data/preprocessed_data', exist_ok=True)
df_movie_info.to_json('./data/preprocessed_data/movie_tags_and_genres.json')
df_user_info.to_json('./data/preprocessed_data/user_tags_and_genres.json')
