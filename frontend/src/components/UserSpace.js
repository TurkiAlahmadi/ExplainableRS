import * as d3 from 'd3'
import { useState } from "react";

export const UserSpace = ({data, userDataUpdate, itemDataUpdate, userColors}) => {

    // Set width and height
    const margin = {top: 1, right: 1, bottom: 1, left: 1},
        width = 480 - margin.left - margin.right,
        height = 480 - margin.top - margin.bottom;

    // Add X axis
    const x = d3.scaleLinear()
        .domain([0, 100])
        .range([0, 400]);

    // Add Y axis
    const y = d3.scaleLinear()
        .domain([0, 100])
        .range([400, 0]);

    // Define useState variables
    const [user, setUser] = useState({});
    const [hover, setHover] = useState(false);

    // Define interaction handlers
    const hoverOn = (d) => {
        setUser({"favoriteGenres": d.favoriteGenres, "favoriteTags": d.favoriteTags})
        setHover(true)
    };
    const hoverOff = () => {
        setUser({"favoriteGenres": "", "favoriteTags": ""})
        setHover(false)
    };
    const handleClick = (event, userID) => {
        let tempColor = event.currentTarget.getAttribute('fill')
        console.log(tempColor)
        if (tempColor === userColors["self"]) return;
        else if (tempColor === userColors["similar"]) {tempColor = userColors["other"];
        } else if (tempColor === userColors["other"]) {tempColor = userColors["similar"];
        }
        event.currentTarget.setAttribute('fill', tempColor);
        userDataUpdate(userID, tempColor);
        itemDataUpdate();
    }

    const createMarks = data.map(d => {
        return (
            <circle
                key={d.id}
                r={6} // radius
                cx={x(d.x)} // x-axis position
                cy={y(d.y)} // y-axis position
                opacity={1}
                stroke={d.color}
                fill={d.color}
                fillOpacity={0.6}
                strokeWidth={1}
                onMouseEnter={() => hoverOn(d)}
                onMouseLeave={() => hoverOff()}
                onClick={(event) => handleClick(event, d.id)}
            />
        );
    });
    return (
        <>
            <svg className="user-space" width={width} height={height}>
                {createMarks}
            </svg>
            {
                hover && <div className="user-hover">Favorite Genres: {user.favoriteGenres}
                <br/>Favorite Tags: {user.favoriteTags}</div>
            }
        </>
    );
};