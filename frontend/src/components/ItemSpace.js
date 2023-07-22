import * as d3 from 'd3'
import {useState} from "react";

export const ItemSpace = ({ data }) => {

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
        .range([ 400, 0]);

    const [item, setItem] = useState({});
    const [hover, setHover] = useState(false);

    const hoverOn = (d) => {
        setItem({"title": d.title, "genres": d.genres, "tags": d.tags})
        setHover(true)
    }
    const hoverOff = () => {
        setItem({"title": "", "genres": "", "tags": ""})
        setHover(false)
    };

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
            />
        );
    });
    return (
        <>
            <svg className="item-space" width={width} height={height}>
                {createMarks}
            </svg>
            {
                hover && <div className="item-hover">Movie Title: {item.title}
                    <br/>Genres: {item.genres}
                    <br/>Tags: {item.tags}</div>
            }
        </>
    );
};