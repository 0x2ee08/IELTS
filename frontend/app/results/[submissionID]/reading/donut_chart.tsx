import React, {useState} from 'react';

interface PieChartProps {
    correct: number;
    incorrect: number;
    skipped: number;
}

function calculateBand(correct: string, total: string) {
    const correctNum = parseFloat(correct);
    const totalNum = parseFloat(total);
  
    if (isNaN(correctNum) || isNaN(totalNum) || totalNum === 0) {
      return 0;
    }
  
    const ratio = correctNum / totalNum;
    const base9Ratio = ratio * 9;
    const roundedBand = Math.round(base9Ratio * 2) / 2;
  
    return roundedBand;
  }

const generatePieSegment = (value: number, total: number, radius: number, startAngle: number) => {
    const angle = (value / total) * 2 * Math.PI;
    const endAngle = startAngle + angle;
    const x1 = radius * Math.cos(startAngle - Math.PI / 2); // Adjust for 12 o'clock
    const y1 = radius * Math.sin(startAngle - Math.PI / 2);
    const x2 = radius * Math.cos(endAngle - Math.PI / 2); // Adjust for 12 o'clock
    const y2 = radius * Math.sin(endAngle - Math.PI / 2);

    const largeArcFlag = angle > Math.PI ? 1 : 0;

    return `M 0 0 L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;
};

const PieChart: React.FC<PieChartProps> = ({ correct, incorrect, skipped }) => {
    const total = correct + incorrect + skipped;
    const radius = 120; // Increased radius for larger chart
    const segments = [
        { value: correct, color: '#4CAF50', label: 'Correct' }, // Green for correct
        { value: incorrect, color: '#F44336', label: 'Incorrect' }, // Red for incorrect
        { value: skipped, color: '#FFC107', label: 'Skipped' }, // Yellow for skipped
    ];

    let startAngle = 0;

    // Check if any segment equals the total
    const fullSegment = segments.find(segment => segment.value === total);

    const [isHovered, setIsHovered] = useState(false);
    const band = calculateBand(correct.toString(), total.toString());

    return (
        <div className='flex justify-between'>
            <svg width="360" height="360" viewBox="-180 -180 360 360"> {/* Adjusted SVG dimensions */}
                {fullSegment ? (
                    <>
                        <path
                            d={`M 0 0 L 0 ${-radius} A ${radius} ${radius} 0 1 1 0 ${radius} A ${radius} ${radius} 0 1 1 0 ${-radius} Z`} // Full outer ring path
                            fill="none" // Make it transparent
                            stroke="#fff" // White border for contrast
                            strokeWidth={8} // Adjust stroke width as needed for the border
                            style={{
                                filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2))', // Subtle shadow
                                transition: 'transform 0.2s', // Animation for hover effect
                                transform: isHovered ? 'scale(1.05)' : 'scale(1)', // Scale effect
                            }}
                            onMouseEnter={() => setIsHovered(true)} // Set hover state
                            onMouseLeave={() => setIsHovered(false)} // Reset hover state
                        />
                        <path
                            d={`M 0 0 L 0 ${-radius} A ${radius} ${radius} 0 1 1 0 ${radius} A ${radius} ${radius} 0 1 1 0 ${-radius} Z`}
                            strokeWidth={2} // Adjust stroke width as needed
                            fill={fullSegment.color}
                            style={{
                                filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2))', // Subtle shadow
                                transition: 'transform 0.2s', // Animation for hover effect
                                transform: isHovered ? 'scale(1.05)' : 'scale(1)', // Scale effect
                            }}
                            onMouseEnter={() => setIsHovered(true)} // Set hover state
                            onMouseLeave={() => setIsHovered(false)} // Reset hover state
                        />
                    </>
                ) : (
                    segments.map((segment, index) => {
                        const pathData = generatePieSegment(segment.value, total, radius, startAngle);
                        startAngle += (segment.value / total) * 2 * Math.PI;

                        return (
                            <path
                                key={index}
                                d={pathData}
                                fill={segment.color}
                                stroke="#fff" // White border for contrast
                                strokeWidth={2} // Adjust stroke width as needed
                                style={{
                                    filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2))', // Subtle shadow
                                    transition: 'transform 0.2s', // Animation for hover effect
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = 'scale(1.05)'; // Scale effect on hover
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = 'scale(1)'; // Reset scale
                                }}
                            />
                        );
                    })
                )}
                <circle cx="0" cy="0" r="70" fill="#fff" /> {/* Increased hole radius for donut chart */}
                <text
                    x="0"
                    y="0"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize="27" // Adjust font size as needed
                    fill="#333" // Color of the text
                    >
                    {band.toFixed(1)} {/* Add your band value here */}
                </text>
            </svg>
            <div style={{ marginTop: '80px' }}>
                {segments.map((segment, index) => {
                    const percentage = ((segment.value / total) * 100).toFixed(2); // Calculate percentage
                    return (
                    <div key={index} style={{ display: 'flex', alignItems: 'center', margin: '10px 0' }}>
                        <div
                        style={{
                            width: '15px',
                            height: '15px',
                            backgroundColor: segment.color,
                            marginRight: '8px',
                        }}
                        />
                        <span style={{ fontSize: '14px', color: '#333' }}>
                        {segment.label} ({percentage}%)
                        </span>
                    </div>
                    );
                })}
            </div>
        </div>
    );
};

export default PieChart;
