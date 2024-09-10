'use client';

const ListeningContest = ({ contest }: { contest: any }) => {
    return (
        <div>
            <h1>{contest.type} Contest</h1>
            <p>Start Time: {contest.startTime}</p>
            <p>End Time: {contest.endTime}</p>
            {/* Add other details specific to Reading contest */}
        </div>
    );
};

export default ListeningContest;