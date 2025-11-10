import React, { useState, useEffect } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";

const WorkItemModal = ({ show, handleClose, selectedWorkItem, onUpdate }) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    status: "",
    priority: "",
  });

  useEffect(() => {
    if (selectedWorkItem) {
      setFormData({
        title: selectedWorkItem.title || "",
        description: selectedWorkItem.description || "",
        status: selectedWorkItem.status || "",
        priority: selectedWorkItem.priority || "",
      });
    }
  }, [selectedWorkItem]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    try {
      await axios.put(
        `http://localhost:5000/api/workitems/${selectedWorkItem._id}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      onUpdate(); 
      handleClose();
    } catch (err) {
      console.error(err);
      alert("Failed to update work item");
    }
  };

  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header closeButton style={{ backgroundColor: "#0d6efd", color: "white" }}>
        <Modal.Title>Edit Work Item</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group className="mb-3">
            <Form.Label>Title</Form.Label>
            <Form.Control
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Description</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              name="description"
              value={formData.description}
              onChange={handleChange}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Status</Form.Label>
            <Form.Select name="status" value={formData.status} onChange={handleChange}>
              <option value="">Select Status</option>
              <option value="Open">Open</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
              <option value="Closed">Closed</option>
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Priority</Form.Label>
            <Form.Select name="priority" value={formData.priority} onChange={handleChange}>
              <option value="">Select Priority</option>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </Form.Select>
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Cancel
        </Button>
        <Button variant="primary" onClick={handleSave}>
          Save Changes
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default WorkItemModal;
