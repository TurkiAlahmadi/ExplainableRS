import {UserSpace} from "./UserSpace";
import {ItemSpace} from "./ItemSpace";
import {useState} from "react";

export const Figures = ({userColors, itemColors}) => {

    // Mock data
    // TODO: Create GET requests to fetch data.
    let initUserData = [
        {
            id:1,
            x:6,
            y:10,
            favoriteGenres: 'Comedy, Drama, Action',
            favoriteTags: 'funny, crude humor, emotional',
            type: "self"
        },
        {
            id:2,
            x:10,
            y:30,
            favoriteGenres: 'Mystery, Drama, Action',
            favoriteTags: 'suspenseful, plot twist, based on a book',
            type: "similar"
        },
        {
            id:3,
            x:10,
            y:2,
            favoriteGenres: 'War, Drama, Mystery',
            favoriteTags: 'suspenseful, based on a true story, psychological',
            type: "other"
        },
        {
            id:4,
            x:60,
            y:35,
            favoriteGenres: 'War, Drama, Mystery',
            favoriteTags: 'suspenseful, based on a true story, psychological',
            type: "other"
        }
    ];

    let initItemData = [
        {
            id:1,
            x:10,
            y:40,
            title: 'Toy Story',
            genres: 'anime',
            tags: 'funny, crude humor, emotional',
            type: "recommended"
        },
        {
            id:2,
            x:15,
            y:10,
            title: 'Whiplash',
            genres: 'drama',
            tags: 'funny, crude humor, emotional',
            type: "other"
        },
        {
            id:3,
            x:50,
            y:80,
            title: 'The Hunt',
            genres: 'drama',
            tags: 'funny, crude humor, emotional',
            type: "other"
        },
        {
            id:4,
            x:100,
            y:45,
            title: 'Memento',
            genres: 'drama',
            tags: 'funny, crude humor, emotional',
            type: "other"
        },
        {
            id:5,
            x:90,
            y:90,
            title: 'Coco',
            genres: 'anime',
            tags: 'funny, crude humor, emotional',
            type: "rated"
        },
        {
            id:6,
            x:100,
            y:85,
            title: 'The Godfather',
            genres: 'drama',
            tags: 'funny, crude humor, emotional',
            type: "other"
        },
    ];

    const userRatedMovies = [
        {
            id: 1,
            movies: ["Coco"]
        },
        {
            id: 2,
            movies: ["Toy Story", "Whiplash", "The Godfather"]
        },
        {
            id: 3,
            movies: ["Memento"]
        },
        {
            id: 4,
            movies: ["The Hunt"]
        }
    ];

    const recommendedItems = ["Toy Story", "The Godfather", "Memento", "The Hunt"];

    // Add color labels to datasets
    const updatedUserData = initUserData.map(user => ({
        ...user,
        color: userColors[user.type]
    }));
    const updatedItemData = initItemData.map(item => ({
        ...item,
        color: itemColors[item.type]
    }));
    console.log(updatedItemData)
    // Handling user data updates
    const [userData, setUserData] = useState(updatedUserData);
    const handleUserDataUpdate = (key,value) => {
        userData.map(user => user.id === key ? user.color = value : user.color)
        setUserData(userData);
    }

    // Handling item data updates
    const [itemData, setItemData] = useState(updatedItemData);
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
        <div className="Figures">
            <UserSpace
                data={userData}
                userDataUpdate={handleUserDataUpdate}
                itemDataUpdate={handleItemDataUpdate}
                userColors={userColors}
            />
            <ItemSpace data={itemData} />
        </div>
    );
};