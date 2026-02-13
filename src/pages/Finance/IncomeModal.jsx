import { useState, useEffect } from 'react'
import { Modal, Form, Button } from 'react-bootstrap'

const CATEGORIES = [
  { value: 'sales', label: 'Sales', color: '#10b981' },
  { value: 'services', label: 'Services', color: '#3b82f6' },
  { value: 'investments', label: 'Investments', color: '#8b5cf6' },
  { value: 'other', label: 'Other', color: '#f59e0b' }
]

export const IncomeModal = ({ show, onHide, income, onSave, onDelete }) => {
  const [formData, setFormData] = useState({
    amount: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    category: 'sales',
    employeeName: '',
    projectDepartment: '',
    receiptUrl: ''
  })
  const [errors, setErrors] = useState({})
  const [selectedFile, setSelectedFile] = useState(null)
  const [filePreview, setFilePreview] = useState(null)

  useEffect(() => {
    if (show) {
      if (income) {
        setFormData({
          amount: income.amount?.toString() || '',
          description: income.description || '',
          date: income.date ? income.date.split('T')[0] : new Date().toISOString().split('T')[0],
          category: income.category || 'sales',
          employeeName: income.employeeName || '',
          projectDepartment: income.projectDepartment || '',
          receiptUrl: income.receiptUrl || ''
        })
        setFilePreview(income.receiptUrl || null)
      } else {
        setFormData({
          amount: '',
          description: '',
          date: new Date().toISOString().split('T')[0],
          category: 'sales',
          employeeName: '',
          projectDepartment: '',
          receiptUrl: ''
        })
        setFilePreview(null)
      }
      setSelectedFile(null)
      setErrors({})
    }
  }, [income, show])

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
      const incomeData = {
        ...formData,
        amount: parseFloat(formData.amount),
        date: new Date(formData.date).toISOString(),
        receiptUrl: formData.receiptUrl || null
      }
      onSave(incomeData)
      onHide()
    }
  }

  const selectedCategory = CATEGORIES.find(cat => cat.value === formData.category)

  return (
    <Modal show={show} onHide={onHide} size="lg">
      <Modal.Header>
        <Modal.Title>
          {income ? 'Edit Income' : 'Create New Income'}
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
              placeholder="Enter income description"
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

          {/* 3. Employee Name and Project/Department */}
          <div className="row">
            <Form.Group className="mb-3 col-md-6">
              <Form.Label>Employee Name</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter employee name"
                value={formData.employeeName}
                onChange={(e) => handleChange('employeeName', e.target.value)}
              />
            </Form.Group>

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
        {income && (
          <Button
            variant="danger"
            onClick={() => {
              if (window.confirm('Are you sure you want to delete this income?')) {
                onDelete(income.id)
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
          {income ? 'Update' : 'Create'} Income
        </Button>
      </Modal.Footer>
    </Modal>
  )
}
