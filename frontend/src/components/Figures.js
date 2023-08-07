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
        recommended : "limegreen",
        rated : "mediumpurple",
        other : "navajowhite"
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
        let selectedUsers = userData.filter(user => user.color === userColors["similar"]);
        if (!selectedUsers) {
            itemData.map(item => item.color === itemColors["recommended"] ? item.color = itemColors["other"] : item.color)
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
        itemData.map(item => item.color === itemColors["recommended"] ? item.color = itemColors["other"] : item.color)
        // Update data with new recommendations
        let filteredItemData = itemData.filter(item => updatedRecItems.includes(item.title));
        filteredItemData = filteredItemData.map(item => {
            let temp = Object.assign({}, item);
            temp.color = itemColors["recommended"]
            return temp;
        });
        let newItemData = itemData.map(movie => filteredItemData.find(m => m.id === movie.id) || movie);
        setItemData(newItemData);
    }

    return (
        <>
            <div className="Figures">
                <UserSpace
                    data={userData}
                    userDataUpdate={handleUserDataUpdate}
                    itemDataUpdate={handleItemDataUpdate}
                    userColors={userColors}
                />
                <ItemSpace
                    data={itemData}
                    itemColors={itemColors}
                />
            </div>
            <PosterList itemData={itemData}/>
        </>
    );
};