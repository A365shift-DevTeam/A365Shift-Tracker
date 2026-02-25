import { useState, useEffect } from 'react'
import { Modal, Form, Button, Row, Col } from 'react-bootstrap'

const STATUS_OPTIONS = ['Active', 'Inactive', 'Lead', 'Customer']

const JOB_TITLES = [
  'CEO',
  'CTO',
  'manager',
  'Software Engineer',
  'Product Manager',
  'Sales Representative',
  'Designer',
  'HR Manager',
  'Accountant',
  'Consultant',
  'Director',
  'Other'
];





const COUNTRIES = [
  'India',
  'United States',
  'United Kingdom',
  'Canada',
  'Germany',
  'Australia',
  'Japan',
  'Singapore',
  'United Arab Emirates',
  'France'
];

const LOCATIONS = [
  'New York, USA',
  'London, UK',
  'San Francisco, USA',
  'Toronto, Canada',
  'Berlin, Germany',
  'Sydney, Australia',
  'Tokyo, Japan',
  'Singapore',
  'Mumbai, India',
  'Paris, France'
];

const ENTITY_TYPES = ['Company', 'Individual']

export const ContactModal = ({ show, onHide, contact, onSave, onDelete }) => {
  const [formData, setFormData] = useState({
    name: '',
    jobTitle: '',
    email: '',
    phone: '',
    company: '',
    Billinglocation: '', // New field
    clientAddress: '',
    clientCountry: 'India', // Default to India
    gstin: '',
    pan: '',
    cin: '',
    internationalTaxId: '', // For foreign clients (VAT/EIN)
    msmeStatus: 'NON MSME',
    tdsSection: '',
    tdsRate: '',
    linkedin: '',
    status: 'Active',
    entityType: 'Individual',
    notes: ''
  })
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (show) {
      if (contact) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setFormData({
          name: contact.name || '',
          jobTitle: contact.jobTitle || '',
          email: contact.email || '',
          phone: contact.phone || '',
          company: contact.company || '',
          location: contact.location || '',
          clientAddress: contact.clientAddress || '',
          clientCountry: contact.clientCountry || 'India',
          gstin: contact.gstin || '',
          pan: contact.pan || '',
          cin: contact.cin || '',
          internationalTaxId: contact.internationalTaxId || '',
          msmeStatus: contact.msmeStatus || 'NON MSME',
          tdsSection: contact.tdsSection || '',
          tdsRate: contact.tdsRate || '',
          linkedin: contact.linkedin || '',
          status: contact.status || 'Active',
          entityType: contact.entityType || 'Individual',
          notes: contact.notes || ''
        })
      } else {
        setFormData({
          name: '',
          jobTitle: '',
          email: '',
          phone: '',
          company: '',
          location: '',
          clientAddress: '',
          clientCountry: 'India',
          gstin: '',
          pan: '',
          cin: '',
          internationalTaxId: '',
          msmeStatus: 'NON MSME',
          tdsSection: '',
          tdsRate: '',
          linkedin: '',
          status: 'Active',
          entityType: 'Individual',
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
    <Modal show={show} onHide={onHide} size="lg" centered backdrop="static" keyboard={false}>
      <Modal.Header closeButton className="py-2 bg-light border-bottom-0">
        <Modal.Title className="fs-6 fw-bold">
          {contact ? 'Edit Contact' : 'New Contact'}
        </Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body className="p-3">
          <Row className="g-2">
            <Col md={4}>
              <Form.Group>
                <Form.Label className="small fw-bold mb-1">Entity Type</Form.Label>
                <Form.Select
                  size="sm"
                  value={formData.entityType}
                  onChange={(e) => handleChange('entityType', e.target.value)}
                >
                  {ENTITY_TYPES.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label className="small fw-bold mb-1">Name <span className="text-danger">*</span></Form.Label>
                <Form.Control
                  size="sm"
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  isInvalid={!!errors.name}
                  placeholder="Full Name"
                />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label className="small fw-bold mb-1">Job Title</Form.Label>
                <Form.Control
                  size="sm"
                  type="text"
                  list="job-title-suggestions"
                  value={formData.jobTitle}
                  onChange={(e) => handleChange('jobTitle', e.target.value)}
                  placeholder="Enter or select Role"
                />
                <datalist id="job-title-suggestions">
                  {JOB_TITLES.map(title => (
                    <option key={title} value={title} />
                  ))}
                </datalist>
              </Form.Group>
            </Col>

            <Col md={4}>
              <Form.Group>
                <Form.Label className="small fw-bold mb-1">Status <span className="text-danger">*</span></Form.Label>
                <Form.Select
                  size="sm"
                  value={formData.status}
                  onChange={(e) => handleChange('status', e.target.value)}
                  isInvalid={!!errors.status}
                >
                  {STATUS_OPTIONS.map(status => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label className="small fw-bold mb-1">Email <span className="text-danger">*</span></Form.Label>
                <Form.Control
                  size="sm"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  isInvalid={!!errors.email}
                  placeholder="Email Address"
                />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label className="small fw-bold mb-1">Phone</Form.Label>
                <Form.Control
                  size="sm"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  placeholder="Phone Number"
                />
              </Form.Group>
            </Col>

            <Col md={4}>
              <Form.Group>
                <Form.Label className="small fw-bold mb-1">LinkedIn</Form.Label>
                <Form.Control
                  size="sm"
                  type="url"
                  value={formData.linkedin}
                  onChange={(e) => handleChange('linkedin', e.target.value)}
                  placeholder="Profile URL"
                />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label className="small fw-bold mb-1">Company</Form.Label>
                <Form.Control
                  size="sm"
                  type="text"
                  value={formData.company}
                  onChange={(e) => handleChange('company', e.target.value)}
                  placeholder="Enter Company"
                />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label className="small fw-bold mb-1">Billing Location</Form.Label>
                <Form.Control
                  size="sm"
                  type="text"
                  list="location-suggestions"
                  value={formData.location}
                  onChange={(e) => handleChange('location', e.target.value)}
                  placeholder="Enter or select Location"
                />
                <datalist id="location-suggestions">
                  {LOCATIONS.map(loc => (
                    <option key={loc} value={loc} />
                  ))}
                </datalist>
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label className="small fw-bold mb-1">Client Address</Form.Label>
                <Form.Control
                  size="sm"
                  type="text"
                  value={formData.clientAddress}
                  onChange={(e) => handleChange('clientAddress', e.target.value)}
                  placeholder="Client billing address"
                />
              </Form.Group>
            </Col>

            <Col md={4}>
              <Form.Group>
                <Form.Label className="small fw-bold mb-1">Country</Form.Label>
                <Form.Select
                  size="sm"
                  value={formData.clientCountry}
                  onChange={(e) => handleChange('clientCountry', e.target.value)}
                >
                  {COUNTRIES.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                  <option value="Other">Other</option>
                </Form.Select>
              </Form.Group>
            </Col>

            {/* --- Conditional Rendering for Taxes --- */}
            {formData.clientCountry === 'India' ? (
              <>
                <Col md={4}>
                  <Form.Group>
                    <Form.Label className="small fw-bold mb-1">GSTIN</Form.Label>
                    <Form.Control
                      size="sm"
                      type="text"
                      value={formData.gstin}
                      onChange={(e) => handleChange('gstin', e.target.value)}
                      placeholder="Enter GSTIN"
                    />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group>
                    <Form.Label className="small fw-bold mb-1">PAN</Form.Label>
                    <Form.Control
                      size="sm"
                      type="text"
                      value={formData.pan}
                      onChange={(e) => handleChange('pan', e.target.value)}
                      placeholder="Enter PAN"
                    />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group>
                    <Form.Label className="small fw-bold mb-1">CIN</Form.Label>
                    <Form.Control
                      size="sm"
                      type="text"
                      value={formData.cin}
                      onChange={(e) => handleChange('cin', e.target.value)}
                      placeholder="Enter CIN"
                    />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group>
                    <Form.Label className="small fw-bold mb-1">MSME Status</Form.Label>
                    <Form.Select
                      size="sm"
                      value={formData.msmeStatus}
                      onChange={(e) => handleChange('msmeStatus', e.target.value)}
                    >
                      <option value="NON MSME">NON MSME</option>
                      <option value="MSME">MSME</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group>
                    <Form.Label className="small fw-bold mb-1">TDS Section</Form.Label>
                    <Form.Select
                      size="sm"
                      value={formData.tdsSection}
                      onChange={(e) => handleChange('tdsSection', e.target.value)}
                    >
                      <option value="">Select Section</option>
                      <option value="194J">194J (Professional Services)</option>
                      <option value="194C">194C (Contracts)</option>
                      <option value="194H">194H (Commission/Brokerage)</option>
                      <option value="194I">194I (Rent)</option>
                      <option value="Other">Other</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group>
                    <Form.Label className="small fw-bold mb-1">TDS Rate (%)</Form.Label>
                    <Form.Control
                      size="sm"
                      type="number"
                      step="0.01"
                      value={formData.tdsRate}
                      onChange={(e) => handleChange('tdsRate', e.target.value)}
                      placeholder="e.g. 10"
                    />
                  </Form.Group>
                </Col>
              </>
            ) : (
              <Col md={4}>
                <Form.Group>
                  <Form.Label className="small fw-bold mb-1">International Tax ID (VAT/EIN)</Form.Label>
                  <Form.Control
                    size="sm"
                    type="text"
                    value={formData.internationalTaxId}
                    onChange={(e) => handleChange('internationalTaxId', e.target.value)}
                    placeholder="Enter VAT or EIN"
                  />
                </Form.Group>
              </Col>
            )}

            <Col xs={12}>
              <Form.Group>
                <Form.Label className="small fw-bold mb-1">Notes</Form.Label>
                <Form.Control
                  size="sm"
                  as="textarea"
                  rows={2}
                  value={formData.notes}
                  onChange={(e) => handleChange('notes', e.target.value)}
                  placeholder="Additional notes..."
                />
              </Form.Group>
            </Col>
          </Row>
        </Modal.Body>
        <Modal.Footer className="py-2 border-top-0 bg-light">
          {contact && (
            <Button
              variant="link"
              className="text-danger text-decoration-none p-0 me-auto small"
              onClick={handleDelete}
            >
              Delete Contact
            </Button>
          )}
          <Button variant="outline-secondary" size="sm" onClick={onHide}>
            Cancel
          </Button>
          <Button variant="dark" type="submit" size="sm" className="px-4">
            {contact ? 'Save Changes' : 'Create Contact'}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  )
}
