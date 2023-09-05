import * as d3 from 'd3';
import { useState, useEffect, useRef } from 'react';
import {ItemGenreSelectFilter} from "./ItemGenreSelectFilter";

export const ItemSpace = ({ data, itemDataUpdate, itemSelect, itemColors, itemList, selectedItem, setSelectedItem }) => {
    const margin = { top: 1, right: 1, bottom: 1, left: 1 },
        width = 460 - margin.left - margin.right,
        height = 460 - margin.top - margin.bottom,
        legendWidth = 130,
        legendHeight = 200;

    const [item, setItem] = useState({});
    const [hover, setHover] = useState(false);
    const [selectedGenres, setSelectedGenres] = useState([]);

    const svgRef = useRef(null);
    const legendRef = useRef(null);

    useEffect(() => {
        const legendSvg = d3.select(legendRef.current);

        const legend = legendSvg.append('g')
            .attr('class', 'legend')
            .attr('transform', `translate(10, 10)`)
            .attr('stroke', 'black')
            .attr('stroke-width', 1);

        const legendData = [
            { label: 'Your Rated Movies', color: itemColors["rated"] },
            { label: 'Liked by Similar Users', color: itemColors["user_recommended"] },
            { label: 'Similar to Movies you Liked', color: itemColors["item_recommended"] },
            { label: 'Selected', color: itemColors.selected },
            { label: 'Other', color: itemColors.other },
        ];

        const legendItems = legend.selectAll('.legend-item')
            .data(legendData)
            .enter().append('g')
            .attr('class', 'legend-item')
            .attr('transform', (d, i) => `translate(0, ${i * 20})`);

        legendItems.append('circle')
            .attr('r', 5)
            .attr('cx', 10)
            .attr('fill', (d) => d.color)
            .attr('opacity', (d) => d.color === itemColors.other ? 0.5 : 0.7)
            .attr('stroke', (d) => d.color)
            .attr('fill-opacity', (d) => (d.color === itemColors.other ? 0.4 : 0.5))
            .attr('stroke-width', 1);

        legendItems.append('text')
            .attr('x', 20)
            .attr('dy', '0.35em')
            .style('font-size', '11px')
            .style('font-weight', 'normal')
            .text((d) => d.label);

        // Cleanup function to remove the legend when the component unmounts
        return () => {
            legendSvg.selectAll(".legend").remove();
        }
    }, [])

    useEffect(() => {

        const svg = d3.select(svgRef.current);

        const x = d3.scaleLinear().domain([-15, 15]).range([0, width]);
        const y = d3.scaleLinear().domain([-15, 15]).range([height, 0]);

        const zoom = d3.zoom().scaleExtent([0.5, 10]).on('zoom', handleZoom);
        svg.call(zoom);

        function handleZoom(event) {
            const newTransform = event.transform;
            svg.selectAll('circle')
                .attr('transform', newTransform)
                .attr('r', 5 / newTransform.k) // Update the circle radius based on zoom scale
                .attr('stroke-width', 1 / newTransform.k); // Update the stroke width based on zoom scale
        }

        const createMarks = svg
            .selectAll('circle')
            .data(data)

        createMarks
            .enter().append('circle')
            .attr('key', (d) => d.id)
            .attr('r', 5)
            .attr('cx', (d) => x(d.x))
            .attr('cy', (d) => y(d.y))
            .attr('opacity', (d) => d.color === itemColors.other ? 0.5 : 0.7)
            .attr('stroke', (d) => d.color)
            .attr('fill', (d) => d.color)
            .attr('fill-opacity', (d) => d.color === itemColors.other ? 0.3 : 0.5)
            .attr('stroke-width', 1)
            .on('mouseenter', (event, d) => hoverOn(d))
            .on('mouseleave', () => hoverOff())
            .on("click", (event, d) => handleClick(event, d));

        if (selectedGenres.length > 0) {
            createMarks.attr("opacity", (d) => {
                const itemGenres = d.genres.split(", ");
                const filtered = selectedGenres.every(selectedGenre => itemGenres.includes(selectedGenre.value));
                return filtered && d.color === itemColors.other ? 1 : filtered ? 1 : 0.4;
            });
            createMarks.attr("fill-opacity", (d) => {
                const itemGenres = d.genres.split(", ");
                const filtered = selectedGenres.every(selectedGenre => itemGenres.includes(selectedGenre.value));
                return filtered && d.color === itemColors.other ? 0.7 : filtered ? 1 : 0.1;
            });
            createMarks.attr('stroke', (d) => d.color);
            createMarks.exit().remove();
        } else {
            createMarks
                .attr("opacity", (d) => d.color === itemColors.other ? 0.5 : 0.7)
                .attr("fill-opacity", (d) => (d.color === itemColors.other ? 0.3 : 0.5))
                .attr('fill', (d) =>  d.color)
                .attr('stroke', (d) => d.color);
        }

        function handleClick(event, d) {
            setSelectedItem((prevSelectedItem) => {
                if (prevSelectedItem && prevSelectedItem !== d) {
                    itemDataUpdate(prevSelectedItem, itemColors[prevSelectedItem.type]);
                };
            });
            let tempColor = event.currentTarget.getAttribute('fill');
            if (tempColor !== itemColors["selected"]) {
                tempColor = itemColors["selected"];
                itemSelect(d, true);
            } else  {
                tempColor = itemColors[d.type];
                itemSelect(d, false);
            };
            itemDataUpdate(d, tempColor);
        };

        function hoverOn(d) {
            setItem({ title: d.title, genres: d.genres, tags: d.tags });
            setHover(true);
        }

        function hoverOff() {
            setItem({ title: '', genres: '', tags: '' });
            setHover(false);
        }

    }, [data, itemColors, selectedGenres, itemList, selectedItem]);

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

