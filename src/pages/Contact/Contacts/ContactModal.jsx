import { useState, useEffect } from 'react'
import { Modal, Form, Button } from 'react-bootstrap'

const STATUS_OPTIONS = ['Active', 'Inactive', 'Lead', 'Customer']

export const ContactModal = ({ show, onHide, contact, onSave, onDelete }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    status: 'Active',
    notes: ''
  })
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (show) {
      if (contact) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setFormData({
          name: contact.name || '',
          email: contact.email || '',
          phone: contact.phone || '',
          company: contact.company || '',
          status: contact.status || 'Active',
          notes: contact.notes || ''
        })
      } else {
        setFormData({
          name: '',
          email: '',
          phone: '',
          company: '',
          status: 'Active',
          notes: ''
        })
      }
      setErrors({})
    }
  }, [contact, show])

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: null
      }))
    }
  }

  const validate = () => {
    const newErrors = {}

    if (!formData.name?.trim()) {
      newErrors.name = 'Name is required'
    }

    if (!formData.email?.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address'
    }

    if (!formData.status) {
      newErrors.status = 'Status is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (validate()) {
      onSave(formData)
    }
  }

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this contact?')) {
      onDelete(contact.id)
    }
  }

  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header className="border-bottom">
        <Modal.Title>
          {contact ? 'Edit Contact' : 'Create New Contact'}
        </Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label>
              Name <span className="text-danger">*</span>
            </Form.Label>
            <Form.Control
              type="text"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              isInvalid={!!errors.name}
              placeholder="Enter contact name"
            />
            <Form.Control.Feedback type="invalid">
              {errors.name}
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>
              Email <span className="text-danger">*</span>
            </Form.Label>
            <Form.Control
              type="email"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              isInvalid={!!errors.email}
              placeholder="Enter email address"
            />
            <Form.Control.Feedback type="invalid">
              {errors.email}
            </Form.Control.Feedback>
          </Form.Group>

          <div className="row">
            <Form.Group className="mb-3 col-md-6">
              <Form.Label>Phone</Form.Label>
              <Form.Control
                type="tel"
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                placeholder="Enter phone number"
              />
            </Form.Group>

            <Form.Group className="mb-3 col-md-6">
              <Form.Label>
                Status <span className="text-danger">*</span>
              </Form.Label>
              <Form.Select
                value={formData.status}
                onChange={(e) => handleChange('status', e.target.value)}
                isInvalid={!!errors.status}
              >
                {STATUS_OPTIONS.map(status => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </Form.Select>
              <Form.Control.Feedback type="invalid">
                {errors.status}
              </Form.Control.Feedback>
            </Form.Group>
          </div>

          <Form.Group className="mb-3">
            <Form.Label>Company</Form.Label>
            <Form.Control
              type="text"
              value={formData.company}
              onChange={(e) => handleChange('company', e.target.value)}
              placeholder="Enter company name"
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Notes</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={formData.notes}
              onChange={(e) => handleChange('notes', e.target.value)}
              placeholder="Add any additional notes..."
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer className="border-top">
          {contact && (
            <Button
              variant="outline-danger"
              onClick={handleDelete}
              className="me-auto"
            >
              Delete
            </Button>
          )}
          <Button variant="secondary" onClick={onHide}>
            Cancel
          </Button>
          <Button variant="primary" type="submit">
            {contact ? 'Update' : 'Create'} Contact
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  )
}
