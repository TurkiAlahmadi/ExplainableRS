import {UserSpace} from "./UserSpace";
import {ItemSpace} from "./ItemSpace";
import {useState, useEffect} from "react";
import {PosterList} from "./PosterList";

export const Figures = ({initUserData, initItemData, userRatedMovies, recommendedItems}) => {

    const userColors = {
        self : "orangered",
        similar : "dodgerblue",
        other : "lightblue"
    }

    const itemColors = {
        other : "navajowhite",
        item_recommended : "limegreen",
        user_recommended : "dodgerblue",
        rated : "orangered"
    }

    const [userData, setUserData] = useState([]);
    const [itemData, setItemData] = useState([]);

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
    const handleUserDataUpdate = (key,value) => {
        userData.map(user => user.id === key ? user.color = value : user.color)
        setUserData(userData);
    }

    // Handling item data updates
    const handleItemDataUpdate = () => {
        // Find movies rated by selected users
        let selectedUsers = userData.filter(user => user.color === userColors.similar);
        if (!selectedUsers) {
            itemData.map(item => item.color === itemColors.user_recommended ? item.color = itemColors.other : item.color)
            setItemData(itemData);
            return;
        }
        let selectedUserRatedMovies = userRatedMovies.filter(user => {
            return selectedUsers.some(u => {return u.id === user.id})
        });
        let selectedMovies = []
        selectedUserRatedMovies.forEach(object => selectedMovies.push(...object.movies))
        selectedMovies = selectedMovies.flat()
        // Update the recommendations based on the selected users
        let updatedRecItems = selectedMovies.filter((movie1) => {
            return recommendedItems.some((movie2) => {
                return movie1 === movie2;
            });
        });
        // Erase previous recommendations
        itemData.map(item => item.color === itemColors.user_recommended ? item.color = itemColors.other : item.color)
        // Update data with new recommendations
        let filteredItemData = itemData.filter(item => updatedRecItems.includes(item.title));
        filteredItemData = filteredItemData.map(item => {
            let temp = Object.assign({}, item);
            temp.color = itemColors.user_recommended
            return temp;
        });
        let newItemData = itemData.map(movie => filteredItemData.find(m => m.id === movie.id) || movie);
        setItemData(newItemData);
    }

    return (
        <>
            <div className="Figures">
                <h4 id="user-space-title">User Space</h4>
                <p id="user-space-description">The user space displays all users. Hovering over users shows their preferneces below the figure.
                    Clicking on users allows labeling them as similar/other. Recommendations are updated based on similar users.
                </p>
                <UserSpace
                    data={userData}
                    userDataUpdate={handleUserDataUpdate}
                    itemDataUpdate={handleItemDataUpdate}
                    userColors={userColors}
                />
                <h4 id="item-space-title">Item Space</h4>
                <p id="item-space-description">The item space displays all movies. Item proximity equates
                    to how similarly they were rated by users. Hovering over a movie provides more details about it below the figure.
                </p>
                <ItemSpace
                    data={itemData}
                    itemColors={itemColors}
                />
            </div>
            <PosterList
                itemData={itemData}
                itemColors={itemColors}
            />
        </>
    );
};