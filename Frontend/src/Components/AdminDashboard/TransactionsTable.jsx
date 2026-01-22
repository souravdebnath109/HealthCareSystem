





// //for fetching the transactions from the backend
// import React, { useEffect, useState } from 'react';
// import axios from 'axios';
// import { toast, ToastContainer } from 'react-toastify';
// import 'react-toastify/dist/ReactToastify.css';
// import './TransactionsTable.css';


// const TransactionsTable = () => {
//     const [transactions, setTransactions] = useState([]);
//     const [loading, setLoading] = useState(false);

//     useEffect(() => {
//         fetchTransactions();
//     }, []);

//     const fetchTransactions = async () => {
//         setLoading(true);
//         try {
//             const response = await axios.get('http://127.0.0.1:8000/api/payments/');
//             setTransactions(response.data);
//         } catch (error) {
//             console.error('Error fetching transactions:', error);
//             toast.error('Failed to fetch transactions.');
//         } finally {
//             setLoading(false);
//         }
//     };


// //this is due to css overwritten 
//     return (
//         <div className="transactions-container">
//             <ToastContainer position="top-center" autoClose={2000} />
//             <h2>Transactions</h2>
    
//             {loading ? (
//                 <p>Loading transactions...</p>
//             ) : (
//                 <table className="transactions-table">
//                     <thead>
//                         <tr>
//                             <th>ID</th>
//                             <th>Amount</th>
//                             <th>Currency</th>
//                             <th>Stripe Payment ID</th>
//                             <th>Created At</th>
//                             <th>User Email</th>
//                         </tr>
//                     </thead>
//                     <tbody>
//                         {transactions.map((transaction) => (
//                             <tr key={transaction.id}>
//                                 <td>{transaction.id}</td>
//                                 <td>{transaction.amount}</td>
//                                 <td>{transaction.currency}</td>
//                                 <td>{transaction.stripe_payment_id}</td>
//                                 <td>{new Date(transaction.created_at).toLocaleString()}</td>
//                                 <td>{transaction.user_email}</td>
//                             </tr>
//                         ))}
//                     </tbody>
//                 </table>
//             )}
//         </div>
//     );
    
// };

// export default TransactionsTable;


//2nd form (adding product_name column)
// TransactionsTable.jsx
// TransactionsTable.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./TransactionsTable.css";

const TransactionsTable = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const res = await axios.get("http://127.0.0.1:8000/api/payments/");
      setTransactions(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error("Error fetching transactions:", error);
      toast.error("Failed to fetch transactions.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="transactions-container">
      <ToastContainer position="top-center" autoClose={2000} />
      <h2>Transactions</h2>

      {loading ? (
        <p>Loading transactions...</p>
      ) : (
        <table className="transactions-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Product Name</th>
              <th>Amount</th>
              <th>Currency</th>
              <th>Stripe Payment ID</th>
              <th>Created At</th>
              <th>User Email</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((tx) => (
              <tr key={tx.id}>
                <td>{tx.id}</td>

                {/* ✅ CORRECT PRODUCT NAME DISPLAY */}
                <td>
                  {Array.isArray(tx.product_names) &&
                  tx.product_names.length > 0
                    ? tx.product_names.join(", ")
                    : "—"}
                </td>

                <td>{tx.amount}</td>
                <td>{tx.currency}</td>
                <td>{tx.stripe_payment_id}</td>
                <td>{new Date(tx.created_at).toLocaleString()}</td>
                <td>{tx.user_email}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default TransactionsTable;
