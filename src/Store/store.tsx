import React from 'react';

interface CreditProps {
    _id: string;
    ticketPrice: number;
    numberOfTickets: number;
    onSelect: (id: string) => void;
}
const Credit: React.FC<CreditProps> = ({ _id, ticketPrice, numberOfTickets, onSelect }) => {
    const handleSelectCredit = () => {
        onSelect(_id);
    };
    return (
        <div key={_id}>
            <p>Ticket Price: ${ticketPrice}</p>
            <p>Number of Tickets: {numberOfTickets}</p>
            <button onClick={handleSelectCredit}>Select</button>
        </div>
    );
};

export default Credit;
