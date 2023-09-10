import React, {useState, useEffect} from "react";
import {UserSpace} from "./UserSpace";
import {ItemSpace} from "./ItemSpace";
import {PosterList} from "./PosterList";

export const Figures = ({initUserData,
                            initItemData,
                            userMovies,
                            movieUsers,
                            recommendedItems,
                            setIsLoadingPosters}) => {

    const userColors = {
        self: "orangered",
        similar: "royalblue",
        other: "lightblue",
        highlighted: "black",
    }

    const itemColors = {
        other: "burlywood",
        item_recommended: "limegreen",
        user_recommended: "royalblue",
        rated: "orangered",
        selected: "black",
    }

    // Define state variables
    const [userData, setUserData] = useState([]);
    const [itemData, setItemData] = useState([]);
    const [userList, setUserList] = useState([]);
    const [itemList, setItemList] = useState([]);
    const [selectedItem, setSelectedItem] = useState(null);
    const [selectedPosterTitle, setSelectedPosterTitle] = useState(false);
    const [clickChange, setClickChange] = useState(false);

    useEffect(() => {
        if (initUserData && initItemData) {
            // Add color labels to datasets
            const updatedUserData = initUserData.map((user) => ({
                ...user,
                color: userColors[user.type],
            }));
            setUserData(updatedUserData);

            // Initialize item data with colors
            const updatedItemData = initItemData.map((item) => ({
                ...item,
                color: itemColors[item.type],
            }));
            setItemData(updatedItemData);
        }
    }, [initUserData, initItemData]);

    // Handling user data updates
    const handleUserDataUpdate = (d, value) => {
        userData.map(user => user.id === d.id ? user.color = value : user.color)
        setUserData(userData);
    };

    // Handling item data updates
    const handleItemDataUpdate = (d, value) => {
        itemData.map(item => item.id === d.id ? item.color = value : item.color)
        setItemData(itemData);
    };

    // Handling highlighting users who liked a movie when selected
    const handleItemSelect = (d, status) => {
        setSelectedItem(d);
        if (status) {
            const selectedMovie = movieUsers.find(movie => movie.title === d.title);
            if (selectedMovie) {
                setUserList(selectedMovie['liked_by']);
            } else setUserList([])
        } else {
            setUserList([]);
        };
    };

    // Handling clicking on poster titles
    const handlePosterTitleClick = (title) => {
        if (!title) {
            setClickChange(true);
            setSelectedPosterTitle(title);
        } else if (selectedPosterTitle === title) {
            setClickChange(false);
            setSelectedPosterTitle(null);
        } else {
            setClickChange(true);
            setSelectedPosterTitle(title);
        }
    };

    // Handling user-based recommendations updates when selected users change
    const handleRecommendationsUpdate = () => {
        // Find movies rated by selected users
        const selectedUsers = userData.filter(user => user.color === userColors.similar);
        if (!selectedUsers) {
            itemData.map(item => item.color === itemColors.user_recommended ? item.color = itemColors.other : item.color)
            setItemData(itemData);
            return;
        }
        const selectedUsersLikedMovies = userMovies.filter(user => {
            return selectedUsers.some(u => {return u.id === user.id})
        });
        let selectedMovies = []
        selectedUsersLikedMovies.forEach(object => selectedMovies.push(...object.movies))
        selectedMovies = selectedMovies.flat()
        // Update the recommendations based on the selected users
        const updatedRecItems = selectedMovies.filter((movie1) => {
            return recommendedItems.some((movie2) => {
                return movie1 === movie2;
            });
        });
        // Erase previous recommendations
        itemData.map(item => item.color === itemColors.user_recommended ? item.color = itemColors.other : item.color)
        // Update data with new recommendations
        let filteredItemData = itemData.filter(item => updatedRecItems.includes(item.title));
        filteredItemData = filteredItemData.map(item => {
            const temp = Object.assign({}, item);
            temp.color = itemColors.user_recommended
            return temp;
        });
        const newItemData = itemData.map(movie => filteredItemData.find(m => m.id === movie.id) || movie);
        setItemData(newItemData);
    }

    return (
        <>
            <PosterList
                itemData={itemData}
                itemColors={itemColors}
                setIsLoadingPosters={setIsLoadingPosters}
                onPosterTitleClick={handlePosterTitleClick}
            />
            <div className="Figures">
                <UserSpace
                    data={userData}
                    userDataUpdate={handleUserDataUpdate}
                    recommendationsUpdate={handleRecommendationsUpdate}
                    userList = {userList}
                    userColors={userColors}
                />
                <ItemSpace
                    data= {itemData}
                    itemDataUpdate= {handleItemDataUpdate}
                    itemSelect = {handleItemSelect}
                    itemColors= {itemColors}
                    itemList= {itemList}
                    selectedItem = {selectedItem}
                    setSelectedItem = {setSelectedItem}
                    selectedPosterTitle={selectedPosterTitle}
                    clickChange={clickChange}
                />
            </div>
        </>
    );
};