import * as d3 from 'd3'
import { useState, useEffect, useRef } from "react";

export const UserSpace = ({data, userDataUpdate, itemDataUpdate, userColors}) => {

    // Define useState variables
    const [user, setUser] = useState({});
    const [hover, setHover] = useState(false);

    // Set width and height
    const margin = {top: 1, right: 1, bottom: 1, left: 1},
        width = 460 - margin.left - margin.right,
        height = 460 - margin.top - margin.bottom,
        legendWidth = 150,
        legendHeight = 200;

    const svgRef = useRef(null);
    const legendRef = useRef(null);

    useEffect(() => {
        const svg = d3.select(svgRef.current);
        const legendSvg = d3.select(legendRef.current);

        const x = d3.scaleLinear().domain([-5, 5]).range([0, width]);
        const y = d3.scaleLinear().domain([-5, 5]).range([height, 0]);

        const zoom = d3.zoom().scaleExtent([0.5, 10]).on("zoom", handleZoom);
        svg.call(zoom);

        function handleZoom(event) {
            const newTransform = event.transform;
            svg.selectAll("circle")
                .attr("transform", newTransform)
                .attr("r", 5 / newTransform.k) // Update the circle radius based on zoom scale
                .attr("stroke-width", 1 / newTransform.k); // Update the stroke width based on zoom scale
        }

        const createMarks = svg
            .selectAll("circle")
            .data(data)
            .enter()
            .append("circle")
            .attr("key", (d) => d.id)
            .attr("r", 5)
            .attr("cx", (d) => x(d.x))
            .attr("cy", (d) => y(d.y))
            .attr("opacity", 1)
            .attr("stroke", (d) => d.color)
            .attr("fill", (d) => d.color)
            .attr("fill-opacity", 0.5)
            .attr("stroke-width", 1)
            .on("mouseenter", (event, d) => hoverOn(d))
            .on("mouseleave", () => hoverOff())
            .on("click", (event, d) => handleClick(event, d.id));

        // Define interaction handlers
        function hoverOn(d) {
            setUser({"favoriteGenres": d.favoriteGenres, "favoriteTags": d.favoriteTags});
            setHover(true);
        }

        function hoverOff() {
            setUser({"favoriteGenres": "", "favoriteTags": ""});
            setHover(false);
        }

        function handleClick(event, userID) {
            let tempColor = event.currentTarget.getAttribute('fill');
            if (tempColor === userColors["self"]) return;
            else if (tempColor === userColors["similar"]) tempColor = userColors["other"];
            else if (tempColor === userColors["other"]) tempColor = userColors["similar"];

            event.currentTarget.setAttribute('fill', tempColor);
            userDataUpdate(userID, tempColor);
            itemDataUpdate();

            svg.selectAll("circle")
                .attr("fill", (d) => d.color)
                .attr("stroke", (d) => d.color);
        }

        const legend = legendSvg.append("g")
            .attr("class", "legend")
            .attr("transform", `translate(10, 10)`) // Adjust the position
            .attr("stroke", "black") // Add border
            .attr("stroke-width", 1);

        const legendData = [
            { label: "You", color: userColors.self },
            { label: "Similar", color: userColors.similar },
            { label: "Other", color: userColors.other },
        ];

        const legendItems = legend.selectAll(".legend-item")
            .data(legendData)
            .enter().append("g")
            .attr("class", "legend-item")
            .attr("transform", (d, i) => `translate(0, ${i * 20})`);

        legendItems.append("circle")
            .attr("r", 5)
            .attr("cx", 10)
            .attr("fill", d => d.color)
            .attr("opacity", 1)
            .attr("stroke", d => d.color)
            .attr("fill-opacity", 0.5)
            .attr("stroke-width", 1);

        legendItems.append("text")
            .attr("x", 20)
            .attr("dy", "0.35em")
            .style("font-size", "14px")
            .style("font-weight", "normal")
            .text(d => d.label);

    }, [data, userDataUpdate, itemDataUpdate, userColors]);

    return (
        <div style={{ display: "flex" }}>
            <svg
                className="user-space"
                width={width}
                height={height}
                ref={svgRef}
            />
            <svg
                className="user-legend"
                width={legendWidth}
                height={legendHeight}
                ref={legendRef}
            />
            {hover && (
                <div className="user-hover">
                    Favorite Genres: {user.favoriteGenres}
                    <br />
                    <br />
                    Favorite Tags: {user.favoriteTags}
                </div>
            )}
        </div>
    );
};