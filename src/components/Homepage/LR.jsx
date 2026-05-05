import { useState, useEffect } from "react";
import "./LRCertificate.css";
import template from "../img/Bill.jpeg";
import axios from "axios";
import { toast } from "react-toastify";

const LRCertificate = ({ closeModal, refreshData, editData }) => {
  const baseURL = "http://localhost:8000/lrdata";

  const [eWayBillNo, setEWayBillNo] = useState("");
  const [eWayBillDate, setEWayBillDate] = useState("");
  const [lrdate, setDate] = useState(""); // This is for the LR Date input
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [consignor, setConsignor] = useState("");
  const [consignorGST, setConsignorGST] = useState("");
  const [consignee, setConsignee] = useState("");
  const [consigneeGST, setConsigneeGST] = useState("");
  const [actualWeight, setActualWeight] = useState("");
  const [chargedWeight, setChargedWeight] = useState("");
  const [invoice, setInvoice] = useState("");
  const [shipmentDocNo, setShipmentDocNo] = useState("");
  const [shipmentCost, setShipmentCost] = useState("");
  const [declareValue, setDeclareValue] = useState("");
  const [truck, setTruck] = useState("");
  const [noOfArticles, setNoOfArticles] = useState("");
  const [description, setDescription] = useState("");
  const [goods, setGoods] = useState([]);
  const [editIndex, setEditIndex] = useState(null);

  useEffect(() => {
    if (editData) {
      setEWayBillNo(editData.e_waybill_no || "");
      
      // Format E-Way Bill Date (YYYY-MM-DD)
      setEWayBillDate(editData.e_waybill_exp_date ? editData.e_waybill_exp_date.substring(0, 10) : "");
      
      // FIXED: Added the logic to set LR Date when editing
      // If lr_date exists, use it; otherwise fallback to createdAt
      const existingDate = editData.lr_date || editData.createdAt;
      setDate(existingDate ? existingDate.substring(0, 10) : "");

      setFrom(editData.from || "");
      setTo(editData.to || "");
      setConsignor(editData.consignor_ms || "");
      setConsignorGST(editData.consignor_GST || "");
      setConsignee(editData.consignee_ms || "");
      setConsigneeGST(editData.consignee_GST || "");
      setActualWeight(editData.weight_actual || "");
      setChargedWeight(editData.weight_charged || "");
      setInvoice(editData.invoice_number || "");
      setShipmentDocNo(editData.shipment_document_no || "");
      setShipmentCost(editData.shipment_cost || "");
      setDeclareValue(editData.declare_value || "");
      setTruck(editData.truck_number || "");
      setGoods(editData.goods || []);
    } else {
      // Reset form for "Add New"
      setEWayBillNo("");
      setEWayBillDate("");
      setDate(""); 
      setFrom("");
      setTo("");
      setConsignor("");
      setConsignorGST("");
      setConsignee("");
      setConsigneeGST("");
      setActualWeight("");
      setChargedWeight("");
      setInvoice("");
      setShipmentDocNo("");
      setShipmentCost("");
      setDeclareValue("");
      setTruck("");
      setGoods([]);
    }
  }, [editData]);

  const addArticle = () => {
    if (!noOfArticles?.trim() || !description?.trim()) {
      toast.error("Enter valid article number and description");
      return;
    }

    const article = {
      no_of_article: noOfArticles.trim(),
      description: description.trim(),
    };

    if (editIndex !== null) {
      const updated = [...goods];
      updated[editIndex] = article;
      setGoods(updated);
      setEditIndex(null);
    } else {
      setGoods([...goods, article]);
    }

    setNoOfArticles("");
    setDescription("");
  };

  const editArticle = (index) => {
    setNoOfArticles(goods[index].no_of_article);
    setDescription(goods[index].description);
    setEditIndex(index);
  };

  const deleteArticle = (index) => {
    const updated = goods.filter((_, i) => i !== index);
    setGoods(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (goods.length === 0) {
      toast.error("Please add at least one article");
      return;
    }

    const data = {
      lr_date: lrdate,
      e_waybill_no: eWayBillNo,
      e_waybill_exp_date: eWayBillDate,
      from,
      to,
      consignor_ms: consignor,
      consignor_GST: consignorGST,
      consignee_ms: consignee,
      consignee_GST: consigneeGST,
      goods,
      weight_actual: actualWeight,
      weight_charged: chargedWeight,
      invoice_number: invoice,
      shipment_document_no: shipmentDocNo,
      shipment_cost: shipmentCost,
      declare_value: declareValue,
      truck_number: truck,
    };

    try {
      if (editData) {
        await axios.put(`${baseURL}/${editData._id}`, data);
        toast.success("LR Updated Successfully");
      } else {
        await axios.post(baseURL, data);
        toast.success("LR Added Successfully 🚚");
      }

      setTimeout(() => {
        refreshData();
        closeModal();
      }, 500);
    } catch (error) {
      toast.error("Failed to save LR");
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <button className="close-btn" onClick={closeModal}>✕</button>

        <div className="lr-template-container">
          <img src={template} alt="template" className="imageDesing" />

          <form onSubmit={handleSubmit}>
            <input
              className="e-way_bill_no"
              value={eWayBillNo}
              placeholder="E Way Bill no"
              onChange={(e) => setEWayBillNo(e.target.value)}
            />

            <input
              type="date"
              className="e-way_bill_date"
              value={eWayBillDate}
              onChange={(e) => setEWayBillDate(e.target.value)}
            />

            {/* LR DATE INPUT */}
            <input
              type="date"
              className="lr_date"
              value={lrdate}
              onChange={(e) => setDate(e.target.value)}
            />

            <input
              className="lr-from"
              value={from}
              placeholder="from"
              onChange={(e) => setFrom(e.target.value)}
            />

            <input
              className="lr-to"
              value={to}
              placeholder="to"
              onChange={(e) => setTo(e.target.value)}
            />

            <textarea
              className="lr-consignor"
              value={consignor}
              placeholder="consignor M/s"
              onChange={(e) => setConsignor(e.target.value)}
            />

            <input
              className="lr-consignor_GST"
              value={consignorGST}
              placeholder="consignor_GST"
              onChange={(e) => setConsignorGST(e.target.value)}
            />

            <textarea
              className="lr-consignee"
              value={consignee}
              placeholder="consignee M/s"
              onChange={(e) => setConsignee(e.target.value)}
            />

            <input
              className="lr-consignee_GST"
              value={consigneeGST}
              placeholder="consignee_GST"
              onChange={(e) => setConsigneeGST(e.target.value)}
            />

            <input
              className="no-article"
              value={noOfArticles}
              placeholder="no-article"
              onChange={(e) => setNoOfArticles(e.target.value)}
            />

            <textarea
              className="lr-description"
              value={description}
              placeholder="description"
              onChange={(e) => setDescription(e.target.value)}
            />

            <button type="button" className="addArticle" onClick={addArticle}>
              {editIndex !== null ? "Update Article" : "Add Article"}
            </button>

            <div className="article-container">
              {goods.map((item, index) => (
                <div key={index} className="article-row">
                  <div className="articleNo_css">{item.no_of_article}</div>
                  <div className="descripiton_css">{item.description}</div>
                  <div className="article-actions">
                    <button type="button" className="edit-btn" onClick={() => editArticle(index)}>
                      Edit
                    </button>
                    <button type="button" className="delete-btn" onClick={() => deleteArticle(index)}>
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <input
              className="Actual_Weight"
              value={actualWeight}
              placeholder="Actual_Weight"
              onChange={(e) => setActualWeight(e.target.value)}
            />

            <input
              className="Charged_Weight"
              value={chargedWeight}
              placeholder="Charged_Weight"
              onChange={(e) => setChargedWeight(e.target.value)}
            />

            <input
              className="lr-invoice"
              value={invoice}
              placeholder="invoice"
              onChange={(e) => setInvoice(e.target.value)}
            />

            <input
              className="Shipment_Doc_no"
              value={shipmentDocNo}
              placeholder="Shipment_Doc_no"
              onChange={(e) => setShipmentDocNo(e.target.value)}
            />

            <input
              className="Shipment_cost"
              value={shipmentCost}
              placeholder="Shipment_cost"
              onChange={(e) => setShipmentCost(e.target.value)}
            />

            <input
              className="Declare_value"
              value={declareValue}
              placeholder="Declare_value"
              onChange={(e) => setDeclareValue(e.target.value)}
            />

            <input
              className="lr-truck"
              value={truck}
              placeholder="truck number"
              onChange={(e) => setTruck(e.target.value)}
            />

            <button type="submit" className="button-style">
              {editData ? "Update" : "Add"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LRCertificate;