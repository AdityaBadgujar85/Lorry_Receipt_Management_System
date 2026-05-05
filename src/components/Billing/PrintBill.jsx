import { useLocation } from "react-router-dom";
import { useEffect, useState, Fragment } from "react";
import axios from "axios";
import templateImg from "../img/letterHead.jpg";
import "./PrintBill.css";

const PrintBill = () => {
  const { state } = useLocation();
  const data = state?.data || JSON.parse(localStorage.getItem("printBillData"));
  const [lrs, setLrs] = useState([]);

  useEffect(() => {
    if (state?.data) {
      localStorage.setItem("printBillData", JSON.stringify(state.data));
    }
  }, [state]);

  useEffect(() => {
    const fetchLR = async () => {
      try {
        const res = await axios.get("http://localhost:8000/lrdata");
        setLrs(res.data.data || []);
      } catch (err) {
        console.error("LR fetch error:", err);
      }
    };
    fetchLR();
  }, []);

  const formatDate = (date) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("en-GB");
  };

  if (!data) return <div>No Bill Data Found</div>;

  return (
    <div className="p-bill-page-wrapper">
      <div className="p-bill-no-print p-bill-header-actions">
        <button className="p-bill-btn-all" onClick={() => window.print()}>
          Print Bill
        </button>
      </div>

      <div className="p-bill-template-container">
        <img src={templateImg} alt="Bill Template" />

        <span className="p-bill-id"><span className="bill-no-design">BILL NO:</span> {data?.billingID}</span>
        <span className="p-bill-date"><span className="date-no-design">DATE:</span> {formatDate(data?.date)}</span>

        <div className="p-bill-toDetails">
          <h4>TO</h4>
          <p>KANSAI NEROLAC PAINTS LTD.</p>
          <p>LOTE PARSHURAM MIDC</p>
          <p>TAL-KHED, DIST RATNAGIRI</p>
        </div>

        <div className="p-bill-table-container">
          <table className="p-bill-table">
            <thead>
              <tr>
                <th>DATE</th>
                <th>L.R.NO</th>
                <th>S.D.NO</th>
                <th>VEHICLE NO</th>
                <th>DESTINATION</th>
                <th>UNLOAD DATE</th>
                <th>WEIGHT</th>
                <th>RATE</th>
                <th>EXTRA</th>
                <th>DETENTION</th>
                <th>TOTAL</th>
              </tr>
            </thead>

            <tbody>
              {[...(data?.tripList || [])]
                .sort((a, b) => new Date(a.unloadingdate || a.date) - new Date(b.unloadingdate || b.date))
                .map((trip, tripIndex) => {
                  let lrArr = (trip.lr_no || "").split(",").map(x => x.trim());
                  let sdArr = (trip.sd_no || "").split(",").map(x => x.trim());
                  let vehicleArr = (trip.vehicleNO || "").split(",").map(x => x.trim());
                  let destArr = (trip.destination || "").split(",").map(x => x.trim());

                  const sortedIndexes = lrArr
                    .map((lr, i) => ({ lr: Number(lr), index: i }))
                    .sort((a, b) => a.lr - b.lr)
                    .map(obj => obj.index);

                  lrArr = sortedIndexes.map(i => lrArr[i]);
                  sdArr = sortedIndexes.map(i => sdArr[i]);
                  vehicleArr = sortedIndexes.map(i => vehicleArr[i]);
                  destArr = sortedIndexes.map(i => destArr[i]);

                  const rowCount = lrArr.length;

                  return (
                    <Fragment key={trip.tripId || tripIndex}>
                      {lrArr.map((lr, i) => (
                        <tr key={i} className="p-bill-row">
                          <td>{formatDate(trip.date)}</td>
                          <td>{lr}</td>
                          <td>{sdArr[i] || sdArr[i - 1] || sdArr[0] || "-"}</td>
                          <td>{vehicleArr[i] || vehicleArr[i - 1] || vehicleArr[0] || "-"}</td>
                          <td>{destArr[i] || destArr[i - 1] || destArr[0] || "-"}</td>

                          {i === 0 && (
                            <>
                              <td rowSpan={rowCount}>
                                {trip.unloadingdate ? formatDate(trip.unloadingdate) : "-"}
                              </td>
                              <td rowSpan={rowCount}>{trip.weight}</td>
                              <td rowSpan={rowCount}>₹{trip.rate}</td>
                              <td rowSpan={rowCount}>₹{trip.extraWeight || 0}</td>
                              <td rowSpan={rowCount}>₹{trip.detention || 0}</td>
                              <td rowSpan={rowCount} className="p-bill-trip-total">
                                ₹{parseFloat(trip.total || 0).toLocaleString("en-IN", {
                                  minimumFractionDigits: 2,
                                })}
                              </td>
                            </>
                          )}
                        </tr>
                      ))}

                      {tripIndex !== data.tripList.length - 1 && (
                        <tr className="p-bill-spacer-row">
                          <td colSpan="11"></td>
                        </tr>
                      )}
                    </Fragment>
                  );
                })}
            </tbody>

            <tfoot>
              <tr className="p-bill-total-row">
                <td colSpan="10" style={{ textAlign: "right", paddingRight: "10px" }}>
                  TOTAL
                </td>
                <td>
                  ₹{parseFloat(data?.grandTotal || 0).toLocaleString("en-IN", {
                    minimumFractionDigits: 2,
                  })}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        <div className="p-bill-lastSign">
          <p>FOR SUHAS TRANSPORT</p>
          <p>PROPRIETOR</p>
        </div>
      </div>
    </div>
  );
};

export default PrintBill;