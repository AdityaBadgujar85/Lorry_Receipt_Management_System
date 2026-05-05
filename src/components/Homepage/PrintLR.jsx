import { useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import templateImg from "../img/Bill.jpeg";
import "./PrintLr.css";

const PrintLR = () => {
  const { state } = useLocation();
  const [singleIdx, setSingleIdx] = useState(null);

  // Retrieve data
  const data = state?.data || JSON.parse(localStorage.getItem("printData"));
  
  // We define 4 slots for the 4 certificates
  const templates = [0, 1, 2, 3];

  const formatDate = (date) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("en-GB");
  };

  useEffect(() => {
    if (state?.data) {
      localStorage.setItem("printData", JSON.stringify(state.data));
    }
  }, [state]);

  const printInLandscape = () => {
  const style = document.createElement("style");
  style.innerHTML = `@page { size: landscape; }`;
  document.head.appendChild(style);

  window.print();

  setTimeout(() => {
    document.head.removeChild(style);
  }, 1000);
};

  useEffect(() => {
    if (singleIdx !== null) {
      const timer = setTimeout(() => {
        printInLandscape();
        setSingleIdx(null);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [singleIdx]);

  if (!data) return <div className="no-print">No data found in state or storage.</div>;

  return (
    <div className="print-page-wrapper">
      <div className="no-print header-actions">
        <button onClick={printInLandscape} className="btn-all">Print All</button>
      </div>

      <div className="print-container">
        {templates.map((_, i) => (
          <div
            key={i}
            className={`print-box ${singleIdx !== null && singleIdx !== i ? "hide-this" : ""}`}
          >
            <div className="no-print box-actions">
              <button className="btn-single" onClick={() => setSingleIdx(i)}>
                Print This Single Page
              </button>
            </div>

            <div className="print-template-container">
              <img src={templateImg} alt={`Template ${i}`} />

              {/* Data Overlays */}
              <span className="p-e-way_bill_no">{data?.e_waybill_no || "-"}</span>
              <span className="p-e-way_bill_date">{formatDate(data?.e_waybill_exp_date)}</span>
              <span className="p-lr_no">{data?.lr_no || "-"}</span>
              <span className="p-lr_date">{formatDate(data?.lr_date || data?.createdAt)}</span>
              <span className="p-lr-from">{data?.from || "-"}</span>
              <span className="p-lr-to">{data?.to || "-"}</span>
              <span className="p-lr-consignor">{data?.consignor_ms || "-"}</span>
              <span className="p-lr-consignor_GST">{data?.consignor_GST || "-"}</span>
              <span className="p-lr-consignee">{data?.consignee_ms || "-"}</span>
              <span className="p-lr-consignee_GST">{data?.consignee_GST || "-"}</span>
              <span className="p-lr-invoice">{data?.invoice_number || "-"}</span>
              <span className="p-lr-truck">{data?.truck_number || "-"}</span>
              <span className="p-Shipment_Doc_no">{data?.shipment_document_no || "-"}</span>
              <span className="p-Shipment_cost">{data?.shipment_cost || "-"}</span>
              <span className="p-Declare_value">{data?.declare_value || "-"}</span>
              <span className="p-Actual_Weight">{data?.weight_actual || "-"}</span>
              <span className="p-Charged_Weight">{data?.weight_charged || "-"}</span>

              <div className="p-article-container">
                {data?.goods?.map((g, index) => (
                  <div key={index} className="p-article-row">
                    <div className="p-article-no">{g.no_of_article}</div>
                    <div className="p-article-desc">{g.description}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PrintLR;