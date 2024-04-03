import React, { useState, useEffect, useRef } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, ElementsConsumer, CardElement } from '@stripe/react-stripe-js';
import Credit from "./store";
import axios from "axios";
interface Credit {
    _id: string;
    ticketPrice: number;
    numberOfTickets: number;
    onSelect: (id: string) => void;
}
const stripePromise = loadStripe('pk_test_51P0lIMRsDD59nIsqP2deChJjvvGxVm15F1J92dtUR681AjDC9uaxwyoZbEgmuLSaFOgofQQBdC6w0ksl3cJz01NB00gzWV8UdY');
const token="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY1ZjQ0MWQwMzlmZTg4NzQ3MGZkMmIyNiIsImlhdCI6MTcxMjA3MjExM30.veOtdPAG8MTI8kBNtNzmqZxmrqjW-YT9qxf5JgTvcxI"
const PaymentForm: React.FC = () => {
    const [selectedCreditId, setSelectedCreditId] = useState<string | null>('');
    const [creditData, setCreditData] = useState<Credit[]>([]);
    const [paymentStatus, setPaymentStatus] = useState<'pending' | 'success' | 'error'>('pending');
    const [paymentMessage, setPaymentMessage] = useState('');
    useEffect(() => {
        fetch('http://localhost:3000/credit')
            .then((response) => response.json())
            .then((data) => setCreditData(data))
            .catch((error) => console.error('Error fetching credit data:', error));
    }, []);
    const handleSelectCredit = (_id: string) => {
        const selectedCredit = creditData.find((credit) => credit._id === _id);
        if (selectedCredit) {
            setSelectedCreditId(selectedCredit._id);
            //console.log(selectedCreditId)
        }
    };
    const handleSubmit = async (e: React.FormEvent, stripe: any, elements: any) => {
        e.preventDefault();
        if (!stripe || !selectedCreditId || !elements) return;
        try {
            const response = await axios.post('http://localhost:3000/stripe', {
                creditId: selectedCreditId,
                paymentMethod: 'pm_card_visa',
                userId:'65f441d039fe887470fd2b26',
            }, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            const userId='65f441d039fe887470fd2b26'
            const paymentIntentClientSecret = response.data.client_secret;
            const selectedCredit=response.data.creditId
            console.log('............',selectedCreditId)
            if (paymentIntentClientSecret) {
                const result = await stripe.confirmCardPayment(paymentIntentClientSecret, {
                    payment_method: {
                        card: elements.getElement(CardElement),
                    },
                })
                const code=result.paymentIntent.id
                const statue=result.paymentIntent.status
                if (result.error) {
                    setPaymentStatus('error');
                    setPaymentMessage(result.error.message);
                } else {
                    setPaymentStatus('success');
                    setPaymentMessage('Payment successful!');
                    await confirmPaymentIntent(selectedCreditId,statue,userId,code);
                }
            } else {
                setPaymentStatus('error');
                setPaymentMessage('An error occurred during payment processing. Please try again.');
            }
        } catch (error) {
            setPaymentStatus('error');
            setPaymentMessage('An error occurred. Please try again.');
        }
    };
    const confirmPaymentIntent = async (creditId:string ,statue: string,userId:string,code:number) => {
        try {
            const response = await axios.post('http://localhost:3000/stripe/confirm', {
                creditId,
                statue,
                userId,
                code
            }, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
        } catch (error) {
            console.error('Error confirming payment intent:', error);
        }
    }
    return (
        <div>
            <h2>Select Credit</h2>
            {creditData.map((credit) => (
                <Credit key={credit._id} {...credit} onSelect={handleSelectCredit} />
            ))}
            <br />
            {selectedCreditId && (
                <Elements stripe={stripePromise}>
                    <ElementsConsumer>
                        {({ elements, stripe }) => (
                            <form onSubmit={(e) => handleSubmit(e, stripe,elements)}>
                                <CardElement />
                                <button type="submit">Pay Now</button>
                                {paymentStatus === 'success' && <p className="success">{paymentMessage}</p>}
                                {paymentStatus === 'error' && <p className="error">{paymentMessage}</p>}
                            </form>
                        )}
                    </ElementsConsumer>
                </Elements>
            )}
        </div>
    );
};

export default PaymentForm;
