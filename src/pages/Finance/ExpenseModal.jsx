import { useState, useEffect } from 'react'
import { Modal, Form, Button } from 'react-bootstrap'

const CATEGORIES = [
  { value: 'transport', label: 'Transport', color: '#3b82f6' },
  { value: 'food', label: 'Food', color: '#f59e0b' },
  { value: 'accommodation', label: 'Accommodation', color: '#8b5cf6' },
  { value: 'allowances', label: 'Allowances', color: '#10b981' }
]

export const ExpenseModal = ({ show, onHide, expense, onSave, onDelete }) => {
  const [formData, setFormData] = useState({
    amount: '',
    description: '',
    // ...
    // Note: employeeName will store "Employee Emails"
    // details.attendees will store "Attendee Emails" for Food category
    date: new Date().toISOString().split('T')[0],
    category: 'transport',
    employeeName: '',
    projectDepartment: '',
    receiptUrl: '',
    details: {} // Dynamic fields container
  })
  const [errors, setErrors] = useState({})
  const [selectedFile, setSelectedFile] = useState(null)
  const [filePreview, setFilePreview] = useState(null)

  useEffect(() => {
    if (show) {
      if (expense) {
        setFormData({
          amount: expense.amount?.toString() || '',
          description: expense.description || '',
          date: expense.date ? expense.date.split('T')[0] : new Date().toISOString().split('T')[0],
          category: expense.category || 'transport',
          employeeName: expense.employeeName || '',
          projectDepartment: expense.projectDepartment || '',
          receiptUrl: expense.receiptUrl || '',
          details: expense.details || {}
        })
        setFilePreview(expense.receiptUrl || null)
      } else {
        setFormData({
          amount: '',
          description: '',
          date: new Date().toISOString().split('T')[0],
          category: 'transport',
          employeeName: '',
          projectDepartment: '',
          receiptUrl: '',
          details: {}
        })
        setFilePreview(null)
      }
      setSelectedFile(null)
      setErrors({})
    }
  }, [expense, show])

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

  const handleDetailChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      details: {
        ...prev.details,
        [field]: value
      }
    }))
  }

  const validate = () => {
    const newErrors = {}

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'Amount is required and must be greater than 0'
    }

    if (!formData.description?.trim()) {
      newErrors.description = 'Description is required'
    }

    if (!formData.date) {
      newErrors.date = 'Date is required'
    }

    if (!formData.category) {
      newErrors.category = 'Category is required'
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    const validateEmails = (str) => {
      if (!str) return true // Allow empty if not required, but here we might want it required?
      // Assuming required if visible
      const emails = str.split(',').map(e => e.trim()).filter(e => e)
      if (emails.length === 0) return false
      return emails.every(email => emailRegex.test(email))
    }

    if (formData.category !== 'food') {
      if (formData.employeeName && !validateEmails(formData.employeeName)) {
        newErrors.employeeName = 'Please enter valid email addresses (comma separated)'
      }
    }

    if (formData.category === 'food') {
      if (formData.details?.attendees && !validateEmails(formData.details.attendees)) {
        newErrors.attendees = 'Please enter valid email addresses (comma separated)'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setSelectedFile(file)

      // Check file type
      if (!file.type.startsWith('image/') && file.type !== 'application/pdf') {
        setErrors(prev => ({
          ...prev,
          receiptFile: 'Please select an image or PDF file'
        }))
        return
      }

      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({
          ...prev,
          receiptFile: 'File size must be less than 5MB'
        }))
        return
      }

      // Create preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setFilePreview(reader.result)
        setFormData(prev => ({
          ...prev,
          receiptUrl: reader.result
        }))
      }
      reader.readAsDataURL(file)

      // Clear error
      if (errors.receiptFile) {
        setErrors(prev => ({
          ...prev,
          receiptFile: null
        }))
      }
    }
  }

  const handleRemoveFile = () => {
    setSelectedFile(null)
    setFilePreview(null)
    setFormData(prev => ({
      ...prev,
      receiptUrl: ''
    }))
  }

  const handleSave = () => {
    if (validate()) {
      const expenseData = {
        ...formData,
        amount: parseFloat(formData.amount),
        date: new Date(formData.date).toISOString(),
        receiptUrl: formData.receiptUrl || null
      }
      onSave(expenseData)
      onHide()
    }
  }

  const selectedCategory = CATEGORIES.find(cat => cat.value === formData.category)

  return (
    <Modal show={show} onHide={onHide} size="lg">
      <Modal.Header>
        <Modal.Title>
          {expense ? 'Edit Expense' : 'Create New Expense'}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          {/* 1. Date and Category */}
          <div className="row">
            <Form.Group className="mb-3 col-md-6">
              <Form.Label>
                Date <span className="text-danger">*</span>
              </Form.Label>
              <Form.Control
                type="date"
                value={formData.date}
                onChange={(e) => handleChange('date', e.target.value)}
                isInvalid={!!errors.date}
                required
              />
              {errors.date && (
                <Form.Control.Feedback type="invalid">
                  {errors.date}
                </Form.Control.Feedback>
              )}
            </Form.Group>

            <Form.Group className="mb-3 col-md-6">
              <Form.Label>
                Category <span className="text-danger">*</span>
              </Form.Label>
              <Form.Select
                value={formData.category}
                onChange={(e) => handleChange('category', e.target.value)}
                isInvalid={!!errors.category}
                required
              >
                {CATEGORIES.map(cat => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </Form.Select>
              {selectedCategory && (
                <Form.Text className="d-flex align-items-center gap-2 mt-1">
                  <span
                    style={{
                      width: '12px',
                      height: '12px',
                      borderRadius: '50%',
                      backgroundColor: selectedCategory.color,
                      display: 'inline-block'
                    }}
                  />
                  <span>{selectedCategory.label}</span>
                </Form.Text>
              )}
              {errors.category && (
                <Form.Text className="text-danger d-block">
                  {errors.category}
                </Form.Text>
              )}
            </Form.Group>
          </div>

          {/* Dynamic Details based on Category */}
          <div className="card bg-light border-0 p-3 mb-3">
            <h6 className="mb-3 text-muted" style={{ fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase' }}>
              {CATEGORIES.find(c => c.value === formData.category)?.label} Details
            </h6>

            {formData.category === 'transport' && (
              <div className="row">
                <Form.Group className="mb-3 col-md-6">
                  <Form.Label>Origin</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="From"
                    value={formData.details?.origin || ''}
                    onChange={(e) => handleDetailChange('origin', e.target.value)}
                  />
                </Form.Group>
                <Form.Group className="mb-3 col-md-6">
                  <Form.Label>Destination</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="To"
                    value={formData.details?.destination || ''}
                    onChange={(e) => handleDetailChange('destination', e.target.value)}
                  />
                </Form.Group>
                <Form.Group className="mb-3 col-md-6">
                  <Form.Label>Mode</Form.Label>
                  <Form.Select
                    value={formData.details?.mode || ''}
                    onChange={(e) => handleDetailChange('mode', e.target.value)}
                  >
                    <option value="">Select Mode</option>
                    <option value="taxi">Taxi/Uber</option>
                    <option value="bus">Bus</option>
                    <option value="train">Train</option>
                    <option value="flight">Flight</option>
                    <option value="personal">Personal Car</option>
                  </Form.Select>
                </Form.Group>
                {formData.details?.mode === 'personal' && (
                  <Form.Group className="mb-3 col-md-6">
                    <Form.Label>Distance (km)</Form.Label>
                    <Form.Control
                      type="number"
                      value={formData.details?.distance || ''}
                      onChange={(e) => handleDetailChange('distance', e.target.value)}
                    />
                  </Form.Group>
                )}
              </div>
            )}

            {formData.category === 'food' && (
              <div className="row">
                <Form.Group className="mb-3 col-md-6">
                  <Form.Label>Meal Type</Form.Label>
                  <Form.Select
                    value={formData.details?.mealType || ''}
                    onChange={(e) => handleDetailChange('mealType', e.target.value)}
                  >
                    <option value="">Select Meal</option>
                    <option value="breakfast">Breakfast</option>
                    <option value="lunch">Lunch</option>
                    <option value="dinner">Dinner</option>
                    <option value="snacks">Snacks</option>
                  </Form.Select>
                </Form.Group>
                <Form.Group className="mb-3 col-md-6">
                  <Form.Label>Attendee Emails (comma separated)</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="e.g. client@example.com, team@example.com"
                    value={formData.details?.attendees || ''}
                    onChange={(e) => handleDetailChange('attendees', e.target.value)}
                    isInvalid={!!errors.attendees}
                  />
                  {errors.attendees && (
                    <Form.Control.Feedback type="invalid">
                      {errors.attendees}
                    </Form.Control.Feedback>
                  )}
                </Form.Group>
              </div>
            )}

            {formData.category === 'accommodation' && (
              <div className="row">
                <Form.Group className="mb-3 col-12">
                  <Form.Label>Hotel/Place Name</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter hotel name"
                    value={formData.details?.hotelName || ''}
                    onChange={(e) => handleDetailChange('hotelName', e.target.value)}
                  />
                </Form.Group>
                <Form.Group className="mb-3 col-md-6">
                  <Form.Label>City</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="City"
                    value={formData.details?.city || ''}
                    onChange={(e) => handleDetailChange('city', e.target.value)}
                  />
                </Form.Group>
                <Form.Group className="mb-3 col-md-3">
                  <Form.Label>Check-in</Form.Label>
                  <Form.Control
                    type="date"
                    value={formData.details?.checkIn || ''}
                    onChange={(e) => handleDetailChange('checkIn', e.target.value)}
                  />
                </Form.Group>
                <Form.Group className="mb-3 col-md-3">
                  <Form.Label>Check-out</Form.Label>
                  <Form.Control
                    type="date"
                    value={formData.details?.checkOut || ''}
                    onChange={(e) => handleDetailChange('checkOut', e.target.value)}
                  />
                </Form.Group>
              </div>
            )}

            {formData.category === 'allowances' && (
              <div className="row">
                <Form.Group className="mb-3 col-md-6">
                  <Form.Label>Type</Form.Label>
                  <Form.Select
                    value={formData.details?.allowanceType || ''}
                    onChange={(e) => handleDetailChange('allowanceType', e.target.value)}
                  >
                    <option value="">Select Type</option>
                    <option value="per_diem">Per Diem</option>
                    <option value="shift">Shift Allowance</option>
                    <option value="hardship">Hardship</option>
                    <option value="other">Other</option>
                  </Form.Select>
                </Form.Group>
                <Form.Group className="mb-3 col-md-6">
                  <Form.Label>Days/Units</Form.Label>
                  <Form.Control
                    type="number"
                    placeholder="e.g. 5 days"
                    value={formData.details?.units || ''}
                    onChange={(e) => handleDetailChange('units', e.target.value)}
                  />
                </Form.Group>
              </div>
            )}
          </div>

          {/* 2. Amount */}
          <Form.Group className="mb-3">
            <Form.Label>
              Amount <span className="text-danger">*</span>
            </Form.Label>
            <Form.Control
              type="number"
              step="0.01"
              min="0.01"
              placeholder="0.00"
              value={formData.amount}
              onChange={(e) => handleChange('amount', e.target.value)}
              isInvalid={!!errors.amount}
              required
            />
            {errors.amount && (
              <Form.Control.Feedback type="invalid">
                {errors.amount}
              </Form.Control.Feedback>
            )}
          </Form.Group>

          {/* Description - keeping it but placing after Amount */}
          <Form.Group className="mb-3">
            <Form.Label>
              Description <span className="text-danger">*</span>
            </Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter expense description"
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              isInvalid={!!errors.description}
              required
            />
            {errors.description && (
              <Form.Control.Feedback type="invalid">
                {errors.description}
              </Form.Control.Feedback>
            )}
          </Form.Group>

          {/* 3. Employee Name (Hidden for Food) and Project/Department */}
          <div className="row">
            {formData.category !== 'food' && (
              <Form.Group className="mb-3 col-md-6">
                <Form.Label>Employee Emails (comma separated)</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="e.g. emp1@example.com, emp2@example.com"
                  value={formData.employeeName}
                  onChange={(e) => handleChange('employeeName', e.target.value)}
                  isInvalid={!!errors.employeeName}
                />
                {errors.employeeName && (
                  <Form.Control.Feedback type="invalid">
                    {errors.employeeName}
                  </Form.Control.Feedback>
                )}
              </Form.Group>
            )}

            <Form.Group className="mb-3 col-md-6">
              <Form.Label>Project/Department</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter project or department"
                value={formData.projectDepartment}
                onChange={(e) => handleChange('projectDepartment', e.target.value)}
              />
            </Form.Group>
          </div>

          {/* 4. Receipt */}
          <Form.Group className="mb-3">
            <Form.Label>Receipt</Form.Label>
            <Form.Control
              type="file"
              accept="image/*,.pdf"
              onChange={handleFileChange}
              isInvalid={!!errors.receiptFile}
            />
            {errors.receiptFile && (
              <Form.Text className="text-danger d-block">
                {errors.receiptFile}
              </Form.Text>
            )}
            <Form.Text className="text-muted">
              Upload an image or PDF file (max 5MB)
            </Form.Text>

            {filePreview && (
              <div className="mt-3">
                <div className="d-flex align-items-center gap-2 mb-2">
                  <span className="text-muted small">Receipt Preview:</span>
                  <Button
                    variant="link"
                    size="sm"
                    className="text-danger p-0"
                    onClick={handleRemoveFile}
                  >
                    Remove
                  </Button>
                </div>
                {filePreview.startsWith('data:image/') ? (
                  <img
                    src={filePreview}
                    alt="Receipt preview"
                    style={{
                      maxWidth: '100%',
                      maxHeight: '200px',
                      border: '1px solid #dee2e6',
                      borderRadius: '4px',
                      padding: '4px'
                    }}
                  />
                ) : (
                  <div className="border p-3 rounded bg-light">
                    <p className="mb-0 small text-muted">
                      PDF file selected: {selectedFile?.name || 'Receipt'}
                    </p>
                    <a
                      href={filePreview}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-sm btn-primary mt-2"
                    >
                      View PDF
                    </a>
                  </div>
                )}
              </div>
            )}
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        {expense && (
          <Button
            variant="danger"
            onClick={() => {
              if (window.confirm('Are you sure you want to delete this expense?')) {
                onDelete(expense.id)
                onHide()
              }
            }}
          >
            Delete
          </Button>
        )}
        <Button variant="secondary" onClick={onHide}>
          Cancel
        </Button>
        <Button variant="primary" onClick={handleSave}>
          {expense ? 'Update' : 'Create'} Expense
        </Button>
      </Modal.Footer>
    </Modal>
  )
}
