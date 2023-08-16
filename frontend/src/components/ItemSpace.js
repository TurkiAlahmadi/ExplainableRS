import * as d3 from 'd3';
import { useState, useEffect, useRef } from 'react';

export const ItemSpace = ({ data, itemColors, hoveredPoster }) => {
    const margin = { top: 1, right: 1, bottom: 1, left: 1 },
        width = 460 - margin.left - margin.right,
        height = 460 - margin.top - margin.bottom,
        legendWidth = 130,
        legendHeight = 200;

    const [item, setItem] = useState({});
    const [hover, setHover] = useState(false);

    const svgRef = useRef(null);
    const legendRef = useRef(null);

    useEffect(() => {
        const svg = d3.select(svgRef.current);
        const legendSvg = d3.select(legendRef.current);

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
            .enter()
            .append('circle')
            .attr('key', (d) => d.id)
            .attr('r', (d) => hoveredPoster === d.title ? 8 : 5)
            .attr('cx', (d) => x(d.x))
            .attr('cy', (d) => y(d.y))
            .attr('opacity', 1)
            .attr('stroke', (d) => d.color)
            .attr('fill', (d) => d.color)
            .attr('fill-opacity', (d) => d.color === itemColors.other ? 0.1 : 0.6)
            .attr('stroke-width', (d) => hoveredPoster === d.title ? 2 : 1)
            .on('mouseenter', (event, d) => hoverOn(d))
            .on('mouseleave', () => hoverOff());

        const legend = legendSvg.append('g')
            .attr('class', 'legend')
            .attr('transform', `translate(10, 10)`)
            .attr('stroke', 'black')
            .attr('stroke-width', 1);

        const legendData = [
            { label: 'Rated', color: itemColors.rated },
            { label: 'User-based Recommendation', color: itemColors["user_recommended"] },
            { label: 'Item-based Recommendation', color: itemColors["item_recommended"] },
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
            .attr('opacity', 0.5)
            .attr('stroke', (d) => d.color)
            .attr('fill-opacity', (d) => (d.color === itemColors.other ? 0.1 : 0.5))
            .attr('stroke-width', 1);

        legendItems.append('text')
            .attr('x', 20)
            .attr('dy', '0.35em')
            .style('font-size', '13px')
            .style('font-weight', 'normal')
            .text((d) => d.label);

        function hoverOn(d) {
            setItem({ title: d.title, genres: d.genres, tags: d.tags });
            setHover(true);
        }

        function hoverOff() {
            setItem({ title: '', genres: '', tags: '' });
            setHover(false);
        }

        svg.selectAll('circle')
            .data(data)
            .attr('fill', (d) => d.color)
            .attr('stroke', (d) => d.color)
            .attr('fill-opacity', (d) => (d.color === itemColors.other ? 0.1 : 0.5));

    }, [data, itemColors, hoveredPoster]);

    return (
        <>
            <div style={{ display: 'flex' }}>
                <svg className="item-space" width={width} height={height} ref={svgRef} />
                <svg
                    className="item-legend"
                    width={legendWidth}
                    height={legendHeight}
                    ref={legendRef}
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
        </>
    );
};

