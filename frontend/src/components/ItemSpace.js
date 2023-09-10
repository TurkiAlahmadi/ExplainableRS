import * as d3 from 'd3';
import { useState, useEffect, useRef } from 'react';
import { ItemGenreSelectFilter } from "./ItemGenreSelectFilter";

export const ItemSpace = ({
                              data,
                              itemDataUpdate,
                              itemSelect,
                              itemColors,
                              itemList,
                              selectedItem,
                              setSelectedItem,
                              selectedPosterTitle,
                          }) => {
    const margin = { top: 1, right: 1, bottom: 1, left: 1 };
    const width = 440 - margin.left - margin.right;
    const height = 440 - margin.top - margin.bottom;
    const legendWidth = 130;
    const legendHeight = 200;

    // Calculate the minimum and maximum x and y values from your data
    const xMin = d3.min(data, (d) => d.x);
    const xMax = d3.max(data, (d) => d.x);
    const yMin = d3.min(data, (d) => d.y);
    const yMax = d3.max(data, (d) => d.y);

    const [item, setItem] = useState({});
    const [hover, setHover] = useState(false);
    const [selectedGenres, setSelectedGenres] = useState([]);
    const [zoomTransform, setZoomTransform] = useState(d3.zoomIdentity); // Store the current zoom transform

    const svgRef = useRef(null);
    const legendRef = useRef(null);
    const zoomRef = useRef(null); // Reference for the zoom behavior

    useEffect(() => {
        const legendSvg = d3.select(legendRef.current);

        const legend = legendSvg
            .append("g")
            .attr("class", "legend")
            .attr("transform", `translate(10, 10)`)
            .attr("stroke", "black")
            .attr("stroke-width", 1);

        const legendData = [
            { label: "Your Rated Movies", color: itemColors["rated"] },
            { label: "Liked by Similar Users", color: itemColors["user_recommended"] },
            { label: "Similar to Movies you Liked", color: itemColors["item_recommended"] },
            { label: "Selected", color: itemColors.selected },
            { label: "Other", color: itemColors.other },
        ];

        const legendItems = legend.selectAll(".legend-item")
            .data(legendData)
            .enter()
            .append("g")
            .attr("class", "legend-item")
            .attr("transform", (d, i) => `translate(0, ${i * 20})`);

        legendItems
            .append("circle")
            .attr("r", 5)
            .attr("cx", 10)
            .attr("fill", (d) => d.color)
            .attr("opacity", (d) => (d.color === itemColors.other ? 0.5 : 0.7))
            .attr("stroke", (d) => d.color)
            .attr("fill-opacity", (d) => (d.color === itemColors.other ? 0.4 : 0.5))
            .attr("stroke-width", 1);

        legendItems
            .append("text")
            .attr("x", 20)
            .attr("dy", "0.35em")
            .style("font-size", "12px")
            .style("font-weight", "lighter")
            .text((d) => d.label);

        // Cleanup function to remove the legend when the component unmounts
        return () => {
            legendSvg.selectAll(".legend").remove();
        };
    }, []);

    useEffect(() => {
        const svg = d3.select(svgRef.current);

        const x = d3.scaleLinear().domain([xMin, xMax]).range([0, width]);
        const y = d3.scaleLinear().domain([yMin, yMax]).range([height, 0]);

        const zoom = d3.zoom().scaleExtent([0.5, 10]).on("zoom", handleZoom);
        svg.call(zoom);
        zoomRef.current = zoom;

        function handleZoom(event) {
            setZoomTransform(event.transform); // Update the current zoom transform

            svg.selectAll("circle")
                .attr("transform", event.transform)
                .attr("r", (d) => (selectedPosterTitle === d.title ? (6 / event.transform.k) : (5 / event.transform.k)))
                .attr("stroke-width", (d) => (selectedPosterTitle === d.title ? (2 / event.transform.k) : (1 / event.transform.k)));
        }

        const createMarks = svg.selectAll("circle").data(data);

        createMarks
            .enter()
            .append("circle")
            .attr("key", (d) => d.id)
            .attr("r", 5)
            .attr("cx", (d) => x(d.x))
            .attr("cy", (d) => y(d.y))
            .attr("opacity", (d) => (d.color === itemColors.other ? 0.5 : 0.7))
            .attr("stroke", (d) => d.color)
            .attr("fill", (d) => d.color)
            .attr("fill-opacity", (d) => (d.color === itemColors.other ? 0.3 : 0.5))
            .attr("stroke-width", 1)
            .on("mouseenter", (event, d) => hoverOn(d))
            .on("mouseleave", () => hoverOff())
            .on("click", (event, d) => handleClick(event, d));

        if (selectedPosterTitle) {
            // Manually adjust the circle sizes based on the current zoom transform
            createMarks
                .attr("r", (d) => (selectedPosterTitle === d.title ? (7 / zoomTransform.k) : (5 / zoomTransform.k)))
                .attr("stroke-width", (d) => (selectedPosterTitle === d.title ? (3 / zoomTransform.k) : (1 / zoomTransform.k)));
            createMarks.exit().remove();
        } else {
            createMarks
                .attr("r", 5 / zoomTransform.k)
                .attr("stroke-width", 1 / zoomTransform.k);
        }

        if (selectedGenres.length > 0) {
            createMarks
                .attr("opacity", (d) => {
                    const itemGenres = d.genres.split(", ");
                    const filtered = selectedGenres.every(selectedGenre => itemGenres.includes(selectedGenre.value));
                    return filtered && d.color === itemColors.other ? 1 : filtered ? 1 : 0.4;
                })
                .attr("fill-opacity", (d) => {
                    const itemGenres = d.genres.split(", ");
                    const filtered = selectedGenres.every(selectedGenre => itemGenres.includes(selectedGenre.value));
                    return filtered && d.color === itemColors.other ? 0.7 : filtered ? 1 : 0.1;
                })
                .attr("stroke", (d) => d.color)
                .attr("fill", (d) => d.color);
            createMarks.exit().remove();
        } else {
            createMarks
                .attr("opacity", (d) => (d.color === itemColors.other ? 0.5 : 0.7))
                .attr("fill-opacity", (d) => (d.color === itemColors.other ? 0.3 : 0.5))
                .attr("fill", (d) => d.color)
                .attr("stroke", (d) => d.color);
        }

        function handleClick(event, d) {
            setSelectedItem((prevSelectedItem) => {
                if (prevSelectedItem && prevSelectedItem !== d) {
                    itemDataUpdate(prevSelectedItem, itemColors[prevSelectedItem.type]);
                }
            });
            let tempColor = event.currentTarget.getAttribute('fill');
            if (tempColor !== itemColors["selected"]) {
                tempColor = itemColors["selected"];
                itemSelect(d, true);
            } else {
                tempColor = itemColors[d.type];
                itemSelect(d, false);
            }
            itemDataUpdate(d, tempColor);
        }

        function resetZoom() {
            const zoom = zoomRef.current;
            if (zoom) {
                const svg = d3.select(svgRef.current);
                svg.transition().duration(750).call(zoom.transform, d3.zoomIdentity);
                setZoomTransform(d3.zoomIdentity);
            }
        }

        function hoverOn(d) {
            setItem({ title: d.title, genres: d.genres, tags: d.tags });
            setHover(true);
        }

        function hoverOff() {
            setItem({ title: '', genres: '', tags: '' });
            setHover(false);
        }
    }, [data, itemColors, selectedGenres, itemList, selectedItem, selectedPosterTitle]);

    // Function to handle changes in selected genre options
    const handleGenreSelect = (selectedList, selectedMovie) => {
        setSelectedGenres(selectedList);
    };

    return (
        <div className='item-space'>
            <h4 id="item-space-title">Item Space</h4>
            <p id="item-space-description">The item space displays all movies. Item proximity equates
                to how similarly they were rated by users. Hovering over a movie provides more details about it below the figure.
            </p>
            <svg className="item-svg" width={width} height={height} ref={svgRef} />
            <svg
                className="item-legend"
                width={legendWidth}
                height={legendHeight}
                ref={legendRef}
            />
            <ItemGenreSelectFilter
                selectedGenres={selectedGenres}
                handleGenreSelect={handleGenreSelect}
            />
            {hover && (
                <div className="item-hover">
                    <>
                        <p>
                            <strong>Movie Title:</strong> {item.title}
                            <br />
                            <strong>Genres:</strong> {item.genres}
                            <br />
                            <strong>Tags:</strong> {item.tags}
                        </p>
                    </>
                </div>
            )}
        </div>
    );
};