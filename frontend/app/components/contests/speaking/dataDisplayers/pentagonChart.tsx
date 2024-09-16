import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

interface PentagonChartProps {
  data: number[]; // Input data array [a0, a1, a2, a3, a4]
}

const PentagonChart: React.FC<PentagonChartProps> = React.memo(({ data }) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current) return;
    console.log(data);

    const svg = d3.select(svgRef.current);
    const width = 350;
    const height = 300;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) / 2 - 40;
    const pointsPerSegment = 10;
    const segments = 5;
    const segmentLabels = ["Pronunciation", "Fluency", "Lexical", "Grammar", "Total"];

    svg.attr('width', width).attr('height', height);

    // Clear existing content
    svg.selectAll("*").remove();

    // Draw center point
    svg.append('circle')
      .attr('cx', centerX)
      .attr('cy', centerY)
      .attr('r', 2)
      .attr('fill', 'black');

    const allPoints: Array<Array<[number, number]>> = [];

    // Function to draw points in a segment
    const drawSegmentPoints = (angleOffset: number, segmentIndex: number) => {
      const segmentPoints: [number, number][] = [];
      const segmentLength = radius;

      const points = Array.from({ length: pointsPerSegment }, (_, i) => {
        const ratio = (i + 1) / pointsPerSegment;
        const x = centerX + ratio * segmentLength * Math.cos(angleOffset);
        const y = centerY + ratio * segmentLength * Math.sin(angleOffset);
        return [x, y];
      });

      points.forEach(([x, y], i) => {
        segmentPoints.push([x, y]);

        const pointColor = i === data[segmentIndex] ? '#006fee' : 'black';
        const pointRadius = i === data[segmentIndex] ? 2 : 0;

        svg.append('circle')
          .attr('cx', x)
          .attr('cy', y)
          .attr('r', pointRadius)
          .attr('fill', pointColor);

        // Line connecting point to the center
        svg.append('line')
          .attr('x1', x)
          .attr('y1', y)
          .attr('x2', centerX)
          .attr('y2', centerY)
          .attr('stroke', 'lightgray')
          .attr('stroke-width', 0.5);
      });

      allPoints.push(segmentPoints);
    };

    const deg = 2 * Math.PI / segments;
    drawSegmentPoints(-2 * (Math.PI / 4), 0);

    const angles = [deg, 2 * deg, 3 * deg, 4 * deg];
    angles.forEach((angleOffset, index) => {
      drawSegmentPoints(-2 * (Math.PI / 4) + angleOffset, index + 1);
    });

    for (let rank = 0; rank < pointsPerSegment; rank++) {
      for (let seg = 0; seg < segments; seg++) {
        const [x1, y1] = allPoints[seg][rank];
        const [x2, y2] = allPoints[(seg + 1) % segments][rank];

        svg.append('line')
          .attr('x1', x1)
          .attr('y1', y1)
          .attr('x2', x2)
          .attr('y2', y2)
          .attr('stroke', '#dcdcdc')
          .attr('stroke-width', 0.5);
      }
    }

    const bluePoints: [number, number][] = [];
    for (let seg = 0; seg < segments; seg++) {
      const currentSegmentIndex = seg;
      const nextSegmentIndex = (seg + 1) % segments;

      const currentPointIndex = data[currentSegmentIndex];
      const nextPointIndex = data[nextSegmentIndex];

      const [x1, y1] = allPoints[currentSegmentIndex][currentPointIndex];
      const [x2, y2] = allPoints[nextSegmentIndex][nextPointIndex];

      bluePoints.push([x1, y1]);

      svg.append('line')
        .attr('x1', x1)
        .attr('y1', y1)
        .attr('x2', x2)
        .attr('y2', y2)
        .attr('stroke', '#006fee')
        .attr('stroke-width', 2);
    }

    // Draw single polygon for filled area
    svg.append('polygon')
      .attr('points', bluePoints.map(([x, y]) => `${x},${y}`).join(' '))
      .attr('fill', 'rgba(0, 0, 255, 0.1)')
      .attr('stroke', 'none')
      .lower(); // Ensure polygon is at the back

    // Add labels for each segment
    segmentLabels.forEach((label, i) => {
      const angleOffset = -2 * (Math.PI / 4) + i * deg;
      const labelX = centerX + (radius + 30) * Math.cos(angleOffset);
      const labelY = centerY + (radius + 15) * Math.sin(angleOffset);

      svg.append('text')
        .attr('x', labelX)
        .attr('y', labelY)
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'middle')
        .attr('fill', 'black')
        .attr('font-size', '16px')
        .text(label);
    });

  }, [data]);

  return <svg ref={svgRef}></svg>;
});

export default PentagonChart;
