import {UserSpace} from "./UserSpace";
import {ItemSpace} from "./ItemSpace";
import {PosterList} from "./PosterList";
import {useState, useEffect} from "react";

export const Figures = ({initUserData,
                            initItemData,
                            userMovies,
                            movieUsers,
                            recommendedItems,
                            isGeneratingRecs,
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

    const [userData, setUserData] = useState([]);
    const [itemData, setItemData] = useState([]);
    const [userList, setUserList] = useState([]);
    const [itemList, setItemList] = useState([]);
    const [selectedItem, setSelectedItem] = useState(null);

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

    // Handling highlighting movies liked by a user when selected
    const handleUserSelect = (d, status) => {
        if (status) {
            let userLikedMovies = userMovies.find(user => user.id === d.id);
            userLikedMovies = userLikedMovies.movies
            let itemList = [];
            itemData.forEach(movie => {
                if (userLikedMovies.includes(movie.title)) {
                    itemList.push(movie.id);
                };
            });
            setItemList(itemList);
        } else {
            setItemList([]);
        };
    };

    // Handling user data updates
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

    // Handling user-based recommendations updates when selected users change
    const handleRecommendationsUpdate = () => {
        // Find movies rated by selected users
        const selectedUsers = userData.filter(user => user.color === userColors.similar);
        if (!selectedUsers) {
            itemData.map(item => item.color === itemColors.user_recommended ? item.color = itemColors.other : item.color)
            setItemData(itemData);
            return;
        }
        const selectedUserRatedMovies = userMovies.filter(user => {
            return selectedUsers.some(u => {return u.id === user.id})
        });
        let selectedMovies = []
        selectedUserRatedMovies.forEach(object => selectedMovies.push(...object.movies))
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
                setItemData ={setItemData}
                setIsLoadingPosters={setIsLoadingPosters}
            />
            <div className="Figures">
                <UserSpace
                    data={userData}
                    userDataUpdate={handleUserDataUpdate}
                    recommendationsUpdate={handleRecommendationsUpdate}
                    userSelect = {handleUserSelect}
                    userList = {userList}
                    userColors={userColors}
                />
                <ItemSpace
                    data= {itemData}
                    userDataUpdate= {handleUserDataUpdate}
                    itemDataUpdate= {handleItemDataUpdate}
                    itemSelect = {handleItemSelect}
                    itemList= {itemList}
                    itemColors= {itemColors}
                    selectedItem = {selectedItem}
                    setSelectedItem = {setSelectedItem}
                />
            </div>
        </>
    );
};