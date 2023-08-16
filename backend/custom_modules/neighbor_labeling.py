
# functions used to label users and items based on neighborhood information

def liked_by_similar_users(ratings_dataset, raw_userId, trainset, min_rating):
    lst = ratings_dataset[(ratings_dataset["userId"] == raw_userId) & (ratings_dataset["rating"] >= min_rating)]["movieId"].to_list()
    inner_iids = [trainset.to_inner_iid(x) for x in lst]
    return inner_iids

def label_neighbor_rated(ratings_dataset, item_space, trainset, neighbors):
    for n in neighbors:
        uid = trainset.to_raw_uid(n)
        neighbor_rated = liked_by_similar_users(ratings_dataset, uid, trainset, min_rating=4)
        for i in neighbor_rated:
            item_type = item_space[(item_space['innerId'] == i)]['type'].values[0]
            if item_type == "MF recommendation":
                item_space.loc[item_space[item_space['innerId'] == i].index.values[0], ['type']] = "user_recommended"
    return item_space

def find_final_recommendations(recommended_movieId, item_space):
    for i in recommended_movieId:
        if item_space[(item_space['innerId']==i)]['type'].values[0] == "MF recommendation":
            item_space.loc[item_space[item_space['innerId'] == i].index.values[0], ['type']] = 'other'
    return item_space